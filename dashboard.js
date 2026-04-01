async function loadLabs() {
  const response = await fetch('labs.config.json');
  const data = await response.json();

  document.getElementById('project-name').textContent = data.project;
  document.getElementById('project-subtitle').textContent = data.subtitle;

  const labsContainer = document.getElementById('labs');
  labsContainer.innerHTML = '';

  for (const lab of data.labs) {
    const article = document.createElement('article');
    article.className = 'lab';
    const urlText = lab.url ? `<p><a href="${lab.url}" target="_blank" rel="noreferrer">Abrir ${lab.url}</a></p>` : '';
    article.innerHTML = `
      <div class="badge ${lab.status}">${lab.status}</div>
      <h3>${lab.id} · ${lab.name}</h3>
      <p>${lab.description}</p>
      <div class="code">cd ${lab.path}</div>
      <p><a href="${lab.path}/README.md">Abrir README del lab</a></p>
      ${urlText}
    `;
    labsContainer.appendChild(article);
  }
}

loadLabs().catch(err => {
  document.getElementById('labs').innerHTML = `<article class="lab"><h3>Error</h3><p>No se pudo cargar labs.config.json</p><div class="code">${err}</div></article>`;
});
