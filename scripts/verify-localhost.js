'use strict';

const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  createServer,
  resolveStaticPath,
  takeLastLines,
} = require('../dashboard-server/server');
const {
  SOURCE_PATH,
  TARGET_PATH,
  buildLauncherCatalogFromConfig,
} = require('./sync-launcher-catalog');

function createTempRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'unikernel-labs-'));
  fs.writeFileSync(path.join(repoRoot, 'index.html'), '<!doctype html><h1>ok</h1>', 'utf8');
  fs.mkdirSync(path.join(repoRoot, 'assets'));
  fs.writeFileSync(path.join(repoRoot, 'assets', 'hello.txt'), 'hello', 'utf8');
  return repoRoot;
}

async function startTestServer(options) {
  const runtime = createServer({ ...options, host: '127.0.0.1', port: 0 });

  await new Promise((resolve, reject) => {
    runtime.server.once('error', reject);
    runtime.server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = runtime.server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    ...runtime,
    baseUrl,
    close: () => new Promise(resolve => runtime.server.close(resolve)),
  };
}

async function main() {
  let checks = 0;

  const repoRoot = createTempRepo();
  assert.equal(
    resolveStaticPath(repoRoot, '/assets/hello.txt'),
    path.join(repoRoot, 'assets', 'hello.txt')
  );
  assert.equal(resolveStaticPath(repoRoot, '/%2e%2e/secret.txt'), null);
  checks += 1;
  console.log('ok - static path resolution');

  const logText = Array.from({ length: 90 }, (_, index) => `line-${index + 1}`).join('\n');
  assert.equal(
    takeLastLines(logText, 5),
    ['line-86', 'line-87', 'line-88', 'line-89', 'line-90'].join('\n')
  );
  checks += 1;
  console.log('ok - log tailing');

  const sourceConfig = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
  const launcherCatalog = JSON.parse(fs.readFileSync(TARGET_PATH, 'utf8'));
  assert.deepEqual(launcherCatalog, buildLauncherCatalogFromConfig(sourceConfig));
  checks += 1;
  console.log('ok - launcher catalog sync');

  const apiRepoRoot = createTempRepo();
  const config = {
    labs: [
      {
        id: '02',
        name: 'nginx-runtime',
        path: '02-nginx-runtime',
        status: 'ready',
        description: 'Servicio HTTP NGINX en localhost:8080.',
        url: 'http://localhost:8080',
        port: 8080,
        kraftName: 'ukl-nginx',
        startCommand: 'kraft run -W -d --name ukl-nginx -p 8080:80',
        stopCommand: 'kraft stop ukl-nginx || true',
        logsCommand: 'kraft logs ukl-nginx || true',
        healthProtocol: 'http',
      },
    ],
  };

  const calls = [];
  const execAsync = async (command, labPath) => {
    calls.push({ command, labPath });

    if (command.includes('kraft ps')) {
      return { ok: true, exitCode: 0, output: 'ukl-nginx running', stdout: 'ukl-nginx running', stderr: '' };
    }
    if (command === 'kraft run -W -d --name ukl-nginx -p 8080:80') {
      return { ok: true, exitCode: 0, output: 'started', stdout: 'started', stderr: '' };
    }
    if (command === 'kraft logs ukl-nginx || true') {
      const output = Array.from({ length: 90 }, (_, index) => `log-${index + 1}`).join('\n');
      return { ok: true, exitCode: 0, output, stdout: output, stderr: '' };
    }
    if (command === 'kraft stop ukl-nginx || true') {
      return { ok: true, exitCode: 0, output: 'stopped', stdout: 'stopped', stderr: '' };
    }
    if (command.includes('kraft version')) {
      return { ok: true, exitCode: 0, output: 'kraft 1.2.3', stdout: 'kraft 1.2.3', stderr: '' };
    }

    return { ok: false, exitCode: 1, output: 'unexpected command', stdout: '', stderr: 'unexpected command' };
  };

  const runtime = await startTestServer({
    repoRoot: apiRepoRoot,
    config,
    isWin: false,
    execAsync,
  });

  try {
    const labsResponse = await fetch(`${runtime.baseUrl}/api/labs`);
    assert.equal(labsResponse.status, 200);
    const labs = await labsResponse.json();
    assert.equal(labs[0].running, true);

    const forbiddenStart = await fetch(`${runtime.baseUrl}/api/labs/02/start`, { method: 'POST' });
    assert.equal(forbiddenStart.status, 403);

    const startResponse = await fetch(`${runtime.baseUrl}/api/labs/02/start`, {
      method: 'POST',
      headers: {
        'X-UCC-Request': '1',
        Origin: runtime.baseUrl,
      },
    });
    assert.equal(startResponse.status, 200);
    const startData = await startResponse.json();
    assert.equal(startData.ok, true);

    const logsResponse = await fetch(`${runtime.baseUrl}/api/labs/02/logs`);
    assert.equal(logsResponse.status, 200);
    const logsData = await logsResponse.json();
    assert.equal(logsData.output.startsWith('log-11'), true);
    assert.equal(logsData.output.endsWith('log-90'), true);

    const assetResponse = await fetch(`${runtime.baseUrl}/assets/hello.txt`);
    assert.equal(assetResponse.status, 200);
    assert.equal(await assetResponse.text(), 'hello');

    const traversalResponse = await fetch(`${runtime.baseUrl}/%2e%2e/secret.txt`);
    assert.equal([403, 404].includes(traversalResponse.status), true);

    assert.deepEqual(
      calls.map(call => ({ command: call.command, labPath: call.labPath })),
      [
        { command: 'kraft ps 2>/dev/null || true', labPath: undefined },
        { command: 'kraft run -W -d --name ukl-nginx -p 8080:80', labPath: '02-nginx-runtime' },
        { command: 'kraft logs ukl-nginx || true', labPath: '02-nginx-runtime' },
      ]
    );
  } finally {
    await runtime.close();
  }

  checks += 1;
  console.log('ok - API smoke test');
  console.log(`All localhost checks passed (${checks}).`);
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
