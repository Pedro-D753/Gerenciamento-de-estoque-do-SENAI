import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, FileText, Search, ChevronDown, LayoutDashboard, Menu, Check, X, AlertTriangle } from 'lucide-react';

export default function GerenciarSolicitacao() {
  const [activeTab, setActiveTab] = useState('Gerenciar');
  const [sandwish, setSandwish] = useState(false);
  const [query, setQuery] = useState('');
  const [areaTecnica, setAreaTecnica] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setfiltro] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);

  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null,
    item: null,
  });

  const backdropMouseDownRef = useRef(false);
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

  const openConfirmModal = (type, item, e) => {
    e.stopPropagation();
    setActionModal({ isOpen: true, type, item });
  };

  const closeConfirmModal = () => {
    setActionModal({ isOpen: false, type: null, item: null });
  };

  // Gerencia especificamente a lista de SOLICITAÇÕES enviadas
  const handleConfirmAction = async () => {
    const { type, item } = actionModal;
    if (!item) return;

    if (type === 'approve') {
      try {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'aprovado' } : i))
        );
        await fetch(`http://localhost:3000/solicitacoes/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'aprovado' }),
        });
      } catch (error) {
        console.error('Erro ao aprovar solicitação:', error);
      }
    } else if (type === 'delete') {
      try {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        await fetch(`http://localhost:3000/solicitacoes/${item.id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Erro ao excluir solicitação:', error);
      }
    }

    closeConfirmModal();
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (filtroRef.current && !filtroRef.current.contains(event.target)) {
        setfiltro(false);
      }
    }
    if (filtro) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filtro]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/solicitacoes');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesQuery =
      !query ||
      item.name?.toLowerCase().includes(query.toLowerCase()) ||
      item.code?.toString().toLowerCase().includes(query.toLowerCase()) ||
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
            <button onClick={mudarSandwish} className={`flex w-full items-center rounded-xl p-2 text-white transition-colors hover:bg-white/20 ${sandwish ? 'justify-start gap-3 px-3' : 'justify-center'}`}>
              <Menu className="h-6 w-6 shrink-0" />
              {sandwish && <span className="text-sm font-semibold uppercase tracking-wider text-slate-200">Menu</span>}
            </button>
            <div className="my-1 h-0.5 w-full bg-white/20"></div>
            <button onClick={() => { setActiveTab('Visão Geral'); navigate('/'); }} className={`flex w-full items-center font-medium transition-all hover:bg-white/20 rounded-xl ${!sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'}`}>
              <LayoutDashboard className="h-6 w-6 shrink-0" />
              {sandwish && <span className="truncate">Visão Geral</span>}
            </button>
            <button onClick={() => { setActiveTab('Estatísticas'); navigate('/Estatistica'); }} className={`flex w-full items-center font-medium transition-all hover:bg-white/20 rounded-xl ${!sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'}`}>
              <BarChart3 className="h-6 w-6 shrink-0" />
              {sandwish && <span className="truncate">Estatísticas</span>}
            </button>
            <button onClick={() => { setActiveTab('Solicitação'); navigate('/solicitacao'); }} className={`flex w-full items-center font-medium transition-all hover:bg-white/20 rounded-xl ${!sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'}`}>
              <FileText className="h-6 w-6 shrink-0" />
              {sandwish && <span className="truncate">Solicitação</span>}
            </button>
            <button onClick={() => navigate('/manualdousuario')} className={`mt-auto flex w-full items-center font-medium transition-all rounded-xl ${!sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'}`}>
              <FileText className="h-6 w-6 shrink-0" />
              {sandwish && <span className="truncate">Manual do Usuário</span>}
            </button>
          </div>
        </aside>

        <main className="flex flex-1 min-w-0 flex-col bg-[#D8DCE3]">
          <div className="flex w-full items-center gap-2 overflow-x-auto border-b border-slate-300 bg-[#D8DCE3] px-4 pt-4 pb-0 scrollbar-none sm:px-8">
            <button onClick={() => navigate('/solicitacao')} className="whitespace-nowrap rounded-t-xl px-6 py-2.5 font-medium text-slate-700 hover:bg-[#CBD0D8]/60 sm:px-12">Solicitar</button>
            <button onClick={() => navigate('/gerenciar')} className="whitespace-nowrap rounded-t-xl border-t border-x border-slate-300 bg-[#CBD0D8] px-6 py-2.5 font-bold text-slate-900 shadow-xs sm:px-12">Gerenciar</button>
            <button onClick={() => navigate('/historico')} className="whitespace-nowrap rounded-t-xl px-6 py-2.5 font-medium text-slate-700 hover:bg-[#CBD0D8]/60 sm:px-12">Histórico</button>
          </div>

          <div className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6 md:p-8">
            <div className="flex w-full flex-col gap-6 rounded-3xl bg-[#111827] p-4 shadow-xl sm:p-6">
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex w-full flex-1 items-center gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar Item"
                    className="w-full rounded-full bg-[#CDCDCD] px-5 py-2.5 text-center font-medium text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 sm:w-64 sm:text-left"
                  />

                  <div ref={filtroRef} className="relative w-full sm:w-auto">
                    <button onClick={mudarfiltro} className="flex w-35 items-center justify-center gap-2 rounded-xl bg-[#CDCDCD] px-5 py-2.5 font-semibold text-gray-800 hover:bg-[#BFBFBF] sm:w-auto" type="button">
                      <ChevronDown className={`h-5 w-5 text-gray-700 transition-transform ${filtro ? 'rotate-180' : ''}`} />
                      <span>Filtro</span>
                    </button>

                    {filtro && (
                      <div className="absolute right-0 z-50 mt-2 w-full sm:w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md">
                        <div className="pb-1 mb-1 border-b border-gray-200">
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
                                <span>{opcao.label}</span>
                                {isSelected && <Check className="ml-2 h-4 w-4 text-blue-600" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <button className="flex shrink-0 items-center justify-center rounded-full bg-[#1E40AF] p-2.5 text-white hover:bg-[#1E3A8A]">
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="w-full overflow-x-auto rounded-xl border border-slate-700">
                <div className="min-w-[700px] w-full bg-[#1F2937]">
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-400 bg-[#D0D5DE] px-4 py-3 text-center text-sm font-bold text-slate-800 rounded-t-xl">
                    <div className="col-span-1 border-r border-slate-400 pr-2 flex items-center justify-center">ID</div>
                    <div className="col-span-3 border-r border-slate-400 px-2 flex items-center justify-center">Codigo U.F</div>
                    <div className="col-span-3 border-r border-slate-400 px-2 flex items-center justify-center">Item</div>
                    <div className="col-span-2 border-r border-slate-400 px-2 flex items-center justify-center">Quantidade</div>
                    <div className="col-span-1 border-r border-slate-400 px-2 flex items-center justify-center">Reserva</div>
                    <div className="col-span-2 px-2 flex items-center justify-center">Unidade</div>
                  </div>

                  {loading ? (
                    <div className="p-6 text-center font-medium text-gray-300">Carregando dados da API...</div>
                  ) : filteredItems.length === 0 ? (
                    <div className="p-6 text-center font-medium text-gray-400">Nenhuma solicitação encontrada.</div>
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
                            <div className="col-span-3 font-mono text-xs sm:text-sm">{item.code}</div>
                            <div className="col-span-3 flex items-center gap-2 pl-4 text-left font-medium">
                              {item.image && <img src={item.image} alt={item.name} className="h-7 w-7 rounded bg-white p-0.5 object-contain" />}
                              <span className="truncate">{item.name}</span>
                            </div>
                            <div className="col-span-2 font-semibold">{item.requestedQty || item.stock || 1}</div>
                            <div className="col-span-1 flex justify-center">
                              <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">{item.badgeValue || 1}</span>
                            </div>
                            <div className="col-span-2 flex items-center justify-between px-2">
                              <span className="truncate">{item.location}</span>
                              <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="relative col-span-12 bg-[#D1D5DB] p-4 border-b border-slate-600 transition-all text-left">
                              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex-1 w-full bg-[#E5E7EB] p-3 rounded-xl border border-gray-300 min-h-[90px] overflow-hidden">
                                  <span className="font-bold underline text-gray-900 text-sm">Motivo:</span>
                                  <p className="mt-1 text-xs text-gray-700 break-all whitespace-normal">
                                    {item.motivo || 'Nenhum motivo especificado.'}
                                  </p>
                                </div>

                                <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-end">
                                  <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-2 min-w-[110px] text-center shadow-xs">
                                    <span className="text-xs font-medium text-gray-800 leading-tight">Itens<br />requisitados</span>
                                    <span className="mt-1 text-base font-bold text-gray-900">{item.requestedQty ?? item.stock ?? 1}</span>
                                  </div>

                                  <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-2 min-w-[110px] text-center shadow-xs">
                                    <span className="text-xs font-medium text-gray-800 leading-tight">Itens<br />Disponíveis</span>
                                    <span className="mt-1 rounded-md bg-red-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">{item.stock ?? 0}</span>
                                  </div>

                                  <div className="flex flex-col gap-2 min-w-[100px]">
                                    <button
                                      type="button"
                                      onClick={(e) => openConfirmModal('approve', item, e)}
                                      className="rounded-lg bg-[#00C853] px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-[#00E676]"
                                    >
                                      Aprovar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => openConfirmModal('delete', item, e)}
                                      className="rounded-lg bg-[#FF1744] px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-[#FF5252]"
                                    >
                                      Excluir
                                    </button>
                                  </div>
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

      {actionModal.isOpen && actionModal.item && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
          onMouseDown={(e) => { backdropMouseDownRef.current = e.target === e.currentTarget; }}
          onClick={(e) => {
            if (e.target === e.currentTarget && backdropMouseDownRef.current) closeConfirmModal();
            backdropMouseDownRef.current = false;
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-[#1F2937] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-6 w-6 ${actionModal.type === 'approve' ? 'text-green-500' : 'text-red-500'}`} />
                <h3 className="text-lg font-bold text-white">
                  {actionModal.type === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Exclusão'}
                </h3>
              </div>
              <button type="button" onClick={closeConfirmModal} className="cursor-pointer text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-300">
                Tem certeza que deseja <span className="font-bold">{actionModal.type === 'approve' ? 'aprovar' : 'excluir'}</span> o item abaixo?
              </p>

              <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-800/80 p-4">
                <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                  <span className="text-xs font-medium text-gray-400">Nome do Item:</span>
                  <span className="text-sm font-bold text-white truncate max-w-[200px]">{actionModal.item.name}</span>
                </div>

                {actionModal.type === 'approve' && (
                  <>
                    <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                      <span className="text-xs font-medium text-gray-400">Itens Requisitados:</span>
                      <span className="text-sm font-bold text-blue-400">{actionModal.item.requestedQty ?? actionModal.item.stock ?? 1}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-400">Itens Disponíveis:</span>
                      <span className="text-sm font-bold text-amber-400">{actionModal.item.stock ?? 0}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-700 pt-3">
              <button type="button" onClick={closeConfirmModal} className="rounded-xl bg-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-600">Cancelar</button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`rounded-xl px-5 py-2 text-sm font-bold text-white ${actionModal.type === 'approve' ? 'bg-[#00C853] hover:bg-[#00E676]' : 'bg-[#FF1744] hover:bg-[#FF5252]'}`}
              >
                {actionModal.type === 'approve' ? 'Aprovar' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}