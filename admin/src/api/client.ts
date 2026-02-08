import axios from 'axios';
import type { PlatformStats, User, Agent, Transaction, SystemHealth, ActivityLog } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const adminAPI = {
  // Platform Analytics
  async getPlatformStats(): Promise<PlatformStats> {
    const { data } = await api.get('/api/admin/stats');
    return data.data;
  },

  // User Management
  async getUsers(params?: { search?: string; status?: string; limit?: number }): Promise<User[]> {
    const { data } = await api.get('/api/admin/users', { params });
    return data.data;
  },

  async getUser(userId: string): Promise<User> {
    const { data } = await api.get(`/api/admin/users/${userId}`);
    return data.data;
  },

  async suspendUser(userId: string): Promise<void> {
    await api.post(`/api/admin/users/${userId}/suspend`);
  },

  async activateUser(userId: string): Promise<void> {
    await api.post(`/api/admin/users/${userId}/activate`);
  },

  // Agent Management
  async getAllAgents(params?: { search?: string; verified?: boolean; limit?: number }): Promise<Agent[]> {
    const { data } = await api.get('/api/admin/agents', { params });
    return data.data;
  },

  async getAgent(agentId: string): Promise<Agent> {
    const { data } = await api.get(`/api/agents/${agentId}`);
    return data.data;
  },

  // Transaction Monitoring
  async getAllTransactions(params?: {
    status?: string;
    userId?: string;
    agentId?: string;
    minAmount?: number;
    maxAmount?: number;
    limit?: number;
  }): Promise<Transaction[]> {
    const { data } = await api.get('/api/admin/transactions', { params });
    return data.data;
  },

  async flagTransaction(transactionId: string): Promise<void> {
    await api.post(`/api/admin/transactions/${transactionId}/flag`);
  },

  async exportTransactions(params?: any): Promise<Blob> {
    const { data } = await api.get('/api/admin/transactions/export', {
      params,
      responseType: 'blob',
    });
    return data;
  },

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    const { data } = await api.get('/api/admin/health');
    return data.data;
  },

  // Activity Logs
  async getActivityLogs(limit?: number): Promise<ActivityLog[]> {
    const { data } = await api.get('/api/admin/activity', { params: { limit } });
    return data.data;
  },

  // Configuration
  async getConfig(): Promise<any> {
    const { data } = await api.get('/api/admin/config');
    return data.data;
  },

  async updateConfig(config: any): Promise<void> {
    await api.put('/api/admin/config', config);
  },
};

export default adminAPI;
