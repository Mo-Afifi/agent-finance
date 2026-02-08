import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  subtitle,
  variant = 'default',
}: StatCardProps) {
  const variantColors = {
    default: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
  };

  return (
    <div className="bg-admin-card border border-admin-border rounded-lg p-6 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-admin-muted text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-admin-text">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-admin-hover ${variantColors[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {(trend || subtitle) && (
        <div className="flex items-center gap-2 text-sm">
          {trend && (
            <span
              className={`font-medium ${
                trendUp ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && <span className="text-admin-muted">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
