import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Filter, BookOpen, BarChart3, FileText, LayoutDashboard, Menu, RefreshCw, Grid } from 'lucide-react';


export default function Home() {

    const [activeTab, setActiveTab] = useState('Visão Geral');
    const [sandwish, setsandwish] = useState(false);
    const navigate = useNavigate();

    function mudarsandwish() {
        setsandwish(!sandwish);
    }

    return (
        <div className="w-full min-h-screen flex flex-col p-0 m-0 bg-white overflow-x-hidden">
            <header className="w-full border-b border-gray-100 bg-white px-4 py-2 flex item-center justify-between">
                <div className='relative flex item-center'>
                    <img src="/Senai.png" alt="Logo Senai" className='p-2 h-10 md:h-14 w-auto object-contain' />
                </div>
            </header>
            <div className="flex flex-1 w-full min-h-[calc(100vh-65px)]">
                <aside className={`relative ${sandwish ? 'w-64' : 'w-16 md:w-20'} fixed bg-[#164194] text-white flex flex-col item-center gap-6 p-2 md:p-4 transition-all duration-300 shrink-0`}>
                    <div className='fixed w-14 bg-white/20 top-36 inset-x-3 h-[1px] transition-all duration-300 '></div>
                    <div className='bg-[#E84910] absolute top-0 inset-x-0 h-1.5 w-screen transition-all duration-300'></div>
                    <div className="fixed flex flex-col gap-4 space-y-3 w-full mt-2">
                        <button
                            onClick={mudarsandwish}
                            title={sandwish ? "Recolher menu" : "Expandir menu"}
                            className={`fixed left-5 top-23 flex item-center justify-center p-2 text-white rounded-xl hover:bg-white/10 transition-colors ${
                                sandwish ? 'hover:bg-white/20 justify-between px-3' : 'justify-center'
                                }`}
                        >
                            <Menu className="w-6 h-6 shrink-0" />
                            {sandwish && <span className="left-17 fixed font-semibold text-sm uppercase tracking-wider text-slate-200">Menu</span>}
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('Visão Geral');
                                navigate('/');
                            }}
                            title="Visão Geral"
                            className={`fixed top-40 hover:bg-white/20 transition-color rounded-xl font-medium transition-all duration-200 flex item-center ${
                                !sandwish ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3 text-base'
                                }`}
                        >
                            {!sandwish ? (
                                <LayoutDashboard className='justify-center'>V</LayoutDashboard>
                            ) : (
                                <>
                                    <LayoutDashboard className="w-5 h-5 shrink-0" />
                                    <span className="truncate justify-end">Visão Geral</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('Estaísticas');
                                navigate('/Estatistica');
                            }}
                            title="Estatísticas"
                            className={`fixed top-56 hover:bg-white/20 rounded-xl font-medium transition-all duration-200 flex item-center ${
                                !sandwish ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3 text-base'
                                } ${activeTab === 'Solicitação'
                                    ? 'bg-[#6B84A6] text-white shadow-md'
                                    : 'text-white hover:bg-white/10'
                                }`}
                        >
                            {!sandwish ? (
                                <BarChart3 className='justify-center'>E/</BarChart3>
                            ) : (
                                <>
                                    <BarChart3 className="w-5 h-5 shrink-0" />
                                    <span className="truncate">Estatísticas</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('Solicitação');
                                navigate('/solicitacao');
                            }}
                            title="Solicitação"
                            className={`fixed top-73 rounded-xl font-medium transition-all duration-200 flex item-center ${
                                !sandwish ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3 text-base'
                                } ${activeTab === 'Solicitação'
                                    ? 'bg-[#6B84A6] text-white shadow-md'
                                    : 'text-white hover:bg-white/20'
                                }`}
                        >
                            {!sandwish ? (
                                <FileText className='justify-center'>S</FileText>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5 shrink-0" />
                                    <span className="truncate">Solicitação</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('Solicitação');
                                navigate('/solicitacao');
                            }}
                            title="Solicitação"
                            className={`mt-64 fixed top-86 rounded-xl font-medium transition-all gap-y-11 duration-200 flex item-center  ${
                                !sandwish ? 'justify-center p-3 text-xl font-bold' : 'px-4 py-3 gap-3 text-base'
                                } ${activeTab === 'Solicitação'
                                    ? 'bg-[#6B84A6] text-white shadow-md'
                                    : 'text-white hover:bg-white/20'
                                }`}
                        >
                            {!sandwish ? (
                                <FileText className='justify-center'>S</FileText>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5 shrink-0" />
                                    <span className="truncate">Solicao</span>
                                </>
                            )}
                        </button>
                    </div>
                </aside>
                <div className="grid grid-cols-3 gap-0 w-screen p-0">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-134444444 bg-[#838383] rounded-sm shadow-sm"/>
                    ))}
                </div>
            </div>
        </div>
    );
}