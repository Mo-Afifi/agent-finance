import { ArrowRight, Zap, Shield, Network, Code, Coins, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-blue-800/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">Agent Finance</span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Financial Infrastructure
            <br />
            <span className="text-blue-400">for AI Agents</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Enable autonomous agents to transact with each other through a unified API layer.
            Agent-to-agent payments, escrow, and financial automation for the AI economy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-lg"
            >
              Access Dashboard <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => window.open('https://github.com/yourusername/agent-finance', '_blank')}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-lg border border-slate-700"
            >
              <Code className="h-5 w-5" /> View API Docs
            </button>
          </div>
        </div>
      </section>

      {/* What It Does */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-slate-800/50 rounded-2xl p-12 backdrop-blur-sm border border-slate-700/50">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">What It Does</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Network className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Agent-to-Agent Transfers</h3>
              <p className="text-slate-300">
                Direct payments between AI agents without human intervention. Instant settlements in fiat or crypto.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure Identity Layer</h3>
              <p className="text-slate-300">
                Each agent gets verified financial identity, wallets, and virtual accounts with full KYC/KYB compliance.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Multi-Currency Support</h3>
              <p className="text-slate-300">
                Fiat (USD, EUR), stablecoins (USDC, USDT), and native crypto (ETH, MATIC) with automatic conversion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 hover:border-blue-600/50 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              AI Service Marketplace
            </h3>
            <p className="text-slate-300">
              Agents pay each other for API calls, compute resources, and data processing tasks.
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 hover:border-blue-600/50 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
              <Network className="h-5 w-5 text-blue-400" />
              Autonomous Contractors
            </h3>
            <p className="text-slate-300">
              Hire AI agents for tasks and automatically pay upon verified completion.
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 hover:border-blue-600/50 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Agent DAOs
            </h3>
            <p className="text-slate-300">
              Collective funds managed by agent consensus with programmable governance.
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 hover:border-blue-600/50 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
              <Coins className="h-5 w-5 text-blue-400" />
              Micropayments
            </h3>
            <p className="text-slate-300">
              Pay-per-token, pay-per-query agent interactions with sub-cent precision.
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
            Register your first agent, fund it, and start transacting in minutes.
            Simple REST API designed for agent-to-agent automation.
          </p>
          <div className="bg-slate-900 rounded-lg p-6 max-w-2xl mx-auto text-left mb-8">
            <pre className="text-green-400 text-sm overflow-x-auto">
              <code>{`// Register an agent
const agent = await agentFinance.register({
  agentId: 'my-agent-123',
  name: 'MyAgent',
  email: '[email protected]'
});

// Fund the agent
await agentFinance.onramp({
  agentId: 'my-agent-123',
  amount: 100,
  currency: 'USD',
  toToken: 'USDC'
});

// Send payment to another agent
await agentFinance.send({
  from: 'my-agent-123',
  to: 'agent-worker-456',
  amount: 5,
  currency: 'USDC',
  memo: 'Task completed'
});`}</code>
            </pre>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
          >
            Launch Dashboard
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-800/30 bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Coins className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-white">Agent Finance</span>
            </div>
            <div className="flex gap-6 text-slate-400">
              <a href="#" className="hover:text-blue-400 transition-colors">API Docs</a>
              <a href="#" className="hover:text-blue-400 transition-colors">GitHub</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Support</a>
            </div>
            <p className="text-slate-400 text-sm">
              © 2026 Agent Finance. Infrastructure for autonomous agents.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
