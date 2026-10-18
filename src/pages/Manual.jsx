import { ArrowLeft, BarChart3, FileText, Package, Users } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';

const sections = [
  { icon: Package, title: 'Produtos', text: 'Consulte os itens disponíveis, estoque, reservas e unidade de cada produto.' },
  { icon: FileText, title: 'Solicitações', text: 'Crie solicitações de retirada e acompanhe o andamento pelo menu de solicitações.' },
  { icon: BarChart3, title: 'Estatísticas', text: 'Visualize os indicadores e os produtos mais solicitados no estoque.' },
  { icon: Users, title: 'Usuários', text: 'Managers podem cadastrar usuários, definir permissões e selecionar a unidade de cada acesso.' },
];

export default function Manual() {
  return (
    <AppShell activeTab="Manual do Usuário">
      <div className="min-h-full overflow-x-hidden p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => window.history.back()} className="mb-5 inline-flex items-center gap-2 bg-transparent p-0 text-sm font-semibold text-[#164194] hover:underline">
          <ArrowLeft size={16} /> Voltar ao início
        </button>
        <header className="mt-6 rounded-2xl bg-[#164194] p-8 text-white shadow-lg">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-200">Sistema de Controle e Estoque</p>
          <h1 className="mt-2 text-3xl font-bold">Manual do usuário</h1>
          <p className="mt-3 max-w-2xl text-blue-100">Encontre orientações rápidas para navegar pelo sistema e realizar as principais tarefas.</p>
        </header>
        <section className="mt-8 grid gap-5 sm:grid-cols-2">
          {sections.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-[#0C3B7C]">
                <Icon size={22} />
                <h2 className="text-lg font-bold">{title}</h2>
              </div>
              <p className="mt-3 leading-relaxed text-slate-600">{text}</p>
            </article>
          ))}
        </section>
      </div>
      </div>
    </AppShell>
  );
}
