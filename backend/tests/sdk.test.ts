/**
 * Agent Finance SDK Tests
 */

import { AgentFinanceSDK } from '../src/sdk/agent-finance';
import { HifiClient } from '../src/sdk/hifi-client';

// Mock HifiClient
jest.mock('../src/sdk/hifi-client');

describe('AgentFinanceSDK', () => {
  let sdk: AgentFinanceSDK;
  let mockHifi: jest.Mocked<HifiClient>;

  beforeEach(() => {
    sdk = new AgentFinanceSDK({
      apiKey: 'test-key',
      baseUrl: 'https://sandbox.hifibridge.com',
      environment: 'sandbox',
    });
    
    // Get the mocked instance
    mockHifi = (sdk as any).hifi;
  });

  describe('registerAgent', () => {
    it('should register a new agent successfully', async () => {
      const mockUser = {
        id: 'user-123',
        createdAt: new Date().toISOString(),
        type: 'individual' as const,
        email: '[email protected]',
        name: 'Test Agent',
        wallets: {
          INDIVIDUAL: {
            POLYGON: {
              id: 'wallet-123',
              address: '0xabcdef123456',
            },
          },
        },
      };

      mockHifi.createUser = jest.fn().mockResolvedValue(mockUser);

      const result = await sdk.registerAgent({
        agentId: 'agent-123',
        name: 'Test Agent',
        email: '[email protected]',
        type: 'individual',
      });

      expect(result.agentId).toBe('agent-123');
      expect(result.hifiUserId).toBe('user-123');
      expect(result.email).toBe('[email protected]');
      expect(mockHifi.createUser).toHaveBeenCalled();
    });
  });

  describe('sendPayment', () => {
    it('should send payment between agents', async () => {
      // Setup agent registry
      sdk.linkAgent('agent-from', 'user-from');
      sdk.linkAgent('agent-to', 'user-to');

      const mockTransfer = {
        transferType: 'WALLET.TRANSFER' as const,
        transferDetails: {
          id: 'transfer-123',
          requestId: 'request-123',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          chain: 'POLYGON' as const,
          currency: 'usdc',
          contractAddress: '0xcontract',
          status: 'CREATED' as const,
          failedReason: null,
          source: {
            userId: 'user-from',
            walletAddress: '0xfrom',
            walletType: 'INDIVIDUAL',
            user: {
              email: '[email protected]',
              lastName: 'From',
              firstName: 'Agent',
              businessName: null,
            },
          },
          destination: {
            userId: 'user-to',
            walletAddress: '0xto',
            user: {
              email: '[email protected]',
              lastName: 'To',
              firstName: 'Agent',
              businessName: null,
            },
          },
          amount: 10,
          amountIncludeDeveloperFee: 10,
          receipt: {
            transactionHash: null,
            userOpHash: null,
          },
        },
      };

      mockHifi.createTransfer = jest.fn().mockResolvedValue(mockTransfer);

      const result = await sdk.sendPayment({
        from: 'agent-from',
        to: 'agent-to',
        amount: 10,
        currency: 'USDC',
        memo: 'Test payment',
      });

      expect(result.transferDetails.amount).toBe(10);
      expect(result.transferDetails.currency).toBe('usdc');
      expect(mockHifi.createTransfer).toHaveBeenCalled();
    });

    it('should throw error if sender not found', async () => {
      await expect(
        sdk.sendPayment({
          from: 'unknown-agent',
          to: 'agent-to',
          amount: 10,
          currency: 'USDC',
        })
      ).rejects.toThrow('Sender agent unknown-agent not found');
    });
  });

  describe('ping', () => {
    it('should return true when API is healthy', async () => {
      mockHifi.ping = jest.fn().mockResolvedValue({ message: 'pong' });
      
      const result = await sdk.ping();
      
      expect(result).toBe(true);
      expect(mockHifi.ping).toHaveBeenCalled();
    });

    it('should return false when API is down', async () => {
      mockHifi.ping = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const result = await sdk.ping();
      
      expect(result).toBe(false);
    });
  });
});
