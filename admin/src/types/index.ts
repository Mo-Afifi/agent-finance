export interface PlatformStats {
  totalUsers: number;
  totalAgents: number;
  totalVolume: {
    allTime: number;
    last30d: number;
    last7d: number;
    last24h: number;
  };
  tvl: number;
  revenue: {
    total: number;
    last30d: number;
  };
  activeUsers: {
    dau: number;
    mau: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  status: 'active' | 'suspended';
  kycStatus: 'pending' | 'verified' | 'rejected';
  agentCount: number;
  totalBalance: number;
  lastActive?: string;
}

export interface Agent {
  id: string;
  userId: string;
  name: string;
  email: string;
  type: 'individual' | 'business';
  verified: boolean;
  createdAt: string;
  accounts: Account[];
  metadata?: Record<string, any>;
}

export interface Account {
  id: string;
  currency: string;
  balance: number;
  chain?: string;
  address?: string;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  memo?: string;
  flagged?: boolean;
  userId?: string;
  agentId?: string;
}

export interface SystemHealth {
  apiUptime: number;
  hifiStatus: 'online' | 'offline' | 'degraded';
  errorRate: number;
  avgResponseTime: number;
  activeConnections: number;
  lastChecked: string;
}

export interface ActivityLog {
  id: string;
  type: 'user_created' | 'agent_created' | 'transaction' | 'kyc_verified' | 'suspension' | 'config_change';
  userId?: string;
  agentId?: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
