import React, { useState, useEffect } from 'react';
import { CircleCheckIcon, ShieldXIcon } from '@animateicons/react/lucide';
import { SpotlightNavbar } from '../components/SpotlightNavbar';
import Galaxy from '../components/Galaxy';
import Footer from '../components/Footer';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'flagged'
  const [flagged, setFlagged] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
        body: JSON.stringify({ password, name })
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

  const fetchPayments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [paymentsRes, flaggedRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/payments`, { credentials: 'include' }),
        fetch(`${apiUrl}/api/admin/payments/flagged`, { credentials: 'include' }),
      ]);
      if (!paymentsRes.ok) throw new Error('Failed to fetch data');
      const [paymentsData, flaggedData] = await Promise.all([
        paymentsRes.json(),
        flaggedRes.ok ? flaggedRes.json() : Promise.resolve([]),
      ]);
      setPayments(paymentsData);
      setFlagged(flaggedData);
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments();
    }
  }, [isAuthenticated]);

  const updateStatus = async (regId, action) => {
    let payload = { action, regId };
    if (action === 'reject') {
      const reason = window.prompt("Enter reason for rejection (this will be shown to the user):");
      if (reason === null) return; // cancelled
      if (!reason.trim()) { alert("Reason is required."); return; }
      payload.rejectedReason = reason;
    } else {
      if (!window.confirm(`Are you sure you want to verify this registration?`)) return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/admin/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Update failed');
      }

      // Silent refresh — no loading spinner
      fetchPayments(true);
    } catch (err) {
      alert(`Failed: ${err.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <main style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.6 }}><Galaxy /></div>
        <div className="card" style={{ padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', width: '100%', maxWidth: '400px', zIndex: 10, textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="Enter Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}
              />
              <input
                type="password"
                placeholder="Enter Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}
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

  // C-1: Call the server to revoke the JWT before clearing UI state.
  // The previous version only removed a localStorage key that was never set,
  // leaving the httpOnly cookie (and the JWT inside it) fully valid for 12h.
  const handleLogout = async () => {
    try {
      await fetch(`${apiUrl}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include', // sends the httpOnly admin_token cookie
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setIsAuthenticated(false); // always clear UI state, even if the request fails
    }
  };

  // Determine which list to show
  const displayList = filter === 'flagged' ? flagged : filter === 'pending'
    ? payments.filter(p => p.status === 'pending_verification')
    : payments;

  // Build a Set of flagged IDs for badge display in the main list
  const flaggedIds = new Set(flagged.map(f => f.id));

  const StatusBadge = ({ reg }) => {
    if (reg.status === 'verified') return <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '6px' }}><CircleCheckIcon size={16} /> Verified</span>;
    if (reg.status === 'pending_verification') return <span style={{ color: 'orange', display: 'flex', alignItems: 'center', gap: '6px' }}>Pending</span>;
    if (reg.status === 'rejected') return <span style={{ color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldXIcon size={16} /> Rejected</span>;
    if (reg.status === 'free') return <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}><CircleCheckIcon size={16} /> Free</span>;
    return null;
  };

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <SpotlightNavbar items={[{ label: "Home", href: "/" }, { label: "Volunteers", href: "/admin/volunteers" }, { label: "Logout", href: "#" }]} onItemClick={(item) => item.label === "Logout" ? handleLogout() : window.location.href = item.href} />
      </div>

      <main style={{ minHeight: '100vh', background: '#000000', color: '#ffffff', position: 'relative', padding: '120px 20px 60px 20px' }}>

        {/* Galaxy Background Effect */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none' }}>
          <Galaxy />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--primary)', letterSpacing: '-1px' }}>Admin Dashboard</h1>
              <p style={{ color: '#aaa', marginTop: '10px' }}>Verify or revoke registrations and payments.</p>
            </div>
            <button onClick={() => fetchPayments()} className="submit-btn" style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)' }}>
              Refresh
            </button>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: `All (${payments.length})` },
              { key: 'pending', label: `Pending (${payments.filter(p => p.status === 'pending_verification').length})` },
              { key: 'flagged', label: `Flagged / Duplicate TXN (${flagged.length})`, warn: flagged.length > 0 },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: filter === tab.key
                    ? `1px solid ${tab.warn ? '#f59e0b' : 'var(--primary)'}`
                    : '1px solid rgba(255,255,255,0.1)',
                  background: filter === tab.key
                    ? tab.warn ? 'rgba(245,158,11,0.15)' : 'rgba(183,139,39,0.15)'
                    : 'transparent',
                  color: filter === tab.key
                    ? tab.warn ? '#f59e0b' : 'var(--primary)'
                    : '#888',
                  cursor: 'pointer',
                  fontWeight: filter === tab.key ? 700 : 400,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: '#aaa' }}>Loading registrations...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: 'var(--rose)' }}>{error}</div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', overflow: 'hidden', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Participant</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Submitted At</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Student ID</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Token</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Txn ID / UTR</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayList.map(reg => (
                    <tr key={reg.id} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      transition: 'background 0.3s',
                      background: flaggedIds.has(reg.id) ? 'rgba(245,158,11,0.04)' : 'transparent',
                    }}>
                      <td style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, color: '#fff' }}>{reg.name}</span>
                          {flaggedIds.has(reg.id) && (
                            <span title="Duplicate Transaction ID detected" style={{
                              fontSize: '0.7rem', fontWeight: 700, background: 'rgba(245,158,11,0.2)',
                              color: '#f59e0b', padding: '2px 7px', borderRadius: '8px',
                              border: '1px solid rgba(245,158,11,0.4)', letterSpacing: '0.5px'
                            }}>DUPLICATE TXN</span>
                          )}
                          {reg.flagReason && filter === 'flagged' && (
                            <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>{reg.flagReason}</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#888' }}>{reg.email} • {reg.phone}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{reg.dept} ({reg.year})</div>
                        {reg.games && (
                          <div style={{ fontSize: '0.8rem', color: '#e0a96d', marginTop: '4px' }}>
                            🎮 {Array.isArray(reg.games) ? reg.games.join(', ') : reg.games}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '20px', whiteSpace: 'nowrap' }}>
                        <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                          {reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </div>
                        <div style={{ color: '#aaa', fontSize: '0.8rem', fontFamily: 'monospace', marginTop: '2px' }}>
                          {reg.registeredAt ? new Date(reg.registeredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : ''}
                        </div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        {reg.studentId ? (
                          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#a0c4ff', background: 'rgba(160,196,255,0.08)', padding: '3px 8px', borderRadius: '5px' }}>
                            {reg.studentId}
                          </span>
                        ) : (
                          <span style={{ color: '#444', fontSize: '0.8rem' }}>—</span>
                        )}
                        {reg.isAmritaStudent && (
                          <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '3px' }}>Amrita Chennai</div>
                        )}
                      </td>
                      <td style={{ padding: '20px', color: '#fff' }}>₹{reg.amount || reg.amountExpected || 0}</td>
                      <td style={{ padding: '20px' }}>
                        {reg.token || reg.regId ? (
                          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--secondary)' }}>
                            {reg.token || reg.regId}
                          </span>
                        ) : (
                          <span style={{ color: '#555' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '20px', color: '#aaa', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {reg.utr || reg.paymentId || 'N/A'}
                      </td>
                      <td style={{ padding: '20px' }}>
                        <StatusBadge reg={reg} />
                      </td>
                      <td style={{ padding: '20px', textAlign: 'right' }}>
                        {reg.status === 'pending_verification' && (
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: '#ccc', marginRight: '8px' }}>
                              Expected: <strong style={{ color: '#fff', fontSize: '1rem' }}>₹{reg.amountExpected || reg.amount}</strong>
                            </span>
                            <button
                              onClick={() => updateStatus(reg.id, 'verify')}
                              style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.5)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <CircleCheckIcon size={14} /> Verify
                            </button>
                            <button
                              onClick={() => updateStatus(reg.id, 'reject')}
                              style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.5)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <ShieldXIcon size={14} /> Reject
                            </button>
                          </div>
                        )}
                        {reg.status === 'verified' && (
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              onClick={() => updateStatus(reg.id, 'revoke')}
                              style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.5)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <ShieldXIcon size={14} /> Revoke
                            </button>
                          </div>
                        )}
                        {reg.status === 'rejected' && (
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              onClick={() => updateStatus(reg.id, 'revoke')}
                              style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.5)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <ShieldXIcon size={14} /> Revoke
                            </button>
                          </div>
                        )}
                        {reg.status !== 'pending_verification' && reg.status !== 'verified' && reg.status !== 'rejected' && (
                          <span style={{ fontSize: '0.8rem', color: '#666' }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {displayList.length === 0 && (
                    <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                      {filter === 'flagged' ? 'No duplicate transaction IDs found.' : 'No registrations found.'}
                    </td></tr>
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
