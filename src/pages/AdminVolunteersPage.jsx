import React, { useState, useEffect } from 'react';
import { CircleCheckIcon, ShieldXIcon } from '@animateicons/react/lucide';
import { SpotlightNavbar } from '../components/SpotlightNavbar';
import Galaxy from '../components/Galaxy';
import Footer from '../components/Footer';

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    fetch(`${apiUrl}/api/admin/volunteers`, { credentials: 'include' })
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

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/admin/volunteers`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setVolunteers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchVolunteers();
    }
  }, [isAuthenticated]);

  const updateStatus = async (regId, status) => {
    const actionLabel = status === 'volunteer_accepted' ? 'accept' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionLabel} this volunteer?`)) return;

    try {
      const res = await fetch(`${apiUrl}/api/admin/volunteers/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Update failed');
      fetchVolunteers();
    } catch (err) {
      alert(`Failed to ${actionLabel}: ${err.message}`);
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

  const statusBadge = (status) => {
    switch (status) {
      case 'volunteer_accepted':
        return <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '6px' }}><CircleCheckIcon size={16} /> Accepted</span>;
      case 'volunteer_rejected':
        return <span style={{ color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldXIcon size={16} /> Rejected</span>;
      case 'volunteer_reinstated':
        return <span style={{ color: '#5b9bf5', display: 'flex', alignItems: 'center', gap: '6px' }}><CircleCheckIcon size={16} /> Re-instated</span>;
      case 'volunteer_pending':
      case 'free':
        return <span style={{ color: 'orange', display: 'flex', alignItems: 'center', gap: '6px' }}>⏳ Pending</span>;
      default:
        return <span style={{ color: '#aaa' }}>{status}</span>;
    }
  };

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <SpotlightNavbar items={[{ label: "Home", href: "/" }, { label: "Payments", href: "/admin/payments" }, { label: "Logout", href: "#" }]} onItemClick={(item) => item.label === "Logout" ? handleLogout() : window.location.href = item.href} />
      </div>

      <main style={{ minHeight: '100vh', background: '#000000', color: '#ffffff', position: 'relative', padding: '120px 20px 60px 20px' }}>
        
        {/* Galaxy Background */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none' }}>
          <Galaxy />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--primary)', letterSpacing: '-1px' }}>Volunteer Management</h1>
              <p style={{ color: '#aaa', marginTop: '10px' }}>Accept or reject volunteer applications.</p>
            </div>
            <button onClick={fetchVolunteers} className="submit-btn" style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)' }}>
              ⟳ Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: '#aaa' }}>Loading volunteers...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: 'var(--rose)' }}>{error}</div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Volunteer</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Role</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Department</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Token</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '20px', color: '#ccc', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map(vol => (
                    <tr key={vol.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s' }}>
                      <td style={{ padding: '20px' }}>
                        <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{vol.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#888' }}>{vol.email} • {vol.phone}</div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <span style={{
                          background: 'rgba(183,139,39,0.15)', color: 'var(--primary)',
                          padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600
                        }}>
                          {vol.role}
                        </span>
                      </td>
                      <td style={{ padding: '20px', color: '#aaa' }}>{vol.dept} ({vol.year})</td>
                      <td style={{ padding: '20px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--secondary)' }}>
                          {vol.token}
                        </span>
                      </td>
                      <td style={{ padding: '20px' }}>
                        {statusBadge(vol.status)}
                      </td>
                      <td style={{ padding: '20px', textAlign: 'right' }}>
                        {(vol.status === 'volunteer_pending' || vol.status === 'free') && (
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => updateStatus(vol.id, 'volunteer_accepted')}
                              style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.5)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <CircleCheckIcon size={14} /> Accept
                            </button>
                            <button 
                              onClick={() => updateStatus(vol.id, 'volunteer_rejected')}
                              style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.5)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <ShieldXIcon size={14} /> Reject
                            </button>
                          </div>
                        )}
                        {(vol.status === 'volunteer_accepted' || vol.status === 'volunteer_reinstated') && (
                          <button 
                            onClick={() => updateStatus(vol.id, 'volunteer_rejected')}
                            style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <ShieldXIcon size={14} /> Reject
                          </button>
                        )}
                        {vol.status === 'volunteer_rejected' && (
                          <button 
                            onClick={() => updateStatus(vol.id, 'volunteer_reinstated')}
                            style={{ background: 'rgba(91, 155, 245, 0.1)', color: '#5b9bf5', border: '1px solid rgba(91, 155, 245, 0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <CircleCheckIcon size={14} /> Re-instate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {volunteers.length === 0 && (
                    <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No volunteer applications found.</td></tr>
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
