import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CONFIG from '../config/config';
import { useTranslation } from 'react-i18next';

export function ClubModal({ club, onClose }) {
  if (!club) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay" 
      onClick={(e) => e.target === e.currentTarget && onClose()} 
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 9999 }}
    >
      <style>{`
        .club-modal-container {
          flex-direction: row;
        }
        .club-modal-image {
          flex: 0 0 45%;
          min-height: 400px;
        }
        .club-modal-image img {
          border-top-left-radius: 16px;
          border-bottom-left-radius: 16px;
        }
        .club-modal-logo {
          top: -20px;
          right: -40px;
        }
        @media (max-width: 768px) {
          .club-modal-container {
            flex-direction: column;
          }
          .club-modal-image {
            width: 100%;
            height: 250px;
            min-height: auto;
          }
          .club-modal-image img {
            border-bottom-left-radius: 0;
            border-top-right-radius: 16px;
          }
          .club-modal-logo {
            top: auto;
            bottom: -40px;
            right: 20px;
          }
        }
      `}</style>
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="modal-box card club-modal-container" 
        style={{ 
          position: 'relative', 
          margin: 0, 
          width: '100%', 
          maxWidth: '800px', 
          display: 'flex', 
          padding: 0,
          background: 'var(--surface)',
          borderRadius: '16px',
          overflow: 'visible',
          border: 'none'
        }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--bg-alt)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}>
          &times;
        </button>
        
        {/* Left Side: Rep Photo */}
        <div className="club-modal-image" style={{ position: 'relative' }}>
          <img 
            src={club.repPhoto} 
            alt={club.repName} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: club.repPhotoPosition || 'center' }} 
          />
          {/* Overlapping Club Logo */}
          <div className="club-modal-logo" style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid var(--surface)',
            background: club.logoBg || 'var(--bg-alt)',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            zIndex: 5
          }}>
             <img src={club.logo} alt={club.name} style={{ width: '100%', height: '100%', objectFit: club.logoObjectFit || 'cover', transform: club.logoTransform || 'none' }} />
          </div>
        </div>

        {/* Right Side: Details */}
        <div style={{ flex: '1', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
          
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', color: 'var(--text)', fontWeight: 'bold', lineHeight: '1.4' }}>
            <span style={{ color: 'var(--primary)' }}>{club.repName}</span> representing {club.name}
          </h3>
          
          {club.tagline && (
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text)', fontWeight: '800', textTransform: 'capitalize', marginBottom: '4px' }}>tag line :</strong>
              <p style={{ margin: '0', fontSize: '1rem', color: 'var(--primary)', fontStyle: 'italic' }}>
                "{club.tagline}"
              </p>
            </div>
          )}
          
          {club.description && (
            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text)', fontWeight: '800', textTransform: 'capitalize', marginBottom: '4px' }}>description :</strong>
              <p style={{ margin: '0', fontSize: '0.95rem', color: 'var(--text)', lineHeight: '1.6' }}>
                {club.description}
              </p>
            </div>
          )}

          {club.phone && (
            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text)', fontWeight: '800', textTransform: 'capitalize', marginBottom: '4px' }}>contact :</strong>
              <p style={{ margin: '0', fontSize: '1rem', color: 'var(--text)', fontWeight: '500' }}>
                {club.phone}
              </p>
            </div>
          )}

          {club.instagram && (
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <a href={club.instagram} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: 'white', padding: '8px 20px', borderRadius: '24px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                View on Instagram
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Collaborators() {
  const { t } = useTranslation();
  const [selectedClub, setSelectedClub] = useState(null);

  if (!CONFIG.collaborators || CONFIG.collaborators.length === 0) return null;

  return (
    <section id="collaborators" className="section" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="title">Clubs Which Made This Possible</h2>
          <div className="title-underline"></div>
          <p style={{ 
            textAlign: 'center', 
            marginTop: '15px', 
            fontSize: '0.9rem', 
            color: 'var(--text-muted, #888)',
            fontStyle: 'italic'
          }}>
            Click on a club to read more about them
          </p>
        </motion.div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '40px', 
          flexWrap: 'wrap', 
          marginTop: '50px',
          padding: '0 20px'
        }}>
          {CONFIG.collaborators.map((club, index) => {
            return (
              <motion.div 
                key={index}
                className="reveal"
                onClick={() => setSelectedClub(club)}
                whileHover={{ y: -10, scale: 1.05 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                style={{ 
                  width: '180px', 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '15px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: club.logoBg || 'var(--bg-alt)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={club.logo} 
                    alt={club.name} 
                    style={{ width: '100%', height: '100%', objectFit: club.logoObjectFit || 'cover', transform: club.logoTransform || 'none' }} 
                  />
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  color: 'var(--text)',
                  textAlign: 'center',
                  margin: 0,
                  fontWeight: '600'
                }}>
                  {club.name}
                </h3>
                {club.tagline && (
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--primary)',
                    textAlign: 'center',
                    margin: '-5px 0 0 0',
                    fontStyle: 'italic',
                    opacity: 0.9,
                    maxWidth: '180px'
                  }}>
                    "{club.tagline}"
                  </p>
                )}
                <div style={{ marginTop: 'auto', paddingTop: '10px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                  {club.instagram && (
                    <a 
                      href={club.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        color: 'white',
                        padding: '6px 16px',
                        borderRadius: '16px',
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                      }}
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedClub && (
          <ClubModal club={selectedClub} onClose={() => setSelectedClub(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
