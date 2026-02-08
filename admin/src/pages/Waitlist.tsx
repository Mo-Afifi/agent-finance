import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Users, CheckCircle, XCircle, Clock, Search, Trash2 } from 'lucide-react';

interface WaitlistEntry {
  email: string;
  name?: string;
  signupDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

interface WaitlistStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface WaitlistProps {
  onLogout: () => void;
}

export default function Waitlist({ onLogout }: WaitlistProps) {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<WaitlistStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch waitlist data
  const fetchWaitlist = async () => {
    try {
      setLoading(true);
      const apiKey = sessionStorage.getItem('admin_api_key') || '';
      
      const [entriesRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/waitlist`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }),
        fetch(`${API_BASE_URL}/api/admin/waitlist/stats`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }),
      ]);

      if (!entriesRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch waitlist data');
      }

      const entriesData = await entriesRes.json();
      const statsData = await statsRes.json();

      setEntries(entriesData.data || []);
      setStats(statsData.data || { total: 0, pending: 0, approved: 0, rejected: 0 });
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching waitlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  // Update status
  const updateStatus = async (email: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const apiKey = sessionStorage.getItem('admin_api_key') || '';
      
      const res = await fetch(`${API_BASE_URL}/api/admin/waitlist/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh data
      await fetchWaitlist();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
      console.error('Error updating status:', err);
    }
  };

  // Delete entry
  const deleteEntry = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the waitlist?`)) {
      return;
    }

    try {
      const apiKey = sessionStorage.getItem('admin_api_key') || '';
      
      const res = await fetch(`${API_BASE_URL}/api/admin/waitlist/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete entry');
      }

      // Refresh data
      await fetchWaitlist();
    } catch (err: any) {
      alert(`Error deleting entry: ${err.message}`);
      console.error('Error deleting entry:', err);
    }
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.name && entry.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50', icon: Clock },
      approved: { color: 'bg-green-900/20 text-green-400 border-green-900/50', icon: CheckCircle },
      rejected: { color: 'bg-red-900/20 text-red-400 border-red-900/50', icon: XCircle },
    };
    
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        <Icon className="h-3.5 w-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Layout onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-admin-text mb-2">Waitlist</h1>
          <p className="text-admin-muted">Manage signup requests for OpenClaw Pay</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-admin-surface border border-admin-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-admin-muted text-sm mb-1">Total Signups</p>
                <p className="text-3xl font-bold text-admin-text">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-admin-surface border border-admin-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-admin-muted text-sm mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-admin-surface border border-admin-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-admin-muted text-sm mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-admin-surface border border-admin-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-admin-muted text-sm mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-admin-surface border border-admin-border rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-admin-muted" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-admin-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Waitlist Table */}
        <div className="bg-admin-surface border border-admin-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-admin-muted">Loading waitlist...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-8 text-center text-admin-muted">
              {searchTerm || statusFilter !== 'all' ? 'No entries match your filters' : 'No waitlist signups yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-admin-bg border-b border-admin-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-admin-muted uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-admin-muted uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-admin-muted uppercase tracking-wider">Signup Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-admin-muted uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-admin-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.email} className="hover:bg-admin-hover transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-admin-text">{entry.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-admin-muted">{entry.name || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-admin-muted">{formatDate(entry.signupDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(entry.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {entry.status !== 'approved' && (
                            <button
                              onClick={() => updateStatus(entry.email, 'approved')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-900/20 text-green-400 border border-green-900/50 rounded-md text-xs font-medium hover:bg-green-900/30 transition-colors"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approve
                            </button>
                          )}
                          
                          {entry.status !== 'rejected' && (
                            <button
                              onClick={() => updateStatus(entry.email, 'rejected')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-900/20 text-red-400 border border-red-900/50 rounded-md text-xs font-medium hover:bg-red-900/30 transition-colors"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          )}
                          
                          {entry.status !== 'pending' && (
                            <button
                              onClick={() => updateStatus(entry.email, 'pending')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-900/20 text-yellow-400 border border-yellow-900/50 rounded-md text-xs font-medium hover:bg-yellow-900/30 transition-colors"
                            >
                              <Clock className="h-3.5 w-3.5" />
                              Pending
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteEntry(entry.email)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-admin-hover text-admin-muted border border-admin-border rounded-md text-xs font-medium hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-sm text-admin-muted">
          Showing {filteredEntries.length} of {entries.length} total entries
        </div>
      </div>
    </Layout>
  );
}
