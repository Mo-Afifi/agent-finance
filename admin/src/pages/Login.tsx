import { useState } from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface LoginProps {
  onLogin: (password: string) => boolean;
}

export default function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (!success) {
      setError('Invalid password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Warning Banner */}
        <div className="bg-red-900/20 border border-red-900/50 rounded-lg px-4 py-3 mb-6">
          <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>INTERNAL USE ONLY - Authorized Personnel Only</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="p-4 bg-admin-hover rounded-full">
              <Shield className="h-12 w-12 text-red-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-admin-text text-center mb-2">
            Admin Dashboard
          </h1>
          <p className="text-admin-muted text-center mb-8">
            OpenClaw Pay Platform Management
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-admin-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-admin-hover border border-admin-border rounded-lg pl-10 pr-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Access Dashboard
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-admin-border">
            <p className="text-xs text-admin-muted text-center">
              All access is logged and monitored. Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
