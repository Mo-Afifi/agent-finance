import { Transaction } from '../api/client';
import { ArrowRight, CheckCircle, Clock, XCircle } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-lemon" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-error" />;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'pending':
        return 'text-lemon';
      case 'failed':
        return 'text-error';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-dark-card rounded-xl border border-dark-panel shadow-lg">
      <div className="p-6 border-b border-dark-panel">
        <h2 className="text-xl font-bold text-text-primary">Transaction History</h2>
        <p className="text-text-tertiary text-sm mt-1">
          Recent agent-to-agent transfers
        </p>
      </div>
      <div className="divide-y divide-dark-panel max-h-[600px] overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-tertiary">No transactions yet.</p>
            <p className="text-text-muted text-sm mt-2">Transactions will appear here.</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="p-4 hover:bg-dark-panel/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`flex items-center gap-1 ${getStatusColor(tx.status)}`}>
                    {getStatusIcon(tx.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span className="text-text-primary font-medium truncate max-w-[150px]">
                        {tx.fromAgent}
                      </span>
                      <ArrowRight className="h-3 w-3 text-text-muted flex-shrink-0" />
                      <span className="text-text-primary font-medium truncate max-w-[150px]">
                        {tx.toAgent}
                      </span>
                    </div>
                    {tx.memo && (
                      <p className="text-text-tertiary text-xs">{tx.memo}</p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lemon font-bold">
                    {tx.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} {tx.currency}
                  </div>
                  <div className="text-text-muted text-xs mt-1">
                    {formatDate(tx.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted font-mono">{tx.id}</span>
                <span className={`capitalize font-medium ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
