import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Filter, BookOpen, BarChart3, FileText, LayoutDashboard, Menu, Check } from 'lucide-react';
import { initialItems } from '../data/items.js';

export default function Solicitacao() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnidade, setSelectedUnidade] = useState('Todas');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showSolicitacaoModal, setShowSolicitacaoModal] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(1); // Default Pendrive checked as in screenshot 1

  // Modal Form State
  const [modalItem, setModalItem] = useState('Pendrive');
  const [modalCodigo, setModalCodigo] = useState('0010151110');
  const [modalQuantidade, setModalQuantidade] = useState(1);
  const [modalMedida, setModalMedida] = useState('Unidade');
  const [modalUnidade, setModalUnidade] = useState('Taguatinga');
  const [modalSolicitante, setModalSolicitante] = useState('');
  const [modalDevolucao, setModalDevolucao] = useState(false);
  const [modalMensagem, setModalMensagem] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  const [items] = useState(initialItems);

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

  // Open modal prefilled with selected item details
  const handleOpenModal = (item) => {
    if (item) {
      setModalItem(item.item);
      setModalCodigo(item.codigo);
      setModalUnidade(item.unidade);
      setSelectedRowId(item.id);
    }
    setShowSolicitacaoModal(true);
  };

  const handleEnviarSolicitacao = (e) => {
    e.preventDefault();
    setShowSolicitacaoModal(false);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 4000);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      
      {/* Top Header */}
      <header className="bg-white px-6 py-3 flex items-center justify-between shadow-xs z-10 w-full border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <img 
            src="/Senai.png" 
            alt="SENAI Logo" 
            className="h-10 md:h-12 object-contain cursor-pointer"
            onClick={() => navigate('/')}
            onError={(e) => {
              e.target.style.display = 'none';
              document.getElementById('senai-text-fallback-sol').style.display = 'block';
            }}
          />
          <div id="senai-text-fallback-sol" className="hidden font-black italic tracking-tighter text-3xl select-none">
            <span className="text-[#0C3B7C] font-extrabold">SENAI</span>
          </div>
        </div>

        {/* Header Title */}
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight text-center flex-1">
          Solicitações
        </h1>

        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          Sistema de Controle e Estoque (SCE)
        </div>
      </header>

      {/* Red Divider Line */}
      <div className="h-1.5 bg-[#E30613] w-full"></div>

      {/* Sub-Navigation Bar Below Header (Solicitar | Gerenciar | Historico) */}
      <div className="bg-[#D8DCE3] border-b border-slate-300 px-6 pt-2 flex items-center gap-2 text-center text-sm md:text-base font-semibold">
        <button
          onClick={() => navigate('/solicitacao')}
          className="bg-[#CBD0D8] text-slate-900 px-10 md:px-16 py-2.5 rounded-t-xl border-t border-x border-slate-300/80 shadow-xs font-bold"
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
          className="text-slate-700 hover:bg-[#CBD0D8]/60 px-10 md:px-16 py-2.5 rounded-t-xl transition-colors font-medium"
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
                onClick={() => navigate('/')}
                title="Visão Geral"
                className={`w-full rounded-xl font-medium transition-all duration-200 flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3 text-base'
                } text-white hover:bg-white/10`}
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

              {/* Estatísticas */}
              <button
                onClick={() => navigate('/estatistica')}
                title="Estatísticas"
                className={`w-full rounded-xl font-medium transition-all duration-200 flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3 text-base'
                } text-white hover:bg-white/10`}
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

              {/* Solicitação (Active Tab) */}
              <button
                onClick={() => navigate('/solicitacao')}
                title="Solicitação"
                className={`w-full rounded-xl font-medium transition-all duration-200 flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3 text-base'
                } bg-[#6B84A6] text-white shadow-md`}
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

        {/* Content Panel */}
        <main className="flex-1 bg-[#D8DCE3] rounded-3xl p-4 md:p-6 flex flex-col justify-start shadow-sm border border-slate-300/70 overflow-hidden w-full">
          
          {/* Controls Bar: Search Input + Blue Search Icon + Filter + Solicitar Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 w-full">
            
            {/* Search Input Group */}
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

              {/* Filter Dropdown */}
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  aria-label="Opções de Filtro"
                  className="bg-[#CBD0D8] hover:bg-[#bcc2cd] text-slate-700 p-2.5 rounded-xl border border-slate-300/60 shadow-xs transition-colors flex items-center justify-center"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="bg-[#CBD0D8] hover:bg-[#bcc2cd] text-slate-700 font-medium px-6 py-2 rounded-xl border border-slate-300/60 shadow-xs transition-colors flex items-center gap-2"
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

              {/* Search Icon Circle */}
              <button 
                onClick={() => {}} 
                aria-label="Buscar"
                className="bg-[#0C3B7C] hover:bg-[#092c5c] text-white p-2.5 rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Bright Blue SOLICITAR Button on top-right */}
            <button
              onClick={() => {
                const currentSelectedItem = items.find(i => i.id === selectedRowId) || items[0];
                handleOpenModal(currentSelectedItem);
              }}
              className="bg-[#2B4EFF] hover:bg-blue-700 text-white font-extrabold px-10 py-3 rounded-xl shadow-lg transition-all transform active:scale-95 text-base flex items-center justify-center gap-2 self-end sm:self-auto"
            >
              <span>Solicitar</span>
            </button>

          </div>

          {/* Table Container */}
          <div className="w-full overflow-x-auto flex-1">
            <div className="min-w-[800px] w-full">
              
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#D0D5DE]/80 text-slate-800 font-semibold text-sm rounded-t-xl text-center border-b border-slate-300/80">
                <div className="col-span-1 border-r border-slate-300/70 pr-2 flex items-center justify-center">ID</div>
                <div className="col-span-2 border-r border-slate-300/70 px-2 flex items-center justify-center">Codigo U.F</div>
                <div className="col-span-3 border-r border-slate-300/70 px-2 flex items-center justify-center">Item</div>
                <div className="col-span-2 border-r border-slate-300/70 px-2 flex items-center justify-center">Quantidade</div>
                <div className="col-span-1 border-r border-slate-300/70 px-2 flex items-center justify-center">Reserva</div>
                <div className="col-span-2 border-r border-slate-300/70 px-2 flex items-center justify-center">Unidade</div>
                <div className="col-span-1 px-2 flex items-center justify-center">Reservar</div>
              </div>

              {/* Rows List */}
              <div className="space-y-2 mt-2">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const isChecked = selectedRowId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`grid grid-cols-12 gap-2 px-4 py-3 text-slate-800 rounded-xl text-center items-center font-medium shadow-2xs transition-all duration-150 border ${
                          isChecked ? 'bg-[#CBD0D8] border-blue-500 ring-2 ring-blue-500/50' : 'bg-[#CBD0D8]/90 hover:bg-[#c3c8d1] border-slate-300/50'
                        }`}
                      >
                        {/* ID */}
                        <div className="col-span-1 border-r border-slate-400/40 pr-2 flex items-center justify-center font-bold">
                          {item.id}
                        </div>

                        {/* Codigo U.F */}
                        <div className="col-span-2 border-r border-slate-400/40 px-2 flex items-center justify-center tracking-wide font-mono text-sm">
                          {item.codigo}
                        </div>

                        {/* Item with Image fixed left and text centered */}
                        <div className="col-span-3 border-r border-slate-400/40 px-2 relative flex items-center justify-center min-h-[40px]">
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
                        <div className="col-span-2 border-r border-slate-400/40 px-2 flex items-center justify-center text-slate-700">
                          {item.unidade}
                        </div>

                        {/* Reservar Checkbox */}
                        <div className="col-span-1 px-2 flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedRowId(item.id);
                              setModalItem(item.item);
                              setModalCodigo(item.codigo);
                              setModalUnidade(item.unidade);
                            }}
                            className="w-6 h-6 rounded border-2 border-slate-400 text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#2B4EFF]"
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-500 bg-[#CBD0D8]/50 rounded-xl font-medium">
                    Nenhum item encontrado para solicitação.
                  </div>
                )}
              </div>

            </div>
          </div>

        </main>
      </div>

      {/* POPUP MODAL: "Nova solicitação" */}
      {showSolicitacaoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#CBD0D8] rounded-2xl shadow-2xl max-w-lg w-full border border-slate-400/80 overflow-hidden">
            
            {/* Header: Dark Blue Header with Top Orange Accent */}
            <div className="bg-[#0C3B7C] text-white text-center py-4 px-6 font-extrabold text-xl tracking-wide border-t-4 border-[#FF652F] shadow-sm flex items-center justify-center">
              <span>Nova solicitação</span>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEnviarSolicitacao} className="p-6 space-y-4 text-slate-800 text-sm font-semibold">
              
              {/* Row 1: Item & Código U.F */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-900 font-bold">Item:</label>
                  <input
                    type="text"
                    placeholder="Nome do item..."
                    value={modalItem}
                    onChange={(e) => setModalItem(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-[#0C3B7C] shadow-2xs font-normal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-900 font-bold">Código U.F:</label>
                  <input
                    type="text"
                    placeholder="Código..."
                    value={modalCodigo}
                    onChange={(e) => setModalCodigo(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-[#0C3B7C] shadow-2xs font-normal"
                  />
                </div>
              </div>

              {/* Row 2: Quantidade, Medida & Unidade */}
              <div className="grid grid-cols-12 gap-3 items-end">
                
                {/* Quantidade Stepper Box */}
                <div className="col-span-5 space-y-1">
                  <label className="block text-slate-900 font-bold">Quantidade:</label>
                  <div className="flex border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                    <input
                      type="number"
                      min="1"
                      value={modalQuantidade}
                      onChange={(e) => setModalQuantidade(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 outline-none text-slate-800 font-normal text-base"
                    />
                    <div className="flex flex-col border-l border-slate-300 bg-slate-200">
                      <button
                        type="button"
                        onClick={() => setModalQuantidade(prev => prev + 1)}
                        className="px-2 py-0.5 text-xs font-bold hover:bg-slate-300 border-b border-slate-300 text-slate-700"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalQuantidade(prev => Math.max(1, prev - 1))}
                        className="px-2 py-0.5 text-xs font-bold hover:bg-slate-300 text-slate-700"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>

                {/* Medida Dropdown */}
                <div className="col-span-3 space-y-1">
                  <label className="block text-slate-900 font-bold">Medida</label>
                  <select
                    value={modalMedida}
                    onChange={(e) => setModalMedida(e.target.value)}
                    className="w-full bg-[#CBD0D8] border border-slate-400 rounded-lg px-2 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-[#0C3B7C] font-semibold cursor-pointer"
                  >
                    <option value="M">M</option>
                    <option value="Unidade">Unidade</option>
                    <option value="Kg">Kg</option>
                    <option value="L">L</option>
                  </select>
                </div>

                {/* Unidade Dropdown */}
                <div className="col-span-4 space-y-1">
                  <label className="block text-slate-900 font-bold">Unidade</label>
                  <select
                    value={modalUnidade}
                    onChange={(e) => setModalUnidade(e.target.value)}
                    className="w-full bg-[#CBD0D8] border border-slate-400 rounded-lg px-2 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-[#0C3B7C] font-semibold cursor-pointer truncate"
                  >
                    <option value="Taguatinga">Taguatinga</option>
                    <option value="Gama">Gama</option>
                    <option value="Sobradinho">Sobradinho</option>
                  </select>
                </div>

              </div>

              {/* Row 3: Solicitante & Devolução */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-9 space-y-1">
                  <label className="block text-slate-900 font-bold">Solicitante</label>
                  <input
                    type="text"
                    placeholder="Nome do solicitante..."
                    value={modalSolicitante}
                    onChange={(e) => setModalSolicitante(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-[#0C3B7C] shadow-2xs font-normal"
                  />
                </div>

                <div className="sm:col-span-3 flex flex-col items-center justify-center space-y-1 sm:mt-5">
                  <span className="text-slate-900 font-bold text-xs">Devolução</span>
                  <input
                    type="checkbox"
                    checked={modalDevolucao}
                    onChange={(e) => setModalDevolucao(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-400 text-[#0C3B7C] focus:ring-[#0C3B7C] cursor-pointer accent-[#0C3B7C]"
                  />
                </div>
              </div>

              {/* Row 4: menssagem de solicitação */}
              <div className="space-y-1">
                <label className="block text-slate-900 font-bold">menssagem de solicitação</label>
                <textarea
                  placeholder="Descreva sua solicitação aqui..."
                  rows={3}
                  value={modalMensagem}
                  onChange={(e) => setModalMensagem(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#0C3B7C] text-slate-800 font-normal shadow-2xs"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#003B96] hover:bg-blue-900 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-95 text-center"
                >
                  Enviar solicitação
                </button>
                <button
                  type="button"
                  onClick={() => setShowSolicitacaoModal(false)}
                  className="flex-1 bg-[#FF4500] hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-95 text-center"
                >
                  cancelar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white/20 p-1.5 rounded-full">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Solicitação enviada com sucesso!</p>
            <p className="text-xs text-emerald-100">Item: {modalItem} | Solicitante: {modalSolicitante || 'Usuário'}</p>
          </div>
        </div>
      )}

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
              <p>Bem-vindo ao módulo de Solicitações (SCE SENAI).</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Nova Solicitação:</strong> Clique no botão azul "Solicitar" no topo ou selecione um item na tabela.</li>
                <li><strong>Sub-navegação:</strong> Alterne entre Solicitar, Gerenciar e Histórico no menu superior.</li>
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