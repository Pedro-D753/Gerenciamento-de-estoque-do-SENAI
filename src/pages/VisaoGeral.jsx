import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { Search, ChevronDown, ArrowUp, Circle, X } from 'lucide-react';

export const VisaoGeral = () => {
  const { items, toggleStatusAceitar } = useStock();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState({ 1: true });
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.motivo && item.motivo.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedFilter === 'Todos') return matchesSearch;
    if (selectedFilter === 'Gama') return matchesSearch && item.unidade === 'Gama';
    if (selectedFilter === 'Devolução') return matchesSearch && item.devolucao;
    return matchesSearch;
  });

  return (
    <div className="bg-[#dfe3e8] rounded-2xl p-5 shadow-sm border border-[#cfd5dc]">
      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#cbd2d9] rounded-full px-4 py-1 flex items-center w-64 shadow-inner">
            <input
              type="text"
              placeholder="Buscar Item"
              className="bg-transparent border-none outline-none w-full h-8 text-sm text-gray-800 text-center placeholder-gray-600 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="bg-[#0b499e] hover:bg-[#083777] text-white w-10 h-10 rounded-full flex items-center justify-center transition shadow-md hover:scale-105 cursor-pointer"
            title="Buscar"
          >
            <Search size={19} />
          </button>
        </div>

        {/* Filter dropdown */}
        <div className="relative ml-auto">
          <div className="flex items-center bg-[#cbd2d9] rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="p-2 px-3 text-gray-700 hover:bg-black/5 border-r border-[#b8bec5] cursor-pointer"
            >
              <ChevronDown size={18} />
            </button>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-black/5 cursor-pointer"
            >
              Filtro {selectedFilter !== 'Todos' ? `(${selectedFilter})` : ''}
            </button>
          </div>

          {showFilterDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl py-1 min-w-[150px] z-50 border border-gray-100">
              <button
                onClick={() => { setSelectedFilter('Todos'); setShowFilterDropdown(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
              >
                Todos
              </button>
              <button
                onClick={() => { setSelectedFilter('Gama'); setShowFilterDropdown(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
              >
                Unidade Gama
              </button>
              <button
                onClick={() => { setSelectedFilter('Devolução'); setShowFilterDropdown(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
              >
                Com Devolução
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg overflow-hidden bg-[#d1d6dc]">
        <table className="w-full border-collapse text-center text-[13.5px]">
          <thead>
            <tr className="bg-[#cbd1d8] text-gray-900 font-semibold border-b-2 border-[#b3b9c1]">
              <th className="py-3 px-2.5 border-r border-[#bcc2cb] w-[14%]">Motivo da Abertura</th>
              <th className="py-3 px-2.5 border-r border-[#bcc2cb] w-[14%]">Código do Item</th>
              <th className="py-3 px-2.5 border-r border-[#bcc2cb] w-[22%]">Item</th>
              <th className="py-3 px-2.5 border-r border-[#bcc2cb] w-[14%]">Data de Solicitação</th>
              <th className="py-3 px-2.5 border-r border-[#bcc2cb] w-[10%]">Quantidade</th>
              <th className="py-3 px-2.5 border-r border-[#bcc2cb] w-[10%]">Unidade</th>
              <th className="py-3 px-2.5 w-[16%]">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((row) => {
              const isExpanded = !!expandedRows[row.id];
              return (
                <React.Fragment key={row.id}>
                  {/* Main Row */}
                  <tr
                    onClick={() => toggleRowExpand(row.id)}
                    className={`border-b border-[#dfe3e8] transition-colors cursor-pointer select-none ${
                      isExpanded ? 'bg-[#eceff3]' : 'bg-[#e5e8ed] hover:bg-[#eceff3]'
                    }`}
                  >
                    <td className="py-3 px-2.5 border-r border-[#d5dae1] text-gray-800">{row.motivo}</td>
                    <td className="py-3 px-2.5 border-r border-[#d5dae1] text-gray-800">{row.codigo}</td>
                    <td className="py-3 px-2.5 border-r border-[#d5dae1] text-gray-900 font-semibold">
                      <div className="flex items-center justify-center gap-1.5">
                        <ChevronDown 
                          size={15} 
                          className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#0b499e]' : ''}`} 
                        />
                        <span>{row.item}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2.5 border-r border-[#d5dae1] text-gray-800">{row.data}</td>
                    <td className="py-3 px-2.5 border-r border-[#d5dae1] text-gray-800">{row.quantidade}</td>
                    <td className="py-3 px-2.5 border-r border-[#d5dae1] text-gray-800">{row.unidade}</td>
                    <td className="py-3 px-2.5">
                      <div
                        className="flex items-center justify-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Retirada */}
                        <button
                          onClick={() => alert(`Retirada efetuada para ${row.item}`)}
                          className="w-8 h-8 rounded-md bg-[#103ae5] hover:bg-[#0c2ec0] text-white flex items-center justify-center shadow transition-transform active:scale-95 cursor-pointer"
                          title="Retirada do estoque"
                        >
                          <ArrowUp size={18} strokeWidth={3} />
                        </button>

                        {/* Aceitar / Aprovado */}
                        <button
                          onClick={() => toggleStatusAceitar(row.id)}
                          className={`w-8 h-8 rounded-md text-white flex items-center justify-center shadow transition-transform active:scale-95 cursor-pointer ${
                            row.statusAceitar ? 'bg-[#0ec015] hover:bg-[#0da913]' : 'bg-[#a4abb5] hover:bg-[#9199a4]'
                          }`}
                          title={row.statusAceitar ? 'Solicitação Aceita' : 'Aprovado'}
                        >
                          <Circle size={18} strokeWidth={3} />
                        </button>

                        {/* Recusar */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja recusar a solicitação de ${row.item}?`)) {
                              alert('Solicitação recusada!');
                            }
                          }}
                          className="w-8 h-8 rounded-md bg-[#d61818] hover:bg-[#b81414] text-white flex items-center justify-center shadow transition-transform active:scale-95 cursor-pointer"
                          title="Recusar solicitação"
                        >
                          <X size={18} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Sub-row matching Image Reference */}
                  {isExpanded && (
                    <tr 
                      onClick={() => toggleRowExpand(row.id)}
                      className="bg-[#d8dde3] border-b-4 border-[#cfd5dc] cursor-pointer"
                    >
                      <td colSpan={7} className="p-3">
                        <div className="flex items-center justify-start gap-4 pl-28 pr-4">
                          {/* Data prevista de Retirada */}
                          <div 
                            className="bg-[#cbd1d8] rounded-xl py-2 px-6 text-center border border-[#bcc2cb] shadow-xs min-w-[190px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-[11px] font-semibold text-gray-700">Data prevista de Retirada</div>
                            <div className="text-[13px] font-bold text-gray-900 mt-1">{row.dataPrevista || '20/07/2026'}</div>
                          </div>

                          {/* Quem Solicitou */}
                          <div 
                            className="bg-[#cbd1d8] rounded-xl py-2 px-6 text-center border border-[#bcc2cb] shadow-xs min-w-[210px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-[11px] font-semibold text-gray-700">Quem Solicitou</div>
                            <div className="text-[13px] font-bold text-gray-900 mt-1">{row.solicitante || 'Andre Felipe Maciel'}</div>
                          </div>

                          {/* Devolução */}
                          <div 
                            className="bg-[#cbd1d8] rounded-xl py-2 px-8 flex flex-col items-center justify-center border border-[#bcc2cb] shadow-xs min-w-[170px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-[11px] font-semibold text-gray-700 mb-1">Devolução</div>
                            <input
                              type="checkbox"
                              checked={row.devolucao || false}
                              readOnly
                              className="w-4 h-4 rounded accent-[#0b499e] cursor-default"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
