import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Filter, BookOpen, BarChart3, FileText, LayoutDashboard, Menu, RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';

export default function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Visão Geral');
  const [selectedUnidade, setSelectedUnidade] = useState('Todas');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch items from API on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await api.getItems();
      setItems(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Filter items based on search query (Checking ID, Codigo U.F, Item, Quantidade, Reserva, Unidade)
  const filteredItems = items.filter(item => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) {
      return selectedUnidade === 'Todas' || item.unidade === selectedUnidade;
    }

    const matchesSearch = 
      item.item.toLowerCase().includes(query) ||
      item.codigo.toLowerCase().includes(query) ||
      item.id.toString().includes(query) ||
      item.quantidade.toString().includes(query) ||
      item.reserva.toString().includes(query) ||
      item.unidade.toLowerCase().includes(query);
    
    const matchesUnidade = selectedUnidade === 'Todas' || item.unidade === selectedUnidade;

    return matchesSearch && matchesUnidade;
  });

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      
      {/* Top Header */}
      <header className="bg-white px-6 py-3 flex items-center justify-between shadow-xs z-10 w-full border-b border-slate-200">
        <div className="flex items-center space-x-3">
          {/* SENAI Logo as Image */}
          <img 
            src="/Senai.png" 
            alt="SENAI Logo" 
            className="h-10 md:h-12 object-contain cursor-pointer"
            onClick={() => navigate('/')}
            onError={(e) => {
              e.target.style.display = 'none';
              document.getElementById('senai-text-fallback').style.display = 'block';
            }}
          />
          <div id="senai-text-fallback" className="hidden font-black italic tracking-tighter text-3xl select-none">
            <span className="text-[#0C3B7C] font-extrabold">SENAI</span>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          Sistema de Controle e Estoque (SCE)
        </div>
      </header>

      {/* Red Divider Line */}
      <div className="h-1.5 bg-[#E30613] w-full"></div>

      {/* Main Container Layout - Fills 100% space */}
      <div className="flex flex-1 p-4 md:p-6 gap-4 md:gap-6 bg-slate-100 w-full">
        
        {/* Sidebar with Sandwich Menu Expand/Collapse */}
        <aside 
          className={`bg-[#0C3B7C] rounded-2xl p-3 flex flex-col justify-between shadow-lg shrink-0 transition-all duration-300 ${
            isSidebarCollapsed ? 'w-16 md:w-20 items-center' : 'w-64'
          }`}
        >
          <div className="w-full space-y-4">
            
            {/* Sandwich Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
              className={`w-full flex items-center justify-center p-3 text-white rounded-xl hover:bg-white/10 transition-colors ${
                isSidebarCollapsed ? 'hover:bg-white/20' : 'justify-between'
              }`}
            >
              <Menu className="w-7 h-7" />
              {!isSidebarCollapsed && <span className="font-semibold text-sm uppercase tracking-wider text-slate-200">Menu</span>}
            </button>

            <div className="h-px bg-white/20 w-full my-2"></div>

            {/* Navigation Options */}
            <div className="space-y-3 w-full">
              {/* Visão Geral */}
              <button
                onClick={() => {
                  setActiveTab('Visão Geral');
                  navigate('/');
                }}
                title="Visão Geral"
                className={`w-full rounded-xl font-medium transition-all duration-200 flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3 text-base'
                } ${
                  activeTab === 'Visão Geral'
                    ? 'bg-[#6B84A6] text-white shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {isSidebarCollapsed ? (
                  <span>V</span>
                ) : (
                  <>
                    <LayoutDashboard className="w-5 h-5 shrink-0" />
                    <span className="truncate">Visão Geral</span>
                  </>
                )}
              </button>

              {/* Estatísticas (Dashboard de Desempenho) */}
              <button
                onClick={() => {
                  setActiveTab('Estatísticas');
                  navigate('/estatistica');
                }}
                title="Estatísticas"
                className={`w-full rounded-xl font-medium transition-all duration-200 flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3 text-base'
                } ${
                  activeTab === 'Estatísticas'
                    ? 'bg-[#6B84A6] text-white shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {isSidebarCollapsed ? (
                  <span>E</span>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5 shrink-0" />
                    <span className="truncate">Estatísticas</span>
                  </>
                )}
              </button>

              {/* Solicitação */}
              <button
                onClick={() => {
                  setActiveTab('Solicitação');
                  navigate('/solicitacao');
                }}
                title="Solicitação"
                className={`w-full rounded-xl font-medium transition-all duration-200 flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3 text-base'
                } ${
                  activeTab === 'Solicitação'
                    ? 'bg-[#6B84A6] text-white shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {isSidebarCollapsed ? (
                  <span>S</span>
                ) : (
                  <>
                    <FileText className="w-5 h-5 shrink-0" />
                    <span className="truncate">Solicitação</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Manual Button */}
          <button
            onClick={() => setShowManualModal(true)}
            title="Manual de Usuário"
            className={`w-full bg-[#FF652F] hover:bg-[#e85522] text-white font-semibold rounded-xl text-center shadow-md transition-all flex items-center justify-center ${
              isSidebarCollapsed ? 'p-3' : 'py-3.5 px-4 gap-2'
            }`}
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Manual de Usuário</span>}
          </button>
        </aside>

        {/* Content Panel - Fills remaining width */}
        <main className="flex-1 bg-[#D8DCE3] rounded-3xl p-4 md:p-6 flex flex-col justify-start shadow-sm border border-slate-300/70 overflow-hidden w-full">
          
          {/* Controls Bar: Search Input + Blue Search Icon + Filter Dropdown */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 w-full">
            
            {/* Search Input Group */}
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar Item, Código, Qtd, Reserva..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#CBD0D8] text-slate-800 placeholder-slate-600 px-6 py-2.5 rounded-full outline-none border border-slate-300/60 focus:ring-2 focus:ring-[#0C3B7C] transition-all text-center sm:text-left font-medium"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-2.5 text-slate-500 hover:text-slate-800 text-sm font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Blue Circular Search Button */}
              <button 
                onClick={() => {}} 
                aria-label="Buscar"
                className="bg-[#0C3B7C] hover:bg-[#092c5c] text-white p-2.5 rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Dropdown */}
            <div className="relative flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                aria-label="Opções de Filtro"
                className="bg-[#CBD0D8] hover:bg-[#bcc2cd] text-slate-700 p-2.5 rounded-xl border border-slate-300/60 shadow-xs transition-colors flex items-center justify-center"
              >
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="bg-[#CBD0D8] hover:bg-[#bcc2cd] text-slate-700 font-medium px-8 py-2 rounded-xl border border-slate-300/60 shadow-xs transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4 text-slate-600" />
                <span>Filtro</span>
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-20 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                    Filtrar por Unidade
                  </div>
                  {['Todas', 'Taguatinga', 'Gama', 'Sobradinho'].map((unidade) => (
                    <button
                      key={unidade}
                      onClick={() => {
                        setSelectedUnidade(unidade);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                        selectedUnidade === unidade
                          ? 'bg-blue-50 text-[#0C3B7C] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{unidade}</span>
                      {selectedUnidade === unidade && <span className="w-2 h-2 rounded-full bg-[#0C3B7C]"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Table Container - Fills full width */}
          <div className="w-full overflow-x-auto flex-1">
            <div className="min-w-[750px] w-full">
              
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#D0D5DE]/80 text-slate-800 font-semibold text-sm rounded-t-xl text-center border-b border-slate-300/80">
                <div className="col-span-1 border-r border-slate-300/70 pr-2 flex items-center justify-center">ID</div>
                <div className="col-span-3 border-r border-slate-300/70 px-2 flex items-center justify-center">Codigo U.F</div>
                <div className="col-span-3 border-r border-slate-300/70 px-2 flex items-center justify-center">Item</div>
                <div className="col-span-2 border-r border-slate-300/70 px-2 flex items-center justify-center">Quantidade</div>
                <div className="col-span-1 border-r border-slate-300/70 px-2 flex items-center justify-center">Reserva</div>
                <div className="col-span-2 px-2 flex items-center justify-center">Unidade</div>
              </div>

              {/* Rows List */}
              <div className="space-y-2 mt-2">
                {loading ? (
                  <div className="py-16 text-center text-slate-600 bg-[#CBD0D8]/40 rounded-xl flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#0C3B7C]" />
                    <span className="font-semibold text-sm">Carregando dados da API...</span>
                  </div>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/item/${item.id}`)}
                      className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#CBD0D8]/90 hover:bg-[#c3c8d1] text-slate-800 rounded-xl text-center items-center font-medium shadow-2xs transition-all duration-150 border border-slate-300/50 cursor-pointer"
                    >
                      {/* ID */}
                      <div className="col-span-1 border-r border-slate-400/40 pr-2 flex items-center justify-center font-bold">
                        {item.id}
                      </div>

                      {/* Codigo U.F */}
                      <div className="col-span-3 border-r border-slate-400/40 px-2 flex items-center justify-center tracking-wide font-mono text-sm">
                        {item.codigo}
                      </div>

                      {/* Item: Image fixed on the left, text centered in the middle */}
                      <div className="col-span-3 border-r border-slate-400/40 px-2 relative flex items-center justify-center min-h-[40px]">
                        {/* Fixed Left Image */}
                        <div className="absolute left-3 w-10 h-10 rounded-lg overflow-hidden bg-slate-200 border border-slate-300/80 shrink-0 flex items-center justify-center shadow-xs">
                          <img 
                            src={item.image} 
                            alt={item.item}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Centered Text */}
                        <span className="text-center font-semibold text-slate-900 truncate pl-12 pr-2 w-full">
                          {item.item}
                        </span>
                      </div>

                      {/* Quantidade */}
                      <div className="col-span-2 border-r border-slate-400/40 px-2 flex items-center justify-center font-semibold">
                        {item.quantidade}
                      </div>

                      {/* Reserva Badge */}
                      <div className="col-span-1 border-r border-slate-400/40 px-2 flex items-center justify-center">
                        <span className={`${item.reservaColor} text-white font-bold px-3 py-1 rounded-md min-w-[36px] text-sm shadow-xs`}>
                          {item.reserva}
                        </span>
                      </div>

                      {/* Unidade */}
                      <div className="col-span-2 px-2 flex items-center justify-center text-slate-700">
                        {item.unidade}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-500 bg-[#CBD0D8]/50 rounded-xl font-medium">
                    Nenhum item encontrado para a busca "{searchTerm}".
                  </div>
                )}
              </div>

            </div>
          </div>

        </main>
      </div>

      {/* Manual Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#0C3B7C] flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#FF652F]" />
                Manual do Usuário SCE
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>Bem-vindo ao Sistema de Controle e Estoque (SCE SENAI).</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Busca Completa:</strong> Digite para buscar por Código U.F, Nome do Item, Quantidade, Reserva ou Unidade.</li>
                <li><strong>Menu Sanduíche:</strong> Clique no ícone ☰ no topo do menu lateral para expandir ou recolher a barra.</li>
                <li><strong>Imagens dos Itens:</strong> Exibição de miniaturas visuais ao lado de cada item na tabela.</li>
              </ul>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowManualModal(false)}
                className="bg-[#0C3B7C] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-900 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}