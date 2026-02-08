# Changelog

All notable changes to Agent Finance Backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-08

### Added
- Initial release of Agent Finance Backend
- TypeScript SDK wrapping HIFI Bridge APIs
- Agent identity management (register, verify, get)
- Multi-chain wallet provisioning (Ethereum, Polygon, Base)
- Agent-to-agent crypto transfers
- Virtual account creation for fiat deposits (onramp)
- Bank account registration for fiat withdrawals (offramp)
- Fiat-to-crypto conversion (onramp)
- Crypto-to-fiat conversion (offramp)
- Transaction history queries
- Webhook support for real-time events
- REST API server (Fastify-based)
- Comprehensive API documentation (OpenAPI spec)
- Rate limiting and security features
- Unit tests for SDK
- Health check endpoint

### Security
- API key authentication for HIFI Bridge
- JWT-based webhook signature verification
- CORS and Helmet security headers
- Input validation with Zod schemas
- Rate limiting (100 req/min)
