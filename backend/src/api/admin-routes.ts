/**
 * Admin API Route Definitions
 * INTERNAL USE ONLY - Platform management endpoints
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AgentFinanceSDK } from '../sdk/agent-finance';
import { userStorage } from '../auth/storage-factory';

// Mock data storage (replace with actual database in production)
let mockUsers: any[] = [];
let mockAgents: any[] = [];
let mockTransactions: any[] = [];
let mockActivityLogs: any[] = [];

export async function registerAdminRoutes(app: FastifyInstance, sdk: AgentFinanceSDK) {
  
  // ==================== Platform Analytics ====================

  /**
   * GET /api/admin/stats
   * Get platform-wide statistics
   */
  app.get('/api/admin/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get real user and agent counts from storage
      const allUsers = await userStorage.getAllUsers();
      const allAgents = await userStorage.getAllAgents();
      
      const stats = {
        totalUsers: allUsers.length,
        totalAgents: allAgents.length,
        totalVolume: {
          allTime: 0, // TODO: Calculate from transaction history
          last30d: 0,
          last7d: 0,
          last24h: 0,
        },
        tvl: 0, // TODO: Calculate from agent balances
        revenue: {
          total: 0, // TODO: Calculate from transaction fees
          last30d: 0,
        },
        activeUsers: {
          dau: 0, // TODO: Track daily active users
          mau: allUsers.length, // For now, assume all users are monthly active
        },
      };

      return reply.send({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // ==================== User Management ====================

  /**
   * GET /api/admin/users
   * List all users with optional filtering
   */
  app.get('/api/admin/users', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { search, status, limit } = request.query as any;
      
      // Get real users from storage
      const allUsers = await userStorage.getAllUsers();

      // Transform to admin format
      let users = await Promise.all(allUsers.map(async (user: any) => {
        const userAgents = await userStorage.getAgentsByUserId(user.userId);
        return {
          id: user.userId,
          email: user.email,
          name: user.email.split('@')[0], // Extract name from email
          createdAt: user.createdAt,
          status: 'active',
          kycStatus: 'pending',
          agentCount: userAgents.length,
          totalBalance: 0, // TODO: Calculate from agent balances
          lastActive: user.updatedAt || user.createdAt,
        };
      }));

      if (status && status !== 'all') {
        users = users.filter(u => u.status === status);
      }

      if (search) {
        const term = search.toLowerCase();
        users = users.filter(u =>
          u.email.toLowerCase().includes(term) ||
          u.name.toLowerCase().includes(term) ||
          u.id.toLowerCase().includes(term)
        );
      }

      if (limit) {
        users = users.slice(0, parseInt(limit));
      }

      return reply.send({
        success: true,
        data: users,
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/admin/users/:userId
   * Get detailed user information
   */
  app.get('/api/admin/users/:userId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params as { userId: string };
      
      // Mock user lookup
      const user = mockUsers.find(u => u.id === userId);
      
      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found',
        });
      }

      return reply.send({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/admin/users/:userId/suspend
   * Suspend a user account
   */
  app.post('/api/admin/users/:userId/suspend', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params as { userId: string };
      
      // Update user status
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex >= 0) {
        mockUsers[userIndex].status = 'suspended';
      }

      // Log activity
      mockActivityLogs.push({
        id: `activity_${Date.now()}`,
        type: 'suspension',
        userId,
        description: `User account suspended`,
        timestamp: new Date().toISOString(),
      });

      return reply.send({
        success: true,
        message: 'User suspended successfully',
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/admin/users/:userId/activate
   * Activate a suspended user account
   */
  app.post('/api/admin/users/:userId/activate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params as { userId: string };
      
      // Update user status
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex >= 0) {
        mockUsers[userIndex].status = 'active';
      }

      // Log activity
      mockActivityLogs.push({
        id: `activity_${Date.now()}`,
        type: 'user_created',
        userId,
        description: `User account activated`,
        timestamp: new Date().toISOString(),
      });

      return reply.send({
        success: true,
        message: 'User activated successfully',
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // ==================== Agent Management ====================

  /**
   * GET /api/admin/agents
   * List all agents across all users
   */
  app.get('/api/admin/agents', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { search, verified, limit } = request.query as any;
      
      // Get real agents from storage
      const allAgents = await userStorage.getAllAgents();
      
      // Transform to admin format
      let agents = await Promise.all(allAgents.map(async (agent: any) => {
        const user = await userStorage.getUserById(agent.userId);
        return {
          id: agent.agentId,
          userId: agent.userId,
          name: agent.name,
          email: agent.ownerEmail,
          type: 'individual', // TODO: Add agent type to storage
          verified: true, // TODO: Add verification status to storage
          createdAt: agent.createdAt,
          accounts: [], // TODO: Fetch from HIFI or blockchain
        };
      }));

      if (verified !== undefined) {
        agents = agents.filter(a => a.verified === (verified === 'true'));
      }

      if (search) {
        const term = search.toLowerCase();
        agents = agents.filter(a =>
          a.name.toLowerCase().includes(term) ||
          a.email.toLowerCase().includes(term) ||
          a.id.toLowerCase().includes(term) ||
          a.userId.toLowerCase().includes(term)
        );
      }

      if (limit) {
        agents = agents.slice(0, parseInt(limit));
      }

      return reply.send({
        success: true,
        data: agents,
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // ==================== Transaction Monitoring ====================

  /**
   * GET /api/admin/transactions
   * List all platform transactions
   */
  app.get('/api/admin/transactions', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { status, userId, agentId, limit } = request.query as any;
      
      // Mock transaction data
      let transactions = mockTransactions.length > 0 ? mockTransactions : [
        {
          id: 'tx_1',
          from: 'agent_1',
          to: 'agent_2',
          amount: 5000,
          currency: 'USDC',
          status: 'completed',
          timestamp: '2026-02-08T14:30:00Z',
          memo: 'Payment for services',
          flagged: false,
        },
        {
          id: 'tx_2',
          from: 'agent_2',
          to: 'agent_3',
          amount: 2500,
          currency: 'USDC',
          status: 'pending',
          timestamp: '2026-02-08T15:00:00Z',
          memo: 'Transfer',
          flagged: false,
        },
        {
          id: 'tx_3',
          from: 'agent_1',
          to: 'agent_3',
          amount: 15000,
          currency: 'USDC',
          status: 'completed',
          timestamp: '2026-02-08T13:20:00Z',
          memo: 'Large payment',
          flagged: true,
        },
      ];

      if (status && status !== 'all') {
        transactions = transactions.filter(t => t.status === status);
      }

      if (limit) {
        transactions = transactions.slice(0, parseInt(limit));
      }

      return reply.send({
        success: true,
        data: transactions,
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/admin/transactions/:transactionId/flag
   * Flag a transaction as suspicious
   */
  app.post('/api/admin/transactions/:transactionId/flag', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { transactionId } = request.params as { transactionId: string };
      
      const txIndex = mockTransactions.findIndex(t => t.id === transactionId);
      if (txIndex >= 0) {
        mockTransactions[txIndex].flagged = true;
      }

      return reply.send({
        success: true,
        message: 'Transaction flagged successfully',
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/admin/transactions/export
   * Export transactions to CSV
   */
  app.get('/api/admin/transactions/export', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Generate CSV
      const csv = [
        'ID,From,To,Amount,Currency,Status,Timestamp,Memo,Flagged',
        ...mockTransactions.map(t =>
          `${t.id},${t.from},${t.to},${t.amount},${t.currency},${t.status},${t.timestamp},"${t.memo || ''}",${t.flagged}`
        ),
      ].join('\n');

      return reply
        .header('Content-Type', 'text/csv')
        .header('Content-Disposition', 'attachment; filename=transactions.csv')
        .send(csv);
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // ==================== System Health ====================

  /**
   * GET /api/admin/health
   * Get system health metrics
   */
  app.get('/api/admin/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const health = {
        apiUptime: 99.8,
        hifiStatus: 'online' as const,
        errorRate: 0.2,
        avgResponseTime: 48,
        activeConnections: 127,
        lastChecked: new Date().toISOString(),
      };

      return reply.send({
        success: true,
        data: health,
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // ==================== Activity Logs ====================

  /**
   * GET /api/admin/activity
   * Get recent activity logs
   */
  app.get('/api/admin/activity', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { limit } = request.query as any;
      
      let logs = mockActivityLogs.length > 0 ? mockActivityLogs : [
        {
          id: 'activity_1',
          type: 'transaction',
          description: 'Large payment completed - tx_3',
          timestamp: '2026-02-08T15:30:00Z',
        },
        {
          id: 'activity_2',
          type: 'user_created',
          userId: 'user_2',
          description: 'New user registered: alice@example.com',
          timestamp: '2026-02-08T14:00:00Z',
        },
        {
          id: 'activity_3',
          type: 'kyc_verified',
          userId: 'user_1',
          description: 'KYC verification completed for mo@openclaw.com',
          timestamp: '2026-02-08T13:15:00Z',
        },
      ];

      if (limit) {
        logs = logs.slice(0, parseInt(limit));
      }

      return reply.send({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // ==================== Configuration ====================

  /**
   * GET /api/admin/config
   * Get platform configuration
   */
  app.get('/api/admin/config', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const config = {
        apiKeys: {
          hifiApiKey: '••••••••',
          hifiApiSecret: '••••••••',
        },
        rateLimits: {
          perMinute: 60,
          perHour: 1000,
          perDay: 10000,
        },
        features: {
          newUserSignup: true,
          kycRequired: true,
          maintenanceMode: false,
          webhooksEnabled: true,
        },
        system: {
          maxTransactionAmount: 100000,
          minTransactionAmount: 1,
          transactionFeePercent: 0.5,
          autoFlagThreshold: 10000,
        },
      };

      return reply.send({
        success: true,
        data: config,
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * PUT /api/admin/config
   * Update platform configuration
   */
  app.put('/api/admin/config', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // In production, validate and save to database
      const config = request.body;

      // Log activity
      mockActivityLogs.push({
        id: `activity_${Date.now()}`,
        type: 'config_change',
        description: 'Platform configuration updated',
        timestamp: new Date().toISOString(),
        metadata: config,
      });

      return reply.send({
        success: true,
        message: 'Configuration updated successfully',
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });
}
