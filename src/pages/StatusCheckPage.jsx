import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpotlightNavbar } from '../components/SpotlightNavbar';
import Galaxy from '../components/Galaxy';
import Footer from '../components/Footer';

export default function StatusCheckPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [regId, setRegId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !regId) {
      setError('Please enter both Email and Registration ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${apiUrl}/api/status/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), regId: regId.trim() })
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

  const downloadToken = (token) => {
    const element = document.createElement("a");
    const file = new Blob([`Anantya Registration Token: ${token}\nPlease present this token at the event.`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Anantya_Token_${token}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <SpotlightNavbar />
      </div>
      
      <main style={{ minHeight: '100vh', background: '#000000', color: '#ffffff', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Galaxy Background Effect */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none' }}>
          <Galaxy />
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10, padding: '120px 20px 60px 20px' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '40px 30px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Check Registration Status</h2>
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '30px' }}>
              Enter your registered email and Registration ID to check the status of your payment verification.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '20px' }}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="Enter registered email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '20px' }}>
                <label>Registration ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. REG-1234..." 
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p style={{ color: 'var(--rose)', fontSize: '0.9rem', marginBottom: '20px', background: 'rgba(244,63,94,0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.2)' }}>
                  {error}
                </p>
              )}

              <button 
                type="submit" 
                className="submit-btn" 
                disabled={loading}
                style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Checking...' : 'Check Status'}
              </button>
            </form>

            {result && (
              <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <h4 style={{ color: '#fff', marginBottom: '15px' }}>Status Details:</h4>
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>Name:</span>
                  <div style={{ color: '#fff' }}>{result.name}</div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>Games/Events:</span>
                  <div style={{ color: '#fff' }}>{result.gameId}</div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>Verification Status:</span>
                  {result.status === 'pending_verification' && (
                    <div style={{ color: 'orange', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '5px' }}>⏳ Pending Verification</div>
                  )}
                  {result.status === 'verified' && (
                    <div style={{ color: 'var(--green)', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '5px' }}>✅ Verified</div>
                  )}
                  {result.status === 'rejected' && (
                    <div style={{ color: 'var(--rose)', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '5px' }}>❌ Rejected</div>
                  )}
                </div>

                {result.status === 'pending_verification' && (
                  <p style={{ fontSize: '0.85rem', color: '#aaa', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                    Your payment is currently being verified by our team. This process can take up to 24-48 hours. Please check back later.
                  </p>
                )}

                {result.status === 'rejected' && result.rejectedReason && (
                  <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', padding: '15px', borderRadius: '8px' }}>
                    <p style={{ margin: 0, color: 'var(--rose)', fontSize: '0.9rem', fontWeight: 600 }}>Reason for rejection:</p>
                    <p style={{ margin: '5px 0 0', color: '#fff', fontSize: '0.9rem' }}>{result.rejectedReason}</p>
                    <p style={{ margin: '15px 0 0', color: '#aaa', fontSize: '0.8rem' }}>Please contact support to resolve this issue.</p>
                  </div>
                )}

                {result.status === 'verified' && result.token && (
                  <div style={{ textAlign: 'center', background: 'rgba(183,139,39,0.1)', border: '1px solid rgba(183,139,39,0.3)', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
                    <p style={{ margin: '0 0 10px', color: 'var(--primary)', fontWeight: 600 }}>Your Registration Token</p>
                    <h3 style={{ margin: '0 0 20px', letterSpacing: '2px', fontSize: '1.5rem', fontFamily: 'monospace' }}>{result.token}</h3>
                    
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
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
