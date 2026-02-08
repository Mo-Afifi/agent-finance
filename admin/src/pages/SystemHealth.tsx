import { useState, useEffect } from 'react';
import { Activity, Server, Zap, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import adminAPI from '../api/client';
import type { SystemHealth as SystemHealthType } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SystemHealthProps {
  onLogout: () => void;
}

export default function SystemHealth({ onLogout }: SystemHealthProps) {
  const [health, setHealth] = useState<SystemHealthType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadHealth = async () => {
    try {
      const data = await adminAPI.getSystemHealth();
      setHealth(data);
    } catch (error) {
      console.error('Failed to load system health:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock response time data
  const responseTimeData = [
    { time: '00:00', ms: 45 },
    { time: '04:00', ms: 38 },
    { time: '08:00', ms: 52 },
    { time: '12:00', ms: 67 },
    { time: '16:00', ms: 55 },
    { time: '20:00', ms: 42 },
    { time: '24:00', ms: 48 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'offline':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5" />;
      case 'offline':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-admin-muted">Loading system health...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-admin-text mb-2">System Health</h1>
          <p className="text-admin-muted">Real-time monitoring and performance metrics</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="API Uptime"
            value={`${health?.apiUptime || 0}%`}
            icon={Server}
            variant={health?.apiUptime && health.apiUptime > 99 ? 'success' : 'warning'}
          />
          <StatCard
            title="Error Rate"
            value={`${health?.errorRate || 0}%`}
            icon={AlertCircle}
            variant={health?.errorRate && health.errorRate < 1 ? 'success' : 'danger'}
          />
          <StatCard
            title="Avg Response Time"
            value={`${health?.avgResponseTime || 0}ms`}
            icon={Zap}
            variant={health?.avgResponseTime && health.avgResponseTime < 100 ? 'success' : 'warning'}
          />
          <StatCard
            title="Active Connections"
            value={health?.activeConnections || 0}
            icon={Activity}
          />
        </div>

        {/* Service Status */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-admin-text mb-6">Service Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-admin-hover rounded-lg border border-admin-border">
              <div className="flex items-center gap-3">
                <Server className="h-6 w-6 text-blue-400" />
                <div>
                  <p className="text-admin-text font-medium">API Server</p>
                  <p className="text-sm text-admin-muted">Main application backend</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Online</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-admin-hover rounded-lg border border-admin-border">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="text-admin-text font-medium">HIFI API</p>
                  <p className="text-sm text-admin-muted">Payment processing gateway</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 ${getStatusColor(health?.hifiStatus || 'offline')}`}>
                {getStatusIcon(health?.hifiStatus || 'offline')}
                <span className="font-medium capitalize">{health?.hifiStatus || 'Unknown'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-admin-hover rounded-lg border border-admin-border">
              <div className="flex items-center gap-3">
                <Server className="h-6 w-6 text-green-400" />
                <div>
                  <p className="text-admin-text font-medium">Database</p>
                  <p className="text-sm text-admin-muted">PostgreSQL cluster</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Online</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-admin-hover rounded-lg border border-admin-border">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-yellow-400" />
                <div>
                  <p className="text-admin-text font-medium">Cache Layer</p>
                  <p className="text-sm text-admin-muted">Redis cache</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Response Time Chart */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-admin-text mb-6">Response Time (24h)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#16191f',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
              />
              <Line
                type="monotone"
                dataKey="ms"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* System Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-admin-card border border-admin-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-admin-text mb-4">System Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-admin-muted">Node Version</span>
                <span className="text-admin-text font-mono">v18.19.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-admin-muted">Environment</span>
                <span className="text-admin-text font-mono">production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-admin-muted">Region</span>
                <span className="text-admin-text">US-West-2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-admin-muted">Last Deploy</span>
                <span className="text-admin-text">2h ago</span>
              </div>
            </div>
          </div>

          <div className="bg-admin-card border border-admin-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-admin-text mb-4">Performance</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-admin-muted">CPU Usage</span>
                <span className="text-admin-text">34%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-admin-muted">Memory Usage</span>
                <span className="text-admin-text">1.2 GB / 4 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-admin-muted">Disk Usage</span>
                <span className="text-admin-text">18 GB / 100 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-admin-muted">Network I/O</span>
                <span className="text-admin-text">2.4 MB/s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Last Checked */}
        <div className="text-center text-admin-muted text-sm">
          Last updated: {health?.lastChecked ? new Date(health.lastChecked).toLocaleString() : 'Never'}
        </div>
      </div>
    </Layout>
  );
}
