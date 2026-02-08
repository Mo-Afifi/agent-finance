import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('apiToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Agent types
export interface Agent {
  id: string;
  name: string;
  type: 'openclaw' | 'custom';
  hifiUserId: string;
  wallets: Wallet[];
  accounts: VirtualAccount[];
  verified: boolean;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface Wallet {
  id: string;
  agentId: string;
  address: string;
  chain: 'ethereum' | 'polygon' | 'base';
  balance: Balance[];
  hifiWalletId: string;
}

export interface VirtualAccount {
  id: string;
  agentId: string;
  currency: string;
  balance: number;
  accountNumber?: string;
  routingNumber?: string;
}

export interface Balance {
  currency: string;
  amount: number;
}

export interface Transaction {
  id: string;
  fromAgent: string;
  toAgent: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  memo?: string;
  hifiTransferId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Activity {
  id: string;
  agentId: string;
  type: 'payment_sent' | 'payment_received' | 'account_created' | 'wallet_created' | 'verification_completed';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// API methods
export const agentFinanceAPI = {
  // Agents
  getAgents: async (): Promise<Agent[]> => {
    const response = await apiClient.get('/agents');
    return response.data;
  },

  getAgent: async (id: string): Promise<Agent> => {
    const response = await apiClient.get(`/agents/${id}`);
    return response.data;
  },

  createAgent: async (data: {
    agentId: string;
    name: string;
    type: 'openclaw' | 'custom';
    email?: string;
    metadata?: Record<string, any>;
  }): Promise<Agent> => {
    const response = await apiClient.post('/agents', data);
    return response.data;
  },

  // Transactions
  getTransactions: async (filters?: {
    agentId?: string;
    status?: string;
    limit?: number;
  }): Promise<Transaction[]> => {
    const response = await apiClient.get('/transactions', { params: filters });
    return response.data;
  },

  createTransaction: async (data: {
    fromAgent: string;
    toAgent: string;
    amount: number;
    currency: string;
    memo?: string;
  }): Promise<Transaction> => {
    const response = await apiClient.post('/transactions', data);
    return response.data;
  },

  // Activity
  getActivity: async (agentId?: string): Promise<Activity[]> => {
    const params = agentId ? { agentId } : {};
    const response = await apiClient.get('/activity', { params });
    return response.data;
  },

  // Balances
  getBalances: async (agentId: string): Promise<Balance[]> => {
    const response = await apiClient.get(`/agents/${agentId}/balances`);
    return response.data;
  },

  // Wallets
  createWallet: async (agentId: string, chain: 'ethereum' | 'polygon' | 'base'): Promise<Wallet> => {
    const response = await apiClient.post(`/agents/${agentId}/wallets`, { chain });
    return response.data;
  },

  // Virtual Accounts
  createVirtualAccount: async (agentId: string, currency: string): Promise<VirtualAccount> => {
    const response = await apiClient.post(`/agents/${agentId}/accounts`, { currency });
    return response.data;
  },
};
