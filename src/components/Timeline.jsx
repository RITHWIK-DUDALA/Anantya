import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TIMELINE_EVENTS } from '../data/timelineData';
import StrokeFill from './StrokeFill';
import FraudCard from './forgeui/fraud-card';

const blockedEmails = [
  { email: "bad_actor+1@gamil.com", time: "Aug 9 at 14:09" },
  { email: "spammer123@mailor.com", time: "Aug 10 at 11:23" },
  { email: "fake+prmo@tempmail.com", time: "Aug 11 at 09:45" },
  { email: "bot@disposablemail.org", time: "Aug 12 at 16:02" },
];

export default function Timeline() {
  const { t } = useTranslation();
  const ref = useRef(null);

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
  }, []);

  const mappedEvents = TIMELINE_EVENTS.map(event => ({
    id: event.id,
    email: t(`timeline.events.${event.id}.name`, event.name),
    time: t(`timeline.events.${event.id}.time`, event.time),
    description: t(`timeline.events.${event.id}.description`, event.description),
    icon: event.icon
  }));

  return (
    <section id="timeline" className="section timeline-section" ref={ref} style={{ padding: '80px 0', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Orange Ambient Background Glow */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(255, 140, 0, 0.12) 0%, rgba(255, 140, 0, 0) 70%)',
        zIndex: 0,
        pointerEvents: 'none',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="section-header reveal" style={{ marginBottom: '40px' }}>
          <span className="section-eyebrow">{t('timeline.subtitle', 'Schedule')}</span>
          <div style={{ marginTop: '-20px' }}>
            <StrokeFill 
              text={t('timeline.title', 'EVENTS')} 
              duration={2.5} 
              strokeColor="var(--primary)" 
              fillColor="var(--primary-dark)" 
              fontSize="120" 
            />
          </div>
        </div>

        <div className="reveal" style={{ marginTop: '40px' }}>
          <FraudCard blockedEmails={mappedEvents} />
        </div>
      </div>
    </section>
  );
}
