import AppShell from '../components/AppShell.jsx';
import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X, Trash2, MapPin, Calendar, User } from 'lucide-react';
import { api } from '../services/api.js';

export default function Solicitacao() {
  
  
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados dos Filtros
  const [filtroArea, setFiltroArea] = useState(false);
  const [filtroLocal, setFiltroLocal] = useState(false);
  const [areaTecnica, setAreaTecnica] = useState('all');
  const [localizacao, setLocalizacao] = useState('all');

  // Novos estados para os dados da solicitação
  const [nomeSolicitante, setNomeSolicitante] = useState('');
  const [dataRetirada, setDataRetirada] = useState('');
  // Armazena as quantidades solicitadas por ID de item: { [id]: quantidade }
  const [quantidadesSolicitadas, setQuantidadesSolicitadas] = useState({});

  // Referência para controlar o clique no fundo escuro do modal
  const backdropMouseDownRef = useRef(false);

  

  const opcoesArea = [
    { id: 0, label: 'Todas as Áreas', action: () => setAreaTecnica('all') },
    { id: 1, label: 'Produção Alimentícia', action: () => setAreaTecnica('producao_alimenticia') },
    { id: 2, label: 'Eletrônica e Automação', action: () => setAreaTecnica('eletronica_e_automacao') },
    { id: 3, label: 'Manutenção e Operação', action: () => setAreaTecnica('manutencao_e_operacao') },
    { id: 4, label: 'Construção de Obras', action: () => setAreaTecnica('construcao_de_obras') },
    { id: 6, label: 'Construção de Obras / Sistemas de Energia', action: () => setAreaTecnica('construcao_de_obras/sistemas_de_energia') },
    { id: 9, label: 'Sistemas de Energia', action: () => setAreaTecnica('sistemas_de_energia') },
    { id: 11, label: 'Comercial / Gerencial / Operações Financeiras', action: () => setAreaTecnica('comercial/gerencial/operacoes_financeiras') },
    { id: 12, label: 'Design', action: () => setAreaTecnica('design') },
    { id: 13, label: 'Gerencial', action: () => setAreaTecnica('gerencial') },
    { id: 14, label: 'Manufatura', action: () => setAreaTecnica('manufatura') },
    { id: 15, label: 'Metalmecânica', action: () => setAreaTecnica('metalmecanica') },
    { id: 17, label: 'Eletrônica / Metalmecânica / Manutenção', action: () => setAreaTecnica('eletronica_e_automacao/metalmecanica/manutencao_e_operacao') },
    { id: 20, label: 'Segurança', action: () => setAreaTecnica('seguranca') },
    { id: 21, label: 'Infraestrutura de Informação e Comunicação', action: () => setAreaTecnica('infraestrutura_de_informacao_e_comunicacao') },
    { id: 23, label: 'Desenvolvimento de Sistemas', action: () => setAreaTecnica('desenvolvimento_de_sistemas') },
    { id: 24, label: 'Têxtil e Vestuário / Design', action: () => setAreaTecnica('textil_e_vestuario/design') },
  ];

  const opcoesLocal = [
    { id: 'all', label: 'Todos os Locais' },
    { id: 'Gama', label: 'Gama' },
    { id: 'Sobradinho', label: 'Sobradinho' },
    { id: 'Taguatinga', label: 'Taguatinga' },
    { id: 'SIG', label: 'SIG' },
  ];

  

  function limparFiltros() {
    setAreaTecnica('all');
    setLocalizacao('all');
    setFiltroArea(false);
    setFiltroLocal(false);
  }

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        setLoading(true);
        const products = await api.getItems();
        if (isMounted) setItems(products);
      } catch (error) {
        console.error('Erro ao procurar produtos na API:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleSelect = async (id, currentApprovedStatus) => {
    const newStatus = !currentApprovedStatus;

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          // Se for selecionado e não tiver quantidade definida ainda, inicia com 1 (ou item.stock)
          if (newStatus && !quantidadesSolicitadas[id]) {
            setQuantidadesSolicitadas((prev) => ({ ...prev, [id]: 1 }));
          }
          return { ...item, approved: newStatus };
        }
        return item;
      })
    );

  };

  const handleQuantidadeChange = (id, valor) => {
    const num = Math.max(1, parseInt(valor) || 1);
    setQuantidadesSolicitadas((prev) => ({ ...prev, [id]: num }));
  };

  const filteredItems = items.filter((item) => {
    const matchesQuery =
      item.name?.toLowerCase().includes(query.toLowerCase()) ||
      item.code?.toString().toLowerCase().includes(query.toLowerCase()) ||
      item.location?.toLowerCase().includes(query.toLowerCase());

    const matchesArea =
      areaTecnica === 'all' || item.areaTecnica === areaTecnica;

    const matchesLocal =
      localizacao === 'all' || item.location?.toLowerCase() === localizacao.toLowerCase();

    return matchesQuery && matchesArea && matchesLocal;
  });

  const selectedItems = items.filter((item) => item.approved);

  const handleConfirmarSolicitacao = () => {
    if (!nomeSolicitante.trim()) {
      alert('Por favor, informe o nome do solicitante.');
      return;
    }
    if (!dataRetirada) {
      alert('Por favor, informe a data prevista de retirada.');
      return;
    }

    // Monta o objeto final da solicitação caso queira enviar para uma API
    const dadosSolicitacao = {
      solicitante: nomeSolicitante,
      dataRetirada: dataRetirada,
      itens: selectedItems.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        quantidadeSolicitada: quantidadesSolicitadas[item.id] || 1,
        location: item.location
      }))
    };

    console.log('Dados da Solicitação:', dadosSolicitacao);
    alert(`Solicitação de ${nomeSolicitante} enviada com sucesso para retirada em ${dataRetirada.split('-').reverse().join('/')}!`);
    setIsModalOpen(false);
  };

  return (
    <AppShell activeTab="Visão Geral">
      <div className="w-full min-h-screen flex flex-col bg-[#F4F6F9]">
      {/* Cabeçalho */}
      

      <div className="flex w-full pt-20 min-h-screen">
        {/* Sidebar */}
        

        <main className="flex-1 flex flex-col min-w-0 bg-[#D8DCE3]">
          <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col gap-6 overflow-x-hidden">
            <div className="w-full bg-[#E0E0E0] p-4 sm:p-6 rounded-3xl flex flex-col gap-6 shadow-xl relative">
              
              {/* Barra de Busca e Filtros */}
              <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto relative flex-wrap">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar Item"
                    className="w-full sm:w-56 bg-[#CDCDCD] text-gray-800 placeholder-gray-500 text-center sm:text-left px-5 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                  
                  {/* FILTRO DE ÁREA TÉCNICA */}
                  <div className="relative">
                    <button
                      onClick={() => { setFiltroArea(!filtroArea); setFiltroLocal(false); }}
                      className="flex items-center justify-center gap-2 bg-[#CDCDCD] hover:bg-[#BFBFBF] text-gray-800 font-semibold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <ChevronDown className="w-5 h-5 text-gray-700" />
                      <span>Área {areaTecnica !== 'all' && areaTecnica.label}</span>
                    </button>

                    {filtroArea && (
                      <div className="absolute left-0 mt-2 w-72 max-h-80 overflow-y-auto bg-white border border-gray-300 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-1">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 mb-1">
                          <span className="text-xs font-bold text-gray-600 uppercase">Área Técnica</span>
                          <button
                            onClick={limparFiltros}
                            className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Limpar
                          </button>
                        </div>
                        {opcoesArea.map((op) => (
                          <button
                            key={op.id}
                            onClick={() => {
                              op.action();
                              setFiltroArea(false);
                            }}
                            className={`text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                              (areaTecnica === 'all' && op.label === 'Todas as Áreas') || 
                              areaTecnica === op.action.toString()
                                ? 'bg-blue-100 text-blue-900 font-bold'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {op.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* FILTRO DE LOCAL (Gama, Sobradinho, Taguatinga, SIG) */}
                  <div className="relative">
                    <button
                      onClick={() => { setFiltroLocal(!filtroLocal); setFiltroArea(false); }}
                      className="flex items-center justify-center gap-2 bg-[#CDCDCD] hover:bg-[#BFBFBF] text-gray-800 font-semibold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-gray-700" />
                      <span>Local {localizacao !== 'all' && `(${localizacao})`}</span>
                    </button>

                    {filtroLocal && (
                      <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-300 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-1">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 mb-1">
                          <span className="text-xs font-bold text-gray-600 uppercase">Localidade</span>
                          <button
                            onClick={limparFiltros}
                            className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Limpar
                          </button>
                        </div>
                        {opcoesLocal.map((loc) => (
                          <button
                            key={loc.id}
                            onClick={() => {
                              setLocalizacao(loc.id);
                              setFiltroLocal(false);
                            }}
                            className={`text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                              localizacao === loc.id
                                ? 'bg-blue-100 text-blue-900 font-bold'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {loc.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="flex items-center justify-center bg-[#1E40AF] hover:bg-[#1E3A8A] text-white p-2.5 rounded-full transition-colors shrink-0">
                    <Search className="w-5 h-5" />
                  </button>
                </div>

                {/* Botão para abrir o Pop-up */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full lg:w-auto bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold px-8 py-2.5 rounded-xl transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Solicitar</span>
                  {selectedItems.length > 0 && (
                    <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">
                      {selectedItems.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tabela dos Produtos */}
              <div className="overflow-x-auto w-full rounded-xl border-2 border-gray-400">
                <div className="min-w-[540px] w-full bg-[#d6d6d6]">
                  <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#D0D5DE] font-bold text-black text-sm rounded-t-xl text-center border-b border-slate-400">
                    <div className="col-span-1 border-r border-slate-400 pr-2 flex items-center justify-center">ID</div>
                    <div className="col-span-3 border-r border-slate-400 px-2 flex items-center justify-center">Codigo U.F</div>
                    <div className="col-span-3 border-r border-slate-400 px-2 flex items-center justify-center">Item</div>
                    <div className="col-span-2 border-r border-slate-400 px-2 flex items-center justify-center">Quantidade</div>
                    <div className="col-span-1 border-r border-slate-400 px-2 flex items-center justify-center">Reserva</div>
                    <div className="col-span-2 px-2 flex items-center justify-center">Unidade</div>
                  </div>

                  {/* Linhas da Tabela */}
                  {loading ? (
                    <div className="p-6 text-center text-gray-600 font-medium">Carregando dados da API...</div>
                  ) : filteredItems.length === 0 ? (
                    <div className="p-6 text-center text-gray-600 font-medium">Nenhum produto encontrado.</div>
                  ) : (
                    filteredItems.map((item, index) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleSelect(item.id, item.approved)}
                        className={`grid grid-cols-12 gap-2 px-4 py-3 text-center border-b border-slate-300 items-center cursor-pointer transition-colors ${
                          item.approved ? 'bg-blue-200/60 text-black font-medium' : 'text-black hover:bg-gray-300'
                        }`}
                      >
                        <div className="col-span-1 font-semibold">{index + 1}</div>
                        <div className="col-span-3 font-mono text-xs sm:text-sm">{item.code}</div>
                        <div className="col-span-3 justify-center font-medium flex items-center gap-2">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-7 h-7 object-contain rounded bg-white p-0.5" />
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="col-span-2 font-semibold">{item.stock}</div>
                        <div className="col-span-1 flex justify-center">
                          <span className="font-semibold">{item.badgeValue}</span>
                        </div>
                        <div className="col-span-2 flex items-center justify-center gap-3 px-2">
                          <span className="truncate">{item.location}</span>
                          <button
                            type="button"
                            className={`w-5 h-5 rounded border flex items-center justify-center ${
                              item.approved ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-400'
                            }`}
                          >
                            {item.approved && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Pop-up (Modal) de Solicitação */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onMouseDown={(e) => {
            backdropMouseDownRef.current = (e.target === e.currentTarget);
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && backdropMouseDownRef.current) {
              setIsModalOpen(false);
            }
            backdropMouseDownRef.current = false;
          }}
        >
          <div className="bg-[#D9D9D9] text-black rounded-2xl p-6 max-w-xl w-full border border-white/20 shadow-2xl relative max-h-[90vh] flex flex-col">
            
            {/* Cabeçalho do Pop-up */}
            <div className="flex justify-between items-center border-b border-slate-400 pb-3 shrink-0">
              <h3 className="text-xl font-bold text-black">Confirmar Solicitação</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo do Pop-up */}
            <div className="py-4 space-y-4 overflow-y-auto pr-1 flex-1">
              
              {/* Campos do Solicitante e Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-600" /> Nome do Solicitante
                  </label>
                  <input
                    type="text"
                    value={nomeSolicitante}
                    onChange={(e) => setNomeSolicitante(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="bg-gray-100 border border-gray-300 text-gray-800 text-xs px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Data Prevista de Retirada
                  </label>
                  <input
                    type="date"
                    value={dataRetirada}
                    onChange={(e) => setDataRetirada(e.target.value)}
                    className="bg-gray-100 border border-gray-300 text-gray-800 text-xs px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <p className="text-black text-sm">
                {selectedItems.length > 0 ? (
                  <>
                    Itens selecionados (<span className="font-bold text-blue-600">{selectedItems.length}</span>): ajuste a quantidade desejada abaixo:
                  </>
                ) : (
                  <span className="text-amber-700 font-medium">Nenhum item selecionado.</span>
                )}
              </p>

              {/* Lista de Itens Selecionados com Quantidade Ajustável */}
              {selectedItems.length > 0 ? (
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-300 rounded-xl gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 object-contain rounded bg-gray-100 p-0.5 shrink-0"
                          />
                        )}
                        <div className="truncate">
                          <p className="font-semibold text-sm text-black truncate">{item.name}</p>
                          <p className="text-xs text-gray-500 font-mono">Cód: {item.code}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Input de Quantidade do Item */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Qtd</span>
                          <input
                            type="number"
                            min="1"
                            value={quantidadesSolicitadas[item.id] || 1}
                            onChange={(e) => handleQuantidadeChange(item.id, e.target.value)}
                            className="w-14 text-center bg-gray-100 border border-gray-300 text-xs font-bold py-1 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <span className="text-xs bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 rounded-lg font-medium">
                          {item.location || 'Unidade'}
                        </span>

                        {/* Botão para Remover o Item */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(item.id, item.approved);
                          }}
                          title="Remover item"
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 pointer-events-none" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-100 border border-amber-300 p-4 rounded-xl text-amber-800 text-xs leading-relaxed">
                  Todos os itens foram removidos. Selecione produtos na tabela se desejar enviar uma nova solicitação.
                </div>
              )}
            </div>

            {/* Ações do Pop-up */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-400 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={selectedItems.length === 0}
                onClick={handleConfirmarSolicitacao}
                className={`px-5 py-2 rounded-xl text-sm font-semibold shadow-md transition-colors ${
                  selectedItems.length > 0
                    ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white cursor-pointer'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-50'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AppShell>
  );
}