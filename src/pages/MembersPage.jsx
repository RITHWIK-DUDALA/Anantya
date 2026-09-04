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
            OG Core Team of 2025 & 2026
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
            The dedicated OG core team and clubs working tirelessly behind the scenes for Anantya 2025 & 2026.
          </p>
        </motion.div>

        <CircleSection title="Faculty" members={faculty} showInsta={false} />
        <CircleSection title="OG Core Team of 2025 & 2026" members={coreMembers} showInsta={false} />
        
        <div style={{ textAlign: 'center', margin: '80px 0 30px' }}>
          <h2 style={{ fontSize: '3rem', fontFamily: 'Cinzel, serif', color: 'var(--primary-light)', borderBottom: '2px solid var(--border)', paddingBottom: '10px', display: 'inline-block' }}>
            Coordinators
          </h2>
        </div>
        
        <CircleSection title="Decorations" members={decorCoords} showInsta={false} />
        <CircleSection title="Club Representatives" members={clubReps} showInsta={true} />

        {/* History of Conducting Janmashtami in AVV Chennai */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            marginTop: '100px',
            marginBottom: '40px',
            background: 'transparent',
            border: 'none',
            padding: '20px 10px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '2.5px',
                color: 'var(--primary-light, #ffd700)',
                background: 'transparent',
                border: '1px solid rgba(183, 139, 39, 0.4)',
                padding: '5px 16px',
                borderRadius: '50px',
                marginBottom: '18px',
                textTransform: 'uppercase',
              }}
            >
              Legacy & Milestones
            </span>
            <h2
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
                fontFamily: 'Cinzel, serif',
                color: '#ffffff',
                margin: '0 0 16px 0',
                textShadow: '0 0 25px rgba(255, 255, 255, 0.7), 0 0 50px rgba(183, 139, 39, 0.3)',
                letterSpacing: '1px',
              }}
            >
              History of Conducting Janmashtami in AVV Chennai
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '1.05rem', maxWidth: '720px', margin: '0 auto', lineHeight: 1.7, fontWeight: 300 }}>
              A chronicle of visionary milestones, unforgettable firsts, and the journey of how Janmashtami transformed into the grand festival of Anantya.
            </p>
          </div>

          {/* Timeline (2025 & 2026) - Seamless Background Blend */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              maxWidth: '900px',
              margin: '0 auto 60px auto',
              textAlign: 'left',
              padding: '0 10px',
            }}
          >
            <div style={{ padding: '10px 0' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                2025 Edition • 1 Day
              </span>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.6rem', color: '#ffffff', fontFamily: 'Cinzel, serif', fontWeight: 700 }}>
                27th August 2025
              </h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7, fontWeight: 300 }}>
                The foundational celebration alone that set the stage and ignited the cultural spirit for the future of Janmashtami on campus.
              </p>
            </div>

            <div
              style={{
                padding: '10px 0 10px 24px',
                borderLeft: '1px solid rgba(183, 139, 39, 0.35)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  color: 'var(--primary-light, #ffd700)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  textShadow: '0 0 10px rgba(255, 215, 0, 0.4)',
                }}
              >
                2026 Edition • Multi-Day
              </span>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.6rem', color: '#ffffff', fontFamily: 'Cinzel, serif', fontWeight: 700, textShadow: '0 0 20px rgba(255, 215, 0, 0.5)' }}>
                31st Aug (4 PM) – 1st Sep (Full Day)
              </h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.7, fontWeight: 300 }}>
                The monumental multi-day celebration packed with unprecedented cultural shows, gaming leagues, flash mobs, and grand spectacles.
              </p>
            </div>
          </div>

          {/* Grid of Firsts - Seamless Background Blend (No Boxes) */}
          <div style={{ maxWidth: '980px', margin: '0 auto' }}>
            <h3
              style={{
                fontSize: '1.4rem',
                fontFamily: 'Cinzel, serif',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: '36px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textShadow: '0 0 15px rgba(255, 255, 255, 0.6)',
              }}
            >
              Historic Firsts & Landmarks
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '36px 30px',
                textAlign: 'left',
              }}
            >
              {/* 1. Rebranded */}
              <div style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <div style={{ color: 'var(--primary-light, #ffd700)', marginBottom: '10px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h5 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                  Rebranded as "Anantya"
                </h5>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.92rem', lineHeight: 1.65, fontWeight: 300 }}>
                  First time the Janmashtami celebrations were officially rechristened to the iconic festival identity <strong>Anantya</strong> in AVV Chennai.
                </p>
              </div>

              {/* 2. Multi-Day */}
              <div style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <div style={{ color: 'var(--primary-light, #ffd700)', marginBottom: '10px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <circle cx="8" cy="14" r="1"/>
                    <circle cx="12" cy="14" r="1"/>
                    <circle cx="16" cy="14" r="1"/>
                    <circle cx="8" cy="18" r="1"/>
                    <circle cx="12" cy="18" r="1"/>
                  </svg>
                </div>
                <h5 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                  First Multi-Day Event
                </h5>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.92rem', lineHeight: 1.65, fontWeight: 300 }}>
                  First time in campus history that Janmashtami evolved from a single-day program into an expansive multi-day festival.
                </p>
              </div>

              {/* 3. Flash Mob */}
              <div style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <div style={{ color: 'var(--primary-light, #ffd700)', marginBottom: '10px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <h5 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                  First-Ever Flash Mob
                </h5>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.92rem', lineHeight: 1.65, fontWeight: 300 }}>
                  The first-ever surprise high-energy flash mob organized exclusively for Janmashtami on the AVV Chennai campus grounds.
                </p>
              </div>

              {/* 4. Banner Drop */}
              <div style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <div style={{ color: 'var(--primary-light, #ffd700)', marginBottom: '10px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                    <line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                </div>
                <h5 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                  First-Ever Banner Drop
                </h5>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.92rem', lineHeight: 1.65, fontWeight: 300 }}>
                  First ceremonial mega banner drop unveiled in campus festival history to herald the dawn of Anantya.
                </p>
              </div>

              {/* 5. 48-Minute Skit */}
              <div style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <div style={{ color: 'var(--primary-light, #ffd700)', marginBottom: '10px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 10s3-3 10-3 10 3 10 3-3 7-10 7-10-7-10-7z"/>
                    <circle cx="12" cy="10" r="3"/>
                    <path d="M12 17v5M8 22h8"/>
                  </svg>
                </div>
                <h5 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                  48-Minute Krishna Skit
                </h5>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.92rem', lineHeight: 1.65, fontWeight: 300 }}>
                  First time in AVV Chennai that a massive 48-minute theatrical drama portraying a poignant chapter of Lord Krishna's divine life was staged.
                </p>
              </div>

              {/* 6. Lantern Show */}
              <div style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <div style={{ color: 'var(--primary-light, #ffd700)', marginBottom: '10px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 2h6M12 2v3M8 5h8l2 6-2 7H8l-2-7 2-6zM12 18v4M9 22h6"/>
                    <circle cx="12" cy="11" r="2"/>
                  </svg>
                </div>
                <h5 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                  First-Ever Lantern Show
                </h5>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.92rem', lineHeight: 1.65, fontWeight: 300 }}>
                  First-ever nighttime lantern show and lighting ceremony dedicated to the Janmashtami celebrations.
                </p>
              </div>

              {/* 7. DJ Night */}
              <div style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <div style={{ color: 'var(--primary-light, #ffd700)', marginBottom: '10px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                  </svg>
                </div>
                <h5 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                  First-Ever DJ Night
                </h5>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.92rem', lineHeight: 1.65, fontWeight: 300 }}>
                  First-ever dedicated campus DJ musical night organized to celebrate the joy of Janmashtami with the student community.
                </p>
              </div>

              {/* 8. Web Platform */}
              <div style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <div style={{ color: 'var(--primary-light, #ffd700)', marginBottom: '10px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <h5 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                  First Cultural Website
                </h5>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.92rem', lineHeight: 1.65, fontWeight: 300 }}>
                  First time in AVV Chennai that an interactive full-featured digital portal was engineered for an institutional cultural festival.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <footer style={{ background: '#050505', padding: '40px 0', textAlign: 'center', borderTop: '1px solid #222' }}>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} {CONFIG.eventName}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
