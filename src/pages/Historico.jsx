import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, FileText, Search, ChevronDown, LayoutDashboard, Menu, Check } from 'lucide-react';

export default function Historico() {
  const [activeTab, setActiveTab] = useState('Historico');
  const [sandwish, setSandwish] = useState(false);
  const [query, setQuery] = useState('');
  const [areaTecnica, setAreaTecnica] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setfiltro] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);

  const scrollRef = useRef(null);
  const filtroRef = useRef(null);
  const navigate = useNavigate();

  const normalizarTexto = (str) =>
    str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "") : "";

  const opcoes = [
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
    { id: 'eletronica_e_automacao/metalmecanica/manutencao_e_operacao', label: 'Eletrônica e Automação / Metalmecânica / Manutenção e Operação' },
    { id: 'seguranca', label: 'Segurança' },
    { id: 'infraestrutura_de_informacao_e_comunicacao', label: 'Infraestrutura de Informação e Comunicação' },
    { id: 'infraestrutura_de_informacao_e_comunicacao/gestao_e_seguranca', label: 'Infraestrutura de Informação e Comunicação / Gestão e Segurança' },
    { id: 'desenvolvimento_de_sistemas', label: 'Desenvolvimento de Sistemas' },
    { id: 'textil_e_vestuario/design', label: 'Têxtil e Vestuário / Design' },
  ];

  function mudarfiltro() {
    setfiltro(!filtro);
  }

  function mudarSandwish() {
    setSandwish(!sandwish);
  }

  const toggleExpand = (id) => {
    setExpandedItemId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (filtroRef.current && !filtroRef.current.contains(event.target)) {
        setfiltro(false);
      }
    }
    if (filtro) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filtro]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/solicitacoes');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesQuery =
      !query ||
      item.name?.toLowerCase().includes(query.toLowerCase()) ||
      item.code?.toString().toLowerCase().includes(query.toLowerCase()) ||
      item.solicitante?.toLowerCase().includes(query.toLowerCase()) ||
      item.location?.toLowerCase().includes(query.toLowerCase());

    const matchesArea =
      !areaTecnica ||
      normalizarTexto(item.AreaTecnica) === normalizarTexto(areaTecnica);

    return matchesQuery && matchesArea;
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F4F6F9]">
      <header className="fixed top-0 left-0 z-30 flex h-20 w-full items-center justify-between border-b border-gray-200 bg-white px-4 py-2 md:px-6">
        <div className="flex items-center">
          <img src="/Senai.png" alt="Logo Senai" className="h-10 w-auto object-contain p-2 md:h-12" />
        </div>
        <div className="absolute inset-x-0 -bottom-0.5 h-1.5 bg-[#E84910] transition-all duration-300"></div>
      </header>

      <div className="flex min-h-screen w-full flex-1 pt-20">
        <aside className={`sticky top-20 h-[calc(101vh-75px)] ${sandwish ? 'w-64' : 'w-16 md:w-20'} z-20 flex shrink-0 flex-col items-center gap-4 bg-[#164194] p-2 text-white transition-all duration-300 md:p-4`}>
          <div className="flex w-full flex-1 flex-col gap-3">
            <button onClick={mudarSandwish} className={`flex w-full items-center rounded-xl p-2 text-white hover:bg-white/20 ${sandwish ? 'justify-start gap-3 px-3' : 'justify-center'}`}>
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
            <button onClick={() => navigate('/solicitacao')} className={`flex w-full items-center font-medium hover:bg-white/20 rounded-xl ${!sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'}`}>
              <FileText className="h-6 w-6 shrink-0" />
              {sandwish && <span className="truncate">Solicitação</span>}
            </button>
            <button onClick={() => navigate('/manualdousuario')} className={`mt-auto flex w-full items-center font-medium rounded-xl ${!sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'}`}>
              <FileText className="h-6 w-6 shrink-0" />
              {sandwish && <span className="truncate">Manual do Usuário</span>}
            </button>
          </div>
        </aside>

        <main className="flex flex-1 min-w-0 flex-col bg-[#D8DCE3]">
          <div className="flex w-full items-center gap-2 overflow-x-auto border-b border-slate-300 bg-[#D8DCE3] px-4 pt-4 pb-0 scrollbar-none sm:px-8">
            <button onClick={() => navigate('/solicitacao')} className="whitespace-nowrap rounded-t-xl px-6 py-2.5 font-medium text-slate-700 hover:bg-[#CBD0D8]/60 sm:px-12">Solicitar</button>
            <button onClick={() => navigate('/historico')} className="whitespace-nowrap rounded-t-xl border-t border-x border-slate-300 bg-[#CBD0D8] px-6 py-2.5 font-bold text-slate-900 shadow-xs sm:px-12">Histórico</button>
          </div>

          <div className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6 md:p-8">
            <div className="flex w-full flex-col gap-6 rounded-3xl bg-[#111827] p-4 shadow-xl sm:p-6">
              <div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row">
                <div className="flex w-full flex-1 flex-col items-center gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar no Histórico"
                    className="w-full rounded-full bg-[#CDCDCD] px-5 py-2.5 text-center font-medium text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 sm:w-64 sm:text-left"
                  />

                  <div ref={filtroRef} className="relative w-full sm:w-auto">
                    <button onClick={mudarfiltro} className="flex w-35 items-center justify-center gap-2 rounded-xl bg-[#CDCDCD] px-5 py-2.5 font-semibold text-gray-800 hover:bg-[#BFBFBF] sm:w-auto" type="button">
                      <ChevronDown className={`h-5 w-5 text-gray-700 transition-transform ${filtro ? 'rotate-180' : ''}`} />
                      <span>Filtro</span>
                    </button>

                    {filtro && (
                      <div className="absolute right-0 z-50 mt-2 w-full sm:w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md">
                        <div className="pb-1 mb-1 border-b border-gray-200/80">
                          <button onClick={() => { setQuery(''); setAreaTecnica(''); setfiltro(false); }} className="flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-left text-sm font-semibold text-red-600 hover:bg-[#BFBFBF]">
                            <span>Limpar Filtros</span>
                          </button>
                        </div>

                        <div ref={scrollRef} className="flex max-h-48 flex-col gap-0.5 overflow-y-auto pr-1">
                          {opcoes.map((opcao) => {
                            const isSelected = areaTecnica === opcao.id;
                            return (
                              <button
                                key={opcao.id}
                                onClick={() => { setAreaTecnica(opcao.id); setfiltro(false); }}
                                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all ${isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-[#929292] hover:text-gray-900'}`}
                              >
                                <span className="break-words whitespace-normal leading-snug">{opcao.label}</span>
                                {isSelected && <Check className="ml-2 h-4 w-4 shrink-0 text-blue-600" />}
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
                    <div className="col-span-1 border-r border-slate-400 pr-2 flex items-center justify-center">ID</div>
                    <div className="col-span-2 border-r border-slate-400 px-2 flex items-center justify-center">Código U.F.</div>
                    <div className="col-span-3 border-r border-slate-400 px-2 flex items-center justify-center">Item</div>
                    <div className="col-span-2 border-r border-slate-400 px-2 flex items-center justify-center">Data da Reserva</div>
                    <div className="col-span-1 border-r border-slate-400 px-2 flex items-center justify-center">Quantidade</div>
                    <div className="col-span-2 border-r border-slate-400 px-2 flex items-center justify-center">Unidade</div>
                    <div className="col-span-1 px-2 flex items-center justify-center">Info</div>
                  </div>

                  {loading ? (
                    <div className="p-6 text-center font-medium text-gray-300">Carregando histórico...</div>
                  ) : filteredItems.length === 0 ? (
                    <div className="p-6 text-center font-medium text-gray-400">Nenhum item solicitado até o momento.</div>
                  ) : (
                    filteredItems.map((item, index) => {
                      const isExpanded = expandedItemId === item.id;

                      return (
                        <React.Fragment key={item.id}>
                          <div
                            onClick={() => toggleExpand(item.id)}
                            className={`grid grid-cols-12 gap-2 border-b border-slate-700 px-4 py-3 text-center items-center cursor-pointer transition-colors text-gray-200 ${isExpanded ? 'bg-slate-800' : 'hover:bg-slate-800'}`}
                          >
                            <div className="col-span-1 font-semibold">{index + 1}</div>
                            <div className="col-span-2 font-mono text-xs sm:text-sm">{item.code}</div>
                            <div className="col-span-3 flex items-center gap-2 pl-2 text-left font-medium">
                              {item.image && <img src={item.image} alt={item.name} className="h-7 w-7 rounded bg-white p-0.5 object-contain shrink-0" />}
                              <span className="truncate">{item.name}</span>
                            </div>
                            <div className="col-span-2 text-xs sm:text-sm font-medium">{item.dataReserva || item.dataSolicitacao}</div>
                            <div className="col-span-1 font-semibold">{item.requestedQty || item.stock || 1}</div>
                            <div className="col-span-2 text-xs sm:text-sm truncate">{item.location}</div>
                            <div className="col-span-1 flex justify-center items-center">
                              <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="relative col-span-12 bg-[#D1D5DB] p-4 border-b border-slate-600 transition-all text-left text-gray-900">
                              <div className="flex flex-wrap items-center justify-start gap-3">
                                <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-3 min-w-[140px] min-h-[75px] text-center border border-gray-300">
                                  <span className="text-xs font-semibold text-gray-700">Solicitante:</span>
                                  <span className="mt-1 text-xs font-bold text-gray-900">{item.solicitante || '-'}</span>
                                </div>

                                <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-3 min-w-[130px] min-h-[75px] text-center border border-gray-300">
                                  <span className="text-xs font-semibold text-gray-700 leading-tight">Data de<br />Recebimento</span>
                                  <span className="mt-1 text-xs font-bold text-gray-900">{item.dataRecebimento || '-'}</span>
                                </div>

                                <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-3 min-w-[130px] min-h-[75px] text-center border border-gray-300">
                                  <span className="text-xs font-semibold text-gray-700">Data de Solicitação:</span>
                                  <span className="mt-1 text-xs font-bold text-gray-900">{item.dataSolicitacao || '-'}</span>
                                </div>

                                <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-3 min-w-[130px] min-h-[75px] text-center border border-gray-300">
                                  <span className="text-xs font-semibold text-gray-700">Data de Retirada:</span>
                                  <span className="mt-1 text-xs font-bold text-gray-900">{item.dataRetirada || '-'}</span>
                                </div>

                                <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-3 min-w-[100px] min-h-[75px] text-center border border-gray-300">
                                  <span className="text-xs font-semibold text-gray-700">PED:</span>
                                  <span className="mt-1 text-xs font-bold text-gray-900">{item.ped || '-'}</span>
                                </div>

                                <div className="ml-auto flex items-center justify-end px-2 pt-2 text-xs font-bold text-gray-800">
                                  {item.saCode || '-'}
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
          </div>
        </main>
      </div>
    </div>
  );
}