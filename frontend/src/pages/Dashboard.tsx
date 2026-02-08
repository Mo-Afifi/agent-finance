import { useState, useEffect } from 'react';
import { 
  Coins, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Activity as ActivityIcon,
  Wallet,
  CreditCard,
  ArrowLeftRight,
  CheckCircle,
  Clock,
  XCircle,
  Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { agentFinanceAPI, Agent, Transaction, Activity } from '../api/client';
import AgentsList from '../components/AgentsList';
import TransactionHistory from '../components/TransactionHistory';
import ActivityFeed from '../components/ActivityFeed';
import CreateAgentModal from '../components/CreateAgentModal';
import StatsCard from '../components/StatsCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    loadData();
    // Poll for updates every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [agentsData, transactionsData, activityData] = await Promise.all([
        agentFinanceAPI.getAgents(),
        agentFinanceAPI.getTransactions({ limit: 50 }),
        agentFinanceAPI.getActivity(),
      ]);
      setAgents(agentsData);
      setTransactions(transactionsData);
      setActivity(activityData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (data: any) => {
    try {
      await agentFinanceAPI.createAgent(data);
      await loadData();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  // Calculate stats
  const totalBalance = agents.reduce((sum, agent) => {
    const agentBalance = agent.accounts.reduce((acc, account) => acc + account.balance, 0);
    return sum + agentBalance;
  }, 0);

  const completedTransactions = transactions.filter(t => t.status === 'completed').length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
  const totalVolume = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">Agent Finance</span>
              </div>
              <span className="text-slate-400">|</span>
              <span className="text-slate-300 font-medium">Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Agent
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Balance"
            value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={Wallet}
            trend="+12.5%"
            trendUp={true}
          />
          <StatsCard
            title="Active Agents"
            value={agents.length.toString()}
            icon={ActivityIcon}
            subtitle={`${agents.filter(a => a.verified).length} verified`}
          />
          <StatsCard
            title="Transactions"
            value={completedTransactions.toString()}
            icon={ArrowLeftRight}
            subtitle={`${pendingTransactions} pending`}
          />
          <StatsCard
            title="Volume (30d)"
            value={`$${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={TrendingUp}
            trend="+8.3%"
            trendUp={true}
          />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Agents */}
          <div className="lg:col-span-2 space-y-6">
            <AgentsList
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
            />
            <TransactionHistory transactions={transactions} />
          </div>

          {/* Right Column - Activity Feed */}
          <div className="lg:col-span-1">
            <ActivityFeed activity={activity} />
          </div>
        </div>
      </main>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateAgent}
        />
      )}
    </div>
  );
}
