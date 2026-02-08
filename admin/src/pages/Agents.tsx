import { useState, useEffect } from 'react';
import { Search, Bot, CheckCircle, XCircle, Eye } from 'lucide-react';
import Layout from '../components/Layout';
import adminAPI from '../api/client';
import type { Agent } from '../types';

interface AgentsProps {
  onLogout: () => void;
}

export default function Agents({ onLogout }: AgentsProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [agents, searchTerm, verifiedFilter]);

  const loadAgents = async () => {
    try {
      const data = await adminAPI.getAllAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAgents = () => {
    let filtered = agents;

    if (verifiedFilter === 'verified') {
      filtered = filtered.filter((a) => a.verified);
    } else if (verifiedFilter === 'unverified') {
      filtered = filtered.filter((a) => !a.verified);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.email.toLowerCase().includes(term) ||
          a.id.toLowerCase().includes(term) ||
          a.userId?.toLowerCase().includes(term)
      );
    }

    setFilteredAgents(filtered);
  };

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-admin-muted">Loading agents...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-admin-text mb-2">Agent Management</h1>
            <p className="text-admin-muted">All agents across the platform</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-admin-text">{agents.length}</p>
            <p className="text-sm text-admin-muted">
              {agents.filter((a) => a.verified).length} verified
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-admin-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, agent ID, or user ID..."
                className="w-full bg-admin-hover border border-admin-border rounded-lg pl-10 pr-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'verified', 'unverified'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setVerifiedFilter(filter)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    verifiedFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-admin-hover text-admin-muted hover:text-admin-text'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-admin-card border border-admin-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-admin-hover border-b border-admin-border">
              <tr>
                <th className="text-left px-6 py-4 text-admin-text font-semibold">Agent</th>
                <th className="text-left px-6 py-4 text-admin-text font-semibold">Owner</th>
                <th className="text-left px-6 py-4 text-admin-text font-semibold">Type</th>
                <th className="text-left px-6 py-4 text-admin-text font-semibold">Verified</th>
                <th className="text-left px-6 py-4 text-admin-text font-semibold">Balance</th>
                <th className="text-left px-6 py-4 text-admin-text font-semibold">Created</th>
                <th className="text-left px-6 py-4 text-admin-text font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {filteredAgents.map((agent) => {
                const totalBalance = agent.accounts.reduce((sum, acc) => sum + acc.balance, 0);
                return (
                  <tr key={agent.id} className="hover:bg-admin-hover transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-admin-text font-medium">{agent.name}</p>
                        <p className="text-sm text-admin-muted">{agent.email}</p>
                        <p className="text-xs text-admin-muted font-mono mt-1">{agent.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-admin-muted text-sm font-mono">{agent.userId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          agent.type === 'business'
                            ? 'bg-purple-600/20 text-purple-400'
                            : 'bg-blue-600/20 text-blue-400'
                        }`}
                      >
                        {agent.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {agent.verified ? (
                        <span className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-yellow-400">
                          <XCircle className="h-4 w-4" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-admin-text font-medium">
                        ${totalBalance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-admin-muted text-sm">
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedAgent(agent)}
                        className="p-2 text-blue-400 hover:bg-admin-hover rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAgents.length === 0 && (
            <div className="text-center py-12 text-admin-muted">No agents found</div>
          )}
        </div>
      </div>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-admin-card border border-admin-border rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-admin-text mb-6">Agent Details</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-admin-muted text-sm mb-1">Agent Name</p>
                  <p className="text-admin-text font-medium">{selectedAgent.name}</p>
                </div>
                <div>
                  <p className="text-admin-muted text-sm mb-1">Email</p>
                  <p className="text-admin-text font-medium">{selectedAgent.email}</p>
                </div>
                <div>
                  <p className="text-admin-muted text-sm mb-1">Agent ID</p>
                  <p className="text-admin-text font-mono text-sm">{selectedAgent.id}</p>
                </div>
                <div>
                  <p className="text-admin-muted text-sm mb-1">Owner User ID</p>
                  <p className="text-admin-text font-mono text-sm">{selectedAgent.userId}</p>
                </div>
                <div>
                  <p className="text-admin-muted text-sm mb-1">Type</p>
                  <p className="text-admin-text font-medium capitalize">{selectedAgent.type}</p>
                </div>
                <div>
                  <p className="text-admin-muted text-sm mb-1">Verified</p>
                  <p className="text-admin-text font-medium">
                    {selectedAgent.verified ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-admin-muted text-sm mb-1">Created</p>
                  <p className="text-admin-text font-medium">
                    {new Date(selectedAgent.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Accounts */}
              <div>
                <h3 className="text-lg font-bold text-admin-text mb-3">Accounts</h3>
                <div className="space-y-2">
                  {selectedAgent.accounts.map((account) => (
                    <div
                      key={account.id}
                      className="bg-admin-hover border border-admin-border rounded-lg p-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-admin-muted text-sm mb-1">Currency</p>
                          <p className="text-admin-text font-medium">{account.currency}</p>
                        </div>
                        <div>
                          <p className="text-admin-muted text-sm mb-1">Balance</p>
                          <p className="text-admin-text font-medium">
                            ${account.balance.toLocaleString()}
                          </p>
                        </div>
                        {account.chain && (
                          <div>
                            <p className="text-admin-muted text-sm mb-1">Chain</p>
                            <p className="text-admin-text font-medium">{account.chain}</p>
                          </div>
                        )}
                        {account.address && (
                          <div className="col-span-2">
                            <p className="text-admin-muted text-sm mb-1">Address</p>
                            <p className="text-admin-text font-mono text-xs break-all">
                              {account.address}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAgent(null)}
                className="px-6 py-2 bg-admin-hover text-admin-text rounded-lg hover:bg-admin-border transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
