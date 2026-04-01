'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const net  = require('net');
const { exec } = require('child_process');

// ── Config ────────────────────────────────────────────────────────────────────
const PORT      = process.env.PORT || 9091;
const REPO_ROOT = path.resolve(__dirname, '..');
const CONFIG    = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'labs.config.json'), 'utf8'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Run a command inside a bash login shell so kraft/PATH are available. */
function execAsync(command, cwd) {
  return new Promise((resolve) => {
    const opts = {
      timeout: 20000,
      cwd: cwd || REPO_ROOT,
      shell: '/bin/bash',
    };
    // login shell ensures ~/.bashrc / ~/.profile are sourced (kraft in PATH)
    exec(`bash -lc ${JSON.stringify(command)}`, opts, (err, stdout, stderr) => {
      resolve({
        ok:     !err,
        output: (stdout + stderr).trim(),
      });
    });
  });
}

/** Check if a TCP port is open. */
function tcpCheck(port, timeout = 3000) {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    sock.setTimeout(timeout);
    sock.once('connect', () => { sock.destroy(); resolve(true);  });
    sock.once('error',   () => { sock.destroy(); resolve(false); });
    sock.once('timeout', () => { sock.destroy(); resolve(false); });
    sock.connect(port, '127.0.0.1');
  });
}

/** Health check for a lab. */
async function checkHealth(lab) {
  if (!lab.port) return { status: 'unknown', detail: 'No port' };

  const open = await tcpCheck(lab.port);
  if (!open) return { status: 'unhealthy', detail: 'Port closed' };

  if (lab.healthProtocol === 'http') {
    try {
      const res = await execAsync(
        `curl -sf --max-time 3 -o /dev/null -w "%{http_code}" ${lab.url}`
      );
      const code = parseInt(res.output, 10);
      return Number.isNaN(code)
        ? { status: 'unknown', detail: 'No HTTP response' }
        : code < 400
          ? { status: 'healthy', detail: `HTTP ${code}` }
          : { status: 'unhealthy', detail: `HTTP ${code}` };
    } catch {
      return { status: 'unhealthy', detail: 'HTTP error' };
    }
  }

  if (lab.healthProtocol === 'redis') {
    const res = await execAsync(
      `redis-cli -h 127.0.0.1 -p ${lab.port} --no-auth-warning ping 2>/dev/null`
    );
    return res.output.includes('PONG')
      ? { status: 'healthy', detail: 'PONG' }
      : { status: 'unhealthy', detail: 'No PONG' };
  }

  // TCP open but no deeper check
  return { status: 'healthy', detail: 'TCP open' };
}

/** Return true if a kraft instance is running. */
async function isRunning(kraftName) {
  if (!kraftName) return false;
  const res = await execAsync('kraft ps 2>/dev/null');
  return res.output.toLowerCase().includes(kraftName.toLowerCase());
}

// ── Router ────────────────────────────────────────────────────────────────────

async function handleApi(req, res, pathname) {
  res.setHeader('Content-Type', 'application/json');

  // GET /api/overview
  if (pathname === '/api/overview' && req.method === 'GET') {
    const psRes  = await execAsync('kraft ps 2>/dev/null');
    const psOut  = psRes.output.toLowerCase();
    const runnable = CONFIG.labs.filter(l => l.kraftName);
    const running  = runnable.filter(l => psOut.includes(l.kraftName.toLowerCase())).length;
    return json(res, 200, {
      total:   CONFIG.labs.length,
      ready:   runnable.length,
      running,
      planned: CONFIG.labs.filter(l => l.status === 'planned').length,
    });
  }

  // GET /api/labs
  if (pathname === '/api/labs' && req.method === 'GET') {
    const psRes = await execAsync('kraft ps 2>/dev/null');
    const psOut = psRes.output.toLowerCase();
    const labs  = CONFIG.labs.map(l => ({
      ...l,
      running: l.kraftName ? psOut.includes(l.kraftName.toLowerCase()) : false,
    }));
    return json(res, 200, labs);
  }

  // /api/labs/:id/*
  const match = pathname.match(/^\/api\/labs\/([^/]+)(?:\/(.+))?$/);
  if (match) {
    const lab    = CONFIG.labs.find(l => l.id === match[1]);
    const action = match[2];

    if (!lab) return json(res, 404, { error: 'Lab not found' });

    // GET /api/labs/:id
    if (!action && req.method === 'GET') {
      const running = await isRunning(lab.kraftName);
      return json(res, 200, { ...lab, running });
    }

    // GET /api/labs/:id/health
    if (action === 'health' && req.method === 'GET') {
      return json(res, 200, await checkHealth(lab));
    }

    // GET /api/labs/:id/logs
    if (action === 'logs' && req.method === 'GET') {
      if (!lab.kraftName) return json(res, 400, { error: 'Lab not runnable' });
      const result = await execAsync(`kraft logs ${lab.kraftName} 2>&1 | tail -n 80`);
      return json(res, 200, { output: result.output || '(sin output)' });
    }

    // POST /api/labs/:id/start
    if (action === 'start' && req.method === 'POST') {
      if (!lab.kraftName || !lab.startCommand) return json(res, 400, { error: 'Lab not runnable' });
      const labDir = path.join(REPO_ROOT, lab.path);
      const result = await execAsync(lab.startCommand, labDir);
      return json(res, 200, { ok: result.ok, output: result.output });
    }

    // POST /api/labs/:id/stop
    if (action === 'stop' && req.method === 'POST') {
      if (!lab.kraftName) return json(res, 400, { error: 'Lab not runnable' });
      const result = await execAsync(`kraft stop ${lab.kraftName} 2>/dev/null || true`);
      return json(res, 200, { ok: true, output: result.output });
    }
  }

  // POST /api/workspace/stop-all
  if (pathname === '/api/workspace/stop-all' && req.method === 'POST') {
    const runnable = CONFIG.labs.filter(l => l.kraftName);
    const results  = await Promise.all(
      runnable.map(l => execAsync(`kraft stop ${l.kraftName} 2>/dev/null || true`))
    );
    return json(res, 200, { ok: true, stopped: runnable.map(l => l.kraftName) });
  }

  return json(res, 404, { error: 'Not found' });
}

function json(res, status, data) {
  res.writeHead(status);
  res.end(JSON.stringify(data));
}

// ── Static files ──────────────────────────────────────────────────────────────

function handleStatic(req, res, pathname) {
  const rel      = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const fullPath = path.join(REPO_ROOT, rel);

  // Prevent path traversal
  if (!fullPath.startsWith(REPO_ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(fullPath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
}

// ── Server ────────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url      = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  try {
    if (pathname.startsWith('/api/')) {
      await handleApi(req, res, pathname);
    } else {
      handleStatic(req, res, pathname);
    }
  } catch (err) {
    console.error('[ERROR]', err.message);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Unikernel Control Center`);
  console.log(`  http://localhost:${PORT}\n`);
});
