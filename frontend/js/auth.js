// ── CONFIGURAÇÃO ────────────────────────────────────────────────
// Endereço do backend. Em produção, troque pelo URL do servidor.
const API_URL = 'http://localhost:3000';

// ── TOKEN ────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('admin_token');
}

function saveToken(token) {
  localStorage.setItem('admin_token', token);
}

function removeToken() {
  localStorage.removeItem('admin_token');
}

function isLoggedIn() {
  const token = getToken();
  if (!token) return false;

  // Verifica expiração decodificando o payload do JWT
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// ── LOGIN ─────────────────────────────────────────────────────────

async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Erro ao fazer login.');

  saveToken(data.token);
  return data;
}

function logout() {
  removeToken();
  closeAdmin();
  showToast('Sessão encerrada.');
}

// ── API DE PRODUTOS ───────────────────────────────────────────────

async function fetchProducts() {
  const res = await fetch(`${API_URL}/products`);
  const data = await res.json();
  if (!res.ok) throw new Error('Erro ao carregar produtos.');
  return data.data;
}

async function createProduct(productData) {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(productData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao criar produto.');
  return data.data;
}

async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao remover produto.');
  return data;
}
