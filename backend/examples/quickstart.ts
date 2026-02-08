/**
 * Agent Finance - Quick Start Example
 * 
 * This example demonstrates the complete flow of:
 * 1. Registering two agents
 * 2. Creating deposit accounts
 * 3. Sending a payment between agents
 */

import { AgentFinanceSDK } from '../src/sdk/agent-finance';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../../.env' });

async function quickstart() {
  console.log('🚀 Agent Finance - Quick Start Example\n');

  // Initialize SDK
  const sdk = new AgentFinanceSDK({
    apiKey: process.env.HIFI_API_KEY!,
    baseUrl: process.env.HIFI_BASE_URL!,
    environment: 'sandbox',
  });

  // Test connection
  console.log('1. Testing API connection...');
  const isHealthy = await sdk.ping();
  console.log(`   ✅ API is ${isHealthy ? 'healthy' : 'unhealthy'}\n`);

  // Register first agent (Alice)
  console.log('2. Registering Agent Alice...');
  const alice = await sdk.registerAgent({
    agentId: 'agent-alice',
    name: 'Alice AI Agent',
    email: '[email protected]',
    type: 'individual',
  });
  console.log(`   ✅ Alice registered: ${alice.hifiUserId}`);
  console.log(`   📍 Polygon wallet: ${alice.wallets.POLYGON}\n`);

  // Register second agent (Bob)
  console.log('3. Registering Agent Bob...');
  const bob = await sdk.registerAgent({
    agentId: 'agent-bob',
    name: 'Bob AI Agent',
    email: '[email protected]',
    type: 'individual',
  });
  console.log(`   ✅ Bob registered: ${bob.hifiUserId}`);
  console.log(`   📍 Polygon wallet: ${bob.wallets.POLYGON}\n`);

  // Create deposit account for Alice
  console.log('4. Creating deposit account for Alice...');
  const depositAccount = await sdk.createDepositAccount('agent-alice', {
    fiatCurrency: 'usd',
    cryptoCurrency: 'usdc',
    chain: 'POLYGON',
  });
  console.log(`   ✅ Deposit account created: ${depositAccount.id}`);
  console.log(`   🏦 Bank details:`);
  console.log(`      Routing: ${depositAccount.depositInstructions.ach?.routingNumber}`);
  console.log(`      Account: ${depositAccount.depositInstructions.ach?.accountNumber}\n`);

  // Send payment from Alice to Bob
  console.log('5. Sending payment from Alice to Bob...');
  try {
    const payment = await sdk.sendPayment({
      from: 'agent-alice',
      to: 'agent-bob',
      amount: 5.00,
      currency: 'USDC',
      chain: 'POLYGON',
      memo: 'Payment for API service',
    });
    console.log(`   ✅ Payment initiated: ${payment.transferDetails.id}`);
    console.log(`   💰 Amount: ${payment.transferDetails.amount} ${payment.transferDetails.currency}`);
    console.log(`   📊 Status: ${payment.transferDetails.status}\n`);
  } catch (error: any) {
    console.log(`   ⚠️  Payment failed: ${error.message}`);
    console.log(`   (This is expected in sandbox without funding)\n`);
  }

  // Check payment history
  console.log('6. Checking Alice\'s payment history...');
  const payments = await sdk.listPayments('agent-alice', 10);
  console.log(`   📋 Found ${payments.length} payment(s)\n`);

  // Get wallet addresses
  console.log('7. Retrieving wallet addresses...');
  const aliceWallets = await sdk.getWallets('agent-alice');
  console.log(`   Alice's wallets:`);
  for (const [chain, address] of Object.entries(aliceWallets)) {
    console.log(`   - ${chain}: ${address}`);
  }

  console.log('\n✨ Quick start complete!\n');
  console.log('Next steps:');
  console.log('1. Fund Alice\'s wallet by depositing to the virtual account');
  console.log('2. Complete KYC verification for fiat operations');
  console.log('3. Register bank accounts for withdrawals');
  console.log('4. Start building your agent economy! 🤖💰');
}

// Run the example
quickstart().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
