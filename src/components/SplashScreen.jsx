import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SplashScreen
 * - Phase 1 'center': logo springs in at viewport center with glow ring
 * - Phase 2 'fly':    logo flies to the EXACT position of #navbar-logo-img
 * - Phase 3 'done':   background fades out, site is revealed
 */
export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('center');
  // Target rect measured from the real navbar logo element
  const [target, setTarget] = useState(null);

  /* ── Measure navbar logo position once DOM is ready ── */
  useEffect(() => {
    // Small delay so navbar has rendered
    const measure = setTimeout(() => {
      const el = document.getElementById('navbar-logo-img');
      if (el) {
        const r = el.getBoundingClientRect();
        setTarget({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
    }, 100);

    const flyTimer = setTimeout(() => setPhase('fly'), 1800);
    const doneTimer = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('splashShown', 'true');
      onComplete?.();
    }, 3000);

    return () => {
      clearTimeout(measure);
      clearTimeout(flyTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  const isFlying = phase === 'fly' || phase === 'done';

  // Center position for the logo (220×220 centered in viewport)
  const CW = 220, CH = 220;
  const centerTop = `calc(50vh - ${CH / 2}px)`;
  const centerLeft = `calc(50vw - ${CW / 2}px)`;

  return (
    <>
      {/* White background overlay */}
      <AnimatePresence>
        {phase !== 'done' && (
          <motion.div
            key="splash-bg"
            initial={{ opacity: 1 }}
            animate={{ opacity: isFlying ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut', delay: isFlying ? 0.35 : 0 }}
            style={{
              position: 'fixed', inset: 0,
              zIndex: 99998,
              background: '#ffffff',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Glow ring — center phase only */}
      <AnimatePresence>
        {phase === 'center' && (
          <motion.div
            key="glow-ring"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.15, 1], opacity: [0, 0.5, 0.25] }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: `calc(50vh - 140px)`,
              left: `calc(50vw - 140px)`,
              width: 280, height: 280,
              borderRadius: '50%',
              border: '1.5px solid rgba(183,139,39,0.45)',
              background: 'radial-gradient(circle, rgba(183,139,39,0.07) 0%, transparent 70%)',
              zIndex: 99999, pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Pulse ring */}
      <AnimatePresence>
        {phase === 'center' && (
          <motion.div
            key="pulse-ring"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 2, opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: `calc(50vh - 110px)`,
              left: `calc(50vw - 110px)`,
              width: 220, height: 220,
              borderRadius: '50%',
              border: '1px solid rgba(183,139,39,0.3)',
              zIndex: 99999, pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── The flying logo ── */}
      <AnimatePresence>
        {phase !== 'done' && (
          <motion.img
            key="splash-logo"
            src="/assets/logo.webp"
            alt="Anantya"
            initial={{ opacity: 0, scale: 0.4, top: centerTop, left: centerLeft, width: CW, height: CH }}
            animate={
              isFlying && target
                ? {
                    // Fly to EXACT navbar logo bounding rect
                    top: target.top,
                    left: target.left,
                    width: target.width,
                    height: target.height,
                    opacity: 0,   // fade out as it settles (navbar logo takes over)
                    scale: 1,
                  }
                : {
                    opacity: 1,
                    scale: 1,
                    top: centerTop,
                    left: centerLeft,
                    width: CW,
                    height: CH,
                  }
            }
            transition={
              isFlying
                ? { duration: 0.85, ease: [0.4, 0, 0.2, 1] }
                : { duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }
            }
            style={{
              position: 'fixed',
              objectFit: 'contain',
              zIndex: 99999,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
