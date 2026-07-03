import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SendIcon, CreditCardIcon, CircleCheckIcon, ShieldXIcon } from '@animateicons/react/lucide';
import CONFIG from '../config/config';
import { gameCardsData } from '../data/gamesData';
import Modal from './Modal';

/* ── Post data to Google Sheets via Apps Script ──── */
async function postToSheets(data) {
  if (CONFIG.googleSheetsWebhook === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    console.log('[DEV] Google Sheets submission (placeholder URL):', data);
    return; // Skip in dev — replace URL in config.js to enable
  }
  await fetch(CONFIG.googleSheetsWebhook, {
    method: 'POST',
    // Apps Script requires text/plain to avoid CORS preflight
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data),
  });
}

/* ── Common form fields (used in both tabs) ──────── */
function BaseFields({ prefix, t }) {
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
          title="Please enter a valid 10-digit Indian phone number (+91 is assumed)"
          placeholder={t('register.form.phonePlaceholder')} 
        />
      </div>
      <div className="form-group">
        <label htmlFor={`${prefix}-dept`}>{t('register.form.dept')} *</label>
        <select id={`${prefix}-dept`} name="dept" required defaultValue="">
          <option value="" disabled>{t('register.form.deptPlaceholder')}</option>
          <option value="AIE">AIE</option>
          <option value="CSE">CSE</option>
          <option value="CYS">CYS</option>
          <option value="CCE">CCE</option>
          <option value="MEC">MEC</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="AIDS">AIDS</option>
          <option value="Others">Others</option>
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
      formType: 'free',
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      dept: fd.get('dept'),
      year: fd.get('year'),
      role: fd.get('role'),
      games: '',
      amount: 0,
      paymentId: '',
      timestamp: new Date().toISOString(),
    };
    try {
      const response = await fetch('/api/register/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Registration failed');

      e.target.reset();
      onSuccess('free', result.token);
    } catch (err) {
      console.error(err);
      onError();
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'Cultural Participant',           key: 'register.form.roles.cultural' },
    { value: 'Decoration Volunteer',           key: 'register.form.roles.decoration' },
    { value: 'Disciplinary Volunteer',         key: 'register.form.roles.disciplinary' },
    { value: 'Prasadam Distribution Volunteer',key: 'register.form.roles.prasadam' },
    { value: 'Games Participant (free)',        key: 'register.form.roles.games' },
  ];

  return (
    <form id="free-form" className="reg-form card" onSubmit={handleSubmit} noValidate>
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

/* ── Paid Games Form ─────────────────────────────── */
export function PaidForm({ t, onSuccess, onError, initialGameId }) {
  const [selected, setSelected] = useState(() => {
    if (initialGameId) {
      const game = gameCardsData.find(g => g.id.toString() === initialGameId);
      if (game) return { [game.title]: true };
    }
    return {};
  });
  const [loading, setLoading] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [isSecretInputVisible, setIsSecretInputVisible] = useState(false);
  const formRef = useRef(null);

  const baseTotal = gameCardsData.reduce((sum, game) => (selected[game.title] ? sum + game.price : sum), 0);
  const total = Math.max(0, baseTotal - discount);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const toggle = (title) => {
    setSelected((prev) => {
      const newSelected = (prev[title] ? {} : { [title]: true });
      // Reset discount when game changes to avoid discount bugs on price change
      setDiscount(0);
      setSecretCode('');
      setDiscountError('');
      return newSelected;
    });
  };

  const handleApplyCode = () => {
    if (!secretCode) return;
    // Verification of code
    const code = secretCode.trim().toUpperCase();
    if (code === 'KRISHNA50') {
      setDiscount(baseTotal * 0.5); // 50% discount
      setDiscountError('');
    } else if (code === 'DEV100') {
      setDiscount(100); // Flat Rs 100 off
      setDiscountError('');
    } else {
      setDiscount(0);
      setDiscountError('Invalid secret code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedGames = gameCardsData.filter((game) => selected[game.title]);
    if (!selectedGames.length) {
      alert(t('register.form.noGamesSelected'));
      return;
    }

    const fd = new FormData(formRef.current);
    const baseData = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      dept: fd.get('dept'),
      year: fd.get('year'),
      role: 'Games Participant',
      games: selectedGames.map((g) => g.title).join(', '),
      calculatedAmount: total,
      secretCode: discount > 0 ? secretCode.trim().toUpperCase() : '',
      discountAmount: discount
    };

    // Validate required fields
    for (const [key, val] of Object.entries(baseData)) {
      if (key !== 'role' && key !== 'calculatedAmount' && key !== 'secretCode' && key !== 'discountAmount' && !val) { alert(`Please fill in all required fields.`); return; }
    }

    // If total is 0 (or became 0 after discount), submit to the free endpoint
    if (total === 0) {
      setLoading(true);
      try {
        const freeData = { ...baseData, formType: 'free', paymentId: '', timestamp: new Date().toISOString() };
        const response = await fetch('/api/register/free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(freeData)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Registration failed');
        formRef.current.reset();
        setSelected({});
        setSecretCode('');
        setDiscount(0);
        onSuccess('free', result.token);
      } catch (err) {
        console.error(err);
        onError();
      } finally {
        setLoading(false);
      }
      return;
    }

    // Paid Registration Flow via Razorpay
    if (total > 0) {
      setLoading(true);
      try {
        const response = await fetch('/api/register/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(baseData)
        });
        const result = await response.json();
        
        if (!response.ok) throw new Error(result.error || 'Failed to create order');

        const options = {
          key: CONFIG.razorpayKeyId || 'rzp_test_placeholder', // Should be injected via env vars in real build
          amount: result.amount * 100,
          currency: 'INR',
          name: 'Anantya 2025',
          description: `Registration for ${selectedGames.map(g => g.title).join(', ')}`,
          order_id: result.order_id,
          handler: function (response) {
            // Payment success callback
            formRef.current.reset();
            setSelected({});
            setSecretCode('');
            setDiscount(0);
            // Verification is handled by backend webhook. We just show success here.
            onSuccess('paid', result.token);
          },
          prefill: {
            name: baseData.name,
            email: baseData.email,
            contact: baseData.phone
          },
          theme: {
            color: '#b78b27'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.error(response.error);
          onError();
        });
        rzp.open();
        
      } catch (error) {
        console.error(error);
        onError();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form id="paid-form" className="reg-form card" onSubmit={handleSubmit} ref={formRef} noValidate>
      <BaseFields prefix="paid" t={t} />

      {/* Game selection */}
      {initialGameId ? (
        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="games-title" style={{ color: '#aaaaaa', fontSize: '0.9rem', margin: '0 0 4px 0' }}>Registering for:</p>
          <h4 className="game-label-text" style={{ fontSize: '1.4rem', color: 'var(--primary)', margin: 0 }}>
             {(() => {
               const g = gameCardsData.find(x => x.id.toString() === initialGameId);
               return g ? t(`games.${g.id}.title`) : '';
             })()}
          </h4>
        </div>
      ) : (
        <>
          <p className="games-title">{t('register.form.gamesTitle')}</p>
          <p className="games-subtitle">{t('register.form.gamesSubtitle')}</p>
          <div className="games-grid">
            {gameCardsData.map((game) => (
              <label key={game.title} className={`game-label ${selected[game.title] ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={!!selected[game.title]}
                  onChange={() => toggle(game.title)}
                />
                <span className="checkbox-custom" />
                <div className="game-card-content">
                  <h4 className="game-label-text">{t(`games.${game.id}.title`)}</h4>
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

      {/* Secret Code Section - Invisible trigger by clicking Total label */}
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
          {discount > 0 && <p style={{ color: 'var(--green)', fontSize: '0.9rem', marginTop: '5px' }}>Discount applied: ₹{discount}</p>}
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
        disabled={loading || Object.keys(selected).filter(k => selected[k]).length === 0}
      >
        {loading
          ? t('register.form.processing')
          : total > 0 
            ? <><CreditCardIcon size={16} color="#fff" /> Proceed to Pay — ₹{total}</>
            : <><CircleCheckIcon size={16} color="#fff" /> Register — Free</>}
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
              <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#aaa' }}>Your Registration Token</p>
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
