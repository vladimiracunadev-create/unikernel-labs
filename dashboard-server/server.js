'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');
const { spawn } = require('child_process');

const DEFAULT_PORT = Number(process.env.PORT || 9091);
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_CONFIG_PATH = path.join(DEFAULT_REPO_ROOT, 'labs.config.json');
const DEFAULT_COMMAND_TIMEOUT_MS = 25_000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function loadConfig(configPath = DEFAULT_CONFIG_PATH) {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function toWslPath(winPath) {
  return winPath
    .replace(/\\/g, '/')
    .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function trimOutput(value) {
  return String(value || '').trim();
}

function takeLastLines(value, maxLines = 80) {
  const lines = String(value || '')
    .split(/\r?\n/)
    .filter(line => line.length > 0);

  if (lines.length <= maxLines) {
    return lines.join('\n');
  }

  return lines.slice(lines.length - maxLines).join('\n');
}

function isPathInside(rootPath, candidatePath) {
  const relative = path.relative(rootPath, candidatePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function resolveStaticPath(repoRoot, pathname) {
  let decodedPathname;

  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relativePath = decodedPathname === '/'
    ? 'index.html'
    : decodedPathname.replace(/^\/+/, '');
  const fullPath = path.resolve(repoRoot, relativePath);

  if (!isPathInside(repoRoot, fullPath)) {
    return null;
  }

  return fullPath;
}

function resolveLabPath(repoRoot, labRelativePath) {
  const relativePath = String(labRelativePath || '');
  const resolvedPath = relativePath
    ? path.resolve(repoRoot, relativePath)
    : repoRoot;

  if (!isPathInside(repoRoot, resolvedPath)) {
    throw new Error(`Invalid lab path: ${relativePath}`);
  }

  return resolvedPath;
}

function buildShellCommand(cwd, command) {
  return `cd ${shellQuote(cwd)} && ${command}`;
}

function spawnAsync(fileName, args, options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;

  return new Promise(resolve => {
    let stdout = '';
    let stderr = '';
    let resolved = false;
    let timeoutId = null;
    let spawnError = null;

    const finalize = payload => {
      if (resolved) {
        return;
      }

      resolved = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      resolve(payload);
    };

    let child;

    try {
      child = spawn(fileName, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });
    } catch (error) {
      finalize({
        ok: false,
        exitCode: 1,
        signal: null,
        stdout: '',
        stderr: '',
        output: error.message,
        error: error.message,
      });
      return;
    }

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });

    child.on('error', error => {
      spawnError = error;
    });

    child.on('close', (code, signal) => {
      const output = trimOutput(stdout + stderr);
      finalize({
        ok: !spawnError && code === 0,
        exitCode: Number.isInteger(code) ? code : 1,
        signal: signal || null,
        stdout: trimOutput(stdout),
        stderr: trimOutput(stderr),
        output: output || (spawnError ? spawnError.message : ''),
        error: spawnError ? spawnError.message : null,
      });
    });

    timeoutId = setTimeout(() => {
      if (!child.killed) {
        child.kill();
      }
    }, timeoutMs);
  });
}

async function detectWslDistro() {
  if (process.platform !== 'win32') {
    return '';
  }

  const result = await spawnAsync('wsl.exe', ['-l', '-q'], { timeoutMs: 10_000 });
  if (!result.ok && !result.stdout) {
    return '';
  }

  const distros = result.stdout
    .split(/\r?\n/)
    .map(line => line.replace(/\0/g, '').trim())
    .filter(line => line && !line.toLowerCase().includes('docker'));

  return distros[0] || '';
}

function createExec(options) {
  const repoRoot = path.resolve(options.repoRoot || DEFAULT_REPO_ROOT);
  const isWin = options.isWin ?? (process.platform === 'win32');
  const getWslDistro = options.getWslDistro || (() => '');
  const commandTimeoutMs = options.commandTimeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;

  return async function execAsync(command, labRelativePath) {
    try {
      const resolvedLabPath = resolveLabPath(repoRoot, labRelativePath);
      const shellCommand = buildShellCommand(
        isWin ? toWslPath(resolvedLabPath) : resolvedLabPath,
        command
      );

      if (isWin) {
        const distro = getWslDistro();
        if (!distro) {
          return {
            ok: false,
            exitCode: 1,
            signal: null,
            stdout: '',
            stderr: '',
            output: 'No WSL distro detected. Install WSL2 with Ubuntu or Debian.',
            error: null,
          };
        }

        return spawnAsync(
          'wsl.exe',
          ['-d', distro, '--', 'bash', '-lc', shellCommand],
          { timeoutMs: commandTimeoutMs }
        );
      }

      return spawnAsync(
        'bash',
        ['-lc', shellCommand],
        { timeoutMs: commandTimeoutMs }
      );
    } catch (error) {
      return {
        ok: false,
        exitCode: 1,
        signal: null,
        stdout: '',
        stderr: '',
        output: error.message,
        error: error.message,
      };
    }
  };
}

function tcpCheck(port, host = '127.0.0.1', timeoutMs = 3_000) {
  return new Promise(resolve => {
    const socket = new net.Socket();
    let settled = false;

    const finish = result => {
      if (settled) {
        return;
      }

      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    socket.once('timeout', () => finish(false));
    socket.connect(port, host);
  });
}

async function httpHealthCheck(url, timeoutMs = 3_000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
    });

    return response.status < 400
      ? { status: 'healthy', detail: `HTTP ${response.status}` }
      : { status: 'unhealthy', detail: `HTTP ${response.status}` };
  } catch {
    return { status: 'unknown', detail: 'Sin respuesta HTTP' };
  } finally {
    clearTimeout(timeoutId);
  }
}

function redisHealthCheck(port, host = '127.0.0.1', timeoutMs = 3_000) {
  return new Promise(resolve => {
    const socket = new net.Socket();
    let settled = false;

    const finish = result => {
      if (settled) {
        return;
      }

      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      socket.write('*1\r\n$4\r\nPING\r\n');
    });
    socket.once('data', chunk => {
      finish(chunk.toString('utf8').includes('PONG'));
    });
    socket.once('error', () => finish(false));
    socket.once('timeout', () => finish(false));
    socket.connect(port, host);
  });
}

async function healthCheck(lab) {
  if (!lab.port) {
    return { status: 'unknown', detail: 'Sin puerto' };
  }

  const isOpen = await tcpCheck(lab.port);
  if (!isOpen) {
    return { status: 'unhealthy', detail: 'Puerto cerrado' };
  }

  if (lab.healthProtocol === 'http' && lab.url) {
    return httpHealthCheck(lab.url);
  }

  if (lab.healthProtocol === 'redis') {
    const pong = await redisHealthCheck(lab.port);
    return pong
      ? { status: 'healthy', detail: 'PONG' }
      : { status: 'unhealthy', detail: 'Sin PONG' };
  }

  return { status: 'healthy', detail: 'Puerto abierto' };
}

async function kraftPs(execAsync) {
  const result = await execAsync('kraft ps 2>/dev/null || true');
  return String(result.output || '').toLowerCase();
}

async function getDiagnostics(execAsync, isWin, getWslDistro) {
  const distro = getWslDistro() || '';
  const kraftVersion = await execAsync('kraft version 2>&1 || echo "not found"');
  const firstLine = String(kraftVersion.output || '')
    .split(/\r?\n/)
    .find(line => line.trim().length > 0) || 'not found';
  const kraftOk = Boolean(kraftVersion.ok) && !firstLine.toLowerCase().includes('not found');

  return {
    wsl: {
      ok: isWin ? Boolean(distro) : true,
      detail: isWin ? (distro || 'no distro') : 'native',
    },
    kraft: {
      ok: kraftOk,
      detail: firstLine,
    },
    mode: isWin ? 'windows-wsl' : 'native-linux',
    distro: distro || 'N/A',
  };
}

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sameLocalOrigin(origin, port) {
  if (!origin) {
    return true;
  }

  try {
    const parsed = new URL(origin);
    const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    const parsedPort = parsed.port ? Number(parsed.port) : (parsed.protocol === 'https:' ? 443 : 80);
    return isLocalHost && parsedPort === Number(port);
  } catch {
    return false;
  }
}

function isTrustedStateChange(req, port) {
  const requestMarker = req.headers['x-ucc-request'];
  const secFetchSite = req.headers['sec-fetch-site'];

  if (requestMarker !== '1') {
    return false;
  }

  if (secFetchSite && secFetchSite === 'cross-site') {
    return false;
  }

  return sameLocalOrigin(req.headers.origin, port);
}

function createServer(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || DEFAULT_REPO_ROOT);
  const config = options.config || loadConfig(options.configPath || path.join(repoRoot, 'labs.config.json'));
  const port = Number(options.port ?? DEFAULT_PORT);
  const host = options.host || DEFAULT_HOST;
  const isWin = options.isWin ?? (process.platform === 'win32');
  let wslDistro = options.wslDistro || '';

  const getWslDistro = options.getWslDistro || (() => wslDistro);
  const setWslDistro = value => {
    wslDistro = String(value || '');
  };

  const execAsync = options.execAsync || createExec({
    repoRoot,
    isWin,
    getWslDistro,
    commandTimeoutMs: options.commandTimeoutMs,
  });

  async function handleApi(req, res, pathname) {
    if (pathname === '/api/diagnostics' && req.method === 'GET') {
      return json(res, 200, await getDiagnostics(execAsync, isWin, getWslDistro));
    }

    if (pathname === '/api/overview' && req.method === 'GET') {
      const psOutput = await kraftPs(execAsync);
      const runnableLabs = config.labs.filter(lab => lab.kraftName);
      const runningCount = runnableLabs
        .filter(lab => psOutput.includes(String(lab.kraftName || '').toLowerCase()))
        .length;

      return json(res, 200, {
        total: config.labs.length,
        ready: runnableLabs.length,
        running: runningCount,
        planned: config.labs.filter(lab => lab.status === 'planned').length,
      });
    }

    if (pathname === '/api/labs' && req.method === 'GET') {
      const psOutput = await kraftPs(execAsync);
      const labs = config.labs.map(lab => ({
        ...lab,
        running: lab.kraftName
          ? psOutput.includes(String(lab.kraftName).toLowerCase())
          : false,
      }));

      return json(res, 200, labs);
    }

    const match = pathname.match(/^\/api\/labs\/([^/]+)(?:\/(.+))?$/);
    if (match) {
      const lab = config.labs.find(item => item.id === match[1]);
      const action = match[2];

      if (!lab) {
        return json(res, 404, { error: 'Lab no encontrado' });
      }

      if (!action && req.method === 'GET') {
        const psOutput = await kraftPs(execAsync);
        return json(res, 200, {
          ...lab,
          running: lab.kraftName
            ? psOutput.includes(String(lab.kraftName).toLowerCase())
            : false,
        });
      }

      if (action === 'health' && req.method === 'GET') {
        return json(res, 200, await healthCheck(lab));
      }

      if (action === 'logs' && req.method === 'GET') {
        if (!lab.logsCommand) {
          return json(res, 400, { error: 'Lab sin comando de logs' });
        }

        const result = await execAsync(lab.logsCommand, lab.path);
        return json(res, result.ok ? 200 : 500, {
          ok: result.ok,
          output: takeLastLines(result.output || '(sin output)'),
        });
      }

      const localPort = req.socket.localPort || port;
      if (req.method === 'POST' && !isTrustedStateChange(req, localPort)) {
        return json(res, 403, { error: 'Solicitud rechazada por seguridad local' });
      }

      if (action === 'start' && req.method === 'POST') {
        if (!lab.startCommand) {
          return json(res, 400, { error: 'Lab no ejecutable' });
        }

        const result = await execAsync(lab.startCommand, lab.path);
        return json(res, result.ok ? 200 : 500, {
          ok: result.ok,
          exitCode: result.exitCode,
          output: result.output,
        });
      }

      if (action === 'stop' && req.method === 'POST') {
        if (!lab.stopCommand) {
          return json(res, 400, { error: 'Lab sin comando de stop' });
        }

        const result = await execAsync(lab.stopCommand, lab.path);
        return json(res, result.ok ? 200 : 500, {
          ok: result.ok,
          exitCode: result.exitCode,
          output: result.output,
        });
      }
    }

    if (pathname === '/api/workspace/stop-all' && req.method === 'POST') {
      const localPort = req.socket.localPort || port;
      if (!isTrustedStateChange(req, localPort)) {
        return json(res, 403, { error: 'Solicitud rechazada por seguridad local' });
      }

      const stoppableLabs = config.labs.filter(lab => lab.stopCommand);
      const results = await Promise.all(
        stoppableLabs.map(lab => execAsync(lab.stopCommand, lab.path))
      );

      const failed = results.filter(result => !result.ok).length;
      return json(res, failed === 0 ? 200 : 500, {
        ok: failed === 0,
        count: results.length,
        failed,
      });
    }

    return json(res, 404, { error: 'Ruta no encontrada' });
  }

  function handleStatic(req, res, pathname) {
    const fullPath = resolveStaticPath(repoRoot, pathname);
    if (!fullPath) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(fullPath, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      res.writeHead(200, {
        'Content-Type': MIME[path.extname(fullPath)] || 'application/octet-stream',
      });
      res.end(data);
    });
  }

  const server = http.createServer(async (req, res) => {
    const pathname = new URL(req.url, `http://${req.headers.host || `${host}:${port}`}`).pathname;

    try {
      if (pathname.startsWith('/api/')) {
        await handleApi(req, res, pathname);
      } else {
        handleStatic(req, res, pathname);
      }
    } catch (error) {
      console.error(error.message);
      if (!res.headersSent) {
        json(res, 500, { error: error.message });
      }
    }
  });

  return {
    server,
    host,
    port,
    repoRoot,
    config,
    isWin,
    getWslDistro,
    setWslDistro,
  };
}

async function startServer(options = {}) {
  const runtime = createServer(options);

  if (runtime.isWin && !runtime.getWslDistro()) {
    runtime.setWslDistro(await detectWslDistro());
  }

  await new Promise((resolve, reject) => {
    runtime.server.once('error', reject);
    runtime.server.listen(runtime.port, runtime.host, () => {
      runtime.server.removeListener('error', reject);
      resolve();
    });
  });

  console.log('\n  Unikernel Control Center');
  console.log(`  http://${runtime.host}:${runtime.port}`);
  console.log(`  Mode: ${runtime.isWin ? 'Windows -> WSL2' : 'Linux native'}`);
  console.log(`  WSL distro: ${runtime.getWslDistro() || 'none'}\n`);

  return runtime;
}

module.exports = {
  DEFAULT_PORT,
  buildShellCommand,
  createExec,
  createServer,
  detectWslDistro,
  getDiagnostics,
  healthCheck,
  isPathInside,
  isTrustedStateChange,
  loadConfig,
  resolveStaticPath,
  shellQuote,
  startServer,
  takeLastLines,
  toWslPath,
};

if (require.main === module) {
  startServer().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
