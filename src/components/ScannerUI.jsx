import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ShieldXIcon, CircleCheckIcon, ScanLineIcon } from '@animateicons/react/lucide';

export default function ScannerUI({ 
  title, 
  subtitle,
  onScan, 
  onManualSubmit,
  manualToken,
  setManualToken,
  scanResult, 
  loading, 
  error, 
  onCheckIn, 
  onReset 
}) {
  const scanProcessedRef = useRef(false);
  const clearPromiseRef = useRef(null);

  useEffect(() => {
    if (scanResult || loading || error) return; // Don't re-render scanner if we have a result
    scanProcessedRef.current = false;
    
    let isSubscribed = true;
    let scanner = null;

    const setupScanner = async () => {
      if (clearPromiseRef.current) {
        await clearPromiseRef.current;
      }
      if (!isSubscribed) return;

      scanner = new Html5QrcodeScanner('reader', {
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          return { width: Math.floor(minEdge * 0.8), height: Math.floor(minEdge * 0.8) };
        },
        fps: 10,
        videoConstraints: { facingMode: "environment" }
      });

      scanner.render((result) => {
        if (scanProcessedRef.current) return;
        scanProcessedRef.current = true;
        
        if (scanner) {
          clearPromiseRef.current = scanner.clear().catch(err => console.error(err));
        }
        onScan(result);
      }, () => {});
    };

    setupScanner();

    return () => {
      isSubscribed = false;
      if (scanner && !scanProcessedRef.current) {
        clearPromiseRef.current = scanner.clear().catch(err => console.error("Failed to clear html5QrcodeScanner.", err));
      }
    };
  }, [scanResult, loading, error, onScan]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '120px', paddingLeft: '20px', paddingRight: '20px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'var(--primary)', color: '#fff', marginBottom: '20px', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)' }}>
          <ScanLineIcon size={32} />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: 'var(--primary-dark)' }}>
          {title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '10px' }}>
          {subtitle}
        </p>
      </div>

      <div style={{ background: 'var(--surface)', padding: '30px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        
        {!scanResult && !loading && !error && (
          <>
            <div style={{ overflow: 'hidden', borderRadius: '16px', border: '2px solid var(--primary-light)', marginBottom: '30px' }}>
              <div id="reader" style={{ width: '100%', background: '#fff', color: '#000', border: 'none' }}></div>
            </div>
            
            {onManualSubmit && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                  <div style={{ padding: '0 15px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>OR ENTER MANUALLY</div>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                </div>

                <form onSubmit={onManualSubmit} style={{ display: 'flex', gap: '10px' }}>
                  <label htmlFor="manual-token-input" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
                    Manual Token or ID
                  </label>
                  <input 
                    id="manual-token-input"
                    type="text" 
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Enter Token or ID"
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-alt)', color: 'var(--text)', fontSize: '1rem' }}
                  />
                  <button type="submit" style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Verify
                  </button>
                </form>
              </>
            )}
          </>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Verifying Ticket...</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '30px 20px', background: 'rgba(220, 38, 38, 0.05)', borderRadius: '16px', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
            <ShieldXIcon size={64} color="#ef4444" style={{ margin: '0 auto' }} />
            <h2 style={{ color: '#ef4444', marginTop: '15px', fontWeight: '800' }}>NOT VERIFIED</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>{error}</p>
            <button onClick={onReset} style={{ marginTop: '25px', padding: '12px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)' }}>
              Scan Again
            </button>
          </div>
        )}

        {scanResult && (
          <div style={{ padding: '30px 20px', border: `2px solid ${(scanResult.status !== 'verified' && scanResult.status !== 'free' || scanResult.checkedIn) ? '#ef4444' : '#10b981'}`, borderRadius: '16px', background: (scanResult.status !== 'verified' && scanResult.status !== 'free' || scanResult.checkedIn) ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              {scanResult.checkedIn ? (
                <>
                  <ShieldXIcon size={64} color="#ef4444" style={{ margin: '0 auto' }} />
                  <h2 style={{ color: '#ef4444', marginTop: '15px', fontWeight: '800' }}>ALREADY CHECKED IN</h2>
                  <p style={{ color: '#ef4444', fontWeight: 'bold' }}>DO NOT ALLOW ENTRY</p>
                </>
              ) : scanResult.status !== 'verified' && scanResult.status !== 'free' ? (
                <>
                  <ShieldXIcon size={64} color="#ef4444" style={{ margin: '0 auto' }} />
                  <h2 style={{ color: '#ef4444', marginTop: '15px', fontWeight: '800' }}>PAYMENT NOT VERIFIED</h2>
                  <p style={{ color: '#ef4444', fontWeight: 'bold' }}>DO NOT ALLOW ENTRY</p>
                </>
              ) : (
                <>
                  <CircleCheckIcon size={64} color="#10b981" style={{ margin: '0 auto' }} />
                  <h2 style={{ color: '#10b981', marginTop: '15px', fontWeight: '800' }}>VERIFIED TICKETS</h2>
                </>
              )}
            </div>
            
            <div style={{ background: 'var(--bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 5px 0' }}>{scanResult.type === 'movie' ? 'Booked By' : 'Attendee Name'}</p>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>{scanResult.name}</p>
                </div>
                <div>
                  {scanResult.type === 'movie' ? (
                    <>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 5px 0' }}>Movie & Time</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>{scanResult.movieTitle}</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 5px 0' }}>Department</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>{scanResult.dept} • {scanResult.year}</p>
                    </>
                  )}
                </div>
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)', paddingTop: '15px', marginTop: '5px' }}>
                  {scanResult.type === 'movie' ? (
                    <>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 5px 0' }}>Seats • {scanResult.screenName}</p>
                      <p style={{ fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>{scanResult.seats?.join(', ')}</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 5px 0' }}>Role / Access</p>
                      <p style={{ fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>{scanResult.role} {scanResult.games?.length ? `(${scanResult.games.join(', ')})` : ''}</p>
                    </>
                  )}
                </div>
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)', paddingTop: '15px', marginTop: '5px' }}>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 5px 0' }}>Booking/Reg ID</p>
                   <p style={{ fontFamily: 'monospace', margin: 0, color: 'var(--text-light)' }}>{scanResult.type === 'movie' ? scanResult.bookingId : scanResult.regId}</p>
                </div>
              </div>
            </div>

            {!scanResult.checkedIn && (scanResult.status === 'verified' || scanResult.status === 'free') && (
              <button 
                onClick={onCheckIn} 
                style={{ padding: '16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', width: '100%', cursor: 'pointer', boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)', marginBottom: '15px' }}>
                Confirm Check-In
              </button>
            )}

            <button onClick={onReset} style={{ padding: '16px', background: 'transparent', color: 'var(--text)', border: '2px solid var(--border)', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>
              Scan Next Attendee
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
