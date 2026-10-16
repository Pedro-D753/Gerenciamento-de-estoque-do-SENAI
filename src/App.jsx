// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importe de páginas
//import Home from './pages/Home';
import Historico from './pages/Historico';
import Solicitacao from './pages/Solicitacao.jsx';
import Gerenciar from './pages/Gerenciar';
// import HistoricoSolicitacao from './pages/HistoricoSolicitacao';
// import ItemDescricao from './pages/ItemDescricao';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Solicitacao/>} />
        <Route path="/solicitacao" element={<Solicitacao/>} />
        <Route path="/historico" element={<Historico/>} />
        <Route path="/gerenciar" element={<Gerenciar/>} />
        {/*<Route path="/" element={<Home />} />
        <Route path="/historico_solicitacao" element={<HistoricoSolicitacao />} />
        <Route path="/item/:id" element={<ItemDescricao />} /> */}

        <Route path="*" element={<h1 style={{color:'black'}}>Página não encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;