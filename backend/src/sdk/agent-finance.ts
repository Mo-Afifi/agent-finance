/**
 * Agent Finance SDK
 * High-level, agent-friendly interface for financial operations
 */

import { v4 as uuidv4 } from 'uuid';
import { HifiClient } from './hifi-client';
import type {
  HifiConfig,
  User,
  Chain,
  VirtualAccount,
  Transfer,
  Onramp,
  Offramp,
  BankAccount,
} from './types';

export interface AgentIdentity {
  agentId: string;
  name: string;
  email?: string;
  type: 'individual' | 'business' | 'openclaw' | 'custom';
  metadata?: Record<string, any>;
}

export interface AgentAccount {
  agentId: string;
  hifiUserId: string;
  name: string;
  email?: string;
  wallets: Record<Chain, string>; // chain -> address
  verified: boolean;
  createdAt: Date;
}

export interface PaymentRequest {
  from: string; // agent ID
  to: string; // agent ID
  amount: number;
  currency: string;
  chain?: Chain;
  memo?: string;
}

export interface BalanceInfo {
  chain: Chain;
  address: string;
  balances: Record<string, number>; // currency -> amount
}

export class AgentFinanceSDK {
  private hifi: HifiClient;
  private agentRegistry: Map<string, string> = new Map(); // agentId -> hifiUserId

  constructor(config: HifiConfig) {
    this.hifi = new HifiClient(config);
  }

  // ==================== Agent Identity Management ====================

  /**
   * Register a new agent in the financial system
   */
  async registerAgent(identity: AgentIdentity): Promise<AgentAccount> {
    const requestId = uuidv4();
    
    // Map type: openclaw/custom -> individual, business -> business
    const hifiType = (identity.type === 'business') ? 'business' : 'individual';
    const isIndividual = hifiType === 'individual';
    
    const user = await this.hifi.createUser({
      type: hifiType,
      firstName: isIndividual ? identity.name.split(' ')[0] : undefined,
      lastName: isIndividual ? identity.name.split(' ').slice(1).join(' ') || 'Agent' : undefined,
      dateOfBirth: isIndividual ? '1990-01-01' : undefined, // Default DOB for agents
      businessName: !isIndividual ? identity.name : undefined,
      email: identity.email || `agent-${identity.agentId}@openclawpay.ai`,
      signedAgreementId: 'agent-tos-v1', // Would be actual ToS agreement ID
      requestId,
      chains: ['POLYGON', 'ETHEREUM'],
      address: {
        addressLine1: '123 Agent Lane',
        city: 'San Francisco',
        stateProvinceRegion: 'CA',
        postalCode: '94102',
        country: 'USA',
      },
    });

    // Store mapping
    this.agentRegistry.set(identity.agentId, user.id);

    // Extract wallet addresses
    const walletType = identity.type === 'individual' ? 'INDIVIDUAL' : 'BUSINESS';
    const wallets: Record<Chain, string> = {} as any;
    
    if (user.wallets[walletType]) {
      for (const [chain, wallet] of Object.entries(user.wallets[walletType])) {
        wallets[chain as Chain] = wallet.address;
      }
    }

    return {
      agentId: identity.agentId,
      hifiUserId: user.id,
      name: user.name,
      email: user.email,
      wallets,
      verified: false,
      createdAt: new Date(user.createdAt),
    };
  }

  /**
   * Get agent account information
   */
  async getAgent(agentId: string): Promise<AgentAccount> {
    const hifiUserId = this.agentRegistry.get(agentId);
    if (!hifiUserId) {
      throw new Error(`Agent ${agentId} not found in registry`);
    }

    const user = await this.hifi.getUser(hifiUserId);
    const walletType = user.type === 'individual' ? 'INDIVIDUAL' : 'BUSINESS';
    const wallets: Record<Chain, string> = {} as any;
    
    if (user.wallets[walletType]) {
      for (const [chain, wallet] of Object.entries(user.wallets[walletType])) {
        wallets[chain as Chain] = wallet.address;
      }
    }

    return {
      agentId,
      hifiUserId: user.id,
      name: user.name,
      email: user.email,
      wallets,
      verified: false, // Would check KYC status
      createdAt: new Date(user.createdAt),
    };
  }

  /**
   * Initiate KYC verification for an agent
   */
  async verifyAgent(agentId: string, redirectUrl?: string): Promise<string> {
    const hifiUserId = this.agentRegistry.get(agentId);
    if (!hifiUserId) {
      throw new Error(`Agent ${agentId} not found in registry`);
    }

    const result = await this.hifi.createKYCLink({
      userId: hifiUserId,
      rails: ['USD'],
      redirectUrl,
    });

    return result.kycLinkUrl;
  }

  /**
   * Check agent verification status
   */
  async getVerificationStatus(agentId: string): Promise<{
    verified: boolean;
    status: string;
    message: string;
  }> {
    const hifiUserId = this.agentRegistry.get(agentId);
    if (!hifiUserId) {
      throw new Error(`Agent ${agentId} not found in registry`);
    }

    const status = await this.hifi.getKYCStatus(hifiUserId, 'USD');
    
    return {
      verified: status.status === 'ACTIVE',
      status: status.status,
      message: status.message,
    };
  }

  // ==================== Account Management ====================

  /**
   * Create virtual account for fiat deposits (enables onramp)
   */
  async createDepositAccount(
    agentId: string,
    options: {
      fiatCurrency?: string;
      cryptoCurrency?: string;
      chain?: Chain;
    } = {}
  ): Promise<VirtualAccount> {
    const hifiUserId = this.agentRegistry.get(agentId);
    if (!hifiUserId) {
      throw new Error(`Agent ${agentId} not found in registry`);
    }

    const result = await this.hifi.createVirtualAccount(hifiUserId, {
      sourceCurrency: options.fiatCurrency || 'usd',
      destinationCurrency: options.cryptoCurrency || 'usdc',
      destinationChain: options.chain || 'POLYGON',
    });

    return result.accountInfo;
  }

  /**
   * Register bank account for withdrawals (enables offramp)
   */
  async registerBankAccount(
    agentId: string,
    accountDetails: {
      accountType: 'checking' | 'savings';
      accountNumber: string;
      routingNumber: string;
      bankName: string;
      accountHolderName: string;
    }
  ): Promise<BankAccount> {
    const hifiUserId = this.agentRegistry.get(agentId);
    if (!hifiUserId) {
      throw new Error(`Agent ${agentId} not found in registry`);
    }

    return await this.hifi.createBankAccount(hifiUserId, {
      rail: 'offramp',
      type: 'us',
      accountHolder: {
        type: 'individual',
        name: accountDetails.accountHolderName,
        address: {
          addressLine1: '123 Main St',
          city: 'San Francisco',
          stateProvinceRegion: 'CA',
          postalCode: '94102',
          country: 'USA',
        },
      },
      us: {
        transferType: 'wire',
        accountType: accountDetails.accountType,
        accountNumber: accountDetails.accountNumber,
        routingNumber: accountDetails.routingNumber,
        bankName: accountDetails.bankName,
        currency: 'usd',
      },
    });
  }

  // ==================== Agent-to-Agent Transfers ====================

  /**
   * Send payment from one agent to another
   */
  async sendPayment(request: PaymentRequest): Promise<Transfer> {
    const fromUserId = this.agentRegistry.get(request.from);
    const toUserId = this.agentRegistry.get(request.to);

    if (!fromUserId) {
      throw new Error(`Sender agent ${request.from} not found`);
    }
    if (!toUserId) {
      throw new Error(`Recipient agent ${request.to} not found`);
    }

    const transfer = await this.hifi.createTransfer({
      source: { userId: fromUserId },
      destination: { userId: toUserId },
      requestId: uuidv4(),
      amount: request.amount,
      currency: request.currency.toLowerCase(),
      chain: request.chain || 'POLYGON',
    });

    return transfer;
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transferId: string): Promise<Transfer> {
    return await this.hifi.getTransfer(transferId);
  }

  /**
   * List all payments for an agent
   */
  async listPayments(agentId: string, limit: number = 20): Promise<Transfer[]> {
    // Note: HIFI API doesn't filter by user, so we fetch all and filter
    const result = await this.hifi.listTransfers(limit);
    const hifiUserId = this.agentRegistry.get(agentId);
    
    if (!hifiUserId || !result.records) {
      return [];
    }

    return result.records.filter((transfer) => 
      transfer.transferDetails.source.userId === hifiUserId ||
      transfer.transferDetails.destination.userId === hifiUserId
    );
  }

  // ==================== Fiat/Crypto Conversion ====================

  /**
   * Deposit fiat and receive crypto (onramp)
   */
  async depositFiat(
    agentId: string,
    amount: number,
    options: {
      fiatCurrency?: string;
      cryptoCurrency?: string;
      chain?: Chain;
    } = {}
  ): Promise<Onramp> {
    const hifiUserId = this.agentRegistry.get(agentId);
    if (!hifiUserId) {
      throw new Error(`Agent ${agentId} not found in registry`);
    }

    return await this.hifi.createOnramp({
      requestId: uuidv4(),
      source: {
        userId: hifiUserId,
        currency: options.fiatCurrency || 'usd',
        amount,
      },
      destination: {
        userId: hifiUserId,
        currency: options.cryptoCurrency || 'usdc',
        chain: options.chain || 'POLYGON',
      },
    });
  }

  /**
   * Withdraw crypto to fiat (offramp)
   */
  async withdrawToFiat(
    agentId: string,
    amount: number,
    bankAccountId: string,
    options: {
      cryptoCurrency?: string;
      fiatCurrency?: string;
      chain?: Chain;
    } = {}
  ): Promise<Offramp> {
    const hifiUserId = this.agentRegistry.get(agentId);
    if (!hifiUserId) {
      throw new Error(`Agent ${agentId} not found in registry`);
    }

    return await this.hifi.createOfframp({
      requestId: uuidv4(),
      source: {
        userId: hifiUserId,
        currency: options.cryptoCurrency || 'usdc',
        chain: options.chain || 'POLYGON',
        amount,
      },
      destination: {
        userId: hifiUserId,
        currency: options.fiatCurrency || 'usd',
        accountId: bankAccountId,
      },
    });
  }

  // ==================== Balance & Wallet Info ====================

  /**
   * Get agent's wallet addresses
   */
  async getWallets(agentId: string): Promise<Record<Chain, string>> {
    const agent = await this.getAgent(agentId);
    return agent.wallets;
  }

  /**
   * Get wallet address for specific chain
   */
  async getWalletAddress(agentId: string, chain: Chain): Promise<string> {
    const wallets = await this.getWallets(agentId);
    const address = wallets[chain];
    
    if (!address) {
      throw new Error(`No wallet found for agent ${agentId} on chain ${chain}`);
    }
    
    return address;
  }

  // ==================== Utility Methods ====================

  /**
   * Link external agent ID to HIFI user ID
   */
  linkAgent(agentId: string, hifiUserId: string): void {
    this.agentRegistry.set(agentId, hifiUserId);
  }

  /**
   * Test connectivity
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.hifi.ping();
      return result.message === 'pong';
    } catch {
      return false;
    }
  }
}

export default AgentFinanceSDK;
