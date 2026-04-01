'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const net  = require('net');
const { exec } = require('child_process');

// ── Config ────────────────────────────────────────────────────────────────────
const PORT      = process.env.PORT || 9091;
const IS_WIN    = process.platform === 'win32';
const REPO_ROOT = path.resolve(__dirname, '..');
const CONFIG    = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'labs.config.json'), 'utf8'));

// Detect WSL distro at startup (skip docker-desktop)
let WSL_DISTRO = '';
function detectDistro() {
  return new Promise(resolve => {
    if (!IS_WIN) { resolve(''); return; }
    exec('wsl.exe -l -q', { windowsHide: true }, (err, out) => {
      if (err) { resolve(''); return; }
      const lines = out.split(/[\r\n]+/)
        .map(l => l.replace(/\0/g, '').trim())
        .filter(l => l && !l.toLowerCase().includes('docker'));
      WSL_DISTRO = lines[0] || '';
      console.log(`  WSL distro: ${WSL_DISTRO || 'none'}`);
      resolve(WSL_DISTRO);
    });
  });
}

// Convert Windows absolute path → WSL /mnt/x/... path
function toWslPath(winPath) {
  return winPath
    .replace(/\\/g, '/')
    .replace(/^([A-Za-z]):/, (_, d) => `/mnt/${d.toLowerCase()}`);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

// ── Shell execution ───────────────────────────────────────────────────────────
function execAsync(command, labRelativePath) {
  return new Promise(resolve => {
    let cmd;
    const timeout = 25000;

    if (IS_WIN) {
      if (!WSL_DISTRO) {
        resolve({ ok: false, output: 'No WSL distro detected. Install WSL2 with Ubuntu.' });
        return;
      }
      // Build full WSL path for the lab directory
      const wslRepo = toWslPath(REPO_ROOT);
      const wslCwd  = labRelativePath
        ? `${wslRepo}/${labRelativePath}`
        : wslRepo;
      const fullCmd = `cd ${wslCwd} && ${command}`;
      cmd = `wsl.exe -d ${WSL_DISTRO} -- bash -lc ${JSON.stringify(fullCmd)}`;
    } else {
      // Running inside WSL/Linux directly
      const cwd = labRelativePath
        ? path.join(REPO_ROOT, labRelativePath)
        : REPO_ROOT;
      cmd = `bash -lc ${JSON.stringify(`cd ${cwd} && ${command}`)}`;
    }

    exec(cmd, { timeout, windowsHide: true }, (err, stdout, stderr) => {
      resolve({
        ok:     !err,
        output: (stdout + stderr).trim(),
      });
    });
  });
}

// ── Health check ──────────────────────────────────────────────────────────────
function tcpCheck(port, ms = 3000) {
  return new Promise(resolve => {
    const s = new net.Socket();
    s.setTimeout(ms);
    s.once('connect', () => { s.destroy(); resolve(true); });
    s.once('error',   () => { s.destroy(); resolve(false); });
    s.once('timeout', () => { s.destroy(); resolve(false); });
    s.connect(port, '127.0.0.1');
  });
}

async function healthCheck(lab) {
  if (!lab.port) return { status: 'unknown', detail: 'Sin puerto' };
  const open = await tcpCheck(lab.port);
  if (!open) return { status: 'unhealthy', detail: 'Puerto cerrado' };

  if (lab.healthProtocol === 'http') {
    const r = await execAsync(`curl -sf --max-time 3 -o /dev/null -w "%{http_code}" ${lab.url}`);
    const code = parseInt(r.output, 10);
    if (isNaN(code)) return { status: 'unknown', detail: 'Sin respuesta HTTP' };
    return code < 400
      ? { status: 'healthy', detail: `HTTP ${code}` }
      : { status: 'unhealthy', detail: `HTTP ${code}` };
  }

  if (lab.healthProtocol === 'redis') {
    const r = await execAsync(`redis-cli -h 127.0.0.1 -p ${lab.port} ping 2>/dev/null`);
    return r.output.includes('PONG')
      ? { status: 'healthy', detail: 'PONG' }
      : { status: 'unhealthy', detail: 'Sin PONG' };
  }

  return { status: 'healthy', detail: 'Puerto abierto' };
}

// ── Lab status ────────────────────────────────────────────────────────────────
async function kraftPs() {
  const r = await execAsync('kraft ps 2>/dev/null || echo ""');
  return r.output.toLowerCase();
}

// ── Diagnostics ───────────────────────────────────────────────────────────────
async function getDiagnostics() {
  const [kraftVer, wslCheck] = await Promise.all([
    execAsync('kraft version 2>&1 || echo "not found"'),
    IS_WIN ? Promise.resolve({ ok: !!WSL_DISTRO, output: WSL_DISTRO || 'no distro' }) : Promise.resolve({ ok: true, output: 'native' }),
  ]);
  return {
    wsl:   { ok: wslCheck.ok,  detail: wslCheck.output },
    kraft: { ok: !kraftVer.output.includes('not found'), detail: kraftVer.output.split('\n')[0] },
    mode:  IS_WIN ? 'windows-wsl' : 'native-linux',
    distro: WSL_DISTRO || 'N/A',
  };
}

// ── Router ────────────────────────────────────────────────────────────────────
function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function handleApi(req, res, pathname) {
  // GET /api/diagnostics
  if (pathname === '/api/diagnostics' && req.method === 'GET')
    return json(res, 200, await getDiagnostics());

  // GET /api/overview
  if (pathname === '/api/overview' && req.method === 'GET') {
    const ps = await kraftPs();
    const runnable = CONFIG.labs.filter(l => l.kraftName);
    const running  = runnable.filter(l => ps.includes(l.kraftName.toLowerCase())).length;
    return json(res, 200, {
      total:   CONFIG.labs.length,
      ready:   runnable.length,
      running,
      planned: CONFIG.labs.filter(l => l.status === 'planned').length,
    });
  }

  // GET /api/labs
  if (pathname === '/api/labs' && req.method === 'GET') {
    const ps   = await kraftPs();
    const labs = CONFIG.labs.map(l => ({
      ...l,
      running: l.kraftName ? ps.includes(l.kraftName.toLowerCase()) : false,
    }));
    return json(res, 200, labs);
  }

  // /api/labs/:id/*
  const m = pathname.match(/^\/api\/labs\/([^/]+)(?:\/(.+))?$/);
  if (m) {
    const lab    = CONFIG.labs.find(l => l.id === m[1]);
    const action = m[2];
    if (!lab) return json(res, 404, { error: 'Lab no encontrado' });

    // GET /api/labs/:id
    if (!action && req.method === 'GET') {
      const ps = await kraftPs();
      return json(res, 200, { ...lab, running: lab.kraftName ? ps.includes(lab.kraftName.toLowerCase()) : false });
    }

    // GET /api/labs/:id/health
    if (action === 'health' && req.method === 'GET')
      return json(res, 200, await healthCheck(lab));

    // GET /api/labs/:id/logs
    if (action === 'logs' && req.method === 'GET') {
      if (!lab.kraftName) return json(res, 400, { error: 'Lab sin nombre kraft' });
      const r = await execAsync(`kraft logs ${lab.kraftName} 2>&1 | tail -n 80`);
      return json(res, 200, { output: r.output || '(sin output)' });
    }

    // POST /api/labs/:id/start
    if (action === 'start' && req.method === 'POST') {
      if (!lab.kraftName || !lab.startCommand) return json(res, 400, { error: 'Lab no ejecutable' });
      const r = await execAsync(lab.startCommand, lab.path);
      return json(res, 200, { ok: r.ok, output: r.output });
    }

    // POST /api/labs/:id/stop
    if (action === 'stop' && req.method === 'POST') {
      if (!lab.kraftName) return json(res, 400, { error: 'Lab sin nombre kraft' });
      const r = await execAsync(`kraft stop ${lab.kraftName} 2>/dev/null || true`);
      return json(res, 200, { ok: true, output: r.output });
    }
  }

  // POST /api/workspace/stop-all
  if (pathname === '/api/workspace/stop-all' && req.method === 'POST') {
    const results = await Promise.all(
      CONFIG.labs.filter(l => l.kraftName).map(l =>
        execAsync(`kraft stop ${l.kraftName} 2>/dev/null || true`)
      )
    );
    return json(res, 200, { ok: true, count: results.length });
  }

  return json(res, 404, { error: 'Ruta no encontrada' });
}

function handleStatic(req, res, pathname) {
  const rel      = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const fullPath = path.join(REPO_ROOT, rel);
  if (!fullPath.startsWith(REPO_ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(fullPath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fullPath)] || 'text/plain' });
    res.end(data);
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────
detectDistro().then(() => {
  const server = http.createServer(async (req, res) => {
    const pathname = new URL(req.url, `http://localhost`).pathname;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    try {
      if (pathname.startsWith('/api/')) await handleApi(req, res, pathname);
      else handleStatic(req, res, pathname);
    } catch (err) {
      console.error(err.message);
      if (!res.headersSent) json(res, 500, { error: err.message });
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  Unikernel Control Center`);
    console.log(`  http://localhost:${PORT}`);
    console.log(`  Mode: ${IS_WIN ? 'Windows → WSL2' : 'Linux native'}\n`);
  });
});
