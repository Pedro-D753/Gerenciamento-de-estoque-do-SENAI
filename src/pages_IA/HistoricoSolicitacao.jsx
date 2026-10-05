import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Filter, BookOpen, BarChart3, FileText, LayoutDashboard, Menu } from 'lucide-react';
import { api } from '../services/api.js';

export default function HistoricoSolicitacao() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnidade, setSelectedUnidade] = useState('Todas');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(1);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch history items from API on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await api.getHistoricoSolicitacoes();
      setHistoryItems(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredHistory = historyItems.filter(item => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return selectedUnidade === 'Todas' || item.unidade === selectedUnidade;
    return (
      item.item.toLowerCase().includes(query) ||
      item.codigo.toLowerCase().includes(query) ||
      item.solicitante.toLowerCase().includes(query) ||
      item.unidade.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      
      {/* Header */}
      <header className="bg-white px-6 py-3 flex items-center justify-between shadow-xs z-10 w-full border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <img 
            src="/Senai.png" 
            alt="SENAI Logo" 
            className="h-10 md:h-12 object-contain cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight text-center flex-1">
          Solicitações
        </h1>

        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          Sistema de Controle e Estoque (SCE)
        </div>
      </header>

      {/* Red Divider Line */}
      <div className="h-1.5 bg-[#E30613] w-full"></div>

      {/* Sub-Navigation Tabs (Solicitar | Gerenciar | Historico) */}
      <div className="bg-[#D8DCE3] border-b border-slate-300 px-6 pt-2 flex items-center gap-2 text-center text-sm md:text-base font-semibold">
        <button
          onClick={() => navigate('/solicitacao')}
          className="text-slate-700 hover:bg-[#CBD0D8]/60 px-10 md:px-16 py-2.5 rounded-t-xl transition-colors font-medium"
        >
          Solicitar
        </button>
        <button
          onClick={() => navigate('/gerenciar_solicitacao')}
          className="text-slate-700 hover:bg-[#CBD0D8]/60 px-10 md:px-16 py-2.5 rounded-t-xl transition-colors font-medium"
        >
          Gerenciar
        </button>
        <button
          onClick={() => navigate('/historico_solicitacao')}
          className="bg-[#CBD0D8] text-slate-900 px-10 md:px-16 py-2.5 rounded-t-xl border-t border-x border-slate-300/80 shadow-xs font-bold"
        >
          Histórico
        </button>
      </div>

      {/* Main Container Layout */}
      <div className="flex flex-1 p-4 md:p-6 gap-4 md:gap-6 bg-slate-100 w-full">
        
        {/* Sidebar */}
        <aside 
          className={`bg-[#0C3B7C] rounded-2xl p-3 flex flex-col justify-between shadow-lg shrink-0 transition-all duration-300 ${
            isSidebarCollapsed ? 'w-16 md:w-20 items-center' : 'w-64'
          }`}
        >
          <div className="w-full space-y-4">
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

            <div className="space-y-3 w-full">
              <button
                onClick={() => navigate('/')}
                className={`w-full rounded-xl font-medium flex items-center ${isSidebarCollapsed ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3'} text-white hover:bg-white/10`}
              >
                {isSidebarCollapsed ? <span>V</span> : <><LayoutDashboard className="w-5 h-5" /><span>Visão Geral</span></>}
              </button>

              <button
                onClick={() => navigate('/estatistica')}
                className={`w-full rounded-xl font-medium flex items-center ${isSidebarCollapsed ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3'} text-white hover:bg-white/10`}
              >
                {isSidebarCollapsed ? <span>E</span> : <><BarChart3 className="w-5 h-5" /><span>Estatísticas</span></>}
              </button>

              <button
                onClick={() => navigate('/solicitacao')}
                className={`w-full rounded-xl font-medium flex items-center ${isSidebarCollapsed ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3'} bg-[#6B84A6] text-white shadow-md`}
              >
                {isSidebarCollapsed ? <span>S</span> : <><FileText className="w-5 h-5" /><span>Solicitação</span></>}
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowManualModal(true)}
            className={`w-full bg-[#FF652F] hover:bg-[#e85522] text-white font-semibold rounded-xl ${isSidebarCollapsed ? 'p-3' : 'py-3.5 px-4 gap-2'} flex items-center justify-center`}
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span>Manual de Usuário</span>}
          </button>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 bg-[#D8DCE3] rounded-3xl p-4 md:p-6 flex flex-col justify-start shadow-sm border border-slate-300/70 overflow-hidden w-full">
          
          {/* Controls Bar: Search Input + Blue Search Icon + Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 w-full">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar Item"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#CBD0D8] text-slate-800 placeholder-slate-600 px-6 py-2.5 rounded-full outline-none border border-slate-300/60 focus:ring-2 focus:ring-[#0C3B7C] transition-all text-center sm:text-left font-medium"
                />
              </div>

              {/* Filter */}
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="bg-[#CBD0D8] hover:bg-[#bcc2cd] text-slate-700 font-medium px-6 py-2 rounded-xl border border-slate-300/60 shadow-xs flex items-center gap-2"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`} />
                  <span>Filtro</span>
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-20">
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
                        className={`w-full text-left px-4 py-2.5 text-sm ${selectedUnidade === unidade ? 'bg-blue-50 text-[#0C3B7C] font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        {unidade}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Circle */}
              <button className="bg-[#0C3B7C] text-white p-2.5 rounded-full shadow-md shrink-0">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="w-full overflow-x-auto flex-1">
            <div className="min-w-[850px] w-full">
              
              {/* Table Header: ID Solicitação | Codigo U.F | Item | Data da Reserva | Quantidade | Unidade | Info */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#D0D5DE]/80 text-slate-800 font-semibold text-sm rounded-t-xl text-center border-b border-slate-300/80">
                <div className="col-span-1 border-r border-slate-300/70 pr-2 flex items-center justify-center text-xs">ID Solicitação</div>
                <div className="col-span-2 border-r border-slate-300/70 px-2 flex items-center justify-center">Codigo U.F</div>
                <div className="col-span-3 border-r border-slate-300/70 px-2 flex items-center justify-center">Item</div>
                <div className="col-span-2 border-r border-slate-300/70 px-2 flex items-center justify-center">Data da Reserva</div>
                <div className="col-span-1 border-r border-slate-300/70 px-2 flex items-center justify-center">Quantidade</div>
                <div className="col-span-2 border-r border-slate-300/70 px-2 flex items-center justify-center">Unidade</div>
                <div className="col-span-1 px-2 flex items-center justify-center">Info</div>
              </div>

              {/* Table Rows & Accordion Expand Area */}
              <div className="space-y-3 mt-2">
                {filteredHistory.map((req) => {
                  const isExpanded = expandedRowId === req.id;
                  return (
                    <div
                      key={req.id}
                      className="bg-[#CBD0D8]/90 rounded-2xl border border-slate-300/70 overflow-hidden shadow-2xs"
                    >
                      {/* Main Row Header */}
                      <div className="grid grid-cols-12 gap-2 px-4 py-3.5 text-slate-800 text-center items-center font-medium">
                        
                        {/* ID Solicitação */}
                        <div className="col-span-1 border-r border-slate-400/40 pr-2 flex items-center justify-center font-bold">
                          {req.id}
                        </div>

                        {/* Codigo U.F */}
                        <div className="col-span-2 border-r border-slate-400/40 px-2 flex items-center justify-center font-mono text-sm">
                          {req.codigo}
                        </div>

                        {/* Item */}
                        <div className="col-span-3 border-r border-slate-400/40 px-2 relative flex items-center justify-center min-h-[40px]">
                          <div className="absolute left-1 w-9 h-9 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0 flex items-center justify-center">
                            <img src={req.image} alt={req.item} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-center font-semibold text-slate-900 truncate pl-10 w-full">{req.item}</span>
                        </div>

                        {/* Data da Reserva */}
                        <div className="col-span-2 border-r border-slate-400/40 px-2 flex items-center justify-center font-medium">
                          {req.dataReserva}
                        </div>

                        {/* Quantidade */}
                        <div className="col-span-1 border-r border-slate-400/40 px-2 flex items-center justify-center font-semibold">
                          {req.quantidade}
                        </div>

                        {/* Unidade */}
                        <div className="col-span-2 border-r border-slate-400/40 px-2 flex items-center justify-center text-slate-700 text-sm">
                          {req.unidade}
                        </div>

                        {/* Toggle Arrow (Info) */}
                        <div className="col-span-1 px-2 flex items-center justify-center">
                          <button
                            onClick={() => setExpandedRowId(isExpanded ? null : req.id)}
                            className="p-1.5 rounded-full hover:bg-slate-300/80 transition-transform text-slate-800"
                          >
                            <ChevronDown className={`w-6 h-6 transition-transform duration-200 ${isExpanded ? 'rotate-180' : '-rotate-90'}`} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Accordion Area (Matching Screenshot 2) */}
                      {isExpanded && (
                        <div className="p-4 bg-[#C3C8D1]/80 border-t border-slate-300/80 space-y-3 animate-in fade-in">
                          
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center text-center">
                            
                            {/* Solicitante Box */}
                            <div className="bg-[#CBD0D8] p-3 rounded-2xl border border-slate-300/80 flex flex-col items-center justify-center min-h-[70px]">
                              <span className="text-xs font-bold text-slate-800 mb-1">Solicitante:</span>
                              <span className="text-xs font-bold text-slate-900 leading-tight">{req.solicitante}</span>
                            </div>

                            {/* Data de Recebimento Box */}
                            <div className="bg-[#CBD0D8] p-3 rounded-2xl border border-slate-300/80 flex flex-col items-center justify-center min-h-[70px]">
                              <span className="text-xs font-bold text-slate-800 mb-1">Data de<br/>Recebimento</span>
                              <span className="text-xs font-semibold text-slate-900">{req.dataRecebimento}</span>
                            </div>

                            {/* data de solicitação Box */}
                            <div className="bg-[#CBD0D8] p-3 rounded-2xl border border-slate-300/80 flex flex-col items-center justify-center min-h-[70px]">
                              <span className="text-xs font-bold text-slate-800 mb-1">data de solicitação:</span>
                              <span className="text-xs text-slate-700">{req.dataSolicitacao}</span>
                            </div>

                            {/* data de retirada Box */}
                            <div className="bg-[#CBD0D8] p-3 rounded-2xl border border-slate-300/80 flex flex-col items-center justify-center min-h-[70px]">
                              <span className="text-xs font-bold text-slate-800 mb-1">data de retirada:</span>
                              <span className="text-xs text-slate-700">{req.dataRetirada}</span>
                            </div>

                            {/* PED Box */}
                            <div className="bg-[#CBD0D8] p-3 rounded-2xl border border-slate-300/80 flex flex-col items-center justify-center min-h-[70px]">
                              <span className="text-xs font-bold text-slate-800 mb-1">PED:</span>
                              <span className="text-xs font-semibold text-slate-900">{req.ped}</span>
                            </div>

                          </div>

                          {/* S.A Code in Bottom Right */}
                          <div className="flex justify-end pt-1 pr-2">
                            <span className="text-xs font-semibold text-slate-700 font-mono">
                              {req.saCode}
                            </span>
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </main>
      </div>

      {/* Manual Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-[#0C3B7C] mb-2">Histórico de Solicitações</h3>
            <p className="text-sm text-slate-600">Clique na seta da coluna <strong>Info</strong> para visualizar solicitante, data de recebimento, data de retirada e código S.A.</p>
            <button onClick={() => setShowManualModal(false)} className="mt-4 bg-[#0C3B7C] text-white px-5 py-2 rounded-xl">Entendido</button>
          </div>
        </div>
      )}

    </div>
  );
}