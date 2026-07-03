import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon } from '@animateicons/react/lucide';
import { Link } from 'react-router-dom';

import StrokeFill from './StrokeFill';

/**
 * Hero — Cinematic Reveal (Pure CSS animation-delay based)
 * ────────────────────────────────────────────────────────
 * Phase 1: Black start
 * Phase 2: Warm radial glow blooms (0.8s)
 * Phase 3: Krishna image reveals & drifts up (2s)
 * Phase 4: Atmospheric effects (breathing glow, particles, vignette) (3s)
 * Phase 5: 3D perspective title tilt + shimmer sweep (4s)
 * Phase 6: Subtitle + CTA fade in (5.5s)
 */
export default function Hero() {
  const { t } = useTranslation();

  return (
    <section id="home" className="hero-cin" aria-label="Hero Section" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* ░░ Phase 2: Warm radial glow bloom */}
      <div className="hero-glow" aria-hidden="true" />
      
      {/* ░░ Phase 3: 3D Image Gallery */}
      <div className="hero-3d-gallery" aria-hidden="true">
        <div className="img-layer img-left" />
        <div className="img-layer img-center" />
        <div className="img-layer img-right" />
      </div>
      <div className="hero-warm-overlay" aria-hidden="true" />
      
      {/* ░░ Phase 4: Continuous atmospheric effects */}
      <div className="hero-breath-glow" aria-hidden="true" />
      <div className="hero-particles" aria-hidden="true">
        {/* 18 tiny gold & teal drifting dots */}
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className={`particle p${i + 1}`} />
        ))}
      </div>
      <div className="hero-vignette" aria-hidden="true" />
      
      {/* ░░ Framer Motion Stroke Title */}
      <div className="hero-content" id="hero-content" style={{ zIndex: 11, position: 'relative', width: '100%', maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <StrokeFill text={t('hero.mainTitle', 'JANMASHTAMI')} duration={3} />
        <p style={{ color: '#1e3a8a', fontSize: '1.5rem', letterSpacing: '0.5em', marginTop: '-20px', zIndex: 12, fontWeight: 'bold', marginBottom: '30px' }}>2k26</p>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
          <Link to="/register" style={{ padding: '12px 32px', background: 'var(--primary)', color: 'white', borderRadius: '30px', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', transition: 'transform 0.2s ease', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>Explore Games</Link>
          <Link to="/form" style={{ padding: '12px 32px', background: 'rgba(255, 255, 255, 0.9)', color: 'var(--primary)', borderRadius: '30px', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', transition: 'transform 0.2s ease', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>Register / Volunteer</Link>
        </div>
      </div>

    </section>
  );
}
