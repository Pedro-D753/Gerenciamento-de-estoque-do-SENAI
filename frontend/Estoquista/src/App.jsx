import { useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { Copy, FileText, History, LayoutDashboard, Menu, Package, ScanLine } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BrowserMultiFormatReader } from '@zxing/browser';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function loginUrl() {
  if (window.location.port === '5174') {
    return `${window.location.protocol}//${window.location.hostname}:5173/login`;
  }
  return '/login';
}

function masterUrl() {
  if (window.location.port === '5174') {
    return `${window.location.protocol}//${window.location.hostname}:5173/master/`;
  }
  return '/master/';
}

function validateImageFile(file) {
  if (!file) return Promise.resolve('');
  if (!IMAGE_TYPES.includes(file.type)) {
    return Promise.resolve('Selecione uma foto JPG, PNG ou WEBP.');
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return Promise.resolve('A foto deve ter no máximo 5 MB.');
  }
  return new Promise((resolve) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (!image.naturalWidth || !image.naturalHeight) {
        resolve('Não foi possível ler as dimensões da foto.');
        return;
      }
      resolve('');
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve('O arquivo selecionado não é uma foto válida.');
    };
    image.src = objectUrl;
  });
}

function Layout({ page, setPage, logout, unit, children }) {
  const [expanded, setExpanded] = useState(false);
  const activePage = page === 'new-product' ? 'products' : page;
  const linkClass = (key) => `sidebar-link ${activePage === key ? 'active' : ''}`;
  return <div className="app">
    <header><img src="/estoquista/Senai.png" alt="SENAI" /><button className="link-button" onClick={logout}>Sair</button><div className="header-accent" /></header>
    <div className="body">
      <aside className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-links">
          <button
            onClick={() => setExpanded((value) => !value)}
            title={expanded ? 'Recolher menu' : 'Expandir menu'}
            className={`menu-toggle ${expanded ? 'expanded' : ''}`}
          >
            <Menu />
            {expanded && <span>Menu</span>}
          </button>
          <div className="sidebar-divider" />
          <button onClick={() => setPage('dashboard')} title="Visão Geral" className={linkClass('dashboard')}>
            <LayoutDashboard />
            {expanded && <span>Visão Geral</span>}
          </button>
          <button onClick={() => setPage('products')} title="Cadastro" className={linkClass('products')}>
            <Package />
            {expanded && <span>Cadastro</span>}
          </button>
          <button onClick={() => setPage('requests')} title="Solicitações" className={linkClass('requests')}>
            <FileText />
            {expanded && <span>Solicitações</span>}
          </button>
          <button onClick={() => setPage('history')} title="Histórico" className={linkClass('history')}>
            <History />
            {expanded && <span>Histórico</span>}
          </button>
        </div>
        <a href="/master/Manual_Estoquista.pdf" download title="Baixar manual do Estoquista" className="sidebar-link manual-link">
          <FileText />
          {expanded && <span>Manual do Usuário</span>}
        </a>
        <div className="unit-badge" title={unit ? `Unidade: ${unit.nome}` : 'Unidade não identificada'}>
          <span>Unidade</span>
          <strong>{unit?.nome || 'Não identificada'}</strong>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  </div>;
}

function Dashboard({ setPage }) {
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    async function loadProducts(refresh = false) {
      try {
        const data = refresh
          ? await api.refreshProductsForCurrentUnit()
          : await api.productsForCurrentUnit();
        if (active) setProducts(data);
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    }
    loadProducts();
    api.requests()
      .then((data) => { if (active) setRequests(data); })
      .catch((requestError) => { if (active) setError(requestError.message); });
    const refreshInterval = window.setInterval(() => loadProducts(true), 60_000);
    return () => {
      active = false;
      window.clearInterval(refreshInterval);
    };
  }, []);
  const low = products.filter(item => Number(item.qtd) <= Number(item.qtd_minima));
  const pendingRequests = requests
    .filter(item => ['EmAndamento', 'Separada'].includes(item.tipo))
    .sort((first, second) => {
      const firstDate = new Date(first.dt_solicitacao || first.dt_acao || 0).getTime();
      const secondDate = new Date(second.dt_solicitacao || second.dt_acao || 0).getTime();
      return secondDate - firstDate || Number(second.id) - Number(first.id);
    });
  const recentRequests = pendingRequests.slice(0, 3);
  return <section><div className="title-row"><div><h1>Dashboard de Desempenho</h1></div><button onClick={() => setPage('products')}>Cadastrar item</button></div>{error && <div className="error">{error}</div>}
    <div className="stats"><article><b>{products.length}</b><span>Produtos cadastrados</span></article><article><b>{pendingRequests.length}</b><span>Solicitações pendentes</span></article><article><b>{low.length}</b><span>Itens em nível crítico</span></article></div>
    <div className="panel"><h2>Solicitações recentes</h2>{recentRequests.length ? recentRequests.slice(0, 3).map(item => <div className="request" key={item.id}>
      <div><strong>#{item.id} · {item.produto_nome || `Estoque #${item.estoque_id}`}</strong><span>{item.solicitante || 'Solicitante não informado'} · {item.qtd_acao} un. · {item.unidade_nome || 'Unidade não informada'}</span><small>{item.obs_solicita || 'Sem observação'}</small></div>
      <b className={item.tipo}>{item.tipo === 'Separada' ? 'Separada no estoque' : 'Em andamento'}</b>
    </div>) : <p>Nenhuma solicitação em andamento.</p>}</div>
    <div className="panel"><h2>Atenção necessária</h2>{low.length ? low.map(item => <div className="list-row" key={item.id}><span>{item.nome}</span><strong>{item.qtd} disponíveis / mínimo {item.qtd_minima}</strong></div>) : <p>Nenhum item está no nível mínimo ou abaixo dele.</p>}</div>
  </section>;
}

function Products({ setPage }) {
  const [items, setItems] = useState([]); const [query, setQuery] = useState(''); const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  async function load() {
    try {
      setItems(await api.productsForCurrentUnit());
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    let active = true;
    api.productsForCurrentUnit().then(data => { if (active) setItems(data); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);
  async function remove(id) { if (!window.confirm('Excluir este produto?')) return; try { await api.deleteProduct(id); await load(); } catch (e) { setError(e.message); } }
  const filtered = items.filter(item => `${item.nome} ${item.codigo} ${item.unidade}`.toLowerCase().includes(query.toLowerCase()));
  if (editingItem) {
    return <EditProduct
      item={editingItem}
      onCancel={() => setEditingItem(null)}
      onSaved={async () => { setEditingItem(null); await load(); }}
    />;
  }
  return <section><div className="title-row"><div><span className="eyebrow">Estoquista</span><h1>Cadastro de itens</h1></div><button onClick={() => setPage('new-product')}>Novo item</button></div><input className="search" placeholder="Buscar item, código ou unidade" value={query} onChange={e => setQuery(e.target.value)} />{error && <div className="error">{error}</div>}
    <div className="table-wrap"><table><thead><tr><th>Imagem</th><th>ID</th><th>Código U.F.</th><th>Item</th><th>Quantidade</th><th>Reserva</th><th>Unidade</th><th>Ações</th></tr></thead><tbody>{filtered.map(item => <tr key={item.id}><td><ProductImage id={item.id} alt={item.nome} /></td><td>{item.id}</td><td>{item.codigo}</td><td>{item.nome}</td><td>{item.qtd}</td><td>{item.reserva}</td><td>{item.unidade}</td><td><div className="actions"><button className="small" onClick={() => setEditingItem(item)}>Editar</button><button className="danger small" onClick={() => remove(item.id)}>Excluir</button></div></td></tr>)}</tbody></table></div>
  </section>;
}

function EditProduct({ item, onCancel, onSaved }) {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome: item.nome || '',
    descricao: item.descricao || '',
    unidade_medida: item.unidade_medida || 'Unidade',
    codigo_barra: item.codigo || '',
    categoria_id: String(item.categoria_id || ''),
    qtd: String(item.qtd ?? 0),
    qtd_minima: String(item.reserva ?? 0),
    preco_unitario: String(item.preco_unitario ?? 0),
    is_ativo: item.is_ativo !== false,
    dt_validade: item.dt_validade ? String(item.dt_validade).slice(0, 10) : '',
  });
  useEffect(() => { api.categories().then(setCategories).catch(e => setError(e.message)); }, []);
  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }
  async function selectImage(event) {
    const file = event.target.files?.[0] || null;
    const validationError = await validateImageFile(file);
    if (validationError) {
      setImageFile(null);
      event.target.value = '';
      setError(validationError);
      return;
    }
    setError('');
    setImageFile(file);
  }
  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api.updateProductWithStock(item.id, {
        ...form,
        codigo_barra: Number(form.codigo_barra),
        categoria_id: Number(form.categoria_id),
        qtd: Number(form.qtd),
        qtd_minima: Number(form.qtd_minima),
        preco_unitario: Number(form.preco_unitario),
        dt_validade: form.dt_validade || null,
      });
      if (imageFile) await api.uploadProductImage(item.id, imageFile);
      setSuccess('Item atualizado com sucesso.');
      await onSaved();
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível atualizar o item.');
    } finally {
      setSaving(false);
    }
  }
  return <section>
    <span className="eyebrow">Estoquista</span>
    <h1>Editar item</h1>
    <form className="panel form-grid" onSubmit={submit}>
      <label>Nome do item<input name="nome" value={form.nome} onChange={change} required /></label>
      <label>Descrição<input name="descricao" value={form.descricao} onChange={change} /></label>
      <label>Unidade de medida<input name="unidade_medida" value={form.unidade_medida} onChange={change} required /></label>
      <label>Quantidade nesta unidade<input name="qtd" type="number" min="0" value={form.qtd} onChange={change} required /></label>
      <label>Quantidade mínima<input name="qtd_minima" type="number" min="0" value={form.qtd_minima} onChange={change} required /></label>
      <label>Preço unitário<input name="preco_unitario" type="number" min="0" step="0.01" value={form.preco_unitario} onChange={change} required /></label>
      <label>Código de barras<input name="codigo_barra" value={form.codigo_barra} onChange={change} inputMode="numeric" required /></label>
      <label>Categoria<select name="categoria_id" value={form.categoria_id} onChange={change} required><option value="">Selecione</option>{categories.map(category => <option key={category.id} value={category.id}>{category.nome}</option>)}</select></label>
      <label>Data de validade<input name="dt_validade" type="date" value={form.dt_validade} onChange={change} /></label>
      <label className="image-upload-field">Imagem do produto<input className="image-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} /><span className="image-upload-button">Escolher foto</span><span className="image-file-name">{imageFile ? imageFile.name : 'Manter imagem atual'}</span><small className="image-upload-help">JPG, PNG ou WEBP · até 5 MB</small>{imageFile && <UploadPreview file={imageFile} />}</label>
      <label className="flex-row-label"><input name="is_ativo" type="checkbox" checked={form.is_ativo} onChange={change} /> Item ativo</label>
      {error && <div role="alert" className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>Cancelar</button><button disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</button></div>
    </form>
  </section>;
}

function ProductImage({ id, alt }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let active = true;
    api.productImage(id).then((url) => {
      if (active) setSrc(url);
    }).catch(() => {
      if (active) setSrc('');
    });
    return () => {
      active = false;
    };
  }, [id]);
  return src ? <img className="product-thumb" src={src} alt={alt} /> : <span className="product-thumb-placeholder">—</span>;
}

function UploadPreview({ file }) {
  const [src, setSrc] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setSrc(reader.result);
    };
    reader.onerror = () => setError('Não foi possível pré-visualizar esta imagem.');
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);
  if (error) return <span role="alert" className="image-file-name">{error}</span>;
  return src ? <img className="upload-preview" src={src} alt="Prévia da imagem selecionada" /> : null;
}

function Requests({ history = false }) {
  const [items, setItems] = useState([]); const [error, setError] = useState('');
  const [rejectingItem, setRejectingItem] = useState(null);
  const [padNote, setPadNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [saving, setSaving] = useState(false);
  async function load() {
    try {
      const data = await api.requests();
      setItems(data.filter(item => history
        ? ['Concluida', 'Retirada', 'Cancelada'].includes(item.tipo)
        : ['EmAndamento', 'Separada'].includes(item.tipo)));
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  useEffect(() => {
    let active = true;
    api.requests().then(data => {
      if (active) setItems(data.filter(item => history
        ? ['Concluida', 'Retirada', 'Cancelada'].includes(item.tipo)
        : ['EmAndamento', 'Separada'].includes(item.tipo)));
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [history]);
  async function update(id, action) {
    setError('');
    try {
      if (action === 'separate') await api.separateRequest(id);
      if (action === 'withdraw') await api.withdrawRequest(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  async function reject(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.refuseRequest(rejectingItem.id, {
        obs_pad: padNote.trim(),
        obs_recusa: rejectReason.trim(),
      });
      setRejectingItem(null);
      setPadNote('');
      setRejectReason('');
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }
  return <section>
    <span className="eyebrow">Estoquista</span><h1>{history ? 'Histórico de solicitações' : 'Gerenciar solicitações'}</h1>
    {error && <div role="alert" className="error">{error}</div>}
    <div className="panel">{items.length ? items.map(item => {
      const insufficientStock = item.tipo === 'EmAndamento' && Number(item.qtd_acao) > Number(item.estoque_qtd ?? 0);
      return <div className="request" key={item.id}>
        <div>
          <strong>Solicitação #{item.id} · {item.produto_nome || `Estoque #${item.estoque_id}`}</strong>
          <span>{item.solicitante || 'Solicitante não informado'} · Quantidade: {item.qtd_acao} · {item.unidade_nome || 'Unidade não informada'}</span>
          <small>{item.obs_solicita || 'Sem observação'}</small>
          {!history && item.tipo === 'EmAndamento' && <small className={insufficientStock ? 'text-red-700' : ''}>Disponível no estoque: {item.estoque_qtd ?? 0}{insufficientStock ? ' — quantidade insuficiente para separar' : ''}</small>}
          {item.obs_pad && <small><strong>Observação (PAD):</strong> {item.obs_pad}</small>}
          {item.obs_recusa && <small><strong>Motivo da recusa:</strong> {item.obs_recusa}</small>}
          {item.dt_retirada && <small>Retirado em: {new Date(item.dt_retirada).toLocaleString('pt-BR')}</small>}
        </div>
        {!history && <div className="actions">
          {item.tipo === 'EmAndamento' && <>
            <button disabled={insufficientStock} title={insufficientStock ? 'Estoque insuficiente para separar' : ''} onClick={() => update(item.id, 'separate')}>Separado no estoque</button>
            <button className="danger" onClick={() => { setRejectingItem(item); setPadNote(''); setRejectReason(''); }}>Recusar</button>
          </>}
          {item.tipo === 'Separada' && <button onClick={() => update(item.id, 'withdraw')}>Retirado do estoque</button>}
        </div>}
        <b className={item.tipo}>{item.tipo}</b>
      </div>;
    }) : <p>Nenhuma solicitação encontrada.</p>}</div>
    {rejectingItem && (
      <div className="request-modal-backdrop">
        <form className="panel request-modal" onSubmit={reject} role="dialog" aria-modal="true" aria-labelledby="stockist-reject-title">
          <h2 id="stockist-reject-title">Recusar solicitação #{rejectingItem.id}</h2>
          <label>Observação (PAD)<textarea value={padNote} onChange={event => setPadNote(event.target.value)} maxLength={2000} required /></label>
          <label>Motivo da recusa<textarea value={rejectReason} onChange={event => setRejectReason(event.target.value)} maxLength={2000} required /></label>
          <div className="actions">
            <button type="button" className="secondary" onClick={() => setRejectingItem(null)}>Cancelar</button>
            <button type="submit" className="danger" disabled={saving || !padNote.trim() || !rejectReason.trim()}>{saving ? 'Recusando...' : 'Confirmar recusa'}</button>
          </div>
        </form>
      </div>
    )}
  </section>;
}

function NewProduct({ setPage }) {
  const [categories, setCategories] = useState([]); const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [scannerLink, setScannerLink] = useState('');
  const [scannerSession, setScannerSession] = useState('');
  const [form, setForm] = useState({ nome: '', descricao: '', unidade_medida: 'Unidade', codigo_barra: '', categoria_id: '', qtd: '0', qtd_minima: '0', preco_unitario: '0' });
  useEffect(() => { api.categories().then(setCategories).catch(e => setError(e.message)); }, []);
  useEffect(() => {
    if (!scannerSession) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const result = await api.barcodeSession(scannerSession);
        if (!active) return;
        if (result.status === 'completed') {
          setForm((current) => ({ ...current, codigo_barra: result.value }));
          setScannerLink('');
          setScannerSession('');
          return;
        }
        setTimeout(poll, 1500);
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    };
    poll();
    return () => { active = false; };
  }, [scannerSession]);
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function selectImage(event) {
    const file = event.target.files?.[0] || null;
    const validationError = await validateImageFile(file);
    if (validationError) {
      setImageFile(null);
      event.target.value = '';
      setError(validationError);
      return;
    }
    setError('');
    setImageFile(file);
  }
  async function openScanner() {
    try {
      setError('');
      const session = await api.createBarcodeSession();
      const publicAppUrl = (import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin).replace(/\/+$/, '');
      const link = `${publicAppUrl}${import.meta.env.BASE_URL}scanner?session=${encodeURIComponent(session.session_id)}`;
      setScannerSession(session.session_id);
      setScannerLink(link);
      if (/\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(publicAppUrl)) {
        setError('O QR Code foi gerado, mas o celular precisa acessar o computador por um endereço da rede. Defina VITE_PUBLIC_APP_URL com o IP do computador, por exemplo http://192.168.0.10:5174.');
      }
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível gerar o QR Code da câmera.');
    }
  }
  async function copyScannerLink() {
    await navigator.clipboard.writeText(scannerLink);
  }
  async function submit(event) {
    event.preventDefault(); setError(''); setSuccess(''); setSaving(true);
    try {
      if (!form.codigo_barra.trim()) throw new Error('Informe ou leia o código de barras.');
      if (!form.categoria_id) throw new Error('Selecione uma categoria.');
      const created = await api.createProductWithStock({
        ...form,
        codigo_barra: Number(form.codigo_barra),
        categoria_id: Number(form.categoria_id),
        qtd: Number(form.qtd),
        qtd_minima: Number(form.qtd_minima),
        preco_unitario: Number(form.preco_unitario),
      });
      if (imageFile) {
        const productId = created?.id;
        if (!productId) throw new Error('Produto criado, mas não foi possível identificar o ID para enviar a imagem.');
        await api.uploadProductImage(productId, imageFile);
      }
      setSuccess(imageFile ? 'Produto e imagem cadastrados com sucesso.' : 'Produto cadastrado com sucesso.');
      setForm({ nome: '', descricao: '', unidade_medida: 'Unidade', codigo_barra: '', categoria_id: '', qtd: '0', qtd_minima: '0', preco_unitario: '0' });
      setImageFile(null);
      event.target.reset();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }
  return <section><span className="eyebrow">Estoquista</span><h1>Novo item</h1><form className="panel form-grid" onSubmit={submit}>{[['nome', 'Nome do item'], ['descricao', 'Descrição'], ['unidade_medida', 'Unidade de medida']].map(([name, label]) => <label key={name}>{label}<input name={name} value={form[name]} onChange={change} required /></label>)}<label>Quantidade nesta unidade<input name="qtd" type="number" min="0" value={form.qtd} onChange={change} required /></label><label>Quantidade mínima<input name="qtd_minima" type="number" min="0" value={form.qtd_minima} onChange={change} required /></label><label>Preço unitário<input name="preco_unitario" type="number" min="0" step="0.01" value={form.preco_unitario} onChange={change} required /></label><label>Código de barras<div className="barcode-field"><input name="codigo_barra" value={form.codigo_barra} onChange={change} inputMode="numeric" required /><button type="button" className="scan-button" onClick={openScanner}><ScanLine size={18} /> Ler com câmera</button></div>{scannerLink && <div className="scanner-link-box"><span>Leia este QR Code com o celular. Ele abrirá a câmera:</span><QRCodeSVG value={scannerLink} size={180} level="M" /><code>{scannerLink}</code><button type="button" className="copy-link-button" onClick={copyScannerLink}><Copy size={15} /> Copiar link</button><small>O código lido será enviado automaticamente por esta sessão.</small></div>}</label><label className="image-upload-field">Imagem do produto<input className="image-file-input" name="imagem" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} /><span className="image-upload-button">Escolher foto</span><span className="image-file-name">{imageFile ? imageFile.name : 'Nenhuma foto selecionada'}</span><small className="image-upload-help">JPG, PNG ou WEBP · até 5 MB</small>{imageFile && <UploadPreview key={`${imageFile.name}-${imageFile.size}-${imageFile.lastModified}`} file={imageFile} />}</label><label>Categoria<select name="categoria_id" value={form.categoria_id} onChange={change} required><option value="">Selecione</option>{categories.map(category => <option key={category.id} value={category.id}>{category.nome}</option>)}</select></label><div className="form-actions"><button type="button" className="secondary" onClick={() => setPage('products')}>Cancelar</button><button disabled={saving}>{saving ? 'Salvando...' : 'Salvar item'}</button></div>{error && <div className="error">{error}</div>}{success && <div className="success">{success}</div>}</form></section>;
}

function BarcodeScanner() {
  const videoRef = useRef(null);
  const completedRef = useRef(false);
  const [error, setError] = useState('');
  const sessionId = new URLSearchParams(window.location.search).get('session');
  useEffect(() => {
    let reader;
    let controls;
    async function start() {
      try {
        const videoElement = videoRef.current;
        if (!videoElement) return;
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('A câmera só funciona em uma conexão segura (HTTPS) ou em localhost.');
        }
        reader = new BrowserMultiFormatReader();
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoElement,
          async (result, scanError) => {
            if (!result || scanError || completedRef.current) return;
            const value = result.getText();
            completedRef.current = true;
            try {
              await api.submitBarcode(sessionId, value);
              setError('Código enviado para o computador. Você pode fechar esta página.');
              controls?.stop();
            } catch (requestError) {
              completedRef.current = false;
              setError(requestError.message || 'Não foi possível enviar o código.');
            }
          },
        );
      } catch (requestError) {
        setError(requestError.message || 'Não foi possível acessar a câmera. Verifique a permissão do navegador.');
      }
    }
    start();
    return () => {
      controls?.stop();
      reader?.reset();
    };
  }, [sessionId]);
  return <main className="scanner-page"><div className="scanner-card"><span className="eyebrow">Leitor de código de barras</span><h1>Aponte a câmera para o código</h1>{sessionId ? <><video ref={videoRef} className="scanner-video" autoPlay muted playsInline /><p className="scanner-help">Permita o acesso à câmera. Ao ler o código, ele será enviado automaticamente para o cadastro.</p></> : <p className="error">Link de sessão inválido.</p>}{error && <p className="error">{error}</p>}</div></main>;
}

function AuthenticatedApp() {
  const [authenticated, setAuthenticated] = useState(api.authenticated()); const [page, setPage] = useState('dashboard');
  const [unit, setUnit] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  useEffect(() => {
    if (!authenticated) return undefined;
    let active = true;
    api.currentUser().then((user) => {
      if (window.location.pathname === '/login' || window.location.pathname === '/login/') {
        window.location.assign(user.is_admin ? masterUrl() : '/estoquista/');
        return;
      }
      if (active) setUnit(user.unidade);
    }).catch(() => {
      if (active) setUnit(null);
    }).finally(() => {
      if (active) setUserLoaded(true);
    });
    return () => { active = false; };
  }, [authenticated]);
  if (!authenticated) {
    window.location.assign(loginUrl());
    return null;
  }
  if (!userLoaded) return <main className="loading-page">Carregando sua unidade...</main>;
  const content = page === 'dashboard' ? <Dashboard setPage={setPage} /> : page === 'products' ? <Products setPage={setPage} /> : page === 'new-product' ? <NewProduct setPage={setPage} /> : page === 'requests' ? <Requests /> : <Requests history />;
  return <Layout page={page} setPage={setPage} unit={unit} logout={() => { api.logout(); setUnit(null); setUserLoaded(false); setAuthenticated(false); }}>{content}</Layout>;
}

export default function App() {
  return window.location.pathname === `${import.meta.env.BASE_URL.replace(/\/$/, '')}/scanner`
    ? <BarcodeScanner />
    : <AuthenticatedApp />;
}
