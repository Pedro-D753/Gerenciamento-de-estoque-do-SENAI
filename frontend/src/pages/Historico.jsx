import AppShell from '../components/AppShell.jsx';
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { api } from '../services/api.js';

export default function Historico() {
  
  
  const [query, setQuery] = useState('');
  const [areaTecnica, setAreaTecnica] = useState('');
  const [historyType, setHistoryType] = useState('solicitacoes');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categorias, setCategorias] = useState([]);
  const [items, setItems] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setfiltro] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [padNote, setPadNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const scrollRef = useRef(null);
  const filtroRef = useRef(null);

  function mudarfiltro() {
    setfiltro(!filtro);
  }

  

  const toggleExpand = (id) => {
    setExpandedItemId((prev) => (prev === id ? null : id));
  };

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
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [data, areas, deleted] = await Promise.all([
        api.getSolicitacoes(),
        api.getCategorias(),
        api.getItensExcluidos(),
      ]);
      setCategorias(areas);
      setItems(data.map((entry) => {
        const solicitation = entry.solicitacao || {};
        const stockRequest = entry.estoque_solicitado || {};
        return {
          id: solicitation.id ?? entry.id,
          code: stockRequest.produto_codigo ?? stockRequest.estoque_id ?? '-',
          name: stockRequest.produto_nome ?? `Estoque #${stockRequest.estoque_id ?? '-'}`,
          location: stockRequest.unidade_nome ?? solicitation.estado ?? '-',
          dataReserva: solicitation.dt_solicitacao
            ? new Date(solicitation.dt_solicitacao).toLocaleDateString('pt-BR')
            : '-',
          solicitante: solicitation.solicitante ?? '-',
          dataSolicitacao: solicitation.dt_solicitacao
            ? new Date(solicitation.dt_solicitacao).toLocaleDateString('pt-BR')
            : '-',
          dataRetirada: solicitation.dt_retirada
            ? new Date(solicitation.dt_retirada).toLocaleDateString('pt-BR')
            : '-',
          dataRecebimento: solicitation.dt_retirada
            ? new Date(solicitation.dt_retirada).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            : '-',
          requestedQty: solicitation.qtd_acao ?? 0,
          status: solicitation.tipo ?? 'EmAndamento',
          obsPad: solicitation.obs_pad ?? '',
          obsRecusa: solicitation.obs_recusa ?? '',
          categoriaId: stockRequest.categoria_id,
          raw: entry,
        };
      }));
      setDeletedItems(deleted.map((entry) => ({
        id: entry.id,
        code: entry.produto_codigo ?? '-',
        name: entry.produto_nome ?? `Estoque #${entry.id}`,
        location: entry.unidade_nome ?? '-',
        motivoExclusao: entry.motivo_exclusao ?? '',
        dataExclusao: entry.dt_exclusao
          ? new Date(entry.dt_exclusao).toLocaleString('pt-BR')
          : 'Não informada',
      })));
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setItems([]);
      setDeletedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openRejectDialog = (event, item) => {
    event.stopPropagation();
    setRejectingItem(item);
    setPadNote('');
    setRejectReason('');
    setRejectError('');
  };

  const submitRejection = async (event) => {
    event.preventDefault();
    setRejectError('');
    setRejecting(true);
    try {
      await api.recusarSolicitacaoMaster(rejectingItem.id, {
        obs_pad: padNote.trim(),
        obs_recusa: rejectReason.trim(),
      });
      setRejectingItem(null);
      await fetchHistory();
    } catch (error) {
      setRejectError(error.message || 'Não foi possível recusar a solicitação.');
    } finally {
      setRejecting(false);
    }
  };

  const displayedItems = historyType === 'exclusoes' ? deletedItems : items;
  const filteredItems = displayedItems.filter((item) => {
    const matchesQuery =
      !query ||
      item.name?.toLowerCase().includes(query.toLowerCase()) ||
      item.code?.toString().toLowerCase().includes(query.toLowerCase()) ||
      item.solicitante?.toLowerCase().includes(query.toLowerCase()) ||
      item.location?.toLowerCase().includes(query.toLowerCase()) ||
      item.motivoExclusao?.toLowerCase().includes(query.toLowerCase());

    const matchesArea = historyType === 'exclusoes' || !areaTecnica || String(item.categoriaId) === areaTecnica;
    const matchesStatus = historyType === 'exclusoes' || statusFilter === 'all' || item.status === statusFilter;

    return matchesQuery && matchesArea && matchesStatus;
  });

  return (
    <AppShell activeTab="Solicitação">
      <div className="historico-page flex min-h-full w-full flex-col bg-[#EBEAED]">
      

      <div className="flex min-h-full w-full flex-1">
        

        <main className="flex flex-1 min-w-0 flex-col bg-[#EBEAED]">
          <div className="flex w-full items-center justify-between border-b border-[#B7B6B9] bg-[#EBEAED] px-4 pt-4 pb-0 sm:px-8">
            <div className="rounded-t-xl border-t border-x border-slate-300 bg-[#CBD0D8] px-6 py-2.5 font-bold text-slate-900 shadow-xs sm:px-12">
              Histórico
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6 md:p-8">
            <div className="flex w-full flex-col gap-6 rounded-3xl bg-[#B7B6B9] p-4 shadow-xl sm:p-6">
              <div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row">
                <div className="flex w-full flex-1 flex-col items-center gap-3 sm:flex-row">
                  <select
                    value={historyType}
                    onChange={(event) => setHistoryType(event.target.value)}
                    aria-label="Tipo de histórico"
                    className="area-filter-control w-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
                  >
                    <option value="solicitacoes">Solicitações</option>
                    <option value="exclusoes">Itens excluídos pelo estoquista</option>
                  </select>
                  {historyType === 'solicitacoes' && (
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      aria-label="Filtrar solicitações por status"
                      className="area-filter-control w-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
                    >
                      <option value="all">Todos os status</option>
                      <option value="Cancelada">Canceladas</option>
                      <option value="Separada">Separadas</option>
                      <option value="Retirada">Retiradas</option>
                    </select>
                  )}
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar no Histórico"
                    className="w-full rounded-full bg-[#CDCDCD] px-5 py-2.5 text-center font-medium text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 sm:w-64 sm:text-left"
                  />

                  {historyType !== 'exclusoes' && <div ref={filtroRef} className="relative w-full sm:w-auto">
                    <button onClick={mudarfiltro} className="area-filter-control flex w-35 items-center justify-center gap-2 px-5 py-2.5 sm:w-auto" type="button">
                      <ChevronDown className={`h-5 w-5 text-gray-700 transition-transform ${filtro ? 'rotate-180' : ''}`} />
                      <span>Área tecnológica</span>
                    </button>

                    {filtro && (
                      <div className="area-filter-menu absolute right-0 z-50 mt-2 w-full sm:w-72 overflow-hidden p-1.5">
                        <div className="pb-1 mb-1 border-b border-gray-200/80">
                          <button onClick={() => { setQuery(''); setAreaTecnica(''); setHistoryType('solicitacoes'); setfiltro(false); }} className="area-filter-clear flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-left text-sm font-semibold hover:bg-[#BFBFBF]">
                            <span>Limpar Filtros</span>
                          </button>
                        </div>

                        <div ref={scrollRef} className="flex max-h-48 flex-col gap-0.5 overflow-y-auto pr-1">
                          <button
                            onClick={() => { setAreaTecnica(''); setfiltro(false); }}
                            aria-pressed={!areaTecnica}
                            className="area-filter-option flex w-full items-center justify-between px-3.5 py-2.5 text-sm"
                          >
                            Todas as áreas
                          </button>
                          {categorias.map((categoria) => {
                            const isSelected = areaTecnica === String(categoria.id);
                            return (
                              <button
                                key={categoria.id}
                                onClick={() => { setAreaTecnica(String(categoria.id)); setfiltro(false); }}
                                aria-pressed={isSelected}
                                className="area-filter-option flex w-full items-center justify-between px-3.5 py-2.5 text-sm transition-all"
                              >
                                <span className="break-words whitespace-normal leading-snug">{categoria.nome}</span>
                                {isSelected && <Check className="ml-2 h-4 w-4 shrink-0 text-blue-600" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>}

                  <button className="flex w-full shrink-0 items-center justify-center rounded-full bg-[#1E40AF] p-2.5 text-white hover:bg-[#1E3A8A] sm:w-auto">
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {historyType === 'exclusoes' ? (
                <div className="w-full overflow-x-auto rounded-xl border border-slate-700">
                  <table className="deleted-items-table w-full border-collapse bg-[#D6D6D6] text-left text-sm text-gray-900">
                    <thead className="bg-[#D0D5DE] text-slate-800">
                      <tr>
                        <th className="border-b border-slate-400 px-4 py-3">ID</th>
                        <th className="border-b border-slate-400 px-4 py-3">Código U.F.</th>
                        <th className="border-b border-slate-400 px-4 py-3">Item</th>
                        <th className="border-b border-slate-400 px-4 py-3">Unidade</th>
                        <th className="border-b border-slate-400 px-4 py-3">Data de exclusão</th>
                        <th className="border-b border-slate-400 px-4 py-3">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="6" className="p-6 text-center">Carregando histórico...</td></tr>
                      ) : filteredItems.length === 0 ? (
                        <tr><td colSpan="6" className="p-6 text-center">Nenhum item excluído encontrado.</td></tr>
                      ) : filteredItems.map((item) => (
                        <React.Fragment key={item.id}>
                          <tr className="deleted-item-row border-b border-slate-300 align-middle hover:bg-[#C7CBD1]">
                            <td className="px-4 py-3 font-semibold">{item.id}</td>
                            <td className="px-4 py-3 font-mono">{item.code}</td>
                            <td className="px-4 py-2">
                              <button
                                type="button"
                                className="deleted-item-expand"
                                aria-expanded={expandedItemId === item.id}
                                onClick={() => toggleExpand(item.id)}
                              >
                                <span className="deleted-item-preview">{item.name}</span>
                                <span className="sr-only">{expandedItemId === item.id ? 'Ocultar detalhes' : 'Ver detalhes completos'}</span>
                              </button>
                            </td>
                            <td className="px-4 py-3">{item.location}</td>
                            <td className="px-4 py-3">{item.dataExclusao}</td>
                            <td className="px-4 py-2">
                              <button
                                type="button"
                                className="deleted-item-expand"
                                aria-expanded={expandedItemId === item.id}
                                onClick={() => toggleExpand(item.id)}
                              >
                                <span className="deleted-item-preview">{item.motivoExclusao || 'Não informado'}</span>
                                <span className="sr-only">{expandedItemId === item.id ? 'Ocultar detalhes' : 'Ver detalhes completos'}</span>
                              </button>
                            </td>
                          </tr>
                          {expandedItemId === item.id && (
                            <tr className="deleted-item-details-row">
                              <td colSpan="6" className="px-4 py-3">
                                <div className="deleted-item-details">
                                  <div><strong>Item completo</strong><p>{item.name}</p></div>
                                  <div><strong>Motivo da exclusão</strong><p>{item.motivoExclusao || 'Não informado'}</p></div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
              <div className="master-grid-table w-full overflow-x-auto rounded-xl border">
                <div className="min-w-[750px] w-full">
                  <div className="master-grid-table-header grid grid-cols-12 gap-2 border-b px-4 py-3 text-center text-sm rounded-t-xl">
                    <div className="col-span-1 border-r border-slate-400 pr-2 flex items-center justify-center">ID</div>
                    <div className="col-span-2 border-r border-slate-400 px-2 flex items-center justify-center">Código U.F.</div>
                    <div className="col-span-3 border-r border-slate-400 px-2 flex items-center justify-center">Item</div>
                    <div className="col-span-2 border-r border-slate-400 px-2 flex items-center justify-center">Data da Reserva</div>
                    <div className="col-span-1 border-r border-slate-400 px-2 flex items-center justify-center">Quantidade</div>
                    <div className="col-span-2 border-r border-slate-400 px-2 flex items-center justify-center">Unidade</div>
                    <div className="col-span-1 px-2 flex items-center justify-center">Info</div>
                  </div>

                  {loading ? (
                    <div className="p-6 text-center font-medium text-gray-600">Carregando histórico...</div>
                  ) : filteredItems.length === 0 ? (
                    <div className="p-6 text-center font-medium text-gray-600">Nenhum item solicitado até o momento.</div>
                  ) : (
                    filteredItems.map((item, index) => {
                      const isExpanded = expandedItemId === item.id;

                      return (
                        <React.Fragment key={item.id}>
                          <div
                            onClick={() => toggleExpand(item.id)}
                            className={`master-grid-table-row grid grid-cols-12 gap-2 border-b px-4 py-3 text-center items-center cursor-pointer transition-colors ${isExpanded ? 'is-selected' : ''}`}
                          >
                            <div className="col-span-1 font-semibold">{index + 1}</div>
                            <div className="col-span-2 font-mono text-xs sm:text-sm">{item.code}</div>
                            <div className="col-span-3 flex items-center justify-center gap-2 text-center font-medium">
                              {item.image && <img src={item.image} alt={item.name} className="h-7 w-7 rounded bg-white p-0.5 object-contain shrink-0" />}
                              <span className="truncate">{item.name}</span>
                            </div>
                            <div className="col-span-2 text-xs sm:text-sm font-medium">{item.dataReserva || item.dataSolicitacao}</div>
                            <div className="col-span-1 font-semibold">{item.requestedQty || item.stock || 1}</div>
                            <div className="col-span-2 text-xs sm:text-sm truncate">{item.location}</div>
                            <div className="col-span-1 flex justify-center items-center">
                              <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="relative col-span-12 bg-[#D1D5DB] p-4 border-b border-slate-600 transition-all text-left text-gray-900">
                              <div className="flex flex-wrap items-center justify-start gap-3">
                                <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-3 min-w-[140px] min-h-[75px] text-center border border-gray-300">
                                  <span className="text-xs font-semibold text-gray-700">Status:</span>
                                  <span className="mt-1 text-xs font-bold text-gray-900">{item.status}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-3 min-w-[140px] min-h-[75px] text-center border border-gray-300">
                                  <span className="text-xs font-semibold text-gray-700">Solicitante:</span>
                                  <span className="mt-1 text-xs font-bold text-gray-900">{item.solicitante || '-'}</span>
                                </div>

                                <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-3 min-w-[130px] min-h-[75px] text-center border border-gray-300">
                                  <span className="text-xs font-semibold text-gray-700 leading-tight">Data de<br />Recebimento</span>
                                  <span className="mt-1 text-xs font-bold text-gray-900">{item.dataRecebimento || '-'}</span>
                                </div>

                                <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-3 min-w-[130px] min-h-[75px] text-center border border-gray-300">
                                  <span className="text-xs font-semibold text-gray-700">Data de Solicitação:</span>
                                  <span className="mt-1 text-xs font-bold text-gray-900">{item.dataSolicitacao || '-'}</span>
                                </div>

                                {item.status !== 'Cancelada' && (
                                  <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-3 min-w-[130px] min-h-[75px] text-center border border-gray-300">
                                    <span className="text-xs font-semibold text-gray-700">Data de Retirada:</span>
                                    <span className="mt-1 text-xs font-bold text-gray-900">{item.dataRetirada || '-'}</span>
                                  </div>
                                )}

                                <div className="flex flex-col items-center justify-center bg-[#E5E7EB] rounded-xl px-4 py-3 min-w-[100px] min-h-[75px] text-center border border-gray-300">
                                  <span className="text-xs font-semibold text-gray-700">PED:</span>
                                  <span className="mt-1 text-xs font-bold text-gray-900">{item.ped || '-'}</span>
                                </div>

                                <div className="ml-auto flex items-center justify-end px-2 pt-2 text-xs font-bold text-gray-800">
                                  {item.saCode || '-'}
                                </div>
                                {item.status === 'Cancelada' && (
                                  <>
                                    <div className="w-full rounded-lg bg-[#E5E7EB] p-3 text-sm">
                                      <strong>Observação (PAD):</strong> {item.obsPad || '-'}
                                    </div>
                                    <div className="w-full rounded-lg bg-[#E5E7EB] p-3 text-sm">
                                      <strong>Motivo da recusa:</strong> {item.obsRecusa || '-'}
                                    </div>
                                  </>
                                )}
                                {item.status === 'EmAndamento' && (
                                  <button
                                    type="button"
                                    onClick={(event) => openRejectDialog(event, item)}
                                    className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                                  >
                                    Recusar solicitação
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation">
          <form onSubmit={submitRejection} className="w-full max-w-lg rounded-2xl bg-[#B7B6B9] p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="master-reject-title">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="master-reject-title" className="m-0 text-xl font-bold text-slate-900">Recusar solicitação #{rejectingItem.id}</h2>
              <button type="button" onClick={() => setRejectingItem(null)} className="icon-button rounded-lg p-2 text-slate-700 hover:bg-slate-300" aria-label="Fechar">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="mb-4 block text-sm font-semibold text-slate-800">
              Observação (PAD)
              <textarea value={padNote} onChange={(event) => setPadNote(event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-slate-400 bg-[#D1D5DB] p-3 font-normal" maxLength={2000} required />
            </label>
            <label className="mb-4 block text-sm font-semibold text-slate-800">
              Motivo da recusa
              <textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-slate-400 bg-[#D1D5DB] p-3 font-normal" maxLength={2000} required />
            </label>
            {rejectError && <p role="alert" className="rounded-lg bg-red-100 p-3 text-sm text-red-800">{rejectError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setRejectingItem(null)} className="rounded-lg bg-slate-500 px-4 py-2 font-semibold text-white">Cancelar</button>
              <button type="submit" disabled={rejecting || !padNote.trim() || !rejectReason.trim()} className="rounded-lg bg-red-700 px-4 py-2 font-semibold text-white disabled:opacity-60">{rejecting ? 'Recusando...' : 'Confirmar recusa'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
    </AppShell>
  );
}