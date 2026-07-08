import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FlameIcon, InstagramIcon, MailIcon } from '@animateicons/react/lucide';
import CONFIG from '../config/config';

const NAV_ITEMS = [
  { key: 'nav.home', href: '/#home', label: 'Home' },
  { key: 'nav.about', href: '/#about', label: 'About' },
  { key: 'nav.timeline', href: '/#timeline', label: 'Timeline' },
  { key: 'nav.register', href: '/register', label: 'Register' },
  { key: 'nav.status', href: '/status', label: 'Check Status' },
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <FlameIcon size={22} color="var(--secondary)" />
              {CONFIG.eventName}
            </div>
            <p className="footer-tagline">{t('footer.tagline')}</p>
          </div>

          {/* Quick links */}
          <div className="footer-nav">
            <h4>{t('footer.quickLinks', 'Quick Links')}</h4>
            <ul>
              {NAV_ITEMS.map(({ key, href, label }) => (
                <li key={href}>
                  <Link to={href}>{t(key, label)}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="footer-social">
            <h4>{t('footer.followUs', 'Follow Us')}</h4>
            <div className="footer-social-links">
              <a
                href={CONFIG.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                id="footer-instagram"
              >
                <InstagramIcon size={16} color="rgba(255,255,255,0.7)" /> Instagram
              </a>
              <a
                href="mailto:krishnajanmastami26@gmail.com"
                className="social-link"
                id="footer-email"
              >
                <MailIcon size={16} color="rgba(255,255,255,0.7)" /> Email Us
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.8 }}>
              <span>{t('footer.madeBy', 'made by © 2026')} <a href="https://shrinexstudio.netlify.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Shrinex Studios</a>. {t('footer.rights', 'All rights reserved.')}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Free use only for Anantya Event Committee 2k26.</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
              <span style={{ opacity: 0.8 }}>{t('footer.venture', 'A venture under RX-7 Group')}</span>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '6px 14px', 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                fontSize: '0.85rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Developed by <strong style={{ color: 'var(--primary)', fontWeight: '600', letterSpacing: '0.5px' }}>Rithwik</strong></span>
                <span style={{ width: '4px', height: '4px', background: 'var(--secondary)', borderRadius: '50%' }}></span>
                <a href="tel:+919346710580" style={{ color: 'var(--text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text)'}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  +91 93467 10580
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
