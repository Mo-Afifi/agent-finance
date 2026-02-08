import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Eye, Ban, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import adminAPI from '../api/client';
import type { User } from '../types';

interface UsersProps {
  onLogout: () => void;
}

export default function Users({ onLogout }: UsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(term) ||
          u.name.toLowerCase().includes(term) ||
          u.id.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    try {
      await adminAPI.suspendUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await adminAPI.activateUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Failed to activate user:', error);
    }
  };

  const getKYCBadge = (status: string) => {
    const badges = {
      verified: 'bg-green-600/20 text-green-400',
      pending: 'bg-yellow-600/20 text-yellow-400',
      rejected: 'bg-red-600/20 text-red-400',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-admin-muted">Loading users...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-admin-text mb-2">User Management</h1>
            <p className="text-admin-muted">Manage platform users and permissions</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-admin-text">{users.length}</p>
            <p className="text-sm text-admin-muted">Total Users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-admin-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email, name, or ID..."
                className="w-full bg-admin-hover border border-admin-border rounded-lg pl-10 pr-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'suspended'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-admin-hover text-admin-muted hover:text-admin-text'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-admin-card border border-admin-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-admin-hover border-b border-admin-border">
              <tr>
                <th className="text-left px-6 py-4 text-admin-text font-semibold">User</th>
                <th className="text-left px-6 py-4 text-admin-text font-semibold">Agents</th>
                <th className="text-left px-6 py-4 text-admin-text font-semibold">Balance</th>
                <th className="text-left px-6 py-4 text-admin-text font-semibold">KYC</th>
                <th className="text-left px-6 py-4 text-admin-text font-semibold">Status</th>
                <th className="text-left px-6 py-4 text-admin-text font-semibold">Joined</th>
                <th className="text-left px-6 py-4 text-admin-text font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-admin-hover transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-admin-text font-medium">{user.name}</p>
                      <p className="text-sm text-admin-muted">{user.email}</p>
                      <p className="text-xs text-admin-muted font-mono mt-1">{user.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-admin-text font-medium">{user.agentCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-admin-text font-medium">
                      ${user.totalBalance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getKYCBadge(user.kycStatus)}`}>
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.status === 'active' ? (
                      <span className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-red-400">
                        <Ban className="h-4 w-4" />
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-admin-muted text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-blue-400 hover:bg-admin-hover rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleSuspendUser(user.id)}
                          className="p-2 text-red-400 hover:bg-admin-hover rounded-lg transition-colors"
                          title="Suspend User"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user.id)}
                          className="p-2 text-green-400 hover:bg-admin-hover rounded-lg transition-colors"
                          title="Activate User"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-admin-muted">No users found</div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-admin-card border border-admin-border rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-admin-text mb-6">User Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-admin-muted text-sm mb-1">Name</p>
                  <p className="text-admin-text font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-admin-muted text-sm mb-1">Email</p>
                  <p className="text-admin-text font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-admin-muted text-sm mb-1">User ID</p>
                  <p className="text-admin-text font-mono text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-admin-muted text-sm mb-1">Status</p>
                  <p className="text-admin-text font-medium">{selectedUser.status}</p>
                </div>
                <div>
                  <p className="text-admin-muted text-sm mb-1">KYC Status</p>
                  <p className="text-admin-text font-medium">{selectedUser.kycStatus}</p>
                </div>
                <div>
                  <p className="text-admin-muted text-sm mb-1">Total Balance</p>
                  <p className="text-admin-text font-medium">
                    ${selectedUser.totalBalance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-admin-muted text-sm mb-1">Agents</p>
                  <p className="text-admin-text font-medium">{selectedUser.agentCount}</p>
                </div>
                <div>
                  <p className="text-admin-muted text-sm mb-1">Created At</p>
                  <p className="text-admin-text font-medium">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-6 py-2 bg-admin-hover text-admin-text rounded-lg hover:bg-admin-border transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
