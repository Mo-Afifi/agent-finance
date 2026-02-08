/**
 * API Route Definitions
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AgentFinanceSDK } from '../sdk/agent-finance';

// ==================== Request Schemas ====================

const RegisterAgentSchema = z.object({
  agentId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  type: z.enum(['individual', 'business']).default('individual'),
});

const SendPaymentSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(1),
  chain: z.enum(['ETHEREUM', 'POLYGON', 'BASE']).optional(),
  memo: z.string().optional(),
});

const CreateDepositAccountSchema = z.object({
  agentId: z.string().min(1),
  fiatCurrency: z.string().optional(),
  cryptoCurrency: z.string().optional(),
  chain: z.enum(['ETHEREUM', 'POLYGON', 'BASE']).optional(),
});

const RegisterBankAccountSchema = z.object({
  agentId: z.string().min(1),
  accountType: z.enum(['checking', 'savings']),
  accountNumber: z.string().min(1),
  routingNumber: z.string().min(1),
  bankName: z.string().min(1),
  accountHolderName: z.string().min(1),
});

const DepositFiatSchema = z.object({
  agentId: z.string().min(1),
  amount: z.number().positive(),
  fiatCurrency: z.string().optional(),
  cryptoCurrency: z.string().optional(),
  chain: z.enum(['ETHEREUM', 'POLYGON', 'BASE']).optional(),
});

const WithdrawToFiatSchema = z.object({
  agentId: z.string().min(1),
  amount: z.number().positive(),
  bankAccountId: z.string().min(1),
  cryptoCurrency: z.string().optional(),
  fiatCurrency: z.string().optional(),
  chain: z.enum(['ETHEREUM', 'POLYGON', 'BASE']).optional(),
});

// ==================== Route Handlers ====================

export async function registerRoutes(app: FastifyInstance, sdk: AgentFinanceSDK) {
  
  // Health check
  app.get('/health', async (request, reply) => {
    const isHealthy = await sdk.ping();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'agent-finance-api',
    };
  });

  // ==================== Quick Endpoints for Dashboard ====================

  /**
   * GET /activity
   * Get recent activity (stub for now)
   */
  app.get('/activity', async (request, reply) => {
    return reply.send([]);
  });

  /**
   * GET /agents
   * List all agents (stub for now)
   */
  app.get('/agents', async (request, reply) => {
    return reply.send([]);
  });

  /**
   * POST /agents
   * Alias for /api/agents/register (dashboard compatibility)
   */
  app.post('/agents', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = RegisterAgentSchema.parse(request.body);
      const agent = await sdk.registerAgent(body);
      
      return reply.code(201).send({
        success: true,
        data: agent,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /transactions
   * List transactions (stub for now)
   */
  app.get('/transactions', async (request, reply) => {
    return reply.send([]);
  });

  // ==================== Agent Identity ====================

  /**
   * POST /api/agents/register
   * Register a new agent in the financial system
   */
  app.post('/api/agents/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = RegisterAgentSchema.parse(request.body);
      const agent = await sdk.registerAgent(body);
      
      return reply.code(201).send({
        success: true,
        data: agent,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/agents/:agentId
   * Get agent account information
   */
  app.get('/api/agents/:agentId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { agentId } = request.params as { agentId: string };
      const agent = await sdk.getAgent(agentId);
      
      return reply.send({
        success: true,
        data: agent,
      });
    } catch (error: any) {
      return reply.code(404).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/agents/:agentId/verify
   * Initiate KYC verification
   */
  app.post('/api/agents/:agentId/verify', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { agentId } = request.params as { agentId: string };
      const { redirectUrl } = request.body as { redirectUrl?: string };
      
      const kycUrl = await sdk.verifyAgent(agentId, redirectUrl);
      
      return reply.send({
        success: true,
        data: { kycUrl },
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/agents/:agentId/verification-status
   * Check verification status
   */
  app.get('/api/agents/:agentId/verification-status', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { agentId } = request.params as { agentId: string };
      const status = await sdk.getVerificationStatus(agentId);
      
      return reply.send({
        success: true,
        data: status,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  // ==================== Wallets & Accounts ====================

  /**
   * GET /api/agents/:agentId/wallets
   * Get agent's wallet addresses
   */
  app.get('/api/agents/:agentId/wallets', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { agentId } = request.params as { agentId: string };
      const wallets = await sdk.getWallets(agentId);
      
      return reply.send({
        success: true,
        data: wallets,
      });
    } catch (error: any) {
      return reply.code(404).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/accounts/deposit
   * Create virtual account for fiat deposits
   */
  app.post('/api/accounts/deposit', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = CreateDepositAccountSchema.parse(request.body);
      const { agentId, ...options } = body;
      
      const account = await sdk.createDepositAccount(agentId, options);
      
      return reply.code(201).send({
        success: true,
        data: account,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/accounts/bank
   * Register bank account for withdrawals
   */
  app.post('/api/accounts/bank', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = RegisterBankAccountSchema.parse(request.body);
      const { agentId, ...accountDetails } = body;
      
      const account = await sdk.registerBankAccount(agentId, accountDetails);
      
      return reply.code(201).send({
        success: true,
        data: account,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  // ==================== Payments ====================

  /**
   * POST /api/payments/send
   * Send payment from one agent to another
   */
  app.post('/api/payments/send', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = SendPaymentSchema.parse(request.body);
      const payment = await sdk.sendPayment(body);
      
      return reply.code(201).send({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/payments/:paymentId
   * Get payment status
   */
  app.get('/api/payments/:paymentId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { paymentId } = request.params as { paymentId: string };
      const payment = await sdk.getPaymentStatus(paymentId);
      
      return reply.send({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      return reply.code(404).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/agents/:agentId/payments
   * List payments for an agent
   */
  app.get('/api/agents/:agentId/payments', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { agentId } = request.params as { agentId: string };
      const { limit } = request.query as { limit?: string };
      
      const payments = await sdk.listPayments(agentId, limit ? parseInt(limit) : 20);
      
      return reply.send({
        success: true,
        data: payments,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  // ==================== Fiat/Crypto Conversion ====================

  /**
   * POST /api/deposit/fiat
   * Deposit fiat and receive crypto (onramp)
   */
  app.post('/api/deposit/fiat', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = DepositFiatSchema.parse(request.body);
      const { agentId, amount, ...options } = body;
      
      const onramp = await sdk.depositFiat(agentId, amount, options);
      
      return reply.code(201).send({
        success: true,
        data: onramp,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/withdraw/fiat
   * Withdraw crypto to fiat (offramp)
   */
  app.post('/api/withdraw/fiat', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = WithdrawToFiatSchema.parse(request.body);
      const { agentId, amount, bankAccountId, ...options } = body;
      
      const offramp = await sdk.withdrawToFiat(agentId, amount, bankAccountId, options);
      
      return reply.code(201).send({
        success: true,
        data: offramp,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }
  });
}
