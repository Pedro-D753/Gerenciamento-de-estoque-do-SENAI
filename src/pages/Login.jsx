import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SenaiLogo } from '../components/SenaiLogo';
import { Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const [codigoUsuario, setCodigoUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Permite avançar para a visão geral
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 bg-white flex items-center px-8 border-b-4 border-[#e24914]">
        <SenaiLogo className="h-8" />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-8 md:px-20 max-w-7xl mx-auto w-full gap-12 lg:gap-24 py-12">
        {/* Left Form Section */}
        <div className="w-full max-w-sm flex flex-col">
          <h1 className="text-3xl font-normal text-black mb-8">Login</h1>

          <form onSubmit={handleLogin} className="flex flex-col">
            {/* Código de Usuário */}
            <label className="text-sm font-normal text-black mb-1.5">
              Código de Usuário
            </label>
            <input
              type="text"
              placeholder="01508548644"
              value={codigoUsuario}
              onChange={(e) => setCodigoUsuario(e.target.value)}
              className="w-full h-10 px-3 border border-[#cfd5dc] rounded-md outline-none text-sm text-gray-700 placeholder-gray-400 focus:border-[#0b499e] transition shadow-2xs mb-5"
            />

            {/* Senha */}
            <label className="text-sm font-normal text-black mb-1.5">
              Senha
            </label>
            <div className="relative flex items-center mb-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full h-10 pl-3 pr-10 border border-[#cfd5dc] rounded-md outline-none text-sm text-gray-700 focus:border-[#0b499e] transition shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Esqueceu a senha */}
            <div className="flex justify-end mb-8">
              <button
                type="button"
                onClick={() => alert('Recuperação de senha: entre em contato com o administrador do SENAI.')}
                className="text-[11px] font-bold text-black hover:underline cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Botão Avançar */}
            <button
              type="submit"
              className="w-full h-11 bg-[#103db5] hover:bg-[#0c3194] text-white font-medium text-sm rounded-md shadow-sm hover:shadow transition-all cursor-pointer mb-6"
            >
              Avançar
            </button>

            {/* Não tem uma conta? Clique aqui */}
            <div className="text-center text-sm text-black">
              <span>Não tem uma conta? </span>
              <button
                type="button"
                onClick={() => alert('Para cadastrar uma nova conta de operador ou estagiário, solicite acesso ao administrador.')}
                className="text-[#0b54c4] font-medium hover:underline cursor-pointer"
              >
                Clique aqui
              </button>
            </div>
          </form>
        </div>

        {/* Right Brand Section */}
        <div className="w-full max-w-md flex items-center justify-center">
          <div className="flex items-center gap-4 select-none">
            <img
              src="/Senai.png"
              alt="SENAI"
              className="h-20 md:h-24 w-auto object-contain"
            />
            <div className="flex flex-col text-gray-600 font-sans leading-tight text-sm md:text-base border-l-2 border-gray-300 pl-4 py-1">
              <span className="italic font-light">Serviço Nacional</span>
              <span className="italic font-light">de Aprendizagem</span>
              <span className="italic font-light">Industrial</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
