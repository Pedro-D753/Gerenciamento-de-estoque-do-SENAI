const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const TOKEN_KEY = 'sce_access_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
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
    if (token && (response.status === 401 || response.status === 403)) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login?expired=1');
      }
    }
    const detail = typeof responseBody === 'object' && responseBody?.detail
      ? responseBody.detail
      : responseBody || `HTTP ${response.status}`;
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }

  return responseBody;
}

function normalizeProduct(product, stockOverride, unitName) {
  const stock = stockOverride || product.estoque || product.estoques?.[0] || {};
  const unit = stock.unidade || product.unidade || {};
  return {
    ...product,
    id: product.id,
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
  };
}

async function getProductImageUrl(id) {
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

async function normalizeProductWithImage(product, stock, unitName) {
  const normalized = normalizeProduct(product, stock, unitName);
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
    if (data?.access_token) localStorage.setItem(TOKEN_KEY, data.access_token);
    return data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated() {
    return Boolean(getToken());
  },

  solicitarRedefinicaoSenha(email) {
    return request(`/auth/enviar_email_reste_senha/${encodeURIComponent(email)}`);
  },

  confirmarRedefinicaoSenha(jwt, senha) {
    return request(`/auth/confirme_email_reste_senha/${encodeURIComponent(jwt)}`, {
      method: 'POST',
      body: { senha },
    });
  },

  getItems: async () => {
    const [products, stocks, units] = await Promise.all([list('produtos'), list('estoques'), list('unidades')]);
    const unitNames = new Map(units.map((unit) => [Number(unit.id), unit.nome]));
    const stocksByProduct = new Map();
    stocks.forEach((stock) => {
      const current = stocksByProduct.get(stock.produto_id) || {
        ...stock,
        qtd: 0,
        qtd_minima: 0,
        localidade: null,
      };
      current.qtd += Number(stock.qtd || 0);
      current.qtd_minima += Number(stock.qtd_minima || 0);
      if (!current.localidade) current.localidade = stock.localidade;
      stocksByProduct.set(stock.produto_id, current);
    });
    return Promise.all(products.map((product) => {
      const stock = stocksByProduct.get(product.id);
      const unitName = stock ? unitNames.get(Number(stock.unidade_id)) : undefined;
      return normalizeProductWithImage(product, stock, unitName);
    }));
  },
  getItemById: async (id) => normalizeProductWithImage(await getById('produtos', id)),
  getProdutos: () => list('produtos'),
  getProduto: (id) => getById('produtos', id),
  criarProduto: (data) => create('produtos', data),
  atualizarProduto: (id, data) => update('produtos', id, data),
  removerProduto: (id) => remove('produtos', id),
  enviarImagemProduto: (id, arquivo) => {
    const form = new FormData();
    form.append('arquivo', arquivo);
    return request(`/produtos/${id}/imagem`, { method: 'PUT', body: form });
  },
  verImagemProduto: (id) => request(`/produtos/${id}/imagem`),
  removerImagemProduto: (id) => request(`/produtos/${id}/imagem`, { method: 'DELETE' }),

  getCategorias: () => list('categoria'),
  criarCategoria: (data) => create('categoria', data),
  getCategoria: (id) => getById('categoria', id),
  atualizarCategoria: (id, data) => update('categoria', id, data),
  removerCategoria: (id) => remove('categoria', id),

  getContratos: () => list('contratos'),
  criarContrato: (data) => create('contratos', data),
  getContrato: (id) => getById('contratos', id),
  atualizarContrato: (id, data) => update('contratos', id, data),
  removerContrato: (id) => remove('contratos', id),

  getEstoques: () => list('estoques'),
  criarEstoque: (data) => create('estoques', data),
  getEstoque: (id) => getById('estoques', id),
  atualizarEstoque: (id, data) => update('estoques', id, data),
  removerEstoque: (id) => remove('estoques', id),

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
  atualizarSolicitacao: (id, data) => update('solicitacaos', id, data),
  removerSolicitacao: (id) => remove('solicitacaos', id),

  async getGerenciarSolicitacoes() {
    const solicitacoes = await list('solicitacaos');
    return solicitacoes.filter(({ estado }) => estado === 'EmAndamento');
  },

  async getHistoricoSolicitacoes() {
    const solicitacoes = await list('solicitacaos');
    return solicitacoes.filter(({ estado }) => estado === 'Concluida' || estado === 'Cancelada');
  },

  async aprovarSolicitacao(id) {
    const resposta = await getById('solicitacaos', id);
    const solicitacao = resposta.solicitacao || resposta;
    const estoqueSolicitado = resposta.estoque_solicitado || {};
    return update('solicitacaos', id, {
      is_aceito: true,
      obs_solicita: solicitacao.obs_solicita,
      obs_recusa: null,
      tipo: 'Concluida',
      estado: 'Concluida',
      dt_acao: new Date().toISOString(),
      qtd_acao: solicitacao.qtd_acao,
      estoque_id: estoqueSolicitado.estoque_id,
    });
  },

  recusarSolicitacao(id, observacao = null) {
    return update('solicitacaos', id, {
      is_aceito: false,
      obs_recusa: observacao,
      estado: 'Cancelada',
      dt_acao: new Date().toISOString(),
    });
  },

  getUnidades: () => list('unidades'),
  criarUnidade: (data) => create('unidades', data),
  getUnidade: (id) => getById('unidades', id),
  atualizarUnidade: (id, data) => update('unidades', id, data),
  removerUnidade: (id) => remove('unidades', id),

  getUsers: () => list('users'),
  criarUser: (data) => create('users', data),
  getUser: (id) => getById('users', id),
  atualizarUser: (id, data) => update('users', id, data),
  removerUser: (id) => remove('users', id),
};

export { API_BASE_URL };
