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
            
            {/* Left Column: Image & Coordinators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
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
                      zIndex: 2
                    }} 
                  />

                  {/* Blurred Background to fill black bars */}
                  <div 
                    style={{
                      position: 'absolute',
                      inset: '-20px',
                      backgroundImage: `url(${game.src})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'blur(20px) brightness(0.5)',
                      zIndex: 0
                    }}
                  />

                  <img 
                    src={game.src || '/games/if any game dosent have a poster use this.webp'} 
                    alt={t(`games.${game.id}.title`)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/games/if any game dosent have a poster use this.webp';
                    }}
                    style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }}
                  />
                </div>
              </div>

              {/* Coordinators Section */}
              {game.coordinators && game.coordinators.length > 0 && (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: '#eee', textAlign: 'center', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Event Coordinators</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                    {game.coordinators.map((coord, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', width: '130px' }}>
                        {!game.isComingSoon && (
                          <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', padding: '3px', background: '#0a0a0a' }}>
                            <img src={coord.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(coord.name) + '&background=random'} alt={coord.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                          </div>
                        )}
                        <div>
                          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>{coord.name}</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--primary)', marginTop: '4px', fontWeight: '500' }}>{coord.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Details */}
            <div>
              <AsciiGlitchRipple as="h1" delay={200} dur={600} style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '10px', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {game.isComingSoon ? "Coming Soon" : t(`games.${game.id}.title`)}
              </AsciiGlitchRipple>

              {game.isSpecialEvent && (
                <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className="special-event-detail-badge">
                    ⭐ {t('gamePage.specialEvent', 'Special Event')}
                  </span>
                  {game.allowStaffFaculty && (
                    <p style={{ color: '#999', fontSize: '0.85rem', margin: 0 }}>
                      👥 {t('gamePage.staffFacultyAllowed', 'Staff & Faculty can also participate')}
                    </p>
                  )}
                </div>
              )}

              <AsciiGlitchRipple as="p" delay={500} dur={600} style={{ fontSize: '1.2rem', color: '#ccc', lineHeight: '1.8', marginBottom: '40px' }}>
                {game.isComingSoon ? "Coming Soon" : t(`games.${game.id}.description`)}
              </AsciiGlitchRipple>

              {!game.isComingSoon && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem' }}>📍</div>
                    <div>
                      <h3 style={{ margin: '0 0 3px 0', fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('gamePage.venue')}</h3>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>{game.venue}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem' }}>⏰</div>
                    <div>
                      <h3 style={{ margin: '0 0 3px 0', fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('gamePage.time')}</h3>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>{game.time}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(255, 215, 0, 0.1)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                    <div style={{ fontSize: '2rem' }}>💰</div>
                    <div>
                      <h3 style={{ margin: '0 0 3px 0', fontSize: '1rem', color: '#FFD700', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('gamePage.entryFee', 'Entry Fee / Payment')}</h3>
                      <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>{game.price === 0 ? t('gamePage.free', 'Free') : `₹${game.price}`}</p>
                    </div>
                  </div>

                  {game.prizePool && (
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(50, 205, 50, 0.1)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(50, 205, 50, 0.3)' }}>
                      <div style={{ fontSize: '2rem' }}>🏆</div>
                      <div>
                        <h3 style={{ margin: '0 0 3px 0', fontSize: '1rem', color: '#32CD32', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('gamePage.prizePool', 'Prize Pool')}</h3>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.2)', whiteSpace: 'pre-line' }}>{game.prizePool}</p>
                      </div>
                    </div>
                  )}

                  {game.participationType && (
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div style={{ fontSize: '1.5rem' }}>👥</div>
                      <div>
                        <h3 style={{ margin: '0 0 3px 0', fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('gamePage.participationType', 'Participation')}</h3>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>
                          {game.participationType} {game.teamSize && `(${game.teamSize})`}
                        </p>
                      </div>
                    </div>
                  )}

                  {game.maxParticipants && (
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div style={{ fontSize: '1.5rem' }}>🛑</div>
                      <div>
                        <h3 style={{ margin: '0 0 3px 0', fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('gamePage.maxParticipants', 'Limit')}</h3>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>{game.maxParticipants}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

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

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '20px', fontFamily: '"Isabella", serif' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', fontFamily: '"Isabella", serif' }}>{t('gamePage.registrationInfo')}</h3>
                {game.isComingSoon ? (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(183,139,39,0.08), rgba(183,139,39,0.02))',
                    border: '1px solid rgba(183,139,39,0.2)',
                    borderRadius: '16px',
                    padding: '1.5rem'
                  }}>
                    <h4 style={{ margin: '0 0 10px', color: 'var(--primary)', fontSize: '1.2rem' }}>Coming Soon</h4>
                    <p style={{ color: '#aaa', margin: 0, lineHeight: '1.6' }}>
                      Registration for this event is currently disabled and will open soon. Stay tuned!
                    </p>
                  </div>
                ) : game.price === 0 ? (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(183,139,39,0.08), rgba(183,139,39,0.02))',
                    border: '1px solid rgba(183,139,39,0.2)',
                    borderRadius: '16px',
                    padding: '1.5rem'
                  }}>
                    <h4 style={{ margin: '0 0 10px', color: 'var(--primary)', fontSize: '1.2rem' }}>No Web Registration Required!</h4>
                    <p style={{ color: '#aaa', margin: 0, lineHeight: '1.6' }}>
                      Since this is a free event, there is no need to register online. We warmly welcome you to join us! On-spot registrations might be taken directly at the venue.
                    </p>
                  </div>
                ) : (
                  <>
                    <p style={{ marginBottom: '20px', color: '#aaa' }}>{t('gamePage.signUpQuickly')}</p>
                    <Link to={`/form?game=${game.id}`} className="game-register-btn" style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', textDecoration: 'none', padding: '12px 24px', borderRadius: '24px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                      {t('gamePage.registerFor')} {t(`games.${game.id}.title`)}
                    </Link>
                  </>
                )}
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
