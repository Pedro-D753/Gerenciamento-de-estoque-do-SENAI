import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { api } from './services/api.js';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Estatistica from './pages/Estatistica.jsx';
import HistoricoSolicitacao from './pages/Historico.jsx';
import ItemDescricao from './pages/ItemDescricao.jsx';
import Manual from './pages/Manual.jsx';
import Usuarios from './pages/Usuarios.jsx';
import RedefinirSenha from './pages/RedefinirSenha.jsx';

function estoquistaUrl() {
  if (window.location.port === '5173') {
    return `${window.location.protocol}//${window.location.hostname}:5174/estoquista/`;
  }
  return '/estoquista/';
}

function RequireAuth() {
  return api.isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireAdmin() {
  const [access, setAccess] = useState('loading');

  useEffect(() => {
    let active = true;
    api.currentUser()
      .then((user) => {
        if (active) setAccess(user.is_admin ? 'allowed' : 'denied');
      })
      .catch(() => {
        if (active) setAccess('error');
      });
    return () => { active = false; };
  }, []);

  if (access === 'loading') {
    return <main className="grid min-h-screen place-items-center bg-[#EBEAED] font-semibold text-[#2E2D2F]">Verificando acesso...</main>;
  }
  if (access === 'denied') {
    window.location.assign(estoquistaUrl());
    return null;
  }
  if (access === 'error') {
    return <main role="alert" className="grid min-h-screen place-items-center bg-[#EBEAED] p-6 text-center">
      <p className="max-w-lg rounded-2xl bg-[#B7B6B9] p-8 font-semibold text-[#2E2D2F] shadow-xl">Não foi possível verificar seu perfil. Tente novamente mais tarde.</p>
    </main>;
  }
  return <Outlet />;
}

function App() {
  if (window.location.pathname === '/master/login') {
    window.location.assign('/login');
    return null;
  }
  const mountedAtMaster = window.location.pathname === '/master' || window.location.pathname.startsWith('/master/');
  const basename = mountedAtMaster ? '/master' : '/';
  const protectedPath = mountedAtMaster ? '/' : '/master';
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/redefinir-senha/:jwt" element={<RedefinirSenha />} />
        <Route element={<RequireAuth />}>
          <Route element={<RequireAdmin />}>
            {!mountedAtMaster && <Route path="/" element={<Home />} />}
            <Route path={protectedPath} element={<Home />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/manualdousuario" element={<Manual />} />
            <Route path="/estatistica" element={<Estatistica />} />
            <Route path="/Estatistica" element={<Estatistica />} />
            <Route path="/solicitacao" element={<HistoricoSolicitacao />} />
            <Route path="/historico_solicitacao" element={<HistoricoSolicitacao />} />
            <Route path="/historico" element={<HistoricoSolicitacao />} />
            <Route path="/solicitacao/historico" element={<HistoricoSolicitacao />} />
            <Route path="/item/:id" element={<ItemDescricao />} />
          </Route>
        </Route>
        <Route path="*" element={<h1 style={{color:'black'}}>Página não encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;