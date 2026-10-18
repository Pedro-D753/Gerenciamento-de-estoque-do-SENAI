import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api.js';
import { Copy, FileText, History, LayoutDashboard, Menu, Package, ScanLine } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function Login({ onLogin }) {
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try { await api.login(matricula, senha); onLogin(); }
    catch (requestError) { setError(requestError.message || 'Falha no login.'); }
    finally { setLoading(false); }
  }
  return <main className="login"><form className="card login-card" onSubmit={submit}>
    <img src="/Senai.png" alt="SENAI" />
    <h1>Login de usuário</h1><p>Entre para gerenciar o estoque.</p>
    <label>Matrícula<input value={matricula} onChange={e => setMatricula(e.target.value)} required /></label>
    <label>Senha<input type="password" value={senha} onChange={e => setSenha(e.target.value)} required /></label>
    {error && <div className="error">{error}</div>}
    <button disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
  </form></main>;
}

function Layout({ page, setPage, logout, unit, children }) {
  const [expanded, setExpanded] = useState(false);
  const activePage = page === 'new-product' ? 'products' : page;
  const linkClass = (key) => `sidebar-link ${activePage === key ? 'active' : ''}`;
  return <div className="app">
    <header><img src="/Senai.png" alt="SENAI" /><strong>Estoquista</strong><button className="link-button" onClick={logout}>Sair</button><div className="header-accent" /></header>
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
  useEffect(() => { Promise.all([api.productsForCurrentUnit(), api.requests()]).then(([p, r]) => { setProducts(p); setRequests(r); }).catch(e => setError(e.message)); }, []);
  const low = products.filter(item => item.qtd <= item.reserva);
  return <section><div className="title-row"><div><h1>Dashboard de Desempenho</h1></div><button onClick={() => setPage('products')}>Cadastrar item</button></div>{error && <div className="error">{error}</div>}
    <div className="stats"><article><b>{products.length}</b><span>Produtos cadastrados</span></article><article><b>{requests.filter(r => r.estado === 'EmAndamento').length}</b><span>Solicitações pendentes</span></article><article><b>{low.length}</b><span>Itens em nível crítico</span></article></div>
    <div className="panel"><h2>Atenção necessária</h2>{low.length ? low.map(item => <div className="list-row" key={item.id}><span>{item.nome}</span><strong>{item.qtd} disponíveis</strong></div>) : <p>Nenhum item em nível crítico.</p>}</div>
  </section>;
}

function Products({ setPage }) {
  const [items, setItems] = useState([]); const [query, setQuery] = useState(''); const [error, setError] = useState('');
  async function load() { try { setItems(await api.products()); } catch (e) { setError(e.message); } }
  useEffect(() => {
    let active = true;
    api.productsForCurrentUnit().then(data => { if (active) setItems(data); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);
  async function remove(id) { if (!window.confirm('Excluir este produto?')) return; try { await api.deleteProduct(id); load(); } catch (e) { setError(e.message); } }
  const filtered = items.filter(item => `${item.nome} ${item.codigo} ${item.unidade}`.toLowerCase().includes(query.toLowerCase()));
  return <section><div className="title-row"><div><span className="eyebrow">Estoquista</span><h1>Cadastro de itens</h1></div><button onClick={() => setPage('new-product')}>Novo item</button></div><input className="search" placeholder="Buscar item, código ou unidade" value={query} onChange={e => setQuery(e.target.value)} />{error && <div className="error">{error}</div>}
    <div className="table-wrap"><table><thead><tr><th>Imagem</th><th>ID</th><th>Código U.F.</th><th>Item</th><th>Quantidade</th><th>Reserva</th><th>Unidade</th><th>Ações</th></tr></thead><tbody>{filtered.map(item => <tr key={item.id}><td><ProductImage id={item.id} alt={item.nome} /></td><td>{item.id}</td><td>{item.codigo}</td><td>{item.nome}</td><td>{item.qtd}</td><td>{item.reserva}</td><td>{item.unidade}</td><td><button className="danger small" onClick={() => remove(item.id)}>Excluir</button></td></tr>)}</tbody></table></div>
  </section>;
}

function ProductImage({ id, alt }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let active = true;
    let objectUrl;
    api.productImage(id).then((url) => {
      objectUrl = url;
      if (active) setSrc(url);
    }).catch(() => {
      if (active) setSrc('');
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);
  return src ? <img className="product-thumb" src={src} alt={alt} /> : <span className="product-thumb-placeholder">—</span>;
}

function UploadPreview({ file }) {
  const src = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => {
    return () => URL.revokeObjectURL(src);
  }, [src]);
  return <img className="upload-preview" src={src} alt="Prévia da imagem selecionada" />;
}

function Requests({ history = false }) {
  const [items, setItems] = useState([]); const [error, setError] = useState('');
  async function load() { try { const data = await api.requests(); setItems(data.filter(item => history ? ['Concluida', 'Cancelada'].includes(item.estado) : item.estado === 'EmAndamento')); } catch (e) { setError(e.message); } }
  useEffect(() => {
    let active = true;
    api.requests().then(data => {
      if (active) setItems(data.filter(item => history ? ['Concluida', 'Cancelada'].includes(item.estado) : item.estado === 'EmAndamento'));
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [history]);
  async function update(id, accepted) { try { await api.updateRequest(id, { is_aceito: accepted, estado: accepted ? 'Concluida' : 'Cancelada', dt_acao: new Date().toISOString() }); load(); } catch (e) { setError(e.message); } }
  return <section><span className="eyebrow">Estoquista</span><h1>{history ? 'Histórico de solicitações' : 'Gerenciar solicitações'}</h1>{error && <div className="error">{error}</div>}<div className="panel">{items.length ? items.map(item => <div className="request" key={item.id}><div><strong>Solicitação #{item.id}</strong><span>Estoque #{item.estoque_id} · Quantidade: {item.qtd_acao}</span><small>{item.obs_solicita || 'Sem observação'}</small></div>{!history && <div className="actions"><button onClick={() => update(item.id, true)}>Aprovar</button><button className="danger" onClick={() => update(item.id, false)}>Recusar</button></div>}<b className={item.estado}>{item.estado}</b></div>) : <p>Nenhuma solicitação encontrada.</p>}</div></section>;
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
  async function openScanner() {
    try {
      const session = await api.createBarcodeSession();
      const publicAppUrl = (import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin).replace(/\/+$/, '');
      const link = `${publicAppUrl}/scanner?session=${encodeURIComponent(session.session_id)}`;
      setScannerSession(session.session_id);
      setScannerLink(link);
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível iniciar a sessão de leitura.');
    }
  }
  async function copyScannerLink() {
    await navigator.clipboard.writeText(scannerLink);
  }
  async function submit(event) {
    event.preventDefault(); setError(''); setSuccess(''); setSaving(true);
    try {
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
  return <section><span className="eyebrow">Estoquista</span><h1>Novo item</h1><form className="panel form-grid" onSubmit={submit}>{[['nome', 'Nome do item'], ['descricao', 'Descrição'], ['unidade_medida', 'Unidade de medida']].map(([name, label]) => <label key={name}>{label}<input name={name} value={form[name]} onChange={change} required /></label>)}<label>Quantidade nesta unidade<input name="qtd" type="number" min="0" value={form.qtd} onChange={change} required /></label><label>Quantidade mínima<input name="qtd_minima" type="number" min="0" value={form.qtd_minima} onChange={change} required /></label><label>Preço unitário<input name="preco_unitario" type="number" min="0" step="0.01" value={form.preco_unitario} onChange={change} required /></label><label>Código de barras<div className="barcode-field"><input name="codigo_barra" value={form.codigo_barra} onChange={change} inputMode="numeric" required /><button type="button" className="scan-button" onClick={openScanner}><ScanLine size={18} /> Ler com câmera</button></div>{scannerLink && <div className="scanner-link-box"><span>Leia este QR Code com o celular:</span><QRCodeSVG value={scannerLink} size={180} level="M" /><code>{scannerLink}</code><button type="button" className="copy-link-button" onClick={copyScannerLink}><Copy size={15} /> Copiar link</button><small>A sessão expira automaticamente após 5 minutos.</small></div>}</label><label className="image-upload-field">Imagem do produto<input className="image-file-input" name="imagem" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setImageFile(event.target.files?.[0] || null)} /><span className="image-upload-button">Escolher arquivo</span><span className="image-file-name">{imageFile ? imageFile.name : 'Nenhum arquivo selecionado'}</span>{imageFile && <UploadPreview key={`${imageFile.name}-${imageFile.size}-${imageFile.lastModified}`} file={imageFile} />}</label><label>Categoria<select name="categoria_id" value={form.categoria_id} onChange={change} required><option value="">Selecione</option>{categories.map(category => <option key={category.id} value={category.id}>{category.nome}</option>)}</select></label><div className="form-actions"><button type="button" className="secondary" onClick={() => setPage('products')}>Cancelar</button><button disabled={saving}>{saving ? 'Salvando...' : 'Salvar item'}</button></div>{error && <div className="error">{error}</div>}{success && <div className="success">{success}</div>}</form></section>;
}

function BarcodeScanner() {
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const [manualValue, setManualValue] = useState('');
  const sessionId = new URLSearchParams(window.location.search).get('session');
  useEffect(() => {
    let stream;
    let timer;
    async function start() {
      if (!('BarcodeDetector' in window)) {
        setError('Este navegador não oferece leitura automática. Digite o código abaixo.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
        const videoElement = videoRef.current;
        if (!videoElement) return;
        videoElement.srcObject = stream;
        await videoElement.play();
        const detector = new window.BarcodeDetector();
        const scan = async () => {
          const codes = await detector.detect(videoElement);
          if (codes[0]?.rawValue) {
            const value = codes[0].rawValue;
            await api.submitBarcode(sessionId, value);
            setManualValue(value);
            setError('Código enviado para o computador. Você pode fechar esta página.');
            stream?.getTracks().forEach((track) => track.stop());
            return;
          }
          timer = requestAnimationFrame(scan);
        };
        scan();
      } catch (requestError) {
        setError(requestError.message || 'Não foi possível acessar a câmera. Verifique a permissão do navegador.');
      }
    }
    start();
    return () => {
      if (timer) cancelAnimationFrame(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [sessionId]);
  function finishManual() {
    if (sessionId && manualValue.trim()) api.submitBarcode(sessionId, manualValue.trim())
      .then(() => setError('Código enviado para o computador. Você pode fechar esta página.'))
      .catch((requestError) => setError(requestError.message));
  }
  return <main className="scanner-page"><div className="scanner-card"><span className="eyebrow">Leitor de código de barras</span><h1>Aponte a câmera para o código</h1>{sessionId ? <><video ref={videoRef} className="scanner-video" muted playsInline /><p className="scanner-help">Permita o acesso à câmera e mantenha o código dentro do quadro.</p></> : <p className="error">Link de sessão inválido.</p>}{error && <p className="error">{error}</p>}<input className="scanner-manual-input" value={manualValue} onChange={(event) => setManualValue(event.target.value)} placeholder="Digite o código manualmente" inputMode="numeric" /><button type="button" onClick={finishManual} disabled={!sessionId}>Enviar código</button></div></main>;
}

function AuthenticatedApp() {
  const [authenticated, setAuthenticated] = useState(api.authenticated()); const [page, setPage] = useState('dashboard');
  const [unit, setUnit] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  useEffect(() => {
    if (!authenticated) return undefined;
    let active = true;
    api.currentUser().then((user) => {
      if (active) setUnit(user.unidade);
    }).catch(() => {
      if (active) setUnit(null);
    }).finally(() => {
      if (active) setUserLoaded(true);
    });
    return () => { active = false; };
  }, [authenticated]);
  if (!authenticated) return <Login onLogin={() => setAuthenticated(true)} />;
  if (!userLoaded) return <main className="loading-page">Carregando sua unidade...</main>;
  const content = page === 'dashboard' ? <Dashboard setPage={setPage} /> : page === 'products' ? <Products setPage={setPage} /> : page === 'new-product' ? <NewProduct setPage={setPage} /> : page === 'requests' ? <Requests /> : <Requests history />;
  return <Layout page={page} setPage={setPage} unit={unit} logout={() => { api.logout(); setUnit(null); setUserLoaded(false); setAuthenticated(false); }}>{content}</Layout>;
}

export default function App() {
  return window.location.pathname === '/scanner' ? <BarcodeScanner /> : <AuthenticatedApp />;
}
