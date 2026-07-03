import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CONFIG from '../config/config';

export default function CountdownTimer() {
  const { t } = useTranslation();
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date(CONFIG.eventDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="countdown-section" style={{ padding: '60px 0', background: 'var(--surface)', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div className="countdown-box" style={{ background: 'var(--bg)', padding: '24px 32px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', minWidth: '100px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--primary)', lineHeight: 1 }}>{timeLeft.days.toString().padStart(2, '0')}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '12px', letterSpacing: '0.15em', fontWeight: 600 }}>{t('hero.countdown.days', 'Days')}</div>
          </div>
          <span className="countdown-sep" style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.5 }}>:</span>
          
          <div className="countdown-box" style={{ background: 'var(--bg)', padding: '24px 32px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', minWidth: '100px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--primary)', lineHeight: 1 }}>{timeLeft.hours.toString().padStart(2, '0')}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '12px', letterSpacing: '0.15em', fontWeight: 600 }}>{t('hero.countdown.hours', 'Hours')}</div>
          </div>
          <span className="countdown-sep" style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.5 }}>:</span>
          
          <div className="countdown-box" style={{ background: 'var(--bg)', padding: '24px 32px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', minWidth: '100px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--primary)', lineHeight: 1 }}>{timeLeft.minutes.toString().padStart(2, '0')}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '12px', letterSpacing: '0.15em', fontWeight: 600 }}>{t('hero.countdown.minutes', 'Minutes')}</div>
          </div>
          <span className="countdown-sep" style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.5 }}>:</span>
          
          <div className="countdown-box" style={{ background: 'var(--bg)', padding: '24px 32px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', minWidth: '100px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--primary)', lineHeight: 1 }}>{timeLeft.seconds.toString().padStart(2, '0')}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '12px', letterSpacing: '0.15em', fontWeight: 600 }}>{t('hero.countdown.seconds', 'Seconds')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
