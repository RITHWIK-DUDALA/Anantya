import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TIMELINE_EVENTS } from '../data/timelineData';
import StrokeFill from './StrokeFill';
import FraudCard from './forgeui/fraud-card';

export default function Timeline() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [liveEvents, setLiveEvents] = React.useState(null); // null = not loaded yet

  // Fetch live timeline from Firestore (falls back to static if unavailable)
  React.useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/settings/timeline`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.timeline && Array.isArray(data.timeline) && data.timeline.length > 0) {
          setLiveEvents(data.timeline);
        } else {
          setLiveEvents(TIMELINE_EVENTS); // fallback
        }
      })
      .catch(() => setLiveEvents(TIMELINE_EVENTS)); // fallback on error
  }, []);

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
  }, [liveEvents]); // re-observe when events load

  const sourceEvents = liveEvents || TIMELINE_EVENTS;

  const mappedEvents = sourceEvents.map(event => ({
    id: event.id,
    email: event.name,
    time: event.time,
    description: event.description,
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
