'use strict';

let _labs   = [];
let _logsId = null;
let _diag   = null;

// ── API ───────────────────────────────────────────────────────────────────────
async function get(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function post(url) {
  const r = await fetch(url, { method: 'POST' });
  return r.json(); // don't throw — always show output
}

// ── Diagnostics ───────────────────────────────────────────────────────────────
async function loadDiagnostics() {
  try {
    _diag = await get('/api/diagnostics');
    renderDiag(_diag);
    setHint(
      _diag.kraft.ok
        ? `kraft ${_diag.kraft.detail} · WSL: ${_diag.distro}`
        : `⚠ kraft no instalado en WSL (${_diag.distro || 'sin distro'})`,
      _diag.kraft.ok ? 'ok' : 'warn'
    );
  } catch {
    setHint('Modo estático — servidor no disponible', 'warn');
  }
}

function renderDiag(d) {
  const el = document.getElementById('diag-panel');
  if (!el) return;
  el.innerHTML = `
    <div class="diag-row">
      <span class="diag-dot ${d.wsl.ok ? 'dot-ok' : 'dot-warn'}"></span>
      <span>WSL2</span>
      <span class="diag-val">${d.distro || 'no detectado'}</span>
    </div>
    <div class="diag-row">
      <span class="diag-dot ${d.kraft.ok ? 'dot-ok' : 'dot-err'}"></span>
      <span>kraft</span>
      <span class="diag-val">${d.kraft.ok ? d.kraft.detail : 'no instalado'}</span>
    </div>
    <div class="diag-row">
      <span class="diag-dot dot-ok"></span>
      <span>API</span>
      <span class="diag-val">:9091 activa</span>
    </div>
    ${!d.kraft.ok ? `<div class="diag-warn">Instala kraft en WSL: <code>curl -sSfL get.kraftkit.sh | sh</code></div>` : ''}
  `;
}

// ── Stats ─────────────────────────────────────────────────────────────────────
async function loadStats() {
  try {
    const d = await get('/api/overview');
    setText('stat-running', d.running);
    setText('stat-ready',   d.ready);
    setText('stat-planned', d.planned);
  } catch {
    const running = _labs.filter(l => l.running).length;
    const planned = _labs.filter(l => l.status === 'planned').length;
    setText('stat-running', running);
    setText('stat-ready',   _labs.length - planned);
    setText('stat-planned', planned);
  }
}

// ── Labs ──────────────────────────────────────────────────────────────────────
async function loadLabs() {
  try {
    _labs = await get('/api/labs');
  } catch {
    try {
      const cfg = await get('/labs.config.json');
      _labs = cfg.labs.map(l => ({ ...l, running: false }));
    } catch { return; }
  }
  render();
}

function render() {
  const q         = (document.getElementById('search-input')?.value || '').toLowerCase();
  const container = document.getElementById('labs');
  const filtered  = q ? _labs.filter(l =>
    l.name.toLowerCase().includes(q) || String(l.port || '').includes(q)
  ) : _labs;

  if (!filtered.length) {
    container.innerHTML = '<div class="lab-placeholder">Sin resultados.</div>';
    return;
  }
  container.innerHTML = filtered.map(buildCard).join('');
}

function buildCard(lab) {
  const running  = !!lab.running;
  const planned  = lab.status === 'planned';
  const runnable = !!lab.kraftName;
  const state    = running ? 'running' : planned ? 'planned' : 'stopped';

  const portPill  = lab.port ? `<span class="port-pill">:${lab.port}</span>` : '';
  const protoPill = lab.healthProtocol
    ? `<span class="proto-pill">${lab.healthProtocol.toUpperCase()}</span>` : '';

  const statusBar = running
    ? `<div class="status-bar bar-running"><span class="pulse-dot"></span>Servicio activo en localhost:${lab.port}</div>`
    : planned
      ? `<div class="status-bar bar-planned">Próximamente</div>`
      : `<div class="status-bar bar-stopped">Detenido</div>`;

  let controls = '';
  if (runnable) {
    const canOpen = lab.url && !lab.url.startsWith('redis://');
    const openBtn = canOpen
      ? running
        ? `<button class="btn-card btn-open" data-url="${lab.url}">↗ Abrir</button>`
        : `<button class="btn-card btn-open btn-disabled" disabled title="Inicia primero el servicio">↗ Abrir</button>`
      : '';
    controls = `
      <div class="card-controls">
        <button class="btn-card btn-start" data-id="${lab.id}" ${running ? 'disabled' : ''}>▶ Iniciar</button>
        <button class="btn-card btn-stop"  data-id="${lab.id}" ${!running ? 'disabled' : ''}>■ Detener</button>
        <button class="btn-card btn-logs"  data-id="${lab.id}">≡ Logs</button>
        ${openBtn}
      </div>`;
  } else {
    controls = `<div class="card-controls"><span class="soon-label">Sin comandos</span></div>`;
  }

  return `
    <article class="lab-card state-${state}" data-id="${lab.id}">
      <div class="card-accent"></div>
      <div class="card-body">
        <div class="card-top">
          <div class="card-pills">${portPill}${protoPill}</div>
          <span class="card-id">#${lab.id}</span>
        </div>
        <h3 class="card-name">${lab.name}</h3>
        <p class="card-desc">${lab.description}</p>
        ${statusBar}
        ${controls}
      </div>
    </article>`;
}

// ── Actions ───────────────────────────────────────────────────────────────────
async function startLab(id) {
  setBusy(id, true);
  openLogsPanel(id, 'Iniciando…');
  const r = await post(`/api/labs/${id}/start`);
  appendLog(r?.output || '(sin respuesta)');
  await refresh();
  setBusy(id, false);
}

async function stopLab(id) {
  setBusy(id, true);
  openLogsPanel(id, 'Deteniendo…');
  const r = await post(`/api/labs/${id}/stop`);
  appendLog(r?.output || '(sin respuesta)');
  await refresh();
  setBusy(id, false);
}

async function stopAll() {
  const btn = document.getElementById('btn-stop-all');
  if (btn) btn.disabled = true;
  const r = await post('/api/workspace/stop-all');
  await refresh();
  if (btn) btn.disabled = false;
}

function setBusy(id, busy) {
  document.querySelectorAll(`.lab-card[data-id="${id}"] .btn-card`).forEach(b => b.disabled = busy);
}

// ── Logs ──────────────────────────────────────────────────────────────────────
function openLogsPanel(id, initialText) {
  _logsId = id;
  const lab = _labs.find(l => l.id === id);
  document.getElementById('logs-title').textContent = `Logs — ${lab?.name ?? id}`;
  document.getElementById('logs-content').textContent = initialText || 'Cargando…';
  document.getElementById('logs-panel').classList.add('open');
  document.getElementById('logs-overlay').classList.add('open');
}

function appendLog(text) {
  const el = document.getElementById('logs-content');
  if (el.textContent === 'Cargando…' || el.textContent === 'Iniciando…' || el.textContent === 'Deteniendo…') {
    el.textContent = text;
  } else {
    el.textContent += '\n' + text;
  }
  el.scrollTop = el.scrollHeight;
}

async function fetchLogs(id) {
  const el = document.getElementById('logs-content');
  try {
    const d = await get(`/api/labs/${id}/logs`);
    el.textContent = d.output || '(sin output)';
  } catch {
    el.textContent = 'API no disponible';
  }
  el.scrollTop = el.scrollHeight;
}

function closeLogs() {
  _logsId = null;
  document.getElementById('logs-panel').classList.remove('open');
  document.getElementById('logs-overlay').classList.remove('open');
}

// ── Refresh ───────────────────────────────────────────────────────────────────
async function refresh() {
  await Promise.all([loadLabs(), loadStats()]);
  if (_logsId) await fetchLogs(_logsId);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadDiagnostics();
  refresh();
  setInterval(refresh, 10_000);

  document.getElementById('search-input').addEventListener('input', render);
  document.getElementById('btn-refresh').addEventListener('click', () => { loadDiagnostics(); refresh(); });
  document.getElementById('btn-stop-all').addEventListener('click', stopAll);
  document.getElementById('logs-close').addEventListener('click', closeLogs);
  document.getElementById('logs-overlay').addEventListener('click', closeLogs);
  document.getElementById('btn-logs-refresh').addEventListener('click', () => { if (_logsId) fetchLogs(_logsId); });

  document.getElementById('labs').addEventListener('click', async e => {
    const url = e.target.closest('[data-url]');
    if (url) { window.open(url.dataset.url, '_blank'); return; }
    const btn = e.target.closest('[data-id]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('btn-start')) await startLab(id);
    if (btn.classList.contains('btn-stop'))  await stopLab(id);
    if (btn.classList.contains('btn-logs'))  { openLogsPanel(id); await fetchLogs(id); }
  });
});

// ── Utils ─────────────────────────────────────────────────────────────────────
function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
function setHint(msg, type) {
  const el = document.getElementById('env-hint');
  if (!el) return;
  el.textContent = msg;
  el.className = `search-hint hint-${type}`;
}
