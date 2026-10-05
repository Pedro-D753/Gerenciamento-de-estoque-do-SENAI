import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Filter, BookOpen, BarChart3, FileText, LayoutDashboard, Menu, RefreshCw, Grid } from 'lucide-react';
import BlurText from "/src/components/BlurText.jsx";
import { text } from 'motion/react-client';

export default function Home() {
    const [sandwish, setsandwish] = useState(false);
    const navigate = useNavigate();

    function mudarsandwish() {
        setsandwish(!sandwish);
    }
    function texto(palavra) {
        return (
            <BlurText
                text={palavra}
                delay={0}
                animateBy="words"
                direction="botton"
                className="text-2xl mb-8"
            />
        )
    }

    return (
        <div className="w-full flex h-full p-0 m-0 bg-white">
            <aside className="grid  md:grid-rows-[1fr_7fr] h-screen w-screen overflow-hidden">
                <div className='relative'>
                    <img src="/Senai.png" alt="Logo Senai" className='p-5 w-[15%]' />
                    <div className='bg-[#E84910] absolute md:bottom-0 inset-x-0 flex flex-col bottom-0 mt-19 p-0.5 transition-all duration-300'>
                    </div>
                </div>
                <div className={`${sandwish ? 'w-[20%]' : 'w-[5%]'} bg-[#164194] text-white flex flex-col items-center gap-6 p-4 transition-all duration-300 col-start-1`}>
                    <button onClick={mudarsandwish}
                        className="p-3  rounded-lg flex flex-col justify-center items-center w-full h-14 focus:outline-none transition-all"
                    >
                        <div className={`bg-white w-full h-1 rounded-full mb-1 transition-all`}></div>
                        <div className={`bg-white w-full h-1 rounded-full mb-1 transition-all`}></div>
                        <div className={`bg-white w-full h-1 rounded-full transition-all`}></div>
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className='text-white transition-all flex items-center justify-center w-full rounded-xl'>
                        <span className='text-center font-medium'>
                            {sandwish ? texto('Visão Geral') : texto('V')}
                        </span>
                    </button>
                    <button
                        onClick={() => navigate('/estatistica')}
                        className='text-white transition-all flex items-center justify-center w-full rounded-xl'>
                        <span className='text-center font-medium'>
                            {sandwish ? texto('Estatística') : texto('E')}
                        </span>
                    </button>
                    <button
                        onClick={() => navigate('/solicitacao')}
                        className='text-white transition-all flex items-center justify-center w-full rounded-xl'>
                        <span className='text-center font-medium'>
                            {sandwish ? texto('Solicitação') : texto('S')}
                        </span>
                    </button>
                </div>
                    <div className='bg-amber-700 w-6 h-5 rounded-2xl p-6 text-white col-start-2 row-start-2'>
                        <h1 className='text-3xl font-bold'>Área de Conteúdo Principal</h1>
                        <p className='mt-2'>Aqui dentro você pode criar as suas grades e componentes livremente.</p>
                    </div>
            </aside>
        </div>
    );
}