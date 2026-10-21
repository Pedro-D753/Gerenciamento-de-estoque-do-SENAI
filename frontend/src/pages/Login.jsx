import { useState } from 'react';
import { api } from '../services/api.js';

function estoquistaUrl(token) {
  if (window.location.port === '5173') {
    return `${window.location.protocol}//${window.location.hostname}:5174/estoquista/?access_token=${encodeURIComponent(token)}`;
  }
  return '/estoquista/';
}

function masterHomeUrl() {
  if (window.location.pathname === '/login') return '/master/';
  return '/';
}

export default function Login() {
  const sessionExpired = new URLSearchParams(window.location.search).get('expired') === '1';
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.login(matricula.trim(), senha);
      const user = await api.currentUser();
      if (!user.is_admin) {
        window.location.assign(estoquistaUrl(localStorage.getItem('sce_access_token')));
        return;
      }
      window.location.assign(masterHomeUrl());
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível realizar o login.');
    } finally {
      setLoading(false);
    }

  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setForgotLoading(true);
    try {
      await api.solicitarRedefinicaoSenha(email.trim());
      setForgotMessage('Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.');
      setEmail('');
    } catch (requestError) {
      setForgotError(requestError.message || 'Não foi possível enviar o e-mail de redefinição.');
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <img src={`${import.meta.env.BASE_URL}Senai.png`} alt="SENAI" className="h-14 w-auto mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-center text-[#0C3B7C]">Acesso do usuário</h1>
        <p className="text-center text-slate-500 mt-2 mb-6">Sistema de Controle e Estoque</p>
        {sessionExpired && (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Sua sessão expirou. Entre novamente para continuar.
          </p>
        )}

        <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="matricula">Matrícula</label>
        <input
          id="matricula"
          value={matricula}
          onChange={(event) => setMatricula(event.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4"
          required
        />

        <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-2"
          required
        />

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <button
          type="button"
          onClick={() => {
            setShowForgotPassword(true);
            setForgotError('');
            setForgotMessage('');
          }}
          className="block ml-auto mt-3 text-sm font-medium text-[#164194] hover:underline"
        >
          Esqueci minha senha
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-[#164194] hover:bg-[#0C3B7C] disabled:opacity-60 text-white rounded-lg py-3 font-semibold"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-6">
          <form onSubmit={handleForgotPassword} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-[#0C3B7C]">Redefinir senha</h2>
            <p className="mt-2 text-sm text-slate-500">Informe o e-mail cadastrado para receber o link de redefinição.</p>
            <label className="mt-6 block text-sm font-semibold text-slate-700" htmlFor="reset-email">E-mail</label>
            <input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" required autoFocus />
            {forgotError && <p className="mt-3 text-sm text-red-600">{forgotError}</p>}
            {forgotMessage && <p className="mt-3 text-sm text-emerald-600">{forgotMessage}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForgotPassword(false)} className="rounded-lg px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button type="submit" disabled={forgotLoading} className="rounded-lg bg-[#164194] px-4 py-2 font-semibold text-white hover:bg-[#0C3B7C] disabled:opacity-60">{forgotLoading ? 'Enviando...' : 'Enviar link'}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
