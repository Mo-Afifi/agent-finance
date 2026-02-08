/**
 * Type definitions for Agent Finance SDK
 */

export interface HifiConfig {
  apiKey: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

export type UserType = 'individual' | 'business';
export type Chain = 'ETHEREUM' | 'POLYGON' | 'BASE';
export type Currency = 'usd' | 'usdc' | 'usdt' | 'eth' | 'matic';
export type PaymentRail = 'ach' | 'wire' | 'rtp';
export type TransferStatus = 'CREATED' | 'PENDING' | 'COMPLETE' | 'FAILED';
export type KYCStatus = 'INACTIVE' | 'CREATED' | 'PENDING' | 'RFI_PENDING' | 'INCOMPLETE' | 'ACTIVE' | 'REJECTED' | 'CONTACT_SUPPORT';

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvinceRegion: string;
  postalCode: string;
  country: string;
}

export interface CreateUserRequest {
  type: UserType;
  firstName?: string;
  lastName?: string;
  email: string;
  dateOfBirth?: string;
  signedAgreementId: string;
  requestId: string;
  chains: Chain[];
  address: Address;
  ipAddress?: string;
  businessName?: string;
}

export interface Wallet {
  id: string;
  address: string;
}

export interface User {
  id: string;
  createdAt: string;
  type: UserType;
  email: string;
  name: string;
  wallets: {
    INDIVIDUAL?: Record<Chain, Wallet>;
    BUSINESS?: Record<Chain, Wallet>;
  };
}

export interface KYCLinkRequest {
  userId: string;
  rails: string[];
  redirectUrl?: string;
}

export interface KYCLinkResponse {
  kycLinkUrl: string;
}

export interface KYCStatusResponse {
  status: KYCStatus;
  message: string;
  reviewResult: {
    reviewAnswer: string;
    reviewRejectType: string;
    rejectReasons: string[];
    comment: string;
  };
}

export interface VirtualAccountRequest {
  sourceCurrency: string;
  destinationCurrency: string;
  destinationChain: Chain;
}

export interface DepositInstructions {
  bankName: string;
  bankAddress: string;
  beneficiary: {
    name: string;
    address: string;
  };
  ach?: {
    routingNumber: string;
    accountNumber: string;
  };
  wire?: {
    routingNumber: string;
    accountNumber: string;
  };
  rtp?: {
    routingNumber: string;
    accountNumber: string;
  };
  instruction: string;
}

export interface VirtualAccount {
  id: string;
  userId: string;
  source: {
    paymentRail: PaymentRail[];
    currency: string;
  };
  destination: {
    chain: Chain;
    currency: string;
    walletAddress: string;
    externalWalletId: string | null;
  };
  status: string;
  depositInstructions: DepositInstructions;
}

export interface TransferRequest {
  source: {
    userId: string;
  };
  destination: {
    userId: string;
  };
  requestId: string;
  amount: number;
  currency: string;
  chain: Chain;
}

export interface TransferDetails {
  id: string;
  requestId: string;
  createdAt: string;
  updatedAt: string;
  chain: Chain;
  currency: string;
  contractAddress: string;
  status: TransferStatus;
  failedReason: string | null;
  source: {
    userId: string;
    walletAddress: string;
    walletType: string;
    user: {
      email: string;
      lastName: string;
      firstName: string;
      businessName: string | null;
    };
  };
  destination: {
    userId: string;
    walletAddress: string;
    user: {
      email: string;
      lastName: string;
      firstName: string;
      businessName: string | null;
    };
  };
  amount: number;
  amountIncludeDeveloperFee: number;
  receipt: {
    transactionHash: string | null;
    userOpHash: string | null;
  };
}

export interface Transfer {
  transferType: 'WALLET.TRANSFER';
  transferDetails: TransferDetails;
}

export interface OnrampRequest {
  requestId: string;
  source: {
    userId: string;
    currency: string;
    amount: number;
  };
  destination: {
    userId: string;
    currency: string;
    chain: Chain;
  };
}

export interface OfframpRequest {
  requestId: string;
  source: {
    userId: string;
    currency: string;
    chain: Chain;
    amount: number;
  };
  destination: {
    userId: string;
    currency: string;
    accountId: string;
  };
}

export interface QuoteInformation {
  sendGross: { amount: string; currency: string };
  sendNet: { amount: string; currency: string };
  receiveGross: { amount: string; currency: string };
  receiveNet: { amount: string; currency: string };
  rate: string;
  expiresAt: string;
}

export interface Onramp {
  transferType: 'ONRAMP';
  transferDetails: {
    id: string;
    requestId: string;
    createdAt: string;
    status: string;
    source: {
      userId: string;
      currency: string;
      amount: number;
      user: {
        email: string;
        lastName: string;
        firstName: string;
      };
    };
    destination: {
      userId: string;
      currency: string;
      chain: Chain;
      walletAddress: string;
    };
    quoteInformation: QuoteInformation;
  };
}

export interface Offramp {
  transferType: 'OFFRAMP';
  transferDetails: {
    id: string;
    requestId: string;
    createdAt: string;
    status: string;
    source: {
      userId: string;
      chain: Chain;
      currency: string;
      amount: number;
      walletAddress: string;
    };
    destination: {
      userId: string;
      currency: string;
      accountId: string;
    };
    quoteInformation: QuoteInformation;
  };
}

export interface BankAccountRequest {
  rail: 'offramp';
  type: 'us' | 'mexicoGlobalNetwork' | 'brazilGlobalNetwork';
  accountHolder: {
    type: UserType;
    name: string;
    phone?: string;
    email?: string;
    dateOfBirth?: string;
    idNumber?: string;
    nationality?: string;
    address: Address;
  };
  us?: {
    transferType: 'wire' | 'ach';
    accountType: 'checking' | 'savings';
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    currency: string;
  };
  mexicoGlobalNetwork?: {
    bankName: string;
    accountNumber: string;
    clabe: string;
    currency: string;
  };
  brazilGlobalNetwork?: {
    bankName: string;
    accountNumber: string;
    branchNumber: string;
    currency: string;
  };
}

export interface BankAccount {
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
  id: string;
  message: string;
}

export interface PaginatedResponse<T> {
  count: number;
  records?: T[];
  users?: User[];
  banks?: any[];
  nextCursor?: string;
}

export interface HifiError {
  code: number;
  error: string;
  errorDetails: string;
}
