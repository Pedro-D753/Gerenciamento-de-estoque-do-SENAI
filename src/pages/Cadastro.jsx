import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStock } from '../context/StockContext';
import { ArrowLeft, Image as ImageIcon, Barcode } from 'lucide-react';

export const Cadastro = () => {
  const { addItem, updateItem, editingItem, setEditingItem } = useStock();
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    item: '',
    codigo: '',
    quantidade: '',
    unidade: '',
    categoria: '',
    medida: 'GB',
    descricao: '',
    marca: '',
    ano: '',
    modelo: '',
    cor: '',
    valor: '',
    campoExtra1: '',
    campoExtra2: '',
    campoExtra3: '',
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (editingItem) {
      setFormState({
        item: editingItem.item || '',
        codigo: editingItem.codigo || '',
        quantidade: editingItem.quantidade || '',
        unidade: editingItem.unidade || 'Gama',
        categoria: editingItem.categoria || '',
        medida: editingItem.medida || 'GB',
        descricao: editingItem.descricao || '',
        marca: editingItem.caracteristicas?.marca || '',
        ano: editingItem.caracteristicas?.ano || '',
        modelo: editingItem.caracteristicas?.modelo || '',
        cor: editingItem.caracteristicas?.cor || '',
        valor: editingItem.caracteristicas?.valor || '',
        campoExtra1: '',
        campoExtra2: '',
        campoExtra3: '',
      });
    }
  }, [editingItem]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setFormState({
      item: '',
      codigo: '',
      quantidade: '',
      unidade: '',
      categoria: '',
      medida: 'GB',
      descricao: '',
      marca: '',
      ano: '',
      modelo: '',
      cor: '',
      valor: '',
      campoExtra1: '',
      campoExtra2: '',
      campoExtra3: '',
    });
    setPreviewImage(null);
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.item.trim()) {
      alert('Por favor, informe o nome do item.');
      return;
    }

    if (editingItem) {
      updateItem(editingItem.id, {
        item: formState.item,
        codigo: formState.codigo,
        quantidade: Number(formState.quantidade) || 0,
        unidade: formState.unidade,
        categoria: formState.categoria,
        medida: formState.medida,
        descricao: formState.descricao,
        caracteristicas: {
          marca: formState.marca,
          ano: formState.ano,
          modelo: formState.modelo,
          cor: formState.cor,
          valor: formState.valor,
        },
      });
      alert('Item atualizado com sucesso!');
      setEditingItem(null);
    } else {
      const newItem = {
        id: Date.now(),
        motivo: 'Solicitação Manual',
        codigo: formState.codigo || '00' + Math.floor(10000000 + Math.random() * 90000000),
        item: formState.item,
        data: new Date().toLocaleDateString('pt-BR'),
        quantidade: Number(formState.quantidade) || 1,
        unidade: formState.unidade || 'Gama',
        reserva: 0,
        entrada: Number(formState.quantidade) || 1,
        saida: 0,
        tempoEstoque: 'Recém cadastrado',
        dataPrevista: 'A definir',
        solicitante: 'Usuário Estoquista',
        statusApproved: false,
        statusRetirada: false,
        statusAceitar: false,
        statusRecusar: false,
        categoria: formState.categoria,
        medida: formState.medida,
        descricao: formState.descricao,
        caracteristicas: {
          marca: formState.marca,
          ano: formState.ano,
          modelo: formState.modelo,
          cor: formState.cor,
          valor: formState.valor,
        },
      };
      addItem(newItem);
      alert('Item cadastrado com sucesso!');
    }

    navigate('/historico');
  };

  return (
    <div>
      {/* Back button */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-lg text-gray-900 hover:bg-[#ccd2d9] transition cursor-pointer"
          title="Voltar"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Top Form Box */}
        <div className="bg-[#cfd4da] rounded-xl p-6 flex flex-col md:flex-row gap-7 shadow-sm border border-[#bcc2cb]">
          {/* Left: Image Upload */}
          <label className="w-full md:w-72 border-2 border-dashed border-[#a8b0ba] rounded-2xl bg-[#dbe0e6] flex flex-col items-center justify-center p-6 cursor-pointer hover:border-[#0b499e] hover:bg-[#e3e7ec] transition group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <div className="w-36 h-36 bg-black rounded-2xl flex items-center justify-center mb-3.5 overflow-hidden shadow-inner">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Pré-visualização"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon size={64} className="text-white" strokeWidth={1.5} />
              )}
            </div>
            <span className="text-[15px] font-bold text-gray-900 group-hover:text-[#0b499e] transition">
              Enviar Imagem
            </span>
            <span className="text-xs text-gray-600 mt-0.5">
              (ou Arrastar Arquivo)
            </span>
          </label>

          {/* Right: Form Inputs */}
          <div className="flex-1 flex flex-col gap-3.5">
            {/* Nome do item */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-900">
                Nome do item
              </label>
              <input
                type="text"
                placeholder="ex: Pendrive"
                className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#0b499e] transition"
                value={formState.item}
                onChange={(e) => setFormState({ ...formState, item: e.target.value })}
                required
              />
            </div>

            {/* Código e Unidade */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-900">
                  Código U.F.
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="ex: 0010151110"
                    className="w-full bg-white border border-[#bcc2cb] rounded-md pl-3 pr-10 py-2 text-sm text-gray-900 outline-none focus:border-[#0b499e] transition"
                    value={formState.codigo}
                    onChange={(e) => setFormState({ ...formState, codigo: e.target.value })}
                  />
                  <Barcode className="absolute right-3 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>

              <div className="flex-1 w-full flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-900">
                  Unidade
                </label>
                <select
                  className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#0b499e] transition cursor-pointer"
                  value={formState.unidade}
                  onChange={(e) => setFormState({ ...formState, unidade: e.target.value })}
                >
                  <option value="">Selecione</option>
                  <option value="Gama">Gama</option>
                  <option value="Taguatinga">Taguatinga</option>
                  <option value="Brasília">Brasília</option>
                  <option value="Sobradinho">Sobradinho</option>
                </select>
              </div>
            </div>

            {/* Quantidade e Categoria */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-900">
                  Quantidade
                </label>
                <input
                  type="number"
                  placeholder="ex: 26"
                  className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#0b499e] transition"
                  value={formState.quantidade}
                  onChange={(e) => setFormState({ ...formState, quantidade: e.target.value })}
                />
              </div>

              <div className="flex-1 w-full flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-900">
                  Categoria
                </label>
                <select
                  className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#0b499e] transition cursor-pointer"
                  value={formState.categoria}
                  onChange={(e) => setFormState({ ...formState, categoria: e.target.value })}
                >
                  <option value="">Selecione</option>
                  <option value="Informática">Informática</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Ferramentas">Ferramentas</option>
                  <option value="Construção">Construção</option>
                  <option value="Periféricos">Periféricos</option>
                </select>
              </div>
            </div>

            {/* Medida e Botões de Ação */}
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className="flex flex-col gap-1 min-w-[90px]">
                <label className="text-sm font-bold text-gray-900">
                  Medida
                </label>
                <select
                  className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#0b499e] transition cursor-pointer"
                  value={formState.medida}
                  onChange={(e) => setFormState({ ...formState, medida: e.target.value })}
                >
                  <option value="GB">GB</option>
                  <option value="MB">MB</option>
                  <option value="TB">TB</option>
                  <option value="UN">UN</option>
                  <option value="KG">KG</option>
                  <option value="M2">M²</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 ml-auto mt-3 sm:mt-0">
                <button
                  type="submit"
                  className="bg-[#0045a5] hover:bg-[#003785] text-white px-5 py-2 rounded-md text-sm font-semibold transition shadow cursor-pointer"
                >
                  {editingItem ? 'Atualizar Item' : 'Salvar Novo Item'}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="bg-[#b0b8c2] hover:bg-[#9da6b2] text-gray-900 px-3 py-1 rounded-md text-[11px] font-bold leading-tight text-center transition cursor-pointer"
                >
                  Limpar<br />Campos
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="bg-[#e54b17] hover:bg-[#ca3d0e] text-white px-6 py-2 rounded-md text-sm font-semibold transition shadow cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: DETALHAMENTO DO ITEM */}
        <div className="border border-[#bcc2cb] rounded-xl overflow-hidden bg-[#cfd4da] shadow-sm">
          <div className="bg-[#a4abb5] py-2 text-center font-bold text-xs text-gray-900 tracking-wider uppercase">
            DETALHAMENTO DO ITEM
          </div>
          <div className="p-5 flex flex-col md:flex-row gap-7">
            {/* Descrição */}
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="font-bold text-sm text-gray-900">
                Descrição
              </label>
              <textarea
                placeholder="ex: Este kit completo de ferramentas para soldagem oferece tudo o que você precisa para realizar reparos eletrônicos..."
                className="w-full h-56 bg-white border border-[#bcc2cb] rounded-lg p-3 text-xs leading-relaxed outline-none focus:border-[#0b499e] transition resize-y"
                value={formState.descricao}
                onChange={(e) => setFormState({ ...formState, descricao: e.target.value })}
              />
            </div>

            {/* Características */}
            <div className="flex-[1.2] flex flex-col gap-1.5">
              <label className="font-bold text-sm text-gray-900">
                Características
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Marca"
                  className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0b499e] transition"
                  value={formState.marca}
                  onChange={(e) => setFormState({ ...formState, marca: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Ano de Fabricação"
                  className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0b499e] transition"
                  value={formState.ano}
                  onChange={(e) => setFormState({ ...formState, ano: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Modelo"
                  className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0b499e] transition"
                  value={formState.modelo}
                  onChange={(e) => setFormState({ ...formState, modelo: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Cor"
                  className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0b499e] transition"
                  value={formState.cor}
                  onChange={(e) => setFormState({ ...formState, cor: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Valor do Item"
                  className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0b499e] transition"
                  value={formState.valor}
                  onChange={(e) => setFormState({ ...formState, valor: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Dimensões"
                  className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0b499e] transition"
                  value={formState.campoExtra1}
                  onChange={(e) => setFormState({ ...formState, campoExtra1: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Peso / Volume"
                  className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0b499e] transition"
                  value={formState.campoExtra2}
                  onChange={(e) => setFormState({ ...formState, campoExtra2: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Garantia"
                  className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0b499e] transition"
                  value={formState.campoExtra3}
                  onChange={(e) => setFormState({ ...formState, campoExtra3: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Voltagem"
                  className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0b499e] transition"
                />
                <input
                  type="text"
                  placeholder="Observações adicionais"
                  className="bg-white border border-[#bcc2cb] rounded-md px-3 py-2 text-sm outline-none focus:border-[#0b499e] transition"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
