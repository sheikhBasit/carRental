import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ResetPasswordScreen = () => {
  const navigate = useNavigate();
  const { token } = useParams(); // Get token from URL params

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password) {
      alert('Error: Please enter a new password.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://car-rental-backend-black.vercel.app/users/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Success: ' + data.message);
        navigate('/auth/login'); // Navigate to login screen
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Error: Failed to reset password. Please try again later.',error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Reset Password</h1>
      <p style={styles.subtitle}>Enter your new password</p>

      <input
        type="password"
        style={styles.input}
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        style={[styles.button, loading && { opacity: 0.7 }]}
        onClick={handleResetPassword}
        disabled={loading}
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>

      <button
        style={styles.backToLogin}
        onClick={() => navigate('/auth/login')}
      >
        Back to Login
      </button>
    </div>
  );
};

export default ResetPasswordScreen;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: '20px',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    maxWidth: '300px',
    height: '50px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '0 15px',
    backgroundColor: '#fff',
    fontSize: '16px',
    marginBottom: '15px',
  },
  button: {
    width: '100%',
    maxWidth: '300px',
    height: '50px',
    backgroundColor: '#003366',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  backToLogin: {
    marginTop: '15px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#003366',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};