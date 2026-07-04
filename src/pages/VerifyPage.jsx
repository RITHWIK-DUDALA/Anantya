import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ShieldXIcon, CircleCheckIcon } from '@animateicons/react/lucide';

export default function VerifyPage() {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(success, (err) => {
      // Ignore routine scan errors
    });

    function success(result) {
      scanner.clear();
      handleVerify(result);
    }

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear html5QrcodeScanner. ", error));
    };
  }, []);

  const handleVerify = async (qrDataString) => {
    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const data = JSON.parse(qrDataString);
      if (!data.regId) throw new Error("Invalid QR code format");

      const res = await fetch(`${apiUrl}/api/verify/registration/${data.regId}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Verification failed');
      }

      setScanResult(json);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid QR code or fake payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!scanResult || !scanResult.regId) return;
    try {
      const res = await fetch(`${apiUrl}/api/verify/checkin/${scanResult.regId}`, { method: 'PATCH' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Check-in failed');
      
      setScanResult(prev => ({ ...prev, checkedIn: true }));
      alert('Successfully checked in!');
    } catch (err) {
      alert(err.message);
    }
  };

  const resetScanner = () => {
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', textAlign: 'center', color: '#fff', background: '#111', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '20px' }}>Volunteer QR Verification</h1>
      
      {!scanResult && !loading && !error && (
        <div id="reader" style={{ width: '100%', background: '#fff', color: '#000' }}></div>
      )}

      {loading && <p>Verifying with backend...</p>}

      {error && (
        <div style={{ padding: '20px', border: '2px solid red', borderRadius: '10px', background: '#300' }}>
          <ShieldXIcon size={64} color="red" />
          <h2 style={{ color: 'red', marginTop: '10px' }}>❌ NOT VERIFIED</h2>
          <p>{error}</p>
          <button onClick={resetScanner} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Scan Again</button>
        </div>
      )}

      {scanResult && (
        <div style={{ padding: '20px', border: `2px solid ${scanResult.checkedIn ? 'orange' : 'green'}`, borderRadius: '10px', background: '#022' }}>
          {scanResult.checkedIn ? (
             <><span style={{ fontSize: '64px', display: 'block', marginBottom: '10px' }}>⚠️</span><h2 style={{ color: 'orange', marginTop: '10px' }}>⚠️ Already Checked In</h2></>
          ) : (
             <><CircleCheckIcon size={64} color="green" /><h2 style={{ color: 'green', marginTop: '10px' }}>✅ VERIFIED</h2></>
          )}
          
          <div style={{ textAlign: 'left', marginTop: '20px', fontSize: '1.1rem', lineHeight: '1.6' }}>
            <p><strong>Name:</strong> {scanResult.name}</p>
            <p><strong>Dept:</strong> {scanResult.dept} &middot; {scanResult.year}</p>
            <p><strong>Role/Games:</strong> {scanResult.role} {scanResult.games?.length ? `(${scanResult.games.join(', ')})` : ''}</p>
            <p><strong>Payment:</strong> {scanResult.status === 'free' ? 'Free' : `₹${scanResult.amount}`} &middot; CONFIRMED</p>
            <p><strong>ID:</strong> {scanResult.regId}</p>
          </div>

          {!scanResult.checkedIn && (
            <button 
              onClick={handleCheckIn} 
              style={{ marginTop: '20px', padding: '15px 30px', background: 'green', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', width: '100%', cursor: 'pointer' }}>
              Confirm Check In
            </button>
          )}

          <button onClick={resetScanner} style={{ marginTop: '10px', padding: '10px 20px', background: '#444', color: 'white', border: 'none', borderRadius: '8px', width: '100%', cursor: 'pointer' }}>
            Scan Another
          </button>
        </div>
      )}
    </div>
  );
}
