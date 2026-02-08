# HIFI Bridge API Reference

**Comprehensive API Documentation**  
Generated: 2026-02-08  
Base URLs:
- Sandbox: `https://sandbox.hifibridge.com`
- Production: `https://production.hifibridge.com`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Environments](#api-environments)
4. [Common Concepts](#common-concepts)
5. [API Endpoints](#api-endpoints)
   - [Common Endpoints](#common-endpoints)
   - [User Management](#user-management)
   - [KYC (Know Your Customer)](#kyc-know-your-customer)
   - [Virtual Accounts](#virtual-accounts)
   - [Wallets](#wallets)
   - [Transfers (Crypto)](#transfers-crypto)
   - [Onramp (Fiat to Crypto)](#onramp-fiat-to-crypto)
   - [Offramp (Crypto to Fiat)](#offramp-crypto-to-fiat)
   - [Bank Accounts](#bank-accounts)
6. [Request/Response Formats](#requestresponse-formats)
7. [Common Use Cases & Flows](#common-use-cases--flows)
8. [Webhooks](#webhooks)
9. [Error Handling](#error-handling)

---

## Overview

HIFI Bridge is a platform for programmable money that enables:
- **Send and receive payments**: Move money between fiat and stablecoins across borders
- **Create virtual accounts**: Issue deposit accounts for users in supported currencies
- **Provision wallets**: Generate custodial wallets for users or businesses
- **Manage on-chain assets**: Transfer or swap digital assets between chains
- **Automate fund flows**: Manage internal transfers, settlements, and liquidity

### Key Capabilities
- Fiat-to-crypto conversions (Onramps)
- Crypto-to-fiat conversions (Offramps)
- Wallet-to-wallet transfers
- Multi-chain support (Ethereum, Polygon, etc.)
- Automated KYC verification
- Virtual account provisioning
- Real-time webhooks

---

## Authentication

### API Keys

HIFI uses Bearer token authentication for all API requests.

#### Creating API Keys

1. Log in to [HIFI Dashboard](https://dashboard.hifibridge.com)
2. Navigate to **Developer → API Keys**
3. Select environment (Sandbox or Production)
4. Click "Create API Key"
5. Provide a descriptive name
6. Copy and securely store the key

#### Authentication Header Format

```
Authorization: Bearer YOUR_API_KEY
```

#### Example Request

```bash
curl -X GET "https://sandbox.hifibridge.com/v2/ping" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Security Best Practices

- ✅ Store API keys in environment variables or secrets manager
- ✅ Never commit keys to version control
- ✅ Never expose keys in client-side code
- ✅ Rotate keys periodically
- ✅ Delete compromised keys immediately

#### Testing API Keys

```bash
curl -X GET "https://sandbox.hifibridge.com/v2/ping" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Success Response
{
  "message": "pong"
}
```

---

## API Environments

| Environment | Base URL | Purpose |
|------------|----------|---------|
| **Sandbox** | `https://sandbox.hifibridge.com` | Testing and development with simulated transactions |
| **Production** | `https://production.hifibridge.com` | Live transactions with real money movement |

### Sandbox Environment
- ✅ All transactions are simulated - no real money moves
- ✅ KYC applications typically auto-approved
- ✅ Transactions complete instantly
- ✅ Safe for experimentation
- ✅ Behaves identically to production

---

## Common Concepts

### Rails

A **Rail** is a payment corridor that enables specific currency conversions. Examples:
- **USD Rail**: Enables USD ↔ USDC conversions
- **SOUTH_AMERICA_STANDARD**: Regional rail for South American currencies
- **GLOBAL_NETWORK**: International transfers
- **AFRICA_GENERAL/AFRICA_NIGERIA**: African regional rails

To use fiat rails, users must complete KYC verification.

### Wallets

Users are automatically provisioned with cryptocurrency wallet addresses on supported chains when created. Wallet types:
- **INDIVIDUAL**: Personal wallets for individual users
- **BUSINESS**: Business entity wallets

Supported chains: `ETHEREUM`, `POLYGON`, etc.

### Transfer Types

1. **Onramp**: Fiat currency → Stablecoin (e.g., USD → USDC)
2. **Offramp**: Stablecoin → Fiat currency (e.g., USDC → USD)
3. **Crypto Transfer**: Stablecoin → Stablecoin (wallet to wallet)

### Idempotency

Most creation endpoints support `requestId` (UUID) to ensure idempotent operations. Retrying with the same `requestId` won't create duplicates.

### Pagination

List endpoints support cursor-based pagination:
- `limit`: Maximum number of records to return
- `nextCursor`: Token for fetching next page (returned in response)

### Expansion

Use the `expand` query parameter to include related objects in responses, reducing API calls:

```bash
# Expand UBOs and documents in one request
GET /v2/users/{userId}/kyc?expand[]=ultimateBeneficialOwners&expand[]=documents
```

---

## API Endpoints

### Common Endpoints

#### Ping

Test API connectivity and authentication.

**Endpoint:** `GET /v2/ping`

**Request:**
```bash
curl --request GET \
  --url https://production.hifibridge.com/v2/ping \
  --header 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "message": "pong"
}
```

---

### User Management

#### Create a User

Create an individual or business user. Users are automatically provisioned with cryptocurrency wallet addresses.

**Endpoint:** `POST /v2/users`

**Request Body:**
```json
{
  "type": "individual",
  "firstName": "John",
  "lastName": "Doe",
  "email": "[email protected]",
  "dateOfBirth": "1990-01-15",
  "signedAgreementId": "agreement_xyz123",
  "requestId": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "chains": ["POLYGON", "ETHEREUM"],
  "address": {
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "stateProvinceRegion": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "ipAddress": "192.168.1.1"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | User type: `individual` or `business` |
| `firstName` | string | Yes (individual) | User's first name |
| `lastName` | string | Yes (individual) | User's last name |
| `email` | string | Yes | User's email address |
| `dateOfBirth` | string | Yes (individual) | Date in format YYYY-MM-DD |
| `signedAgreementId` | string | Yes | Terms of Service agreement ID |
| `requestId` | string | Yes | Unique UUID for idempotency |
| `chains` | array | Yes | Blockchain networks (e.g., `["POLYGON"]`) |
| `address` | object | Yes | User's physical address |
| `ipAddress` | string | Recommended | User's IP address |

**Response:**
```json
{
  "id": "4d93ab4f-3983-4ac0-8c97-54bbc0f287fa",
  "createdAt": "2025-09-24T19:12:20.541Z",
  "type": "individual",
  "email": "[email protected]",
  "name": "John Doe",
  "wallets": {
    "INDIVIDUAL": {
      "ETHEREUM": {
        "id": "24b4917d-604e-4d81-ace8-9ba0261b6f4e",
        "address": "0x43B343Bb48E23F58406271131B71448fF95787AD"
      },
      "POLYGON": {
        "id": "24b4917d-604e-4d81-ace8-9ba0261b6f4e",
        "address": "0x43B343Bb48E23F58406271131B71448fF95787AD"
      }
    }
  }
}
```

---

#### List All Users

Retrieve a paginated list of users.

**Endpoint:** `GET /v2/users`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Maximum records to return |
| `cursor` | string | Pagination cursor from previous response |

**Request:**
```bash
curl --request GET \
  --url 'https://production.hifibridge.com/v2/users?limit=10' \
  --header 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "count": 2,
  "users": [
    {
      "id": "4d93ab4f-3983-4ac0-8c97-54bbc0f287fa",
      "createdAt": "2025-09-24T19:12:20.541Z",
      "type": "individual",
      "email": "[email protected]",
      "name": "John Doe",
      "wallets": {
        "INDIVIDUAL": {
          "ETHEREUM": {
            "id": "24b4917d-604e-4d81-ace8-9ba0261b6f4e",
            "address": "0x43B343Bb48E23F58406271131B71448fF95787AD"
          },
          "POLYGON": {
            "id": "24b4917d-604e-4d81-ace8-9ba0261b6f4e",
            "address": "0x43B343Bb48E23F58406271131B71448fF95787AD"
          }
        }
      }
    }
  ],
  "nextCursor": "2025-09-24T19:03:41.107Z"
}
```

---

#### Retrieve a User

Get details for a specific user.

**Endpoint:** `GET /v2/users/{userId}`

**Request:**
```bash
curl --request GET \
  --url https://production.hifibridge.com/v2/users/4d93ab4f-3983-4ac0-8c97-54bbc0f287fa \
  --header 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "id": "4d93ab4f-3983-4ac0-8c97-54bbc0f287fa",
  "createdAt": "2025-09-24T19:12:20.541Z",
  "type": "individual",
  "email": "[email protected]",
  "name": "John Doe",
  "wallets": {
    "INDIVIDUAL": {
      "ETHEREUM": {
        "id": "24b4917d-694e-4d81-ace8-9ba0261b6f4e",
        "address": "0x43B343Bb48E23F58406271131B71448fF95787AD"
      },
      "POLYGON": {
        "id": "24b4917d-604e-4d81-ace8-9ba0261b6f4e",
        "address": "0x43B343Bb48E23F58406271131B71448fF95787AD"
      }
    }
  }
}
```

---

### KYC (Know Your Customer)

KYC verification is required to unlock fiat rails (onramp/offramp functionality).

#### Create KYC Link

Generate a hosted KYC collection page for users (recommended approach).

**Endpoint:** `POST /v2/kyc-link`

**Request Body:**
```json
{
  "userId": "32051b2f-0798-55a7-9c42-b08da4192c97",
  "rails": ["USD"],
  "redirectUrl": "https://yourapp.com/kyc-complete"
}
```

**Response:**
```json
{
  "kycLinkUrl": "https://dashboard.hifibridge.com/sandbox/kyc-link?sessionToken=768fb84ad65284cb5fffda212f5e779829318acwdab5a36efbf83c4f44369c73"
}
```

**Usage:**
1. Redirect user to `kycLinkUrl`
2. User completes KYC on hosted page
3. User is redirected to your `redirectUrl` with `?userId=...`
4. Monitor status via API or webhooks

---

#### Retrieve KYC Status

Get the current KYC verification status for a specific rail.

**Endpoint:** `GET /v2/users/{userId}/kyc/status`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `rails` | string | Rail type (e.g., `USD`, `GLOBAL_NETWORK`) |

**Request:**
```bash
curl --request GET \
  --url 'https://sandbox.hifibridge.com/v2/users/32051b2f-0798-55a7-9c42-b08da4192c97/kyc/status?rails=USD' \
  --header 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "status": "ACTIVE",
  "message": "",
  "reviewResult": {
    "reviewAnswer": "APPROVED",
    "reviewRejectType": "",
    "rejectReasons": [],
    "comment": ""
  }
}
```

**KYC Status Values:**

| Status | Description |
|--------|-------------|
| `INACTIVE` | No KYC submission has been made |
| `CREATED` | KYC application submitted |
| `PENDING` | Review in progress |
| `RFI_PENDING` | Request for Information sent, awaiting response |
| `INCOMPLETE` | RFI or resubmission required |
| `ACTIVE` | User approved and rail unlocked |
| `REJECTED` | KYC application rejected |
| `CONTACT_SUPPORT` | Unexpected issue encountered |

---

#### Update KYC Information

Update KYC data programmatically (alternative to KYC Link).

**Endpoint:** `POST /v2/users/{userId}/kyc`

**Request Body (Individual):**
```json
{
  "phone": "+18573491112",
  "taxIdentificationNumber": "564213816"
}
```

**Query Parameters (Expansion):**
- `expand[]=ultimateBeneficialOwners`
- `expand[]=documents`
- `expand[]=ultimateBeneficialOwners.documents`

**Request:**
```bash
curl -X POST "https://production.hifibridge.com/v2/users/{userId}/kyc" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+8573491112", "taxIdentificationNumber": "564213816"}' \
  "?expand[]=ultimateBeneficialOwners&expand[]=documents"
```

---

#### Submit KYC

Submit KYC application for review after updating information.

**Endpoint:** `POST /v2/users/{userId}/kyc/submit`

---

### Virtual Accounts

Virtual accounts enable users to deposit fiat currency, which is automatically converted to stablecoins (onramp).

#### Create a Virtual Account

**Endpoint:** `POST /v2/users/{userId}/virtual-accounts`

**Request Body:**
```json
{
  "sourceCurrency": "usd",
  "destinationCurrency": "usdc",
  "destinationChain": "POLYGON"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sourceCurrency` | string | Yes | Fiat currency to deposit (e.g., `usd`) |
| `destinationCurrency` | string | Yes | Stablecoin to receive (e.g., `usdc`) |
| `destinationChain` | string | Yes | Blockchain network (e.g., `POLYGON`) |

**Response:**
```json
{
  "message": "Virtual account created successfully",
  "accountInfo": {
    "id": "938e3b36-3be7-5535-ba12-8d89eb683e6b",
    "userId": "32051b2f-0798-55a7-9c42-b08da4192c97",
    "source": {
      "paymentRail": ["ach", "wire", "rtp"],
      "currency": "usd"
    },
    "destination": {
      "chain": "POLYGON",
      "currency": "usdc",
      "walletAddress": "0x1b932E54e77Aeb698144550d5a493Ea99E20Daa7",
      "externalWalletId": null
    },
    "status": "activated",
    "depositInstructions": {
      "bankName": "Cross River Bank",
      "bankAddress": "885 Teaneck Road, Teaneck, NJ 07666",
      "beneficiary": {
        "name": "John Doe",
        "address": "123 Main St, New York, NY, 10010, US"
      },
      "ach": {
        "routingNumber": "021214891",
        "accountNumber": "344176915009"
      },
      "wire": {
        "routingNumber": "021214891",
        "accountNumber": "344176915009"
      },
      "rtp": {
        "routingNumber": "021214891",
        "accountNumber": "344176915009"
      },
      "instruction": "Please deposit USD to the bank account provided. Ensure the beneficiary name matches the account holder name, or the payment may be rejected."
    }
  }
}
```

**Key Response Fields:**
- `accountInfo.id`: Virtual account ID
- `accountInfo.depositInstructions`: Bank details to share with user for deposits

---

#### Simulate Deposit (Sandbox Only)

Simulate a fiat deposit to trigger an onramp in sandbox environment.

**Endpoint:** `POST /v2/users/{userId}/virtual-accounts/{accountId}/simulate-deposit`

**Request Body:**
```json
{
  "paymentRail": "wire",
  "source": {
    "routingNumber": "021000021",
    "accountNumber": "516843515316",
    "name": "Jane Doe",
    "bankName": "JP Morgan Chase"
  },
  "amount": "100.00",
  "requestId": "32639f89-5fcc-4e31-8abe-0e710ba2e4a1",
  "reference": "Test deposit"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `paymentRail` | string | Yes | `wire`, `ach`, or `rtp` |
| `source` | object | Yes | Sender's bank information |
| `amount` | string | Yes | Deposit amount in fiat currency |
| `requestId` | string | Yes | Unique UUID for idempotency |
| `reference` | string | No | Deposit reference/memo |

**Response:**
```json
{
  "message": "Sandbox deposit triggered"
}
```

---

### Wallets

Wallets are automatically created when users are provisioned. No separate wallet creation endpoint is needed.

**Wallet Structure (in User object):**
```json
{
  "wallets": {
    "INDIVIDUAL": {
      "ETHEREUM": {
        "id": "24b4917d-604e-4d81-ace8-9ba0261b6f4e",
        "address": "0x43B343Bb48E23F58406271131B71448fF95787AD"
      },
      "POLYGON": {
        "id": "24b4917d-604e-4d81-ace8-9ba0261b6f4e",
        "address": "0x43B343Bb48E23F58406271131B71448fF95787AD"
      }
    }
  }
}
```

---

### Transfers (Crypto)

Send stablecoins directly between user wallets on-chain (no fiat conversion).

#### Create a Crypto Transfer

**Endpoint:** `POST /v2/wallets/transfers`

**Request Body:**
```json
{
  "source": {
    "userId": "32051b2f-0798-55a7-9c42-b08da4192c97"
  },
  "destination": {
    "userId": "30669fcc-b15e-4137-b4fc-9e8f7f659a87"
  },
  "requestId": "a40ea2aa-7937-4be9-bb1f-b75f1489bcc6",
  "amount": 10.5,
  "currency": "usdc",
  "chain": "POLYGON"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source.userId` | string | Yes | Sender's user ID |
| `destination.userId` | string | Yes | Recipient's user ID |
| `requestId` | string | Yes | Unique UUID for idempotency |
| `amount` | number | Yes | Amount of stablecoin to transfer |
| `currency` | string | Yes | Stablecoin type (e.g., `usdc`, `usdt`) |
| `chain` | string | Yes | Blockchain network (e.g., `POLYGON`) |

**Response:**
```json
{
  "transferType": "WALLET.TRANSFER",
  "transferDetails": {
    "id": "1a1ad1dd-ad72-4f3f-910b-c45dcf09875f",
    "requestId": "a40ea2aa-7937-4be9-bb1f-b75f1489bcc6",
    "createdAt": "2025-09-26T03:04:11.092Z",
    "updatedAt": "2025-09-26T03:04:11.092Z",
    "chain": "POLYGON",
    "currency": "usdc",
    "contractAddress": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    "status": "CREATED",
    "failedReason": null,
    "source": {
      "userId": "32051b2f-0798-55a7-9c42-b08da4192c97",
      "walletAddress": "0x1b932E54e77Aeb698144550d5a493Ea99E20Daa7",
      "walletType": "INDIVIDUAL",
      "user": {
        "email": "[email protected]",
        "lastName": "Doe",
        "firstName": "John",
        "businessName": null
      }
    },
    "destination": {
      "userId": "30669fcc-b15e-4137-b4fc-9e8f7f659a87",
      "walletAddress": "0x1b932E54e77Aeb688144550d5a493Ea99E20Daa7",
      "user": {
        "email": "[email protected]",
        "lastName": "Doe",
        "firstName": "Jane",
        "businessName": null
      }
    },
    "amount": 10.5,
    "amountIncludeDeveloperFee": 10.5,
    "receipt": {
      "transactionHash": null,
      "userOpHash": null
    }
  }
}
```

**Transfer Status Progression:**
- `CREATED` → Transfer initiated
- `PENDING` → Being processed on blockchain
- `COMPLETE` → Successfully delivered
- `FAILED` → Transfer failed (see `failedReason`)

---

#### List All Crypto Transfers

**Endpoint:** `GET /v2/wallets/transfers`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Maximum records to return |
| `cursor` | string | Pagination cursor |

**Response:**
```json
{
  "count": 1,
  "records": [
    {
      "transferType": "WALLET.TRANSFER",
      "transferDetails": {
        "id": "006737ca-42d5-4780-b3c2-aeb63279c591",
        "requestId": "d0d62bec-2623-4f61-afda-148d6a8e1009",
        "createdAt": "2025-02-03T16:11:36.654+00:00",
        "status": "CREATED",
        "chain": "POLYGON_MAINNET",
        "currency": "usdc",
        "amount": 0.01
      }
    }
  ],
  "nextCursor": "2025-02-03T16:11:36.654+00:00"
}
```

---

#### Retrieve a Crypto Transfer

**Endpoint:** `GET /v2/wallets/transfers/{transferId}`

---

### Onramp (Fiat to Crypto)

Convert fiat currency to stablecoins. Typically triggered automatically when deposits arrive at virtual accounts.

#### Create an Onramp

**Endpoint:** `POST /v2/onramps`

**Request Body:**
```json
{
  "requestId": "e1047def-6942-4fd7-be04-e62eb41813b6",
  "source": {
    "userId": "c15c0adf-3e45-4a62-b334-73aeec127649",
    "currency": "usd",
    "amount": 100
  },
  "destination": {
    "userId": "c15c0adf-3e45-4a62-b334-73aeec127649",
    "currency": "usdc",
    "chain": "POLYGON"
  }
}
```

**Response:**
```json
{
  "transferType": "ONRAMP",
  "transferDetails": {
    "id": "b26927e6-2771-423c-af44-a3c7a3e815c5",
    "requestId": "e1047def-6942-4fd7-be04-e62eb41813b6",
    "createdAt": "2025-02-03T17:15:31.927121+00:00",
    "status": "OPEN_QUOTE",
    "source": {
      "userId": "c15c0adf-3e45-4a62-b334-73aeec127649",
      "currency": "usd",
      "amount": 100,
      "user": {
        "email": "[email protected]",
        "lastName": "Wu",
        "firstName": "Henry"
      }
    },
    "destination": {
      "userId": "c15c0adf-3e45-4a62-b334-73aeec127649",
      "currency": "usdc",
      "chain": "POLYGON",
      "walletAddress": "0x848732f6c834E05b17C56fa01E83EE095f72C3c3"
    },
    "quoteInformation": {
      "sendGross": {"amount": "100.00", "currency": "usd"},
      "sendNet": {"amount": "100.00", "currency": "usd"},
      "receiveGross": {"amount": "100.00", "currency": "usdc"},
      "receiveNet": {"amount": "100.00", "currency": "usdc"},
      "rate": "1.00",
      "expiresAt": "N/A"
    }
  }
}
```

**Onramp Status Progression:**
- `OPEN_QUOTE` → Quote ready for acceptance
- `FIAT_PENDING` → Waiting for fiat to settle
- `CRYPTO_PENDING` → Converting and sending crypto
- `COMPLETE` → USDC delivered to wallet
- `FAILED` → Onramp failed

---

#### Retrieve an Onramp

**Endpoint:** `GET /v2/onramps/{onrampId}`

---

#### Accept Onramp Quote

**Endpoint:** `POST /v2/onramps/{onrampId}/quote/accept`

---

### Offramp (Crypto to Fiat)

Convert stablecoins to fiat currency and send to a bank account.

#### Create an Offramp

**Endpoint:** `POST /v2/offramps`

**Request Body:**
```json
{
  "requestId": "c5f8a2b1-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
  "source": {
    "userId": "32051b2f-0798-55a7-9c42-b08da4192c97",
    "currency": "usdc",
    "chain": "POLYGON",
    "amount": 50
  },
  "destination": {
    "userId": "32051b2f-0798-55a7-9c42-b08da4192c97",
    "currency": "usd",
    "accountId": "583eb259-e78b-4f0c-a4b5-a8957876fa6f"
  }
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requestId` | string | Yes | Unique UUID for idempotency |
| `source.userId` | string | Yes | User sending crypto |
| `source.currency` | string | Yes | Stablecoin type (e.g., `usdc`) |
| `source.chain` | string | Yes | Blockchain network |
| `source.amount` | number | Yes | Amount of crypto to convert |
| `destination.userId` | string | Yes | User receiving fiat |
| `destination.currency` | string | Yes | Fiat currency (e.g., `usd`) |
| `destination.accountId` | string | Yes | Bank account ID (from Create Account) |

**Response:**
```json
{
  "transferType": "OFFRAMP",
  "transferDetails": {
    "id": "173c1e89-7bbd-4352-9e5d-73807681510d",
    "requestId": "201ca31d-700f-4c76-ac4b-961623acbb79",
    "createdAt": "2025-02-03T16:12:04.331652+00:00",
    "status": "OPEN_QUOTE",
    "source": {
      "userId": "7d54a7a7-dac3-4313-8b09-27fa4b7fd1ee",
      "chain": "POLYGON",
      "currency": "usdc",
      "amount": 50,
      "walletAddress": "0x366B759bAA089Fa57a08edd3F2E028E86b97f8D6"
    },
    "destination": {
      "userId": "7d54a7a7-dac3-4313-8b09-27fa4b7fd1ee",
      "currency": "usd",
      "accountId": "12c1c496-8f57-41a1-8292-dbe6547791ce"
    },
    "quoteInformation": {
      "sendGross": {"amount": "50", "currency": "usdc"},
      "receiveNet": {"amount": "50", "currency": "usd"},
      "rate": "1",
      "expiresAt": "2025-09-26T03:20:00.000Z"
    }
  }
}
```

**Offramp Status Progression:**
- `OPEN_QUOTE` → Quote ready for acceptance
- `CRYPTO_PENDING` → Converting crypto to fiat
- `FIAT_PENDING` → Sending fiat to bank
- `COMPLETE` → Fiat delivered to bank account
- `FAILED` → Offramp failed

---

#### Accept Offramp Quote

**Endpoint:** `POST /v2/offramps/{offrampId}/quote/accept`

**Request:**
```bash
curl --request POST \
  --url https://sandbox.hifibridge.com/v2/offramps/b838908b-95d0-4ebb-a2c6-8f0c142bcdd7/quote/accept \
  --header 'Authorization: Bearer YOUR_API_KEY'
```

---

#### Retrieve an Offramp

**Endpoint:** `GET /v2/offramps/{offrampId}`

---

### Bank Accounts

Register bank accounts for receiving fiat currency (offramps).

#### Create an Account (US Bank)

**Endpoint:** `POST /v2/users/{userId}/accounts`

**Request Body (US Bank - Wire):**
```json
{
  "rail": "offramp",
  "type": "us",
  "accountHolder": {
    "type": "individual",
    "name": "John Doe",
    "phone": "+18573491112",
    "email": "[email protected]",
    "address": {
      "addressLine1": "123 Main St",
      "city": "New York",
      "stateProvinceRegion": "NY",
      "postalCode": "10010",
      "country": "USA"
    }
  },
  "us": {
    "transferType": "wire",
    "accountType": "checking",
    "accountNumber": "99485843",
    "routingNumber": "011002877",
    "bankName": "Chase Bank",
    "currency": "usd"
  }
}
```

**Request Body (Mexico - SPEI):**
```json
{
  "rail": "offramp",
  "type": "mexicoGlobalNetwork",
  "accountHolder": {
    "type": "individual",
    "name": "John Doe",
    "dateOfBirth": "1990-01-01",
    "idNumber": "ABCD123456EFGH78",
    "nationality": "MEX",
    "address": {
      "addressLine1": "123 Main Street",
      "city": "Mexico City",
      "stateProvinceRegion": "CDMX",
      "postalCode": "01000",
      "country": "MEX"
    }
  },
  "mexicoGlobalNetwork": {
    "bankName": "Banco Nacional de México",
    "accountNumber": "1234567890",
    "clabe": "012345678901234567",
    "currency": "mxn"
  }
}
```

**Request Body (Brazil - PIX):**
```json
{
  "rail": "offramp",
  "type": "brazilGlobalNetwork",
  "accountHolder": {
    "type": "individual",
    "name": "John Doe",
    "dateOfBirth": "1990-01-01",
    "idNumber": "12345678901",
    "nationality": "BRA",
    "address": {
      "addressLine1": "123 Main Street",
      "city": "São Paulo",
      "stateProvinceRegion": "SP",
      "postalCode": "01310-100",
      "country": "BRA"
    }
  },
  "brazilGlobalNetwork": {
    "bankName": "Banco do Brasil",
    "accountNumber": "12345-6",
    "branchNumber": "1234",
    "currency": "brl"
  }
}
```

**Response:**
```json
{
  "status": "ACTIVE",
  "id": "583eb259-e78b-4f0c-a4b5-a8957876fa6f",
  "message": "Account created successfully"
}
```

**Account Status Values:**
- `ACTIVE`: Account validated and ready for offramps
- `PENDING`: Account being validated
- `REJECTED`: Validation failed (check `invalidFields`)

---

#### List All Accounts

**Endpoint:** `GET /v2/users/{userId}/accounts`

**Response:**
```json
{
  "count": 1,
  "banks": [
    {
      "id": "d748da4f-aeb1-4a9d-af30-62ae7e82b897",
      "createdAt": "2025-09-27T03:34:12.181Z",
      "accountHolder": {
        "type": "individual",
        "name": "Henry Wu",
        "address": {
          "addressLine1": "Example St 1",
          "city": "New York",
          "stateProvinceRegion": "NY",
          "postalCode": "10010",
          "country": "USA"
        }
      },
      "us": {
        "accountType": "Checking",
        "accountNumber": "123456789",
        "routingNumber": "021000021",
        "bankName": "Bank of NoWhere",
        "currency": "usd"
      },
      "rail": {
        "currency": "usd",
        "railType": "offramp",
        "paymentRail": "ach"
      }
    }
  ],
  "nextCursor": "2025-09-27T03:34:12.181Z"
}
```

---

#### Retrieve an Account

**Endpoint:** `GET /v2/users/{userId}/accounts/{accountId}`

---

## Request/Response Formats

### Standard Request Headers

All API requests should include:

```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Response Format

API responses follow a consistent JSON structure:

```json
{
  "id": "resource-id",
  "createdAt": "2025-09-24T19:12:20.541Z",
  "status": "ACTIVE",
  ...
}
```

### Pagination

List endpoints return paginated results:

```json
{
  "count": 10,
  "records": [...],
  "nextCursor": "2025-09-24T19:03:41.107Z"
}
```

Use `nextCursor` in subsequent requests:

```bash
GET /v2/users?cursor=2025-09-24T19:03:41.107Z&limit=10
```

### Expansion

Reduce API calls by expanding related objects:

```bash
# Single expansion
GET /v2/users/{userId}/kyc?expand[]=documents

# Multiple expansions
GET /v2/users/{userId}/kyc?expand[]=ultimateBeneficialOwners&expand[]=documents&expand[]=ultimateBeneficialOwners.documents
```

**Supported Expansions:**

**KYC Endpoints:**
- `ultimateBeneficialOwners` - Include full UBO objects
- `documents` - Include all KYC documents
- `ultimateBeneficialOwners.documents` - Include documents for each UBO

**UBO Endpoints:**
- `documents` - Include all documents for the UBO

### Timestamps

All timestamps are in ISO 8601 format with timezone:

```
2025-09-24T19:12:20.541Z
```

---

## Common Use Cases & Flows

### Use Case 1: Receive Money (Fiat → Crypto)

**Goal:** User deposits USD and receives USDC in their wallet.

**Flow:**

1. **Create User**
   ```
   POST /v2/users
   ```

2. **Complete KYC**
   ```
   POST /v2/kyc-link (get hosted KYC page)
   GET /v2/users/{userId}/kyc/status (check approval)
   ```

3. **Create Virtual Account**
   ```
   POST /v2/users/{userId}/virtual-accounts
   ```

4. **Share Deposit Instructions**
   - Provide user with `depositInstructions` from virtual account response
   - User sends USD from their bank to the provided account details

5. **Monitor Onramp**
   - HIFI automatically detects deposit and creates onramp
   - Receive `ONRAMP.CREATE` webhook
   - Monitor via `ONRAMP.UPDATE` webhooks or polling

6. **User Receives USDC**
   - Onramp status changes to `COMPLETE`
   - USDC delivered to user's wallet

---

### Use Case 2: Send Money (Crypto → Fiat)

**Goal:** User converts USDC to USD and receives it in their bank account.

**Flow:**

1. **Ensure User Has USDC**
   - User must have USDC balance in their wallet
   - Can be from previous onramp or transfer

2. **Create Offramp Account**
   ```
   POST /v2/users/{userId}/accounts (register bank account)
   ```

3. **Create Offramp Request**
   ```
   POST /v2/offramps
   ```
   - Receive quote with exchange rate and fees

4. **Accept Quote**
   ```
   POST /v2/offramps/{offrampId}/quote/accept
   ```

5. **Monitor Offramp**
   - Receive `OFFRAMP.UPDATE` webhooks
   - Track status progression

6. **User Receives USD**
   - Offramp status changes to `COMPLETE`
   - USD delivered to registered bank account

---

### Use Case 3: Wallet-to-Wallet Transfer

**Goal:** Send USDC from one user to another.

**Flow:**

1. **Ensure Both Users Exist**
   - Both sender and recipient must be created users
   - Both must have wallets on the same chain

2. **Create Transfer**
   ```
   POST /v2/wallets/transfers
   ```
   - Specify source userId, destination userId, amount, currency, chain

3. **Monitor Transfer**
   - Receive `WALLET.TRANSFER.UPDATE` webhooks
   - Or poll: `GET /v2/wallets/transfers/{transferId}`

4. **Transfer Complete**
   - Status changes to `COMPLETE`
   - USDC delivered to recipient's wallet
   - `transactionHash` available in receipt

---

### Use Case 4: User Onboarding

**Complete setup for a new user:**

1. **Generate Terms of Service Link**
   ```
   POST /v2/tos-link
   ```

2. **User Accepts ToS**
   - Redirect user to ToS link
   - User reviews and accepts

3. **Create User**
   ```
   POST /v2/users (with signedAgreementId from ToS)
   ```
   - User automatically gets wallet addresses

4. **Generate KYC Link**
   ```
   POST /v2/kyc-link
   ```

5. **User Completes KYC**
   - Redirect user to KYC link
   - User fills out information and uploads documents

6. **Monitor KYC Approval**
   ```
   GET /v2/users/{userId}/kyc/status
   ```
   - Wait for status = `ACTIVE`

7. **Create Virtual Account**
   ```
   POST /v2/users/{userId}/virtual-accounts
   ```

8. **User is Ready**
   - Can deposit, transfer, and offramp

---

## Webhooks

HIFI sends real-time webhook events for transaction and status updates.

### Registering Webhooks

1. Navigate to [Developer → Webhooks](https://dashboard.hifibridge.com/developer/webhooks)
2. Enter your webhook URL (must be HTTPS)
3. Save to receive your webhook secret

### Event Structure

All webhook events follow this structure:

```json
{
  "eventId": "evt_1957117404034e3ade",
  "eventCategory": "USER",
  "eventType": "USER.CREATE",
  "eventAction": "CREATE",
  "data": {
    "id": "usr_abc123",
    "email": "[email protected]",
    "type": "individual",
    "wallets": {
      "INDIVIDUAL": {
        "POLYGON": {
          "address": "0xa8A642FBA80749318036C97344fC73aE0B64c608"
        }
      }
    }
  },
  "createdAt": "2025-03-07T14:51:44.099Z",
  "timestamp": "2025-03-07T14:52:00.375Z",
  "version": "v2"
}
```

**Event Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `eventId` | string | Unique identifier for this webhook event |
| `eventCategory` | string | Broad category (USER, WALLET, ONRAMP, OFFRAMP, etc.) |
| `eventType` | string | Specific event type (USER.CREATE, WALLET.TRANSFER.UPDATE, etc.) |
| `eventAction` | string | Operation performed (CREATE, UPDATE, DELETE) |
| `data` | object | Event payload (structure varies by event type) |
| `createdAt` | string | ISO timestamp when event was generated |
| `timestamp` | string | ISO timestamp when webhook was delivered |
| `version` | string | Webhook payload schema version |

---

### Event Categories

#### User Events

- `USER.CREATE` - User created
- `USER.UPDATE` - User information updated

#### KYC Events

- `KYC.CREATE` - KYC application submitted
- `KYC.STATUS_UPDATE` - KYC status changed (approval, rejection, etc.)

#### Wallet Events

- `WALLET.TRANSFER.CREATE` - Crypto transfer initiated
- `WALLET.TRANSFER.UPDATE` - Crypto transfer status updated
- `WALLET.BALANCE.UPDATE` - Wallet balance changed

#### Account Events

- `ACCOUNT.CREATE` - Bank account or virtual account created
- `ACCOUNT.UPDATE` - Account status updated

#### Onramp Events

- `ONRAMP.CREATE` - Onramp initiated
- `ONRAMP.UPDATE` - Onramp status updated (quote, pending, complete, failed)

#### Offramp Events

- `OFFRAMP.CREATE` - Offramp initiated
- `OFFRAMP.UPDATE` - Offramp status updated (quote, pending, complete, failed)

---

### Verifying Webhook Signatures

**Critical:** Always verify webhook signatures to ensure requests are from HIFI.

Webhooks include a JWT token in the `Authorization` header. Verify using your webhook public key (from dashboard) with RS256 algorithm.

**Verification Steps:**

1. Extract JWT token from `Authorization: Bearer` header
2. Verify token using webhook public key with RS256
3. If verification succeeds, process event
4. If verification fails, reject with 401 status

**Implementation Example (Node.js):**

```javascript
const jwt = require('jsonwebtoken');

function verifyWebhook(req, publicKey) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    return decoded;
  } catch (error) {
    throw new Error('Invalid webhook signature');
  }
}
```

---

### Retry Behavior

HIFI automatically retries failed webhook deliveries.

**Retry Policy:**
- **Duration:** Up to 24 hours
- **Strategy:** Exponential backoff
- **Interval:** 60 seconds to 1 hour between retries
- **Success Criteria:** Your endpoint returns 2xx status code

**Retries When:**
- Your endpoint returns 5xx error
- Connection timeout occurs
- Network error prevents delivery

**No Retries When:**
- Your endpoint returns 4xx error (permanent failure)
- Webhook endpoint disabled or deleted
- 24 hours elapsed since original event

---

### Best Practices

**Endpoint Implementation:**
- ✅ Return 200 status code immediately upon receiving webhook
- ✅ Process webhook asynchronously (queue for background processing)
- ✅ Implement idempotency using `eventId` (avoid duplicate processing)
- ✅ Verify webhook signatures on every request
- ✅ Log all webhook events for debugging

**Error Handling:**
- ✅ Return 2xx for successfully received webhooks (even if processing deferred)
- ✅ Return 5xx for temporary failures (triggers retry)
- ✅ Return 4xx for permanent failures (no retry)

**Security:**
- ✅ Use HTTPS endpoints only
- ✅ Verify JWT signatures
- ✅ Validate event structure
- ✅ Store webhook secret securely

---

## Error Handling

### Error Code Structure

Error codes follow the format: `SSCEE`

- **SS**: Service identifier (2 digits)
- **C**: Error category (2 digits)
- **EE**: Error sequence (2 digits)

Example: `100001` = Generic validation error (Service: 10, Category: 00, Sequence: 01)

---

### Service Identifiers

| Service ID | Description |
|------------|-------------|
| 10 | Generic Services |
| 20 | Authentication |
| 30 | User Management |
| 40 | Transaction Processing |
| 50 | Account Management |
| 60 | Wallet Services |
| 70 | System Infrastructure |

---

### Error Categories

| Category ID | Description |
|-------------|-------------|
| 00 | Validation Error |
| 01 | Authentication Error |
| 02 | Authorization Error |
| 03 | Not Found Error |
| 04 | Service Unavailable |
| 05 | Inactive Resource |

---

### Error Response Format

All error responses follow this structure:

```json
{
  "code": 100001,
  "error": "FIELD_VALIDATION_ERROR",
  "errorDetails": "Fields provided are either missing or invalid"
}
```

---

### Common Error Codes

#### Generic Errors (10xxxx)

| Code | Error | Description |
|------|-------|-------------|
| 100001 | FIELD_VALIDATION_ERROR | Fields provided are either missing or invalid |
| 100002 | METHOD_NOT_ALLOWED | Method not allowed |
| 100003 | INVALID_VERSION | Invalid version |
| 100004 | DEPRECATED_RESOURCE | This resource has been deprecated |
| 100005 | RESOURCE_CONFLICT | Resource conflict, please try different request id |

#### Authentication Errors (20xxxx)

| Code | Error | Description |
|------|-------|-------------|
| 200001 | INVALID_API_KEY | Invalid API key |
| 200201 | PRODUCTION_NOT_ENABLED | Production is not enabled for this profile |
| 200202 | USER_ROLE_NOT_ALLOWED | User role not allowed to perform this action |
| 200203 | UNAUTHORIZED | Unauthorized |
| 200204 | PROFILE_FROZEN | Profile is not authorized to access this resource |
| 200301 | BILLING_CONFIG_NOT_FOUND | Billing configuration not found |
| 200301 | KEY_DOES_NOT_EXIST | Key does not exist |

#### User Management Errors (30xxxx)

| Code | Error | Description |
|------|-------|-------------|
| 300001 | USER_ALREADY_EXISTS | User already exists |
| 300201 | USER_ACTION_NOT_ALLOWED | User is not allowed to perform this action |
| 300201 | USER_COMPLIANCE_VERIFICATION_FAILED | User compliance information is not approved |
| 300202 | USER_COMPLIANCE_DATA_INVALID | User compliance data is invalid |
| 300202 | USER_FROZEN | User is not authorized to access this resource |
| 300301 | USER_NOT_FOUND | User not found |

#### Transaction Errors (40xxxx)

| Code | Error | Description |
|------|-------|-------------|
| 400001 | INVALID_TRANSACTION_ROUTE | Invalid transaction route (combination of currency, crypto, and rail) |
| 400002 | INVALID_ACCOUNT_FOR_TRANSACTION | Invalid bank account for the transaction |
| 400003 | TRANSACTION_REQUEST_ALREADY_EXISTS | Transaction request already exists |
| 400005 | QUOTE_NOT_READY | Quote is not ready yet |
| 400006 | INVALID_QUOTE | Expired or invalid quote |
| 400301 | TRANSACTION_NOT_FOUND | Transaction not found |
| 400302 | QUOTE_NOT_FOUND | Quote not found |
| 400401 | INSUFFICIENT_BALANCE | Insufficient balance for transaction |
| 400402 | INSUFFICIENT_CREDIT_BALANCE | Insufficient credit balance for transaction fee |
| 400403 | TRANSACTION_INITIATION_FAILED | Transaction initiation failed |

#### Account Management Errors (50xxxx)

| Code | Error | Description |
|------|-------|-------------|
| 500001 | INVALID_ACCOUNT_DATA | Invalid bank account data provided |
| 500301 | ACCOUNT_NOT_FOUND | Bank account ID not found |
| 500501 | INACTIVE_ACCOUNT | Bank account is not active |

#### Wallet Management Errors (60xxxx)

| Code | Error | Description |
|------|-------|-------------|
| 600001 | INVALID_WALLET_CONFIG | Invalid wallet configuration provided |
| 600001 | WALLET_ALREADY_EXISTS | Wallet already exists for this configuration |
| 600301 | WALLET_NOT_FOUND | Wallet not found for the user |
| 600501 | INACTIVE_WALLET | Wallet is not active |

#### System/Infrastructure Errors (70xxxx)

| Code | Error | Description |
|------|-------|-------------|
| 700401 | INTERNAL_SERVER_ERROR | Internal server error |

---

### Error Handling Best Practices

**Implementation:**

```javascript
try {
  const response = await fetch("/api/transfers", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transferData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
} catch (error) {
  if (error.code === 300301) {
    // Handle USER_NOT_FOUND error
    console.log("User was not found in the system");
  } else if (error.code === 400401) {
    // Handle INSUFFICIENT_BALANCE error
    console.log("Transaction failed due to insufficient balance");
  } else if (error.code === 200001) {
    // Handle INVALID_API_KEY error
    console.log("Please check your API key");
  } else {
    // Generic error handling
    console.error("API Error:", error.error, error.errorDetails);
  }
}
```

**Best Practices:**

- ✅ Always check error codes before displaying generic error messages
- ✅ Implement retry logic for transient errors (5xx status codes)
- ✅ Log errors for debugging and monitoring
- ✅ Provide user-friendly messages based on error codes
- ✅ Handle specific error scenarios:
  - **Authentication Issues**: Check API key validity and permissions
  - **User Not Found**: Verify user exists and is properly created
  - **Insufficient Balance**: Check account balances before transactions
  - **Invalid Routes**: Ensure currency/crypto/rail combinations are supported

---

## Additional Resources

- **Dashboard**: [https://dashboard.hifibridge.com](https://dashboard.hifibridge.com)
- **API Reference**: [https://docs.hifibridge.com/api-reference](https://docs.hifibridge.com/api-reference)
- **Guides**: [https://docs.hifibridge.com/guides/quickstart](https://docs.hifibridge.com/guides/quickstart)
- **Webhooks**: [https://docs.hifibridge.com/webhooks](https://docs.hifibridge.com/webhooks)
- **Postman Collection**: [https://docs.hifibridge.com/docs/postman](https://docs.hifibridge.com/docs/postman)
- **Support**: [email protected]

---

## Summary

HIFI Bridge provides a comprehensive API for:

✅ **User Management**: Create and manage individual/business users  
✅ **KYC Verification**: Automated compliance with hosted flows  
✅ **Virtual Accounts**: Enable fiat deposits with auto-conversion  
✅ **Wallet Operations**: Custodial wallets on multiple chains  
✅ **Transfers**: Wallet-to-wallet crypto transfers  
✅ **Onramps**: Fiat → Stablecoin conversions  
✅ **Offramps**: Stablecoin → Fiat conversions  
✅ **Webhooks**: Real-time event notifications  
✅ **Multi-Region Support**: USD, Latin America, Africa, Global rails  

**Key Features:**
- Sandbox environment for safe testing
- Bearer token authentication
- Idempotent operations with `requestId`
- Cursor-based pagination
- Object expansion to reduce API calls
- Comprehensive error codes
- JWT-verified webhooks
- Automatic retry logic

---

*Document Version: 1.0*  
*Last Updated: 2026-02-08*
