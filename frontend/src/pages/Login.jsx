import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      setError(apiMessage || 'Invalid credentials');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto' }} className="glass-card">
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>Login to SecureBank</h2>
      {error && <div className="error-text" style={{marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Login</button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        <Link to="/register">Don't have an account? Register</Link>
      </div>
    </div>
  );
}
