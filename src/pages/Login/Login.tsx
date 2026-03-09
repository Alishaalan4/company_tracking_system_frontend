import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { LogIn, Key, Mail, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [isPinMode, setIsPinMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isPinMode ? '/auth/login/pin' : '/auth/login';
      const payload = isPinMode 
        ? { email, pin } 
        : { email, password };

      const response = await api.post(endpoint, payload);
      const { user, token } = response.data;
      
      login(user, token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="mesh-bg"></div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="login-card glass"
      >
        <div className="login-header">
          <div className="logo-icon">
            <ShieldCheck size={32} color="var(--primary)" />
          </div>
          <h1>TrackPulse</h1>
          <p>Smart Attendance & Leave Management</p>
        </div>

        <div className="mode-tabs">
          <button 
            className={`mode-tab ${!isPinMode ? 'active' : ''}`}
            onClick={() => setIsPinMode(false)}
          >
            Password
          </button>
          <button 
            className={`mode-tab ${isPinMode ? 'active' : ''}`}
            onClick={() => setIsPinMode(true)}
          >
            PIN
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          {!isPinMode ? (
            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Key className="input-icon" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
          ) : (
            <div className="input-group">
              <label>Access PIN</label>
              <div className="input-wrapper">
                <ShieldCheck className="input-icon" size={18} />
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="123456" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  required 
                />
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <a href="#">Forgot your {isPinMode ? 'PIN' : 'password'}?</a>
        </div>
      </motion.div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }

        .mesh-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          background-color: var(--bg-main);
          background-image: 
            radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%);
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 3rem;
          text-align: center;
        }

        .login-header {
          margin-bottom: 2.5rem;
        }

        .logo-icon {
          width: 64px;
          height: 64px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .login-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .login-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .mode-tabs {
          display: flex;
          background: rgba(15, 23, 42, 0.4);
          padding: 4px;
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid var(--border-color);
        }

        .mode-tab {
          flex: 1;
          padding: 0.6rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
          background: transparent;
        }

        .mode-tab.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
        }

        .input-wrapper input {
          padding-left: 3rem;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--danger);
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .w-full {
          width: 100%;
        }

        .btn-primary.w-full {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 1rem;
          padding: 0.85rem;
          margin-top: 0.5rem;
        }

        .login-footer {
          margin-top: 2rem;
        }

        .login-footer a {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.85rem;
          transition: color 0.2s ease;
        }

        .login-footer a:hover {
          color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default Login;
