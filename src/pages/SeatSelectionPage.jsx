import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpotlightNavbar } from '../components/SpotlightNavbar';

// Removed synchronous getSessionId in favor of async fetch in component

export default function SeatSelectionPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const [sessionToken, setSessionToken] = useState(localStorage.getItem('anantya_movie_session_token'));
  const [sessionId, setSessionId] = useState(localStorage.getItem('anantya_movie_session_uuid'));

  const [showData, setShowData] = useState(null);
  const [lockedSeats, setLockedSeats] = useState([]); // Array of lock objects
  const [bookedSeats, setBookedSeats] = useState([]); // Array of seat IDs
  const [mySelectedSeats, setMySelectedSeats] = useState([]); // Array of seat IDs the current user successfully locked
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || '';

  const trueSelectedSeats = Array.from(new Set([
    ...mySelectedSeats,
    ...lockedSeats.filter(l => l.sessionId === sessionId).map(l => l.seatId)
  ]));

  // Fetch showtime and screen layout
  useEffect(() => {
    fetch(`${apiUrl}/api/movies/shows/${showtimeId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setShowData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load showtime details.');
        setLoading(false);
      });
      
    if (!sessionToken) {
      fetch(`${apiUrl}/api/movies/session`)
        .then(res => res.json())
        .then(data => {
           localStorage.setItem('anantya_movie_session_token', data.token);
           localStorage.setItem('anantya_movie_session_uuid', data.sessionId);
           setSessionToken(data.token);
           setSessionId(data.sessionId);
        })
        .catch(err => console.error('Failed to get session:', err));
    }
  }, [showtimeId, sessionToken]);

  // Poll for seat status
  const fetchSeatStatus = () => {
    fetch(`${apiUrl}/api/movies/shows/${showtimeId}/seats`)
      .then(res => res.json())
      .then(data => {
        if (data.activeLocks) setLockedSeats(data.activeLocks);
        if (data.bookedSeats) setBookedSeats(data.bookedSeats);
      })
      .catch(err => console.error('Failed to poll seats:', err));
  };

  useEffect(() => {
    fetchSeatStatus();
    const interval = setInterval(fetchSeatStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [showtimeId]);

  const handleSeatClick = async (seatId) => {
    if (!sessionToken) return;
    // Check if already booked
    if (bookedSeats.includes(seatId)) return;

    // Check if locked by someone else
    const lock = lockedSeats.find(l => l.seatId === seatId);
    if (lock && lock.sessionId !== sessionId) return;

    // If already selected, unlock it
    if (trueSelectedSeats.includes(seatId)) {
      setMySelectedSeats(prev => prev.filter(s => s !== seatId));
      setLockedSeats(prev => prev.filter(l => l.seatId !== seatId)); // optimistic remote unlock
      fetch(`${apiUrl}/api/movies/unlock-seat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showtimeId, seatId, sessionToken })
      }).then(res => {
        if (res.status === 401) {
          localStorage.removeItem('anantya_movie_session_token');
          localStorage.removeItem('anantya_movie_session_uuid');
          setSessionToken(null);
          setSessionId(null);
        }
      });
      return;
    }

    // Try to lock it
    if (trueSelectedSeats.length >= 10) {
      alert('Maximum 10 seats allowed per booking.');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/movies/lock-seat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showtimeId, seatId, sessionToken })
      });

      if (res.status === 401) {
        localStorage.removeItem('anantya_movie_session_token');
        localStorage.removeItem('anantya_movie_session_uuid');
        setSessionToken(null);
        setSessionId(null);
        alert('Your session expired or is invalid. Please try selecting the seat again.');
        return;
      }

      const data = await res.json();
      
      if (data.success) {
        setMySelectedSeats(prev => [...prev, seatId]);
        fetchSeatStatus(); // immediately refresh UI
      } else {
        alert(data.error || 'Seat could not be locked.');
        fetchSeatStatus();
      }
    } catch (err) {
      console.error(err);
      alert('Network error while locking seat.');
    }
  };

  if (loading) return <div style={{ color: 'var(--text)', padding: '100px', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ color: 'var(--rose)', padding: '100px', textAlign: 'center' }}>{error}</div>;
  if (!showData || !showData.screen) return <div style={{ color: 'var(--text)', padding: '100px', textAlign: 'center' }}>Screen layout not found for this show.</div>;

  const layout = showData.screen.layout; // e.g. { rows: 10, cols: 20, blankSpaces: ['A-5', 'B-10'] }
  const rows = layout.rows || 10;
  const cols = layout.cols || 20;
  const blankSpaces = layout.blankSpaces || [];

  const rowLabels = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i)); // A, B, C...

  // Calculate Total Amount based on row pricing
  // A, B -> ₹125
  // C, D -> ₹110
  // Others -> ₹99
  const getSeatPrice = (seatId) => {
    const row = seatId.split('-')[0];
    if (row === 'A' || row === 'B') return 125;
    if (row === 'C' || row === 'D') return 110;
    return 99;
  };
  const totalAmount = trueSelectedSeats.reduce((total, seatId) => total + getSeatPrice(seatId), 0);

  const renderSeat = (rowLabel, seatNumber) => {
    const seatId = `${rowLabel}-${seatNumber}`;
    if (blankSpaces.includes(seatId)) {
      return <div key={seatId} style={{ width: '30px', height: '30px' }} />; // Aisle/Gap
    }

    const isBooked = bookedSeats.includes(seatId);
    const activeLock = lockedSeats.find(l => l.seatId === seatId);
    const isLockedByOther = activeLock && activeLock.sessionId !== sessionId;
    const isSelectedByMe = trueSelectedSeats.includes(seatId);
    const isLockedByMe = false; // no longer needed separately

    let bg = 'var(--surface)';
    let cursor = 'pointer';
    let border = '1px solid var(--border)';
    let textColor = 'var(--text-light)';

    let seatClass = 'seat-base';
    if (!isBooked && !isLockedByOther && !isSelectedByMe && !isLockedByMe) {
      seatClass += ' seat-available';
    }

    if (isBooked) {
      bg = '#E5E7EB';
      cursor = 'not-allowed';
      border = '1px solid #D1D5DB';
      textColor = '#9CA3AF';
    } else if (isLockedByOther) {
      bg = '#F3F4F6';
      cursor = 'not-allowed';
      border = '1px solid #E5E7EB';
      textColor = '#9CA3AF';
    } else if (isSelectedByMe || isLockedByMe) {
      bg = 'var(--primary)';
      border = '1px solid var(--primary-dark)';
      textColor = '#fff';
    }

    return (
      <div 
        key={seatId} 
        className={seatClass}
        onClick={() => handleSeatClick(seatId)}
        style={{ 
          width: '30px', 
          height: '30px', 
          background: bg,
          border: border,
          borderRadius: '6px 6px 4px 4px',
          cursor: cursor,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '0.6rem',
          color: textColor,
          fontWeight: 'bold',
          boxShadow: (isSelectedByMe || isLockedByMe) ? 'var(--shadow-sm)' : 'none',
          position: 'relative',
          zIndex: 10
        }}
        title={seatId}
      >
        {seatNumber}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '120px' }}>
      <SpotlightNavbar />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '100px', paddingLeft: '20px', paddingRight: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--primary-dark)' }}>
              {showData.movieTitle}
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>
              {showData.screen?.name} • {new Date(showData.date).toLocaleDateString()} at {showData.time}
            </p>
          </div>
          <button 
            onClick={() => navigate('/movies')}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Change Show
          </button>
        </div>

                                                {/* Auditorium Layout */}
        <div style={{ overflowX: 'auto', paddingBottom: '20px', width: '100%' }}>
          <div style={{ width: 'max-content', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Screen Area with Gates */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '80px', width: '100%', marginBottom: '60px' }}>
                        <div style={{ marginTop: '10px' }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '4px', fontSize: '1rem' }}>EXIT</span>
                        </div>
            
                        {/* Screen Indicator */}
                        <div style={{ 
                          width: '600px', 
                          height: '40px', 
                          background: 'linear-gradient(to bottom, var(--primary-light), transparent)', 
                          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                          borderTop: '2px solid var(--primary)',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'flex-start',
                          paddingTop: '10px'
                        }}>
                          <span style={{ color: 'var(--text-muted)', letterSpacing: '4px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Screen</span>
                        </div>
            
                        <div style={{ marginTop: '10px' }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '4px', fontSize: '1rem' }}>ENTRY</span>
                        </div>
                    </div>

            {/* Seating Areas */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '60px', marginBottom: '40px' }}>
              
              {/* Boys Seating */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--surface)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ color: 'var(--text)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', width: '100%', textAlign: 'center' }}>Boys Seating</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   {rowLabels.map((rowLabel) => (
                      <div key={`boys-${rowLabel}`} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                         <div style={{ width: '20px', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.9rem' }}>{rowLabel}</div>
                         <div style={{ display: 'flex', gap: '8px' }}>
                            {Array.from({ length: Math.ceil(cols/2) }, (_, i) => renderSeat(rowLabel, i + 1))}
                         </div>
                      </div>
                   ))}
                </div>
              </div>

              {/* Central Aisle Gap */}
              <div style={{ width: '30px' }}></div>

              {/* Women Seating */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--surface)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ color: 'var(--text)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', width: '100%', textAlign: 'center' }}>Women Seating</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   {rowLabels.map((rowLabel) => (
                      <div key={`women-${rowLabel}`} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                         <div style={{ display: 'flex', gap: '8px' }}>
                            {Array.from({ length: Math.floor(cols/2) }, (_, i) => renderSeat(rowLabel, Math.ceil(cols/2) + i + 1))}
                         </div>
                         <div style={{ width: '20px', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'right' }}>{rowLabel}</div>
                      </div>
                   ))}
                </div>
              </div>

              

            </div>

                                                                        {/* Audio Deck Area with Gates */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '120px', width: '100%', marginTop: '40px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '4px', fontSize: '1rem' }}>EXIT</span>
                </div>

                {/* Audio Deck */}
                <div style={{ 
                  width: '250px', 
                  padding: '15px', 
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <span style={{ color: 'var(--text-muted)', letterSpacing: '2px', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Audio Deck</span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '4px', fontSize: '1rem' }}>EXIT</span>
                </div>
            </div>

          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px', padding: '20px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: 'var(--primary)', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Selected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: '#E5E7EB', border: '1px solid #D1D5DB', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sold / Locked</span>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      {trueSelectedSeats.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          background: 'var(--surface-glass)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border)',
          padding: '20px 30px', 
          borderRadius: '16px', 
          display: 'flex', 
          gap: '40px',
          alignItems: 'center',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 100
        }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {trueSelectedSeats.length} Seat{trueSelectedSeats.length > 1 ? 's' : ''} Selected
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
              {trueSelectedSeats.join(', ')}
            </div>
          </div>
          
          <div style={{ width: '1px', height: '40px', background: 'var(--border)' }}></div>
          
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Amount</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text)' }}>₹{totalAmount}</div>
          </div>

          <button 
            onClick={() => navigate(`/movies/${showtimeId}/snacks`, { state: { selectedSeats: trueSelectedSeats, totalAmount, showData } })}
            style={{
              padding: '12px 30px',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            Proceed to Snacks
          </button>
        </div>
      )}
    </div>
  );
}
