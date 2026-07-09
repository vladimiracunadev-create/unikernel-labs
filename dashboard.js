'use strict';

let _labs = [];
let _logsId = null;
let _logsTimer = null;
let _diag = null;

async function get(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function post(url) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-UCC-Request': '1',
    },
  });

  return response.json();
}

async function loadDiagnostics() {
  try {
    _diag = await get('/api/diagnostics');
    renderDiag(_diag);
    setHint(
      _diag.kraft.ok
        ? `kraft ${_diag.kraft.detail} · WSL: ${_diag.distro}`
        : `kraft no instalado en WSL (${_diag.distro || 'sin distro'})`,
      _diag.kraft.ok ? 'ok' : 'warn'
    );
  } catch {
    setHint('Modo estatico - servidor no disponible', 'warn');
  }
}

function renderDiag(diagnostics) {
  const element = document.getElementById('diag-panel');
  if (!element) {
    return;
  }

  const distro = escapeHtml(diagnostics.distro || 'no detectado');
  const kraftDetail = escapeHtml(diagnostics.kraft.ok ? diagnostics.kraft.detail : 'no instalado');

  element.innerHTML = `
    <div class="diag-row">
      <span class="diag-dot ${diagnostics.wsl.ok ? 'dot-ok' : 'dot-warn'}"></span>
      <span>WSL2</span>
      <span class="diag-val">${distro}</span>
    </div>
    <div class="diag-row">
      <span class="diag-dot ${diagnostics.kraft.ok ? 'dot-ok' : 'dot-err'}"></span>
      <span>kraft</span>
      <span class="diag-val">${kraftDetail}</span>
    </div>
    <div class="diag-row">
      <span class="diag-dot dot-ok"></span>
      <span>API</span>
      <span class="diag-val">:9091 activa</span>
    </div>
    ${!diagnostics.kraft.ok ? '<div class="diag-warn">Instala kraft en WSL: <code>curl -sSfL get.kraftkit.sh | sh</code></div>' : ''}
  `;
}

async function loadStats() {
  try {
    const stats = await get('/api/overview');
    setText('stat-running', stats.running);
    setText('stat-ready', stats.ready);
    setText('stat-planned', stats.planned);
  } catch {
    const running = _labs.filter(lab => lab.running).length;
    const planned = _labs.filter(lab => lab.status === 'planned').length;
    setText('stat-running', running);
    setText('stat-ready', _labs.length - planned);
    setText('stat-planned', planned);
  }
}

async function loadLabs() {
  try {
    _labs = await get('/api/labs');
  } catch {
    try {
      const config = await get('/labs.config.json');
      _labs = config.labs.map(lab => ({ ...lab, running: false }));
    } catch {
      return;
    }
  }

  render();
}

function render() {
  const query = (document.getElementById('search-input')?.value || '').toLowerCase();
  const container = document.getElementById('labs');
  if (!container) {
    return;
  }

  const filtered = query
    ? _labs.filter(lab =>
      lab.name.toLowerCase().includes(query) || String(lab.port || '').includes(query)
    )
    : _labs;

  if (!filtered.length) {
    container.innerHTML = '<div class="lab-placeholder">Sin resultados.</div>';
    return;
  }

  container.innerHTML = filtered.map(buildCard).join('');
}

function buildCard(lab) {
  const running = Boolean(lab.running);
  const planned = lab.status === 'planned';
  const runnable = Boolean(lab.kraftName);
  const state = running ? 'running' : planned ? 'planned' : 'stopped';

  const safeId = escapeHtml(lab.id || '');
  const safeName = escapeHtml(lab.name || '');
  const safeDescription = escapeHtml(lab.description || '');
  const safeUrl = escapeHtml(lab.url || '');

  const portPill = lab.port ? `<span class="port-pill">:${lab.port}</span>` : '';
  const protoPill = lab.healthProtocol
    ? `<span class="proto-pill">${escapeHtml(String(lab.healthProtocol).toUpperCase())}</span>`
    : '';
  const healthBadge = (running && lab.port)
    ? `<span class="health-badge hb-checking" data-health="${safeId}"><span class="hb-dot"></span>Check</span>`
    : '';

  const statusBar = running
    ? `<div class="status-bar bar-running"><span class="pulse-dot"></span>Servicio activo en localhost:${lab.port}</div>`
    : planned
      ? '<div class="status-bar bar-planned">Proximamente</div>'
      : '<div class="status-bar bar-stopped">Detenido</div>';

  let controls = '';
  if (runnable) {
    const canOpen = lab.url && !lab.url.startsWith('redis://');
    const openButton = canOpen
      ? running
        ? `<button class="btn-card btn-open" data-url="${safeUrl}">Abrir</button>`
        : '<button class="btn-card btn-open btn-disabled" disabled title="Inicia primero el servicio">Abrir</button>'
      : '';

    controls = `
      <div class="card-controls">
        <button class="btn-card btn-start" data-id="${safeId}" ${running ? 'disabled' : ''}>Iniciar</button>
        <button class="btn-card btn-stop" data-id="${safeId}" ${!running ? 'disabled' : ''}>Detener</button>
        <button class="btn-card btn-logs" data-id="${safeId}">Logs</button>
        ${openButton}
      </div>
    `;
  } else {
    controls = '<div class="card-controls"><span class="soon-label">Sin comandos</span></div>';
  }

  return `
    <article class="lab-card state-${state}" data-id="${safeId}">
      <div class="card-accent"></div>
      <div class="card-body">
        <div class="card-top">
          <div class="card-pills">${portPill}${protoPill}${healthBadge}</div>
          <span class="card-id">#${safeId}</span>
        </div>
        <h3 class="card-name">${safeName}</h3>
        <p class="card-desc">${safeDescription}</p>
        ${statusBar}
        ${controls}
      </div>
    </article>
  `;
}

function labName(id) {
  return _labs.find(item => item.id === id)?.name || id;
}

async function startLab(id) {
  setBusy(id, true);
  openLogsPanel(id, 'Iniciando...');
  try {
    const result = await post(`/api/labs/${id}/start`);
    appendLog(result?.output || result?.error || '(sin respuesta)');
    toast(result?.ok ? `${labName(id)} iniciado` : `Error al iniciar ${labName(id)}`, result?.ok ? 'ok' : 'error');
  } catch {
    toast(`No se pudo iniciar ${labName(id)}`, 'error');
  }
  await refresh();
  setBusy(id, false);
}

async function stopLab(id) {
  setBusy(id, true);
  openLogsPanel(id, 'Deteniendo...');
  try {
    const result = await post(`/api/labs/${id}/stop`);
    appendLog(result?.output || result?.error || '(sin respuesta)');
    toast(result?.ok ? `${labName(id)} detenido` : `Error al detener ${labName(id)}`, result?.ok ? 'ok' : 'error');
  } catch {
    toast(`No se pudo detener ${labName(id)}`, 'error');
  }
  await refresh();
  setBusy(id, false);
}

async function stopAll() {
  const button = document.getElementById('btn-stop-all');
  if (button) {
    button.disabled = true;
  }

  try {
    const result = await post('/api/workspace/stop-all');
    toast(result?.ok ? 'Todos los servicios detenidos' : `Detenidos con ${result?.failed ?? '?'} error(es)`, result?.ok ? 'ok' : 'error');
  } catch {
    toast('No se pudo detener el workspace', 'error');
  }
  await refresh();

  if (button) {
    button.disabled = false;
  }
}

function setBusy(id, busy) {
  document
    .querySelectorAll(`.lab-card[data-id="${id}"] .btn-card`)
    .forEach(button => { button.disabled = busy; });
}

function openLogsPanel(id, initialText) {
  _logsId = id;
  const lab = _labs.find(item => item.id === id);
  document.getElementById('logs-title').textContent = `Logs - ${lab?.name ?? id}`;
  document.getElementById('logs-content').textContent = initialText || 'Cargando...';
  document.getElementById('logs-panel').classList.add('open');
  document.getElementById('logs-overlay').classList.add('open');
}

function appendLog(text) {
  const element = document.getElementById('logs-content');
  if (!element) {
    return;
  }

  if (['Cargando...', 'Iniciando...', 'Deteniendo...'].includes(element.textContent)) {
    element.textContent = text;
  } else {
    element.textContent += `\n${text}`;
  }

  element.scrollTop = element.scrollHeight;
}

async function fetchLogs(id) {
  const element = document.getElementById('logs-content');
  if (!element) {
    return;
  }

  try {
    const data = await get(`/api/labs/${id}/logs`);
    element.textContent = data.output || '(sin output)';
  } catch {
    element.textContent = 'API no disponible';
  }

  element.scrollTop = element.scrollHeight;
}

function startLogsPoll(id) {
  stopLogsPoll();
  _logsTimer = setInterval(() => {
    if (_logsId === id) {
      fetchLogs(id);
    }
  }, 3_000);
}

function stopLogsPoll() {
  if (_logsTimer) {
    clearInterval(_logsTimer);
    _logsTimer = null;
  }
}

function closeLogs() {
  _logsId = null;
  stopLogsPoll();
  document.getElementById('logs-panel').classList.remove('open');
  document.getElementById('logs-overlay').classList.remove('open');
}

async function refresh() {
  await Promise.all([loadLabs(), loadStats()]);
  updateHealth();
  if (_logsId) {
    await fetchLogs(_logsId);
  }
}

async function updateHealth() {
  const badges = Array.from(document.querySelectorAll('[data-health]'));
  await Promise.all(badges.map(async el => {
    const id = el.dataset.health;
    try {
      const health = await get(`/api/labs/${id}/health`);
      const status = health.status === 'healthy'
        ? 'healthy'
        : health.status === 'unhealthy' ? 'unhealthy' : 'checking';
      const label = status === 'healthy' ? 'Healthy' : status === 'unhealthy' ? 'Caído' : 'Check';
      const detail = escapeHtml(health.detail || '');
      el.className = `health-badge hb-${status}`;
      el.innerHTML = `<span class="hb-dot"></span>${label}${detail ? ` · <span class="hb-latency">${detail}</span>` : ''}`;
    } catch {
      el.className = 'health-badge';
      el.innerHTML = '<span class="hb-dot"></span>—';
    }
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadDiagnostics();
  refresh();
  setInterval(refresh, 10_000);

  document.getElementById('btn-theme')?.addEventListener('click', toggleTheme);
  document.getElementById('search-input').addEventListener('input', render);
  document.getElementById('btn-refresh').addEventListener('click', () => {
    loadDiagnostics();
    refresh();
  });
  document.getElementById('btn-stop-all').addEventListener('click', stopAll);
  document.getElementById('logs-close').addEventListener('click', closeLogs);
  document.getElementById('logs-overlay').addEventListener('click', closeLogs);
  document.getElementById('btn-logs-refresh').addEventListener('click', () => {
    if (_logsId) {
      fetchLogs(_logsId);
    }
  });

  document.getElementById('labs').addEventListener('click', async event => {
    const urlButton = event.target.closest('[data-url]');
    if (urlButton) {
      const url = urlButton.dataset.url || '';
      if (/^https?:\/\//i.test(url)) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    const actionButton = event.target.closest('[data-id]');
    if (!actionButton) {
      return;
    }

    const { id } = actionButton.dataset;
    if (actionButton.classList.contains('btn-start')) {
      await startLab(id);
    }
    if (actionButton.classList.contains('btn-stop')) {
      await stopLab(id);
    }
    if (actionButton.classList.contains('btn-logs')) {
      openLogsPanel(id);
      await fetchLogs(id);
      startLogsPoll(id);
    }
  });
});

/* ── Theme ─────────────────────────────────────────────────────────────────── */
function prefersLight() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
}

function effectiveTheme() {
  return document.documentElement.getAttribute('data-theme') || (prefersLight() ? 'light' : 'dark');
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') {
    root.setAttribute('data-theme', theme);
  } else {
    root.removeAttribute('data-theme');
  }
  const button = document.getElementById('btn-theme');
  if (button) {
    button.textContent = effectiveTheme() === 'light' ? '☀️' : '🌙';
  }
}

function initTheme() {
  applyTheme(localStorage.getItem('ucc-theme') || 'auto');
}

function toggleTheme() {
  const next = effectiveTheme() === 'light' ? 'dark' : 'light';
  localStorage.setItem('ucc-theme', next);
  applyTheme(next);
}

/* ── Toasts ────────────────────────────────────────────────────────────────── */
function toast(message, type = 'info') {
  const container = document.getElementById('toasts');
  if (!container) {
    return;
  }

  const element = document.createElement('div');
  element.className = `toast toast-${type}`;
  const icon = type === 'ok' ? '✅' : type === 'error' ? '⛔' : 'ℹ️';
  element.innerHTML = `<span class="toast-icon">${icon}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(element);

  setTimeout(() => {
    element.classList.add('is-leaving');
    setTimeout(() => element.remove(), 220);
  }, 3_800);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function setHint(message, type) {
  const element = document.getElementById('env-hint');
  if (!element) {
    return;
  }

  element.textContent = message;
  element.className = `search-hint hint-${type}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
