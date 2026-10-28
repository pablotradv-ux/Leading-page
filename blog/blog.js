// Menu mobile, ano do rodapé e índice automático dos artigos
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (navToggle && mobileMenu) {
  const iconMenu = document.getElementById('iconMenu');
  const iconClose = document.getElementById('iconClose');
  const setOpen = open => {
    mobileMenu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
    iconMenu.style.display = open ? 'none' : 'block';
    iconClose.style.display = open ? 'block' : 'none';
  };
  navToggle.addEventListener('click', () => setOpen(!mobileMenu.classList.contains('open')));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
}

// O índice é montado a partir dos títulos (h2) e subtítulos (h3) do artigo,
// então basta escrever o texto com os títulos que o quadro lateral se atualiza sozinho.
const body = document.querySelector('.article-body');
const toc = document.querySelector('.toc');
if (body && toc) {
  const slug = text => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const headings = [...body.querySelectorAll('h2, h3')].filter(h => !h.closest('.article-cta'));
  const list = toc.querySelector('ol');
  const links = new Map();

  headings.forEach(h => {
    if (!h.id) h.id = slug(h.textContent);
    const li = document.createElement('li');
    if (h.tagName === 'H3') li.className = 'sub';
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
    links.set(h, a);
  });

  // No celular, fecha o índice depois de escolher um tópico
  const details = toc.querySelector('details');
  const desktop = window.matchMedia('(min-width:1024px)');
  // No computador o índice fica sempre aberto; no celular começa fechado para não empurrar o texto
  const syncOpen = () => { details.open = desktop.matches; };
  syncOpen();
  desktop.addEventListener('change', syncOpen);
  list.addEventListener('click', e => {
    if (e.target.tagName === 'A' && !desktop.matches) details.open = false;
  });

  // Destaca no índice a seção que está sendo lida e atualiza a barra de progresso
  const bar = toc.querySelector('.toc-progress span');
  let current = null;
  const update = () => {
    const offset = 120;
    let active = headings[0];
    for (const h of headings) {
      if (h.getBoundingClientRect().top - offset <= 0) active = h; else break;
    }
    if (active !== current) {
      if (current) links.get(current).classList.remove('active');
      links.get(active).classList.add('active');
      current = active;
    }
    if (bar) {
      const rect = body.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const pct = total > 0 ? Math.min(100, Math.max(0, -rect.top / total * 100)) : 100;
      bar.style.width = pct + '%';
    }
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(() => { update(); ticking = false; }); ticking = true; }
  }, { passive: true });
  update();
}
