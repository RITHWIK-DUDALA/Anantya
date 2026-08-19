import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SpecialEventsBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show banner shortly after page load
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'transparent',
              borderRadius: '24px',
              padding: '20px',
              maxWidth: '800px',
              width: '100%',
              position: 'relative',
              textAlign: 'center'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.6)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.2rem',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.color = 'rgba(255, 255, 255, 0.6)';
              }}
            >
              &times;
            </button>

            <h2 style={{
              fontFamily: '"Isabella", serif',
              fontSize: '2.2rem',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 0 10px 0',
              letterSpacing: '2px',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.6)'
            }}>
              SPECIAL EVENTS
            </h2>
            <p style={{
              color: '#ccc',
              fontSize: '1.05rem',
              fontStyle: 'italic',
              margin: '0 0 30px 0',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              Get ready for the ultimate mysteries... Coming Soon!
            </p>

            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: '1 1 250px', maxWidth: '320px' }}>
                <img 
                  src="/games/treasure hunt poster.jpeg" 
                  alt="Treasure Hunt" 
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '12px',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)'
                  }}
                />
              </div>
              <div style={{ flex: '1 1 250px', maxWidth: '320px' }}>
                <img 
                  src="/games/cold case poster.webp" 
                  alt="Cold Case" 
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '12px',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)'
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
