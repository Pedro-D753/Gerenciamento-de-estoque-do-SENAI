const BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
const TOKEN_KEY = 'sce_estoquista_access_token';
const ESTOQUISTA_BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');
const ITEMS_CACHE_TTL = 60_000;
let unitItemsCache = null;
let unitItemsRequest = null;
let itemsCacheVersion = 0;
const productImagesCache = new Map();

function invalidateItemsCache() {
  itemsCacheVersion += 1;
  unitItemsCache = null;
  unitItemsRequest = null;
  productImagesCache.forEach((imageRequest) => {
    imageRequest.then((url) => {
      if (url) URL.revokeObjectURL(url);
    }).catch(() => {});
  });
  productImagesCache.clear();
}

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
      invalidateItemsCache();
      if (window.location.pathname !== `${ESTOQUISTA_BASE_PATH}/`) {
        window.location.assign(`${ESTOQUISTA_BASE_PATH}/?expired=1`);
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
  if (productImagesCache.has(id)) return productImagesCache.get(id);
  const imageRequest = fetchImageBlob(id).catch((error) => {
    if (productImagesCache.get(id) === imageRequest) productImagesCache.delete(id);
    throw error;
  });
  productImagesCache.set(id, imageRequest);
  return imageRequest;
}

async function fetchImageBlob(id) {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${BASE_URL}/produtos/${id}/imagem`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Não foi possível carregar a imagem (${response.status}).`);
  return URL.createObjectURL(await response.blob());
}

async function loadProductsForCurrentUnit(refresh = false) {
  if (!refresh && unitItemsCache && unitItemsCache.expiresAt > Date.now()) {
    return unitItemsCache.value;
  }
  if (unitItemsRequest) {
    if (!refresh) return unitItemsRequest;
    await unitItemsRequest.catch(() => {});
  }

  const cacheVersion = itemsCacheVersion;
  const requestPromise = (async () => {
    const [items, stocks] = await Promise.all([request('/produtos/'), request('/estoques/minha-unidade')]);
    const byProduct = new Map(items.map((item) => [item.id, item]));
    const products = stocks
      .map((stock) => byProduct.has(stock.produto_id) ? product(byProduct.get(stock.produto_id), stock) : null)
      .filter(Boolean);
    if (cacheVersion === itemsCacheVersion) {
      unitItemsCache = { value: products, expiresAt: Date.now() + ITEMS_CACHE_TTL };
    }
    return products;
  })();
  unitItemsRequest = requestPromise;
  try {
    return await requestPromise;
  } finally {
    if (unitItemsRequest === requestPromise) unitItemsRequest = null;
  }
}

function product(item, selectedStock) {
  const stock = selectedStock || item.estoque || item.estoques?.[0] || {};
  const unit = stock.unidade || item.unidade || {};
  return {
    ...item,
    nome: item.nome || 'Sem nome',
    codigo: String(item.codigo_barra ?? ''),
    qtd: stock.qtd ?? item.qtd ?? 0,
    reserva: stock.qtd_minima ?? item.qtd_minima ?? stock.qtd_reservada ?? item.qtd_reservada ?? 0,
    qtd_minima: Number(stock.qtd_minima ?? item.qtd_minima ?? stock.qtd_reservada ?? item.qtd_reservada ?? 0),
    unidade: unit.nome || stock.localidade || item.localidade || 'Não informado',
    estoque_id: stock.id,
    dt_validade: stock.dt_validade ?? item.dt_validade ?? '',
    is_ativo: stock.is_ativo ?? item.is_ativo ?? true,
  };
}

function normalizeRequest(entry) {
  const solicitacao = entry.solicitacao || entry;
  const estoqueSolicitado = entry.estoque_solicitado || {};
  return {
    ...solicitacao,
    estoque_id: estoqueSolicitado.estoque_id ?? solicitacao.estoque_id,
    produto_nome: estoqueSolicitado.produto_nome ?? solicitacao.produto_nome,
    produto_codigo: estoqueSolicitado.produto_codigo ?? solicitacao.produto_codigo,
    unidade_nome: estoqueSolicitado.unidade_nome ?? solicitacao.unidade_nome,
    estoque_qtd: estoqueSolicitado.estoque_qtd,
    solicitacao,
    estoque_solicitado: estoqueSolicitado,
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
    invalidateItemsCache();
    localStorage.setItem(TOKEN_KEY, result.access_token);
    return result;
  },
  logout() { localStorage.removeItem(TOKEN_KEY); invalidateItemsCache(); },
  authenticated() { return Boolean(localStorage.getItem(TOKEN_KEY)); },
  products: async () => (await request('/produtos/')).map(product),
  productsForCurrentUnit: () => loadProductsForCurrentUnit(),
  refreshProductsForCurrentUnit: () => loadProductsForCurrentUnit(true),
  currentUser: () => request('/auth/me'),
  solicitarRedefinicaoSenha: (email) => request(`/auth/enviar_email_reste_senha/${encodeURIComponent(email)}`),
  stocksForCurrentUnit: () => request('/estoques/minha-unidade'),
  product: async (id) => product(await request(`/produtos/${id}`)),
  createProduct: async (data) => { const result = await request('/produtos/', { method: 'POST', body: data }); invalidateItemsCache(); return result; },
  createProductWithStock: async (data) => { const result = await request('/produtos/com-estoque', { method: 'POST', body: data }); invalidateItemsCache(); return result; },
  updateProductWithStock: async (id, data) => { const result = await request(`/produtos/${id}/estoquista`, { method: 'PATCH', body: data }); invalidateItemsCache(); return result; },
  uploadProductImage: async (id, file) => { const result = await upload(`/produtos/${id}/imagem`, file); invalidateItemsCache(); return result; },
  productImage: imageBlob,
  updateProduct: async (id, data) => { const result = await request(`/produtos/${id}`, { method: 'PATCH', body: data }); invalidateItemsCache(); return result; },
  deleteProduct: async (id) => { const result = await request(`/produtos/${id}`, { method: 'DELETE' }); invalidateItemsCache(); return result; },
  stocks: () => request('/estoques/'),
  requests: async () => (await request('/solicitacaos/')).map(normalizeRequest),
  updateRequest: async (id, data) => {
    const result = await request(`/solicitacaos/${id}`, { method: 'PATCH', body: data });
    invalidateItemsCache();
    return result;
  },
  refuseRequest: (id, data) => request(`/solicitacaos/estoquista/${id}/recusar`, { method: 'PATCH', body: data }),
  separateRequest: async (id) => {
    const result = await request(`/solicitacaos/estoquista/${id}/separar`, { method: 'PATCH' });
    invalidateItemsCache();
    return result;
  },
  withdrawRequest: (id) => request(`/solicitacaos/estoquista/${id}/retirar`, { method: 'PATCH' }),
  categories: () => request('/categoria/'),
  units: () => request('/unidades/'),
  createBarcodeSession: () => request('/barcode/sessions', { method: 'POST' }),
  barcodeSession: (id) => request(`/barcode/sessions/${encodeURIComponent(id)}`),
  submitBarcode: (id, value) => request(`/barcode/sessions/${encodeURIComponent(id)}/result`, {
    method: 'POST',
    body: { value },
  }),
};
