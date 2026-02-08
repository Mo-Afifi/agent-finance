import { useState, useEffect } from 'react';
import { Save, Key, Settings as SettingsIcon, Zap, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import adminAPI from '../api/client';

interface ConfigurationProps {
  onLogout: () => void;
}

interface Config {
  apiKeys: {
    hifiApiKey: string;
    hifiApiSecret: string;
  };
  rateLimits: {
    perMinute: number;
    perHour: number;
    perDay: number;
  };
  features: {
    newUserSignup: boolean;
    kycRequired: boolean;
    maintenanceMode: boolean;
    webhooksEnabled: boolean;
  };
  system: {
    maxTransactionAmount: number;
    minTransactionAmount: number;
    transactionFeePercent: number;
    autoFlagThreshold: number;
  };
}

export default function Configuration({ onLogout }: ConfigurationProps) {
  const [config, setConfig] = useState<Config>({
    apiKeys: {
      hifiApiKey: '',
      hifiApiSecret: '',
    },
    rateLimits: {
      perMinute: 60,
      perHour: 1000,
      perDay: 10000,
    },
    features: {
      newUserSignup: true,
      kycRequired: true,
      maintenanceMode: false,
      webhooksEnabled: true,
    },
    system: {
      maxTransactionAmount: 100000,
      minTransactionAmount: 1,
      transactionFeePercent: 0.5,
      autoFlagThreshold: 10000,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await adminAPI.getConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateConfig(config);
      alert('Configuration saved successfully');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: keyof Config, key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-admin-muted">Loading configuration...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-admin-text mb-2">Configuration</h1>
            <p className="text-admin-muted">Platform settings and API keys</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* API Keys */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Key className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-admin-text">API Keys</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                HIFI API Key
              </label>
              <input
                type="password"
                value={config.apiKeys.hifiApiKey}
                onChange={(e) => updateConfig('apiKeys', 'hifiApiKey', e.target.value)}
                className="w-full bg-admin-hover border border-admin-border rounded-lg px-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter HIFI API key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                HIFI API Secret
              </label>
              <input
                type="password"
                value={config.apiKeys.hifiApiSecret}
                onChange={(e) => updateConfig('apiKeys', 'hifiApiSecret', e.target.value)}
                className="w-full bg-admin-hover border border-admin-border rounded-lg px-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter HIFI API secret"
              />
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-admin-text">Rate Limits</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Per Minute
              </label>
              <input
                type="number"
                value={config.rateLimits.perMinute}
                onChange={(e) => updateConfig('rateLimits', 'perMinute', parseInt(e.target.value))}
                className="w-full bg-admin-hover border border-admin-border rounded-lg px-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Per Hour
              </label>
              <input
                type="number"
                value={config.rateLimits.perHour}
                onChange={(e) => updateConfig('rateLimits', 'perHour', parseInt(e.target.value))}
                className="w-full bg-admin-hover border border-admin-border rounded-lg px-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Per Day
              </label>
              <input
                type="number"
                value={config.rateLimits.perDay}
                onChange={(e) => updateConfig('rateLimits', 'perDay', parseInt(e.target.value))}
                className="w-full bg-admin-hover border border-admin-border rounded-lg px-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-bold text-admin-text">Feature Flags</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(config.features).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-admin-hover rounded-lg">
                <div>
                  <p className="text-admin-text font-medium">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </p>
                  <p className="text-sm text-admin-muted">
                    {key === 'newUserSignup' && 'Allow new users to register'}
                    {key === 'kycRequired' && 'Require KYC verification for transactions'}
                    {key === 'maintenanceMode' && 'Put platform in maintenance mode'}
                    {key === 'webhooksEnabled' && 'Enable webhook notifications'}
                  </p>
                </div>
                <button
                  onClick={() => updateConfig('features', key, !value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-admin-card border border-admin-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <SettingsIcon className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-admin-text">System Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Max Transaction Amount ($)
              </label>
              <input
                type="number"
                value={config.system.maxTransactionAmount}
                onChange={(e) =>
                  updateConfig('system', 'maxTransactionAmount', parseInt(e.target.value))
                }
                className="w-full bg-admin-hover border border-admin-border rounded-lg px-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Min Transaction Amount ($)
              </label>
              <input
                type="number"
                value={config.system.minTransactionAmount}
                onChange={(e) =>
                  updateConfig('system', 'minTransactionAmount', parseInt(e.target.value))
                }
                className="w-full bg-admin-hover border border-admin-border rounded-lg px-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Transaction Fee (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={config.system.transactionFeePercent}
                onChange={(e) =>
                  updateConfig('system', 'transactionFeePercent', parseFloat(e.target.value))
                }
                className="w-full bg-admin-hover border border-admin-border rounded-lg px-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Auto-Flag Threshold ($)
              </label>
              <input
                type="number"
                value={config.system.autoFlagThreshold}
                onChange={(e) =>
                  updateConfig('system', 'autoFlagThreshold', parseInt(e.target.value))
                }
                className="w-full bg-admin-hover border border-admin-border rounded-lg px-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-admin-muted mt-1">
                Transactions above this amount will be automatically flagged for review
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
