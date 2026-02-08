# Agent Finance Backend - Setup Guide

## 🎯 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd /root/.openclaw/workspace/agent-finance/backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file at `/root/.openclaw/workspace/.env`:
```env
HIFI_API_KEY=your_hifi_api_key_here
HIFI_ENVIRONMENT=sandbox
HIFI_BASE_URL=https://sandbox.hifibridge.com
```

### 3. Run the Quick Start Example
```bash
npm run example
```

This will:
- Test API connectivity
- Register two test agents (Alice & Bob)
- Create deposit accounts
- Attempt a payment transfer
- Show wallet addresses

### 4. Start the API Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 5. Test the API
```bash
# Health check
curl http://localhost:3000/health

# Register an agent
curl -X POST http://localhost:3000/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "my-test-agent",
    "name": "My Test Agent",
    "email": "[email protected]",
    "type": "individual"
  }'
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── sdk/                      # TypeScript SDK
│   │   ├── types.ts              # Type definitions
│   │   ├── hifi-client.ts        # Low-level HIFI wrapper
│   │   └── agent-finance.ts      # High-level agent SDK
│   ├── api/
│   │   └── routes.ts             # REST API routes
│   ├── webhooks/
│   │   └── handler.ts            # Webhook management
│   ├── server.ts                 # Fastify server
│   └── index.ts                  # Main exports
├── tests/
│   └── sdk.test.ts               # SDK tests
├── examples/
│   └── quickstart.ts             # Example usage
├── package.json
├── tsconfig.json
├── jest.config.js
├── openapi.yaml                  # API documentation
└── README.md
```

---

## 🔧 Development Workflow

### Run in Development Mode (Hot Reload)
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Run Tests
```bash
npm test
npm run test:watch
```

### Lint Code
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

---

## 🧪 Testing in Sandbox

The HIFI sandbox environment allows you to test without real money:

1. **All transactions are simulated** - No real funds move
2. **KYC auto-approved** - Skip lengthy verification
3. **Instant completion** - Transactions complete immediately
4. **Safe experimentation** - Test all features safely

### Simulate a Deposit (Sandbox Only)

```typescript
// After creating a virtual account, simulate a deposit
await hifi.simulateDeposit(userId, accountId, {
  paymentRail: 'wire',
  source: {
    routingNumber: '021000021',
    accountNumber: '516843515316',
    name: 'Test Sender',
    bankName: 'Test Bank',
  },
  amount: '100.00',
  requestId: uuidv4(),
  reference: 'Test deposit',
});
```

---

## 🚀 Deployment Checklist

### Before Production

- [ ] Switch to production HIFI API key
- [ ] Update `HIFI_ENVIRONMENT=production`
- [ ] Update `HIFI_BASE_URL=https://production.hifibridge.com`
- [ ] Configure proper CORS origins
- [ ] Set up webhook public key
- [ ] Enable proper logging (Datadog/Sentry)
- [ ] Set up database for agent registry
- [ ] Implement proper error monitoring
- [ ] Add authentication for API endpoints
- [ ] Review and adjust rate limits
- [ ] Set up SSL/TLS certificates
- [ ] Configure environment-specific secrets

### Production Environment Variables

```env
# HIFI
HIFI_API_KEY=prod_key_here
HIFI_ENVIRONMENT=production
HIFI_BASE_URL=https://production.hifibridge.com

# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
LOG_LEVEL=warn

# Security
CORS_ORIGIN=https://yourdomain.com
WEBHOOK_PUBLIC_KEY=your_webhook_public_key

# Optional
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

---

## 🔐 Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Validate all inputs** - Zod schemas handle this
3. **Rate limit aggressively** - Prevent abuse
4. **Verify webhook signatures** - Ensure requests are from HIFI
5. **Use HTTPS in production** - Encrypt all traffic
6. **Rotate API keys periodically** - Security hygiene
7. **Monitor for suspicious activity** - Track unusual patterns
8. **Implement proper authentication** - Protect your API endpoints

---

## 📊 Monitoring & Observability

### Key Metrics to Track

- API response times
- Error rates by endpoint
- Payment success/failure rates
- Webhook delivery success
- Agent registration rate
- Transaction volume
- Failed KYC verifications

### Recommended Tools

- **Logging**: Pino (already included)
- **APM**: Datadog, New Relic
- **Error Tracking**: Sentry
- **Uptime**: UptimeRobot, Pingdom
- **Metrics**: Prometheus + Grafana

---

## 🐛 Troubleshooting

### "Invalid API key" Error
- Check that `HIFI_API_KEY` is set correctly
- Ensure you're using the right environment (sandbox vs production)
- Verify the key hasn't been deleted in HIFI Dashboard

### "Agent not found in registry" Error
- The agent needs to be registered first using `registerAgent()`
- Use `linkAgent()` if you have an existing HIFI user ID

### "Insufficient balance" Error
- In sandbox: Use `simulateDeposit()` to add funds
- In production: Agent needs to deposit real funds

### Webhook Not Receiving Events
- Check webhook URL is publicly accessible
- Verify webhook signature verification is working
- Check HIFI Dashboard for webhook delivery logs

---

## 📚 Additional Resources

- [HIFI Bridge API Reference](../docs/HIFI_API_REFERENCE.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [OpenAPI Specification](./openapi.yaml)
- [HIFI Dashboard](https://dashboard.hifibridge.com)
- [HIFI Documentation](https://docs.hifibridge.com)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes with tests
3. Run tests: `npm test`
4. Lint code: `npm run lint`
5. Commit: `git commit -m "feat: description"`
6. Push and create PR

---

## 📝 Next Steps

1. ✅ Backend infrastructure complete
2. 🔄 Build frontend dashboard (optional)
3. 🔌 Integrate with OpenClaw as a skill/plugin
4. 🌐 Deploy to production hosting
5. 📈 Monitor and scale

---

**Questions?** Check the [README](./README.md) or open an issue.
