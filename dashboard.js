'use strict';

// ── State ─────────────────────────────────────────────────────────────────────
let _currentLogsId   = null;
let _statusInterval  = null;
let _labsCache       = [];

// ── API helpers ───────────────────────────────────────────────────────────────
async function api(path, opts = {}) {
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Overview ──────────────────────────────────────────────────────────────────
async function loadOverview() {
  try {
    const data = await api('/api/overview');
    setText('stat-total',   data.total);
    setText('stat-running', data.running);
    setText('stat-ready',   data.ready);
    setText('stat-planned', data.planned);
  } catch {
    // server not running — try static config
    try {
      const data = await api('/labs.config.json');
      const total   = data.labs.length;
      const planned = data.labs.filter(l => l.status === 'planned').length;
      const ready   = total - planned;
      setText('stat-total',   total);
      setText('stat-running', '—');
      setText('stat-ready',   ready);
      setText('stat-planned', planned);
    } catch { /* silent */ }
  }
}

// ── Environment panel ─────────────────────────────────────────────────────────
async function checkEnv() {
  // API server
  try {
    await api('/api/overview');
    setEnv('server', 'ok',   'activo :9091');
    setEnv('kraft',  'ok',   'disponible');
    setEnv('wsl',    'ok',   'activo');
  } catch {
    setEnv('server', 'warn', 'modo estático');
    setEnv('kraft',  'warn', 'no verificado');
    setEnv('wsl',    'ok',   'activo');
  }
}

function setEnv(key, state, label) {
  const dot = document.getElementById(`dot-${key}`);
  const val = document.getElementById(`val-${key}`);
  if (dot) dot.className = `env-dot dot-${state}`;
  if (val) val.textContent = label;
}

// ── Labs ──────────────────────────────────────────────────────────────────────
async function loadLabs() {
  const container = document.getElementById('labs');
  try {
    const labs = await api('/api/labs');
    _labsCache = labs;
    renderLabs(labs, container);
  } catch {
    // fallback: static file
    try {
      const data = await api('/labs.config.json');
      _labsCache = data.labs.map(l => ({ ...l, running: false }));
      renderLabs(_labsCache, container);
    } catch (e) {
      container.innerHTML = `<div class="error-msg">Error cargando labs: ${e.message}</div>`;
    }
  }
}

function renderLabs(labs, container) {
  const q = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const filtered = q
    ? labs.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        String(l.port || '').includes(q)
      )
    : labs;

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = '<div class="error-msg">No hay labs que coincidan con la búsqueda.</div>';
    return;
  }

  for (const lab of filtered) {
    container.appendChild(buildLabCard(lab));
  }
}

function buildLabCard(lab) {
  const article = document.createElement('article');
  article.className = `lab lab-${lab.running ? 'running' : (lab.status === 'planned' ? 'planned' : 'stopped')}`;
  article.dataset.id = lab.id;

  const isRunnable = !!lab.kraftName;
  const isRunning  = !!lab.running;
  const isPlanned  = lab.status === 'planned';

  // Status dot + badge
  const dotClass = isRunning ? 'dot-ok' : isPlanned ? 'dot-planned' : 'dot-idle';
  const badgeClass = isRunning ? 'badge-running' : isPlanned ? 'badge-planned' : 'badge-stopped';
  const badgeLabel = isRunning ? 'running' : isPlanned ? 'planned' : 'stopped';

  // Port badge
  const portBadge = lab.port
    ? `<span class="port-tag">:${lab.port}</span>`
    : '';

  // URL link
  const urlLink = lab.url && !lab.url.startsWith('redis://')
    ? `<a href="${lab.url}" target="_blank" rel="noreferrer" class="btn-open-url">↗ Abrir</a>`
    : '';

  // Controls
  let controls = '';
  if (isRunnable) {
    controls = `
      <div class="lab-controls">
        <button class="btn-lab btn-start" data-id="${lab.id}" ${isRunning ? 'disabled' : ''}>▶ Iniciar</button>
        <button class="btn-lab btn-stop"  data-id="${lab.id}" ${!isRunning ? 'disabled' : ''}>■ Detener</button>
        <button class="btn-lab btn-logs"  data-id="${lab.id}">≡ Logs</button>
        ${urlLink}
      </div>`;
  } else {
    controls = `<div class="lab-controls"><span class="planned-tag">Próximamente</span></div>`;
  }

  article.innerHTML = `
    <div class="lab-header">
      <div class="lab-header-left">
        <span class="status-dot ${dotClass}"></span>
        <span class="lab-id">${lab.id}</span>
        ${portBadge}
      </div>
      <span class="lab-badge ${badgeClass}">${badgeLabel}</span>
    </div>
    <h3 class="lab-name">${lab.name}</h3>
    <p class="lab-desc">${lab.description}</p>
    ${controls}
  `;

  return article;
}

// ── Lab actions ───────────────────────────────────────────────────────────────
async function startLab(id) {
  setLabBusy(id, true, '▶ Iniciando…');
  try {
    await api(`/api/labs/${id}/start`, { method: 'POST' });
  } catch (e) {
    console.warn('start error:', e.message);
  }
  await refreshAll();
  setLabBusy(id, false);
}

async function stopLab(id) {
  setLabBusy(id, true, '■ Deteniendo…');
  try {
    await api(`/api/labs/${id}/stop`, { method: 'POST' });
  } catch (e) {
    console.warn('stop error:', e.message);
  }
  await refreshAll();
  setLabBusy(id, false);
}

async function stopAll() {
  const btn = document.getElementById('btn-stop-all');
  if (btn) { btn.disabled = true; btn.textContent = '⏹ Deteniendo…'; }
  try {
    await api('/api/workspace/stop-all', { method: 'POST' });
    await refreshAll();
  } catch (e) {
    console.warn('stop-all error:', e.message);
  }
  if (btn) { btn.disabled = false; btn.textContent = '⏹ Detener todo'; }
}

function setLabBusy(id, busy, label) {
  const card = document.querySelector(`.lab[data-id="${id}"]`);
  if (!card) return;
  card.querySelectorAll('.btn-lab').forEach(b => {
    b.disabled = busy;
    if (busy && label && b.classList.contains('btn-start')) b.textContent = label;
    if (busy && label && b.classList.contains('btn-stop'))  b.textContent = label;
  });
}

// ── Logs panel ────────────────────────────────────────────────────────────────
async function showLogs(id) {
  _currentLogsId = id;
  const panel   = document.getElementById('logs-panel');
  const overlay = document.getElementById('logs-overlay');
  const content = document.getElementById('logs-content');
  const title   = document.getElementById('logs-title');
  const lab     = _labsCache.find(l => l.id === id);

  title.textContent = `Logs — ${lab ? lab.name : id}`;
  content.textContent = 'Cargando…';
  panel.classList.add('open');
  overlay.classList.add('open');

  await fetchLogs(id);
}

async function fetchLogs(id) {
  const content = document.getElementById('logs-content');
  try {
    const data = await api(`/api/labs/${id}/logs`);
    content.textContent = data.output || '(sin output)';
  } catch {
    content.textContent = 'Error: API no disponible. Usa: kraft logs <nombre>';
  }
  content.scrollTop = content.scrollHeight;
}

function closeLogs() {
  _currentLogsId = null;
  document.getElementById('logs-panel')?.classList.remove('open');
  document.getElementById('logs-overlay')?.classList.remove('open');
}

// ── Refresh ───────────────────────────────────────────────────────────────────
async function refreshAll() {
  await Promise.all([loadOverview(), loadLabs()]);
  if (_currentLogsId) await fetchLogs(_currentLogsId);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Initial load
  checkEnv();
  refreshAll();

  // Auto-refresh every 10 s
  _statusInterval = setInterval(refreshAll, 10_000);

  // Search
  document.getElementById('search-input')?.addEventListener('input', () => {
    renderLabs(_labsCache, document.getElementById('labs'));
  });

  // Lab control buttons — event delegation
  document.getElementById('labs')?.addEventListener('click', async e => {
    const btn = e.target.closest('[data-id]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('btn-start')) await startLab(id);
    if (btn.classList.contains('btn-stop'))  await stopLab(id);
    if (btn.classList.contains('btn-logs'))  await showLogs(id);
  });

  // Header buttons
  document.getElementById('btn-refresh')?.addEventListener('click', refreshAll);
  document.getElementById('btn-stop-all')?.addEventListener('click', stopAll);

  // Logs panel
  document.getElementById('logs-close')?.addEventListener('click', closeLogs);
  document.getElementById('logs-overlay')?.addEventListener('click', closeLogs);
  document.getElementById('btn-logs-refresh')?.addEventListener('click', () => {
    if (_currentLogsId) fetchLogs(_currentLogsId);
  });
});

// ── Util ──────────────────────────────────────────────────────────────────────
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
