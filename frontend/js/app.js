// ── ESTADO ──────────────────────────────────────────────────────
let products      = [];
let currentFilter = 'todos';

const ICONS = {
  gamer: '🎮', ultrabook: '✨',
  workstation: '🖥️', básico: '💻'
};

// ▶ COLOQUE O NÚMERO DA LOJA AQUI (só números, com DDI+DDD)
const WHATSAPP_NUMBER = '555198371140';

// ── UTILITÁRIOS ──────────────────────────────────────────────────
function fmtPrice(value) {
  return 'R$ ' + Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function setLoading(btn, text, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? '…' : text;
}

// ── WHATSAPP ─────────────────────────────────────────────────────
function buyViaWhatsApp(p) {
  const specs = [
    p.cpu    && `• Processador: ${p.cpu}`,
    p.ram    && `• Memória: ${p.ram}`,
    p.ssd    && `• Armazenamento: ${p.ssd}`,
    p.screen && `• Tela: ${p.screen}`,
  ].filter(Boolean).join('\n');

  const msg =
`Olá! Tenho interesse em comprar:

*${p.brand} — ${p.name}*
${specs ? specs + '\n' : ''}
💰 *${fmtPrice(p.price)}*

Poderia me ajudar com mais informações?`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ── INICIALIZAÇÃO ────────────────────────────────────────────────
async function init() {
  try {
    products = await fetchProducts();
    render();
    updateLogoutBtn();
  } catch {
    document.getElementById('grid').innerHTML = `
      <div class="empty">
        <div class="empty-icon">⚠️</div>
        <p>Não foi possível carregar os produtos.<br>
           Verifique se o backend está rodando.</p>
      </div>`;
    document.getElementById('count').textContent = '—';
  }
}

function updateLogoutBtn() {
  document.getElementById('logout-btn').style.display =
    isLoggedIn() ? 'inline' : 'none';
}

// ── RENDERIZAÇÃO ─────────────────────────────────────────────────
function render() {
  const grid = document.getElementById('grid');

  const filtered = currentFilter === 'todos'
    ? products
    : products.filter(p => p.category === currentFilter);

  document.getElementById('count').textContent =
    filtered.length + (filtered.length === 1 ? ' item' : ' itens');

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📦</div>
        <p>Nenhum produto nesta categoria ainda.</p>
      </div>`;
    return;
  }

  grid.innerHTML = '';
  filtered.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = i * 0.06 + 's';
    card.onclick = () => openDetail(p);

    const imgContent = p.imgUrl
      ? `<img src="${p.imgUrl}" alt="${p.name}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='block'">`
      : '';
    const phStyle = p.imgUrl ? 'display:none' : '';

    // Serializa o produto de forma segura para o onclick
    const pJson = encodeURIComponent(JSON.stringify(p));

    card.innerHTML = `
      <div class="card-img">
        ${imgContent}
        <div class="img-placeholder" style="${phStyle}">${ICONS[p.category] || '💻'}</div>
        ${p.isNew ? '<span class="badge-new">Novo</span>' : ''}
        ${p.priceOld ? '<span class="badge-off">PROMO</span>' : ''}
      </div>
      <div class="card-body">
        <div class="card-brand">${p.brand}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-specs">
          ${p.cpu    ? `<span class="spec-tag">${p.cpu}</span>`    : ''}
          ${p.ram    ? `<span class="spec-tag">${p.ram}</span>`    : ''}
          ${p.ssd    ? `<span class="spec-tag">${p.ssd}</span>`    : ''}
          ${p.screen ? `<span class="spec-tag">${p.screen}</span>` : ''}
        </div>
        <div class="card-footer">
          <div>
            ${p.priceOld ? `<div class="price-old">${fmtPrice(p.priceOld)}</div>` : ''}
            <div class="price">${fmtPrice(p.price)}</div>
          </div>
          <button class="btn-buy"
            onclick="event.stopPropagation(); buyViaWhatsApp(JSON.parse(decodeURIComponent('${pJson}')))">
            💬 Comprar
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// ── FILTROS ──────────────────────────────────────────────────────
function setFilter(filter, el) {
  currentFilter = filter;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  render();
}

function setChipFilter(category) {
  const chip = [...document.querySelectorAll('.chip')]
    .find(c => c.textContent.toLowerCase() === category);
  if (chip) chip.click();
}

// ── LOGIN ─────────────────────────────────────────────────────────
function handleAdminClick() {
  if (isLoggedIn()) {
    openAdmin();
  } else {
    openLogin();
  }
}

function openLogin() {
  document.getElementById('loginOverlay').classList.add('open');
  setTimeout(() => document.getElementById('l-email').focus(), 100);
}

function closeLogin() {
  document.getElementById('loginOverlay').classList.remove('open');
  document.getElementById('login-error').style.display = 'none';
  document.getElementById('l-email').value = '';
  document.getElementById('l-password').value = '';
}

async function doLogin() {
  const email    = document.getElementById('l-email').value.trim();
  const password = document.getElementById('l-password').value;
  const btn      = document.getElementById('login-btn');
  const errEl    = document.getElementById('login-error');

  if (!email || !password) {
    errEl.textContent = 'Preencha e-mail e senha.';
    errEl.style.display = 'block';
    return;
  }

  setLoading(btn, 'Entrar', true);
  errEl.style.display = 'none';

  try {
    await login(email, password);
    closeLogin();
    updateLogoutBtn();
    showToast('Login realizado! Bem-vindo, dono.');
    openAdmin();
  } catch (err) {
    errEl.textContent = err.message || 'Erro ao fazer login.';
    errEl.style.display = 'block';
  } finally {
    setLoading(btn, 'Entrar', false);
  }
}

// ── PAINEL ADMIN ─────────────────────────────────────────────────
function openAdmin() {
  renderAdminList();
  document.getElementById('adminOverlay').classList.add('open');
}

function closeAdmin() {
  document.getElementById('adminOverlay').classList.remove('open');
}

function renderAdminList() {
  const list = document.getElementById('adminList');
  if (products.length === 0) {
    list.innerHTML = '<div style="color:var(--muted);font-size:.82rem;padding:8px 0">Nenhum produto ainda.</div>';
    return;
  }
  list.innerHTML = products.map(p => `
    <div class="admin-item">
      <div class="admin-item-icon">${ICONS[p.category] || '💻'}</div>
      <div class="admin-item-info">
        <div class="admin-item-name">${p.brand} — ${p.name}</div>
        <div class="admin-item-price">${fmtPrice(p.price)} · ${p.category}</div>
      </div>
      <button class="btn-del" onclick="removeProduct(${p.id})">Remover</button>
    </div>`).join('');
}

async function removeProduct(id) {
  if (!confirm('Remover este produto da vitrine?')) return;
  try {
    await deleteProduct(id);
    products = products.filter(p => p.id !== id);
    renderAdminList();
    render();
    showToast('Produto removido!');
  } catch (err) {
    showToast('Erro: ' + err.message);
  }
}

async function addProduct() {
  const name  = document.getElementById('f-name').value.trim();
  const brand = document.getElementById('f-brand').value.trim();
  const price = parseFloat(document.getElementById('f-price').value);
  const btn   = document.getElementById('add-btn');

  if (!name || !brand || !price) {
    alert('Preencha pelo menos Marca, Nome e Preço!');
    return;
  }

  setLoading(btn, '+ Publicar Produto', true);

  try {
    const priceOldVal = parseFloat(document.getElementById('f-price-old').value);
    await createProduct({
      brand,
      name,
      category:    document.getElementById('f-cat').value,
      description: document.getElementById('f-desc').value.trim(),
      cpu:         document.getElementById('f-cpu').value.trim(),
      ram:         document.getElementById('f-ram').value.trim(),
      ssd:         document.getElementById('f-ssd').value.trim(),
      screen:      document.getElementById('f-screen').value.trim(),
      price,
      priceOld:    isNaN(priceOldVal) ? null : priceOldVal,
      isNew:       document.getElementById('f-new').checked,
      imgUrl:      document.getElementById('f-img').value.trim(),
    });

    ['f-brand','f-name','f-desc','f-cpu','f-ram','f-ssd','f-screen','f-price','f-price-old','f-img']
      .forEach(id => document.getElementById(id).value = '');
    document.getElementById('f-new').checked = true;

    products = await fetchProducts();
    renderAdminList();
    render();
    closeAdmin();
    showToast(`"${name}" publicado na vitrine!`);
  } catch (err) {
    alert('Erro ao publicar: ' + err.message);
  } finally {
    setLoading(btn, '+ Publicar Produto', false);
  }
}

// ── DETALHE ───────────────────────────────────────────────────────
function openDetail(p) {
  const wrap = document.getElementById('detail-img-wrap');
  const ph   = document.getElementById('detail-placeholder');

  const oldImg = wrap.querySelector('img');
  if (oldImg) oldImg.remove();

  if (p.imgUrl) {
    const img = document.createElement('img');
    img.src = p.imgUrl; img.alt = p.name;
    img.onerror = () => { img.remove(); ph.style.display = 'block'; };
    ph.style.display = 'none';
    wrap.insertBefore(img, ph);
  } else {
    ph.style.display = 'block';
    ph.textContent = ICONS[p.category] || '💻';
  }

  document.getElementById('detail-brand').textContent = p.brand + ' · ' + p.category.toUpperCase();
  document.getElementById('detail-name').textContent  = p.name;
  document.getElementById('detail-desc').textContent  = p.description;
  document.getElementById('detail-price').textContent = fmtPrice(p.price);

  const specs = [
    ['Processador', p.cpu], ['Memória RAM', p.ram],
    ['Armazenamento', p.ssd], ['Tela', p.screen]
  ].filter(([, v]) => v);

  document.getElementById('detail-specs').innerHTML = specs.map(([k, v]) => `
    <div class="detail-spec">
      <div class="detail-spec-label">${k}</div>
      <div class="detail-spec-val">${v}</div>
    </div>`).join('');

  // Botão comprar no modal de detalhe
  const pJson = encodeURIComponent(JSON.stringify(p));
  document.getElementById('detail-buy-btn').onclick = () => {
    buyViaWhatsApp(p);
    closeDetail();
  };

  document.getElementById('detailOverlay').classList.add('open');
}

function closeDetail() {
  document.getElementById('detailOverlay').classList.remove('open');
}

// ── TOAST ─────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── EVENTOS GLOBAIS ───────────────────────────────────────────────
['loginOverlay', 'adminOverlay', 'detailOverlay'].forEach(id => {
  document.getElementById(id).addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeLogin(); closeAdmin(); closeDetail();
  }
});

// ── START ─────────────────────────────────────────────────────────
init();
