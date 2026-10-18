import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api.js';

export default function RedefinirSenha() {
  const { jwt } = useParams();
  const navigate = useNavigate();
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (senha !== confirmacao) {
      setError('As senhas não conferem.');
      return;
    }
    setLoading(true);
    try {
      await api.confirmarRedefinicaoSenha(jwt, senha);
      setSuccess('Senha redefinida com sucesso. Você já pode entrar no sistema.');
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (requestError) {
      setError(requestError.message || 'O link é inválido ou expirou.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <img src="/Senai.png" alt="SENAI" className="mx-auto mb-6 h-14 w-auto" />
        <h1 className="text-center text-2xl font-bold text-[#0C3B7C]">Criar nova senha</h1>
        <p className="mt-2 text-center text-slate-500">Escolha uma senha segura para sua conta.</p>
        <label className="mt-6 block text-sm font-semibold text-slate-700" htmlFor="new-password">Nova senha</label>
        <input id="new-password" type="password" value={senha} onChange={(event) => setSenha(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" minLength="6" required />
        <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="confirm-password">Confirmar senha</label>
        <input id="confirm-password" type="password" value={confirmacao} onChange={(event) => setConfirmacao(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" minLength="6" required />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-3 text-sm text-emerald-600">{success}</p>}
        <button type="submit" disabled={loading || Boolean(success)} className="mt-6 w-full rounded-lg bg-[#164194] py-3 font-semibold text-white hover:bg-[#0C3B7C] disabled:opacity-60">{loading ? 'Salvando...' : 'Salvar nova senha'}</button>
        <Link to="/login" className="mt-4 block text-center text-sm font-medium text-[#164194] hover:underline">Voltar para o login</Link>
      </form>
    </main>
  );
}
