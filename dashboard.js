'use strict';

let _labs   = [];
let _logsId = null;

// ── API ───────────────────────────────────────────────────────────────────────
async function get(url)  { const r = await fetch(url);              if (!r.ok) throw new Error(r.status); return r.json(); }
async function post(url) { const r = await fetch(url,{method:'POST'}); if (!r.ok) throw new Error(r.status); return r.json(); }

// ── Render ────────────────────────────────────────────────────────────────────
function buildCard(lab) {
  const running = !!lab.running;
  const planned = lab.status === 'planned';
  const runnable = !!lab.kraftName;

  // Status class for card accent
  const state = running ? 'running' : planned ? 'planned' : 'stopped';

  // Port pill
  const portPill = lab.port
    ? `<span class="port-pill">:${lab.port}</span>`
    : '';

  // Health protocol icon
  const proto = { http:'HTTP', redis:'Redis', tcp:'TCP' }[lab.healthProtocol] || '';
  const protoPill = proto ? `<span class="proto-pill">${proto}</span>` : '';

  // Running indicator row
  const indicator = running
    ? `<div class="running-bar"><span class="pulse-dot"></span> Servicio activo</div>`
    : planned
      ? `<div class="planned-bar">Próximamente</div>`
      : `<div class="stopped-bar">Detenido</div>`;

  // Controls
  let controls = '';
  if (runnable) {
    const openBtn = lab.url && !lab.url.startsWith('redis://')
      ? running
        ? `<button class="btn-card btn-open" data-url="${lab.url}">↗ Abrir</button>`
        : `<button class="btn-card btn-open btn-open-off" disabled title="Inicia el servicio primero">↗ Abrir</button>`
      : '';

    controls = `
      <div class="card-controls">
        <button class="btn-card btn-start" data-id="${lab.id}" ${running ? 'disabled' : ''}>▶ Iniciar</button>
        <button class="btn-card btn-stop"  data-id="${lab.id}" ${!running ? 'disabled' : ''}>■ Detener</button>
        <button class="btn-card btn-logs"  data-id="${lab.id}">≡ Logs</button>
        ${openBtn}
      </div>`;
  } else {
    controls = `<div class="card-controls"><span class="soon-label">Sin comandos configurados</span></div>`;
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
        ${indicator}
        ${controls}
      </div>
    </article>`;
}

function render() {
  const q    = (document.getElementById('search-input')?.value || '').toLowerCase();
  const list = q
    ? _labs.filter(l => l.name.toLowerCase().includes(q) || String(l.port||'').includes(q))
    : _labs;

  const container = document.getElementById('labs');
  if (!list.length) {
    container.innerHTML = '<div class="lab-placeholder">Sin resultados.</div>';
    return;
  }
  container.innerHTML = list.map(buildCard).join('');
}

// ── Data ──────────────────────────────────────────────────────────────────────
async function load() {
  try {
    _labs = await get('/api/labs');
    setHint('API conectada · auto-refresh 10s', 'ok');
  } catch {
    try {
      const cfg = await get('/labs.config.json');
      _labs = cfg.labs.map(l => ({ ...l, running: false }));
      setHint('Modo estático — inicia el servidor para control en vivo', 'warn');
    } catch {
      setHint('Error cargando configuración', 'err');
    }
  }
  render();
  await loadStats();
}

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

// ── Actions ───────────────────────────────────────────────────────────────────
async function start(id) {
  setBusy(id, true);
  try { await post(`/api/labs/${id}/start`); } catch(e) { console.warn(e); }
  await load();
}

async function stop(id) {
  setBusy(id, true);
  try { await post(`/api/labs/${id}/stop`); } catch(e) { console.warn(e); }
  await load();
}

async function stopAll() {
  const btn = document.getElementById('btn-stop-all');
  if (btn) btn.disabled = true;
  try { await post('/api/workspace/stop-all'); } catch(e) { console.warn(e); }
  await load();
  if (btn) btn.disabled = false;
}

function setBusy(id, busy) {
  document.querySelectorAll(`.lab-card[data-id="${id}"] .btn-card`).forEach(b => b.disabled = busy);
}

// ── Logs ──────────────────────────────────────────────────────────────────────
async function showLogs(id) {
  _logsId = id;
  const lab = _labs.find(l => l.id === id);
  document.getElementById('logs-title').textContent = `Logs — ${lab?.name ?? id}`;
  document.getElementById('logs-content').textContent = 'Cargando…';
  document.getElementById('logs-panel').classList.add('open');
  document.getElementById('logs-overlay').classList.add('open');
  await fetchLogs(id);
}

async function fetchLogs(id) {
  const el = document.getElementById('logs-content');
  try {
    const d = await get(`/api/labs/${id}/logs`);
    el.textContent = d.output || '(sin output)';
  } catch {
    el.textContent = 'API no disponible. Usa: kraft logs <nombre>';
  }
  el.scrollTop = el.scrollHeight;
}

function closeLogs() {
  _logsId = null;
  document.getElementById('logs-panel').classList.remove('open');
  document.getElementById('logs-overlay').classList.remove('open');
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  load();
  setInterval(load, 10_000);

  document.getElementById('search-input').addEventListener('input', render);
  document.getElementById('btn-refresh').addEventListener('click', load);
  document.getElementById('btn-stop-all').addEventListener('click', stopAll);
  document.getElementById('logs-close').addEventListener('click', closeLogs);
  document.getElementById('logs-overlay').addEventListener('click', closeLogs);
  document.getElementById('btn-logs-refresh').addEventListener('click', () => { if (_logsId) fetchLogs(_logsId); });

  document.getElementById('labs').addEventListener('click', async e => {
    const btn = e.target.closest('[data-id]');
    const url = e.target.closest('[data-url]');
    if (url) { window.open(url.dataset.url, '_blank'); return; }
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('btn-start')) await start(id);
    if (btn.classList.contains('btn-stop'))  await stop(id);
    if (btn.classList.contains('btn-logs'))  await showLogs(id);
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
