import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import './Auth.css';

function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage('Password reset link sent! Check your email inbox.');
      setEmail('');
    } catch (error) {
      setError(error.message || 'Failed to send reset email. Please try again.');
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Reset Password</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <button className="link-button" onClick={() => onNavigate('login')}>
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
