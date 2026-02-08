import { useState, useEffect } from 'react';
import { Search, Download, Flag, CheckCircle, Clock, XCircle, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import adminAPI from '../api/client';
import type { Transaction } from '../types';

interface TransactionsProps {
  onLogout: () => void;
}

export default function Transactions({ onLogout }: TransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter, showFlaggedOnly]);

  const loadTransactions = async () => {
    try {
      const data = await adminAPI.getAllTransactions({ limit: 500 });
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (showFlaggedOnly) {
      filtered = filtered.filter((t) => t.flagged);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.id.toLowerCase().includes(term) ||
          t.from.toLowerCase().includes(term) ||
          t.to.toLowerCase().includes(term) ||
          t.memo?.toLowerCase().includes(term)
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleFlagTransaction = async (transactionId: string) => {
    try {
      await adminAPI.flagTransaction(transactionId);
      await loadTransactions();
    } catch (error) {
      console.error('Failed to flag transaction:', error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await adminAPI.exportTransactions({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export transactions:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600/20 text-green-400';
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-400';
      case 'failed':
        return 'bg-red-600/20 text-red-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-admin-muted">Loading transactions...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-admin-text mb-2">Transaction Monitoring</h1>
            <p className="text-admin-muted">All platform transactions</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-admin-card border border-admin-border rounded-lg p-4">
            <p className="text-admin-muted text-sm mb-1">Total</p>
            <p className="text-2xl font-bold text-admin-text">{transactions.length}</p>
          </div>
          <div className="bg-admin-card border border-admin-border rounded-lg p-4">
            <p className="text-admin-muted text-sm mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-400">
              {transactions.filter((t) => t.status === 'completed').length}
            </p>
          </div>
          <div className="bg-admin-card border border-admin-border rounded-lg p-4">
            <p className="text-admin-muted text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">
              {transactions.filter((t) => t.status === 'pending').length}
            </p>
          </div>
          <div className="bg-admin-card border border-admin-border rounded-lg p-4">
            <p className="text-admin-muted text-sm mb-1">Flagged</p>
            <p className="text-2xl font-bold text-red-400">
              {transactions.filter((t) => t.flagged).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-admin-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, from, to, memo..."
                className="w-full bg-admin-hover border border-admin-border rounded-lg pl-10 pr-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'completed', 'pending', 'failed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 px-3 py-3 rounded-lg font-medium text-sm transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-admin-hover text-admin-muted hover:text-admin-text'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                showFlaggedOnly
                  ? 'bg-red-600 text-white'
                  : 'bg-admin-hover text-admin-muted hover:text-admin-text'
              }`}
            >
              <Flag className="h-4 w-4" />
              Flagged Only
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-admin-card border border-admin-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-admin-hover border-b border-admin-border">
                <tr>
                  <th className="text-left px-6 py-4 text-admin-text font-semibold">Transaction</th>
                  <th className="text-left px-6 py-4 text-admin-text font-semibold">From</th>
                  <th className="text-left px-6 py-4 text-admin-text font-semibold">To</th>
                  <th className="text-left px-6 py-4 text-admin-text font-semibold">Amount</th>
                  <th className="text-left px-6 py-4 text-admin-text font-semibold">Status</th>
                  <th className="text-left px-6 py-4 text-admin-text font-semibold">Timestamp</th>
                  <th className="text-left px-6 py-4 text-admin-text font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-admin-hover transition-colors ${
                      tx.flagged ? 'bg-red-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-admin-text font-mono text-sm">{tx.id}</p>
                        {tx.memo && (
                          <p className="text-xs text-admin-muted mt-1">{tx.memo}</p>
                        )}
                        {tx.flagged && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-red-600/20 text-red-400 text-xs font-medium rounded">
                            <Flag className="h-3 w-3" />
                            Flagged
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-admin-text font-mono text-sm">{tx.from}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-admin-text font-mono text-sm">{tx.to}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-admin-text font-medium">
                          ${tx.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-admin-muted">{tx.currency}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-admin-muted text-sm">
                        {new Date(tx.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {!tx.flagged && (
                        <button
                          onClick={() => handleFlagTransaction(tx.id)}
                          className="p-2 text-red-400 hover:bg-admin-hover rounded-lg transition-colors"
                          title="Flag as Suspicious"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-admin-muted">No transactions found</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
