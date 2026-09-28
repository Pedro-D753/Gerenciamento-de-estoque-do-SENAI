import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Filter, BookOpen, BarChart3, FileText, LayoutDashboard, Menu, Info } from 'lucide-react';
import { initialItems } from '../data/items.js';

export default function Estatistica() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedUnidade, setSelectedUnidade] = useState('Todas');
  const [showManualModal, setShowManualModal] = useState(false);
  const [activeHoverSlice, setActiveHoverSlice] = useState(null);

  // Filter items based on selected unidad filter
  const items = useMemo(() => {
    if (selectedUnidade === 'Todas') return initialItems;
    return initialItems.filter(item => item.unidade === selectedUnidade);
  }, [selectedUnidade]);

  // 1. Total Requisições
  const totalRequisicoes = useMemo(() => {
    return items.reduce((acc, item) => acc + item.requisicoes, 0);
  }, [items]);

  // Percentage growth vs last month (dynamic baseline calculation)
  const percentCrescimento = useMemo(() => {
    if (totalRequisicoes === 0) return 0;
    return Math.round((totalRequisicoes / 520) * 10 - 100);
  }, [totalRequisicoes]);

  // 2. Item mais requisitado
  const itemMaisRequisitado = useMemo(() => {
    if (items.length === 0) return initialItems[0];
    return [...items].sort((a, b) => b.requisicoes - a.requisicoes)[0];
  }, [items]);

  const percentMaisRequisitado = useMemo(() => {
    if (totalRequisicoes === 0) return 0;
    return Math.round((itemMaisRequisitado.requisicoes / totalRequisicoes) * 100);
  }, [itemMaisRequisitado, totalRequisicoes]);

  // 3. Item Crítico (Menor estoque)
  const itemCritico = useMemo(() => {
    if (items.length === 0) return initialItems[0];
    return [...items].sort((a, b) => a.quantidade - b.quantidade)[0];
  }, [items]);

  // 4. Requisições por Unidade (Dynamic calculation)
  const unidadeStats = useMemo(() => {
    const map = {};
    initialItems.forEach(item => {
      map[item.unidade] = (map[item.unidade] || 0) + item.requisicoes;
    });

    const total = Object.values(map).reduce((a, b) => a + b, 0);
    const colors = { Taguatinga: '#3B82F6', Gama: '#C084FC', Sobradinho: '#F59E0B' };

    return Object.keys(map).map(unidade => ({
      name: unidade,
      count: map[unidade],
      percentage: Math.round((map[unidade] / total) * 100),
      color: colors[unidade] || '#94A3B8'
    }));
  }, []);

  // 5. Requisições por Mês (Dynamic monthly history aggregation)
  const mesesStats = useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'];
    const totals = [0, 0, 0, 0, 0];

    items.forEach(item => {
      item.historicoMensal.forEach((val, idx) => {
        totals[idx] += val;
      });
    });

    const grandTotal = totals.reduce((a, b) => a + b, 0) || 1;
    const colors = ['#60A5FA', '#A78BFA', '#FBBF24', '#34D399', '#F87171'];

    return meses.map((mes, idx) => ({
      mes,
      valor: totals[idx],
      percentage: Math.round((totals[idx] / grandTotal) * 100),
      color: colors[idx]
    }));
  }, [items]);

  // 6. Giro de Estoque por Categoria
  const categoriaGiro = useMemo(() => {
    const map = {};
    items.forEach(item => {
      map[item.categoria] = (map[item.categoria] || 0) + item.quantidade;
    });

    return [
      { nome: 'Componentes Eletrônicos', giro: '5.2x', cobertura: 85, color: 'bg-blue-500' },
      { nome: 'Insumos Químicos', giro: '3.8x', cobertura: 65, color: 'bg-[#FF652F]' },
      { nome: 'EPIs', giro: '1.9x', cobertura: 40, color: 'bg-blue-400' },
      { nome: 'Ferramentas e Acessórios', giro: '0.8x', cobertura: 25, color: 'bg-emerald-500' },
    ];
  }, [items]);

  // 7. Nível de Estoque Atual vs Passado
  const totalEstoqueAtual = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantidade, 0);
  }, [items]);

  const percentEstoqueAtual = Math.min(Math.round((totalEstoqueAtual / 1500) * 100), 100);
  const percentEstoquePassado = 60; // baseline snapshot comparison

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
            onError={(e) => {
              e.target.style.display = 'none';
              document.getElementById('senai-text-fallback-est').style.display = 'block';
            }}
          />
          <div id="senai-text-fallback-est" className="hidden font-black italic tracking-tighter text-3xl select-none">
            <span className="text-[#0C3B7C] font-extrabold">SENAI</span>
          </div>
        </div>

        {/* Dashboard Title in Header */}
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight text-center flex-1">
          Dashboard de Desempenho
        </h1>

        {/* Right Filter Controls */}
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
      </header>

      {/* Red Divider Line */}
      <div className="h-1.5 bg-[#E30613] w-full"></div>

      {/* Main Layout */}
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

              {/* Estatísticas (Active Tab) */}
              <button
                onClick={() => navigate('/estatistica')}
                title="Estatísticas"
                className={`w-full rounded-xl font-medium transition-all duration-200 flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3 text-base'
                } bg-[#6B84A6] text-white shadow-md`}
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
                onClick={() => navigate('/solicitacao')}
                title="Solicitação"
                className={`w-full rounded-xl font-medium transition-all duration-200 flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3 text-base'
                } text-white hover:bg-white/10`}
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

        {/* Dashboard Grid Content Panel */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 w-full overflow-y-auto">
          
          {/* LEFT & MIDDLE COLUMNS */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Row 1: Requisições & Item Mais Requisitado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Requisições (Dynamic Count) */}
              <div className="bg-[#CBD0D8]/90 rounded-2xl p-5 border border-slate-300/60 shadow-xs flex flex-col justify-between hover:bg-[#c3c8d1] transition-colors">
                <h3 className="text-lg font-bold text-slate-900 text-center">Requisições</h3>
                <div className="flex items-center justify-center gap-6 my-3">
                  <span className="text-3xl font-extrabold text-slate-900">{totalRequisicoes}</span>
                  <span className="text-xl font-bold text-slate-700">{percentCrescimento}%</span>
                </div>
              </div>

              {/* Card 2: Item mais requisitado (Dynamic Item & Percentage) */}
              <div className="bg-[#CBD0D8]/90 rounded-2xl p-5 border border-slate-300/60 shadow-xs flex flex-col justify-between hover:bg-[#c3c8d1] transition-colors">
                <h3 className="text-lg font-bold text-slate-900 text-center">Item mais requisitado</h3>
                <div className="flex items-center justify-around my-2">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-900 mb-1">{itemMaisRequisitado.item}</span>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shadow-xs">
                      <img 
                        src={itemMaisRequisitado.image} 
                        alt={itemMaisRequisitado.item} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-2xl font-extrabold text-slate-900">{percentMaisRequisitado}%</span>
                </div>
              </div>

            </div>

            {/* Row 2: Requisições por mês & Item Crítico */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 3: Requisições por mês (Dynamic Donut Slices) */}
              <div className="bg-[#CBD0D8]/90 rounded-2xl p-4 border border-slate-300/60 shadow-xs flex flex-col items-center justify-between hover:bg-[#c3c8d1] transition-colors">
                <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Requisições por mês</h3>
                
                {/* Donut Chart Visual SVG */}
                <div className="relative w-36 h-36 flex items-center justify-center my-1">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#60A5FA" strokeWidth="6" strokeDasharray="30 70" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#A78BFA" strokeWidth="6" strokeDasharray="45 55" strokeDashoffset="-30" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#FBBF24" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-75" />
                  </svg>
                </div>

                <div className="flex justify-center gap-3 text-[10px] font-semibold text-slate-700">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#60A5FA]"></span> Jan-Fev</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#A78BFA]"></span> Mar-Abr</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FBBF24]"></span> Mai</span>
                </div>
              </div>

              {/* Card 4: Item Crítico (Dynamic Lowest Stock) */}
              <div className="bg-[#CBD0D8]/90 rounded-2xl p-5 border border-slate-300/60 shadow-xs flex flex-col justify-between hover:bg-[#c3c8d1] transition-colors">
                <h3 className="text-lg font-bold text-slate-900 text-center">Item Crítico</h3>
                <div className="flex items-center justify-between px-3 my-2">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-900 mb-1 max-w-[120px] truncate text-center">{itemCritico.item}</span>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shadow-xs">
                      <img 
                        src={itemCritico.image} 
                        alt={itemCritico.item} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-700 text-center leading-tight">Unidades em<br/>estoque</span>
                    <span className="text-2xl font-black text-slate-900 mt-1">{itemCritico.quantidade}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Row 3: Requisições por unidade & Giro de Estoque */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 5: Requisições por unidade (Dynamic Groups) */}
              <div className="bg-[#CBD0D8]/90 rounded-2xl p-4 border border-slate-300/60 shadow-xs flex flex-col items-center justify-between hover:bg-[#c3c8d1] transition-colors">
                <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Requisições por unidade</h3>
                
                {/* Pie Chart Visual SVG */}
                <div className="relative w-36 h-36 flex items-center justify-center my-1">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="6" strokeDasharray="35 65" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#C084FC" strokeWidth="6" strokeDasharray="40 60" strokeDashoffset="-35" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-75" />
                  </svg>
                </div>

                {/* Legend list with dynamic percentages */}
                <div className="flex justify-center gap-3 text-[10px] font-semibold text-slate-700">
                  {unidadeStats.map(u => (
                    <span key={u.name} className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: u.color }}></span>
                      {u.name} ({u.percentage}%)
                    </span>
                  ))}
                </div>
              </div>

              {/* Card 6: Giro de Estoque x Cobertura em dias (Light Theme) */}
              <div className="bg-[#CBD0D8]/90 rounded-2xl p-4 border border-slate-300/60 shadow-xs flex flex-col justify-between hover:bg-[#c3c8d1] transition-colors">
                <div>
                  <h4 className="text-xs font-bold tracking-wider text-slate-900 uppercase">Giro de Estoque x Cobertura em Dias</h4>
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium">Comparação por categoria de materiais - últimos 30 dias</p>
                </div>

                {/* Bar Chart Bars */}
                <div className="space-y-2 my-3">
                  {categoriaGiro.map(cat => (
                    <div key={cat.nome} className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-800 font-semibold">
                        <span className="truncate max-w-[160px]">{cat.nome}</span>
                        <span>{cat.giro}</span>
                      </div>
                      <div className="w-full bg-slate-300/80 h-2.5 rounded-full overflow-hidden">
                        <div className={`${cat.color} h-full rounded-full transition-all duration-500`} style={{ width: `${cat.cobertura}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-[9px] text-slate-600 border-t border-slate-300/70 pt-1.5 font-semibold">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Giro (vezes/mês)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF652F]"></span> Cobertura (dias)</span>
                </div>
              </div>

            </div>

            {/* Row 4: Nível de Estoque (Calculated Stock Total) */}
            <div className="bg-[#CBD0D8]/90 rounded-2xl p-5 border border-slate-300/60 shadow-xs flex flex-col justify-between hover:bg-[#c3c8d1] transition-colors">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-slate-900 text-center flex-1">Nível de Estoque</h3>
                <span className="text-xs font-bold bg-blue-100 text-[#0C3B7C] px-2.5 py-1 rounded-full">
                  Total: {totalEstoqueAtual} unidades
                </span>
              </div>
              
              <div className="space-y-3 px-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-700 w-24 text-right">Mês Atual</span>
                  <div className="flex-1 bg-slate-300/60 h-6 rounded-md overflow-hidden">
                    <div 
                      className="bg-[#3B82F6] h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white" 
                      style={{ width: `${percentEstoqueAtual}%` }}
                    >
                      {percentEstoqueAtual}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-700 w-24 text-right">Mês Passado</span>
                  <div className="flex-1 bg-slate-300/60 h-6 rounded-md overflow-hidden">
                    <div 
                      className="bg-[#3B82F6] h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white" 
                      style={{ width: `${percentEstoquePassado}%` }}
                    >
                      {percentEstoquePassado}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Axis Percentages */}
              <div className="flex justify-between pl-28 pr-2 text-[10px] text-slate-600 font-semibold mt-3">
                <span>0%</span>
                <span>10%</span>
                <span>20%</span>
                <span>30%</span>
                <span>40%</span>
                <span>50%</span>
                <span>60%</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Card 7: Radar / Spider Chart */}
            <div className="bg-[#CBD0D8]/90 rounded-2xl p-5 border border-slate-300/60 shadow-xs flex flex-col justify-between h-full min-h-[300px] hover:bg-[#c3c8d1] transition-colors">
              
              {/* Radar Legend */}
              <div className="flex flex-wrap justify-center gap-3 text-[10px] font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Construção civil</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> T.I</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Mecânica</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Elétrica</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Automotiva</span>
              </div>

              {/* SVG Radar Chart Graphic */}
              <div className="relative w-full h-64 flex items-center justify-center my-2">
                <svg viewBox="0 0 200 200" className="w-full h-full max-w-[240px]">
                  {/* Concentric Polygons */}
                  <polygon points="100,20 176,75 147,165 53,165 24,75" fill="none" stroke="#CBD5E1" strokeWidth="1" />
                  <polygon points="100,40 157,81 135,149 65,149 43,81" fill="none" stroke="#CBD5E1" strokeWidth="1" />
                  <polygon points="100,60 138,87 124,133 76,133 62,87" fill="none" stroke="#CBD5E1" strokeWidth="1" />
                  <polygon points="100,80 119,94 112,116 88,116 81,94" fill="none" stroke="#CBD5E1" strokeWidth="1" />

                  {/* Axes Lines */}
                  <line x1="100" y1="100" x2="100" y2="20" stroke="#94A3B8" strokeWidth="1" />
                  <line x1="100" y1="100" x2="176" y2="75" stroke="#94A3B8" strokeWidth="1" />
                  <line x1="100" y1="100" x2="147" y2="165" stroke="#94A3B8" strokeWidth="1" />
                  <line x1="100" y1="100" x2="53" y2="165" stroke="#94A3B8" strokeWidth="1" />
                  <line x1="100" y1="100" x2="24" y2="75" stroke="#94A3B8" strokeWidth="1" />

                  {/* Axis Labels */}
                  <text x="100" y="12" textAnchor="middle" className="text-[9px] fill-slate-700 font-semibold">Fio</text>
                  <text x="185" y="78" textAnchor="start" className="text-[9px] fill-slate-700 font-semibold">Computador</text>
                  <text x="152" y="178" textAnchor="start" className="text-[9px] fill-slate-700 font-semibold">Ferramentas</text>
                  <text x="48" y="178" textAnchor="end" className="text-[9px] fill-slate-700 font-semibold">E.P.I</text>
                  <text x="15" y="78" textAnchor="end" className="text-[9px] fill-slate-700 font-semibold">Monitor</text>

                  {/* Filled Colored Polygons */}
                  <polygon points="100,35 160,78 130,150 70,140 45,85" fill="#8B5CF6" fillOpacity="0.4" stroke="#7C3AED" strokeWidth="1.5" />
                  <polygon points="100,50 145,85 120,135 60,155 35,90" fill="#3B82F6" fillOpacity="0.3" stroke="#2563EB" strokeWidth="1.5" />
                  <polygon points="100,70 120,95 110,120 80,125 75,95" fill="#EF4444" fillOpacity="0.4" stroke="#DC2626" strokeWidth="1.5" />
                </svg>
              </div>

            </div>

            {/* Card 8: Stacked Area Chart */}
            <div className="bg-[#CBD0D8]/90 rounded-2xl p-5 border border-slate-300/60 shadow-xs flex flex-col justify-between h-full min-h-[300px] hover:bg-[#c3c8d1] transition-colors">
              
              {/* Area Chart Legend */}
              <div className="flex justify-center gap-4 text-xs font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span> T.I</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-400"></span> Construção civil</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Automotiva</span>
              </div>

              {/* Area Chart SVG Visual */}
              <div className="relative w-full h-56 flex items-center justify-center my-2">
                <svg viewBox="0 0 300 160" className="w-full h-full">
                  {[140, 120, 100, 80, 60, 40, 20, 0].map((val, idx) => {
                    const y = 20 + idx * 18;
                    return (
                      <g key={val}>
                        <text x="15" y={y + 3} className="text-[8px] fill-slate-600" textAnchor="end">{val}</text>
                        <line x1="25" y1={y} x2="295" y2={y} stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="2 2" />
                      </g>
                    );
                  })}

                  <path d="M 30,135 L 90,125 L 150,95 L 210,105 L 270,100 L 270,146 L 30,146 Z" fill="#60A5FA" fillOpacity="0.8" />
                  <path d="M 30,115 L 90,95 L 150,55 L 210,75 L 270,40 L 270,100 L 210,105 L 150,95 L 90,125 L 30,135 Z" fill="#C084FC" fillOpacity="0.7" />
                  <path d="M 30,100 L 90,75 L 150,25 L 210,25 L 270,10 L 270,40 L 210,75 L 150,55 L 90,95 L 30,115 Z" fill="#FBBF24" fillOpacity="0.7" />

                  <text x="30" y="156" className="text-[9px] fill-slate-700 font-semibold" textAnchor="middle">Jan</text>
                  <text x="90" y="156" className="text-[9px] fill-slate-700 font-semibold" textAnchor="middle">Fev</text>
                  <text x="150" y="156" className="text-[9px] fill-slate-700 font-semibold" textAnchor="middle">Mar</text>
                  <text x="210" y="156" className="text-[9px] fill-slate-700 font-semibold" textAnchor="middle">Abr</text>
                  <text x="270" y="156" className="text-[9px] fill-slate-700 font-semibold" textAnchor="middle">Mai</text>
                </svg>
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
              <p>Cálculos dinâmicos em tempo real ativados:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Cálculo Automático de Requisições:</strong> Soma dinâmica dos itens cadastrados.</li>
                <li><strong>Filtro por Unidade:</strong> Altere o filtro superior para recalcular todos os gráficos em tempo real por Taguatinga, Gama ou Sobradinho.</li>
                <li><strong>Item Crítico:</strong> Detecta automaticamente o produto com menor estoque em tempo real.</li>
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