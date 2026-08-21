import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { SpotlightNavbar } from '../components/SpotlightNavbar';

export default function MovieCheckoutPage() {
  const { showtimeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSeats = [], seatAmount = 0, snacksAmount = 0, totalAmount = 0, snacks = [], showData = null } = location.state || {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    transactionId: ''
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsPage, setShowTermsPage] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Lock expiry timer
  useEffect(() => {
    if (selectedSeats.length === 0) {
      navigate(`/movies/${showtimeId}/seats`);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Your seat reservation has expired. Please try booking again.');
          navigate(`/movies/${showtimeId}/seats`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSeats, navigate, showtimeId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((formData.participantType === 'Student' || formData.participantType === 'Faculty') && !formData.collegeId) {
      setError('College ID / Registration number is required for Amrita students and faculty.');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the terms and conditions.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const sessionToken = localStorage.getItem('anantya_movie_session_token');
      const payload = {
        showtimeId,
        sessionToken,
        seats: selectedSeats,
        amount: totalAmount,
        snacks,
        ...formData
      };

      const res = await fetch(`${apiUrl}/api/movies/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setSuccessData({
          bookingId: data.bookingId,
          token: data.token,
          qrCode: data.qrCode
        });
      } else {
        setError(data.error || 'Failed to book seats.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error during checkout.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const downloadInvitation = () => {
    if (!successData || !showData) return;

    const hasSnacks = snacks && snacks.length > 0;
    const baseHeight = 360;
    const canvasHeight = hasSnacks ? 450 : 360;

    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Ticket Background (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top Header Ribbon
    ctx.fillStyle = '#ef4444'; // Red header
    ctx.fillRect(0, 0, canvas.width, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('ANANTYA CINEMAS', 30, 33);

    // Stub Separator (Dashed Line)
    ctx.beginPath();
    ctx.setLineDash([8, 8]);
    ctx.moveTo(720, 50);
    ctx.lineTo(720, canvas.height);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Cutouts for ticket look
    ctx.fillStyle = 'var(--bg)';
    ctx.beginPath();
    ctx.arc(720, 0, 15, 0, Math.PI, false); // top cutout
    ctx.fill();
    ctx.beginPath();
    ctx.arc(720, canvas.height, 15, Math.PI, 0, false); // bottom cutout
    ctx.fill();

    // Movie Details (Left Side)
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillText(showData.movieTitle || 'Movie', 40, 110, 640);

    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('SCREEN', 40, 160);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(showData.screen?.name || 'Main Screen', 40, 185, 300);

    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('DATE', 360, 160);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(new Date(showData.date).toLocaleDateString(), 360, 185);

    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('TIME', 550, 160);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(showData.time, 550, 185);

    // Divider line
    ctx.beginPath();
    ctx.moveTo(40, 220);
    ctx.lineTo(680, 220);
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Seats & Booking
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('SEATS', 40, 260);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(selectedSeats.join(', '), 40, 290, 350);

    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('BOOKING ID', 420, 260);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 16px system-ui, sans-serif';
    let bId = successData.bookingId;
    if (bId.length > 20) {
      ctx.font = 'bold 13px system-ui, sans-serif';
    }
    ctx.fillText(bId, 420, 290, 260);

    if (hasSnacks) {
      // Divider line for snacks
      ctx.beginPath();
      ctx.moveTo(40, 315);
      ctx.lineTo(680, 315);
      ctx.strokeStyle = '#f3f4f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('SNACKS PRE-ORDER', 40, 345);
      
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 16px system-ui, sans-serif';
      let snackText = snacks.map(s => `${s.quantity}x ${s.name}`).join(' • ');
      
      // Word wrap logic for snacks text
      const maxWidth = 640;
      let words = snackText.split(' ');
      let line = '';
      let y = 370;
      for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, 40, y);
          line = words[n] + ' ';
          y += 24;
        }
        else {
          line = testLine;
        }
      }
      ctx.fillText(line, 40, y);
    }

    // Footer info
    const footerY = canvasHeight - 25;
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillStyle = '#9ca3af';
    let bookedByText = `Booked by: ${formData.name}`;
    if ((formData.participantType === 'Student' || formData.participantType === 'Faculty') && formData.collegeId) {
      bookedByText += ` (${formData.collegeId})`;
    }
    ctx.fillText(bookedByText, 40, footerY);
    ctx.fillText(`Amount Paid: Rs. ${totalAmount}`, 380, footerY);

    // Right Side Stub (QR Code)
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ENTRY PASS', 860, 95);
    ctx.textAlign = 'left';

    const qrImg = new Image();
    qrImg.crossOrigin = 'Anonymous';
    qrImg.onload = () => {
      const qrSize = 160;
      const qrX = 780;
      const qrY = (canvasHeight / 2) - 30; // Centered
      
      // Draw QR Code
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Session Token below QR
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      const shortToken = successData.token ? successData.token.toString().substring(0, 32) : '';
      ctx.fillText(`Token: ${shortToken}`, qrX + qrSize/2, qrY + qrSize + 25);
      
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('Scan at the cinema entrance', qrX + qrSize/2, qrY + qrSize + 40);
      
      ctx.textAlign = 'left';

      // Trigger download
      const link = document.createElement('a');
      link.download = `Anantya_Ticket_${successData.bookingId}.webp`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    qrImg.src = successData.qrCode;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '100px' }}>
      <SpotlightNavbar />
      
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '100px', paddingLeft: '20px', paddingRight: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--primary-dark)' }}>Checkout</h1>
          <div style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#ef4444', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold' }}>
            Time remaining: {formatTime(timeLeft)}
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {successData ? (
          <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: '20px' }}>
              <span style={{ fontSize: '40px' }}>✓</span>
            </div>
            <h2 style={{ fontSize: '2.5rem', color: '#10b981', margin: '0 0 10px 0' }}>Booking Successful!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '30px' }}>Your tickets for {showData?.movieTitle} have been booked.</p>
            
            <div style={{ background: 'var(--bg-alt)', padding: '30px', borderRadius: '16px', display: 'inline-block', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--primary-dark)', margin: '0 0 20px 0' }}>Your Entry QR Code</h3>
              <img src={successData.qrCode} alt="Movie Ticket QR" style={{ display: 'block', margin: '0 auto', width: '250px', height: '250px', borderRadius: '12px', background: '#fff', padding: '10px' }} />
              
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Booking ID: <strong style={{ color: 'var(--text)' }}>{successData.bookingId}</strong></p>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Session Token: <strong style={{ color: 'var(--text)' }}>{successData.token}</strong></p>
              </div>

              <button 
                onClick={downloadInvitation}
                style={{ 
                  display: 'inline-block', 
                  marginTop: '25px', 
                  padding: '12px 24px', 
                  background: 'var(--primary)', 
                  color: '#fff', 
                  border: 'none',
                  textDecoration: 'none', 
                  borderRadius: '8px', 
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Download Invitation Ticket
              </button>
            </div>
            
            <div style={{ marginTop: '40px' }}>
              <button 
                onClick={() => navigate('/')}
                style={{ padding: '12px 30px', background: 'transparent', color: 'var(--text)', border: '2px solid var(--border)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Return to Home
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Booking Summary */}
            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', height: 'fit-content' }}>
              <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary-dark)' }}>Booking Summary</h3>
              {showData && (
                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{showData.movieTitle}</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{showData.screen?.name}</p>
                  <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(showData.date).toLocaleDateString()} at {showData.time}</p>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Selected Seats</span>
                <strong>{selectedSeats.join(', ')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tickets</span>
                <strong>{selectedSeats.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Seats Amount</span>
                <strong>₹{seatAmount || totalAmount}</strong>
              </div>

              {snacks.length > 0 && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed var(--border)' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-light)' }}>Snacks Pre-order</h4>
                  {snacks.map((snack, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{snack.quantity}x {snack.name}</span>
                      <span>₹{snack.total}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.95rem', fontWeight: 'bold' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Snacks Amount</span>
                    <span>₹{snacksAmount}</span>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--primary-dark)' }}>₹{totalAmount}</span>
              </div>
            </div>

            {/* QR Code Section */}
            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', textAlign: 'center', height: 'fit-content' }}>
              <h3 style={{ margin: '0 0 15px 0', color: 'var(--primary-dark)' }}>Scan to Pay</h3>
              <img src="/assets/games payment qr with upi id.webp" alt="UPI QR Code" style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '250px', height: 'auto', borderRadius: '8px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '15px' }}>Scan the QR code above or use UPI ID: <br/><strong>payment@upi</strong></p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary-dark)' }}>Your Details</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-alt)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-alt)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Phone Number</label>
              <input type="tel" name="phone" required pattern="[6-9][0-9]{9}" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-alt)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Participant Type *</label>
              <select 
                name="participantType" 
                required 
                value={formData.participantType || ''} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-alt)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >
                <option value="" disabled>Select Participant Type</option>
                <option value="Student">Amrita Chennai Student</option>
                <option value="Faculty">Amrita Chennai Faculty</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {(formData.participantType === 'Student' || formData.participantType === 'Faculty') && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>College ID / Registration Number *</label>
                <input 
                  type="text" 
                  name="collegeId" 
                  required 
                  value={formData.collegeId || ''} 
                  onChange={handleChange} 
                  placeholder={`Enter your ${formData.participantType === 'Student' ? 'registration number' : 'employee ID'}`}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-alt)', border: '1px solid var(--border)', color: 'var(--text)' }} 
                />
              </div>
            )}

            <h3 style={{ margin: '30px 0 20px 0', color: 'var(--primary-dark)', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>Payment</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Please scan the QR code below or use the UPI ID <strong>payment@upi</strong> to pay ₹{totalAmount}. Enter your transaction ID below.</p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Transaction / UTR ID</label>
              <input type="text" name="transactionId" required minLength={6} value={formData.transactionId} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-alt)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="e.g. 301234567890" />
            </div>

            {/* Terms and Conditions */}
            <div style={{ marginTop: '30px', marginBottom: '20px', textAlign: 'center', background: 'var(--bg-alt)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              {!acceptedTerms ? (
                <>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '10px' }}>
                    You must accept the Terms and Conditions to proceed.
                  </p>
                  <button 
                    type="button" 
                    onClick={() => setShowTermsPage(true)}
                    style={{ background: 'var(--primary-xlight)', border: '1px solid var(--primary)', color: 'var(--primary-dark)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Read Terms and Conditions
                  </button>
                </>
              ) : (
                <div style={{ color: 'var(--green)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  ✓ Terms and Conditions Accepted
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={!acceptedTerms || loading}
              style={{
                width: '100%',
                padding: '12px',
                background: (!acceptedTerms || loading) ? '#D1D5DB' : 'var(--primary)',
                color: (!acceptedTerms || loading) ? '#6B7280' : '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: (!acceptedTerms || loading) ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                boxShadow: (!acceptedTerms || loading) ? 'none' : 'var(--shadow-md)'
              }}
            >
              {loading ? 'Processing...' : `Confirm & Pay ₹${totalAmount}`}
            </button>
          </form>
        </div>
        )}
      </div>

      {/* Full-Screen Terms and Conditions Overlay Page */}
      {showTermsPage && (
        <div data-lenis-prevent style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(5px)',
          zIndex: 99999,
          overflowY: 'auto',
          padding: '40px 20px',
          color: 'var(--text)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ maxWidth: '800px', width: '100%', background: 'var(--surface)', padding: '40px 30px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}>
            <h2 style={{ color: 'var(--primary-dark)', marginBottom: '20px', textAlign: 'center' }}>Terms and Conditions</h2>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <strong>Terms and Conditions — Anantya 2026 (Janmashtami Committee, AVV Chennai)</strong><br/>
              <em>Last updated: August 2026</em><br/><br/>
              
              By registering for any event, game, or activity under Anantya 2026 ("the Event"), organized by the Janmashtami Committee, AVV Chennai ("the Organizers," "we," "us"), you ("the Participant," "you") agree to be bound by the following Terms and Conditions. Please read them carefully before completing your registration. If you do not agree to these terms, do not proceed with registration.<br/><br/>
              
              <strong>1. Registration</strong><br/>
              1.1 Registration is confirmed only upon successful payment verification (where applicable) by the Organizers, and issuance of a valid registration token.<br/>
              1.2 It is the Participant's responsibility to ensure all information provided during registration (name, email, phone number, department, year, transaction ID) is accurate and complete. The Organizers are not responsible for any loss arising from incorrect information submitted by the Participant.<br/>
              1.3 The Organizers reserve the right to reject, revoke, or cancel any registration at their sole discretion, including but not limited to cases of suspected fraud, duplicate registration, or misuse of the registration/payment system.<br/><br/>
              
              <strong>2. Payment and Refund Policy</strong><br/>
              2.1 All payments made for movie bookings are final and non-refundable.<br/>
              2.2 There will be <strong>No refunds for anything</strong>, regardless of cancellation, non-attendance, or rescheduling by the Organizers.<br/>
              2.3 The Organizers are not responsible for any payment made to an incorrect UPI ID, incorrect amount, or any transaction error caused by the Participant's payment provider or bank.<br/><br/>
              
              <strong>3. Participant Conduct</strong><br/>
              3.1 Participants are expected to conduct themselves respectfully and in accordance with the rules of each individual game or activity, as communicated by the Organizers or volunteers on-site.<br/>
              3.2 The Organizers reserve the right to remove any Participant from an event or the venue, without refund, for conduct deemed disruptive, unsafe, or inappropriate.<br/>
              3.3 Participants under the age of 18 may be required to have consent or supervision as specified separately for specific activities, where applicable.<br/><br/>
              
              <strong>4. Liability</strong><br/>
              4.1 Participation in all events and activities is at the Participant's own risk. The Organizers, AVV Chennai, and its volunteers shall not be held liable for any injury, loss, or damage to persons or property arising from participation in the Event, except where caused by proven gross negligence on the part of the Organizers.<br/>
              4.2 Participants are responsible for their own belongings during the Event. The Organizers are not responsible for lost, stolen, or damaged personal items.<br/><br/>
              
              <strong>5. Verification and Entry</strong><br/>
              5.1 Entry to events is subject to presentation of a valid registration token/QR code (or equivalent proof of registration) at the venue.<br/>
              5.2 The Organizers reserve the right to deny entry to any Participant who cannot produce valid proof of registration, or whose registration has not been verified by the Organizers prior to the event.<br/><br/>
              
              <strong>6. Changes to These Terms</strong><br/>
              6.1 The Organizers reserve the right to amend these Terms and Conditions at any time. Continued registration or participation after any such amendment constitutes acceptance of the revised terms.<br/><br/>
              
              <strong>7. Governing Law</strong><br/>
              7.1 These Terms and Conditions shall be governed by and construed in accordance with the laws of India, and subject to the jurisdiction of the courts in Chennai, Tamil Nadu.<br/>
            </div>
            
            <div style={{ marginTop: '40px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => setShowTermsPage(false)}
                style={{ 
                  padding: '12px 24px', 
                  borderRadius: '8px', 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)', 
                  color: 'var(--text)', 
                  cursor: 'pointer' 
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowTermsPage(false);
                }}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
              >
                I Agree & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
