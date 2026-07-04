import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { FlameIcon } from '@animateicons/react/lucide';
import { MenuIcon, XIcon } from '@animateicons/react/lucide';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'te', label: 'తె' },
  { code: 'ta', label: 'த' },
  { code: 'ml', label: 'മ' },
  { code: 'hi', label: 'हि' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('en');
  const lastScroll = useRef(0);

  // Scroll behaviour
  useEffect(() => {
    const handleScroll = () => {
      const cur = window.scrollY;
      setScrolled(cur > 60);
      setHidden(cur > lastScroll.current && cur > 200);
      lastScroll.current = cur;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section highlighting
  const [activeSection, setActiveSection] = useState('home');
  useEffect(() => {
    const ids = ['home', 'about', 'timeline', 'committee'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const switchLang = (code) => {
    i18n.changeLanguage(code);
    setActiveLang(code);
  };

  const navItems = [
    { key: 'nav.home', href: '/#home', id: 'home', label: 'Home' },
    { key: 'nav.about', href: '/#about', id: 'about', label: 'About' },
    { key: 'nav.timeline', href: '/#timeline', id: 'timeline', label: 'Timeline' },
    { key: 'nav.committee', href: '/#committee', id: 'committee', label: 'Committee' },
    { key: 'nav.memories', href: '/memories', id: 'memories', label: 'Memories' }
  ];

  const isRegisterPage = location.pathname === '/register';
  const isScrolled = scrolled || isRegisterPage;

  return (
    <nav className={`navbar${isScrolled ? ' scrolled' : ''}${hidden ? ' nav-hidden' : ''}`} id="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/#home" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Janmashtami Logo" style={{ height: '45px', width: '45px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
          <span>Janmashtami 2026</span>
        </Link>

        {/* Nav links */}
        <ul className={`nav-links${mobileOpen ? ' open' : ''}`}>
          {navItems.map(({ key, href, id, label }) => (
            <li key={id}>
              <Link
                to={href}
                className={activeSection === id ? 'active' : ''}
                onClick={() => setMobileOpen(false)}
              >
                {t(key, label)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Language switcher & Register */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="lang-switcher">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                className={`lang-btn${activeLang === code ? ' active' : ''}`}
                onClick={() => switchLang(code)}
                aria-label={`Switch to ${code}`}
              >
                {label}
              </button>
            ))}
          </div>

          <Link 
            to="/register" 
            style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              padding: '8px 20px', 
              borderRadius: '20px', 
              fontWeight: '600', 
              textDecoration: 'none',
              fontSize: '0.95rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {t('nav.register', 'Register Now')}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          id="navToggle"
          className={`nav-toggle${mobileOpen ? ' open' : ''}`}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen
            ? <XIcon size={22} color="var(--text)" />
            : <MenuIcon size={22} color="var(--text)" />}
        </button>
      </div>
    </nav>
  );
}
