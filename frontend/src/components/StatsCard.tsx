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
    <div className="bg-dark-card rounded-xl p-6 border border-dark-panel shadow-lg hover:shadow-lemon/5 transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-text-tertiary text-sm font-medium uppercase tracking-wide">{title}</span>
        <div className="w-10 h-10 bg-lemon/10 rounded-lg flex items-center justify-center">
          <Icon className="h-5 w-5 text-lemon" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-text-primary mb-1">{value}</div>
          {subtitle && <div className="text-text-tertiary text-sm">{subtitle}</div>}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-success' : 'text-error'}`}>
            {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
