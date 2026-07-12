import React, { useState, useEffect } from 'react';
import { SpotlightNavbar } from '../components/SpotlightNavbar';
import Galaxy from '../components/Galaxy';
import Footer from '../components/Footer';

export default function VenueVerifyPage() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState(null); // 'pending', 'already', 'invalid'

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Check if already logged in by pinging the check-auth endpoint
  useEffect(() => {
    fetch(`${apiUrl}/api/admin/check-auth`, { credentials: 'include' })
      .then(r => { if (r.ok) setIsAuthenticated(true); })
      .catch(() => {});
  }, [apiUrl]);

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

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setResult(null);
    setErrorType(null);

    try {
      const res = await fetch(`${apiUrl}/api/verify/venue-token-checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: token.trim() })
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error === 'Verification pending' || json.error === 'Payment Not Completed' || json.error === 'Payment Rejected') {
          setErrorType('pending');
          // Speak "Payment not verified" using browser TTS
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance("Payment not verified");
            window.speechSynthesis.speak(utterance);
          }
        } else if (json.error === 'ALREADY CHECKED IN') {
          setErrorType('already');
          new Audio('/sounds/alarm.wav').play().catch(e => console.log('Audio play failed:', e));
        } else {
          setErrorType('invalid');
          new Audio('/sounds/alarm.wav').play().catch(e => console.log('Audio play failed:', e));
        }
        setResult({ error: json.error, user: json.user });
        throw new Error(json.error);
      }

      new Audio('/sounds/success.wav').play().catch(e => console.log('Audio play failed:', e));
      setResult(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGameEntry = async (gameName) => {
    if (!result || !result.user) return;
    try {
      const res = await fetch(`${apiUrl}/api/verify/game-entry`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: token.trim(), gameName })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      // Update local state to reflect the game is entered
      setResult(prev => ({
        ...prev,
        user: {
          ...prev.user,
          enteredGames: json.enteredGames
        }
      }));
    } catch (err) {
      alert(`Error marking game entry: ${err.message}`);
    }
  };

  const handleReset = () => {
    setToken('');
    setResult(null);
    setErrorType(null);
  };

  const renderGameList = () => {
    if (!result || !result.user || !result.user.games || result.user.games.length === 0) return null;
    
    return (
      <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
        <h3 style={{ color: '#aaa', fontSize: '1.2rem', marginBottom: '15px' }}>Registered Games</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {result.user.games.map((game, idx) => {
            const isEntered = result.user.enteredGames?.includes(game);
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{game}</span>
                {isEntered ? (
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                    ✅ Entered
                  </span>
                ) : (
                  <button 
                    onClick={() => handleGameEntry(game)}
                    style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.5)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Mark Entered
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <main style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.6 }}><Galaxy /></div>
        <div className="card" style={{ padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', width: '100%', maxWidth: '400px', zIndex: 10, textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Coordinator Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <input 
                type="password" 
                placeholder="Enter Admin Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center', width: '100%' }}
              />
            </div>
            {authError && <p style={{ color: 'var(--rose)', marginBottom: '15px' }}>{authError}</p>}
            <button type="submit" className="submit-btn" disabled={authLoading} style={{ width: '100%' }}>
              {authLoading ? 'Verifying...' : 'Access Scanner'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <SpotlightNavbar 
          items={[{ label: "Home", href: "/" }, { label: "Logout", href: "#" }]} 
          onItemClick={(item) => item.label === "Logout" ? handleLogout() : window.location.href = "/"} 
        />
      </div>

      <main style={{ minHeight: '100vh', background: '#000000', color: '#ffffff', position: 'relative', padding: '120px 20px 60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Galaxy Background Effect */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none' }}>
          <Galaxy />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '600px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--primary)', letterSpacing: '-1px' }}>Venue Check-In</h1>
            <p style={{ color: '#aaa', marginTop: '10px' }}>Enter the participant's 6-digit Session ID</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', padding: '40px', width: '100%', textAlign: 'center' }}>
            
            {!result && !errorType && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <input 
                    type="text" 
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                    placeholder="e.g. 123456"
                    style={{ width: '100%', padding: '20px', fontSize: '2rem', textAlign: 'center', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', letterSpacing: '5px' }}
                    autoFocus
                    maxLength={10}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading || !token}
                  className="submit-btn"
                  style={{ padding: '20px', fontSize: '1.2rem', cursor: loading || !token ? 'not-allowed' : 'pointer', opacity: loading || !token ? 0.5 : 1 }}>
                  {loading ? 'Verifying...' : 'VERIFY & CHECK IN'}
                </button>
              </form>
            )}

            {/* Success State */}
            {result && result.success && (
              <div style={{ border: '2px solid #22c55e', borderRadius: '16px', background: 'rgba(34, 197, 94, 0.1)', padding: '30px', animation: 'pulse 2s infinite' }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>✅</div>
                <h2 style={{ color: '#22c55e', fontSize: '2rem', marginBottom: '20px' }}>ALLOWED INSIDE</h2>
                
                <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '10px', fontSize: '1.1rem', lineHeight: '1.8', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p><strong>Name:</strong> {result.user.name}</p>
                  <p><strong>Role:</strong> {result.user.role}</p>
                  <p><strong>ID:</strong> {result.user.regId}</p>
                  {renderGameList()}
                </div>

                <button onClick={handleReset} className="submit-btn" style={{ marginTop: '30px', background: 'rgba(255,255,255,0.1)', width: '100%' }}>
                  Next Person
                </button>
              </div>
            )}

            {/* Red Alarm (Already Checked In) */}
            {errorType === 'already' && (
              <div style={{ border: '2px solid #ef4444', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.15)', padding: '30px' }}>
                <div style={{ fontSize: '5rem', marginBottom: '10px', animation: 'shake 0.5s infinite' }}>🚨</div>
                <h2 style={{ color: '#ef4444', fontSize: '2rem', marginBottom: '10px', fontWeight: '900', letterSpacing: '1px' }}>ALREADY CHECKED IN</h2>
                <h3 style={{ color: '#fca5a5', marginBottom: '20px' }}>MAIN VENUE ENTRY USED</h3>
                
                {result?.user && (
                  <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '10px', fontSize: '1.1rem', lineHeight: '1.8', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <p><strong>Name:</strong> {result.user.name}</p>
                    <p><strong>Role:</strong> {result.user.role}</p>
                    {renderGameList()}
                  </div>
                )}

                <button onClick={handleReset} className="submit-btn" style={{ marginTop: '30px', background: '#ef4444', color: '#fff', width: '100%' }}>
                  Back
                </button>
              </div>
            )}

            {/* Pending Verification */}
            {errorType === 'pending' && (
              <div style={{ border: '2px solid #f59e0b', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.1)', padding: '30px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>⚠️</div>
                <h2 style={{ color: '#f59e0b', fontSize: '1.8rem', marginBottom: '20px' }}>VERIFICATION PENDING</h2>
                <p style={{ color: '#fcd34d', marginBottom: '20px' }}>Payment has not been confirmed yet.</p>
                
                {result?.user && (
                  <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '10px', fontSize: '1.1rem', lineHeight: '1.8', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <p><strong>Name:</strong> {result.user.name}</p>
                    <p><strong>Role:</strong> {result.user.role}</p>
                    {renderGameList()}
                  </div>
                )}

                <button onClick={handleReset} className="submit-btn" style={{ marginTop: '30px', background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', width: '100%' }}>
                  Try Again
                </button>
              </div>
            )}

            {/* Invalid Token */}
            {errorType === 'invalid' && (
              <div style={{ border: '2px solid #ef4444', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '30px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>❌</div>
                <h2 style={{ color: '#ef4444', fontSize: '1.8rem', marginBottom: '20px' }}>INVALID SESSION ID</h2>
                <p style={{ color: '#fca5a5' }}>This token does not exist in the system.</p>
                
                <button onClick={handleReset} className="submit-btn" style={{ marginTop: '30px', background: 'rgba(255,255,255,0.1)', width: '100%' }}>
                  Try Again
                </button>
              </div>
            )}

          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
            70% { box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          }
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
            75% { transform: translateX(-10px); }
            100% { transform: translateX(0); }
          }
        `}</style>
      </main>
      <Footer />
    </>
  );
}
