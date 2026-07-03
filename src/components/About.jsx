import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PixelatedImageTrail } from './forgeui/pixelated-image-trail';
import { ImageScatter } from './ImageScatter';

const scatterData = [
  {
    heading: "Memories from 2024",
    images: [
      "/photos/WhatsApp Image 2026-06-25 at 10.12.49 AM.jpeg", 
      "/photos/WhatsApp Image 2026-06-25 at 10.12.51 AM.jpeg", 
      "/photos/WhatsApp Image 2026-06-25 at 10.12.53 AM.jpeg",
      "/photos/uriyadi.jpeg"
    ],
  },
  {
    heading: "Moments of Joy",
    images: [
      "/photos/WhatsApp Image 2026-06-25 at 10.12.56 AM.jpeg", 
      "/photos/WhatsApp Image 2026-06-25 at 10.12.57 AM.jpeg"
    ],
  },
  {
    heading: "Cultural Highlights",
    images: [
      "/photos/WhatsApp Image 2026-06-25 at 10.12.59 AM.jpeg", 
      "/photos/WhatsApp Image 2026-06-25 at 10.14.26 AM.jpeg"
    ],
  }
];

export default function About() {
  const { t } = useTranslation();
  const allImages = scatterData.flatMap(section => section.images);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section id="about" className="section" style={{ background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>
        <div className="section-header">
          <span className="section-eyebrow">{t('about.subtitle')}</span>
          <h2 className="section-title">{t('about.title')}</h2>
        </div>
        
        <div style={{
          background: 'var(--surface)',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          position: 'relative',
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isMobile ? (
            <ImageScatter data={scatterData} />
          ) : (
            <>
              <PixelatedImageTrail images={allImages} />
              
              <div style={{ position: 'relative', zIndex: 10, pointerEvents: 'none', textAlign: 'center' }}>
                <h3 style={{ fontSize: '3rem', margin: 0, color: 'var(--text)' }}>
                  {t('about.subtitle')}
                </h3>
                <p style={{ opacity: 0.8, fontSize: '1.2rem', marginTop: '1rem' }}>
                  Move your mouse to reveal memories
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
