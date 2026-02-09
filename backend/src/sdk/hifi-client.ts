/**
 * HIFI Bridge SDK Client
 * Wraps HIFI Bridge API with agent-friendly methods
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  HifiConfig,
  User,
  CreateUserRequest,
  KYCLinkRequest,
  KYCLinkResponse,
  KYCStatusResponse,
  VirtualAccountRequest,
  VirtualAccount,
  TransferRequest,
  Transfer,
  OnrampRequest,
  Onramp,
  OfframpRequest,
  Offramp,
  BankAccountRequest,
  BankAccount,
  PaginatedResponse,
  HifiError,
} from './types';

export class HifiClient {
  private client: AxiosInstance;
  private config: HifiConfig;

  constructor(config: HifiConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<HifiError>) => {
        if (error.response?.data) {
          const hifiError = error.response.data;
          throw new Error(
            `HIFI Error [${hifiError.code}] ${hifiError.error}: ${hifiError.errorDetails}`
          );
        }
        throw error;
      }
    );
  }

  /**
   * Test API connectivity
   */
  async ping(): Promise<{ message: string }> {
    const response = await this.client.get('/ping');
    return response.data;
  }

  // ==================== User Management ====================

  /**
   * Create a new user (agent identity)
   */
  async createUser(request: CreateUserRequest): Promise<User> {
    const response = await this.client.post('/v2/users', request);
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User> {
    const response = await this.client.get(`/v2/users/${userId}`);
    return response.data;
  }

  /**
   * List all users with pagination
   */
  async listUsers(limit: number = 10, cursor?: string): Promise<PaginatedResponse<User>> {
    const params: any = { limit };
    if (cursor) params.cursor = cursor;
    
    const response = await this.client.get('/v2/users', { params });
    return response.data;
  }

  // ==================== KYC Management ====================

  /**
   * Create KYC link for user verification
   */
  async createKYCLink(request: KYCLinkRequest): Promise<KYCLinkResponse> {
    const response = await this.client.post('/v2/kyc-link', request);
    return response.data;
  }

  /**
   * Get KYC status for a user
   */
  async getKYCStatus(userId: string, rails: string): Promise<KYCStatusResponse> {
    const response = await this.client.get(`/v2/users/${userId}/kyc/status`, {
      params: { rails },
    });
    return response.data;
  }

  /**
   * Update KYC information
   */
  async updateKYC(userId: string, data: any): Promise<any> {
    const response = await this.client.post(`/v2/users/${userId}/kyc`, data);
    return response.data;
  }

  /**
   * Submit KYC for review
   */
  async submitKYC(userId: string): Promise<any> {
    const response = await this.client.post(`/v2/users/${userId}/kyc/submit`);
    return response.data;
  }

  // ==================== Virtual Accounts ====================

  /**
   * Create virtual account for fiat deposits
   */
  async createVirtualAccount(
    userId: string,
    request: VirtualAccountRequest
  ): Promise<{ message: string; accountInfo: VirtualAccount }> {
    const response = await this.client.post(
      `/v2/users/${userId}/virtual-accounts`,
      request
    );
    return response.data;
  }

  /**
   * Simulate deposit (sandbox only)
   */
  async simulateDeposit(
    userId: string,
    accountId: string,
    data: {
      paymentRail: 'wire' | 'ach' | 'rtp';
      source: {
        routingNumber: string;
        accountNumber: string;
        name: string;
        bankName: string;
      };
      amount: string;
      requestId: string;
      reference?: string;
    }
  ): Promise<{ message: string }> {
    const response = await this.client.post(
      `/v2/users/${userId}/virtual-accounts/${accountId}/simulate-deposit`,
      data
    );
    return response.data;
  }

  // ==================== Wallet Transfers ====================

  /**
   * Create crypto transfer between users
   */
  async createTransfer(request: TransferRequest): Promise<Transfer> {
    const response = await this.client.post('/v2/wallets/transfers', request);
    return response.data;
  }

  /**
   * Get transfer by ID
   */
  async getTransfer(transferId: string): Promise<Transfer> {
    const response = await this.client.get(`/v2/wallets/transfers/${transferId}`);
    return response.data;
  }

  /**
   * List all transfers with pagination
   */
  async listTransfers(limit: number = 10, cursor?: string): Promise<PaginatedResponse<Transfer>> {
    const params: any = { limit };
    if (cursor) params.cursor = cursor;
    
    const response = await this.client.get('/v2/wallets/transfers', { params });
    return response.data;
  }

  // ==================== Onramp (Fiat → Crypto) ====================

  /**
   * Create onramp (fiat to crypto conversion)
   */
  async createOnramp(request: OnrampRequest): Promise<Onramp> {
    const response = await this.client.post('/v2/onramps', request);
    return response.data;
  }

  /**
   * Get onramp by ID
   */
  async getOnramp(onrampId: string): Promise<Onramp> {
    const response = await this.client.get(`/v2/onramps/${onrampId}`);
    return response.data;
  }

  /**
   * Accept onramp quote
   */
  async acceptOnrampQuote(onrampId: string): Promise<any> {
    const response = await this.client.post(`/v2/onramps/${onrampId}/quote/accept`);
    return response.data;
  }

  // ==================== Offramp (Crypto → Fiat) ====================

  /**
   * Create offramp (crypto to fiat conversion)
   */
  async createOfframp(request: OfframpRequest): Promise<Offramp> {
    const response = await this.client.post('/v2/offramps', request);
    return response.data;
  }

  /**
   * Get offramp by ID
   */
  async getOfframp(offrampId: string): Promise<Offramp> {
    const response = await this.client.get(`/v2/offramps/${offrampId}`);
    return response.data;
  }

  /**
   * Accept offramp quote
   */
  async acceptOfframpQuote(offrampId: string): Promise<any> {
    const response = await this.client.post(`/v2/offramps/${offrampId}/quote/accept`);
    return response.data;
  }

  // ==================== Bank Accounts ====================

  /**
   * Create bank account for offramps
   */
  async createBankAccount(userId: string, request: BankAccountRequest): Promise<BankAccount> {
    const response = await this.client.post(`/v2/users/${userId}/accounts`, request);
    return response.data;
  }

  /**
   * Get bank account by ID
   */
  async getBankAccount(userId: string, accountId: string): Promise<any> {
    const response = await this.client.get(`/v2/users/${userId}/accounts/${accountId}`);
    return response.data;
  }

  /**
   * List all bank accounts for user
   */
  async listBankAccounts(
    userId: string,
    limit: number = 10,
    cursor?: string
  ): Promise<PaginatedResponse<any>> {
    const params: any = { limit };
    if (cursor) params.cursor = cursor;
    
    const response = await this.client.get(`/v2/users/${userId}/accounts`, { params });
    return response.data;
  }
}

export default HifiClient;
