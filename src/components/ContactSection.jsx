import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneCallIcon, MailIcon } from '@animateicons/react/lucide';
import CONFIG from '../config/config';

const CORE_MEMBERS = CONFIG.committee.slice(0, 10);

import { useTranslation } from 'react-i18next';

export default function ContactSection() {
  const { t } = useTranslation();
  const [activeMember, setActiveMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMemberClick = (name) => {
    setActiveMember(activeMember === name ? null : name);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Thank you! Your support ticket has been sent to the committee successfully.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        alert(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      alert('An error occurred. Please make sure the server is running and try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" style={{ width: '100%', padding: '96px 24px', background: '#000', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(183,139,39,0.08) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
      
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '64px', position: 'relative', zIndex: 1 }}>
        
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '11px', marginBottom: '16px', display: 'inline-block', color: 'var(--primary)', fontWeight: '600' }}>
            Get In Touch
          </span>

          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '24px', fontFamily: 'Cinzel, serif' }}>
            Contact The Core Team
          </h2>

          <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '40px' }}>
            Have questions about Anantya 2026? Click on any core committee member below to view their contact number.
          </p>

          {/* Core Members Dock */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            alignItems: 'flex-end', 
            background: 'rgba(255,255,255,0.03)', 
            padding: '16px 24px', 
            borderRadius: '32px', 
            width: 'fit-content', 
            maxWidth: '100%',
            border: '1px solid rgba(255,255,255,0.08)', 
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            {CORE_MEMBERS.map((member) => (
              <motion.div 
                key={member.name}
                onClick={() => handleMemberClick(member.name)}
                initial={{ scale: 1, y: 0, zIndex: 1 }}
                whileHover={{ scale: 1.2, y: -8, zIndex: 10 }}
                animate={{ 
                  boxShadow: activeMember === member.name ? '0 8px 20px rgba(183,139,39,0.4)' : '0 4px 12px rgba(0,0,0,0.3)'
                }}
                transition={{ duration: 0.2 }}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transformOrigin: 'bottom',
                  position: 'relative',
                  perspective: '1000px'
                }}
                title={member.name}
              >
                <motion.div
                  initial={false}
                  animate={{ rotateY: activeMember === member.name ? 180 : 0 }}
                  whileHover={{ rotateY: 180 }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Front: Initial */}
                  <div style={{
                    position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                    background: activeMember === member.name ? 'var(--primary)' : '#fff',
                    color: '#000',
                    borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', fontWeight: 'bold',
                    border: activeMember === member.name ? '2px solid var(--primary)' : '2px solid transparent',
                    boxSizing: 'border-box'
                  }}>
                    {member.name.charAt(0)}
                  </div>

                  {/* Back: Photo */}
                  <div style={{
                    position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                    background: activeMember === member.name ? 'var(--primary)' : '#fff', 
                    borderRadius: '16px', overflow: 'hidden',
                    border: activeMember === member.name ? '2px solid var(--primary)' : '2px solid transparent',
                    boxSizing: 'border-box'
                  }}>
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: member.objectPosition || 'center', transform: member.transform || 'none', transformOrigin: member.transformOrigin || 'center' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Active Member Contact Info */}
          <div style={{ minHeight: '60px', marginBottom: '40px' }}>
            <AnimatePresence mode="wait">
              {activeMember && (() => {
                const member = CORE_MEMBERS.find(m => m.name === activeMember);
                return (
                  <motion.div
                    key={activeMember}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring" }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '24px', 
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '24px',
                      borderRadius: '24px',
                      width: '100%',
                      maxWidth: '450px',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div style={{ 
                      width: '150px', 
                      height: '150px', 
                      borderRadius: '50%', 
                      overflow: 'hidden',
                      border: '3px solid var(--primary)',
                      flexShrink: 0,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                    }}>
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: member.objectPosition || 'center', transform: member.transform || 'none', transformOrigin: member.transformOrigin || 'center' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>{member.name.charAt(0)}</div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '1.4rem', color: '#fff', fontWeight: '600' }}>
                        {member.name}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500', whiteSpace: 'pre-line', lineHeight: '1.3' }}>
                        {member.role}
                      </span>
                      <a 
                        href={`tel:${member.phone.replace(/\s/g, '')}`} 
                        style={{ 
                          background: 'rgba(183,139,39,0.15)', 
                          color: 'var(--primary)', 
                          padding: '8px 16px', 
                          borderRadius: '20px', 
                          textDecoration: 'none', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontWeight: '600',
                          border: '1px solid rgba(183,139,39,0.4)',
                          marginTop: '4px',
                          width: 'max-content',
                          transition: 'all 0.2s',
                          fontSize: '0.95rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--primary)';
                          e.currentTarget.style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(183,139,39,0.15)';
                          e.currentTarget.style.color = 'var(--primary)';
                        }}
                      >
                        <PhoneCallIcon size={16} />
                        {member.phone}
                      </a>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
          
          <p style={{ fontSize: '14px', color: 'var(--primary)', fontStyle: 'italic' }}>
            We communicate in English, Telugu, Hindi & Tamil
          </p>
        </motion.div>

        {/* Right column: form card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', backdropFilter: 'blur(20px)', height: 'fit-content' }}
        >
          <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#fff', fontFamily: 'Cinzel, serif' }}>{t('contact.sendMessage', 'Send a Message')}</h3>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleContactSubmit}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                type="text" 
                placeholder="Your Name" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <textarea 
                placeholder="How can we help you?" 
                rows="5"
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '16px',
                background: 'var(--primary)',
                color: '#000',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                border: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.boxShadow = '0 0 15px rgba(183,139,39,0.5)')}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.boxShadow = 'none')}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'} {!isSubmitting && <MailIcon size={18} />}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
