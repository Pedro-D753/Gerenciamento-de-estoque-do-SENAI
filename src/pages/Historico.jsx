import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStock } from '../context/StockContext';
import { Search, ChevronDown, Pencil, Trash2 } from 'lucide-react';

export const Historico = () => {
  const { items, deleteItem, setEditingItem } = useStock();
  const navigate = useNavigate();
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

  const handleEdit = (item) => {
    setEditingItem(item);
    navigate('/cadastro');
  };

  const handleDelete = (id, itemName) => {
    if (window.confirm(`Tem certeza que deseja remover o item "${itemName}" do estoque?`)) {
      deleteItem(id);
    }
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

        {/* Filter */}
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
              <th className="py-3 px-2.5 border-r border-[#bcc2cb] w-[6%]">ID</th>
              <th className="py-3 px-2.5 border-r border-[#bcc2cb] w-[18%]">Código U.F.</th>
              <th className="py-3 px-2.5 border-r border-[#bcc2cb] w-[22%]">Item</th>
              <th className="py-3 px-2.5 border-r border-[#bcc2cb] w-[13%]">Quantidade</th>
              <th className="py-3 px-2.5 border-r border-[#bcc2cb] w-[13%]">Reserva</th>
              <th className="py-3 px-2.5 border-r border-[#bcc2cb] w-[12%]">Unidade</th>
              <th className="py-3 px-2.5 border-r border-[#bcc2cb] w-[8%]">Editar</th>
              <th className="py-3 px-2.5 w-[8%]">Deletar</th>
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
                    <td className="py-3 px-2.5 border-r border-[#d5dae1] text-gray-800">{row.id}</td>
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
                    <td className="py-3 px-2.5 border-r border-[#d5dae1] text-gray-800">{row.quantidade}</td>
                    <td className="py-3 px-2.5 border-r border-[#d5dae1]">
                      <span
                        className={`inline-block px-4 py-0.5 rounded text-white text-xs font-bold min-w-[42px] ${
                          row.reserva > 5 ? 'bg-[#cf1b1b]' : 'bg-[#0b499e]'
                        }`}
                      >
                        {row.reserva}
                      </span>
                    </td>
                    <td className="py-3 px-2.5 border-r border-[#d5dae1] text-gray-800">{row.unidade}</td>
                    <td className="py-3 px-2.5 border-r border-[#d5dae1]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(row);
                        }}
                        className="text-[#0b63d6] hover:bg-black/5 p-1.5 rounded transition cursor-pointer"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                    <td className="py-3 px-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(row.id, row.item);
                        }}
                        className="text-gray-800 hover:bg-black/5 p-1.5 rounded transition cursor-pointer"
                        title="Deletar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>

                  {/* Sub-row when expanded matching Image 2 */}
                  {isExpanded && (
                    <tr 
                      onClick={() => toggleRowExpand(row.id)}
                      className="bg-[#d8dde3] border-b-4 border-[#cfd5dc] cursor-pointer"
                    >
                      <td colSpan={8} className="p-3">
                        <div className="flex items-center justify-start gap-4 pl-24 pr-4">
                          {/* Entrada */}
                          <div 
                            className="bg-[#cbd1d8] rounded-xl py-2 px-6 text-center border border-[#bcc2cb] shadow-xs min-w-[120px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-[11px] font-semibold text-gray-700">Entrada</div>
                            <div className="text-[13px] font-bold text-gray-900 mt-1">{row.entrada || row.quantidade}</div>
                          </div>

                          {/* Saída */}
                          <div 
                            className="bg-[#cbd1d8] rounded-xl py-2 px-6 text-center border border-[#bcc2cb] shadow-xs min-w-[120px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-[11px] font-semibold text-gray-700">Saida</div>
                            <div className="text-[13px] font-bold text-gray-900 mt-1">{row.saida || 0}</div>
                          </div>

                          {/* Tempo de Estoque */}
                          <div 
                            className="bg-[#cbd1d8] rounded-xl py-2 px-6 text-center border border-[#bcc2cb] shadow-xs min-w-[200px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-[11px] font-semibold text-gray-700">Tempo de Estoque</div>
                            <div className="text-[12px] font-bold text-gray-900 mt-1">{row.tempoEstoque}</div>
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
