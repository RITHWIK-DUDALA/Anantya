import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SpotlightNavbar } from '../components/SpotlightNavbar';
import { Turnstile } from '@marsidev/react-turnstile';
import Galaxy from '../components/Galaxy';
import Footer from '../components/Footer';

export default function StatusPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [regId, setRegId] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !regId) {
      setError('Please enter both Email and Registration ID');
      return;
    }
    if (!captchaToken) {
      setError('Please complete the CAPTCHA validation');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${apiUrl}/api/status/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), regId: regId.trim(), captchaToken })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'No matching registration found.');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setResult(null);
    setEmail('');
    setRegId('');
  };

  const downloadToken = (token) => {
    const element = document.createElement("a");
    const file = new Blob([`Anantya Registration Token: ${token}\nPlease present this token at the event.`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Anantya_Token_${token}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
      
      <main style={{ minHeight: '100vh', background: '#000000', color: '#ffffff', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Galaxy Background Effect */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none' }}>
          <Galaxy />
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10, padding: '120px 20px 60px 20px' }}>
          
          {result ? (
            <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '40px 30px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', textAlign: 'center' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '20px', fontSize: '2rem' }}>Status Details</h2>
              
              <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '1.05rem', display: 'flex' }}><strong style={{ color: '#ccc', width: '150px', flexShrink: 0 }}>Name:</strong> <span style={{ color: '#fff' }}>{result.name}</span></p>
                <p style={{ margin: '0 0 12px 0', fontSize: '1.05rem', display: 'flex' }}><strong style={{ color: '#ccc', width: '150px', flexShrink: 0 }}>Games/Events:</strong> <span style={{ color: '#fff' }}>{result.gameId}</span></p>
                
                <div style={{ margin: '0 0 12px 0', fontSize: '1.05rem', display: 'flex', alignItems: 'center' }}>
                  <strong style={{ color: '#ccc', width: '150px', flexShrink: 0 }}>Status:</strong>
                  <span>
                    {result.status === 'pending_verification' && (
                      <span style={{ color: 'orange', fontWeight: 'bold' }}>⏳ Pending Verification</span>
                    )}
                    {result.status === 'verified' && (
                      <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>✅ Verified</span>
                    )}
                    {result.status === 'rejected' && (
                      <span style={{ color: 'var(--rose)', fontWeight: 'bold' }}>❌ Rejected</span>
                    )}
                  </span>
                </div>
              </div>

              {result.status === 'pending_verification' && (
                <div style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.2)', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
                  <p style={{ margin: 0, color: 'orange', fontSize: '0.9rem' }}>
                    Your payment is currently being verified by our team. This process can take up to 24-48 hours. Please check back later.
                  </p>
                </div>
              )}

              {result.status === 'rejected' && result.rejectedReason && (
                <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
                  <p style={{ margin: 0, color: 'var(--rose)', fontSize: '0.9rem', fontWeight: 600 }}>Reason for rejection:</p>
                  <p style={{ margin: '5px 0 0', color: '#fff', fontSize: '0.9rem' }}>{result.rejectedReason}</p>
                  <p style={{ margin: '15px 0 0', color: '#aaa', fontSize: '0.8rem' }}>Please contact support to resolve this issue.</p>
                </div>
              )}

              {result.status === 'verified' && result.token && (
                <div style={{ textAlign: 'center', background: 'rgba(183,139,39,0.1)', border: '1px solid rgba(183,139,39,0.3)', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                  <p style={{ margin: '0 0 10px', color: 'var(--primary)', fontWeight: 600 }}>Your Registration Token</p>
                  <h3 style={{ margin: '0 0 20px', letterSpacing: '2px', fontSize: '2rem', fontFamily: 'monospace' }}>{result.token}</h3>
                  
                  {result.qrCode && (
                    <div style={{ background: '#fff', padding: '10px', display: 'inline-block', borderRadius: '8px', marginBottom: '20px' }}>
                      <img src={result.qrCode} alt="Entry QR Code" style={{ width: '150px', height: '150px' }} />
                    </div>
                  )}
                  
                  <button 
                    onClick={() => downloadToken(result.token)}
                    className="submit-btn"
                    style={{ padding: '8px 16px', width: 'auto', fontSize: '0.9rem', margin: '0 auto', display: 'block' }}
                  >
                    Download Token
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={() => handleSubmit({ preventDefault: () => {} })} 
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
                  Back
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
                onSubmit={handleSubmit} 
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
                  Log in using the email you registered with and your Registration ID (REG-...).
                </p>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ color: '#ccc' }}>Registered Email</label>
                  <input 
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
                  <label style={{ color: '#ccc' }}>Registration ID</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. REG-123456" 
                    value={regId}
                    onChange={e => setRegId(e.target.value)}
                    style={{ 
                      background: 'rgba(0,0,0,0.5)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--primary)',
                      padding: '14px 16px',
                      fontSize: '1.25rem',
                      fontFamily: 'monospace', 
                      textAlign: 'center',
                      borderRadius: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                  <Turnstile 
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} // dummy key for local dev if missing
                    onSuccess={(token) => setCaptchaToken(token)}
                    onError={() => setError('CAPTCHA failed. Please refresh and try again.')}
                    onExpire={() => setCaptchaToken(null)}
                    options={{ theme: 'dark' }}
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
