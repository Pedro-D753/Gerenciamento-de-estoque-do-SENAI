import { BarChart3, FileText, LayoutDashboard, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
    };

    const clearSearch = () => {
        setQuery('');
    };

    const [activeTab, setActiveTab] = useState('Visão Geral');
    const [sandwish, setsandwish] = useState(false);
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    function mudarsandwish() {
        setsandwish(!sandwish);
    }

    return (
        <div className="w-full min-h-screen flex flex-col p-0 m-0 bg-white overflow-x-hidden">
            <header className="w-full fixed border-b h-20 border-gray-100 z-1 bg-white px-4 py-2 flex item-center justify-between">
                <div className='fixed flex item-center'>
                    <img src="/Senai.png" alt="Logo Senai" className='p-2 h-10 md:h-14 w-auto object-contain' />
                </div>
            </header>
            <div className="flex flex-1 w-full min-h-[calc(100vh-65px)]">
                <aside className={`relative ${sandwish ? 'w-64' : 'w-16 md:w-20'} fixed bg-[#164194] text-white flex flex-col item-center gap-6 p-2 md:p-4 transition-all duration-300 shrink-0`}>
                    <div className={`fixed ${sandwish ? 'w-55' : 'md:w-14'} bg-white/20 top-36 inset-x-3 h-0.5 transition-all duration-300`}></div>
                    <div className='bg-[#E84910] fixed z-2 top-20 inset-x-0 h-1.5 w-screen transition-all duration-300'></div>
                    <div className="fixed flex flex-col gap-4 space-y-3 w-full mt-2">
                        <button
                            onClick={mudarsandwish}
                            title={sandwish ? "Recolher menu" : "Expandir menu"}
                            className={`fixed left-4 top-23 flex item-center p-2 self-center ${sandwish ? 'w-52 justify-start' : 'w-12 justify-center'} text-white rounded-xl hover:bg-white/10 transition-colors ${sandwish ? 'hover:bg-white/20 justify-between px-3' : 'justify-center'
                                }`}
                        >
                            <Menu className="w-6 h-6 shrink-0" />
                            {sandwish && <span className="left-17 fixed font-semibold text-sm uppercase top-25.5 tracking-wider text-slate-200">Menu</span>}
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('Visão Geral');
                                navigate('/');
                            }}
                            title="Visão Geral"
                            className={`fixed top-40 hover:bg-white/20 transition-color rounded-xl font-medium transition-all duration-200 flex item-center ${!sandwish ? 'justify-center p-3 text-xl font-bold w-12' : 'px-4 py-3 gap-3 text-base w-52 '
                                }`}                        >
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
                            className={`fixed top-56 hover:bg-white/20 rounded-xl font-medium transition-all duration-200 flex item-center ${!sandwish ? 'justify-center p-3 text-xl font-bold w-12' : 'px-4 py-3 gap-3 text-base w-52 '
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
                            className={`fixed top-73 rounded-xl font-medium transition-all duration-200 flex item-center ${!sandwish ? 'justify-center p-3 text-xl font-bold w-12' : 'px-4 py-3 gap-3 text-base w-52 '
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
                            className={`mt-64 fixed bottom-[1%] rounded-xl font-medium transition-all gap-y-11 duration-200 flex item-center  ${!sandwish ? 'justify-center p-3 text-xl font-bold w-12' : 'px-4 py-3 gap-3 text-base w-52 '
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
                <div className='w-screen h-screen flex justify-center bg-white p-5 bottom-0'>
                    <div className='w-[99%] h-[90%] bg-[#ababab] rounded-2xl top-25 relative p-8 px-12 z-10'>
                        <div className='w-[40%] h-[12%] bg-amber-300 flex0 left-200 p-5'>
                            <div className="w-[80%] h-full bg-white rounded-full flex items-center px-8 py-4 shadow-md">
                                <input
                                    className="w-full text-[150%] outline-none text-sm text-gray-700 bg-transparent pr-2"
                                    type="text"
                                    id="search"
                                    placeholder="Pesquisar algo..."
                                    value={query}
                                    onChange={handleInputChange}
                                />
                                {query && (
                                    <button
                                        onClick={clearSearch}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                                <div className='relative -right-30 rounded-full w-10 h-10 align-text-center bg-[#164194]'>
                                    <button className='w-full h-full'>
                                        <Search className="h-5 w-5 c text-white" />
                                    </button>
                                </div>

                            </div>


                        </div>
                    </div>
                </div>
            </div>
            );
        </div>)
}