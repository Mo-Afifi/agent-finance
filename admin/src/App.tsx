import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Agents from './pages/Agents';
import Transactions from './pages/Transactions';
import SystemHealth from './pages/SystemHealth';
import Configuration from './pages/Configuration';
import Waitlist from './pages/Waitlist';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const auth = sessionStorage.getItem('admin_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (password: string) => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
      sessionStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard onLogout={handleLogout} />} />
        <Route path="/users" element={<Users onLogout={handleLogout} />} />
        <Route path="/agents" element={<Agents onLogout={handleLogout} />} />
        <Route path="/transactions" element={<Transactions onLogout={handleLogout} />} />
        <Route path="/waitlist" element={<Waitlist onLogout={handleLogout} />} />
        <Route path="/health" element={<SystemHealth onLogout={handleLogout} />} />
        <Route path="/config" element={<Configuration onLogout={handleLogout} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
