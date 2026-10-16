import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Search, 
  ChevronDown, 
  LayoutDashboard, 
  Menu, 
  Check, 
  Plus, 
  Minus, 
  Package, 
  ShoppingCart,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  // --- ESTADOS NAVEGAÇÃO E SIDEBAR ---
  const [activeTab, setActiveTab] = useState('Solicitar'); // 'Solicitar' | 'Historico'
  const [sandwish, setSandwish] = useState(false);
  const navigate = useNavigate();

  // --- ESTADOS DO BANCO DE DADOS E SOLICITAÇÃO ---
  const [produtos, setProdutos] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [solicitanteNome, setSolicitanteNome] = useState('André Felipe Maciel');
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [enviandoSolicitacao, setEnviandoSolicitacao] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // --- ESTADOS DO HISTÓRICO ---
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [query, setQuery] = useState('');
  const [areaTecnicaFiltro, setAreaTecnicaFiltro] = useState('');
  const [filtro, setFiltro] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);

  const filtroRef = useRef(null);

  const opcoesAreaTecnica = [
    { id: 'producao_alimenticia', label: 'Produção Alimentícia' },
    { id: 'eletronica_e_automacao', label: 'Eletrônica e Automação' },
    { id: 'manutencao_e_operacao', label: 'Manutenção e Operação' },
    { id: 'construcao_de_obras', label: 'Construção de Obras' },
    { id: 'construcao_de_obras/sistemas_de_energia', label: 'Construção de Obras / Sistemas de Energia' },
    { id: 'sistemas_de_energia', label: 'Sistemas de Energia' },
    { id: 'comercial/gerencial/operacoes_financeiras', label: 'Comercial / Gerencial / Operações Financeiras' },
    { id: 'design', label: 'Design' },
    { id: 'gerencial', label: 'Gerencial' },
    { id: 'manufatura', label: 'Manufatura' },
    { id: 'metalmecanica', label: 'Metalmecânica' },
    { id: 'seguranca', label: 'Segurança' },
    { id: 'infraestrutura_de_informacao_e_comunicacao', label: 'Infraestrutura de Informação e Comunicação' },
    { id: 'desenvolvimento_de_sistemas', label: 'Desenvolvimento de Sistemas' },
    { id: 'textil_e_vestuario/design', label: 'Têxtil e Vestuário / Design' },
  ];

  const normalizarTexto = (str) =>
    str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "") : "";

  useEffect(() => {
    function handleClickOutside(event) {
      if (filtroRef.current && !filtroRef.current.contains(event.target)) {
        setFiltro(false);
      }
    }
    if (filtro) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filtro]);

  useEffect(() => {
    fetchProdutos();
    fetchSolicitacoes();
  }, []);

  const fetchProdutos = async () => {
    try {
      setLoadingProdutos(true);
      const res = await fetch('http://localhost:3000/produtos');
      if (res.ok) {
        const data = await res.json();
        setProdutos(data);
        if (data.length > 0) setSelectedProductId(data[0].id);
      }
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    } finally {
      setLoadingProdutos(false);
    }
  };

  const fetchSolicitacoes = async () => {
    try {
      setLoadingHistorico(true);
      const res = await fetch('http://localhost:3000/solicitacoes');
      if (res.ok) {
        const data = await res.json();
        setSolicitacoes(data);
      }
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    } finally {
      setLoadingHistorico(false);
    }
  };

  const produtoAtual = produtos.find((p) => p.id === selectedProductId) || produtos[0];

  useEffect(() => {
    setQuantidade(1);
  }, [selectedProductId]);

  const handleAlterarQuantidade = (valor) => {
    const estoqueMaximo = produtoAtual?.stock ?? 1;
    const num = parseInt(valor, 10);

    if (isNaN(num) || num < 1) {
      setQuantidade(1);
    } else if (num > estoqueMaximo) {
      setQuantidade(estoqueMaximo);
    } else {
      setQuantidade(num);
    }
  };

  const handleFazerRequisicao = async () => {
    if (!produtoAtual) return;
    setEnviandoSolicitacao(true);

    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR');

    const novaSolicitacao = {
      id: Math.random().toString(36).substring(2, 11),
      productId: produtoAtual.id,
      code: produtoAtual.code || '00000000',
      name: produtoAtual.name || 'Item',
      image: produtoAtual.image || 'https://via.placeholder.com/50',
      location: produtoAtual.location || 'Taguatinga',
      AreaTecnica: produtoAtual.AreaTecnica || 'eletronica_e_automacao',
      solicitante: solicitanteNome,
      dataSolicitacao: dataFormatada,
      dataReserva: dataFormatada,
      dataRecebimento: 'Aguardando',
      dataRetirada: 'Pendente',
      requestedQty: Number(quantidade),
      motivo: 'Solicitação via Sistema',
      ped: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      saCode: `SA-2026-${Math.floor(100 + Math.random() * 900)}`,
      stock: produtoAtual.stock || 0,
      status: 'solicitado'
    };

    try {
      const res = await fetch('http://localhost:3000/solicitacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaSolicitacao)
      });

      if (res.ok) {
        setMensagemSucesso(`Requisição de ${quantidade}x "${produtoAtual.name}" enviada com sucesso!`);
        fetchSolicitacoes();
        setTimeout(() => setMensagemSucesso(''), 4000);
      }
    } catch (err) {
      setSolicitacoes((prev) => [novaSolicitacao, ...prev]);
      setMensagemSucesso(`Requisição enviada com sucesso!`);
      setTimeout(() => setMensagemSucesso(''), 4000);
    } finally {
      setEnviandoSolicitacao(false);
    }
  };

  const solicitacoesFiltradas = solicitacoes.filter((item) => {
    const matchesQuery =
      !query ||
      item.name?.toLowerCase().includes(query.toLowerCase()) ||
      item.code?.toString().toLowerCase().includes(query.toLowerCase()) ||
      item.solicitante?.toLowerCase().includes(query.toLowerCase()) ||
      item.location?.toLowerCase().includes(query.toLowerCase());

    const matchesArea =
      !areaTecnicaFiltro ||
      normalizarTexto(item.AreaTecnica) === normalizarTexto(areaTecnicaFiltro);

    return matchesQuery && matchesArea;
  });

  // VERIFICAÇÕES CONDICIONAIS DE EXISTÊNCIA DE CARACTERÍSTICAS
  const temMarca = Boolean(produtoAtual?.marca);
  const temModelo = Boolean(produtoAtual?.modelo);
  const temCor = Boolean(produtoAtual?.cor);
  const temPrincipais = temMarca || temModelo || temCor;

  const temTipoFerro = Boolean(produtoAtual?.tipoFerro);
  const temPotencia = Boolean(produtoAtual?.potencia);
  const temDiametro = Boolean(produtoAtual?.diametro);
  const temMaterialPonta = Boolean(produtoAtual?.materialPonta);
  const temComLed = produtoAtual?.comLed !== undefined && produtoAtual?.comLed !== null && produtoAtual?.comLed !== '';
  const temPontaRemovivel = produtoAtual?.pontaRemovivel !== undefined && produtoAtual?.pontaRemovivel !== null && produtoAtual?.pontaRemovivel !== '';
  const temIncluiSuporte = produtoAtual?.incluiSuporte !== undefined && produtoAtual?.incluiSuporte !== null && produtoAtual?.incluiSuporte !== '';
  const temCarac1 = Boolean(produtoAtual?.caracteristica1);
  const temCarac2 = Boolean(produtoAtual?.caracteristica2);
  const temCarac3 = Boolean(produtoAtual?.caracteristica3);
  const temCarac4 = Boolean(produtoAtual?.caracteristica4);

  const temOutros = temTipoFerro || temPotencia || temDiametro || temMaterialPonta || temComLed || temPontaRemovivel || temIncluiSuporte || temCarac1 || temCarac2 || temCarac3 || temCarac4;

  const temDescricao = Boolean(produtoAtual?.description && produtoAtual.description.trim() !== '') || Boolean(produtoAtual?.motivo && produtoAtual.motivo.trim() !== '');

  const temAlgumaCaracteristica = temPrincipais || temOutros || temDescricao;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F4F6F9] font-sans text-gray-800">
      
      {/* HEADER SENAI */}
      <header className="fixed top-0 left-0 z-30 flex h-20 w-full items-center justify-between border-b border-gray-200 bg-white px-4 py-2 md:px-6">
        <div className="flex items-center">
          <img src="/Senai.png" alt="Logo SENAI" className="h-10 w-auto object-contain p-1 md:h-12" />
        </div>
        <div className="absolute inset-x-0 -bottom-0.5 h-1.5 bg-[#E84910]"></div>
      </header>

      <div className="flex min-h-screen w-full flex-1 pt-20">
        
        {/* SIDEBAR LATERAL AZUL (#164194) */}
        <aside className={`sticky top-20 h-[calc(100vh-80px)] ${sandwish ? 'w-64' : 'w-16 md:w-20'} z-20 flex shrink-0 flex-col items-center gap-4 bg-[#164194] p-2 text-white transition-all duration-300 md:p-4`}>
          <div className="flex w-full flex-1 flex-col gap-3">
            <button onClick={() => setSandwish(!sandwish)} className={`flex w-full items-center rounded-xl p-2 text-white hover:bg-white/20 ${sandwish ? 'justify-start gap-3 px-3' : 'justify-center'}`}>
              <Menu className="h-6 w-6 shrink-0" />
              {sandwish && <span className="text-sm font-semibold uppercase tracking-wider text-slate-200">Menu</span>}
            </button>
            <div className="my-1 h-0.5 w-full bg-white/20"></div>

            <button onClick={() => navigate('/')} className={`flex w-full items-center font-medium hover:bg-white/20 rounded-xl ${!sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'}`}>
              <LayoutDashboard className="h-6 w-6 shrink-0" />
              {sandwish && <span className="truncate">Visão Geral</span>}
            </button>

            <button onClick={() => navigate('/Estatistica')} className={`flex w-full items-center font-medium hover:bg-white/20 rounded-xl ${!sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'}`}>
              <BarChart3 className="h-6 w-6 shrink-0" />
              {sandwish && <span className="truncate">Estatísticas</span>}
            </button>

            <button onClick={() => setActiveTab('Solicitar')} className={`flex w-full items-center font-medium bg-white/10 rounded-xl ${!sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'}`}>
              <FileText className="h-6 w-6 shrink-0" />
              {sandwish && <span className="truncate">Solicitação</span>}
            </button>

            <button onClick={() => navigate('/manualdousuario')} className={`mt-auto flex w-full items-center font-medium hover:bg-white/20 rounded-xl ${!sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'}`}>
              <FileText className="h-6 w-6 shrink-0" />
              {sandwish && <span className="truncate">Manual do Usuário</span>}
            </button>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex flex-1 min-w-0 flex-col bg-[#D8DCE3]">
          
          {/* ABAS: SOLICITAR E HISTÓRICO */}
          <div className="flex w-full items-center gap-2 overflow-x-auto border-b border-slate-300 bg-[#D8DCE3] px-4 pt-4 pb-0 scrollbar-none sm:px-8">
            <button
              onClick={() => setActiveTab('Solicitar')}
              className={`whitespace-nowrap rounded-t-xl px-6 py-2.5 font-bold transition-all sm:px-12 ${
                activeTab === 'Solicitar'
                  ? 'border-t border-x border-slate-300 bg-white text-slate-900 shadow-xs'
                  : 'text-slate-700 hover:bg-[#CBD0D8]/60'
              }`}
            >
              Solicitar
            </button>
            <button
              onClick={() => setActiveTab('Historico')}
              className={`whitespace-nowrap rounded-t-xl px-6 py-2.5 font-bold transition-all sm:px-12 ${
                activeTab === 'Historico'
                  ? 'border-t border-x border-slate-300 bg-white text-slate-900 shadow-xs'
                  : 'text-slate-700 hover:bg-[#CBD0D8]/60'
              }`}
            >
              Histórico
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 md:p-8">
            
            {/* ALERTA DE SUCESSO */}
            {mensagemSucesso && (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-600 p-4 text-white shadow-lg animate-fade-in">
                <CheckCircle2 className="h-6 w-6 shrink-0" />
                <span className="font-semibold text-sm sm:text-base">{mensagemSucesso}</span>
              </div>
            )}

            {/* =========================================================================
                ABA 1: SOLICITAR ITEM
               ========================================================================= */}
            {activeTab === 'Solicitar' && (
              <div className="flex flex-col gap-6">
                
                {/* SELETOR DE PRODUTOS DO BANCO */}
                <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#164194]" />
                    <span className="text-sm font-bold text-gray-700">Selecione o Item do Banco de Dados:</span>
                  </div>
                  
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    disabled={loadingProdutos || produtos.length === 0}
                    className="w-full sm:w-80 rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-800 outline-none focus:border-[#164194]"
                  >
                    {loadingProdutos ? (
                      <option>Carregando produtos...</option>
                    ) : produtos.length === 0 ? (
                      <option>Nenhum produto no banco de dados</option>
                    ) : (
                      produtos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code ? `[${p.code}] ` : ''}{p.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {produtoAtual && (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    
                    {/* ESQUERDA: FOTO E DETALHES */}
                    <div className="flex flex-col gap-6 lg:col-span-8">
                      <div className="rounded-3xl bg-white p-6 shadow-md">
                        
                        {/* CABEÇALHO DO PRODUTO */}
                        <div className="flex flex-col md:flex-row items-center gap-8">
                          <div className="flex h-64 w-full md:w-64 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-4 shrink-0">
                            <img
                              src={produtoAtual.image || 'https://via.placeholder.com/200'}
                              alt={produtoAtual.name}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Sem+Imagem'; }}
                            />
                          </div>

                          <div className="flex flex-col justify-center w-full min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl break-words">
                              {produtoAtual.name}
                            </h1>
                            
                            {produtoAtual.subtitulo && (
                              <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed break-words">
                                {produtoAtual.subtitulo}
                              </p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                              {produtoAtual.location && (
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                                  Unidade: {produtoAtual.location}
                                </span>
                              )}
                              {produtoAtual.AreaTecnica && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                  Área: {produtoAtual.AreaTecnica}
                                </span>
                              )}
                              {produtoAtual.code && (
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-mono font-bold text-gray-800">
                                  Código: {produtoAtual.code}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* SEÇÃO CARACTERÍSTICAS (APENAS SE HOUVER DADOS NO BANCO) */}
                        {temAlgumaCaracteristica && (
                          <div className="mt-8 border-t border-gray-200 pt-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">
                              Características do produto
                            </h2>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                              
                              {/* COLUNA ESQUERDA: PRINCIPAIS E OUTROS */}
                              {(temPrincipais || temOutros) && (
                                <div className={`flex flex-col gap-6 ${temDescricao ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                                  
                                  {/* Características Principais */}
                                  {temPrincipais && (
                                    <div>
                                      <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">
                                        CARACTERÍSTICAS PRINCIPAIS
                                      </h3>
                                      <div className="overflow-hidden rounded-xl border border-gray-200 text-xs">
                                        {temMarca && (
                                          <div className="flex border-b border-gray-200 bg-gray-100 p-2.5">
                                            <span className="w-1/3 font-semibold text-gray-600 shrink-0">Marca</span>
                                            <span className="w-2/3 font-bold text-gray-900 break-words break-all">{produtoAtual.marca}</span>
                                          </div>
                                        )}
                                        {temModelo && (
                                          <div className="flex border-b border-gray-200 bg-white p-2.5">
                                            <span className="w-1/3 font-semibold text-gray-600 shrink-0">Modelo</span>
                                            <span className="w-2/3 text-gray-800 break-words break-all">{produtoAtual.modelo}</span>
                                          </div>
                                        )}
                                        {temCor && (
                                          <div className="flex bg-gray-50 p-2.5">
                                            <span className="w-1/3 font-semibold text-gray-600 shrink-0">Cor</span>
                                            <span className="w-2/3 text-gray-800 break-words break-all">{produtoAtual.cor}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Outros */}
                                  {temOutros && (
                                    <div>
                                      <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">
                                        OUTROS
                                      </h3>
                                      <div className="overflow-hidden rounded-xl border border-gray-200 text-xs">
                                        {temTipoFerro && (
                                          <div className="flex border-b border-gray-200 bg-gray-100 p-2.5">
                                            <span className="w-1/2 font-semibold text-gray-600 shrink-0">Tipo de ferro de solda</span>
                                            <span className="w-1/2 text-gray-800 break-words break-all">{produtoAtual.tipoFerro}</span>
                                          </div>
                                        )}
                                        {temPotencia && (
                                          <div className="flex border-b border-gray-200 bg-white p-2.5">
                                            <span className="w-1/2 font-semibold text-gray-600 shrink-0">Potência</span>
                                            <span className="w-1/2 text-gray-800 break-words break-all">{produtoAtual.potencia}</span>
                                          </div>
                                        )}
                                        {temDiametro && (
                                          <div className="flex border-b border-gray-200 bg-gray-50 p-2.5">
                                            <span className="w-1/2 font-semibold text-gray-600 shrink-0">Diâmetro do eletrodo</span>
                                            <span className="w-1/2 text-gray-800 break-words break-all">{produtoAtual.diametro}</span>
                                          </div>
                                        )}
                                        {temMaterialPonta && (
                                          <div className="flex border-b border-gray-200 bg-white p-2.5">
                                            <span className="w-1/2 font-semibold text-gray-600 shrink-0">Material da ponta</span>
                                            <span className="w-1/2 text-gray-800 break-words break-all">{produtoAtual.materialPonta}</span>
                                          </div>
                                        )}
                                        {temComLed && (
                                          <div className="flex border-b border-gray-200 bg-gray-50 p-2.5">
                                            <span className="w-1/2 font-semibold text-gray-600 shrink-0">Com luz LED</span>
                                            <span className="w-1/2 text-gray-800 break-words break-all">{typeof produtoAtual.comLed === 'boolean' ? (produtoAtual.comLed ? 'Sim' : 'Não') : produtoAtual.comLed}</span>
                                          </div>
                                        )}
                                        {temPontaRemovivel && (
                                          <div className="flex border-b border-gray-200 bg-white p-2.5">
                                            <span className="w-1/2 font-semibold text-gray-600 shrink-0">Com ponta removível</span>
                                            <span className="w-1/2 text-gray-800 break-words break-all">{typeof produtoAtual.pontaRemovivel === 'boolean' ? (produtoAtual.pontaRemovivel ? 'Sim' : 'Não') : produtoAtual.pontaRemovivel}</span>
                                          </div>
                                        )}
                                        {temIncluiSuporte && (
                                          <div className="flex border-b border-gray-200 bg-gray-50 p-2.5">
                                            <span className="w-1/2 font-semibold text-gray-600 shrink-0">Inclui suporte</span>
                                            <span className="w-1/2 text-gray-800 break-words break-all">{typeof produtoAtual.incluiSuporte === 'boolean' ? (produtoAtual.incluiSuporte ? 'Sim' : 'Não') : produtoAtual.incluiSuporte}</span>
                                          </div>
                                        )}
                                        {temCarac1 && (
                                          <div className="flex border-b border-gray-200 bg-white p-2.5">
                                            <span className="w-1/2 font-semibold text-gray-600 shrink-0">Especificação 1</span>
                                            <span className="w-1/2 text-gray-800 break-words break-all">{produtoAtual.caracteristica1}</span>
                                          </div>
                                        )}
                                        {temCarac2 && (
                                          <div className="flex border-b border-gray-200 bg-gray-50 p-2.5">
                                            <span className="w-1/2 font-semibold text-gray-600 shrink-0">Especificação 2</span>
                                            <span className="w-1/2 text-gray-800 break-words break-all">{produtoAtual.caracteristica2}</span>
                                          </div>
                                        )}
                                        {temCarac3 && (
                                          <div className="flex border-b border-gray-200 bg-white p-2.5">
                                            <span className="w-1/2 font-semibold text-gray-600 shrink-0">Especificação 3</span>
                                            <span className="w-1/2 text-gray-800 break-words break-all">{produtoAtual.caracteristica3}</span>
                                          </div>
                                        )}
                                        {temCarac4 && (
                                          <div className="flex bg-gray-50 p-2.5">
                                            <span className="w-1/2 font-semibold text-gray-600 shrink-0">Especificação 4</span>
                                            <span className="w-1/2 text-gray-800 break-words break-all">{produtoAtual.caracteristica4}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                </div>
                              )}

                              {/* COLUNA DIREITA: DESCRIÇÃO (COM QUEBRA DE TEXTO FORÇADA) */}
                              {temDescricao && (
                                <div className={`flex flex-col gap-2 min-w-0 ${(temPrincipais || temOutros) ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
                                  <h3 className="text-base font-bold text-gray-800">
                                    Descrição
                                  </h3>
                                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap break-words break-all max-w-full overflow-hidden h-full">
                                    {produtoAtual.description || produtoAtual.motivo}
                                  </div>
                                </div>
                              )}

                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* DIREITA: PAINEL DE REQUISIÇÃO */}
                    <div className="flex flex-col gap-6 lg:col-span-4">
                      <div className="rounded-3xl bg-white p-6 shadow-md border border-gray-100 flex flex-col justify-between h-full">
                        <div>
                          <div className="w-full rounded-xl bg-[#E84910] py-2.5 text-center font-bold text-white shadow-sm mb-6">
                            {produtoAtual.location || 'Taguatinga'}
                          </div>

                          <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-1">
                            <span>Estoque disponível:</span>
                            <span className="font-bold text-emerald-700 text-sm">
                              {produtoAtual.stock ?? 0} un.
                            </span>
                          </div>

                          <div className="mt-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                Quantidade:
                              </label>
                              {quantidade >= (produtoAtual.stock ?? 1) && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                                  <AlertTriangle className="h-3 w-3" /> Máximo atingido
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center rounded-xl border-2 border-gray-300 bg-gray-50 p-1 focus-within:border-[#164194]">
                              <button
                                type="button"
                                onClick={() => handleAlterarQuantidade(quantidade - 1)}
                                disabled={quantidade <= 1}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 shadow-xs hover:bg-gray-200 active:scale-95 disabled:opacity-40"
                              >
                                <Minus className="h-4 w-4" />
                              </button>

                              <input
                                type="number"
                                min="1"
                                max={produtoAtual.stock ?? 1}
                                value={quantidade}
                                onChange={(e) => handleAlterarQuantidade(e.target.value)}
                                className="w-full text-center text-lg font-bold text-gray-900 outline-none bg-transparent"
                              />

                              <button
                                type="button"
                                onClick={() => handleAlterarQuantidade(quantidade + 1)}
                                disabled={quantidade >= (produtoAtual.stock ?? 1)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 shadow-xs hover:bg-gray-200 active:scale-95 disabled:opacity-40"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600">
                              Nome do Solicitante:
                            </label>
                            <input
                              type="text"
                              value={solicitanteNome}
                              onChange={(e) => setSolicitanteNome(e.target.value)}
                              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#164194]"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleFazerRequisicao}
                            disabled={enviandoSolicitacao || !produtoAtual || (produtoAtual.stock ?? 0) === 0}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] py-3.5 font-bold text-white shadow-md hover:bg-blue-600 active:scale-98 transition-all disabled:opacity-50"
                          >
                            <ShoppingCart className="h-5 w-5" />
                            <span>{enviandoSolicitacao ? 'Enviando...' : 'Fazer requisição'}</span>
                          </button>

                          <div className="mt-8 flex flex-col items-center">
                            <div className="flex w-full justify-between text-[10px] font-bold text-gray-500 mb-1">
                              <span>Estado do Item</span>
                              <span>Perfeito</span>
                            </div>
                            <div className="flex h-3 w-full overflow-hidden rounded-full border border-gray-200">
                              <div className="w-1/5 bg-red-400"></div>
                              <div className="w-1/5 bg-amber-400"></div>
                              <div className="w-1/5 bg-yellow-300"></div>
                              <div className="w-1/5 bg-emerald-400"></div>
                              <div className="w-1/5 bg-emerald-600"></div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 rounded-2xl bg-gray-200 p-4 text-center">
                          <span className="block text-sm font-bold text-gray-800">
                            Requisições por Unidade
                          </span>
                          <div className="mt-3 flex justify-center">
                            <div className="h-20 w-20 rounded-full border-8 border-yellow-400 border-t-blue-500 border-r-indigo-400 animate-pulse"></div>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* =========================================================================
                ABA 2: HISTÓRICO DE REQUISIÇÕES
               ========================================================================= */}
            {activeTab === 'Historico' && (
              <div className="flex w-full flex-col gap-6 rounded-3xl bg-[#111827] p-4 shadow-xl sm:p-6">
                
                <div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row">
                  <div className="flex w-full flex-1 flex-col items-center gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar item ou solicitante..."
                      className="w-full rounded-full bg-[#CDCDCD] px-5 py-2.5 font-medium text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 sm:w-72"
                    />

                    <div ref={filtroRef} className="relative w-full sm:w-auto">
                      <button
                        onClick={() => setFiltro(!filtro)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#CDCDCD] px-5 py-2.5 font-semibold text-gray-800 hover:bg-[#BFBFBF] sm:w-auto"
                        type="button"
                      >
                        <ChevronDown className={`h-5 w-5 text-gray-700 transition-transform ${filtro ? 'rotate-180' : ''}`} />
                        <span>Filtro</span>
                      </button>

                      {filtro && (
                        <div className="absolute right-0 z-50 mt-2 w-full sm:w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">
                          <button
                            onClick={() => { setQuery(''); setAreaTecnicaFiltro(''); setFiltro(false); }}
                            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-left text-sm font-semibold text-red-600 hover:bg-gray-100 mb-1 border-b"
                          >
                            <span>Limpar Filtros</span>
                          </button>

                          <div className="max-h-48 overflow-y-auto">
                            {opcoesAreaTecnica.map((opcao) => {
                              const isSelected = areaTecnicaFiltro === opcao.id;
                              return (
                                <button
                                  key={opcao.id}
                                  onClick={() => { setAreaTecnicaFiltro(opcao.id); setFiltro(false); }}
                                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium ${isSelected ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                  <span>{opcao.label}</span>
                                  {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <button className="flex w-full shrink-0 items-center justify-center rounded-full bg-[#1E40AF] p-2.5 text-white hover:bg-[#1E3A8A] sm:w-auto">
                      <Search className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="w-full overflow-x-auto rounded-xl border border-slate-700">
                  <div className="min-w-[750px] w-full bg-[#1F2937]">
                    
                    <div className="grid grid-cols-12 gap-2 border-b border-slate-400 bg-[#D0D5DE] px-4 py-3 text-center text-sm font-bold text-slate-800 rounded-t-xl">
                      <div className="col-span-1 border-r border-slate-400 flex items-center justify-center">ID</div>
                      <div className="col-span-2 border-r border-slate-400 flex items-center justify-center">Código U.F.</div>
                      <div className="col-span-3 border-r border-slate-400 flex items-center justify-center">Item</div>
                      <div className="col-span-2 border-r border-slate-400 flex items-center justify-center">Data Solicitação</div>
                      <div className="col-span-1 border-r border-slate-400 flex items-center justify-center">Qtd</div>
                      <div className="col-span-2 border-r border-slate-400 flex items-center justify-center">Unidade</div>
                      <div className="col-span-1 flex items-center justify-center">Info</div>
                    </div>

                    {loadingHistorico ? (
                      <div className="p-8 text-center text-gray-300">Carregando histórico...</div>
                    ) : solicitacoesFiltradas.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">Nenhuma solicitação encontrada no histórico.</div>
                    ) : (
                      solicitacoesFiltradas.map((item, index) => {
                        const isExpanded = expandedItemId === item.id;
                        return (
                          <React.Fragment key={item.id || index}>
                            <div
                              onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                              className={`grid grid-cols-12 gap-2 border-b border-slate-700 px-4 py-3 text-center items-center cursor-pointer transition-colors text-gray-200 ${isExpanded ? 'bg-slate-800' : 'hover:bg-slate-800/80'}`}
                            >
                              <div className="col-span-1 font-semibold text-xs">{index + 1}</div>
                              <div className="col-span-2 font-mono text-xs">{item.code || '-'}</div>
                              <div className="col-span-3 flex items-center gap-2 pl-2 text-left font-medium text-xs sm:text-sm min-w-0">
                                {item.image && <img src={item.image} alt={item.name} className="h-7 w-7 rounded bg-white p-0.5 object-contain shrink-0" />}
                                <span className="truncate">{item.name}</span>
                              </div>
                              <div className="col-span-2 text-xs font-medium">{item.dataSolicitacao || '-'}</div>
                              <div className="col-span-1 font-bold text-blue-400">{item.requestedQty || 1}</div>
                              <div className="col-span-2 text-xs truncate">{item.location || 'Taguatinga'}</div>
                              <div className="col-span-1 flex justify-center items-center">
                                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="col-span-12 bg-[#D1D5DB] p-4 border-b border-slate-600 text-gray-900">
                                <div className="flex flex-wrap items-center justify-start gap-3">
                                  <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-2 min-w-[140px] text-center border border-gray-300">
                                    <span className="text-xs font-semibold text-gray-600">Solicitante:</span>
                                    <span className="text-xs font-bold text-gray-900 break-words">{item.solicitante || '-'}</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-2 min-w-[130px] text-center border border-gray-300">
                                    <span className="text-xs font-semibold text-gray-600">Recebimento:</span>
                                    <span className="text-xs font-bold text-gray-900">{item.dataRecebimento || '-'}</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-2 min-w-[100px] text-center border border-gray-300">
                                    <span className="text-xs font-semibold text-gray-600">PED:</span>
                                    <span className="text-xs font-bold text-gray-900">{item.ped || '-'}</span>
                                  </div>
                                  <div className="ml-auto text-xs font-bold text-gray-800">
                                    S.A: {item.saCode || '-'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}

                  </div>
                </div>

              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}