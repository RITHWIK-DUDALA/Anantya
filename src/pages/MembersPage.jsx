import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightNavbar } from '../components/SpotlightNavbar';
import CONFIG from '../config/config';
import { MemberCard } from '../components/Committee';
import { ClubModal } from '../components/Collaborators';

/* ── Birthday Sparkle Component ──────────────────────────── */
function BirthdaySparkles() {
  const sparkles = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {sparkles.map((i) => {
        const angle = (i / sparkles.length) * 360;
        const delay = (i / sparkles.length) * 2;
        const dist = 85 + Math.random() * 30;
        const size = 6 + Math.random() * 8;
        const emojis = ['✨','🌟','⭐','💫','🎉','🎊','🎈','🎂'];
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              fontSize: `${size}px`,
              originX: '50%',
              originY: '50%',
            }}
            animate={{
              x: [
                0,
                Math.cos((angle * Math.PI) / 180) * dist,
                Math.cos((angle * Math.PI) / 180) * (dist + 20),
                0,
              ],
              y: [
                0,
                Math.sin((angle * Math.PI) / 180) * dist,
                Math.sin((angle * Math.PI) / 180) * (dist + 20),
                0,
              ],
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0],
            }}
            transition={{
              duration: 2.4,
              delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {emojis[i % emojis.length]}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Birthday Avatar Wrapper ─────────────────────────────── */
function BirthdayAvatarWrapper({ children }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Rotating rainbow glow ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: '-6px',
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #c77dff, #ff6b6b)',
          zIndex: 0,
        }}
      />
      {/* Inner mask to create ring effect */}
      <div
        style={{
          position: 'absolute',
          inset: '3px',
          borderRadius: '50%',
          background: '#000',
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
      <BirthdaySparkles />
    </div>
  );
}

const MemberProfileModalLarge = ({ member, onClose }) => {
  if (!member) return null;
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
        .member-modal-container {
          flex-direction: row;
          height: 500px;
        }
        .member-modal-image {
          flex: 0 0 45%;
          height: 100%;
        }
        .member-modal-image img {
          border-top-left-radius: 16px;
          border-bottom-left-radius: 16px;
        }
        .member-modal-content {
          flex: 1;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        @media (max-width: 768px) {
          .member-modal-container {
            flex-direction: column;
            height: 85vh;
          }
          .member-modal-image {
            width: 100%;
            height: 250px;
            flex: none;
          }
          .member-modal-image img {
            border-bottom-left-radius: 0;
            border-top-right-radius: 16px;
          }
          .member-modal-content {
            padding: 1.5rem;
          }
        }
      `}</style>
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="modal-box card member-modal-container" 
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
        
        {/* Left Side: Photo */}
        <div className="member-modal-image" style={{ position: 'relative' }}>
          {member.photo ? (
            <img 
              src={member.photo} 
              alt={member.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: member.objectPosition || 'center' }} 
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-alt)', fontSize: '3rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
              {member.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="member-modal-content" style={{ textAlign: 'left' }}>
          
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', color: 'var(--text)', fontWeight: 'bold', lineHeight: '1.4' }}>
            <span style={{ color: 'var(--primary)' }}>{member.name}</span>
            <div style={{ fontSize: '1.1rem', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>{member.role}</div>
          </h3>
          
          {member.year && (
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text)', fontWeight: '800', textTransform: 'capitalize', marginBottom: '4px' }}>Year :</strong>
              <p style={{ margin: '0', fontSize: '1rem', color: 'var(--primary)', fontStyle: 'italic' }}>
                {member.year}
              </p>
            </div>
          )}
          
          {member.story && (
            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text)', fontWeight: '800', textTransform: 'capitalize', marginBottom: '4px' }}>Description :</strong>
              <p style={{ margin: '0', fontSize: '0.95rem', color: 'var(--text)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {member.story}
              </p>
            </div>
          )}

          {member.responsibilities && (
            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text)', fontWeight: '800', textTransform: 'capitalize', marginBottom: '4px' }}>Responsibilities :</strong>
              <p style={{ margin: '0', fontSize: '0.95rem', color: 'var(--text)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {member.responsibilities}
              </p>
            </div>
          )}

          {member.phone && (
            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text)', fontWeight: '800', textTransform: 'capitalize', marginBottom: '4px' }}>Contact :</strong>
              <p style={{ margin: '0', fontSize: '1rem', color: 'var(--text)', fontWeight: '500' }}>
                +91 {member.phone}
              </p>
              {member.contactTime && (
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--primary-light)', fontStyle: 'italic' }}>
                  Available: {member.contactTime}
                </p>
              )}
            </div>
          )}
          
          {member.email && (
            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text)', fontWeight: '800', textTransform: 'capitalize', marginBottom: '4px' }}>Email :</strong>
              <p style={{ margin: '0', fontSize: '1rem', color: 'var(--text)', fontWeight: '500' }}>
                {member.email}
              </p>
            </div>
          )}

          {member.instagram && (
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <a href={member.instagram} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: 'white', padding: '8px 20px', borderRadius: '24px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                View on Instagram
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function MembersPage() {
  const { t } = useTranslation();

  const ref = useRef(null);

  // Scroll to top on mount and set up scroll reveals
  useEffect(() => {
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { 
          e.target.classList.add('revealed'); 
          observer.unobserve(e.target); 
        }
      });
    }, { threshold: 0.1 });
    
    const els = ref.current?.querySelectorAll('.reveal');
    els?.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  const activeMembers = CONFIG.committee.filter((m) => !m.comingSoon);
  const faculty = activeMembers.filter(m => m.role.toLowerCase().includes('faculty'));
  const coordinators = activeMembers.filter(m => m.isCoordinator);
  const decorCoords = coordinators.filter(m => m.role === 'Decorations');
  const coreMembers = activeMembers.filter(m => !m.role.toLowerCase().includes('faculty') && !m.isCoordinator);

  const clubReps = CONFIG.collaborators
    .filter(club => club.repPhoto && club.repName !== "Rep Name")
    .map(club => ({
      name: club.repName,
      role: club.name,
      photo: club.repPhoto,
      objectPosition: club.objectPosition || 'top',
      transform: club.transform || 'none',
      transformOrigin: club.transformOrigin || 'center',
      instagram: club.instagram || null,
      clubOriginal: club
    }));

  const CircleSection = ({ title, members, showInsta = false }) => {
    if (!members || members.length === 0) return null;
    return (
      <div style={{ marginBottom: '60px' }}>
        {title && (
          <h3 style={{ 
            fontSize: '2rem', 
            color: 'var(--primary-light)', 
            textAlign: 'center', 
            marginBottom: '50px',
            fontFamily: 'Cinzel, serif',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            {title}
          </h3>
        )}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '40px', 
          flexWrap: 'wrap', 
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {members.map((m, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10, scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: (i % 6) * 0.1, duration: 0.5 }}
              style={{ 
                width: '180px', 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
                position: 'relative',
              }}
            >
              {/* Avatar with optional birthday wrapper */}
              {m.birthday ? (
                <BirthdayAvatarWrapper>
                  <div style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'var(--bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {m.photo ? (
                      <img 
                        src={m.photo} 
                        alt={m.name} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          objectPosition: m.objectPosition || 'top',
                          transform: m.transform || 'none',
                          transformOrigin: m.transformOrigin || 'center'
                        }} 
                      />
                    ) : (
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-light)' }}>
                        {m.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </BirthdayAvatarWrapper>
              ) : (
                <div style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'var(--bg)',
                  border: '4px solid var(--primary-light)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {m.photo ? (
                    <img 
                      src={m.photo} 
                      alt={m.name} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        objectPosition: m.objectPosition || 'top',
                        transform: m.transform || 'none',
                        transformOrigin: m.transformOrigin || 'center'
                      }} 
                    />
                  ) : (
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-light)' }}>
                      {m.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              )}

              <h3 style={{
                fontSize: '1.1rem',
                color: m.birthday ? 'transparent' : '#fff',
                background: m.birthday ? 'linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff,#c77dff)' : 'none',
                WebkitBackgroundClip: m.birthday ? 'text' : 'unset',
                backgroundClip: m.birthday ? 'text' : 'unset',
                textAlign: 'center',
                margin: 0,
                fontWeight: '800',
                letterSpacing: m.birthday ? '0.5px' : 'normal',
              }}>
                {m.name}
              </h3>

              <p style={{
                fontSize: '0.85rem',
                color: 'var(--primary-light)',
                textAlign: 'center',
                margin: '-5px 0 0 0',
                fontStyle: 'italic',
                opacity: 0.9,
                maxWidth: '180px'
              }}>
                {m.role}
              </p>

              {/* Birthday badge */}
              {m.birthday && (
                <motion.div
                  animate={{ scale: [1, 1.12, 1], y: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b, #ffd93d)',
                    color: '#000',
                    fontSize: '0.75rem',
                    fontWeight: '900',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    boxShadow: '0 0 14px rgba(255,107,107,0.7)',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  🎂 Happy Birthday!
                </motion.div>
              )}

              {showInsta && m.instagram && (
                <div style={{ marginTop: 'auto', paddingTop: '10px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <a 
                    href={m.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{
                      display: 'inline-block',
                      background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                      color: 'white',
                      padding: '8px 20px',
                      borderRadius: '24px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}
                  >
                    Instagram
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingTop: '100px' }}>
      <SpotlightNavbar />
      
      <div className="container" style={{ padding: '40px 20px 80px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h1 style={{ fontSize: '3.5rem', fontFamily: 'Cinzel, serif', color: 'var(--primary-light)', marginBottom: '15px' }}>
            Our Team
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
            The dedicated individuals and clubs working tirelessly behind the scenes to make Anantya 2026 a grand success.
          </p>
        </motion.div>

        <CircleSection title="Faculty" members={faculty} showInsta={false} />
        <CircleSection title="Core Members" members={coreMembers} showInsta={false} />
        
        <div style={{ textAlign: 'center', margin: '80px 0 30px' }}>
          <h2 style={{ fontSize: '3rem', fontFamily: 'Cinzel, serif', color: 'var(--primary-light)', borderBottom: '2px solid var(--border)', paddingBottom: '10px', display: 'inline-block' }}>
            Coordinators
          </h2>
        </div>
        
        <CircleSection title="Decorations" members={decorCoords} showInsta={false} />
      </div>

        <CircleSection title="Club Representatives" members={clubReps} showInsta={true} />

      <footer style={{ background: '#050505', padding: '40px 0', textAlign: 'center', borderTop: '1px solid #222' }}>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} {CONFIG.eventName}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
