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
  ExternalLink,
  LogOut,
  User
} from 'lucide-react';
import { agentFinanceAPI, Agent, Transaction, Activity } from '../api/client';
import AgentsList from '../components/AgentsList';
import TransactionHistory from '../components/TransactionHistory';
import ActivityFeed from '../components/ActivityFeed';
import CreateAgentModal from '../components/CreateAgentModal';
import StatsCard from '../components/StatsCard';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
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
      
      // Filter agents by logged-in user
      // TODO: Backend should filter by user, but for now we do client-side filtering
      // In production, add userId to metadata when creating agents and filter on backend
      const userAgents = agentsData.filter(agent => {
        // For now, show all agents. When backend supports user filtering:
        // return agent.metadata?.userId === user?.sub || agent.metadata?.userEmail === user?.email;
        return true; // Remove this line when backend filtering is implemented
      });
      
      setAgents(userAgents);
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
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="border-b border-dark-panel bg-dark-lighter/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-8 w-8 text-lemon" />
                <span className="text-2xl font-bold text-text-primary">OpenClaw Pay</span>
              </div>
              <span className="text-text-tertiary">|</span>
              <span className="text-text-secondary font-medium">Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://smart-agent-cash.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-text-secondary hover:text-lemon transition-colors flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                About
              </a>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-lemon hover:bg-gold text-dark rounded-lg transition-colors font-semibold flex items-center gap-2 shadow-lg shadow-lemon/20"
              >
                <Plus className="h-4 w-4" />
                New Agent
              </button>
              
              {/* User Profile */}
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-dark-panel">
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name}
                    className="h-8 w-8 rounded-full border-2 border-lemon"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-lemon flex items-center justify-center border-2 border-gold">
                    <User className="h-4 w-4 text-dark" />
                  </div>
                )}
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-text-primary">{user?.name}</div>
                  <div className="text-xs text-text-tertiary">{user?.email}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-text-tertiary hover:text-lemon hover:bg-dark-card rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
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
