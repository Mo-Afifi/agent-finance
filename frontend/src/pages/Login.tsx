import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Coins, Shield, Zap, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      login(credentialResponse.credential);
      navigate('/dashboard');
    }
  };

  const handleError = () => {
    console.error('Login Failed');
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

          {/* Google Login Button */}
          <div className="flex justify-center mb-8">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
            />
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
