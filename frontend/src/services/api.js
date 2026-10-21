const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const TOKEN_KEY = 'sce_access_token';
const LEGACY_TOKEN_KEY = 'sce_estoquista_access_token';
const MASTER_BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');
const ITEMS_CACHE_TTL = 60_000;
let itemsCache = null;
let itemsRequest = null;
let itemsCacheVersion = 0;
const productImagesCache = new Map();

function invalidateItemsCache() {
  itemsCacheVersion += 1;
  itemsCache = null;
  itemsRequest = null;
  productImagesCache.forEach((imageRequest) => {
    imageRequest.then((url) => {
      if (url) URL.revokeObjectURL(url);
    }).catch(() => {});
  });
  productImagesCache.clear();
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}

async function request(path, options = {}) {
  const { body, headers = {}, ...requestOptions } = options;
  const token = getToken();
  const requestHeaders = { Accept: 'application/json', ...headers };

  if (body !== undefined && !(body instanceof FormData) && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }
  if (token) requestHeaders.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    body: body instanceof FormData || typeof body === 'string'
      ? body
      : body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') || '';
  const responseBody = response.status === 204
    ? null
    : contentType.includes('application/json')
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    if (token && response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      if (window.location.pathname !== `${MASTER_BASE_PATH}/login`) {
        window.location.assign(`${MASTER_BASE_PATH}/login?expired=1`);
      }
    }
    const detail = typeof responseBody === 'object' && responseBody?.detail
      ? responseBody.detail
      : responseBody || `HTTP ${response.status}`;
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }

  return responseBody;
}

function normalizeProduct(product, stockOverride, unitName, categoryName) {
  const stock = stockOverride || product.estoque || product.estoques?.[0] || {};
  const unit = stock.unidade || product.unidade || {};
  return {
    ...product,
    id: product.id,
    categoria_id: product.categoria_id,
    categoria_nome: categoryName || '',
    item: product.nome,
    name: product.nome,
    codigo: String(product.codigo_barra ?? ''),
    code: product.codigo_barra,
    descricao: product.descricao,
    quantidade: Number(stock.qtd ?? product.qtd ?? 0),
    reserva: Number(stock.qtd_minima ?? stock.qtd_reservada ?? product.qtd_minima ?? product.qtd_reservada ?? 0),
    stock: Number(stock.qtd ?? product.qtd ?? 0),
    badgeValue: Number(stock.qtd_minima ?? stock.qtd_reservada ?? product.qtd_minima ?? product.qtd_reservada ?? 0),
    unidade: unitName || unit.nome || stock.localidade || product.localidade || '',
    location: unitName || unit.nome || stock.localidade || product.localidade || '',
    estoque_id: stock.id,
    is_ativo: stock.is_ativo !== false,
  };
}

async function getProductImageUrl(id) {
  if (productImagesCache.has(id)) return productImagesCache.get(id);
  const imageRequest = fetchProductImageUrl(id).catch((error) => {
    if (productImagesCache.get(id) === imageRequest) productImagesCache.delete(id);
    throw error;
  });
  productImagesCache.set(id, imageRequest);
  return imageRequest;
}

async function fetchProductImageUrl(id) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/produtos/${id}/imagem`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Não foi possível carregar a imagem do produto (${response.status}).`);
  }
  return URL.createObjectURL(await response.blob());
}

async function normalizeProductWithImage(product, stock, unitName, categoryName) {
  const normalized = normalizeProduct(product, stock, unitName, categoryName);
  try {
    normalized.image = await getProductImageUrl(product.id);
  } catch {
    normalized.image = null;
  }
  return normalized;
}

async function getById(resource, id) {
  return request(`/${resource}/${id}`);
}

async function list(resource) {
  return request(`/${resource}/`);
}

async function loadItems(refresh = false) {
  if (!refresh && itemsCache && itemsCache.expiresAt > Date.now()) {
    return itemsCache.value;
  }
  if (itemsRequest) {
    if (!refresh) return itemsRequest;
    await itemsRequest.catch(() => {});
  }

  const cacheVersion = itemsCacheVersion;
  const requestPromise = (async () => {
    const [products, stocks, units, categories] = await Promise.all([
      list('produtos'),
      list('estoques'),
      list('unidades'),
      list('categoria'),
    ]);
    const unitNames = new Map(units.map((unit) => [Number(unit.id), unit.nome]));
    const categoryNames = new Map(categories.map((category) => [Number(category.id), category.nome]));
    const stocksByProduct = new Map();
    stocks.forEach((stock) => {
      const current = stocksByProduct.get(stock.produto_id) || {
        ...stock,
        qtd: 0,
        qtd_minima: 0,
        localidade: null,
        is_ativo: true,
      };
      current.qtd += Number(stock.qtd || 0);
      current.qtd_minima += Number(stock.qtd_minima || 0);
      current.is_ativo = current.is_ativo && stock.is_ativo !== false;
      if (!current.localidade) current.localidade = stock.localidade;
      stocksByProduct.set(stock.produto_id, current);
    });
    const items = await Promise.all(products.filter((product) => stocksByProduct.has(product.id)).map((product) => {
      const stock = stocksByProduct.get(product.id);
      const unitName = stock ? unitNames.get(Number(stock.unidade_id)) : undefined;
      return normalizeProductWithImage(product, stock, unitName, categoryNames.get(Number(product.categoria_id)));
    }));
    if (cacheVersion === itemsCacheVersion) {
      itemsCache = { value: items, expiresAt: Date.now() + ITEMS_CACHE_TTL };
    }
    return items;
  })();
  itemsRequest = requestPromise;
  try {
    return await requestPromise;
  } finally {
    if (itemsRequest === requestPromise) itemsRequest = null;
  }
}

async function download(path) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    if (token && (response.status === 401 || response.status === 403)) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== `${MASTER_BASE_PATH}/login`) {
        window.location.assign(`${MASTER_BASE_PATH}/login?expired=1`);
      }
    }
    const contentType = response.headers.get('content-type') || '';
    const responseBody = contentType.includes('application/json')
      ? await response.json()
      : await response.text();
    const detail = responseBody?.detail || responseBody || `HTTP ${response.status}`;
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }

  const disposition = response.headers.get('content-disposition') || '';
  const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || 'relatorio_estoque.xlsx';
  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

async function create(resource, data) {
  return request(`/${resource}/`, { method: 'POST', body: data });
}

async function update(resource, id, data) {
  return request(`/${resource}/${id}`, { method: 'PATCH', body: data });
}

async function remove(resource, id) {
  return request(`/${resource}/${id}`, { method: 'DELETE' });
}

export const api = {
  async login(matricula, senha) {
    const form = new URLSearchParams({
      username: matricula,
      password: senha,
      grant_type: 'password',
    });
    const data = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    invalidateItemsCache();
    if (data?.access_token) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    }
    return data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    invalidateItemsCache();
  },

  isAuthenticated() {
    return Boolean(getToken());
  },

  currentUser: () => request('/auth/me'),
  exportarRelatorioExcel: () => download('/exportacoes/todas'),

  solicitarRedefinicaoSenha(email) {
    return request(`/auth/enviar_email_reste_senha/${encodeURIComponent(email)}`);
  },

  confirmarRedefinicaoSenha(jwt, senha) {
    return request(`/auth/confirme_email_reste_senha/${encodeURIComponent(jwt)}`, {
      method: 'POST',
      body: { senha },
    });
  },

  getItems: () => loadItems(),
  refreshItems: () => loadItems(true),
  getItemById: async (id) => normalizeProductWithImage(await getById('produtos', id)),
  getProdutos: () => list('produtos'),
  getProduto: (id) => getById('produtos', id),
  criarProduto: async (data) => { const result = await create('produtos', data); invalidateItemsCache(); return result; },
  atualizarProduto: async (id, data) => { const result = await update('produtos', id, data); invalidateItemsCache(); return result; },
  removerProduto: async (id) => { const result = await remove('produtos', id); invalidateItemsCache(); return result; },
  enviarImagemProduto: (id, arquivo) => {
    const form = new FormData();
    form.append('arquivo', arquivo);
    return request(`/produtos/${id}/imagem`, { method: 'PUT', body: form }).then((result) => {
      invalidateItemsCache();
      return result;
    });
  },
  verImagemProduto: (id) => request(`/produtos/${id}/imagem`),
  removerImagemProduto: async (id) => { const result = await request(`/produtos/${id}/imagem`, { method: 'DELETE' }); invalidateItemsCache(); return result; },

  getCategorias: () => list('categoria'),
  criarCategoria: async (data) => { const result = await create('categoria', data); invalidateItemsCache(); return result; },
  getCategoria: (id) => getById('categoria', id),
  atualizarCategoria: async (id, data) => { const result = await update('categoria', id, data); invalidateItemsCache(); return result; },
  removerCategoria: async (id) => { const result = await remove('categoria', id); invalidateItemsCache(); return result; },

  getContratos: () => list('contratos'),
  criarContrato: (data) => create('contratos', data),
  getContrato: (id) => getById('contratos', id),
  atualizarContrato: (id, data) => update('contratos', id, data),
  removerContrato: (id) => remove('contratos', id),

  getEstoques: () => list('estoques'),
  getItensExcluidos: () => request('/estoques/excluidos'),
  criarEstoque: async (data) => { const result = await create('estoques', data); invalidateItemsCache(); return result; },
  getEstoque: (id) => getById('estoques', id),
  atualizarEstoque: async (id, data) => { const result = await update('estoques', id, data); invalidateItemsCache(); return result; },
  removerEstoque: async (id) => { const result = await remove('estoques', id); invalidateItemsCache(); return result; },

  getFornecedores: () => list('fornecedors'),
  criarFornecedor: (data) => create('fornecedors', data),
  getFornecedor: (id) => getById('fornecedors', id),
  atualizarFornecedor: (id, data) => update('fornecedors', id, data),
  removerFornecedor: (id) => remove('fornecedors', id),

  getRegistros: () => list('registros'),
  criarRegistro: (data) => create('registros', data),
  getRegistro: (id) => getById('registros', id),
  atualizarRegistro: (id, data) => update('registros', id, data),
  removerRegistro: (id) => remove('registros', id),

  getSolicitacoes: () => list('solicitacaos'),
  getSolicitacao: (id) => getById('solicitacaos', id),
  createSolicitacao: (data) => create('solicitacaos', data),
  createSolicitacoes: (data) => request('/solicitacaos/lote', { method: 'POST', body: data }),
  recusarSolicitacaoMaster: (id, data) => request(`/solicitacaos/master/${id}/recusar`, { method: 'PATCH', body: data }),
  atualizarSolicitacao: (id, data) => update('solicitacaos', id, data),
  removerSolicitacao: (id) => remove('solicitacaos', id),

  async getGerenciarSolicitacoes() {
    const solicitacoes = await list('solicitacaos');
    return solicitacoes.filter(({ solicitacao }) => ['EmAndamento', 'Separada'].includes(solicitacao?.tipo));
  },

  async getHistoricoSolicitacoes() {
    const solicitacoes = await list('solicitacaos');
    return solicitacoes.filter(({ solicitacao }) => ['Concluida', 'Retirada', 'Cancelada'].includes(solicitacao?.tipo));
  },

  recusarSolicitacao: (id, obsPad, motivo) => api.recusarSolicitacaoMaster(id, {
    obs_pad: obsPad,
    obs_recusa: motivo,
  }),

  getUnidades: () => list('unidades'),
  criarUnidade: async (data) => { const result = await create('unidades', data); invalidateItemsCache(); return result; },
  getUnidade: (id) => getById('unidades', id),
  atualizarUnidade: async (id, data) => { const result = await update('unidades', id, data); invalidateItemsCache(); return result; },
  removerUnidade: async (id) => { const result = await remove('unidades', id); invalidateItemsCache(); return result; },

  getUsers: () => list('users'),
  criarUser: (data) => create('users', data),
  getUser: (id) => getById('users', id),
  atualizarUser: (id, data) => update('users', id, data),
  removerUser: (id) => remove('users', id),
};

export { API_BASE_URL };
