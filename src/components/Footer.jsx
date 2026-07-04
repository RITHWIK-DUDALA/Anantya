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

        <div className="footer-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', opacity: 0.8 }}>
            <span>{t('footer.madeBy', 'made by © 2026')} <a href="https://shrinexstudio.netlify.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Shrinex Studios</a>. {t('footer.rights', 'All rights reserved.')}</span>
            <span>{t('footer.venture', 'A venture under RX-7 Group')}</span>
          </div>
          <div style={{ textAlign: 'center', opacity: 0.8 }}>
            Free use only for Anantya Event Committee 2k26.
          </div>
        </div>
      </div>
    </footer>
  );
}
