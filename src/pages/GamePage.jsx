import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { gameCardsData } from '../data/gamesData';
import { AsciiGlitchRipple } from '../components/forgeui/ascii-glitch-ripple';
import { TestimonialsCard } from '../components/forgeui/testimonials-card';

const stickerItems = [
  { id: 'b1', title: '', description: '', image: '/games/b1.jpg' },
  { id: 'b2', title: '', description: '', image: '/games/b2.jpg' },
  { id: 'b3', title: '', description: '', image: '/games/b3.jpg' },
];

function FloatingSticker({ gameId }) {
  return (
    <Link
      to={`/form?game=${gameId}`}
      className="floating-sticker"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 999,
        textDecoration: 'none',
        width: '140px',
        display: 'block',
        filter: 'drop-shadow(0 0 18px rgba(255, 140, 50, 0.6)) drop-shadow(0 0 40px rgba(255, 100, 20, 0.3))',
        animation: 'stickerLevitate 3s ease-in-out infinite',
      }}
    >
      <TestimonialsCard
        items={stickerItems}
        width={140}
        showNavigation={false}
        showCounter={false}
        autoPlay={true}
        autoPlayInterval={3500}
      />
    </Link>
  );
}

export default function GamePage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const game = gameCardsData.find((g) => g.id.toString() === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!game) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: 'white', flexDirection: 'column' }}>
        <h2>{t('gamePage.notFound')}</h2>
        <Link to="/register" style={{ color: 'var(--primary)', marginTop: '20px' }}>{t('gamePage.backToGames')}</Link>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#050505', color: '#ffffff', paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          
          <Link to="/register" style={{ display: 'inline-block', marginBottom: '40px', color: '#aaa', textDecoration: 'none', fontSize: '1.1rem' }}>
            {t('gamePage.backToGames')}
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'start' }}>
            
            {/* Left Column: Image */}
            <div className="group" style={{ position: 'relative' }}>
              
              {/* Outer Glow Backlight (Hover Only) */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'rgba(255, 120, 0, 0.4)',
                  filter: 'blur(40px)',
                  zIndex: 0,
                  borderRadius: '24px',
                  transform: 'scale(0.95)'
                }}
              />

              <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '500px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
                
                {/* Inner Ambient Lighting (Hover Only) */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(255, 120, 0, 0.15) 0%, transparent 70%)',
                    zIndex: 0
                  }} 
                />

                <img 
                  src={game.src} 
                  alt={t(`games.${game.id}.title`)}
                  style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }}
                />
              </div>
            </div>

            {/* Right Column: Details */}
            <div>
              <AsciiGlitchRipple as="h1" delay={200} dur={600} style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '20px', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {t(`games.${game.id}.title`)}
              </AsciiGlitchRipple>

              <AsciiGlitchRipple as="p" delay={500} dur={600} style={{ fontSize: '1.2rem', color: '#ccc', lineHeight: '1.8', marginBottom: '40px' }}>
                {t(`games.${game.id}.description`)}
              </AsciiGlitchRipple>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'flex', gap: '15px', padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '1.5rem' }}>📍</div>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('gamePage.venue')}</h3>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>{game.venue}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '1.5rem' }}>⏰</div>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('gamePage.time')}</h3>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>{game.time}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '1.5rem' }}>💰</div>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('gamePage.entryFee')}</h3>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{game.price === 0 ? t('gamePage.free') : `₹${game.price}`}</p>
                  </div>
                </div>
              </div>

              {/* Uriyadi specific content block */}
              {game.title === 'Uriyadi' && (
                <div style={{ marginTop: '40px', padding: '30px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', borderLeft: '4px solid var(--primary)' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--primary)' }}>{t('gamePage.traditionalImportance')}</h3>
                  <p style={{ fontSize: '1.1rem', color: '#ddd', lineHeight: '1.6', marginBottom: '20px' }}>
                    {t('gamePage.uriyadiDesc')}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>👀</span>
                    <p style={{ fontSize: '1.1rem', color: 'white', fontWeight: 'bold', margin: 0 }}>
                      {t('gamePage.freeToWatch')}
                    </p>
                  </div>
                  <p style={{ fontSize: '1rem', color: '#aaa', marginTop: '10px' }}>
                    {t('gamePage.noRegistration')}
                  </p>
                </div>
              )}

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '20px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>{t('gamePage.registrationInfo')}</h3>
                <p style={{ marginBottom: '20px', color: '#aaa' }}>{t('gamePage.signUpQuickly')}</p>
                <Link to={`/form?game=${game.id}`} style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', textDecoration: 'none', padding: '12px 24px', borderRadius: '24px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  {t('gamePage.registerFor')} {t(`games.${game.id}.title`)}
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Floating Sticker in bottom-left */}
      <FloatingSticker gameId={game.id} />
    </>
  );
}
