import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface User {
  email: string;
  name: string;
  picture?: string;
  sub: string; // Google user ID
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'openclaw_pay_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credential: string) => {
    try {
      console.log('🔐 Starting Google OAuth login process...');
      
      // Decode JWT token to get user info
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      console.log('✅ Decoded Google credential payload:', {
        email: payload.email,
        name: payload.name,
        sub: payload.sub,
        email_verified: payload.email_verified,
      });
      
      // Validate email exists and is valid
      if (!payload.email || typeof payload.email !== 'string') {
        throw new Error('Invalid email in Google credential payload');
      }
      
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email)) {
        throw new Error(`Invalid email format: ${payload.email}`);
      }
      
      const userData: User = {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0], // Fallback to email username if no name
        picture: payload.picture,
        sub: payload.sub,
      };

      console.log('👤 User data extracted:', {
        email: userData.email,
        name: userData.name,
        hasGoogleId: !!userData.sub,
      });

      // Register user with backend to get API key BEFORE setting local state
      let apiKey: string | null = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries && !apiKey) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          console.log(`📡 Registering user with backend (attempt ${retryCount + 1}/${maxRetries}):`, apiUrl);
          
          const requestBody = {
            email: userData.email,
            name: userData.name,
            googleId: userData.sub,
          };
          
          console.log('📤 Request body:', requestBody);
          
          const response = await fetch(`${apiUrl}/api/users/register`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          
          console.log(`📥 Backend response status: ${response.status} ${response.statusText}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Backend returned error:', errorText);
            throw new Error(`Backend registration failed: ${response.status} - ${errorText}`);
          }
          
          const result = await response.json();
          console.log('✅ Backend response:', {
            success: result.success,
            hasApiKey: !!result.data?.apiKey,
            userId: result.data?.userId,
          });
          
          if (result.success && result.data?.apiKey) {
            apiKey = result.data.apiKey;
            localStorage.setItem('apiToken', apiKey);
            console.log('🔑 API key stored successfully:', apiKey.substring(0, 20) + '...');
          } else {
            throw new Error('Backend response missing API key');
          }
        } catch (error) {
          retryCount++;
          console.error(`❌ Failed to register with backend (attempt ${retryCount}/${maxRetries}):`, error);
          
          if (retryCount < maxRetries) {
            console.log(`⏳ Retrying in ${retryCount} second(s)...`);
            await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
          } else {
            console.error('❌ Max retries reached. Registration failed.');
            throw new Error(`Failed to register after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
      
      // Only set user state and localStorage after successful backend registration
      if (apiKey) {
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        console.log('✅ Login complete! User authenticated and API key stored.');
      } else {
        throw new Error('Failed to obtain API key from backend');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      // Clear any partial state
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('apiToken');
      throw error; // Re-throw so calling code can handle it
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated: !!user,
          login,
          logout,
          isLoading,
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
