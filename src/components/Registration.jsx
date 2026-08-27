import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { SendIcon, CreditCardIcon, CircleCheckIcon, ShieldXIcon } from '@animateicons/react/lucide';
import { Turnstile } from '@marsidev/react-turnstile';
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
            Generating Session Token...
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', textShadow: '0 0 15px rgba(255,255,255,0.5)', letterSpacing: '4px' }}>
              {mins}:{secs.toString().padStart(2, '0')}
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '10px' }}>
              <div style={{ height: '100%', width: `${percent}%`, background: 'var(--primary, #3b82f6)', transition: 'width 1s linear', boxShadow: '0 0 10px var(--primary, #3b82f6)' }} />
            </div>
          </div>

          <p style={{ color: '#eee', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
            Please wait <strong style={{color: 'var(--primary)'}}>3 to 5 minutes</strong> for your Session Token to be generated.
            <br/><br/>
            <span style={{ color: '#ff4444', fontWeight: 700, background: 'rgba(255,0,0,0.15)', padding: '8px 14px', borderRadius: '8px', display: 'inline-block', border: '1px solid rgba(255,0,0,0.3)' }}>
              ⚠ DO NOT CLOSE OR REFRESH THIS WINDOW
            </span>
            <br/><br/>
            <span style={{ fontSize: '0.9rem', color: '#ffd700', fontWeight: 600 }}>
              📥 Please make sure to download your Session Token as soon as it is generated.
            </span>
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
      onSuccess('free', result.token, {
        regId: result.token,
        email: data.email,
        events: data.role || 'Volunteer',
        transactionId: 'Free Ticket',
        status: 'Verified'
      });
    } catch {
      onError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="free-form" className="reg-form card" onSubmit={handleProceed} ref={formRef}>
      {loading && <ProcessingPopup />}
      
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
          Volunteer Registration
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Sign up to volunteer and help make Anantya a grand success!
        </p>
      </div>

      <div style={{
        marginBottom: '1.5rem', padding: '12px 16px', background: 'rgba(183, 139, 39, 0.1)',
        border: '1px solid rgba(183, 139, 39, 0.35)', borderRadius: '10px', textAlign: 'left',
        fontSize: '0.85rem', color: '#e0e0e0', lineHeight: 1.5
      }}>
        <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '2px' }}>📌 First-Come, First-Served Basis:</strong>
        Volunteer selections are processed on a <strong>first-come, first-served basis</strong> due to role capacity. If your registration is not selected, we sincerely apologize.
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

      <div className="form-group" style={{ marginTop: '1rem', textAlign: 'left' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontWeight: 'normal', fontSize: '0.9rem' }}>
          <input type="checkbox" required style={{ marginTop: '4px', width: 'auto' }} />
          <span>I have read and agree to the <a href="/terms" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Terms & Conditions</a> (Mandatory)</span>
        </label>
      </div>

      <button type="submit" className="submit-btn" style={{ marginTop: '2rem' }}>
        <CircleCheckIcon size={16} color="#fff" style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} /> 
        Submit Application
      </button>
    </form>
  );
}

// ── Manual Payment Step Component (QR + UTR)
const downloadTicket = (regId, email, utr, games) => {
  const gamesList = Array.isArray(games) ? games.join(', ') : games;
  const ticketContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Anantya Registration Ticket</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #000; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .ticket { background: #111; border: 1px solid #333; border-radius: 12px; padding: 40px; width: 400px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border-top: 5px solid #b78b27; }
        h1 { color: #b78b27; margin-top: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
        .info { margin: 30px 0; text-align: left; background: #1a1a1a; padding: 25px; border-radius: 8px; border: 1px solid #222; }
        .label { color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
        .value { color: #fff; font-size: 16px; margin-bottom: 20px; font-weight: bold; word-break: break-all; }
        .code { font-size: 36px; letter-spacing: 6px; color: #b78b27; margin: 10px 0 25px 0; text-align: center; font-family: monospace; font-weight: bold; background: rgba(183,139,39,0.1); padding: 15px; border-radius: 8px; }
        .footer { color: #666; font-size: 12px; margin-top: 20px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="ticket">
        <h1>Anantya 2026</h1>
        <div class="info">
          <div class="label">Registration Code</div>
          <div class="code">${regId}</div>
          <div class="label">Registered Email</div>
          <div class="value">${email}</div>
          <div class="label">Registered Event(s)</div>
          <div class="value">${gamesList}</div>
          <div class="label">Transaction ID (UTR)</div>
          <div class="value">${utr}</div>
          <div class="label">Session Token</div>
          <div class="value" style="color: #f59e0b; font-size: 14px; font-style: italic;">(Pending Verification)</div>
        </div>
        <div class="footer">Please keep this ticket safe. Your session token will be updated upon verification by the admin team. You can check your status on the website using your Email and Registration Code.</div>
      </div>
    </body>
    </html>
  `;
  const blob = new Blob([ticketContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Anantya_Ticket_${regId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

function ManualPaymentStep({ amount, baseData, onSuccess, onError, onBack, t }) {
  const [loading, setLoading] = useState(false);
  const [utr, setUtr] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utr || utr.trim().length < 8) {
      setError('Please enter a valid Transaction ID (UTR)');
      return;
    }

    if (!captchaToken) {
      setError('Please complete the CAPTCHA validation');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const payload = {
        ...baseData,
        utr: utr.trim().toUpperCase(),
        captchaToken
      };

      const res = await fetch(`${apiUrl}/api/payment/create-manual-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to submit payment details');
        return;
      }

      onSuccess('manual', data.regId, {
        regId: data.regId,
        email: baseData.email,
        events: Array.isArray(baseData.games) ? baseData.games.join(', ') : baseData.games,
        transactionId: payload.utr,
        status: 'Pending Verification'
      });
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-form card" style={{ textAlign: 'center', padding: '2rem 1.5rem', maxWidth: '480px', margin: '0 auto' }}>
      {loading && <ProcessingPopup />}
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
          Scan the QR code below to pay
        </p>
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        padding: '10px 28px', borderRadius: '50px', marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(183,139,39,0.18), rgba(183,139,39,0.06))',
        border: '1px solid rgba(183,139,39,0.35)',
      }}>
        <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 600 }}>AMOUNT</span>
        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>₹{amount}</span>
      </div>

      <div style={{ marginBottom: '1.5rem', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Static QR Code from assets */}
        <img src="/assets/games main regestration scanner.webp" alt="UPI QR Code" style={{ width: '200px', height: 'auto', borderRadius: '10px' }} />
        
        <p style={{ marginTop: '10px', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>UPI ID: <span style={{ color: '#fff' }}>8790258289-2@ibl</span></p>
      </div>

      <div style={{ textAlign: 'left', marginBottom: '1.5rem', padding: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: '#ccc', lineHeight: '1.6' }}>
          <li><strong>First-Come, First-Served:</strong> Registrations are processed strictly on a first-come, first-served basis. If your registration is not selected, we sincerely apologize for that and your money will be <strong>refunded within 2 days of the event</strong>.</li>
          <li>Ticket is provisional until manually verified by our team.</li>
          <li>Enter the exact Transaction Reference Number (UTR) from your payment app.</li>
          <li>Pay the exact amount shown (₹{amount}). Incorrect amounts will not be approved.</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label htmlFor="utr">Transaction ID (UTR) *</label>
          <input 
            id="utr"
            type="text" 
            placeholder="e.g. 123456789012" 
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            required
            style={{ textTransform: 'uppercase' }}
          />
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <Turnstile 
            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} // dummy key for local dev if missing
            onSuccess={(token) => setCaptchaToken(token)}
            onError={() => setError('CAPTCHA failed. Please refresh and try again.')}
            onExpire={() => setCaptchaToken(null)}
            options={{ theme: 'dark' }}
          />
        </div>

        {error && (
          <p style={{ color: 'var(--rose)', fontSize: '0.82rem', margin: '10px 0', background: 'rgba(244,63,94,0.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.2)' }}>
            ⚠ {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="submit-btn pay-btn"
          style={{ width: '100%', marginTop: '10px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Submitting...' : 'Submit Payment Details'}
        </button>
      </form>

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button type="button" onClick={onBack} disabled={loading} style={{
          flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
          background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
          color: '#888', fontSize: '0.85rem', fontFamily: 'inherit'
        }}>← Back</button>
      </div>
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
    setStep('payment'); // Go to manual payment step
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
      onSuccess('free', result.token, {
        regId: result.token,
        email: data.email,
        events: Array.isArray(data.games) ? data.games.join(', ') : data.games,
        transactionId: 'Free Ticket',
        status: 'Verified'
      });
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

  if (step === 'payment' && baseData) {
    return (
      <ManualPaymentStep
        t={t}
        amount={total}
        baseData={{ ...baseData, secretCode: discount > 0 ? secretCode.trim().toUpperCase() : '' }}
        onSuccess={(...args) => { resetPayment(); onSuccess(...args); }}
        onError={onError}
        onBack={() => setStep('form')}
      />
    );
  }

  return (
    <form id="paid-form" className="reg-form card" onSubmit={handleProceedToPayment} ref={formRef}>
      {loading && <ProcessingPopup />}
      
      <div style={{
        marginBottom: '1.5rem', padding: '14px 18px', background: 'rgba(183, 139, 39, 0.1)',
        border: '1px solid rgba(183, 139, 39, 0.35)', borderRadius: '10px', textAlign: 'left',
        fontSize: '0.85rem', color: '#e0e0e0', lineHeight: 1.5
      }}>
        <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>📌 First-Come, First-Served Policy:</strong>
        Registration for all games and events is strictly on a <strong>first-come, first-served basis</strong>. If your registration is not selected, we sincerely apologize for that and your money will be <strong>refunded within 2 days of the event</strong>.
      </div>

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

      <div className="form-group" style={{ marginTop: '1.5rem', textAlign: 'left' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontWeight: 'normal', fontSize: '0.9rem' }}>
          <input type="checkbox" required style={{ marginTop: '4px', width: 'auto' }} />
          <span>I have read and agree to the <a href="/terms" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Terms & Conditions</a> (Mandatory)</span>
        </label>
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

  const openSuccess = (formType, tokenOrRegId, fullData = null) => {
    if (tokenOrRegId) {
      setTimeout(() => {
        // Automatically download the token TXT
        downloadToken(tokenOrRegId);

        // Automatically download the invitation image
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = '/assets/invite.jpeg';
          link.download = 'Anantya_Invitation.jpeg';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 500); // staggered download
      }, 500);
    }

    setModal({
      icon: '🎉',
      title: t('register.success.title'),
      message: (
        <>
          <p style={{ margin: '0 0 16px 0' }}>{t(`register.success.${formType}`, 'Registration details submitted successfully!')}</p>
          
          {/* No Ticket rendering. We use simple buttons instead */}
          
          {tokenOrRegId && (
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', textAlign: 'center', border: '1px solid #eaeaea', marginTop: '15px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#666', fontWeight: '500' }}>Your Session Token</p>
              <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary)', letterSpacing: '6px', fontSize: '2.5rem', fontFamily: 'monospace' }}>{tokenOrRegId}</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#777' }}>
                Please keep this 6-digit session token safe. It is required for event check-in and verifying your registration.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
                  <button
                    className="submit-btn"
                    onClick={() => { navigator.clipboard.writeText(tokenOrRegId); alert('Copied to clipboard!'); }}
                    style={{ padding: '10px 20px', width: 'auto', fontSize: '0.9rem', margin: '0' }}
                  >
                    Copy Token
                  </button>
                  
                  <button
                    className="btn btn-outline"
                    onClick={() => downloadToken(tokenOrRegId)}
                    style={{ padding: '10px 20px', width: 'auto', fontSize: '0.9rem', margin: '0', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Download as TXT
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                  <button
                    className="submit-btn"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/assets/invite.jpeg';
                      link.download = 'Anantya_Invitation.jpeg';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    style={{ padding: '10px 20px', width: 'auto', fontSize: '0.9rem', margin: '0', background: 'rgba(35, 53, 89, 0.8)' }}
                  >
                    Download Invitation
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ),
    });
  };

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
