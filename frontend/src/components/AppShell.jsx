import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, FileText, LayoutDashboard, Menu, UserPlus } from 'lucide-react';

export default function AppShell({ activeTab, children }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const linkClass = (tab) => `flex w-full items-center rounded-xl font-medium transition-colors ${
    !expanded ? 'justify-center p-3' : 'gap-3 px-4 py-3 text-base'
  } ${activeTab === tab ? 'bg-[#6B84A6] text-white shadow-md' : 'text-white hover:bg-white/25'}`;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F4F6F9]">
      <header className="fixed left-0 top-0 z-30 flex h-20 w-full items-center border-b border-gray-200 bg-white px-4 py-2 md:px-6">
        <img src="/Senai.png" alt="Logo Senai" className="h-10 w-auto object-contain p-2 md:h-12" />
        <div className="absolute inset-x-0 -bottom-0.5 h-1.5 bg-[#E84910]" />
      </header>
      <div className="flex min-h-screen w-full flex-1 pt-20">
        <aside className={`sticky top-20 z-20 flex min-h-[calc(100vh-80px)] h-[calc(100vh-80px)] shrink-0 flex-col items-center gap-4 bg-[#164194] p-2 text-white transition-all duration-300 md:p-4 ${expanded ? 'w-64' : 'w-16 md:w-20'}`}>
          <div className="flex w-full flex-1 flex-col gap-3">
            <button onClick={() => setExpanded((value) => !value)} title={expanded ? 'Recolher menu' : 'Expandir menu'} className={`flex w-full items-center rounded-xl p-2 text-white hover:bg-white/25 ${expanded ? 'justify-start gap-3 px-3' : 'justify-center'}`}>
              <Menu className="h-6 w-6 shrink-0" />
              {expanded && <span className="text-sm font-semibold uppercase tracking-wider text-slate-200">Menu</span>}
            </button>
            <div className="my-1 h-0.5 w-full bg-white/20" />
            <button onClick={() => navigate('/')} className={`transition-all duration-200 ${linkClass('Visão Geral')}`} title="Visão Geral"><LayoutDashboard className="h-6 w-6 shrink-0" />{expanded && <span className="truncate">Visão Geral</span>}</button>
            <button onClick={() => navigate('/estatistica')} className={`transition-all duration-200 ${linkClass('Estatísticas')}`} title="Estatísticas"><BarChart3 className="h-6 w-6 shrink-0" />{expanded && <span className="truncate">Estatísticas</span>}</button>
            <button onClick={() => navigate('/solicitacao')} className={`transition-all duration-200 ${linkClass('Solicitação')}`} title="Solicitação"><FileText className="h-6 w-6 shrink-0" />{expanded && <span className="truncate">Solicitação</span>}</button>
            <button onClick={() => navigate('/usuarios')} className={`transition-all duration-200 ${linkClass('Usuários')}`} title="Gerenciar usuários"><UserPlus className="h-6 w-6 shrink-0" />{expanded && <span className="truncate">Usuários</span>}</button>
            <button onClick={() => navigate('/manualdousuario')} className={`mt-auto transition-all duration-200 ${linkClass('Manual do Usuário')}`} title="Manual do Usuário"><FileText className="h-6 w-6 shrink-0" />{expanded && <span className="truncate">Manual do Usuário</span>}</button>
          </div>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col bg-[#D8DCE3]">{children}</main>
      </div>
    </div>
  );
}
