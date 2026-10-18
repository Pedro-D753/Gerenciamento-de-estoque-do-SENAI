const BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
const TOKEN_KEY = 'sce_estoquista_access_token';

async function request(path, options = {}) {
  const { body, headers = {}, ...rest } = options;
  const requestHeaders = { Accept: 'application/json', ...headers };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) requestHeaders.Authorization = `Bearer ${token}`;
  if (body !== undefined && !(body instanceof FormData) && !requestHeaders['Content-Type']) requestHeaders['Content-Type'] = 'application/json';
  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body instanceof FormData || typeof body === 'string' ? body : body === undefined ? undefined : JSON.stringify(body),
  });
  const contentType = response.headers.get('content-type') || '';
  const result = response.status === 204 ? null : contentType.includes('json') ? await response.json() : await response.text();
  if (!response.ok) {
    if (token && (response.status === 401 || response.status === 403)) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login?expired=1');
      }
    }
    throw new Error(result?.detail || result || `HTTP ${response.status}`);
  }
  return result;
}

async function upload(path, file) {
  const form = new FormData();
  form.append('arquivo', file);
  return request(path, { method: 'PUT', body: form });
}

async function imageBlob(id) {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${BASE_URL}/produtos/${id}/imagem`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(`Não foi possível carregar a imagem (${response.status}).`);
  return URL.createObjectURL(await response.blob());
}

function product(item, selectedStock) {
  const stock = selectedStock || item.estoque || item.estoques?.[0] || {};
  const unit = stock.unidade || item.unidade || {};
  return {
    ...item,
    nome: item.nome || 'Sem nome',
    codigo: String(item.codigo_barra ?? ''),
    qtd: stock.qtd ?? item.qtd ?? 0,
    reserva: stock.qtd_reservada ?? item.qtd_reservada ?? 0,
    unidade: unit.nome || stock.localidade || item.localidade || 'Não informado',
    estoque_id: stock.id,
  };
}

export const api = {
  async login(matricula, senha) {
    const form = new URLSearchParams({ username: matricula, password: senha, grant_type: 'password' });
    const result = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    localStorage.setItem(TOKEN_KEY, result.access_token);
    return result;
  },
  logout() { localStorage.removeItem(TOKEN_KEY); },
  authenticated() { return Boolean(localStorage.getItem(TOKEN_KEY)); },
  products: async () => (await request('/produtos/')).map(product),
  productsForCurrentUnit: async () => {
    const [items, stocks] = await Promise.all([request('/produtos/'), request('/estoques/minha-unidade')]);
    const byProduct = new Map(items.map((item) => [item.id, item]));
    return stocks
      .map((stock) => byProduct.has(stock.produto_id) ? product(byProduct.get(stock.produto_id), stock) : null)
      .filter(Boolean);
  },
  currentUser: () => request('/auth/me'),
  stocksForCurrentUnit: () => request('/estoques/minha-unidade'),
  product: async (id) => product(await request(`/produtos/${id}`)),
  createProduct: (data) => request('/produtos/', { method: 'POST', body: data }),
  createProductWithStock: (data) => request('/produtos/com-estoque', { method: 'POST', body: data }),
  uploadProductImage: (id, file) => upload(`/produtos/${id}/imagem`, file),
  productImage: imageBlob,
  updateProduct: (id, data) => request(`/produtos/${id}`, { method: 'PATCH', body: data }),
  deleteProduct: (id) => request(`/produtos/${id}`, { method: 'DELETE' }),
  stocks: () => request('/estoques/'),
  requests: () => request('/solicitacaos/'),
  updateRequest: (id, data) => request(`/solicitacaos/${id}`, { method: 'PATCH', body: data }),
  categories: () => request('/categoria/'),
  units: () => request('/unidades/'),
  createBarcodeSession: () => request('/barcode/sessions', { method: 'POST' }),
  barcodeSession: (id) => request(`/barcode/sessions/${encodeURIComponent(id)}`),
  submitBarcode: (id, value) => request(`/barcode/sessions/${encodeURIComponent(id)}/result`, {
    method: 'POST',
    body: { value },
  }),
};
