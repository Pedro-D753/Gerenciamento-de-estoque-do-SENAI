import AppShell from '../components/AppShell.jsx';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ClipboardList, Download, Package, Warehouse } from 'lucide-react';
import { api } from '../services/api.js';

function formatStatus(value) {
  return value === 'SA' ? 'Solicitação de saída' : value === 'ST' ? 'Transferência' : value || '-';
}

export default function Estatistica() {
  const [items, setItems] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [erroExportacao, setErroExportacao] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.getItems(), api.getSolicitacoes()])
      .then(([products, requests]) => {
        if (active) {
          setItems(products);
          setSolicitacoes(requests);
        }
      })
      .catch((error) => console.error('Erro ao carregar dashboard:', error))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const totalEstoque = useMemo(() => items.reduce((total, item) => total + Number(item.stock || 0), 0), [items]);
  const itensCriticos = useMemo(
    () => items.filter((item) => Number(item.stock || 0) <= Number(item.badgeValue || 0)),
    [items]
  );
  const pendentes = solicitacoes.filter(({ solicitacao }) => ['EmAndamento', 'Separada'].includes(solicitacao?.tipo));
  const unidades = useMemo(() => {
    const counts = new Map();
    solicitacoes.forEach(({ estoque_solicitado: request }) => {
      const unit = request?.unidade_nome || 'Não informada';
      counts.set(unit, (counts.get(unit) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [solicitacoes]);

  async function exportarRelatorio() {
    setErroExportacao('');
    setExportando(true);
    try {
      await api.exportarRelatorioExcel();
    } catch (error) {
      setErroExportacao(error.message || 'Não foi possível gerar o relatório.');
    } finally {
      setExportando(false);
    }
  }

  return (
    <AppShell activeTab="Estatísticas">
      <div className="min-h-full bg-[#EBEAED] p-4 text-[#2E2D2F] sm:p-6 md:p-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard de estoque</h1>
              <p className="mt-1 text-sm text-slate-600">Indicadores calculados a partir dos produtos, estoques e solicitações cadastrados.</p>
            </div>
            <button
              type="button"
              onClick={exportarRelatorio}
              disabled={exportando}
              className="inline-flex items-center gap-2 rounded-xl bg-[#164194] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#0C3B7C] disabled:cursor-wait disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {exportando ? 'Gerando relatório...' : 'Exportar relatório Excel'}
            </button>
          </div>
          {erroExportacao && <p role="alert" className="rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-800">{erroExportacao}</p>}

          {loading ? (
            <div className="rounded-3xl bg-[#B7B6B9] p-8 text-center font-medium text-[#58575A]">Carregando indicadores...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric icon={Package} label="Itens cadastrados" value={items.length} />
                <Metric icon={Warehouse} label="Quantidade em estoque" value={totalEstoque} />
                <Metric icon={ClipboardList} label="Solicitações" value={solicitacoes.length} />
                <Metric icon={AlertTriangle} label="Itens abaixo do mínimo" value={itensCriticos.length} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-3xl bg-[#B7B6B9] p-5 shadow-xl">
                  <h2 className="mb-4 text-lg font-bold">Solicitações recentes</h2>
                  {solicitacoes.length === 0 ? (
                    <p className="text-sm text-slate-600">Nenhuma solicitação cadastrada.</p>
                  ) : (
                    <div className="space-y-2">
                      {solicitacoes.slice(0, 8).map(({ solicitacao, estoque_solicitado }) => (
                        <div key={solicitacao.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-300 bg-[#F3F4F6] px-3 py-2 text-sm">
                          <span className="truncate font-medium">#{solicitacao.id} · {solicitacao.solicitante || 'Sem solicitante'}</span>
                          <span className="shrink-0 text-slate-600">{formatStatus(solicitacao.estado)} · {solicitacao.qtd_acao} un.</span>
                          <span className="hidden text-xs text-slate-500 sm:inline">Estoque #{estoque_solicitado.estoque_id}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-3xl bg-[#B7B6B9] p-5 shadow-xl">
                  <h2 className="mb-4 text-lg font-bold">Distribuição por unidade</h2>
                  {unidades.length === 0 ? (
                    <p className="text-sm text-slate-600">Ainda não há solicitações por unidade.</p>
                  ) : (
                    <div className="space-y-3">
                      {unidades.map(([unit, count]) => (
                        <div key={unit} className="flex items-center justify-between rounded-xl border border-slate-300 bg-[#F3F4F6] px-4 py-3">
                          <span className="font-medium">{unit}</span>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <section className="rounded-3xl bg-[#B7B6B9] p-5 shadow-xl">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-bold">Itens críticos</h2>
                  <span className="text-sm text-slate-600">{pendentes.length} solicitação(ões) em andamento</span>
                </div>
                {itensCriticos.length === 0 ? (
                  <p className="text-sm text-slate-600">Nenhum item está abaixo da quantidade mínima.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {itensCriticos.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <span className="truncate font-medium">{item.name}</span>
                        <span className="ml-3 shrink-0 font-bold text-amber-800">{item.stock} / mín. {item.badgeValue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl bg-[#B7B6B9] p-5 shadow-xl">
      <div className="flex items-center gap-3 text-slate-600">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="mt-3 text-3xl font-black text-slate-900">{value}</div>
    </div>
  );
}
