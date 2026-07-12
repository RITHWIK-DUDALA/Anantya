import React, { useState } from 'react';
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
  const [showDevProfile, setShowDevProfile] = useState(false);

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
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Developed and managed by <button onClick={() => setShowDevProfile(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary)', fontWeight: '600', letterSpacing: '0.5px', textDecoration: 'none', transition: 'opacity 0.2s', fontSize: 'inherit', fontFamily: 'inherit' }} onMouseEnter={(e) => e.target.style.opacity = 0.8} onMouseLeave={(e) => e.target.style.opacity = 1}>Shrinex Studios</button></span>
                <span style={{ width: '4px', height: '4px', background: 'var(--secondary)', borderRadius: '50%' }}></span>
                <a href="tel:+919346710580" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary)'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <span style={{ fontWeight: '500', letterSpacing: '0.5px' }}>+91 93467 10580</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Profile Modal */}
      {showDevProfile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999
        }} onClick={() => setShowDevProfile(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', 
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px', padding: '30px', maxWidth: '400px', width: '90%',
            display: 'flex', gap: '24px', alignItems: 'center', position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(106, 176, 255, 0.2)',
            animation: 'fadeIn 0.3s ease-out',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Anime Stickers & Decorations */}
            <img src="/photos/sticker1.png" alt="Sticker 1" style={{ position: 'absolute', top: '10px', left: '20px', width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', opacity: 0.9, transform: 'rotate(-15deg)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
            <img src="/photos/sticker2.png" alt="Sticker 2" style={{ position: 'absolute', bottom: '15px', right: '25px', width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', opacity: 0.9, transform: 'rotate(20deg)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
            <img src="/photos/sticker3.png" alt="Sticker 3" style={{ position: 'absolute', top: '35px', right: '65px', width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', opacity: 0.9, transform: 'rotate(10deg)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
            <img src="/photos/sticker1.png" alt="Sticker 4" style={{ position: 'absolute', bottom: '20px', left: '110px', width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', opacity: 0.9, transform: 'rotate(-20deg)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
            <div style={{ position: 'absolute', top: '15%', left: '40%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(233, 69, 96, 0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

            <button onClick={() => setShowDevProfile(false)} style={{
              position: 'absolute', top: '15px', right: '15px', background: 'transparent',
              border: 'none', color: '#fff', opacity: 0.6, cursor: 'pointer', padding: '5px',
              zIndex: 10, fontSize: '16px'
            }}>✕</button>
            
            <div style={{
              width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden',
              border: '3px solid rgba(233, 69, 96, 0.6)', flexShrink: 0,
              boxShadow: '0 0 15px rgba(233, 69, 96, 0.4)', zIndex: 5
            }}>
              <img src="/photos/rith2.jpg" alt="Rithwik Sathya" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 5 }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#fff', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Rithwik Sathya</h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                Developer & Maintainer<br/>Head of Shrinex Studios
              </p>
              
              <a href="tel:+919346710580" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', 
                background: 'rgba(233, 69, 96, 0.1)', border: '1px solid rgba(233, 69, 96, 0.3)',
                padding: '6px 16px', borderRadius: '20px', color: '#ffb6b9', textDecoration: 'none',
                marginTop: '10px', fontSize: '0.95rem', fontWeight: '600', transition: 'all 0.2s', width: 'fit-content'
              }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(233, 69, 96, 0.2)'; e.currentTarget.style.borderColor = 'rgba(233, 69, 96, 0.6)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(233, 69, 96, 0.1)'; e.currentTarget.style.borderColor = 'rgba(233, 69, 96, 0.3)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                9346710580
              </a>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
