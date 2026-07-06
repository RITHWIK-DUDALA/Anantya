import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheckIcon, ShieldXIcon } from '@animateicons/react/lucide';
import { SpotlightNavbar } from '../components/SpotlightNavbar';
import Galaxy from '../components/Galaxy';
import Footer from '../components/Footer';

export default function StatusPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userStatus, setUserStatus] = useState(null);
  
  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${apiUrl}/api/verify/status-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Invalid login details');
      
      setUserStatus(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUserStatus(null);
    setEmail('');
    setToken('');
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Games", href: "/register" },
    { label: "Volunteer", href: "/form" },
    { label: "Status", href: "/status" }
  ];

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <SpotlightNavbar 
          items={navItems}
          activeIndex={3}
          onItemClick={(item) => {
            if (item.href) {
              navigate(item.href);
            }
          }}
        />
      </div>

      <main style={{ minHeight: '100vh', background: '#000000', color: '#ffffff', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Galaxy Background Effect */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.6, pointerEvents: 'none' }}>
          <Galaxy />
        </div>

        {/* Cinematic Gradient Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30vh', background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)', zIndex: 1 }} />
        
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10, padding: '120px 20px 60px 20px' }}>
          
          {userStatus ? (
            <div className="card" style={{ padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', width: '100%', maxWidth: '600px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '20px', fontSize: '2rem', letterSpacing: '-0.5px' }}>
                Welcome, {userStatus.name.split(' ')[0]}!
              </h2>
              
              <div style={{ padding: '40px 30px', margin: '20px 0', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 2px 15px rgba(0,0,0,0.5)' }}>
                <p style={{ margin: '0 0 15px 0', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Verification Status</p>
                
                {userStatus.status === 'verified' && (
                  <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <CircleCheckIcon size={72} color="var(--green)" />
                    <h3 style={{ color: 'var(--green)', margin: '20px 0 10px 0', fontSize: '2rem', textShadow: '0 0 20px rgba(0, 255, 136, 0.3)' }}>Verified!</h3>
                    <p style={{ color: '#aaa', margin: 0, fontSize: '1.1rem', lineHeight: 1.5 }}>Your payment is confirmed. We can't wait to see you at Anantya!</p>
                  </div>
                )}

                {userStatus.status === 'pending_verification' && (
                  <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <span style={{ fontSize: '72px', display: 'inline-block', opacity: 0.9, filter: 'drop-shadow(0 0 15px rgba(255, 165, 0, 0.3))' }}>⏳</span>
                    <h3 style={{ color: 'orange', margin: '20px 0 10px 0', fontSize: '2rem' }}>Pending Verification</h3>
                    <p style={{ color: '#aaa', margin: 0, fontSize: '1.1rem', lineHeight: 1.5 }}>We have received your payment details and are currently verifying it. Please check back soon.</p>
                  </div>
                )}

                {userStatus.status === 'rejected' && (
                  <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <ShieldXIcon size={72} color="var(--rose)" />
                    <h3 style={{ color: 'var(--rose)', margin: '20px 0 10px 0', fontSize: '2rem', textShadow: '0 0 20px rgba(244, 63, 94, 0.3)' }}>Payment Rejected</h3>
                    <p style={{ color: '#aaa', margin: 0, fontSize: '1.1rem', lineHeight: 1.5 }}>We could not verify your transaction. Please contact the organizers for assistance.</p>
                  </div>
                )}

                {userStatus.status === 'free' && (
                  <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <CircleCheckIcon size={72} color="var(--primary)" />
                    <h3 style={{ color: 'var(--primary)', margin: '20px 0 10px 0', fontSize: '2rem', textShadow: '0 0 20px rgba(99, 102, 241, 0.3)' }}>Registered</h3>
                    <p style={{ color: '#aaa', margin: 0, fontSize: '1.1rem', lineHeight: 1.5 }}>You are fully registered for the free events. See you there!</p>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', marginBottom: '35px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '1.05rem' }}><strong style={{ color: '#ccc', width: '120px', display: 'inline-block' }}>Role:</strong> <span style={{ color: '#fff' }}>{userStatus.role}</span></p>
                {userStatus.games && userStatus.games.length > 0 && (
                  <p style={{ margin: '0 0 12px 0', fontSize: '1.05rem' }}><strong style={{ color: '#ccc', width: '120px', display: 'inline-block' }}>Games:</strong> <span style={{ color: '#fff' }}>{userStatus.games.join(', ')}</span></p>
                )}
                <p style={{ margin: '0 0 12px 0', fontSize: '1.05rem' }}><strong style={{ color: '#ccc', width: '120px', display: 'inline-block' }}>Amount:</strong> <span style={{ color: '#fff' }}>₹{userStatus.amount}</span></p>
                <p style={{ margin: '0', fontSize: '1.05rem' }}><strong style={{ color: '#ccc', width: '120px', display: 'inline-block' }}>Reg ID:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--primary)', letterSpacing: '1px' }}>{userStatus.regId}</span></p>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={() => handleLogin({ preventDefault: () => {} })} 
                  className="submit-btn" 
                  disabled={loading}
                  style={{ flex: 1, background: 'var(--primary)', color: '#000', border: 'none', transition: 'all 0.3s ease', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Refreshing...' : 'Refresh Status'}
                </button>
                <button 
                  onClick={handleLogout} 
                  className="submit-btn" 
                  style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
              <div style={{ marginBottom: '40px' }}>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '6px 16px', 
                  borderRadius: '30px', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#aaa',
                  fontSize: '0.8rem',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  marginBottom: '20px'
                }}>
                  Portal
                </span>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 700, margin: '0', background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
                  Check Status
                </h1>
              </div>
              
              <form 
                onSubmit={handleLogin} 
                className="reg-form card" 
                style={{ 
                  padding: '40px', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '24px', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  textAlign: 'left'
                }}
              >
                <p style={{ color: '#888', textAlign: 'center', marginBottom: '30px', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Log in using the email you registered with and your 6-digit Registration Token.
                </p>
                
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label htmlFor="login-email" style={{ color: '#ccc' }}>Registered Email</label>
                  <input 
                    id="login-email" 
                    type="email" 
                    required 
                    placeholder="e.g. john@gmail.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ 
                      background: 'rgba(0,0,0,0.5)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '14px 16px',
                      fontSize: '1rem',
                      borderRadius: '12px'
                    }}
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: '30px' }}>
                  <label htmlFor="login-token" style={{ color: '#ccc' }}>Registration Token</label>
                  <input 
                    id="login-token" 
                    type="text" 
                    required 
                    placeholder="123456" 
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    style={{ 
                      background: 'rgba(0,0,0,0.5)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--primary)',
                      padding: '14px 16px',
                      fontSize: '1.25rem',
                      letterSpacing: '8px', 
                      fontFamily: 'monospace', 
                      textAlign: 'center',
                      borderRadius: '12px',
                      fontWeight: 'bold'
                    }}
                    maxLength={6}
                  />
                </div>

                {error && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ color: 'var(--rose)', textAlign: 'center', margin: 0, fontSize: '0.9rem' }}>{error}</p>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={loading}
                  style={{
                    padding: '16px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    background: 'var(--primary)',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  {loading ? 'Authenticating...' : 'Check Status'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer at the bottom */}
      <div style={{ background: '#000', position: 'relative', zIndex: 10 }}>
        <Footer />
      </div>
    </>
  );
}
