import React, { useState } from "react";

const DEFAULT_ITEMS = [
  { question: "What is Janmashtami 2025?", answer: "Janmashtami 2025 is the grand celebration of Lord Krishna's birth at Amrita Vishwa Vidyapeetham, Chennai Campus, featuring cultural events, games, and devotional singing." },
  { question: "Who can participate?", answer: "All students, faculty, and staff of AVV Chennai Campus are welcome to participate in the events." },
  { question: "Is there a registration fee?", answer: "Some events like Uriyadi are completely free to watch! Other events may have a small registration fee which is clearly mentioned on the registration page." },
  { question: "How do I become a volunteer?", answer: "You can register as a volunteer for Decoration, Disciplinary, or Prasadam distribution through the 'Volunteer' tab on the registration page." },
  { question: "Where are the events happening?", answer: "Events are spread across the campus, including the Main Ground, Auditorium, and specific blocks. Exact venues are listed under each event's details." }
];

export function FaqAccordion({
  items = DEFAULT_ITEMS,
  title = "Frequently Asked Questions",
  className = "",
  style = {},
  ...props
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleItem = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div 
      className={`faq-container ${className}`} 
      style={{
        width: '100%',
        maxWidth: '48rem',
        margin: '0 auto',
        padding: '4rem 1rem',
        position: 'relative',
        fontFamily: 'inherit',
        ...style
      }}
      {...props}
    >
      {title && (
        <h2 style={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '2rem',
          marginBottom: '2.5rem',
          color: 'var(--text)',
        }}>
          {title}
        </h2>
      )}
      
      <ul style={{ width: '100%', margin: '0 auto', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column' }}>
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <li
              key={index}
              style={{
                width: '100%',
                position: 'relative',
                transition: 'all 0.3s ease-in',
                borderBottom: isActive ? '1px solid var(--border)' : '2px solid var(--border)',
                borderBottomWidth: index === items.length - 1 ? '0' : undefined,
              }}
            >
              <button
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  width: '100%',
                  minHeight: '60px',
                  padding: '1rem 1rem 1rem 3.5rem',
                  position: 'relative',
                  margin: 0,
                  cursor: 'pointer',
                  border: 'none',
                  borderLeft: `8px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  outline: 'none',
                  fontSize: '1.125rem',
                  background: isActive ? 'var(--primary-xlight)' : 'transparent',
                  color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)',
                  fontWeight: isActive ? '600' : 'normal',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderLeftColor = 'var(--border-hover)';
                    e.currentTarget.style.color = 'var(--text)';
                    e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderLeftColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
                onClick={() => toggleItem(index)}
                aria-expanded={isActive}
              >
                {/* Plus/Minus Icon */}
                <span 
                  style={{
                    position: 'absolute',
                    left: '1.25rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    transition: 'all 0.2s',
                    lineHeight: 1,
                    fontSize: isActive ? '36px' : '26px',
                    fontWeight: 'normal',
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  {isActive ? "-" : "+"}
                </span>
                
                <span style={{ paddingRight: '2rem' }}>{item.question}</span>
                
                {/* Chevron */}
                <span 
                  style={{
                    position: 'absolute',
                    right: '1.5rem',
                    display: 'block',
                    width: '0.6rem',
                    height: '0.6rem',
                    borderTop: `2px solid ${isActive ? 'var(--primary)' : 'var(--text-muted)'}`,
                    borderRight: `2px solid ${isActive ? 'var(--primary)' : 'var(--text-muted)'}`,
                    transition: 'transform 0.2s ease-in-out',
                    transform: isActive ? 'rotate(-44deg)' : 'rotate(133deg)',
                  }}
                />
              </button>

              <div 
                style={{
                  display: 'grid',
                  transition: 'all 0.3s ease-in-out',
                  width: '100%',
                  borderLeft: `8px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                  gridTemplateRows: isActive ? '1fr' : '0fr',
                  background: isActive ? 'var(--primary-xlight)' : 'transparent',
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    width: '100%',
                    padding: '0.5rem 1rem 1.5rem 3.5rem',
                    fontSize: '1rem',
                    fontWeight: 'normal',
                    color: 'var(--text)',
                    lineHeight: '1.6',
                  }}>
                    <span style={{ opacity: 0.9 }}>{item.answer}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FaqAccordion;
