import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PhoneCallIcon, MailIcon } from '@animateicons/react/lucide';
import { motion } from 'framer-motion';
import CONFIG from '../config/config';
import MaskedAvatars from './MaskedAvatars';

/* ── Avatar colours (cycles through palette) ─────── */
const PALETTE = [
  '#6B9BD2','#F4A261','#8B5CF6','#10B981',
  '#FB7185','#60A5FA','#FBBF24','#34D399',
  '#F472B6','#38BDF8',
];
const avatarColor = (role) => {
  let h = 0;
  for (let i = 0; i < role.length; i++) h = (h + role.charCodeAt(i)) % PALETTE.length;
  return PALETTE[h];
};

function CopyNumberButton({ phone, style }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy} 
      className="committee-phone" 
      style={{ 
        border: 'none',
        background: 'var(--bg-alt)',
        padding: '6px 12px',
        borderRadius: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.9rem',
        color: 'var(--text)',
        fontFamily: 'inherit',
        ...style 
      }}
    >
      <PhoneCallIcon size={13} color="var(--primary-dark)" /> 
      {copied ? "Copied!" : "Copy Number"}
    </button>
  );
}

function CopyEmailButton({ email, style }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy} 
      className="committee-email" 
      style={{ 
        border: 'none',
        background: 'var(--bg-alt)',
        padding: '6px 12px',
        borderRadius: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.9rem',
        color: 'var(--text)',
        fontFamily: 'inherit',
        ...style 
      }}
    >
      <MailIcon size={13} color="var(--primary-dark)" /> 
      {copied ? "Copied!" : "Copy Email"}
    </button>
  );
}

export function MemberCard({ member, t, darkTheme = false, showInstagram = false, onClick = null }) {
  const initials = member.name
    .split(/[\s&]+/)
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isBirthday = !!member.birthday;

  return (
    <div className={`card ${darkTheme ? '' : 'reveal'}`} onClick={onClick} style={{ position: 'relative', padding: '2.5rem 1.5rem 1.5rem', textAlign: 'center', background: darkTheme ? 'transparent' : 'var(--surface)', border: isBirthday ? 'none' : (darkTheme ? 'none' : '1px solid var(--border)'), borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.3s', outline: isBirthday ? '2px solid transparent' : 'none', boxShadow: isBirthday ? '0 0 24px 6px rgba(255,107,107,0.35), 0 0 0 2px #ffd93d55' : undefined }}>
      {isBirthday && (
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '16px', pointerEvents: 'none',
            background: 'linear-gradient(135deg,rgba(255,107,107,0.08),rgba(255,217,61,0.08),rgba(77,150,255,0.08),rgba(199,125,255,0.08))',
            zIndex: 0,
          }}
        />
      )}
      {member.isCoHead && <span style={{ position: 'absolute', top: '15px', left: '15px', background: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', zIndex: 2 }}>{t('committee.coHeads', 'CO-HEAD')}</span>}
      {member.comingSoon && <span style={{ position: 'absolute', top: '15px', right: '15px', background: darkTheme ? '#333' : 'var(--bg-alt)', color: darkTheme ? '#aaa' : 'var(--text-muted)', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', zIndex: 2 }}>{t('committee.comingSoon', 'TBA')}</span>}
      
      <div style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem' }}>
        {isBirthday && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', inset: '-6px', borderRadius: '50%',
              background: 'conic-gradient(from 0deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff,#c77dff,#ff6b6b)',
              zIndex: 0,
            }}
          />
        )}
        {isBirthday && (
          <div style={{ position: 'absolute', inset: '3px', borderRadius: '50%', background: darkTheme ? '#111' : 'var(--surface)', zIndex: 1 }} />
        )}
        <div style={{ position: 'relative', zIndex: 2, width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: isBirthday ? 'none' : '3px solid var(--primary-light)', background: darkTheme ? '#222' : 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
          {member.photo && !member.comingSoon
            ? <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: member.objectPosition || 'center', transform: member.transform || 'none', transformOrigin: member.transformOrigin || 'center' }} />
            : <div style={{ width: '100%', height: '100%', background: avatarColor(member.role), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials || '?'}</div>
          }
        </div>
      </div>

      <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.3rem', color: isBirthday ? 'transparent' : (darkTheme ? 'var(--primary-light)' : 'var(--primary-dark)'), background: isBirthday ? 'linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff,#c77dff)' : 'none', WebkitBackgroundClip: isBirthday ? 'text' : 'unset', backgroundClip: isBirthday ? 'text' : 'unset', fontWeight: isBirthday ? '900' : undefined, zIndex: 1, position: 'relative' }}>{member.name || '---'}</h3>
      <p style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: darkTheme ? '#aaa' : 'var(--primary)', fontWeight: '600', whiteSpace: 'pre-line', position: 'relative', zIndex: 1 }}>{member.role}</p>
      {isBirthday && (
        <motion.div
          animate={{ scale: [1, 1.1, 1], y: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: 'linear-gradient(135deg,#ff6b6b,#ffd93d)',
            color: '#000',
            fontSize: '0.7rem',
            fontWeight: '900',
            padding: '4px 10px',
            borderRadius: '16px',
            boxShadow: '0 0 12px rgba(255,107,107,0.65)',
            marginTop: '4px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          🎂 Happy Birthday!
        </motion.div>
      )}
    </div>
  );
}

function ProfileModal({ member, onClose, t }) {
  if (!member) return null;

  const initials = member.name
    .split(/[\s&]+/)
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="modal-box committee-card card" style={{ position: 'relative', margin: 0, width: '100%', maxWidth: '340px', padding: '3rem 1.5rem 2rem' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--surface-alt)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          &times;
        </button>
        {member.isCoHead && <span className="co-head-badge" style={{ top: '15px', left: '15px' }}>{t('committee.coHeads')}</span>}
        
        <div className="avatar-wrap" style={{ borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary-light)', background: 'var(--bg-alt)' }}>
          {member.photo
            ? <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: member.objectPosition || 'center', transform: member.transform || 'none', transformOrigin: member.transformOrigin || 'center' }} />
            : <div className="avatar-initials" style={{ width: '100%', height: '100%', background: avatarColor(member.role) }}>{initials}</div>
          }
        </div>
        <p className="committee-role" style={{ whiteSpace: 'pre-line' }}>{member.role}</p>
        <p className="committee-name">{member.name}</p>
        <p className="committee-year">{member.year}</p>
        
        {member.isCoHead && member.phones ? (
          <div className="co-head-phones" style={{ marginTop: '1rem', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {member.phones.map((ph) => (
              <CopyNumberButton key={ph} phone={ph} style={{ justifyContent: 'center' }} />
            ))}
          </div>
        ) : member.phone ? (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
             <CopyNumberButton phone={member.phone} style={{ justifyContent: 'center' }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Committee({ variant = 'avatars' }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal');
    if (!els) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); }
        }),
      { threshold: 0.08 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [variant]);

  // Hierarchical Data Grouping for Grid
  const validCommittee = CONFIG.committee.filter(m => !m.isCoordinator);
  const heads = validCommittee.filter(m => m.role.toLowerCase() === 'event head');
  const viceHeads = validCommittee.filter(m => m.role.toLowerCase() === 'event vice head');
  const games = validCommittee.filter(m => m.role.toLowerCase().includes('games'));
  const decor = validCommittee.filter(m => m.role.toLowerCase().includes('decoration'));
  const tech = validCommittee.filter(m => m.role.toLowerCase().includes('technical'));
  
  const sortedRoles = ['event head', 'event vice head', 'games', 'decoration', 'technical'];
  const others = validCommittee.filter(m => !sortedRoles.some(r => m.role.toLowerCase().includes(r)));

  const activeMembers = validCommittee.filter((m) => !m.comingSoon);

  const coreMembers = activeMembers.map((m) => ({
    avatar: m.photo || "",
    name: m.name,
    originalData: m
  }));

  if (variant === 'grid') {
    return (
      <section id="committee-grid" className="section committee-section" ref={ref} style={{ padding: '80px 0', background: 'var(--bg-alt)' }}>
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">{t('committee.title')}</h2>
            <p className="section-sub" style={{ marginTop: '10px' }}>{t('committee.subtitle')}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
              {heads.map((m, i) => <MemberCard key={`head-${i}`} member={m} t={t} />)}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
              {viceHeads.map((m, i) => <MemberCard key={`vice-${i}`} member={m} t={t} />)}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {games.map((m, i) => <MemberCard key={`games-${i}`} member={m} t={t} />)}
              {decor.map((m, i) => <MemberCard key={`decor-${i}`} member={m} t={t} />)}
              {tech.map((m, i) => <MemberCard key={`tech-${i}`} member={m} t={t} />)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {others.map((m, i) => <MemberCard key={`others-${i}`} member={m} t={t} />)}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // variant === 'avatars'
  return (
    <section id="committee" className="section committee-section" ref={ref} style={{ padding: '40px 0' }}>
      <div className="container">
        <div className="section-header reveal" style={{ marginBottom: '10px' }}>
          <h2 className="section-title">{t('committee.title')}</h2>
          <p className="section-sub" style={{ marginTop: '10px' }}>{t('committee.subtitle')}</p>
        </div>

        {coreMembers.length > 0 && (
          <div className="reveal" style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0 1rem', overflow: 'visible' }}>
            <MaskedAvatars 
              avatars={coreMembers} 
              onItemClick={(item) => setSelectedMember(item)}
            />
          </div>
        )}
      </div>

      {selectedMember && (
        <ProfileModal 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
          t={t} 
        />
      )}
    </section>
  );
}
