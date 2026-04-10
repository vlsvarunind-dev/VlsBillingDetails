import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import './Auth.css';

function Login({ onNavigate }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if input is email or phone
      const isEmail = phone.includes('@');
      
      let loginData;
      if (isEmail) {
        // Login with email
        loginData = {
          email: phone.trim(),
          password: password,
        };
      } else {
        // Login with phone
        let formattedPhone = phone.trim();
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+91' + formattedPhone;
        }
        loginData = {
          phone: formattedPhone,
          password: password,
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword(loginData);

      if (error) throw error;

      console.log('Login successful:', data);
    } catch (error) {
      setError(error.message || 'Failed to login. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>VLS Billing Login</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="phone">Phone Number or Email</label>
            <input
              type="text"
              id="phone"
              placeholder="Enter phone or email"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <small>Use phone (9876543210) or email</small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <button className="link-button" onClick={() => onNavigate('forgot')}>
              Forgot Password?
            </button>
          </p>
          <p>
            Don't have an account?{' '}
            <button className="link-button" onClick={() => onNavigate('signup')}>
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
