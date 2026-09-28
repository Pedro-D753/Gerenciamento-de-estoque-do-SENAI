import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, BookOpen, BarChart3, FileText, LayoutDashboard, Menu, Check, RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';

export default function ItemDescricao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);
  const [qtd, setQtd] = useState(1);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch item details by ID from API
  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      const data = await api.getItemById(id);
      setItem(data);
      setLoading(false);
    }
    loadItem();
  }, [id]);

  const handleRequisicao = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
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
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          Sistema de Controle e Estoque (SCE SENAI)
        </div>
      </header>

      {/* Red Divider Line */}
      <div className="h-1.5 bg-[#E30613] w-full"></div>

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
                className={`w-full rounded-xl font-medium flex items-center ${isSidebarCollapsed ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3'} bg-[#6B84A6] text-white shadow-md`}
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
                className={`w-full rounded-xl font-medium flex items-center ${isSidebarCollapsed ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3'} text-white hover:bg-white/10`}
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

        {/* Item Detail Panel */}
        <main className="flex-1 bg-white rounded-3xl p-6 flex flex-col justify-start shadow-sm border border-slate-200 overflow-y-auto w-full">
          
          {loading || !item ? (
            <div className="py-32 text-center text-slate-600 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#0C3B7C]" />
              <span className="font-semibold text-base">Carregando especificações do item via API...</span>
            </div>
          ) : (
            <>
              {/* Top Bar: Back Arrow Button */}
              <div className="flex items-center mb-4">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-800 transition-colors flex items-center gap-2 font-semibold text-lg"
                  title="Voltar para a listagem"
                >
                  <ArrowLeft className="w-7 h-7" />
                </button>
              </div>

          {/* Section 1: Hero Section (Image + Title/Summary + Requisition Box) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-8 border-b border-slate-200">
            
            {/* Left: Product Photo */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-2xl overflow-hidden bg-white border border-slate-300 shadow-sm flex items-center justify-center p-2">
                <img 
                  src={item.image} 
                  alt={item.item}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
            </div>

            {/* Middle: Title & Summary */}
            <div className="lg:col-span-4 space-y-4">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                {item.titulo || item.item}
              </h1>

              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {item.resumo || 'Aquecimento Rápido, Com Suporte e Fio de Solda, Certificado INMETRO, Ideal para Eletrônica, Reparos, Placas e Cabos'}
              </p>

              <button 
                onClick={() => navigate('/solicitacao')}
                className="text-blue-600 hover:text-blue-800 text-sm font-bold underline cursor-pointer inline-block"
              >
                Itens parecidos na mesma unidade
              </button>
            </div>

            {/* Right: Requisition Action Box */}
            <div className="lg:col-span-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              {/* Unit Orange Badge */}
              <div className="bg-[#FF551C] text-white font-bold text-center py-2.5 px-4 rounded-xl shadow-xs text-base">
                {item.unidade}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500">Estoque disponível</span>
                
                {/* Quantity Select Stepper */}
                <div className="border border-slate-300 rounded-xl px-4 py-2.5 flex items-center justify-between font-semibold text-slate-800 bg-white shadow-2xs">
                  <span>Quantidade: {qtd}</span>
                  <select 
                    value={qtd} 
                    onChange={(e) => setQtd(parseInt(e.target.value))}
                    className="bg-transparent outline-none cursor-pointer font-bold text-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 10, 15, 20].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fazer requisição Button */}
              <button
                onClick={handleRequisicao}
                className="w-full bg-[#2B4EFF] hover:bg-blue-700 text-white font-extrabold py-3 px-6 rounded-xl shadow-md transition-all transform active:scale-95 text-center text-base"
              >
                Fazer requisição
              </button>

              {/* Item Condition Gauge (Estado do Item) */}
              <div className="pt-2 space-y-1.5 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700 text-center block">Estado do Item</span>
                
                {/* Gauge bar */}
                <div className="grid grid-cols-5 gap-0.5 text-[8px] font-bold text-center text-white">
                  <div className="bg-red-400 py-1 rounded-l-xs">Ruim</div>
                  <div className="bg-amber-400 py-1">Desgastado</div>
                  <div className="bg-lime-400 py-1">Usado</div>
                  <div className="bg-emerald-500 py-1">Bom</div>
                  <div className="bg-emerald-600 py-1 rounded-r-xs ring-2 ring-emerald-700">Perfeito</div>
                </div>
              </div>
            </div>

          </div>

          {/* Section 2: Características do Produto & Descrição */}
          <div className="py-8 border-b border-slate-200 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Características do produto</h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Col 1: Características principais */}
              <div className="lg:col-span-4 space-y-2">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Características principais</h3>
                <div className="rounded-xl overflow-hidden border border-slate-200 text-xs">
                  <div className="flex bg-[#EAECEF] p-3 justify-between font-semibold border-b border-slate-200">
                    <span className="text-slate-600 font-bold">Marca</span>
                    <span className="text-slate-900">{item.marca || 'EletroMassa'}</span>
                  </div>
                  <div className="flex bg-white p-3 justify-between font-semibold border-b border-slate-200">
                    <span className="text-slate-600 font-bold">Modelo</span>
                    <span className="text-slate-900">{item.modelo || 'Ferro de Solda Lápis'}</span>
                  </div>
                  <div className="flex bg-[#EAECEF] p-3 justify-between font-semibold">
                    <span className="text-slate-600 font-bold">Cor</span>
                    <span className="text-slate-900">{item.cor || 'Amarelo'}</span>
                  </div>
                </div>
              </div>

              {/* Col 2: Outros */}
              <div className="lg:col-span-4 space-y-2">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Outros</h3>
                <div className="rounded-xl overflow-hidden border border-slate-200 text-xs">
                  {(item.specsOutros || [
                    { label: 'Tipo de ferro de solda', value: 'Lápis' },
                    { label: 'Potência', value: '100 W' },
                    { label: 'Diâmetro do eletrodo', value: '2 mm' },
                    { label: 'Material da ponta', value: 'Aço Inoxidável' },
                    { label: 'Com luz LED', value: 'Sim' },
                    { label: 'Com ponta removível', value: 'Sim' },
                    { label: 'Inclui suporte', value: 'Sim' }
                  ]).map((spec, idx) => (
                    <div 
                      key={spec.label} 
                      className={`flex p-3 justify-between font-semibold ${idx % 2 === 0 ? 'bg-[#EAECEF]' : 'bg-white'} ${idx < 6 ? 'border-b border-slate-200' : ''}`}
                    >
                      <span className="text-slate-600 font-bold">{spec.label}</span>
                      <span className="text-slate-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 3: Descrição Text Area */}
              <div className="lg:col-span-4 space-y-2">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Descrição</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {item.descricao || 'Este kit completo de ferramentas para soldagem oferece tudo o que você precisa para realizar reparos eletrônicos, projetos DIY e muito mais. O ferro de solda de 100W aquece rapidamente e atinge a temperatura ideal para soldas precisas e eficientes.'}
                </p>
              </div>

            </div>
          </div>

          {/* Section 3: Estatísticas (3 Charts Row) */}
          <div className="pt-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 text-center">Estatísticas</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Requisições por unidade */}
              <div className="bg-[#CBD0D8]/80 rounded-2xl p-4 border border-slate-300/60 shadow-xs flex flex-col items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 text-center mb-2">Requisições por unidade</h3>
                <div className="w-28 h-28 my-1">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="6" strokeDasharray="35 65" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#C084FC" strokeWidth="6" strokeDasharray="40 60" strokeDashoffset="-35" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-75" />
                  </svg>
                </div>
              </div>

              {/* Card 2: Nível de Estoque */}
              <div className="bg-[#CBD0D8]/80 rounded-2xl p-4 border border-slate-300/60 shadow-xs flex flex-col justify-between">
                <h3 className="text-sm font-bold text-slate-900 text-center mb-2">Nível de Estoque</h3>
                <div className="space-y-2 px-2 my-2">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="w-16 font-semibold">Mês Atual</span>
                    <div className="flex-1 bg-slate-300 h-4 rounded-xs overflow-hidden">
                      <div className="bg-[#3B82F6] h-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="w-16 font-semibold">Mês Passado</span>
                    <div className="flex-1 bg-slate-300 h-4 rounded-xs overflow-hidden">
                      <div className="bg-[#3B82F6] h-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-[8px] text-slate-600 font-semibold px-2">
                  <span>0%</span><span>10%</span><span>20%</span><span>30%</span><span>40%</span><span>50%</span><span>60%</span>
                </div>
              </div>

              {/* Card 3: Requisições por Unidade */}
              <div className="bg-[#CBD0D8]/80 rounded-2xl p-4 border border-slate-300/60 shadow-xs flex flex-col items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 text-center mb-2">Requisições por Unidade</h3>
                <div className="w-28 h-28 my-1">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#60A5FA" strokeWidth="6" strokeDasharray="40 60" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#C084FC" strokeWidth="6" strokeDasharray="35 65" strokeDashoffset="-40" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#FBBF24" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-75" />
                  </svg>
                </div>
              </div>

            </div>
          </div>
          </>
          )}

        </main>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in fade-in">
          <div className="bg-white/20 p-1.5 rounded-full">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Requisição realizada com sucesso!</p>
            <p className="text-xs text-emerald-100">{qtd}x {item.item} ({item.unidade})</p>
          </div>
        </div>
      )}

      {/* Manual Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-[#0C3B7C] mb-2">Descrição do Item</h3>
            <p className="text-sm text-slate-600">Visualize as especificações completas do produto, estado de conservação e solicite a quantidade desejada.</p>
            <button onClick={() => setShowManualModal(false)} className="mt-4 bg-[#0C3B7C] text-white px-5 py-2 rounded-xl">Entendido</button>
          </div>
        </div>
      )}

    </div>
  );
}
