import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Coins, Shield, Zap, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      setError(null);
      setIsLoggingIn(true);
      
      try {
        console.log('🚀 Processing Google login...');
        await login(credentialResponse.credential);
        console.log('✅ Login successful, redirecting to dashboard...');
        navigate('/dashboard');
      } catch (err) {
        console.error('❌ Login error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
        setError(errorMessage);
        setIsLoggingIn(false);
      }
    }
  };

  const handleError = () => {
    console.error('❌ Google OAuth Login Failed');
    setError('Google authentication failed. Please try again.');
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Coins className="h-12 w-12 text-lemon" />
            <span className="text-4xl font-bold text-text-primary">OpenClaw Pay</span>
          </div>
          <p className="text-text-secondary text-lg">
            AI Agent Financial Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-dark-card rounded-xl shadow-2xl shadow-lemon/10 p-8 border border-dark-panel">
          <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">
            Welcome Back
          </h2>
          <p className="text-text-tertiary text-center mb-8">
            Sign in to manage your AI agents and finances
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-300 text-sm font-medium">Login Error</p>
                <p className="text-red-200 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Google Login Button */}
          <div className="flex justify-center mb-8">
            {isLoggingIn ? (
              <div className="flex items-center space-x-3 text-text-secondary">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lemon"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
              />
            )}
          </div>

          {/* Features */}
          <div className="space-y-4 border-t border-dark-panel pt-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-lemon mt-0.5" />
              <div>
                <h3 className="text-text-primary font-medium text-sm">Secure Authentication</h3>
                <p className="text-text-tertiary text-xs">Protected with Google OAuth 2.0</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Zap className="h-5 w-5 text-lemon mt-0.5" />
              <div>
                <h3 className="text-text-primary font-medium text-sm">Real-time Updates</h3>
                <p className="text-text-tertiary text-xs">Monitor your agents in real-time</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-lemon mt-0.5" />
              <div>
                <h3 className="text-text-primary font-medium text-sm">Your Data Only</h3>
                <p className="text-text-tertiary text-xs">See only agents you own</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-sm mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
