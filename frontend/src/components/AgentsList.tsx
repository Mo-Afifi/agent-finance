import { Agent } from '../api/client';
import { CheckCircle, XCircle, Wallet, CreditCard } from 'lucide-react';

interface AgentsListProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent | null) => void;
}

export default function AgentsList({ agents, selectedAgent, onSelectAgent }: AgentsListProps) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">Registered Agents</h2>
        <p className="text-slate-400 text-sm mt-1">
          {agents.length} agent{agents.length !== 1 ? 's' : ''} registered
        </p>
      </div>
      <div className="divide-y divide-slate-700">
        {agents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400">No agents registered yet.</p>
            <p className="text-slate-500 text-sm mt-2">Create your first agent to get started.</p>
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent.id === selectedAgent?.id ? null : agent)}
              className={`p-4 cursor-pointer transition-colors ${
                selectedAgent?.id === agent.id ? 'bg-slate-700/50' : 'hover:bg-slate-700/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{agent.name}</h3>
                    {agent.verified ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mb-2">ID: {agent.id}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Wallet className="h-4 w-4 text-blue-400" />
                      {agent.wallets.length} wallet{agent.wallets.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <CreditCard className="h-4 w-4 text-blue-400" />
                      {agent.accounts.length} account{agent.accounts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400 mb-1">Balance</div>
                  <div className="text-white font-semibold">
                    ${agent.accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
              
              {selectedAgent?.id === agent.id && (
                <div className="mt-4 pt-4 border-t border-slate-600">
                  {/* Accounts */}
                  {agent.accounts.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Virtual Accounts</h4>
                      <div className="space-y-2">
                        {agent.accounts.map((account) => (
                          <div key={account.id} className="bg-slate-900/50 rounded p-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">{account.currency}</span>
                              <span className="text-white font-medium">
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
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Wallets</h4>
                      <div className="space-y-2">
                        {agent.wallets.map((wallet) => (
                          <div key={wallet.id} className="bg-slate-900/50 rounded p-2 text-sm">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-slate-400 capitalize">{wallet.chain}</span>
                              <div className="text-right">
                                {wallet.balance.map((bal, i) => (
                                  <div key={i} className="text-white font-medium">
                                    {bal.amount.toFixed(4)} {bal.currency}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 font-mono truncate">
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
