import { Agent } from '../api/client';
import { CheckCircle, XCircle, Wallet, CreditCard, Trash2 } from 'lucide-react';

interface AgentsListProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent | null) => void;
  onDeleteAgent?: (agentId: string, agentName: string) => void;
}

export default function AgentsList({ agents, selectedAgent, onSelectAgent, onDeleteAgent }: AgentsListProps) {
  const getChainColor = (chain: string) => {
    switch (chain.toUpperCase()) {
      case 'ETHEREUM':
        return 'text-blue-400 border-blue-400/30';
      case 'POLYGON':
        return 'text-purple-400 border-purple-400/30';
      case 'BASE':
        return 'text-cyan-400 border-cyan-400/30';
      default:
        return 'text-text-tertiary border-dark-panel';
    }
  };

  return (
    <div className="bg-dark-card rounded-xl border border-dark-panel shadow-lg">
      <div className="p-6 border-b border-dark-panel">
        <h2 className="text-xl font-bold text-text-primary">Registered Agents</h2>
        <p className="text-text-tertiary text-sm mt-1">
          {agents.length} agent{agents.length !== 1 ? 's' : ''} registered
        </p>
      </div>
      <div className="divide-y divide-dark-panel">
        {agents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-tertiary">No agents registered yet.</p>
            <p className="text-text-muted text-sm mt-2">Create your first agent to get started.</p>
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent.id === selectedAgent?.id ? null : agent)}
              className={`p-4 cursor-pointer transition-all ${
                selectedAgent?.id === agent.id ? 'bg-lemon/5 border-l-2 border-lemon' : 'hover:bg-dark-panel/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-text-primary font-semibold">{agent.name}</h3>
                    {agent.verified ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-text-muted" />
                    )}
                  </div>
                  <p className="text-text-tertiary text-sm mb-2">ID: {agent.id}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-text-secondary">
                      <Wallet className="h-4 w-4 text-lemon" />
                      {agent.wallets.length} wallet{agent.wallets.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1 text-text-secondary">
                      <CreditCard className="h-4 w-4 text-lemon" />
                      {agent.accounts.length} account{agent.accounts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="text-sm text-text-tertiary">Balance</div>
                  <div className="text-lemon font-bold text-lg">
                    ${agent.accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  {onDeleteAgent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAgent(agent.id, agent.name);
                      }}
                      className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                      title="Delete agent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {selectedAgent?.id === agent.id && (
                <div className="mt-4 pt-4 border-t border-dark-panel">
                  {/* Accounts */}
                  {agent.accounts.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-text-secondary mb-2">Virtual Accounts</h4>
                      <div className="space-y-2">
                        {agent.accounts.map((account) => (
                          <div key={account.id} className="bg-dark/50 rounded p-2 text-sm border border-dark-panel">
                            <div className="flex justify-between">
                              <span className="text-text-tertiary">{account.currency}</span>
                              <span className="text-text-primary font-medium">
                                ${account.balance.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Wallets */}
                  {agent.wallets.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-text-secondary mb-2">Blockchain Wallets</h4>
                      <div className="space-y-3">
                        {agent.wallets.map((wallet, idx) => (
                          <div 
                            key={`${wallet.chain}-${idx}`} 
                            className={`bg-dark/50 rounded-lg p-3 border ${getChainColor(wallet.chain)} transition-all hover:bg-dark/70`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`px-2 py-1 rounded text-xs font-semibold ${getChainColor(wallet.chain)} bg-dark`}>
                                  {wallet.chain}
                                </div>
                                {wallet.balance > 0 && (
                                  <span className="text-lemon font-medium text-sm">
                                    ${wallet.balance.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-text-muted font-mono break-all">
                              {wallet.address}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
