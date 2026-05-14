import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  // Forms state
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [transferTarget, setTransferTarget] = useState('');
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const uRes = await api.get('/user');
      setUser(uRes.data);
      const accRes = await api.get('/accounts');
      setAccounts(accRes.data);
      const trxRes = await api.get('/transactions/history');
      setTransactions(trxRes.data);
      if (accRes.data.length > 0 && (!selectedAccountId || !accRes.data.find(a => a.id == selectedAccountId))) {
        setSelectedAccountId(accRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
        await api.post('/logout');
    } catch(e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const createAccount = async () => {
    try {
      await api.post('/accounts');
      await fetchData();
      showMessage('Account created successfully', 'success');
    } catch {
      showMessage('Failed to create account', 'error');
    }
  };

  const showMessage = (text, type) => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage({ text: '', type: '' }), 5000);
  };

  const handleTransaction = async (type) => {
    if (!amount || isNaN(amount) || amount <= 0) {
      showMessage('Please enter a valid amount', 'error');
      return;
    }
    
    if (!selectedAccountId) {
      showMessage('Select an account first', 'error');
      return;
    }

    try {
      if (type === 'transfer') {
        if (!transferTarget) {
            showMessage('Provide a target account number', 'error');
            return;
        }
        await api.post('/transactions/transfer', {
          from_account_id: selectedAccountId,
          to_account_number: transferTarget,
          amount: parseFloat(amount)
        });
        setTransferTarget('');
      } else {
        await api.post(`/transactions/${type}`, {
          account_id: selectedAccountId,
          amount: parseFloat(amount)
        });
      }
      setAmount('');
      await fetchData();
      showMessage(`Successful ${type}`, 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || `Failed to ${type}`, 'error');
    }
  };

  if (!user) return <div style={{textAlign: 'center', marginTop: '100px', fontSize: '1.2rem', color: 'var(--primary-color)'}}>Loading SecureBank dashboard...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Welcome back, <span style={{color: 'var(--primary-color)'}}>{user.name}</span></h2>
        <button onClick={handleLogout} className="btn btn-outline">Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Accounts Column */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Your Accounts</h3>
            <button onClick={createAccount} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>+ New Account</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {accounts.length === 0 ? (
              <p style={{color: 'var(--text-muted)'}}>No accounts yet. Create one to get started.</p>
            ) : accounts.map(acc => (
              <div key={acc.id} className="glass-card" style={{ padding: '1.5rem', background: selectedAccountId == acc.id ? '#f0f3ff' : 'var(--card-bg)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Account Number</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', letterSpacing: '2px' }}>{acc.account_number}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Available Balance</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>${parseFloat(acc.balance).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Operations Column */}
        {accounts.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Quick Operations</h3>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              {actionMessage.text && (
                <div className={actionMessage.type === 'error' ? 'error-text' : 'success-text'} style={{marginBottom: '1rem', fontWeight: '500'}}>
                  {actionMessage.text}
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Select Account to operate from</label>
                <select className="form-input" value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)}>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.account_number} (${parseFloat(acc.balance).toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{marginTop: '1.5rem'}}>
                <label className="form-label">Amount ($)</label>
                <input className="form-input" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button onClick={() => handleTransaction('deposit')} className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--success)', color: 'var(--success)' }}>Deposit</button>
                <button onClick={() => handleTransaction('withdraw')} className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }}>Withdraw</button>
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color)', margin: '1.5rem 0' }} />

              <div className="form-group">
                <label className="form-label">Transfer To (Destination Account #)</label>
                <input className="form-input" type="text" value={transferTarget} onChange={e => setTransferTarget(e.target.value)} placeholder="e.g. ABC123XYZ" />
              </div>
              <button onClick={() => handleTransaction('transfer')} className="btn btn-primary" style={{ width: '100%' }}>Transfer Funds</button>

            </div>
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <div style={{ marginTop: '3rem', paddingBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Transaction History</h3>
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem', fontWeight: '500' }}>Date</th>
                    <th style={{ padding: '1rem', fontWeight: '500' }}>Account ID</th>
                    <th style={{ padding: '1rem', fontWeight: '500' }}>Type</th>
                    <th style={{ padding: '1rem', fontWeight: '500' }}>Reference</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '500' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{new Date(t.created_at).toLocaleString()}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t.account_id}</td>
                      <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                        <span style={{ 
                          padding: '0.3rem 0.8rem', 
                          borderRadius: '20px', 
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: t.type === 'deposit' ? 'rgba(16, 185, 129, 0.1)' : t.type === 'withdrawal' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                          color: t.type === 'deposit' ? 'var(--success)' : t.type === 'withdrawal' ? 'var(--danger)' : 'var(--primary-color)'
                        }}>
                          {t.type}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {t.reference_account ? t.reference_account.account_number : '-'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700' }}>
                        ${parseFloat(t.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
