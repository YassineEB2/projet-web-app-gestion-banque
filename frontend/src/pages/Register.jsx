import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      setError(apiMessage || 'Error during registration. Email might be in use.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto' }} className="glass-card">
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>Create SecureBank Account</h2>
      {error && <div className="error-text" style={{marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}/>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Register Account</button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        <Link to="/login">Already have an account? Login here</Link>
      </div>
    </div>
  );
}
