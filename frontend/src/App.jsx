import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';
import { api } from './services/api.js';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Estatistica from './pages_IA/Estatistica.jsx';
import Solicitacao from './pages/Solicitacao.jsx';
import HistoricoSolicitacao from './pages/Historico.jsx';
import ItemDescricao from './pages_IA/ItemDescricao.jsx';
import Manual from './pages/Manual.jsx';
import Usuarios from './pages/Usuarios.jsx';
import RedefinirSenha from './pages/RedefinirSenha.jsx';

function RequireAuth() {
  return api.isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/redefinir-senha/:jwt" element={<RedefinirSenha />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/manualdousuario" element={<Manual />} />
          <Route path="/estatistica" element={<Estatistica />} />
          <Route path="/Estatistica" element={<Estatistica />} />
          <Route path="/solicitacao" element={<HistoricoSolicitacao />} />
          <Route path="/solicitacao/nova" element={<Solicitacao />} />
          <Route path="/historico_solicitacao" element={<HistoricoSolicitacao />} />
          <Route path="/historico" element={<HistoricoSolicitacao />} />
          <Route path="/solicitacao/historico" element={<HistoricoSolicitacao />} />
          <Route path="/item/:id" element={<ItemDescricao />} />
        </Route>
        <Route path="*" element={<h1 style={{color:'black'}}>Página não encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;