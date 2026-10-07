import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StockProvider } from './context/StockContext';
import { Layout } from './components/Layout';
import { VisaoGeral } from './pages/VisaoGeral';
import { Historico } from './pages/Historico';
import { Cadastro } from './pages/Cadastro';

export default function App() {
  return (
    <StockProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<VisaoGeral />} />
            <Route path="historico" element={<Historico />} />
            <Route path="cadastro" element={<Cadastro />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StockProvider>
  );
}
