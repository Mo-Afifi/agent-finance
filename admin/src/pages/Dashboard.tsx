import { useState, useEffect } from 'react';
import { Users, Bot, TrendingUp, DollarSign, UserCheck, Activity } from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import adminAPI from '../api/client';
import type { PlatformStats, ActivityLog } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        adminAPI.getPlatformStats(),
        adminAPI.getActivityLogs(20),
      ]);
      setStats(statsData);
      setActivity(activityData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data - replace with real data from API
  const chartData = [
    { date: '02/01', volume: 45000, users: 120 },
    { date: '02/02', volume: 52000, users: 135 },
    { date: '02/03', volume: 48000, users: 142 },
    { date: '02/04', volume: 61000, users: 156 },
    { date: '02/05', volume: 55000, users: 168 },
    { date: '02/06', volume: 67000, users: 175 },
    { date: '02/07', volume: 71000, users: 189 },
    { date: '02/08', volume: 78000, users: 203 },
  ];

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-admin-muted">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-admin-text mb-2">Platform Overview</h1>
          <p className="text-admin-muted">Real-time analytics and system metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            trend="+12.5%"
            trendUp={true}
            subtitle="vs last month"
          />
          <StatCard
            title="Total Agents"
            value={stats?.totalAgents || 0}
            icon={Bot}
            trend="+8.3%"
            trendUp={true}
            subtitle="active agents"
          />
          <StatCard
            title="Total Value Locked"
            value={`$${(stats?.tvl || 0).toLocaleString()}`}
            icon={DollarSign}
            trend="+15.2%"
            trendUp={true}
            variant="success"
          />
          <StatCard
            title="24h Volume"
            value={`$${(stats?.totalVolume.last24h || 0).toLocaleString()}`}
            icon={TrendingUp}
            subtitle="last 24 hours"
          />
          <StatCard
            title="Active Users (DAU)"
            value={stats?.activeUsers.dau || 0}
            icon={UserCheck}
            subtitle={`MAU: ${stats?.activeUsers.mau || 0}`}
          />
          <StatCard
            title="30d Revenue"
            value={`$${(stats?.revenue.last30d || 0).toLocaleString()}`}
            icon={Activity}
            trend="+22.1%"
            trendUp={true}
            variant="success"
          />
        </div>

        {/* Volume Chart */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-admin-text mb-6">Transaction Volume (7 days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#16191f',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorVolume)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-admin-text mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {activity.length === 0 ? (
              <p className="text-admin-muted text-center py-8">No recent activity</p>
            ) : (
              activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-4 bg-admin-hover rounded-lg border border-admin-border"
                >
                  <div className="flex-1">
                    <p className="text-admin-text font-medium">{item.description}</p>
                    <p className="text-sm text-admin-muted mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded-full">
                    {item.type.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-admin-card border border-admin-border rounded-lg p-4">
            <p className="text-admin-muted text-sm mb-1">All Time Volume</p>
            <p className="text-2xl font-bold text-admin-text">
              ${(stats?.totalVolume.allTime || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-admin-card border border-admin-border rounded-lg p-4">
            <p className="text-admin-muted text-sm mb-1">30d Volume</p>
            <p className="text-2xl font-bold text-admin-text">
              ${(stats?.totalVolume.last30d || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-admin-card border border-admin-border rounded-lg p-4">
            <p className="text-admin-muted text-sm mb-1">7d Volume</p>
            <p className="text-2xl font-bold text-admin-text">
              ${(stats?.totalVolume.last7d || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-admin-card border border-admin-border rounded-lg p-4">
            <p className="text-admin-muted text-sm mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-400">
              ${(stats?.revenue.total || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
