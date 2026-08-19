import React, { useState } from 'react';
import { SpotlightNavbar } from '../components/SpotlightNavbar';
import ScannerUI from '../components/ScannerUI';

export default function MovieVerifyPage() {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualToken, setManualToken] = useState('');
  
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const handleVerifyQR = async (qrDataString) => {
    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const data = JSON.parse(qrDataString);
      if (!data.bookingId) throw new Error("Invalid QR code format for movies");

      const res = await fetch(`${apiUrl}/api/verify/movie/${data.bookingId}?sig=${data.signature}`);
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

  const handleVerifyManual = async (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    
    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const res = await fetch(`${apiUrl}/api/verify/movie-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: manualToken.trim() })
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Verification failed');
      }

      setScanResult(json);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid Token or Booking ID');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!scanResult || !scanResult.bookingId) return;
    try {
      const res = await fetch(`${apiUrl}/api/verify/movie-checkin/${scanResult.bookingId}`, { method: 'PATCH' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Check-in failed');
      
      setScanResult(prev => ({ ...prev, checkedIn: true }));
      alert('Successfully checked into the movie!');
    } catch (err) {
      alert(err.message);
    }
  };

  const resetScanner = () => {
    window.location.reload();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '120px' }}>
      <SpotlightNavbar />
      <ScannerUI 
        title="Movie Ticket Scanner"
        subtitle="Verify movie bookings via QR code or session token."
        onScan={handleVerifyQR}
        onManualSubmit={handleVerifyManual}
        manualToken={manualToken}
        setManualToken={setManualToken}
        scanResult={scanResult}
        loading={loading}
        error={error}
        onCheckIn={handleCheckIn}
        onReset={resetScanner}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
