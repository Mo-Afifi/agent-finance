import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bot,
  ArrowLeftRight,
  Activity,
  Settings,
  LogOut,
  Shield,
  AlertTriangle,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/users', icon: Users, label: 'Users' },
  { path: '/agents', icon: Bot, label: 'Agents' },
  { path: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { path: '/health', icon: Activity, label: 'System Health' },
  { path: '/config', icon: Settings, label: 'Configuration' },
];

export default function Layout({ children, onLogout }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-admin-bg">
      {/* Warning Banner */}
      <div className="bg-red-900/20 border-b border-red-900/50 px-6 py-2">
        <div className="container mx-auto flex items-center justify-center gap-2 text-red-400 text-sm font-medium">
          <AlertTriangle className="h-4 w-4" />
          INTERNAL USE ONLY - ADMIN DASHBOARD
          <Shield className="h-4 w-4" />
        </div>
      </div>

      <div className="flex h-[calc(100vh-40px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-admin-surface border-r border-admin-border flex flex-col">
          <div className="p-6 border-b border-admin-border">
            <div className="flex items-center gap-2 text-admin-text">
              <Shield className="h-8 w-8 text-red-400" />
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-xs text-admin-muted">OpenClaw Pay</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-admin-muted hover:bg-admin-hover hover:text-admin-text'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-admin-border">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-admin-muted hover:bg-red-900/20 hover:text-red-400 transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
