import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LevitatingCard from './forgeui/3d-levitating-card';
import { PaidForm } from './Registration';
import Modal from './Modal';
import { XIcon } from '@animateicons/react/lucide';
import { gameCardsData } from '../data/gamesData';
import FlipText from './forgeui/flip-text';

export default function CinematicGameRegistration({ isOpen, onClose, initialGameId }) {
  const { t } = useTranslation();
  const [bgIndex, setBgIndex] = useState(0);
  const [modal, setModal] = useState(null);

  const backgrounds = ['/games/b1.jpg', '/games/b2.jpg', '/games/b3.jpg'];

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const game = gameCardsData.find(g => g.id.toString() === initialGameId?.toString()) || gameCardsData[0];
  
  // Custom mapping for 'solving a case' if it's hackathon or similar
  let displayImage = game.src;
  if (game.title.toLowerCase().includes('treasure hunt')) displayImage = '/games/treasure-hunt.jpg';
  if (game.title.toLowerCase().includes('hackathon')) displayImage = '/games/solving a case.jpg';

  const openSuccess = (formType) =>
    setModal({
      icon: '🎉',
      title: t('register.success.title'),
      message: t(`register.success.${formType}`),
    });

  const openError = () =>
    setModal({
      icon: '❌',
      title: t('register.error.title'),
      message: t('register.error.message'),
    });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: '#000',
        }}
      >
        {/* Dynamic Background */}
        {backgrounds.map((bg, idx) => (
          <motion.div
            key={bg}
            initial={{ opacity: 0 }}
            animate={{ opacity: bgIndex === idx ? 0.85 : 0 }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '-20px',
              left: '-20px',
              right: '-20px',
              bottom: '-20px',
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(3px) brightness(0.7)',
              zIndex: 1,
            }}
          />
        ))}

        {/* Ambient Glow / Lighting Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(255, 140, 50, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(180, 80, 255, 0.12) 0%, transparent 50%)',
          zIndex: 2,
          mixBlendMode: 'screen',
        }} />

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '30px',
            right: '30px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            backdropFilter: 'blur(10px)',
          }}
        >
          <XIcon size={24} />
        </button>

        {/* Main Content Layout */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '60px',
          width: '100%',
          maxWidth: '1200px',
          padding: '40px',
          height: '100%',
          overflowY: 'auto'
        }}>
          
          {/* Left: 3D Levitating Image */}
          <div className="group" style={{ flex: '1 1 400px', maxWidth: '500px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
            
            {/* Outer Glow Backlight (Hover Only) */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'rgba(255, 120, 0, 0.4)',
                filter: 'blur(50px)',
                zIndex: 0,
                borderRadius: '24px',
                transform: 'scale(0.95)'
              }}
            />

            <LevitatingCard style={{ width: '100%', position: 'relative', zIndex: 1 }}>
              <div style={{ position: 'relative', width: '100%', height: '500px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                
                {/* Inner Ambient Lighting (Hover Only) */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(255, 120, 0, 0.15) 0%, transparent 70%)',
                    zIndex: 0
                  }} 
                />
                
                <img 
                  src={displayImage}
                  alt="Game"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    zIndex: 1
                  }}
                />
              </div>
            </LevitatingCard>
          </div>

          {/* Right: Glassmorphism Registration Form */}
          <div style={{ flex: '1 1 400px', maxWidth: '550px' }}>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{
                background: 'rgba(20, 20, 25, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ marginBottom: '20px' }}>
                <FlipText duration={2.5} delay={0.5} loop={false} className="cinematic-title" style={{ fontSize: '2rem', fontWeight: 'bold', background: 'linear-gradient(45deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {`${t('gamePage.registerFor')} ${t(`games.${game.id}.title`)}`}
                </FlipText>
              </div>
              
              <div className="cinematic-form-wrapper" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                <PaidForm t={t} onSuccess={openSuccess} onError={openError} initialGameId={initialGameId} />
              </div>

            </motion.div>
          </div>

        </div>

        {modal && (
          <div style={{ position: 'fixed', zIndex: 10000 }}>
            <Modal 
              isOpen={true} 
              onClose={() => { setModal(null); onClose(); }}
              title={modal.title}
              message={modal.message}
              icon={modal.icon}
            />
          </div>
        )}

      </motion.div>
    </AnimatePresence>
  );
}
