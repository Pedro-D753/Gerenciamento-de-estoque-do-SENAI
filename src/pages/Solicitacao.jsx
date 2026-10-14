import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, FileText, Search, ChevronDown, LayoutDashboard, Menu, Check, X, Trash2 } from 'lucide-react';

export default function Solicitacao() {
  // 1. ESTADOS E REFS
  const [activeTab, setActiveTab] = useState('Solicitação');
  const [sandwish, setSandwish] = useState(false);
  const [query, setQuery] = useState('');
  const [areaTecnica, setAreaTecnica] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtro, setfiltro] = useState(false);

  const backdropMouseDownRef = useRef(false);
  const scrollRef = useRef(null);
  const filtroRef = useRef(null);
  const navigate = useNavigate();

  // 2. OPÇÕES DO FILTRO
  const opcoes = [
    { id: 1, label: 'Produção Alimentícia', action: () => setAreaTecnica('producao_alimenticia') },
    { id: 2, label: 'Eletrônica e Automação', action: () => setAreaTecnica('eletronica_e_automacao') },
    { id: 3, label: 'Manutenção e Operação', action: () => setAreaTecnica('manutencao_e_operacao') },
    { id: 4, label: 'Construção de Obras', action: () => setAreaTecnica('construcao_de_obras') },
    { id: 5, label: 'Construção de Obras', action: () => setAreaTecnica('construcao_de_obras') },
    { id: 6, label: 'Construção de Obras / Sistemas de Energia', action: () => setAreaTecnica('construcao_de_obras/sistemas_de_energia') },
    { id: 7, label: 'Eletrônica e Automação', action: () => setAreaTecnica('eletronica_e_automacao') },
    { id: 8, label: 'Eletrônica e Automação', action: () => setAreaTecnica('Eletronica_e_Automacao') },
    { id: 9, label: 'Sistemas de Energia', action: () => setAreaTecnica('sistemas_de_energia') },
    { id: 10, label: 'Sistemas de Energia', action: () => setAreaTecnica('sistemas_de_energia') },
    { id: 11, label: 'Comercial / Gerencial / Operações Financeiras', action: () => setAreaTecnica('comercial/gerencial/operacoes_financeiras') },
    { id: 12, label: 'Design', action: () => setAreaTecnica('design') },
    { id: 13, label: 'Gerencial', action: () => setAreaTecnica('gerencial') },
    { id: 14, label: 'Manufatura', action: () => setAreaTecnica('manufatura') },
    { id: 15, label: 'Metalmecãnica', action: () => setAreaTecnica('metalmecanica') },
    { id: 16, label: 'Metalmecãnica', action: () => setAreaTecnica('metalmecanica') },
    { id: 17, label: 'Eletrônica e Automação / Metalmecânica / Manutenção e Operação', action: () => setAreaTecnica('eletronica_e_automacao/metalmecanica/manutencao_e_operacao') },
    { id: 18, label: 'Metalmecãnica', action: () => setAreaTecnica('metalmecanica') },
    { id: 19, label: 'Sistemas de Energia', action: () => setAreaTecnica('sistemas_de_energia') },
    { id: 20, label: 'Segurança', action: () => setAreaTecnica('seguranca') },
    { id: 21, label: 'Infraestrutura de Informação e Comunicação', action: () => setAreaTecnica('infraestrutura_de_informacao_e_comunicacao') },
    { id: 22, label: 'Infraestrutura de Informação e Comunicação / Gestão e Segurança', action: () => setAreaTecnica('infraestrutura_de_informacao_e_comunicacao/gestao_e_seguranca') },
    { id: 23, label: 'Desenvolvimentos de Sistemas', action: () => setAreaTecnica('desenvolvimentos_de_sistemas') },
    { id: 24, label: 'Têxtil e Vestuário / Design', action: () => setAreaTecnica('textil_e_vestuario/design') },
  ];

  // 3. HANDLERS E REQUISIÇÕES
  function mudarfiltro() {
    setfiltro(!filtro);
  }

  function mudarSandwish() {
    setSandwish(!sandwish);
  }

  // Fecha o filtro ao clicar fora dele
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

  // Controle de velocidade da rolagem do mouse
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      container.scrollTop += e.deltaY * 0.3;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [filtro]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/produtos');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Erro ao procurar produtos na API:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = async (id, currentApprovedStatus) => {
    const newStatus = !currentApprovedStatus;

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, approved: newStatus } : item
      )
    );

    try {
      await fetch(`http://localhost:3000/produtos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: newStatus }),
      });
    } catch (error) {
      console.error('Erro ao atualizar item na API:', error);
      fetchProducts();
    }
  };

  // 4. LÓGICA DE FILTRAGEM
  const filteredItems = items.filter((item) => {
    const matchesQuery =
      !query ||
      item.name?.toLowerCase().includes(query.toLowerCase()) ||
      item.code?.toString().toLowerCase().includes(query.toLowerCase()) ||
      item.location?.toLowerCase().includes(query.toLowerCase());

    const matchesArea =
      !areaTecnica ||
      item.AreaTecnica?.toLowerCase() === areaTecnica.toLowerCase();

    return matchesQuery && matchesArea;
  });

  const selectedItems = items.filter((item) => item.approved);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F4F6F9]">
      {/* Cabeçalho */}
      <header className="fixed top-0 left-0 z-30 flex h-20 w-full items-center justify-between border-b border-gray-200 bg-white px-4 py-2 md:px-6">
        <div className="flex items-center">
          <img
            src="/Senai.png"
            alt="Logo Senai"
            className="h-10 w-auto object-contain p-2 md:h-12"
          />
        </div>
        <div className="absolute inset-x-0 -bottom-0.5 h-1.5 bg-[#E84910] transition-all duration-300"></div>
      </header>

      <div className="flex min-h-screen w-full flex-1 pt-20">
        {/* Sidebar */}
        <aside
          className={`sticky top-20 h-[calc(101vh-75px)] ${
            sandwish ? 'w-64' : 'w-16 md:w-20'
          } z-20 flex shrink-0 flex-col items-center gap-4 bg-[#164194] p-2 text-white transition-all duration-300 md:p-4`}
        >
          <div className="flex w-full flex-1 flex-col gap-3">
            <button
              onClick={mudarSandwish}
              title={sandwish ? 'Recolher menu' : 'Expandir menu'}
              className={`flex w-full items-center rounded-xl p-2 text-white transition-colors hover:bg-white/20 ${
                sandwish ? 'justify-start gap-3 px-3' : 'justify-center'
              }`}
            >
              <Menu className="h-6 w-6 shrink-0" />
              {sandwish && (
                <span className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                  Menu
                </span>
              )}
            </button>
            <div className="my-1 h-0.5 w-full bg-white/20 transition-all duration-300"></div>
            <button
              onClick={() => {
                setActiveTab('Visão Geral');
                navigate('/');
              }}
              title="Visão Geral"
              className={`flex w-full items-center font-medium transition-all duration-200 hover:bg-white/20 rounded-xl ${
                !sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'
              } ${
                activeTab === 'Visão Geral'
                  ? 'bg-[#6B84A6] text-white shadow-md'
                  : 'text-white'
              }`}
            >
              <LayoutDashboard className="h-6 w-6 shrink-0" />
              {sandwish && <span className="truncate">Visão Geral</span>}
            </button>
            <button
              onClick={() => {
                setActiveTab('Estatísticas');
                navigate('/Estatistica');
              }}
              title="Estatísticas"
              className={`flex w-full items-center font-medium transition-all duration-200 hover:bg-white/20 rounded-xl ${
                !sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'
              } ${
                activeTab === 'Estatísticas'
                  ? 'bg-[#6B84A6] text-white shadow-md'
                  : 'text-white'
              }`}
            >
              <BarChart3 className="h-6 w-6 shrink-0" />
              {sandwish && <span className="truncate">Estatísticas</span>}
            </button>
            <button
              onClick={() => {
                setActiveTab('Solicitação');
                navigate('/solicitacao');
              }}
              title="Solicitação"
              className={`flex w-full items-center font-medium transition-all duration-200 rounded-xl ${
                !sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'
              } ${
                activeTab === 'Solicitação'
                  ? 'bg-[#6B84A6] text-white shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <FileText className="h-6 w-6 shrink-0" />
              {sandwish && <span className="truncate">Solicitação</span>}
            </button>
            <button
              onClick={() => {
                setActiveTab('Manual do Usuário');
                navigate('/manualdousuario');
              }}
              title="Manual do Usuário"
              className={`mt-auto flex w-full items-center font-medium transition-all duration-200 rounded-xl ${
                !sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'
              } ${
                activeTab === 'Manual do Usuário'
                  ? 'bg-[#6B84A6] text-white shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <FileText className="h-6 w-6 shrink-0" />
              {sandwish && <span className="truncate">Manual do Usuário</span>}
            </button>
          </div>
        </aside>

        <main className="flex flex-1 min-w-0 flex-col bg-[#D8DCE3]">
          <div className="flex w-full items-center gap-2 overflow-x-auto border-b border-slate-300 bg-[#D8DCE3] px-4 pt-4 pb-0 scrollbar-none sm:px-8">
            <button
              onClick={() => navigate('/solicitacao')}
              className="whitespace-nowrap rounded-t-xl border-t border-x border-slate-300 bg-[#CBD0D8] px-6 py-2.5 font-bold text-slate-900 shadow-xs sm:px-12"
            >
              Solicitar
            </button>
            <button
              onClick={() => navigate('/gerenciar_solicitacao')}
              className="whitespace-nowrap rounded-t-xl px-6 py-2.5 font-medium text-slate-700 transition-colors hover:bg-[#CBD0D8]/60 sm:px-12"
            >
              Gerenciar
            </button>
            <button
              onClick={() => navigate('/historico_solicitacao')}
              className="whitespace-nowrap rounded-t-xl px-6 py-2.5 font-medium text-slate-700 transition-colors hover:bg-[#CBD0D8]/60 sm:px-12"
            >
              Histórico
            </button>
          </div>

          {/* Tabela Inteira */}
          <div className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6 md:p-8">
            <div className="flex w-full flex-col gap-6 rounded-3xl bg-[#111827] p-4 shadow-xl sm:p-6">

              {/* Barra de Busca e Filtros */}
              <div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row">
                <div className="flex w-full flex-1 flex-col items-center gap-3 transition-all duration-300 sm:flex-row">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar Item"
                    className="w-full rounded-full bg-[#CDCDCD] px-5 py-2.5 text-center font-medium text-gray-800 placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-blue-500 sm:w-64 sm:text-left"
                  />

                  {/* Wrapper do Filtro */}
                  <div
                    ref={filtroRef}
                    className="relative w-full transition-all duration-300 sm:w-auto"
                  >
                    <button
                      onClick={mudarfiltro}
                      className="flex w-35 items-center justify-center gap-2 rounded-xl bg-[#CDCDCD] px-5 py-2.5 font-semibold text-gray-800 transition-colors hover:bg-[#BFBFBF] sm:w-auto"
                      type="button"
                    >
                      <ChevronDown
                        className={`h-5 w-5 text-gray-700 transition-transform duration-300 ${
                          filtro ? 'rotate-180' : ''
                        }`}
                      />
                      <span>Filtro</span>
                    </button>

                    {/* Dropdown do Filtro */}
                    {filtro && (
                      <div className="absolute right-0 z-50 mt-2 w-full sm:w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md transition-all">
                        {/* Botão Limpar Filtros fixo no topo */}
                        <div className="pb-1 mb-1 border-b border-gray-200/80">
                          <button
                            onClick={() => {
                              setQuery('');
                              setAreaTecnica('');
                              setfiltro(false);
                            }}
                            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                          >
                            <span>Limpar Filtros</span>
                          </button>
                        </div>

                        {/* Container com scroll para as opções */}
                        <div
                          ref={scrollRef}
                          className="flex max-h-48 flex-col gap-0.5 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#c6c6c6] hover:[&::-webkit-scrollbar-thumb]:bg-[#939393]"
                        >
                          {opcoes.map((opcao) => {
                            const isSelected = areaTecnica === opcao.label;
                            return (
                              <button
                                key={opcao.id}
                                onClick={() => {
                                  if (opcao.action) {
                                    opcao.action();
                                  } else {
                                    setAreaTecnica(opcao.label);
                                  }
                                  setfiltro(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'bg-blue-50 text-blue-600 font-semibold'
                                    : 'text-gray-700 hover:bg-[#929292] hover:text-gray-900'
                                }`}
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

                  {/* Botão Azul de Busca */}
                  <button className="flex w-full shrink-0 items-center justify-center rounded-full bg-[#1E40AF] p-2.5 text-white transition-colors hover:bg-[#1E3A8A] sm:w-auto">
                    <Search className="h-5 w-5" />
                  </button>
                </div>

                {/* Botão de Solicitar */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-8 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-[#2563EB] lg:w-auto"
                >
                  <span>Solicitar</span>
                  {selectedItems.length > 0 && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-blue-600">
                      {selectedItems.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tabela de Produtos */}
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
                    <div className="p-6 text-center font-medium text-gray-300">
                      Carregando dados da API...
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="p-6 text-center font-medium text-gray-400">
                      Nenhum produto encontrado.
                    </div>
                  ) : (
                    filteredItems.map((item, index) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleSelect(item.id, item.approved)}
                        className={`grid grid-cols-12 gap-2 border-b border-slate-700 px-4 py-3 text-center items-center cursor-pointer transition-colors ${
                          item.approved
                            ? 'bg-blue-900/40 text-blue-200'
                            : 'text-gray-200 hover:bg-slate-800'
                        }`}
                      >
                        <div className="col-span-1 font-semibold">{index + 1}</div>
                        <div className="col-span-3 font-mono text-xs sm:text-sm">{item.code}</div>
                        <div className="col-span-3 flex items-center gap-2 pl-4 text-left font-medium">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-7 w-7 rounded bg-white p-0.5 object-contain"
                            />
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="col-span-2 font-semibold">{item.stock}</div>
                        <div className="col-span-1 flex justify-center">
                          <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                            {item.badgeValue}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center justify-between px-2">
                          <span className="truncate">{item.location}</span>
                          <button
                            type="button"
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              item.approved
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-400'
                            }`}
                          >
                            {item.approved && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Confirmação */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onMouseDown={(e) => {
            backdropMouseDownRef.current = e.target === e.currentTarget;
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && backdropMouseDownRef.current) {
              setIsModalOpen(false);
            }
            backdropMouseDownRef.current = false;
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-[#1F2937] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-xl font-bold text-white">Confirmar Solicitação</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer text-gray-400 transition-colors hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3 py-4">
              <p className="text-sm text-gray-300">
                {selectedItems.length > 0 ? (
                  <>
                    Você selecionou{' '}
                    <span className="font-bold text-blue-400">{selectedItems.length}</span>{' '}
                    item(ns) para solicitação:
                  </>
                ) : (
                  <span className="font-medium text-amber-400">
                    Nenhum item selecionado.
                  </span>
                )}
              </p>

              {selectedItems.length > 0 ? (
                <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800/80 p-3"
                    >
                      <div className="flex flex-1 items-center gap-3 overflow-hidden">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-8 w-8 shrink-0 rounded bg-white p-0.5 object-contain"
                          />
                        )}
                        <div className="truncate">
                          <p className="truncate text-sm font-semibold text-white">
                            {item.name}
                          </p>
                          <p className="font-mono text-xs text-gray-400">Cód: {item.code}</p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-lg border border-blue-500/30 bg-blue-600/30 px-2.5 py-1 text-xs font-medium text-blue-300">
                          {item.location || 'Sem Unidade'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(item.id, item.approved);
                          }}
                          title="Remover item"
                          className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="pointer-events-none h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-700/50 bg-amber-950/30 p-4 text-xs leading-relaxed text-amber-300">
                  Todos os itens foram removidos. Selecione produtos na tabela se desejar enviar uma nova solicitação.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-700 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={selectedItems.length === 0}
                onClick={() => {
                  alert('Solicitação enviada com sucesso!');
                  setIsModalOpen(false);
                }}
                className={`rounded-xl px-5 py-2 text-sm font-semibold shadow-md transition-colors ${
                  selectedItems.length > 0
                    ? 'cursor-pointer bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                    : 'cursor-not-allowed bg-gray-600 text-gray-400 opacity-50'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}