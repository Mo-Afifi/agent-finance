import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
}

export default function StatsCard({ title, value, icon: Icon, trend, trendUp, subtitle }: StatsCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-white mb-1">{value}</div>
          {subtitle && <div className="text-slate-400 text-sm">{subtitle}</div>}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
