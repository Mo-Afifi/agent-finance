/**
 * Agent Finance Backend - Main Entry Point
 * Export SDK and types for use in other applications
 */

export { HifiClient } from './sdk/hifi-client';
export { AgentFinanceSDK } from './sdk/agent-finance';
export { WebhookManager, exampleHandlers } from './webhooks/handler';

export type {
  HifiConfig,
  User,
  CreateUserRequest,
  Wallet,
  Chain,
  Currency,
  TransferStatus,
  KYCStatus,
  VirtualAccount,
  Transfer,
  Onramp,
  Offramp,
  BankAccount,
} from './sdk/types';

export type {
  AgentIdentity,
  AgentAccount,
  PaymentRequest,
  BalanceInfo,
} from './sdk/agent-finance';

export type {
  WebhookEvent,
  WebhookEventType,
  WebhookHandler,
} from './webhooks/handler';
