import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, FileText, Search, ChevronDown, LayoutDashboard, Menu, Check, X, Trash2 } from 'lucide-react';

export default function Solicitacao() {
  const [activeTab, setActiveTab] = useState('Solicitação');
  const [sandwish, setSandwish] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Referência para controlar o clique no fundo escuro do modal
  const backdropMouseDownRef = useRef(false);

  const navigate = useNavigate();

  function mudarSandwish() {
    setSandwish(!sandwish);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/produtos');
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

    // Atualização otimista no estado do React
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, approved: newStatus } : item
      )
    );

    try {
      await fetch(`http://localhost:3001/produtos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: newStatus }),
      });
    } catch (error) {
      console.error('Erro ao atualizar item na API:', error);
      fetchProducts(); // Reverte alterações em caso de falha
    }
  };

  const filteredItems = items.filter((item) =>
    item.name?.toLowerCase().includes(query.toLowerCase()) ||
    item.code?.toString().toLowerCase().includes(query.toLowerCase()) ||
    item.location?.toLowerCase().includes(query.toLowerCase())
  );

  // Lista dos itens selecionados
  const selectedItems = items.filter((item) => item.approved);

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#F4F6F9]">
      {/* Cabeçalho */}
      <header className="w-full fixed top-0 left-0 h-20 border-b border-gray-200 z-30 bg-white px-4 md:px-6 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <img src="/Senai.png" alt="Logo Senai" className="p-2 h-10 md:h-12 w-auto object-contain" />
        </div>
        <div className="bg-[#E84910] absolute -bottom-0.5 inset-x-0 h-1.5 transition-all duration-300"></div>
      </header>

      <div className="flex flex-1 w-full pt-20 min-h-screen">
        {/* Sidebar */}
        <aside
          className={`sticky top-20 h-[calc(100vh-80px)] ${
            sandwish ? 'w-64' : 'w-16 md:w-20'
          } bg-[#164194] text-white flex flex-col items-center gap-4 p-2 md:p-4 transition-all duration-300 shrink-0 z-20`}
        >
          <div className="flex flex-col gap-3 w-full flex-1">
            <button
              onClick={mudarSandwish}
              title={sandwish ? 'Recolher menu' : 'Expandir menu'}
              className={`w-full flex items-center p-2 text-white rounded-xl hover:bg-white/20 transition-colors ${
                sandwish ? 'justify-start gap-3 px-3' : 'justify-center'
              }`}
            >
              <Menu className="w-6 h-6 shrink-0" />
              {sandwish && (
                <span className="font-semibold text-sm uppercase tracking-wider text-slate-200">
                  Menu
                </span>
              )}
            </button>
            <div className="w-full h-0.5 bg-white/20 my-1 transition-all duration-300"></div>
            <button
              onClick={() => { setActiveTab('Visão Geral'); navigate('/'); }}
              title="Visão Geral"
              className={`w-full hover:bg-white/20 rounded-xl font-medium transition-all duration-200 flex items-center ${
                !sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'
              } ${activeTab === 'Visão Geral' ? 'bg-[#6B84A6] text-white shadow-md' : 'text-white'}`}
            >
              <LayoutDashboard className="w-6 h-6 shrink-0" />
              {sandwish && <span className="truncate">Visão Geral</span>}
            </button>
            <button
              onClick={() => { setActiveTab('Estatísticas'); navigate('/Estatistica'); }}
              title="Estatísticas"
              className={`w-full hover:bg-white/20 rounded-xl font-medium transition-all duration-200 flex items-center ${
                !sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'
              } ${activeTab === 'Estatísticas' ? 'bg-[#6B84A6] text-white shadow-md' : 'text-white'}`}
            >
              <BarChart3 className="w-6 h-6 shrink-0" />
              {sandwish && <span className="truncate">Estatísticas</span>}
            </button>
            <button
              onClick={() => { setActiveTab('Solicitação'); navigate('/solicitacao'); }}
              title="Solicitação"
              className={`w-full rounded-xl font-medium transition-all duration-200 flex items-center ${
                !sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'
              } ${activeTab === 'Solicitação' ? 'bg-[#6B84A6] text-white shadow-md' : 'text-white hover:bg-white/20'}`}
            >
              <FileText className="w-6 h-6 shrink-0" />
              {sandwish && <span className="truncate">Solicitação</span>}
            </button>
            <button
              onClick={() => { setActiveTab('Manual do Usuário'); navigate('/manualdousuario'); }}
              title="Manual do Usuário"
              className={`mt-auto w-full rounded-xl font-medium transition-all duration-200 flex items-center ${
                !sandwish ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-base'
              } ${activeTab === 'Manual do Usuário' ? 'bg-[#6B84A6] text-white shadow-md' : 'text-white hover:bg-white/20'}`}
            >
              <FileText className="w-6 h-6 shrink-0" />
              {sandwish && <span className="truncate">Manual do Usuário</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 bg-[#D8DCE3]">
          <div className="w-full px-4 sm:px-8 pt-4 pb-0 bg-[#D8DCE3] border-b border-slate-300 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => navigate('/solicitacao')}
              className="bg-[#CBD0D8] text-slate-900 px-6 sm:px-12 py-2.5 rounded-t-xl border-t border-x border-slate-300 shadow-xs font-bold whitespace-nowrap"
            >
              Solicitar
            </button>
            <button
              onClick={() => navigate('/gerenciar_solicitacao')}
              className="text-slate-700 hover:bg-[#CBD0D8]/60 px-6 sm:px-12 py-2.5 rounded-t-xl transition-colors font-medium whitespace-nowrap"
            >
              Gerenciar
            </button>
            <button
              onClick={() => navigate('/historico_solicitacao')}
              className="text-slate-700 hover:bg-[#CBD0D8]/60 px-6 sm:px-12 py-2.5 rounded-t-xl transition-colors font-medium whitespace-nowrap"
            >
              Histórico
            </button>
          </div>

          <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col gap-6 overflow-x-hidden">
            <div className="w-full bg-[#111827] p-4 sm:p-6 rounded-3xl flex flex-col gap-6 shadow-xl">
              {/* Barra de Busca e Filtros */}
              <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar Item"
                    className="w-full sm:w-64 bg-[#CDCDCD] text-gray-800 placeholder-gray-500 text-center sm:text-left px-5 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#CDCDCD] hover:bg-[#BFBFBF] text-gray-800 font-semibold px-5 py-2.5 rounded-xl transition-colors">
                    <ChevronDown className="w-5 h-5 text-gray-700" />
                    <span>Filtro</span>
                  </button>
                  <button className="w-full sm:w-auto flex items-center justify-center bg-[#1E40AF] hover:bg-[#1E3A8A] text-white p-2.5 rounded-full transition-colors shrink-0">
                    <Search className="w-5 h-5" />
                  </button>
                </div>

                {/* Botão para abrir o Pop-up */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full lg:w-auto bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold px-8 py-2.5 rounded-xl transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Solicitar</span>
                  {selectedItems.length > 0 && (
                    <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">
                      {selectedItems.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tabela dos Produtos */}
              <div className="overflow-x-auto w-full rounded-xl border border-slate-700">
                <div className="min-w-[700px] w-full bg-[#1F2937]">
                  <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#D0D5DE] text-slate-800 font-bold text-sm rounded-t-xl text-center border-b border-slate-400">
                    <div className="col-span-1 border-r border-slate-400 pr-2 flex items-center justify-center">ID</div>
                    <div className="col-span-3 border-r border-slate-400 px-2 flex items-center justify-center">Codigo U.F</div>
                    <div className="col-span-3 border-r border-slate-400 px-2 flex items-center justify-center">Item</div>
                    <div className="col-span-2 border-r border-slate-400 px-2 flex items-center justify-center">Quantidade</div>
                    <div className="col-span-1 border-r border-slate-400 px-2 flex items-center justify-center">Reserva</div>
                    <div className="col-span-2 px-2 flex items-center justify-center">Unidade</div>
                  </div>

                  {/* Linhas da Tabela */}
                  {loading ? (
                    <div className="p-6 text-center text-gray-300 font-medium">Carregando dados da API...</div>
                  ) : filteredItems.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 font-medium">Nenhum produto encontrado.</div>
                  ) : (
                    filteredItems.map((item, index) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleSelect(item.id, item.approved)}
                        className={`grid grid-cols-12 gap-2 px-4 py-3 text-center border-b border-slate-700 items-center cursor-pointer transition-colors ${
                          item.approved ? 'bg-blue-900/40 text-blue-200' : 'text-gray-200 hover:bg-slate-800'
                        }`}
                      >
                        <div className="col-span-1 font-semibold">{index + 1}</div>
                        <div className="col-span-3 font-mono text-xs sm:text-sm">{item.code}</div>
                        <div className="col-span-3 text-left pl-4 font-medium flex items-center gap-2">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-7 h-7 object-contain rounded bg-white p-0.5" />
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="col-span-2 font-semibold">{item.stock}</div>
                        <div className="col-span-1 flex justify-center">
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                            {item.badgeValue}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center justify-between px-2">
                          <span className="truncate">{item.location}</span>
                          <button
                            type="button"
                            className={`w-5 h-5 rounded border flex items-center justify-center ${
                              item.approved ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-400'
                            }`}
                          >
                            {item.approved && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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

      {/* Pop-up (Modal) de Solicitação */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onMouseDown={(e) => {
            // Guarda se o clique iniciou no fundo escuro
            backdropMouseDownRef.current = (e.target === e.currentTarget);
          }}
          onClick={(e) => {
            // Só fecha se o clique começou e terminou no fundo escuro
            if (e.target === e.currentTarget && backdropMouseDownRef.current) {
              setIsModalOpen(false);
            }
            backdropMouseDownRef.current = false;
          }}
        >
          <div className="bg-[#1F2937] text-white rounded-2xl p-6 max-w-lg w-full border border-slate-700 shadow-2xl relative">
            {/* Cabeçalho do Pop-up */}
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-xl font-bold text-white">Confirmar Solicitação</h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo do Pop-up - Lista de Itens Selecionados */}
            <div className="py-4 space-y-3">
              <p className="text-gray-300 text-sm">
                {selectedItems.length > 0 ? (
                  <>
                    Você selecionou <span className="font-bold text-blue-400">{selectedItems.length}</span> item(ns) para solicitação:
                  </>
                ) : (
                  <span className="text-amber-400 font-medium">Nenhum item selecionado.</span>
                )}
              </p>

              {selectedItems.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-800/80 border border-slate-700 rounded-xl gap-3"
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 object-contain rounded bg-white p-0.5 shrink-0"
                          />
                        )}
                        <div className="truncate">
                          <p className="font-semibold text-sm text-white truncate">{item.name}</p>
                          <p className="text-xs text-gray-400 font-mono">Cód: {item.code}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs bg-blue-600/30 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg font-medium">
                          {item.location || 'Sem Unidade'}
                        </span>
                        
                        {/* Botão para Remover o Item */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(item.id, item.approved);
                          }}
                          title="Remover item"
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 pointer-events-none" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-950/30 border border-amber-700/50 p-4 rounded-xl text-amber-300 text-xs leading-relaxed">
                  Todos os itens foram removidos. Selecione produtos na tabela se desejar enviar uma nova solicitação.
                </div>
              )}
            </div>

            {/* Ações do Pop-up */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-700 text-slate-200 rounded-xl hover:bg-slate-600 transition-colors text-sm font-medium cursor-pointer"
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
                className={`px-5 py-2 rounded-xl text-sm font-semibold shadow-md transition-colors ${
                  selectedItems.length > 0
                    ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white cursor-pointer'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
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