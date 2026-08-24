import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { SendIcon, CreditCardIcon, CircleCheckIcon, ShieldXIcon } from '@animateicons/react/lucide';
import CONFIG from '../config/config';
import { gameCardsData } from '../data/gamesData';
import Modal from './Modal';

function ProcessingPopup() {
  const [countdown, setCountdown] = useState(300);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const percent = (countdown / 300) * 100;

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', zIndex: 99999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px', textAlign: 'center', backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1a1a1a, #0a0a0a)',
        border: '1px solid rgba(183,139,39,0.3)', 
        borderRadius: '24px', 
        padding: '40px', 
        maxWidth: '450px', 
        boxShadow: '0 0 50px rgba(183,139,39,0.15), inset 0 0 20px rgba(183,139,39,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow effect in background */}
        <div style={{
          position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
          background: 'conic-gradient(from 0deg, transparent, rgba(183,139,39,0.05), transparent)',
          animation: 'spin 4s linear infinite', zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            margin: '0 auto 24px', width: '56px', height: '56px', 
            border: '4px solid rgba(183,139,39,0.1)', 
            borderTopColor: 'var(--primary)', 
            borderRadius: '50%', 
            animation: 'spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite' 
          }} />
          <h3 style={{ margin: '0 0 16px', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.5px' }}>
            Processing...
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', textShadow: '0 0 15px rgba(255,255,255,0.5)', letterSpacing: '4px' }}>
              {mins}:{secs.toString().padStart(2, '0')}
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '10px' }}>
              <div style={{ height: '100%', width: `${percent}%`, background: 'var(--primary, #3b82f6)', transition: 'width 1s linear', boxShadow: '0 0 10px var(--primary, #3b82f6)' }} />
            </div>
          </div>

          <p style={{ color: '#eee', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
            It might take <strong style={{color: 'var(--primary)'}}>3 to 5 minutes</strong> for a successful registration. 
            <br/><br/>
            <span style={{ color: '#ff4444', fontWeight: 600, background: 'rgba(255,0,0,0.1)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block' }}>
              ⚠ Do not close or refresh this tab
            </span>
            <br/><br/>
            <span style={{ fontSize: '0.85rem', color: '#999' }}>We are not responsible for the registration if the process is interrupted.</span>
          </p>
        </div>
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>,
    document.body
  );
}

/* ── Post data to Google Sheets via Apps Script ──── */
async function postToSheets(data) {
  if (CONFIG.googleSheetsWebhook === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    console.log('[DEV] Google Sheets submission (placeholder URL):', data);
    return;
  }
  await fetch(CONFIG.googleSheetsWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data),
  });
}

/* ── Common form fields (used in both tabs) ──────── */
function BaseFields({ prefix, t, showStaffFaculty = false, onEmailChange }) {
  const [isAmrita, setIsAmrita] = React.useState(false);

  const handleEmailBlur = (e) => {
    const email = e.target.value.toLowerCase();
    setIsAmrita(email.endsWith('@ch.students.amrita.edu'));
    onEmailChange && onEmailChange(email);
  };

  return (
    <div className="form-grid">
      <div className="form-group">
        <label htmlFor={`${prefix}-name`}>{t('register.form.name')} *</label>
        <input id={`${prefix}-name`} name="name" type="text" required placeholder={t('register.form.namePlaceholder')} />
      </div>
      <div className="form-group">
        <label htmlFor={`${prefix}-email`}>{t('register.form.email')} *</label>
        <input 
          id={`${prefix}-email`} 
          name="email" 
          type="email" 
          required 
          placeholder={t('register.form.emailPlaceholder')}
          pattern="^.*(@gmail\.com|@ch\.students\.amrita\.edu)$"
          title="Please use a @gmail.com or @ch.students.amrita.edu email address"
          onBlur={handleEmailBlur}
        />
      </div>
      <div className="form-group">
        <label htmlFor={`${prefix}-phone`}>{t('register.form.phone')} *</label>
        <input 
          id={`${prefix}-phone`} 
          name="phone" 
          type="tel" 
          required 
          pattern="^[6-9][0-9]{9}$"
          maxLength={10}
          title="Please enter a valid 10-digit Indian phone number"
          placeholder={t('register.form.phonePlaceholder')} 
        />
      </div>
      <div className="form-group">
        <label htmlFor={`${prefix}-dept`}>{t('register.form.dept')} *</label>
        <select id={`${prefix}-dept`} name="dept" required defaultValue="">
          <option value="" disabled>{t('register.form.deptPlaceholder')}</option>
          <option value="AIE">{t('register.deptAIE', 'AIE')}</option>
          <option value="CSE">{t('register.deptCSE', 'CSE')}</option>
          <option value="CYS">{t('register.deptCYS', 'CYS')}</option>
          <option value="CCE">{t('register.deptCCE', 'CCE')}</option>
          <option value="MEC">{t('register.deptMEC', 'MEC')}</option>
          <option value="ECE">{t('register.deptECE', 'ECE')}</option>
          <option value="EEE">{t('register.deptEEE', 'EEE')}</option>
          <option value="AIDS">{t('register.deptAIDS', 'AIDS')}</option>
          <option value="Others">{t('register.deptOthers', 'Others')}</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor={`${prefix}-year`}>{t('register.form.year')} *</label>
        <select id={`${prefix}-year`} name="year" required defaultValue="">
          <option value="" disabled>{t('register.form.yearPlaceholder')}</option>
          <option value="1st Year">{t('register.form.year1')}</option>
          <option value="2nd Year">{t('register.form.year2')}</option>
          <option value="3rd Year">{t('register.form.year3')}</option>
          <option value="4th Year">{t('register.form.year4')}</option>
          {showStaffFaculty && (
            <>
              <option value="Staff">{t('register.form.staff', 'Staff')}</option>
              <option value="Faculty">{t('register.form.faculty', 'Faculty')}</option>
            </>
          )}
        </select>
      </div>

      {/* Student ID — required only for Amrita Chennai campus students */}
      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
        <label htmlFor={`${prefix}-studentId`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Student ID
          {isAmrita 
            ? <span style={{ fontSize: '0.75rem', background: 'rgba(183,139,39,0.15)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(183,139,39,0.3)' }}>Required for Amrita students</span>
            : <span style={{ fontSize: '0.75rem', color: '#666' }}>(Optional)</span>
          }
        </label>
        <input
          id={`${prefix}-studentId`}
          name="studentId"
          type="text"
          required={isAmrita}
          placeholder={isAmrita ? 'e.g. CB.EN.U4CSE23001' : 'Optional — Enter if Amrita student'}
          style={{ textTransform: 'uppercase' }}
          onChange={e => e.target.value = e.target.value.toUpperCase()}
          title="Enter your Amrita student ID (e.g. CB.EN.U4CSE23001)"
        />
      </div>
    </div>
  );
}

/* ── Free / Volunteer Registration Form ────────────── */
function FreeForm({ t, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  
  const handleProceed = async (e) => {
    e.preventDefault();
    const fd = new FormData(formRef.current);
    const data = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      dept: fd.get('dept'),
      year: fd.get('year'),
      role: fd.get('role'),
      studentId: fd.get('studentId') || '',
      games: [],
      amount: 0
    };
    
    for (const [key, val] of Object.entries(data)) {
      if (key !== 'games' && key !== 'amount' && key !== 'studentId' && !val) {
        alert('Please fill in all required fields.');
        return;
      }
    }
    
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/register/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Registration failed');
      formRef.current?.reset();
      onSuccess('free', result.token);
    } catch {
      onError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="free-form" className="reg-form card" onSubmit={handleProceed} ref={formRef}>
      {loading && <ProcessingPopup />}
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
          Volunteer Registration
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Sign up to volunteer and help make Anantya a grand success!
        </p>
      </div>

      <BaseFields prefix="free" t={t} />

      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label htmlFor="free-role">Select Volunteer Role *</label>
        <select id="free-role" name="role" required defaultValue="">
          <option value="" disabled>Select your role...</option>
          <option value="Decoration Volunteer">{t('register.roles.decoration', 'Decoration Volunteer')}</option>
          <option value="Disciplinary Volunteer">{t('register.roles.disciplinary', 'Disciplinary Volunteer')}</option>
          <option value="Prasadam Distribution Volunteer">{t('register.roles.prasadam', 'Prasadam Distribution Volunteer')}</option>
        </select>
      </div>

      <button type="submit" className="submit-btn" style={{ marginTop: '2rem' }}>
        <CircleCheckIcon size={16} color="#fff" style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} /> 
        Submit Application
      </button>
    </form>
  );
}

/* ── Razorpay Payment Step ───────────────────────── */
function RazorpayPaymentStep({ amount, baseData, onSuccess, onError, onBack, t }) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Load Razorpay checkout.js dynamically if not already loaded
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Failed to load payment gateway. Please check your internet connection.');
        return;
      }

      // 2. Create order on server
      const orderRes = await fetch(`${apiUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baseData),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData.error || 'Failed to create payment order');
        return;
      }

      // 3. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'Anantya — Janmashtami 2025',
        description: `Games: ${(baseData.games || []).join(', ')}`,
        image: '/favicon.ico',
        prefill: {
          name: baseData.name,
          email: baseData.email,
          contact: baseData.phone,
        },
        theme: { color: '#B78B27' },
        handler: async (response) => {
          // Payment success callback from Razorpay SDK
          setStatusMsg('Payment received! Confirming your registration...');
          try {
            // Verify payment signature on server
            const verifyRes = await fetch(`${apiUrl}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.status === 'verified') {
              onSuccess('paid', verifyData.token);
            } else if (verifyData.status === 'processing') {
              // Webhook may still be processing — poll a couple of times
              let attempts = 0;
              const poll = setInterval(async () => {
                attempts++;
                setStatusMsg(`Confirming registration... (${attempts}/5)`);
                const r = await fetch(`${apiUrl}/api/payment/verify`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  }),
                });
                const d = await r.json();
                if (d.status === 'verified') {
                  clearInterval(poll);
                  onSuccess('paid', d.token);
                } else if (attempts >= 5) {
                  clearInterval(poll);
                  // Payment went through — email will arrive. Show success anyway.
                  onSuccess('paid', null);
                }
              }, 3000);
            } else {
              setError('Payment received but verification failed. Please contact organizers with your payment ID: ' + response.razorpay_payment_id);
            }
          } catch {
            setError('Payment received but an error occurred. Please contact organizers.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setStatusMsg('');
          }
        },
      });

      rzp.on('payment.failed', (response) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-form card" style={{ textAlign: 'center', padding: '2rem 1.5rem', maxWidth: '480px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{
          display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px',
          color: 'var(--primary)', background: 'rgba(183,139,39,0.12)', padding: '4px 14px',
          borderRadius: '20px', border: '1px solid rgba(183,139,39,0.3)', marginBottom: '10px'
        }}>STEP 2 OF 2</span>
        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
          Complete Your Payment
        </h3>
        <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Secure payment powered by Razorpay
        </p>
      </div>

      {/* Amount pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        padding: '10px 28px', borderRadius: '50px', marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(183,139,39,0.18), rgba(183,139,39,0.06))',
        border: '1px solid rgba(183,139,39,0.35)',
      }}>
        <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 600 }}>AMOUNT</span>
        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>₹{amount}</span>
      </div>

      {/* Games summary */}
      <div style={{ marginBottom: '2rem', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#aaa' }}>Games: <span style={{ color: '#fff' }}>{(baseData.games || []).join(', ')}</span></p>
      </div>

      {/* Pay button */}
      {statusMsg ? (
        <div style={{ padding: '20px', color: 'var(--primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div style={{ width: '18px', height: '18px', border: '2px solid rgba(183,139,39,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
          {statusMsg}
        </div>
      ) : (
        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="submit-btn pay-btn"
          style={{ width: '100%', marginBottom: '12px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Opening Payment...' : `🔒 Pay ₹${amount} Securely`}
        </button>
      )}

      {error && (
        <p style={{ color: 'var(--rose)', fontSize: '0.82rem', margin: '10px 0', background: 'rgba(244,63,94,0.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.2)' }}>
          ⚠ {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button type="button" onClick={onBack} style={{
          flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
          background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
          color: '#888', fontSize: '0.85rem', fontFamily: 'inherit'
        }}>← Back</button>
      </div>

      <p style={{ fontSize: '0.72rem', color: '#444', margin: '16px 0 0' }}>
        🔒 Powered by Razorpay. Supports UPI, cards, netbanking & wallets.
      </p>
    </div>
  );
}

/* ── Paid Games Form ─────────────────────────────── */
export function PaidForm({ t, onSuccess, onError, initialGameId }) {
  const [selected, setSelected] = useState(() => {
    if (initialGameId) {
      const game = gameCardsData.find(g => g.id.toString() === initialGameId);
      if (game) return { [game.title]: true };
    }
    return {};
  });
  const [step, setStep] = useState('form'); // 'form' | 'razorpay'
  const [baseData, setBaseData] = useState(null);
  const [secretCode, setSecretCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [isSecretInputVisible, setIsSecretInputVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  // Check if any selected game allows staff/faculty
  const hasSpecialEventSelected = gameCardsData.some(
    (game) => selected[game.title] && game.allowStaffFaculty
  );

  const baseTotal = gameCardsData.reduce((sum, game) => (selected[game.title] ? sum + game.price : sum), 0);
  const total = Math.max(0, baseTotal - discount);

  const toggle = (title) => {
    setSelected((prev) => {
      const newSelected = (prev[title] ? {} : { [title]: true });
      setDiscount(0);
      setSecretCode('');
      setDiscountError('');
      return newSelected;
    });
  };

  // H-1: Discount codes are validated server-side ONLY.
  // The actual code strings (KRISHNA50, DEV100) and discount logic are never
  // shipped to the browser — only the resulting discount amount is returned.
  const handleApplyCode = async () => {
    if (!secretCode.trim()) return;
    setDiscountLoading(true);
    setDiscountError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/pricing/validate-discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: secretCode.trim(), baseTotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setDiscount(0);
        setDiscountError(data.error || 'Invalid secret code');
      } else {
        setDiscount(data.discount);
        setDiscountError('');
      }
    } catch {
      setDiscountError('Could not validate code. Please try again.');
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    const selectedGames = gameCardsData.filter((game) => selected[game.title]);
    if (!selectedGames.length) {
      alert(t('register.form.noGamesSelected'));
      return;
    }

    const fd = new FormData(formRef.current);
    const data = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      dept: fd.get('dept'),
      year: fd.get('year'),
      role: 'Games Participant',
      games: selectedGames.map((g) => g.title),
      secretCode: discount > 0 ? secretCode.trim().toUpperCase() : '',
      studentId: fd.get('studentId') || '',
    };

    for (const [key, val] of Object.entries(data)) {
      if (key !== 'role' && key !== 'secretCode' && key !== 'studentId' && !val) {
        alert('Please fill in all required fields.');
        return;
      }
    }

    // If total is 0 after discount, use free endpoint
    if (total === 0) {
      handleFreeSubmit(data);
      return;
    }

    setBaseData(data);
    setStep('razorpay'); // Go to Razorpay checkout first
  };

  const handleFreeSubmit = async (data) => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/register/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, amount: 0 })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Registration failed');
      formRef.current?.reset();
      setSelected({});
      setSecretCode('');
      setDiscount(0);
      onSuccess('free', result.token);
    } catch {
      onError();
    } finally {
      setLoading(false);
    }
  };

  const resetPayment = () => {
    formRef.current?.reset();
    setSelected({});
    setSecretCode('');
    setDiscount(0);
    setStep('form');
  };

  if (step === 'razorpay' && baseData) {
    return (
      <RazorpayPaymentStep
        t={t}
        amount={total}
        baseData={{ ...baseData, secretCode: discount > 0 ? secretCode.trim().toUpperCase() : '' }}
        onSuccess={(type, token) => { resetPayment(); onSuccess(type, token); }}
        onError={onError}
        onBack={() => setStep('form')}
      />
    );
  }

  return (
    <form id="paid-form" className="reg-form card" onSubmit={handleProceedToPayment} ref={formRef}>
      {loading && <ProcessingPopup />}
      <BaseFields prefix="paid" t={t} showStaffFaculty={hasSpecialEventSelected} />

      {/* Game selection */}
      {initialGameId ? (
        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="games-title" style={{ color: '#aaaaaa', fontSize: '0.9rem', margin: '0 0 4px 0' }}>{t('register.registeringFor', 'Registering for:')}</p>
          {(() => {
            const g = gameCardsData.find(x => x.id.toString() === initialGameId);
            if (!g) return null;
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h4 className="game-label-text" style={{ fontSize: '1.4rem', color: 'var(--primary)', margin: 0 }}>
                    {g.isComingSoon ? "Coming Soon" : t(`games.${g.id}.title`)}
                  </h4>
                  {g.isSpecialEvent && (
                    <span className="special-event-badge">⭐ {t('gamePage.specialEvent', 'Special Event')}</span>
                  )}
                </div>
                {g.allowStaffFaculty && (
                  <p style={{ color: '#999', fontSize: '0.8rem', margin: '6px 0 0 0' }}>
                    👥 {t('gamePage.staffFacultyAllowed', 'Staff & Faculty can also participate')}
                  </p>
                )}
              </>
            );
          })()}
        </div>
      ) : (
        <>
          <p className="games-title">{t('register.form.gamesTitle')}</p>
          <p className="games-subtitle">{t('register.form.gamesSubtitle')}</p>
          <div className="games-grid">
            {gameCardsData.map((game) => (
              <label key={game.title} className={`game-label ${selected[game.title] ? 'selected' : ''} ${game.isSpecialEvent ? 'special-event' : ''}`} style={game.isComingSoon ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                <input
                  type="checkbox"
                  disabled={game.isComingSoon}
                  checked={!!selected[game.title]}
                  onChange={() => { if (!game.isComingSoon) toggle(game.title); }}
                />
                <span className="checkbox-custom" />
                <div className="game-card-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h4 className="game-label-text" style={{ margin: 0 }}>{game.isComingSoon ? "Coming Soon" : t(`games.${game.id}.title`)}</h4>
                    {game.isSpecialEvent && (
                      <span className="special-event-badge">⭐ {t('gamePage.specialEvent', 'Special Event')}</span>
                    )}
                  </div>
                  {game.allowStaffFaculty && (
                    <p className="game-info" style={{ fontSize: '0.75rem' }}>
                      👥 {t('gamePage.staffFacultyAllowed', 'Staff & Faculty can also participate')}
                    </p>
                  )}
                  <p className="game-info"><span>{t('gamePage.venue')}:</span> {game.isComingSoon ? "Coming Soon" : game.venue}</p>
                  <p className="game-info"><span>{t('gamePage.time')}:</span> {game.isComingSoon ? "Coming Soon" : game.time}</p>
                  <p className="game-info"><span>{t('gamePage.organizer')}:</span> {game.isComingSoon ? "Coming Soon" : game.venueOrganizer}</p>
                  <p className="game-info"><span>{t('gamePage.gamesHead')}:</span> {game.isComingSoon ? "Coming Soon" : game.gamesHead}</p>
                  <span className="game-price">{game.isComingSoon ? "Coming Soon" : (game.price > 0 ? `₹${game.price}` : t('gamePage.free'))}</span>
                </div>
              </label>
            ))}
          </div>
        </>
      )}

      {/* Secret Code */}
      {baseTotal > 0 && (
        <div style={{ marginBottom: '16px', display: isSecretInputVisible ? 'block' : 'none' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Secret Code" 
              value={secretCode} 
              onChange={(e) => setSecretCode(e.target.value)} 
              style={{ flex: 1 }}
            />
            <button type="button" onClick={handleApplyCode} disabled={discountLoading} className="submit-btn" style={{ padding: '10px 20px', width: 'auto', opacity: discountLoading ? 0.6 : 1 }}>
              {discountLoading ? '...' : 'Apply'}
            </button>
          </div>
          {discountError && <p style={{ color: 'var(--rose)', fontSize: '0.9rem', marginTop: '5px' }}>{discountError}</p>}
          {discount > 0 && <p style={{ color: 'var(--green)', fontSize: '0.9rem', marginTop: '5px' }}>{t('register.discountApplied', 'Discount applied: ₹')}{discount}</p>}
        </div>
      )}

      {/* Total */}
      <div className="total-row">
        <span 
          className="total-label" 
          onClick={() => setIsSecretInputVisible(!isSecretInputVisible)}
          style={{ cursor: 'pointer' }}
          title="Click to reveal secret code"
        >
          {t('register.form.total')}
        </span>
        <span className="total-amount">
          {discount > 0 && <span style={{ textDecoration: 'line-through', fontSize: '1rem', color: '#888', marginRight: '10px' }}>₹{baseTotal}</span>}
          ₹{total}
        </span>
      </div>

      <button
        type="submit"
        id="paid-submit-btn"
        className="submit-btn pay-btn"
        disabled={Object.keys(selected).filter(k => selected[k]).length === 0}
      >
        {total > 0 
          ? <><CreditCardIcon size={16} color="#fff" /> Proceed to Pay — ₹{total}</>
          : <><CircleCheckIcon size={16} color="#fff" /> {t('register.freeRegister', 'Register — Free')}</>}
      </button>
    </form>
  );
}

/* ── Main Registration Section ───────────────────── */
export default function Registration({ onlyGames = false, hideTabs = false, initialGameId = null }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(onlyGames ? 'paid' : 'free');
  const [modal, setModal] = useState(null);

  const downloadToken = (token) => {
    const element = document.createElement("a");
    const file = new Blob([`Anantya Registration Token: ${token}\nPlease present this token at the event.`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Anantya_Token_${token}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const openSuccess = (formType, token) =>
    setModal({
      icon: '🎉',
      title: t('register.success.title'),
      message: (
        <>
          <p style={{ margin: '0 0 16px 0' }}>{t(`register.success.${formType}`)}</p>
          {token && (
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#aaa' }}>{t('register.yourToken', 'Your Registration Token')}</p>
              <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary)', letterSpacing: '2px', fontSize: '1.5rem' }}>{token}</h3>
              <button 
                onClick={() => downloadToken(token)}
                className="submit-btn"
                style={{ padding: '8px 16px', width: 'auto', fontSize: '0.9rem', margin: '0 auto', display: 'block' }}
              >
                Download Token
              </button>
            </div>
          )}
        </>
      ),
    });

  const openError = () =>
    setModal({
      icon: '❌',
      title: t('register.error.title'),
      message: t('register.error.message'),
    });

  return (
    <section id="register" className={onlyGames ? '' : 'section'}>
      <div className="container">
        
        {!onlyGames && !hideTabs && (
          <>
            <div className="section-header">
              <span className="section-eyebrow">{t('register.subtitle')}</span>
              <h2 className="section-title">{t('register.title')}</h2>
            </div>

            {/* Tabs */}
            <div className="reg-tabs">
              <button
                id="tab-free"
                className={`reg-tab${activeTab === 'free' ? ' active' : ''}`}
                onClick={() => setActiveTab('free')}
              >
                {t('register.tabs.free')}
              </button>
              <button
                id="tab-paid"
                className={`reg-tab${activeTab === 'paid' ? ' active' : ''}`}
                onClick={() => setActiveTab('paid')}
              >
                {t('register.tabs.paid')}
              </button>
            </div>
          </>
        )}

        {/* Forms */}
        {!onlyGames && (
          <div className={`reg-form-wrap${activeTab === 'free' ? ' visible' : ''}`} style={{ display: activeTab === 'free' ? 'block' : 'none' }}>
            <FreeForm t={t} onSuccess={openSuccess} onError={openError} />
          </div>
        )}
        
        <div className={`reg-form-wrap${activeTab === 'paid' ? ' visible' : ''}`} style={{ display: activeTab === 'paid' ? 'block' : 'none' }}>
          <PaidForm t={t} onSuccess={openSuccess} onError={openError} initialGameId={initialGameId} />
        </div>
      </div>

      {/* Success / Error Modal */}
      {modal && (
        <Modal
          icon={modal.icon === '🎉' ? <CircleCheckIcon size={52} color="var(--green)" /> : <ShieldXIcon size={52} color="var(--rose)" />}
          title={modal.title}
          message={modal.message}
          onClose={() => setModal(null)}
        />
      )}
    </section>
  );
}
