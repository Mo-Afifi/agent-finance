import { Activity } from '../api/client';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  CheckCircle 
} from 'lucide-react';

interface ActivityFeedProps {
  activity: Activity[];
}

export default function ActivityFeed({ activity }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'payment_sent':
        return <TrendingUp className="h-4 w-4 text-red-400" />;
      case 'payment_received':
        return <TrendingDown className="h-4 w-4 text-green-400" />;
      case 'wallet_created':
        return <Wallet className="h-4 w-4 text-blue-400" />;
      case 'account_created':
        return <CreditCard className="h-4 w-4 text-blue-400" />;
      case 'verification_completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <CheckCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 sticky top-24">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">Activity Feed</h2>
        <p className="text-slate-400 text-sm mt-1">Real-time updates</p>
      </div>
      <div className="divide-y divide-slate-700 max-h-[700px] overflow-y-auto">
        {activity.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">No recent activity.</p>
          </div>
        ) : (
          activity.map((item) => (
            <div key={item.id} className="p-4 hover:bg-slate-700/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1">{getActivityIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm mb-1">{item.description}</p>
                  <p className="text-slate-500 text-xs">{formatTime(item.timestamp)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
