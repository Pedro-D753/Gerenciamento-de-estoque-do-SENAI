// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importe de páginas
import Home from './pages/Home';
//import Estatistica from './pages/Estatistica';
// import Solicitacao from './pages/Solicitacao';
// import GerenciarSolicitacao from './pages/GerenciarSolicitacao';
// import HistoricoSolicitacao from './pages/HistoricoSolicitacao';
// import ItemDescricao from './pages/ItemDescricao';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/estatistica" element={<Estatistica />} />
        <Route path="/solicitacao" element={<Solicitacao />} />
        <Route path="/gerenciar_solicitacao" element={<GerenciarSolicitacao />} />
        <Route path="/historico_solicitacao" element={<HistoricoSolicitacao />} />
        <Route path="/item/:id" element={<ItemDescricao />} /> */}

        <Route path="*" element={<h1 style={{color:'black'}}>Página não encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;