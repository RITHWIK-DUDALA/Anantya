import React, { useState } from "react";
import { motion } from "framer-motion";

const XIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CircleDashedIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" {...props}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const CircleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <circle cx="12" cy="12" r="6" />
  </svg>
);

export default function FraudCard({ blockedEmails = [] }) {
  const [hovered, setHovered] = useState(false);

  const parentvariant = {
    open: {
      transition: { staggerChildren: 0.08, delayChildren: 0.15, duration: 0.5, ease: "easeInOut" },
    },
    close: {
      transition: { staggerChildren: 0.075, delayChildren: 0.15, duration: 0.5, ease: "easeInOut" },
    },
  };

  const emailvariant = {
    open: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.3 } },
    close: { opacity: 0, filter: "blur(10px)", y: 5, transition: { duration: 0.3 } },
  };

  const iconvariant = {
    open: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    close: { opacity: 0, scale: 0.85, transition: { duration: 0.3 } },
  };

  const timevariant = {
    open: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.3 } },
    close: { opacity: 0, filter: "blur(5px)", y: 10, transition: { duration: 0.3 } },
  };

  const circlevariant = {
    open: {
      rotate: 360,
      transition: { ease: "linear", duration: 2.5, repeat: Infinity },
    },
    close: {
      rotate: 0,
      transition: { ease: "easeInOut", duration: 0.1, repeat: 0 },
    },
  };

  return (
    <motion.div
      variants={parentvariant}
      animate={hovered ? "open" : "close"}
      initial="close"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="clbeam-container"
      style={{
        width: '100%',
        margin: '0 auto', paddingBottom: '2rem',
        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
        backgroundColor: 'transparent',
        color: 'var(--text)',
        overflowX: 'hidden'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 16px 0', width: '100%', boxSizing: 'border-box' }}>
        <h2 style={{ color: 'var(--primary)', fontSize: '1.8rem', fontWeight: 'bold', margin: 0, fontFamily: 'Cinzel, serif' }}>
          Event Schedule Timeline
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
          Hover to interact with the schedule timeline and view upcoming events.
        </p>
      </div>
      
      <div style={{ position: 'relative', display: 'flex', height: '100%', width: '100%', maxWidth: '1200px', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ marginTop: '2rem', padding: '0.75rem 0' }}>
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '8px', borderRadius: '6px', background: 'var(--surface)', padding: '2px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderRadius: '4px', background: 'var(--bg-alt)', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <motion.div variants={circlevariant} style={{ height: '16px', width: '16px', flexShrink: 0 }}>
                  <CircleDashedIcon style={{ width: '100%', height: '100%', color: 'var(--primary)' }} />
                </motion.div>
                <p style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--text)' }}>
                  Anantya Event Timeline
                </p>
              </div>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>
                18:00
              </p>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', inset: 0, height: '100%', width: '100%', zIndex: 0 }}>
          <svg style={{ height: '100%', width: '100%' }} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="timeline-fade-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--border)" />
                <stop offset="98%" stopColor="var(--border)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <g strokeWidth="2">
              <line x1="60" y1="0" x2="60" y2="100%" stroke="url(#timeline-fade-grad)" />
            </g>
            <g mask="url(#clbeam-mask-1)">
              <circle className="clbeam clbeam-line-1" cx="0" cy="0" r="12" fill="url(#clbeam-red-grad)" />
            </g>
            <defs>
              <mask id="clbeam-mask-1">
                <line x1="60" y1="0" x2="60" y2="100%" stroke="white" strokeWidth="2" />
              </mask>
              <radialGradient id="clbeam-red-grad" fx="1">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div style={{ position: 'relative', paddingLeft: '3rem', paddingRight: '1rem', marginTop: '2rem', paddingBottom: '4rem', display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1 }}>
          <div style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '48px' }}>
            {blockedEmails.map((item, index) => (
              <div key={item.id || index} style={{ display: 'flex', width: '100%', justifyContent: 'flex-start', alignItems: 'center' }}>
                <div style={{ position: 'relative', marginRight: '16px', height: '24px', width: '24px', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(0,0,0,0.05)' }}>
                    <CircleIcon style={{ height: '10px', width: '10px', color: 'var(--text-muted)' }} />
                  </div>
                  <motion.div variants={iconvariant} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--primary)' }}>
                  </motion.div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '6px', padding: '4px' }}>
                  <motion.h2 variants={emailvariant} style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text)', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
                    {item.email}
                  </motion.h2>
                  <motion.p variants={timevariant} style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary)', margin: 0, fontWeight: '500' }}>
                    {item.time}
                  </motion.p>
                  {item.description && (
                    <motion.p variants={timevariant} style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                      {item.description}
                    </motion.p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
