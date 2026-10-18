import AppShell from '../components/AppShell.jsx';
/* eslint-disable react-hooks/immutability, react-hooks/set-state-in-effect */
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Check, X, Trash2 } from 'lucide-react';
import { api } from '../services/api.js';

// Opções de unidades atualizadas
const OPCOES_UNIDADE = [
  'Gama',
  'Taguatinga',
  'Sobradinho',
  'Sig',
];

// Componente de Autocomplete para a Unidade
function AutocompleteUnidade({ value, onChange }) {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  const opcoesFiltradas = OPCOES_UNIDADE.filter((opcao) =>
    opcao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      
      const opcaoEncontrada = OPCOES_UNIDADE.find(
        (op) => op.toLowerCase() === searchTerm.trim().toLowerCase()
      );

      if (opcaoEncontrada) {
        setSearchTerm(opcaoEncontrada);
        onChange(opcaoEncontrada);
      } else {
        // Se o valor digitado for inválido, restaura para o último valor válido
        setSearchTerm(value || '');
      }
    }, 150);
  };

  const handleSelect = (opcao) => {
    setSearchTerm(opcao);
    onChange(opcao);
    setIsOpen(false);
  };

  return (
    <div className="relative flex flex-col gap-1 w-full">
      <label className="text-xs font-medium text-gray-300">Unidade *</label>
      
      <input
        type="text"
        value={searchTerm}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        placeholder="Selecione a unidade..."
        className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
      />

      {isOpen && opcoesFiltradas.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-slate-600 bg-slate-900 shadow-xl">
          {opcoesFiltradas.map((opcao) => (
            <button
              key={opcao}
              type="button"
              onMouseDown={() => handleSelect(opcao)}
              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-800 transition-colors"
            >
              {opcao}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Solicitacao() {
  const [query, setQuery] = useState('');
  const [areaTecnica, setAreaTecnica] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtro, setfiltro] = useState(false);

  const [requestDetails, setRequestDetails] = useState({});

  const backdropMouseDownRef = useRef(false);
  const scrollRef = useRef(null);
  const filtroRef = useRef(null);
  const navigate = useNavigate();

  const getTodayFormatted = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateInput = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const dateToIso = (value) => {
    const [day, month, year] = value.split('/');
    return year && month && day ? `${year}-${month}-${day}T00:00:00` : null;
  };

  const normalizarTexto = (str) =>
    str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "") : "";

  const opcoes = [
    { id: 'producao_alimenticia', label: 'Produção Alimentícia' },
    { id: 'eletronica_e_automacao', label: 'Eletrônica e Automação' },
    { id: 'manutencao_e_operacao', label: 'Manutenção e Operação' },
    { id: 'construcao_de_obras', label: 'Construção de Obras' },
    { id: 'construcao_de_obras/sistemas_de_energia', label: 'Construção de Obras / Sistemas de Energia' },
    { id: 'sistemas_de_energia', label: 'Sistemas de Energia' },
    { id: 'comercial/gerencial/operacoes_financeiras', label: 'Comercial / Gerencial / Operações Financeiras' },
    { id: 'design', label: 'Design' },
    { id: 'gerencial', label: 'Gerencial' },
    { id: 'manufatura', label: 'Manufatura' },
    { id: 'metalmecanica', label: 'Metalmecânica' },
    { id: 'eletronica_e_automacao/metalmecanica/manutencao_e_operacao', label: 'Eletrônica e Automação / Metalmecânica / Manutenção e Operação' },
    { id: 'seguranca', label: 'Segurança' },
    { id: 'infraestrutura_de_informacao_e_comunicacao', label: 'Infraestrutura de Informação e Comunicação' },
    { id: 'infraestrutura_de_informacao_e_comunicacao/gestao_e_seguranca', label: 'Infraestrutura de Informação e Comunicação / Gestão e Segurança' },
    { id: 'desenvolvimento_de_sistemas', label: 'Desenvolvimento de Sistemas' },
    { id: 'textil_e_vestuario/design', label: 'Têxtil e Vestuário / Design' },
  ];

  function mudarfiltro() {
    setfiltro(!filtro);
  }


  useEffect(() => {
    function handleClickOutside(event) {
      if (filtroRef.current && !filtroRef.current.contains(event.target)) {
        setfiltro(false);
      }
    }
    if (filtro) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filtro]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getItems();
      setItems(data.map((item) => ({ ...item, approved: false })));
    } catch (error) {
      console.error('Erro ao procurar produtos na API:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedItems = useMemo(() => items.filter((item) => item.approved), [items]);

  useEffect(() => {
    if (isModalOpen) {
      const today = getTodayFormatted();
      setRequestDetails((prev) => {
        const nextState = { ...prev };
        selectedItems.forEach((item) => {
          if (!nextState[item.id]) {
            nextState[item.id] = {
              quantidade: 1,
              unidade: item.location || 'Gama',
              solicitante: '',
              dataSolicitacao: today,
              dataRetirada: today,
              motivo: ''
            };
          }
        });
        return nextState;
      });
    }
  }, [isModalOpen, selectedItems]);

  const handleDetailChange = (id, field, value) => {
    setRequestDetails((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const isItemValid = (item) => {
    const details = requestDetails[item.id];
    if (!details) return false;

    const quantidadeValida =
      Number(details.quantidade) > 0 &&
      Number(details.quantidade) <= (item.stock || '-');
    const unidadeValida = Boolean(details.unidade && details.unidade.trim() !== '');
    const solicitanteValido = Boolean(details.solicitante && details.solicitante.trim() !== '');
    const dataSolicitacaoValida = Boolean(details.dataSolicitacao && details.dataSolicitacao.trim().length === 10);
    const dataRetiradaValida = Boolean(details.dataRetirada && details.dataRetirada.trim().length === 10);

    return quantidadeValida && unidadeValida && solicitanteValido && dataSolicitacaoValida && dataRetiradaValida;
  };

  const isFormValid =
    selectedItems.length > 0 && selectedItems.every((item) => isItemValid(item));

  const handleToggleSelect = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, approved: !item.approved } : item
      )
    );
  };

  const handleConfirmarSolicitacao = async () => {
    if (!isFormValid || isSending) return;

    try {
      setIsSending(true);

      await Promise.all(
        selectedItems.map(async (item) => {
          const details = requestDetails[item.id];
          const qtdPedida = Math.min(
            Math.max(1, Number(details.quantidade) || '-'),
            item.stock || 1
          );

          if (!item.estoque_id) {
            throw new Error(`O produto "${item.name}" não possui estoque vinculado.`);
          }

          return api.createSolicitacao({
            is_aceito: false,
            obs_solicita: details.motivo?.trim() || 'Não informado',
            obs_recusa: null,
            tipo: 'EmAndamento',
            estado: 'SA',
            qtd_acao: qtdPedida,
            dt_acao: new Date().toISOString(),
            estoque_id: item.estoque_id,
            solicitante: details.solicitante.trim(),
            dt_solicitacao: dateToIso(details.dataSolicitacao),
            dt_retirada: dateToIso(details.dataRetirada),
          });
        })
      );

      alert('Solicitação enviada com sucesso!');
      setIsModalOpen(false);
      navigate('/solicitacao');
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert('Ocorreu um erro ao gravar a solicitação.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesQuery =
      !query ||
      item.name?.toLowerCase().includes(query.toLowerCase()) ||
      item.code?.toString().toLowerCase().includes(query.toLowerCase()) ||
      item.location?.toLowerCase().includes(query.toLowerCase());

    const matchesArea =
      !areaTecnica ||
      normalizarTexto(item.AreaTecnica) === normalizarTexto(areaTecnica);

    return matchesQuery && matchesArea;
  });

  return (
    <AppShell activeTab="Solicitação">
    <div className="flex min-h-screen w-full flex-col bg-[#a5a9af]">
      

      <div className="solicitacao-page flex min-h-full w-full flex-1 flex-col">
        

        <main className="flex min-w-0 flex-1 flex-col bg-[#D8DCE3]">
          <div className="flex w-full items-center gap-2 overflow-x-auto border-b border-slate-300 bg-[#D8DCE3] px-4 pt-4 pb-0 scrollbar-none sm:px-8">
            <button onClick={() => navigate('/solicitacao/nova')} className="whitespace-nowrap rounded-t-xl border-t border-x border-slate-300 bg-[#CBD0D8] px-6 py-2.5 font-bold text-slate-900 shadow-xs sm:px-12">Solicitar</button>
            <button onClick={() => navigate('/solicitacao/historico')} className="whitespace-nowrap rounded-t-xl px-6 py-2.5 font-medium text-slate-700 transition-colors hover:bg-[#CBD0D8]/60 sm:px-12">Histórico</button>
          </div>

          <div className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6 md:p-8">
            <div className="flex w-full flex-col gap-6 rounded-3xl bg-[#E0E0E0] p-4 shadow-xl sm:p-6">
              <div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row">
                <div className="flex w-full flex-1 flex-col items-center gap-3 transition-all duration-300 sm:flex-row">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar Item"
                    className="w-full rounded-full bg-[#CDCDCD] px-5 py-2.5 text-center font-medium text-gray-800 placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-blue-500 sm:w-64 sm:text-left"
                  />

                  <div ref={filtroRef} className="relative w-full transition-all duration-300 sm:w-auto">
                    <button onClick={mudarfiltro} className="flex w-35 items-center justify-center gap-2 rounded-xl bg-[#CDCDCD] px-5 py-2.5 font-semibold text-gray-800 transition-colors hover:bg-[#BFBFBF] sm:w-auto" type="button">
                      <ChevronDown className={`h-5 w-5 text-gray-700 transition-transform duration-300 ${filtro ? 'rotate-180' : ''}`} />
                      <span>Filtro</span>
                    </button>

                    {filtro && (
                      <div className="absolute right-0 z-50 mt-2 w-full sm:w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md transition-all">
                        <div className="pb-1 mb-1 border-b border-gray-200/80">
                          <button onClick={() => { setQuery(''); setAreaTecnica(''); setfiltro(false); }} className="flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-left text-sm font-semibold text-red-600 hover:bg-[#BFBFBF]">
                            <span>Limpar Filtros</span>
                          </button>
                        </div>
                        <div ref={scrollRef} className="flex max-h-48 flex-col gap-0.5 overflow-y-auto pr-1">
                          {opcoes.map((opcao) => {
                            const isSelected = areaTecnica === opcao.id;
                            return (
                              <button
                                key={opcao.id}
                                onClick={() => { setAreaTecnica(opcao.id); setfiltro(false); }}
                                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all ${isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-[#929292] hover:text-gray-900'}`}
                              >
                                <span className="break-words whitespace-normal leading-snug">{opcao.label}</span>
                                {isSelected && <Check className="ml-2 h-4 w-4 shrink-0 text-blue-600" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <button className="flex w-full shrink-0 items-center justify-center rounded-full bg-[#1E40AF] p-2.5 text-white transition-colors hover:bg-[#1E3A8A] sm:w-auto">
                    <Search className="h-5 w-5" />
                  </button>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-8 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-[#2563EB] lg:w-auto"
                >
                  <span>Solicitar</span>
                  {selectedItems.length > 0 && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-blue-600">{selectedItems.length}</span>
                  )}
                </button>
              </div>

              <div className="w-full overflow-x-auto rounded-xl border border-slate-700">
                <div className="min-w-[700px] w-full bg-[#1F2937]">
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-400 bg-[#D0D5DE] px-4 py-3 text-center text-sm font-bold text-slate-800 rounded-t-xl">
                    <div className="col-span-1 border-r border-slate-400 pr-2 flex items-center justify-center">ID</div>
                    <div className="col-span-3 border-r border-slate-400 px-2 flex items-center justify-center">Codigo U.F</div>
                    <div className="col-span-3 border-r border-slate-400 px-2 flex items-center justify-start pl-4">Item</div>
                    <div className="col-span-2 border-r border-slate-400 px-2 flex items-center justify-center">Quantidade</div>
                    <div className="col-span-1 border-r border-slate-400 px-2 flex items-center justify-center">Reserva</div>
                    <div className="col-span-2 px-2 flex items-center justify-center">Unidade</div>
                  </div>

                  {loading ? (
                    <div className="p-6 text-center font-medium text-gray-300">Carregando dados da API...</div>
                  ) : filteredItems.length === 0 ? (
                    <div className="p-6 text-center font-medium text-gray-400">Nenhum produto encontrado.</div>
                  ) : (
                    filteredItems.map((item, index) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleSelect(item.id)}
                        className={`grid grid-cols-12 gap-2 border-b border-slate-700 px-4 py-3 text-center items-center cursor-pointer transition-colors ${item.approved ? 'bg-blue-900/40 text-blue-200' : 'text-gray-200 hover:bg-slate-800'}`}
                      >
                        <div className="col-span-1 font-semibold">{index + 1}</div>
                        <div className="col-span-3 font-mono text-xs sm:text-sm">{item.code}</div>
                        <div className="col-span-3 flex min-w-0 items-center gap-2 pl-4 text-left font-medium">
                          {item.image && <img src={item.image} alt={item.name} className="h-7 w-7 rounded bg-white p-0.5 object-contain" />}
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="col-span-2 font-semibold">{item.stock}</div>
                        <div className="col-span-1 flex justify-center">
                          <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">{item.badgeValue || '0'}</span>
                        </div>
                        <div className="col-span-2 flex items-center justify-between px-2">
                          <span className="truncate">{item.location}</span>
                          <button
                            type="button"
                            className={`flex h-5 w-5 items-center justify-center rounded border ${item.approved ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}
                          >
                            {item.approved && <Check className="h-3.5 w-3.5 stroke-[3]" />}
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

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onMouseDown={(e) => { backdropMouseDownRef.current = e.target === e.currentTarget; }}
          onClick={(e) => {
            if (e.target === e.currentTarget && backdropMouseDownRef.current) setIsModalOpen(false);
            backdropMouseDownRef.current = false;
          }}
        >
          <div className="relative w-full max-w-4xl rounded-2xl border border-slate-700 bg-[#1F2937] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-xl font-bold text-white">Confirmar Solicitação</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="cursor-pointer text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              {selectedItems.length > 0 ? (
                <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
                  {selectedItems.map((item) => {
                    const details = requestDetails[item.id] || {};
                    const maxStock = item.stock || 1;
                    const validItem = isItemValid(item);

                    return (
                      <div key={item.id} className={`flex flex-col gap-3 rounded-xl border p-4 transition-all ${validItem ? 'border-slate-700 bg-slate-800/90' : 'border-red-500/50 bg-red-950/20'}`}>
                        <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-2">
                          <div className="flex items-center gap-3 overflow-hidden">
                            {item.image && <img src={item.image} alt={item.name} className="h-9 w-9 shrink-0 rounded bg-white p-0.5 object-contain" />}
                            <div className="truncate">
                              <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                              <p className="font-mono text-xs text-gray-400">Cód: {item.code} | Estoque: <span className="font-bold text-blue-400">{maxStock}</span></p>
                            </div>
                          </div>
                          <button type="button" onClick={() => handleToggleSelect(item.id)} className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-300">Quantidade *</label>
                            <input
                              type="number"
                              min="1"
                              max={maxStock}
                              value={details.quantidade ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') return handleDetailChange(item.id, 'quantidade', '');
                                let num = parseInt(val, 10);
                                if (isNaN(num) || num < 1) num = 1;
                                if (num > maxStock) num = maxStock;
                                handleDetailChange(item.id, 'quantidade', num);
                              }}
                              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-white focus:outline-none"
                            />
                          </div>

                          {/* Autocomplete de Unidade (Gama, Taguatinga, Sobradinho, Sig) */}
                          <AutocompleteUnidade
                            value={details.unidade ?? ''}
                            onChange={(novoValor) => handleDetailChange(item.id, 'unidade', novoValor)}
                          />

                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-300">Solicitante *</label>
                            <input
                              type="text"
                              value={details.solicitante ?? ''}
                              onChange={(e) => handleDetailChange(item.id, 'solicitante', e.target.value)}
                              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-white focus:outline-none"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-300">Data Solicitação *</label>
                            <input
                              type="text"
                              placeholder="DD/MM/AAAA"
                              maxLength={10}
                              value={details.dataSolicitacao ?? ''}
                              onChange={(e) => handleDetailChange(item.id, 'dataSolicitacao', formatDateInput(e.target.value))}
                              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-white focus:outline-none"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-300">Data Retirada *</label>
                            <input
                              type="text"
                              placeholder="DD/MM/AAAA"
                              maxLength={10}
                              value={details.dataRetirada ?? ''}
                              onChange={(e) => handleDetailChange(item.id, 'dataRetirada', formatDateInput(e.target.value))}
                              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-amber-400">Nenhum item selecionado.</p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-700 pt-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-xl bg-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-600">Cancelar</button>
              <button onClick={handleConfirmarSolicitacao} disabled={!isFormValid || isSending} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50">
                {isSending ? 'Enviando...' : 'Confirmar Envio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AppShell>
  );
}