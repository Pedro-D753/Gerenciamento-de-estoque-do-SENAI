import { initialItems } from '../data/items.js';

// Base API URL configuration (Can be set via .env file: VITE_API_URL)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Service module for API requests with robust fallback to mock data
 */
export const api = {
  /**
   * Fetch all inventory items from backend API
   */
  async getItems() {
    try {
      const response = await fetch(`${API_BASE_URL}/items`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('[API Service] Backend API unreachable, using local dataset fallback:', error.message);
      return initialItems;
    }
  },

  /**
   * Fetch single item details by ID
   */
  async getItemById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn(`[API Service] Failed to fetch item ${id}, using local fallback:`, error.message);
      return initialItems.find(item => item.id.toString() === id.toString()) || initialItems[0];
    }
  },

  /**
   * Fetch pending requests for management
   */
  async getGerenciarSolicitacoes() {
    try {
      const response = await fetch(`${API_BASE_URL}/solicitacoes/pendentes`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('[API Service] Using fallback pending requests:', error.message);
      return [
        {
          id: 1,
          codigo: '0010151110',
          item: 'Pendrive',
          dataSolicitacao: '30/04/2026',
          quantidade: 23,
          solicitante: 'M.Pereira.O',
          unidade: 'Taguatinga',
          motivo: '',
          itensRequisitados: 13,
          itensDisponiveis: 12,
          image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=150&auto=format&fit=crop&q=80'
        },
        {
          id: 37,
          codigo: '564408405',
          item: 'Teclado',
          dataSolicitacao: '18/04/2025',
          quantidade: 92,
          solicitante: 'L.Otavio.S',
          unidade: 'Gama',
          motivo: 'Substituição de equipamento com defeito',
          itensRequisitados: 5,
          itensDisponiveis: 92,
          image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&auto=format&fit=crop&q=80'
        }
      ];
    }
  },

  /**
   * Fetch request history
   */
  async getHistoricoSolicitacoes() {
    try {
      const response = await fetch(`${API_BASE_URL}/solicitacoes/historico`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('[API Service] Using fallback request history:', error.message);
      return [
        {
          id: 1,
          codigo: '0010151110',
          item: 'Pendrive',
          dataReserva: '23/04/2026',
          quantidade: 12,
          unidade: 'Taguatinga',
          solicitante: 'Andre Felipe Maciel',
          dataRecebimento: '28/04/2026',
          dataSolicitacao: '20/04/2026',
          dataRetirada: '25/04/2026',
          ped: 'PED-9021',
          saCode: 'S.A - Ofx1586as5',
          image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=150&auto=format&fit=crop&q=80'
        }
      ];
    }
  },

  /**
   * Submit new request (POST)
   */
  async createSolicitacao(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/solicitacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('[API Service] Simulated API POST response:', error.message);
      return { success: true, message: 'Solicitação registrada com sucesso', data };
    }
  },

  /**
   * Approve pending request
   */
  async aprovarSolicitacao(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/solicitacoes/${id}/aprovar`, { method: 'PUT' });
      return await response.json();
    } catch (error) {
      console.warn(`[API Service] Simulated API approval for ID ${id}`);
      return { success: true, id };
    }
  },

  /**
   * Delete / Reject pending request
   */
  async recusarSolicitacao(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/solicitacoes/${id}`, { method: 'DELETE' });
      return await response.json();
    } catch (error) {
      console.warn(`[API Service] Simulated API rejection for ID ${id}`);
      return { success: true, id };
    }
  }
};
