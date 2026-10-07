import React, { createContext, useContext, useState } from 'react';
import { initialItems } from '../data/items';

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [items, setItems] = useState(initialItems);
  const [editingItem, setEditingItem] = useState(null);

  const addItem = (newItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  const updateItem = (id, updatedFields) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleStatusAceitar = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, statusAceitar: !item.statusAceitar } : item
      )
    );
  };

  return (
    <StockContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        deleteItem,
        toggleStatusAceitar,
        editingItem,
        setEditingItem,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => useContext(StockContext);
