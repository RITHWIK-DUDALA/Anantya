import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
export default function CinematicStory({ member, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  const [stage, setStage] = useState('blackVoid'); 
  // Stages: blackVoid -> folder -> decrypting -> seal -> shattering -> vrindavan -> flute -> story
  const [decryptionProgress, setDecryptionProgress] = useState(0);
  const [storyText, setStoryText] = useState("");
  
  const defaultStory = `The epic saga of ${member.name} began in the sacred halls of Amrita Vishwa Vidyapeetham. Like a true warrior of dharma, they faced countless trials, unexpected storms, and heavy responsibilities, rising to the mantle of ${member.role}. Guided by inner wisdom and unmatched devotion to the cause, they performed their duties flawlessly, achieving what many thought impossible—shaping Anantya into a divine reality!`;
  const story = member.story || defaultStory;

  // Cinematic sequencer
  useEffect(() => {
    let timeout;
    switch(stage) {
      case 'blackVoid': timeout = setTimeout(() => setStage('folder'), 2500); break;
      case 'folder': timeout = setTimeout(() => setStage('decrypting'), 2000); break;
      case 'shattering': timeout = setTimeout(() => setStage('vrindavan'), 1500); break;
      case 'vrindavan': timeout = setTimeout(() => setStage('flute'), 2000); break;
      case 'flute': timeout = setTimeout(() => setStage('story'), 3500); break;
    }
    return () => clearTimeout(timeout);
  }, [stage]);

  // Decryption terminal typing & progress
  useEffect(() => {
    if (stage === 'decrypting') {
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 12;
        if (prog >= 100) {
          setDecryptionProgress(100);
          clearInterval(interval);
          setTimeout(() => setStage('seal'), 1000);
        } else {
          setDecryptionProgress(Math.floor(prog));
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [stage]);

  // Typewriter effect for final story
  useEffect(() => {
    if (stage === 'story') {
      let i = 0;
      const interval = setInterval(() => {
        setStoryText(story.slice(0, i));
        i++;
        if (i > story.length) clearInterval(interval);
      }, 40);
      return () => clearInterval(interval);
    }
  }, [stage, story]);

  const handleSealClick = () => {
    if (stage === 'seal') setStage('shattering');
  };

  const isActII = ['vrindavan', 'flute', 'story'].includes(stage);

  return (
    <motion.div 
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      style={{ 
        position: 'fixed', inset: 0, zIndex: 9999, 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#000000',
        overflow: 'hidden',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        @keyframes crt-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes heartbeat {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.2; }
        }
        @keyframes glitch-anim {
          0% { clip-path: inset(10% 0 80% 0); transform: translate(-2px, 1px); }
          20% { clip-path: inset(80% 0 10% 0); transform: translate(2px, -1px); }
          40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
          60% { clip-path: inset(20% 0 60% 0); transform: translate(2px, -2px); }
          80% { clip-path: inset(60% 0 20% 0); transform: translate(-1px, 1px); }
          100% { clip-path: inset(30% 0 70% 0); transform: translate(1px, -1px); }
        }
        .glitch {
          position: relative;
        }
        .glitch::before, .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: #303b2c;
        }
        .glitch::before {
          left: 2px; text-shadow: -1px 0 red;
          animation: glitch-anim 2s infinite linear alternate-reverse;
        }
        .glitch::after {
          left: -2px; text-shadow: -1px 0 blue;
          animation: glitch-anim 3s infinite linear alternate-reverse;
        }
      `}</style>

      {/* Close button always accessible */}
      <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '25px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', zIndex: 100, fontSize: '1.2rem', paddingBottom: '2px' }}>&times;</button>

      {/* ACT I BACKGROUND ELEMENTS */}
      {!isActII && stage !== 'shattering' && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,255,0,0.05)', animation: 'heartbeat 2s infinite ease-in-out' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'rgba(255,255,255,0.15)', boxShadow: '0 0 10px rgba(255,255,255,0.3)', animation: 'crt-scan 4s infinite linear' }} />
        </>
      )}

      {/* ACT II BACKGROUND ELEMENTS */}
      {/* Background is handled by the main container's linear-gradient */}

      <AnimatePresence mode="wait">
        
        {/* SCENE 2 & 3: The Folder & Redacted Stream */}
        {['folder', 'decrypting'].includes(stage) && (
          <motion.div
            key="folder"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.1 }}
            transition={{ duration: 0.6 }}
            style={{ width: '100%', maxWidth: '600px', height: '400px', background: '#303b2c', borderRadius: '4px 20px 4px 4px', position: 'relative', border: '1px solid #1a2217', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}
          >
            {/* Top secret stamp */}
            <motion.div
              initial={{ opacity: 0, scale: 3, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: -15 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 150, damping: 10 }}
              style={{ position: 'absolute', top: '40px', right: '40px', border: '4px solid #a11', padding: '10px 20px', color: '#a11', fontFamily: 'Impact, sans-serif', fontSize: '2.5rem', letterSpacing: '2px', textTransform: 'uppercase', boxShadow: '0 0 10px rgba(170,17,17,0.2)' }}
            >
              TOP SECRET<br/>EYES ONLY
            </motion.div>

            {/* Red Dust Particles from stamp */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`red-dust-${i}`}
                initial={{ x: 'calc(100% - 120px)', y: '80px', scale: 0, opacity: 1 }}
                animate={{ x: `calc(100% - 120px + ${(Math.random() - 0.5) * 150}px)`, y: `80px + ${(Math.random() - 0.5) * 150}px`, scale: Math.random() * 2, opacity: 0 }}
                transition={{ delay: 0.5, duration: 1 + Math.random(), ease: "easeOut" }}
                style={{ position: 'absolute', width: '4px', height: '4px', background: '#a11', borderRadius: '50%' }}
              />
            ))}

            {/* Redacted Data Stream */}
            {stage === 'decrypting' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', fontFamily: '"Courier New", Courier, monospace', color: '#0f0', fontSize: '1.2rem', textShadow: '0 0 5px #0f0' }}
              >
                <div className="glitch" data-text="DECRYPTING FILE...">DECRYPTING FILE...</div>
                <div style={{ marginTop: '10px', lineHeight: '1.6' }}>
                  ACCESS LEVEL: {decryptionProgress > 20 ? '███████' : '▓▓▓▓▓▓▓'}<br/>
                  ORIGIN: {decryptionProgress > 50 ? '██████████' : '▓▓▓▓▓▓▓▓▓▓'}<br/>
                  STATUS: {decryptionProgress > 80 ? 'SEALED' : 'UNSEALING...'}
                </div>
                <div style={{ marginTop: '20px', height: '20px', border: '1px solid #0f0', width: '100%', position: 'relative' }}>
                  <div style={{ width: `${decryptionProgress}%`, height: '100%', background: '#0f0', transition: 'width 0.3s linear' }} />
                </div>
                <div style={{ marginTop: '5px', fontSize: '0.9rem', textAlign: 'right' }}>DECRYPTION: {decryptionProgress}%</div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SCENE 4: The Wax Seal */}
        {stage === 'seal' && (
          <motion.div
            key="seal"
            initial={{ opacity: 0, scale: 3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} // Exits via shattering effect directly
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              onClick={handleSealClick}
              style={{ width: '160px', height: '160px', background: 'radial-gradient(circle, #a11 0%, #500 100%)', borderRadius: '50%', border: '4px solid #300', boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
            >
              {/* Embossed peacock feather */}
              <span style={{ fontSize: '5.5rem', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.6)) sepia(1) hue-rotate(-50deg) saturate(4)' }}>🦚</span>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
            </motion.div>
            <motion.div 
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ marginTop: '40px', color: '#ff4444', fontFamily: '"Courier New", Courier, monospace', fontSize: '1.4rem', letterSpacing: '6px', textShadow: '0 0 10px #f00', cursor: 'pointer' }}
              onClick={handleSealClick}
            >
              BREAK THE SEAL
            </motion.div>
          </motion.div>
        )}

        {/* TRANSITION: Shattering & Peeling */}
        {stage === 'shattering' && (
          <div key="shattering" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            
            {/* The peeling background - expanding radial mask revealing the pure black */}
            <motion.div 
              initial={{ clipPath: 'circle(0% at 50% 50%)' }}
              animate={{ clipPath: 'circle(150% at 50% 50%)' }}
              transition={{ duration: 1.5, ease: "easeIn" }}
              style={{ position: 'absolute', inset: 0, background: '#000000', zIndex: -1 }} 
            />
            
            {/* Left half of shattered seal */}
            <motion.div
              initial={{ x: 0, rotate: 0, opacity: 1 }}
              animate={{ x: -300, y: 150, rotate: -45, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ width: '80px', height: '160px', background: 'radial-gradient(circle at right, #a11 0%, #500 100%)', borderTopLeftRadius: '160px', borderBottomLeftRadius: '160px', borderLeft: '4px solid #300', borderTop: '4px solid #300', borderBottom: '4px solid #300', position: 'absolute', left: 'calc(50% - 80px)', zIndex: 10, clipPath: 'polygon(0 0, 100% 0, 80% 20%, 100% 40%, 70% 60%, 100% 80%, 90% 100%, 0 100%)' }}
            />
            
            {/* Right half of shattered seal */}
            <motion.div
              initial={{ x: 0, rotate: 0, opacity: 1 }}
              animate={{ x: 300, y: 150, rotate: 45, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ width: '80px', height: '160px', background: 'radial-gradient(circle at left, #a11 0%, #500 100%)', borderTopRightRadius: '160px', borderBottomRightRadius: '160px', borderRight: '4px solid #300', borderTop: '4px solid #300', borderBottom: '4px solid #300', position: 'absolute', left: '50%', zIndex: 10, clipPath: 'polygon(100% 0, 0 0, 20% 20%, 0 40%, 30% 60%, 0 80%, 10% 100%, 100% 100%)' }}
            />

            {/* Golden Dust Explosion (from wax shatter) */}
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={`gold-dust-${i}`}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ x: (Math.random() - 0.5) * 800, y: (Math.random() - 0.5) * 800, scale: 0, opacity: 0, rotate: Math.random() * 360 }}
                transition={{ duration: 1.5 + Math.random(), ease: "easeOut" }}
                style={{ position: 'absolute', width: `${5 + Math.random() * 8}px`, height: `${5 + Math.random() * 8}px`, background: '#d4af37', borderRadius: '50%', boxShadow: '0 0 15px #d4af37', zIndex: 15 }}
              />
            ))}

            {/* Floating Sanskrit dissolving terminal text */}
            {['ॐ', 'श्री', 'कृ', 'ष्ण', 'ग', 'रु', 'ध', 'र्म', 'स', 'त्य', 'ज्ञा', 'न', 'अ', 'न', 'ंत'].map((char, i) => (
              <motion.div
                key={`sanskrit-${i}`}
                initial={{ x: (Math.random() - 0.5) * 600, y: 100 + Math.random() * 150, opacity: 1, color: '#0f0', scale: 1 }}
                animate={{ y: -400 - Math.random() * 200, opacity: 0, color: '#d4af37', scale: 2, rotate: (Math.random() - 0.5) * 120 }}
                transition={{ duration: 2 + Math.random(), ease: "easeOut" }}
                style={{ position: 'absolute', fontFamily: 'serif', fontSize: '2.5rem', zIndex: 12, textShadow: '0 0 15px currentColor' }}
              >
                {char}
              </motion.div>
            ))}
          </div>
        )}

        {/* ACT II: Flute Motif */}
        {stage === 'flute' && (
          <motion.div
            key="flute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20 }}
          >
            <svg width="500" height="200" viewBox="0 0 500 200">
              {/* Flute curve */}
              <motion.path
                d="M 50 120 Q 250 150, 450 70" 
                fill="transparent"
                strokeWidth="8"
                stroke="#d4af37"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                style={{ filter: 'drop-shadow(0 0 15px #d4af37)' }}
              />
              {/* Flute tassel */}
              <motion.path
                d="M 65 118 Q 70 160, 80 180" 
                fill="transparent"
                strokeWidth="4"
                stroke="#d4af37"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                style={{ filter: 'drop-shadow(0 0 8px #d4af37)' }}
              />
              <motion.path
                d="M 65 118 Q 50 150, 45 170" 
                fill="transparent"
                strokeWidth="3"
                stroke="#d4af37"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                style={{ filter: 'drop-shadow(0 0 8px #d4af37)' }}
              />
              {/* Flute holes */}
              {[200, 260, 320, 380].map((cx, i) => (
                <motion.circle
                  key={`hole-${i}`}
                  cx={cx} cy={133 - (i * 15.5)} r="5"
                  fill="#101935" stroke="#d4af37" strokeWidth="2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.5 + (i * 0.2), duration: 0.4 }}
                />
              ))}
            </svg>
            
            {/* Floating musical notes */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`note-${i}`}
                initial={{ opacity: 0, y: -50, x: (Math.random() - 0.5) * 300, scale: 0.5 }}
                animate={{ opacity: [0, 1, 0], y: -250, x: (Math.random() - 0.5) * 400, scale: 1.5, rotate: Math.random() * 90 }}
                transition={{ delay: 1 + Math.random(), duration: 2.5, ease: "easeOut" }}
                style={{ position: 'absolute', fontSize: '2.5rem', color: '#d4af37', textShadow: '0 0 15px #d4af37', zIndex: 10 }}
              >
                {['🎵', '🎶', '🎼', '✨'][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ACT II: The Classified Dossier (Final Story Reveal) */}
        {stage === 'story' && (
          <motion.div
            key="story-dossier"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            style={{ 
              width: '100%', maxWidth: '900px', background: '#13110d', border: '1px solid #2a2721', 
              padding: '40px 50px', position: 'relative', 
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
              fontFamily: '"Courier New", Courier, monospace', color: '#c2b7a3',
              textAlign: 'left',
              boxSizing: 'border-box',
              overflowY: 'auto',
              maxHeight: '90vh'
            }}
          >
            {/* Header */}
            <div style={{ fontSize: '12px', borderBottom: '1px solid #2a2721', paddingBottom: '15px', marginBottom: '30px', letterSpacing: '2px', color: '#8a8271' }}>
              CASE FILE // DO NOT DUPLICATE
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {/* Left Column Data */}
              <div style={{ flex: 1, paddingRight: '40px' }}>
                <h1 style={{ color: '#d34444', fontSize: '32px', letterSpacing: '6px', margin: '0 0 10px 0', textShadow: '0 0 10px rgba(211,68,68,0.3)' }}>
                  TOP SECRET
                </h1>
                <p style={{ fontSize: '14px', letterSpacing: '3px', margin: '0 0 40px 0', fontWeight: 'bold' }}>
                  EYES ONLY // CLASSIFIED DOSSIER
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '20px', fontSize: '15px', letterSpacing: '1px', fontWeight: 'bold' }}>
                  <div style={{ color: '#8a8271' }}>NAME:</div>
                  <div><span style={{ background: '#d34444', color: '#13110d', padding: '2px 10px' }}>{member.name}</span></div>
                  
                  <div style={{ color: '#8a8271' }}>DESIGNATION:</div>
                  <div style={{ color: '#c2b7a3' }}>{member.role || 'CORE MEMBER'}</div>
                  
                  <div style={{ color: '#8a8271' }}>ORIGIN:</div>
                  <div style={{ color: '#c2b7a3' }}>{member.year || 'REDACTED'}</div>
                  
                  <div style={{ color: '#8a8271' }}>STATUS:</div>
                  <div style={{ color: '#5eb170', textShadow: '0 0 8px rgba(94,177,112,0.4)' }}>ACTIVE LEELA</div>
                </div>
              </div>

              {/* Right Column Polaroid */}
              <motion.div 
                initial={{ opacity: 0, x: 20, rotate: 10 }}
                animate={{ opacity: 1, x: 0, rotate: 3 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                style={{ position: 'relative', top: '-10px', right: '10px' }}
              >
                <div style={{ border: '2px dashed #d34444', padding: '6px', background: '#111', width: '180px', position: 'relative' }}>
                  <div style={{ width: '100%', height: '220px', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {member.photo ? (
                       <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.3) contrast(1.1)' }} />
                    ) : (
                       <div style={{ fontSize: '3rem', color: '#555', fontFamily: 'serif' }}>{member.name.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
                    )}
                  </div>
                  <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center', color: '#5eb170', fontSize: '13px', letterSpacing: '3px', borderBottom: '1px solid #5eb170', borderTop: '1px solid #5eb170', padding: '4px 0', background: 'rgba(17,17,17,0.95)', transform: 'rotate(-5deg)', fontWeight: 'bold' }}>
                    DECRYPTED
                  </div>
                </div>
                <div style={{ fontSize: '11px', marginTop: '8px', letterSpacing: '1px', color: '#8a8271', textAlign: 'center' }}>
                  SUBJECT ID: <span style={{ background: '#8a8271', color: '#8a8271', padding: '0 5px' }}>8492</span> <span style={{ background: '#8a8271', color: '#8a8271', padding: '0 10px' }}>77</span>
                </div>
              </motion.div>
            </div>

            {/* Story Log */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              style={{ marginTop: '40px', borderTop: '1px solid #2a2721', paddingTop: '25px' }}
            >
              <div style={{ fontSize: '13px', marginBottom: '20px', color: '#5eb170', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                BACKGROUND DOSSIER 
                <span style={{ flex: 1, height: '1px', background: '#2a2721' }} />
              </div>
              
              <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#c2b7a3', letterSpacing: '0.5px' }}>
                {storyText.split('\n').map((para, i) => (
                  <p key={i} style={{ margin: '0 0 1.5rem' }}>{para}</p>
                ))}
                {storyText.length === story.length && (
                  <motion.span 
                    animate={{ opacity: [1, 0, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ display: 'inline-block', width: '10px', height: '18px', background: '#5eb170', marginLeft: '10px', verticalAlign: 'text-bottom' }} 
                  />
                )}
              </div>
            </motion.div>

            {/* Footer & Broken Seal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '50px' }}>
              <div style={{ fontSize: '11px', color: '#4a453a', letterSpacing: '1px', lineHeight: '1.8' }}>
                AUTHORIZED PERSONNEL ONLY<br/><br/>
                FILE REF: <span style={{ background: '#4a453a', color: '#4a453a', padding: '0 10px' }}>000</span>-<span style={{ background: '#4a453a', color: '#4a453a', padding: '0 15px' }}>0000</span> // ARCHIVED
              </div>
              
              {/* Static Broken Seal to show it was opened */}
              <div style={{ opacity: 0.5, transform: 'rotate(15deg) scale(0.8)' }}>
                <div style={{ 
                  width: '100px', height: '100px', 
                  background: 'radial-gradient(circle, #811 0%, #400 100%)', 
                  borderRadius: '50%', border: '2px solid #200', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)'
                }}>
                  <span style={{ fontSize: '2.5rem', filter: 'sepia(1) hue-rotate(-50deg) saturate(2)' }}>🦚</span>
                  <span style={{ color: '#000', fontSize: '10px', marginTop: '4px', letterSpacing: '2px', fontWeight: 'bold' }}>UNSEALED</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
