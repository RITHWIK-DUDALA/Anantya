import React, { useState, useEffect } from 'react';
import { CircleCheckIcon, ShieldXIcon } from '@animateicons/react/lucide';
import { SpotlightNavbar } from '../components/SpotlightNavbar';
import Galaxy from '../components/Galaxy';
import Footer from '../components/Footer';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Check if already logged in by pinging the server
  useEffect(() => {
    fetch(`${apiUrl}/api/admin/payments`, { credentials: 'include' })
      .then(r => { if (r.ok) setIsAuthenticated(true); })
      .catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const res = await fetch(`${apiUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Invalid password');
      
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/admin/payments`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments();
    }
  }, [isAuthenticated]);

  const updateStatus = async (regId, status) => {
    let payload = { status };
    if (status === 'rejected') {
      const reason = window.prompt("Enter reason for rejection (this will be shown to the user):");
      if (reason === null) return; // cancelled
      payload.rejectionReason = reason;
    } else {
      const actionName = status === 'verified' ? 'verify' : status;
      if (!window.confirm(`Are you sure you want to ${actionName} this registration?`)) return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/admin/payments/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Update failed');
      
      // Refresh list
      fetchPayments();
    } catch (err) {
      alert(`Failed to ${actionName}: ${err.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <main style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.6 }}><Galaxy /></div>
        <div className="card" style={{ padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', width: '100%', maxWidth: '400px', zIndex: 10, textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <input 
                type="password" 
                placeholder="Enter Admin Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}
              />
            </div>
            {authError && <p style={{ color: 'var(--rose)', marginBottom: '15px' }}>{authError}</p>}
            <button type="submit" className="submit-btn" disabled={authLoading}>
              {authLoading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <SpotlightNavbar items={[{ label: "Home", href: "/" }, { label: "Logout", href: "#" }]} onItemClick={(item) => item.label === "Logout" ? handleLogout() : window.location.href = "/"} />
      </div>

      <main style={{ minHeight: '100vh', background: '#000000', color: '#ffffff', position: 'relative', padding: '120px 20px 60px 20px' }}>
        
        {/* Galaxy Background Effect */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none' }}>
          <Galaxy />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--primary)', letterSpacing: '-1px' }}>Admin Dashboard</h1>
              <p style={{ color: '#aaa', marginTop: '10px' }}>Verify or revoke registrations and payments.</p>
            </div>
            <button onClick={fetchPayments} className="submit-btn" style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)' }}>
              ⟳ Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: '#aaa' }}>Loading registrations...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: 'var(--rose)' }}>{error}</div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Participant</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Token</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Txn ID / UTR</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(reg => (
                    <tr key={reg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s' }}>
                      <td style={{ padding: '20px' }}>
                        <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{reg.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#888' }}>{reg.email} • {reg.phone}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{reg.dept} ({reg.year})</div>
                      </td>
                      <td style={{ padding: '20px', color: '#fff' }}>₹{reg.amount}</td>
                      <td style={{ padding: '20px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--secondary)' }}>
                          {reg.token}
                        </span>
                      </td>
                      <td style={{ padding: '20px', color: '#aaa', fontFamily: 'monospace' }}>
                        {reg.transactionId || reg.utrNumber || 'N/A'}
                      </td>
                      <td style={{ padding: '20px' }}>
                        {reg.status === 'verified' && <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '6px' }}><CircleCheckIcon size={16} /> Verified</span>}
                        {reg.status === 'pending_verification' && <span style={{ color: 'orange', display: 'flex', alignItems: 'center', gap: '6px' }}>⏳ Pending</span>}
                        {reg.status === 'rejected' && <span style={{ color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldXIcon size={16} /> Rejected</span>}
                        {reg.status === 'free' && <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}><CircleCheckIcon size={16} /> Free</span>}
                      </td>
                      <td style={{ padding: '20px', textAlign: 'right' }}>
                        {reg.status === 'pending_verification' && (
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => updateStatus(reg.id, 'verified')}
                              style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.5)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <CircleCheckIcon size={14} /> Verify
                            </button>
                            <button 
                              onClick={() => updateStatus(reg.id, 'rejected')}
                              style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.5)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <ShieldXIcon size={14} /> Revoke
                            </button>
                          </div>
                        )}
                        {reg.status === 'verified' && (
                           <button 
                           onClick={() => updateStatus(reg.id, 'rejected')}
                           style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                         >
                           <ShieldXIcon size={14} /> Revoke
                         </button>
                        )}
                        {reg.status === 'rejected' && (
                           <button 
                           onClick={() => updateStatus(reg.id, 'verified')}
                           style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                         >
                           <CircleCheckIcon size={14} /> Re-instate
                         </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No registrations found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
