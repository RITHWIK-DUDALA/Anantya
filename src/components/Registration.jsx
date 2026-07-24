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
function BaseFields({ prefix, t, showStaffFaculty = false }) {
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
    </div>
  );
}

/* ── Free Registration Form ──────────────────────── */
function FreeForm({ t, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      dept: fd.get('dept'),
      year: fd.get('year'),
      role: fd.get('role'),
      games: '',
      amount: 0,
    };
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/register/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Registration failed');
      e.target.reset();
      onSuccess('free', result.token);
    } catch (err) {
      onError();
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'Cultural Participant',            key: 'register.form.roles.cultural' },
    { value: 'Decoration Volunteer',            key: 'register.form.roles.decoration' },
    { value: 'Disciplinary Volunteer',          key: 'register.form.roles.disciplinary' },
    { value: 'Prasadam Distribution Volunteer', key: 'register.form.roles.prasadam' },
    { value: 'Games Participant (free)',         key: 'register.form.roles.games' },
  ];

  return (
    <form id="free-form" className="reg-form card" onSubmit={handleSubmit}>
      {loading && <ProcessingPopup />}
      <BaseFields prefix="free" t={t} />
      <div className="form-grid">
        <div className="form-group full">
          <label htmlFor="free-role">{t('register.form.role')} *</label>
          <select id="free-role" name="role" required defaultValue="">
            <option value="" disabled>{t('register.form.rolePlaceholder')}</option>
            {roles.map(({ value, key }) => (
              <option key={value} value={value}>{t(key)}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" className="submit-btn" disabled={loading} id="free-submit-btn">
        {loading
          ? t('register.form.submitting')
          : <><SendIcon size={16} color="#fff" /> {t('register.form.submit')}</>}
      </button>
    </form>
  );
}

/* ── UPI Payment Step ────────────────────────────── */
function UpiPaymentStep({ amount, baseData, onSuccess, onError, onBack, t }) {
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!transactionId.trim() || transactionId.trim().length < 6) {
      setError('Please enter a valid UPI transaction ID (minimum 6 characters)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/register/paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseData, transactionId: transactionId.trim() })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Registration failed');
      onSuccess('paid', result.token);
    } catch (err) {
      onError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-form card" style={{ textAlign: 'center', padding: '2rem 1.5rem', maxWidth: '480px', margin: '0 auto' }}>
      {loading && <ProcessingPopup />}

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{
          display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px',
          color: 'var(--primary)', background: 'rgba(183,139,39,0.12)', padding: '4px 14px',
          borderRadius: '20px', border: '1px solid rgba(183,139,39,0.3)', marginBottom: '10px'
        }}>{t('register.step2', 'STEP 2 OF 2')}</span>
        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
          Complete Your Payment
        </h3>
        <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Scan the QR code and pay the amount below
        </p>
      </div>

      {/* Amount pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        padding: '10px 28px', borderRadius: '50px', marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(183,139,39,0.18), rgba(183,139,39,0.06))',
        border: '1px solid rgba(183,139,39,0.35)',
      }}>
        <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 600 }}>{t('register.amountLabel', 'AMOUNT')}</span>
        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>₹{amount}</span>
      </div>

      {/* QR Code */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '280px', margin: '0 auto 1rem',
      }}>
        {/* Glow ring */}
        <div style={{
          position: 'absolute', inset: '-6px', borderRadius: '22px',
          background: 'linear-gradient(135deg, var(--primary), transparent)',
          opacity: 0.3, filter: 'blur(8px)',
        }} />
        <div style={{
          position: 'relative', width: '100%', borderRadius: '16px',
          border: '2px solid rgba(183,139,39,0.5)', overflow: 'hidden',
          background: '#fff', zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <img
            src="/assets/games payment qr with upi id.jpeg"
            alt="UPI QR Code"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;gap:6px;color:#999;padding:16px;text-align:center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h.01M14 18h3M18 14v3M18 18h.01"/></svg>
                  <span style="font-size:0.75rem;color:#aaa">${t('register.uploadUpi', 'Add upi-qr.png<br/>to public/ folder')}</span>
                </div>`;
            }}
          />
        </div>
      </div>

      {/* UPI ID */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '8px 18px', borderRadius: '10px', marginBottom: '1rem',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <span style={{ fontSize: '0.82rem', color: '#aaa', fontWeight: 600 }}>UPI ID:</span>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#5b9bf5', letterSpacing: '0.5px' }}>8790258289@axl</span>
        <button
          type="button"
          onClick={() => { navigator.clipboard.writeText('8790258289@axl'); }}
          title="Copy UPI ID"
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
            padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#5b9bf5'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b9bf5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        After paying, copy your UPI transaction ID and paste it below
      </p>

      {/* Transaction ID input */}
      <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
        <label style={{
          display: 'block', marginBottom: '8px', fontSize: '0.8rem',
          fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase'
        }}>
          UPI Transaction ID *
        </label>
        <input
          type="text"
          value={transactionId}
          onChange={(e) => { setTransactionId(e.target.value); setError(''); }}
          placeholder="e.g. 123456789012"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.04)',
            border: error ? '1.5px solid var(--rose)' : '1.5px solid rgba(244,162,97,0.3)',
            borderRadius: '10px', color: '#f4a261', fontSize: '1rem',
            padding: '12px 14px', outline: 'none', transition: 'border 0.2s'
          }}
          onFocus={e => e.target.style.border = '1.5px solid #f4a261'}
          onBlur={e => e.target.style.border = error ? '1.5px solid var(--rose)' : '1.5px solid rgba(244,162,97,0.3)'}
        />
        {error && (
          <p style={{ color: 'var(--rose)', fontSize: '0.8rem', marginTop: '6px', textAlign: 'left' }}>
            ⚠ {error}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            flex: '0 0 auto', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer',
            background: 'rgba(244,162,97,0.08)', border: '1px solid rgba(244,162,97,0.4)',
            color: '#f4a261', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s',
            fontFamily: 'inherit'
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(244,162,97,0.18)'}
          onMouseLeave={e => e.target.style.background = 'rgba(244,162,97,0.08)'}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="submit-btn pay-btn"
          style={{ flex: 1, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Submitting...' : '✓  Confirm Registration'}
        </button>
      </div>

      <p style={{ fontSize: '0.72rem', color: '#555', margin: 0 }}>
        🔒 Your payment will be verified by our team within a few hours.
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
  const [step, setStep] = useState('form'); // 'form' | 'payment'
  const [baseData, setBaseData] = useState(null);
  const [secretCode, setSecretCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountError, setDiscountError] = useState('');
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

  const handleApplyCode = () => {
    if (!secretCode) return;
    const code = secretCode.trim().toUpperCase();
    if (code === 'KRISHNA50') {
      setDiscount(baseTotal * 0.5);
      setDiscountError('');
    } else if (code === 'DEV100') {
      setDiscount(100);
      setDiscountError('');
    } else {
      setDiscount(0);
      setDiscountError('Invalid secret code');
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
    };

    for (const [key, val] of Object.entries(data)) {
      if (key !== 'role' && key !== 'secretCode' && !val) {
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
    setStep('payment');
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

  if (step === 'payment' && baseData) {
    return (
      <UpiPaymentStep
        t={t}
        amount={total}
        baseData={baseData}
        onSuccess={(type, token) => {
          formRef.current?.reset();
          setSelected({});
          setSecretCode('');
          setDiscount(0);
          setStep('form');
          onSuccess(type, token);
        }}
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
                    {t(`games.${g.id}.title`)}
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
              <label key={game.title} className={`game-label ${selected[game.title] ? 'selected' : ''} ${game.isSpecialEvent ? 'special-event' : ''}`}>
                <input
                  type="checkbox"
                  checked={!!selected[game.title]}
                  onChange={() => toggle(game.title)}
                />
                <span className="checkbox-custom" />
                <div className="game-card-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h4 className="game-label-text" style={{ margin: 0 }}>{t(`games.${game.id}.title`)}</h4>
                    {game.isSpecialEvent && (
                      <span className="special-event-badge">⭐ {t('gamePage.specialEvent', 'Special Event')}</span>
                    )}
                  </div>
                  {game.allowStaffFaculty && (
                    <p className="game-info" style={{ fontSize: '0.75rem' }}>
                      👥 {t('gamePage.staffFacultyAllowed', 'Staff & Faculty can also participate')}
                    </p>
                  )}
                  <p className="game-info"><span>{t('gamePage.venue')}:</span> {game.venue}</p>
                  <p className="game-info"><span>{t('gamePage.time')}:</span> {game.time}</p>
                  <p className="game-info"><span>{t('gamePage.organizer')}:</span> {game.venueOrganizer}</p>
                  <p className="game-info"><span>{t('gamePage.gamesHead')}:</span> {game.gamesHead}</p>
                  <span className="game-price">{game.price > 0 ? `₹${game.price}` : t('gamePage.free')}</span>
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
            <button type="button" onClick={handleApplyCode} className="submit-btn" style={{ padding: '10px 20px', width: 'auto' }}>
              Apply
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
