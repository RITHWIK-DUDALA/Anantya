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
  },
  {
    heading: "Janmashtami Vibes 1",
    images: [
      "/assets/amrita ragam bajana session.jpg",
      "/assets/band 2.jpg",
      "/assets/band main image.jpg",
      "/assets/cultural main.jpg",
      "/assets/girls uradi 1.JPG"
    ],
  },
  {
    heading: "Janmashtami Vibes 2",
    images: [
      "/assets/memo10.jpg",
      "/assets/memo12.jpg",
      "/assets/memo13.jpg",
      "/assets/memo14.jpg",
      "/assets/memo15.jpg"
    ],
  },
  {
    heading: "Janmashtami Vibes 3",
    images: [
      "/assets/memo16.jpg",
      "/assets/memo17.jpg",
      "/assets/memo20.jpg",
      "/assets/memo21.jpg",
      "/assets/memo22.jpg"
    ],
  },
  {
    heading: "Janmashtami Vibes 4",
    images: [
      "/assets/memo4.jpg",
      "/assets/memo5.jpg",
      "/assets/memo6.jpg",
      "/assets/memo7.jpg",
      "/assets/memo8.jpg"
    ],
  },
  {
    heading: "Janmashtami Vibes 5",
    images: [
      "/assets/memo9.jpg",
      "/assets/nagasai cultural 1.jpg",
      "/assets/potpdp.jpg",
      "/assets/principle and other staff.jpg",
      "/assets/prop1.jpg"
    ],
  },
  {
    heading: "Janmashtami Vibes 6",
    images: [
      "/assets/uradi b1.JPG",
      "/assets/uradigirls2.JPG",
      "/assets/urady1.jpg"
    ],
  }
];

export default function About() {
  const { t } = useTranslation();
  // Limit the number of images for the hover trail to 8 to prevent extreme lag
  const allImages = scatterData.flatMap(section => section.images).slice(0, 8);
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
