function fetchProjects() {
  return fetch('data/projects.json').then(r => r.json());
}

function renderIndex(projects) {
  const container = document.getElementById('projects');
  container.innerHTML = '';
  projects.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    const imgSrc = (p.images && p.images[0]) ? p.images[0].src : '';
    card.innerHTML = `
      <a href="project.html?id=${encodeURIComponent(p.id)}">
        <img src="${imgSrc}" alt="${p.images && p.images[0] ? p.images[0].alt : p.title}" loading="lazy">
        <h2>${p.title}</h2>
        <p class="short">${p.shortDescription}</p>
      </a>
    `;
    container.appendChild(card);
  });
}

function renderFilters(projects) {
  const search = document.getElementById('search');
  const techSelect = document.getElementById('tech-filter');
  // build tech list
  const techs = new Set();
  projects.forEach(p => (p.technologies || []).forEach(t => techs.add(t)));
  // clear existing options except first
  techSelect.innerHTML = '<option value="all">すべての技術</option>';
  Array.from(techs).sort().forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    techSelect.appendChild(opt);
  });

  function applyFilters() {
    const q = (search.value || '').trim().toLowerCase();
    const tech = techSelect.value;
    const filtered = window.__projects.filter(p => {
      const inTech = (tech === 'all') || ((p.technologies || []).includes(tech));
      const inText = q === '' || [p.title, p.shortDescription, p.longDescription].join(' ').toLowerCase().includes(q);
      return inTech && inText;
    });
    renderIndex(filtered);
  }

  search.addEventListener('input', applyFilters);
  techSelect.addEventListener('change', applyFilters);
}

function getQueryParam(name) {
  const params = new URLSearchParams(location.search);
  return params.get(name);
}

function renderProject(project) {
  if (!project) {
    document.getElementById('content').textContent = 'プロジェクトが見つかりません。';
    return;
  }
  document.getElementById('proj-title').textContent = project.title;
  const meta = document.getElementById('proj-meta');
  meta.innerHTML = `<p><strong>作者:</strong> ${project.author} (${project.year})</p>
    <p><strong>技術:</strong> ${project.technologies.join(', ')}</p>`;

  const media = document.getElementById('proj-media');
  media.innerHTML = '';
  // images
  if (project.images && project.images.length) {
    const gallery = document.createElement('div');
    gallery.className = 'gallery';
    project.images.forEach(img => {
      const el = document.createElement('figure');
      el.innerHTML = `<img src="${img.src}" alt="${img.alt}"><figcaption>${img.caption || ''}</figcaption>`;
      gallery.appendChild(el);
    });
    media.appendChild(gallery);
  }

  // videos
  if (project.videos && project.videos.length) {
    const vwrap = document.createElement('div');
    vwrap.className = 'videos';
    project.videos.forEach(v => {
      const block = document.createElement('div');
      block.className = 'video-item';
      if (v.provider === 'self') {
        block.innerHTML = `<video controls preload="none" ${v.poster ? `poster="${v.poster}"` : ''}>
          <source src="${v.src}" type="${v.type}">
          お使いのブラウザは video 要素をサポートしていません。
        </video>
        <p class="caption">${v.caption || ''}</p>`;
      } else {
        // external embed (YouTube/Vimeo)
        block.innerHTML = `<iframe src="${v.src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <p class="caption">${v.caption || ''}</p>`;
      }
      vwrap.appendChild(block);
    });
    media.appendChild(vwrap);
  }

  const desc = document.getElementById('proj-desc');
  desc.innerHTML = `<h3>概要</h3><p>${project.longDescription}</p>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const isIndex = document.body && document.getElementById('projects');
  if (isIndex) {
    fetchProjects().then(projects => {
      window.__projects = projects;
      renderFilters(projects);
      renderIndex(projects);
    }).catch(err => {
      document.getElementById('projects').textContent = 'データ読み込みに失敗しました。';
      console.error(err);
    });
    return;
  }

  // project page
  const id = getQueryParam('id');
  if (id) {
    fetchProjects().then(projects => {
      const proj = projects.find(p => p.id === id);
      renderProject(proj);
    }).catch(err => {
      document.getElementById('content').textContent = 'データ読み込みに失敗しました。';
      console.error(err);
    });
  }
});
