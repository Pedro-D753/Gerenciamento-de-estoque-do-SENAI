import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, UserPlus } from 'lucide-react';
import { api } from '../services/api.js';
import AppShell from '../components/AppShell.jsx';

const initialForm = { nome: '', email: '', senha: '', matricula: '', is_admin: false, is_ativo: true, unidade_id: '' };

export default function Usuarios() {
  const [form, setForm] = useState(initialForm);
  const [usuarios, setUsuarios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadUsers() {
    try {
      setLoading(true);
      setUsuarios(await api.getUsers());
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  }

  async function loadUnidades() {
    try {
      setUnidades(await api.getUnidades());
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível carregar as unidades.');
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
      loadUnidades();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      await api.criarUser({ ...form, unidade_id: Number(form.unidade_id) });
      setForm(initialForm);
      setMessage('Usuário criado com sucesso.');
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível criar o usuário.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell activeTab="Usuários">
      <div className="min-h-full overflow-x-hidden p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
        <button type="button" onClick={() => window.history.back()} className="mb-5 inline-flex items-center gap-2 bg-transparent p-0 text-sm font-semibold text-[#164194] hover:underline"><ArrowLeft size={16} /> Voltar</button>
        <div className="mt-6 flex items-center gap-3">
          <div className="rounded-xl bg-[#164194] p-3 text-white"><UserPlus size={24} /></div>
          <div><h1 className="text-3xl font-bold text-[#0C3B7C]">Gerenciar usuários</h1><p className="text-slate-500">Crie acessos para os colaboradores do sistema.</p></div>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">Novo usuário</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo" name="nome" value={form.nome} onChange={updateField} required />
              <Field label="Matrícula" name="matricula" value={form.matricula} onChange={updateField} required />
              <Field label="E-mail" name="email" type="email" value={form.email} onChange={updateField} required />
              <Field label="Senha inicial" name="senha" type="password" minLength="6" value={form.senha} onChange={updateField} required />
              <label className="block text-sm font-semibold text-slate-700">
                Unidade
                <select name="unidade_id" value={form.unidade_id} onChange={updateField} required className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal">
                  <option value="">Selecione a unidade</option>
                  {unidades.map((unidade) => (
                    <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" name="is_admin" checked={form.is_admin} onChange={updateField} /> Usuário administrador</label>
            <label className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" name="is_ativo" checked={form.is_ativo} onChange={updateField} /> Usuário ativo</label>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {message && <p className="mt-4 flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 size={16} /> {message}</p>}
            <button type="submit" disabled={saving} className="mt-6 w-full rounded-lg bg-[#164194] py-3 font-semibold text-white hover:bg-[#0C3B7C] disabled:opacity-60">{saving ? 'Criando...' : 'Criar usuário'}</button>
          </form>
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">Usuários cadastrados</h2>
            {loading ? <p className="mt-5 text-slate-500">Carregando...</p> : usuarios.length === 0 ? <p className="mt-5 text-slate-500">Nenhum usuário cadastrado.</p> : (
              <div className="master-table-wrap mt-4 overflow-x-auto rounded-xl border border-slate-400"><table className="master-data-table w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b"><th className="px-3 py-3">Nome</th><th className="px-3 py-3">Matrícula</th><th className="px-3 py-3">E-mail</th><th className="px-3 py-3">Unidade</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{usuarios.map((usuario) => <tr key={usuario.id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{usuario.nome}</td><td className="px-3 py-3">{usuario.matricula}</td><td className="break-all px-3 py-3">{usuario.email}</td><td className="px-3 py-3">{unidades.find((unidade) => Number(unidade.id) === Number(usuario.unidade_id))?.nome || 'Unidade não identificada'}</td><td className="px-3 py-3">{usuario.is_ativo ? 'Ativo' : 'Inativo'}</td></tr>)}</tbody></table></div>
            )}
          </section>
        </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, name, ...props }) {
  return <label className="block text-sm font-semibold text-slate-700">{label}<input name={name} {...props} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>;
}
