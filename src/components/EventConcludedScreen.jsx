import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Galaxy from './Galaxy';

const HASH_AUTH = '79a86064afdbce4fd60241a239183730fcb44a968f9df48ce87b49eaabe62ad3';
const HASH_STMT = '484aab2f2cd0f77b3c30f91521ba9a76c8c501112a53e100154a098c274f03d3';

const computeHash = async (val) => {
  const data = new TextEncoder().encode(val);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export default function EventConcludedScreen() {
  const [isUnlocked, setIsUnlocked] = useState(
    () => sessionStorage.getItem('_auth_sec_token') === '1'
  );
  const [mode, setMode] = useState('thanks');

  useEffect(() => {
    let buffer = '';

    const handleKeyDown = async (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      const char = e.key.toLowerCase();
      if (/^[a-z0-9]$/.test(char)) {
        buffer = (buffer + char).slice(-40);

        if (buffer.length >= 5) {
          const hash5 = await computeHash(buffer.slice(-5));
          if (hash5 === HASH_STMT) {
            setMode('sorry');
          }
        }

        if (buffer.length >= 27) {
          const hash27 = await computeHash(buffer.slice(-27));
          if (hash27 === HASH_AUTH) {
            sessionStorage.setItem('_auth_sec_token', '1');
            setIsUnlocked(true);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isUnlocked) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#030305',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '40px 24px',
        boxSizing: 'border-box',
      }}
    >
      {/* Background Ambient Galaxy */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.65, pointerEvents: 'none', zIndex: 0 }}>
        <Galaxy
          mouseRepulsion
          mouseInteraction
          density={1.3}
          glowIntensity={0.5}
          saturation={0}
          hueShift={140}
          twinkleIntensity={0.6}
          rotationSpeed={0.06}
          starSpeed={0.35}
          speed={0.7}
        />
      </div>

      {/* Subtle White Ambient Center Glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '550px',
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 45%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Main Content (Completely blended into background, no card box) */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '850px',
          width: '100%',
          margin: 'auto',
          textAlign: 'center',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: '20px 10px',
        }}
      >
        <AnimatePresence mode="wait">
          {mode === 'thanks' ? (
            /* ─────────────────────────────────────────────────────────────
               SCREEN 1: EVENT CONCLUDED & HEARTFELT THANKS
               ───────────────────────────────────────────────────────────── */
            <motion.div
              key="thanks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Glowing White Title */}
              <h1
                style={{
                  fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
                  fontFamily: 'Cinzel, Georgia, serif',
                  fontWeight: 900,
                  margin: '0 0 24px 0',
                  color: '#ffffff',
                  textShadow:
                    '0 0 25px rgba(255, 255, 255, 0.95), 0 0 50px rgba(255, 255, 255, 0.5), 0 0 90px rgba(255, 255, 255, 0.25)',
                  letterSpacing: '3px',
                  lineHeight: 1.15,
                  textTransform: 'uppercase',
                }}
              >
                Event Concluded
              </h1>

              {/* Sub-heading / Gratitude Banner */}
              <p
                style={{
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                  color: '#ffffff',
                  fontWeight: 600,
                  margin: '0 0 28px 0',
                  textShadow: '0 0 15px rgba(255, 255, 255, 0.6)',
                  letterSpacing: '1px',
                }}
              >
                A Heartfelt Thanks from the Anantya Team
              </p>

              {/* Normal White Body Text */}
              <p
                style={{
                  fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
                  color: '#ffffff',
                  lineHeight: 1.9,
                  maxWidth: '780px',
                  margin: '0 auto 20px auto',
                  fontWeight: 400,
                }}
              >
                Anantya 2026 has officially concluded. We extend our deepest gratitude and heartfelt thanks to the students, faculty members, organizers, volunteers, and everyone involved in making this event happen.
              </p>

              <p
                style={{
                  fontSize: 'clamp(1.02rem, 1.9vw, 1.2rem)',
                  color: '#ffffff',
                  lineHeight: 1.9,
                  maxWidth: '780px',
                  margin: '0 auto 20px auto',
                  fontWeight: 400,
                }}
              >
                A very special thanks to everyone who participated directly or indirectly, bringing life, passion, and immense energy to every moment of the celebration.
              </p>

              <p
                style={{
                  fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                  color: '#ffffff',
                  lineHeight: 1.85,
                  maxWidth: '750px',
                  margin: '0 auto 36px auto',
                  fontWeight: 300,
                  opacity: 0.95,
                }}
              >
                We also express our sincere appreciation to everyone for their considerate feedback and support, which helps us continuously learn, grow, and build even better experiences together.
              </p>

              {/* Signature */}
              <div style={{ marginTop: '30px' }}>
                <span
                  style={{
                    fontSize: '1rem',
                    color: '#ffffff',
                    fontWeight: 500,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                  }}
                >
                  — With Love, Anantya Core Team
                </span>
              </div>
            </motion.div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
               SCREEN 2: APOLOGY & CLARIFICATION (UNLOCKED BY "SORRY")
               ───────────────────────────────────────────────────────────── */
            <motion.div
              key="sorry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Glowing White Title */}
              <h1
                style={{
                  fontSize: 'clamp(2.3rem, 5.5vw, 3.8rem)',
                  fontFamily: 'Cinzel, Georgia, serif',
                  fontWeight: 900,
                  margin: '0 0 20px 0',
                  color: '#ffffff',
                  textShadow:
                    '0 0 25px rgba(255, 255, 255, 0.95), 0 0 50px rgba(255, 255, 255, 0.5), 0 0 90px rgba(255, 255, 255, 0.25)',
                  letterSpacing: '2px',
                  lineHeight: 1.15,
                  textTransform: 'uppercase',
                }}
              >
                A Note of Sincere Apology
              </h1>

              {/* Normal White Text Content */}
              <div
                style={{
                  maxWidth: '800px',
                  margin: '0 auto 36px auto',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontSize: 'clamp(1.1rem, 2.2vw, 1.3rem)',
                    color: '#ffffff',
                    lineHeight: 1.8,
                    margin: '0 0 20px 0',
                    fontWeight: 600,
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                  }}
                >
                  Dear Students, Faculty, and Participants,
                </p>

                <p
                  style={{
                    fontSize: 'clamp(1.05rem, 2vw, 1.2rem)',
                    color: '#ffffff',
                    lineHeight: 1.9,
                    margin: '0 0 20px 0',
                    fontWeight: 400,
                  }}
                >
                  We sincerely apologize for the inconvenience caused because of the unexpected shortage of lanterns and for the unforeseen cancellation of the DJ night due to an unprecedented fight between students.
                </p>

                <p
                  style={{
                    fontSize: 'clamp(1.02rem, 1.9vw, 1.15rem)',
                    color: '#ff4d4f',
                    lineHeight: 1.85,
                    margin: '0 0 20px 0',
                    fontWeight: 500,
                    textShadow: '0 0 15px rgba(255, 77, 79, 0.45)',
                  }}
                >
                  ⚖️ <strong>Administrative Action:</strong> This incident is being thoroughly handled with utmost seriousness, and necessary disciplinary action is being enforced by the authorities.
                </p>

                <p
                  style={{
                    fontSize: 'clamp(1.05rem, 2vw, 1.2rem)',
                    color: '#ffffff',
                    lineHeight: 1.9,
                    margin: '0 0 28px 0',
                    fontWeight: 400,
                  }}
                >
                  We earnestly urge everyone to maintain mutual respect, maturity, and unity. Please join hands to make all future campus events joyous, safe, and successful. Let us always remain <strong>civilized, responsible, and happy</strong> together.
                </p>

                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '1rem',
                      color: '#ffffff',
                      fontWeight: 600,
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      textShadow: '0 0 10px rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    — The Anantya Organizing Committee
                  </span>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Campus Discipline & Welfare
                  </span>
                </div>
              </div>

              {/* Return button back to gratitude screen */}
              <div>
                <button
                  onClick={() => setMode('thanks')}
                  style={{
                    background: 'transparent',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    padding: '12px 30px',
                    borderRadius: '50px',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    letterSpacing: '1px',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.15)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ffffff';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.15)';
                  }}
                >
                  ← Return
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
