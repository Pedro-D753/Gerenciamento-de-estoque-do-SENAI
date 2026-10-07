import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { SenaiLogo } from './SenaiLogo';
import { Menu, Circle, ArrowUp, X } from 'lucide-react';

export const Layout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const location = useLocation();

  const isCadastroPage = location.pathname.startsWith('/cadastro');

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans">
      {/* Top Header */}
      <header className="h-16 bg-white flex items-center justify-between px-7 border-b-4 border-[#e24914] relative z-20 shadow-xs">
        <div className="flex items-center gap-4">
          <SenaiLogo className="h-8" />
        </div>

        {/* Legend in Header for Visão Geral & Histórico */}
        {!isCadastroPage && (
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-medium text-gray-700">Aprovado</span>
              <div className="w-[22px] h-[22px] rounded border border-gray-400 flex items-center justify-center bg-gray-100">
                <Circle size={12} className="text-gray-500" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-medium text-gray-700">Retirada do estoque</span>
              <div className="w-[22px] h-[22px] rounded bg-[#103ae5] flex items-center justify-center shadow-xs">
                <ArrowUp size={14} className="text-white" strokeWidth={3} />
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-medium text-gray-700">Aceitar solicitação</span>
              <div className="w-[22px] h-[22px] rounded border-2 border-[#0ec015] flex items-center justify-center">
                <Circle size={12} className="text-[#0ec015]" strokeWidth={3} />
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-medium text-gray-700">Recusar solicitação</span>
              <div className="w-[22px] h-[22px] rounded bg-[#d61818] flex items-center justify-center shadow-xs">
                <X size={14} className="text-white" strokeWidth={3} />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <div className="flex flex-1 min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside
          className={`bg-[#0b499e] flex flex-col transition-all duration-300 z-30 shadow-md ${
            isSidebarExpanded ? 'w-44' : 'w-14'
          }`}
        >
          {/* Menu Toggle */}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="text-white p-3.5 flex items-center justify-center border-b border-white/20 hover:bg-white/10 transition cursor-pointer"
            title="Alternar Menu"
          >
            <Menu size={24} />
          </button>

          {/* Navigation Links with React Router */}
          <nav className="flex flex-col mt-1 gap-0.5">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-white transition flex items-center ${
                  isSidebarExpanded ? 'px-4 py-3.5 text-[15px] font-medium' : 'py-3.5 justify-center font-bold text-lg'
                } ${
                  isActive
                    ? 'bg-[#3d6ea8] font-semibold border-l-4 border-white'
                    : 'hover:bg-white/10'
                }`
              }
              title="Visão Geral"
            >
              {isSidebarExpanded ? 'Visão Geral' : 'V'}
            </NavLink>

            <NavLink
              to="/historico"
              className={({ isActive }) =>
                `text-white transition flex items-center ${
                  isSidebarExpanded ? 'px-4 py-3.5 text-[15px] font-medium' : 'py-3.5 justify-center font-bold text-lg'
                } ${
                  isActive
                    ? 'bg-[#3d6ea8] font-semibold border-l-4 border-white'
                    : 'hover:bg-white/10'
                }`
              }
              title="Histórico"
            >
              {isSidebarExpanded ? 'Histórico' : 'H'}
            </NavLink>

            <NavLink
              to="/cadastro"
              className={({ isActive }) =>
                `text-white transition flex items-center ${
                  isSidebarExpanded ? 'px-4 py-3.5 text-[15px] font-medium' : 'py-3.5 justify-center font-bold text-lg'
                } ${
                  isActive
                    ? 'bg-[#3d6ea8] font-semibold border-l-4 border-white'
                    : 'hover:bg-white/10'
                }`
              }
              title="Cadastro"
            >
              {isSidebarExpanded ? 'Cadastro' : 'C'}
            </NavLink>
          </nav>

          {/* Footer Button */}
          <div className="mt-auto p-2.5">
            <button
              onClick={() => setShowManualModal(true)}
              className="bg-[#ff601c] hover:bg-[#e54f10] text-white rounded-lg p-2 text-xs font-bold w-full text-center transition shadow-md hover:shadow-lg cursor-pointer"
            >
              {isSidebarExpanded ? 'Manual de Usuário' : 'Manual'}
            </button>
          </div>
        </aside>

        {/* Content Area with Outlet */}
        <main className="flex-1 bg-white p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Manual Modal */}
      {showManualModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setShowManualModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-[#0b499e] mb-3">
              Manual do Usuário - Sistema de Estoque SENAI
            </h3>
            <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
              <p>
                <strong>1. Visão Geral (V):</strong> Acompanhe as solicitações em aberto, realize retiradas, aprove ou recuse solicitações de materiais.
              </p>
              <p>
                <strong>2. Histórico (H):</strong> Visualize a listagem completa do inventário com quantidades em estoque, reservas, histórico de entradas/saídas e tempo de permanência em prateleira.
              </p>
              <p>
                <strong>3. Cadastro (C):</strong> Cadastre novos itens com fotos, especificações técnicas detalhadas, leitor/código de barras e opção de controle de devolução.
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowManualModal(false)}
                className="bg-[#0045a5] hover:bg-[#003785] text-white px-5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
