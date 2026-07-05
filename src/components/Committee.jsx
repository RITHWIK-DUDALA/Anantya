import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PhoneCallIcon } from '@animateicons/react/lucide';
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

function MemberCard({ member, t }) {
  const initials = member.name
    .split(/[\s&]+/)
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="card reveal" style={{ position: 'relative', padding: '2.5rem 1.5rem 1.5rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {member.isCoHead && <span style={{ position: 'absolute', top: '15px', left: '15px', background: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>{t('committee.coHeads', 'CO-HEAD')}</span>}
      {member.comingSoon && <span style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--bg-alt)', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>{t('committee.comingSoon', 'TBA')}</span>}
      
      <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', marginBottom: '1.2rem', border: '3px solid var(--primary-light)', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
        {member.photo && !member.comingSoon
          ? <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: member.objectPosition || 'center', transform: member.transform || 'none', transformOrigin: member.transformOrigin || 'center' }} />
          : <div style={{ width: '100%', height: '100%', background: avatarColor(member.role), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials || '?'}</div>
        }
      </div>
      <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.3rem', color: 'var(--primary-dark)' }}>{member.name || '---'}</h3>
      <p style={{ margin: '0 0 0.8rem', fontSize: '0.95rem', color: 'var(--primary)', fontWeight: '600', whiteSpace: 'pre-line' }}>{member.role}</p>
      
      {(!member.comingSoon && (member.phone || member.phones)) && (
        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px' }}>
          {member.isCoHead && member.phones ? (
            member.phones.map((ph) => (
              <CopyNumberButton key={ph} phone={ph} />
            ))
          ) : member.phone ? (
            <CopyNumberButton phone={member.phone} />
          ) : null}
        </div>
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
  const heads = CONFIG.committee.filter(m => m.role.toLowerCase() === 'event head');
  const viceHeads = CONFIG.committee.filter(m => m.role.toLowerCase() === 'event vice head');
  const games = CONFIG.committee.filter(m => m.role.toLowerCase().includes('games'));
  const decor = CONFIG.committee.filter(m => m.role.toLowerCase().includes('decoration'));
  const tech = CONFIG.committee.filter(m => m.role.toLowerCase().includes('technical'));
  
  const sortedRoles = ['event head', 'event vice head', 'games', 'decoration', 'technical'];
  const others = CONFIG.committee.filter(m => !sortedRoles.some(r => m.role.toLowerCase().includes(r)));

  // Ordered mapping for MaskedAvatars
  const getRank = (role) => {
    const r = role.toLowerCase();
    if (r.includes('event head')) return 1;
    if (r.includes('vice head')) return 2;
    if (r.includes('cultural')) return 3;
    if (r.includes('games')) return 4;
    if (r.includes('decoration')) return 5;
    if (r.includes('technical')) return 6;
    return 7;
  };

  const activeMembers = CONFIG.committee.filter((m) => !m.comingSoon);
  const sortedMembers = [...activeMembers].sort((a, b) => getRank(a.role) - getRank(b.role));

  const coreMembers = sortedMembers.map((m) => ({
    avatar: m.photo || "",
    name: m.name,
    originalData: m // keep original data for the modal
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
