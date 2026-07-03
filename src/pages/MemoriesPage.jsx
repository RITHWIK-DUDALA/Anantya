import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const memoriesData = [
  {
    id: 1,
    type: 'video',
    src: '/photos/vt1.mp4',
    title: 'Culturals Night',
    description: 'Amazing performances from our talented students!'
  },
  {
    id: 2,
    type: 'video',
    src: 'https://cdn.coverr.co/videos/coverr-playing-with-sparklers-at-night-8600/1080p.mp4',
    title: 'Cultural Night',
    description: 'Beautiful performances from the students.'
  },
  {
    id: 3,
    type: 'photo',
    src: '/photos/WhatsApp Image 2026-06-25 at 10.12.51 AM.jpeg',
    title: 'Committee Preparation',
    description: 'Late night decorations.'
  },
  {
    id: 4,
    type: 'photo',
    src: '/photos/WhatsApp Image 2026-06-25 at 10.12.55 AM.jpeg',
    title: 'Festive Vibes',
    description: 'The campus fully lit up.'
  },
  {
    id: 5,
    type: 'video',
    src: 'https://cdn.coverr.co/videos/coverr-fireworks-in-the-night-sky-4043/1080p.mp4',
    title: 'Closing Ceremony',
    description: 'An explosive end to Janmashtami 2024.'
  },
  {
    id: 6,
    type: 'photo',
    src: '/photos/WhatsApp Image 2026-06-25 at 10.12.49 AM.jpeg',
    title: 'Organizing Team',
    description: 'The heroes behind the scenes.'
  }
];

function MemoryCard({ item, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      layoutId={`card-${item.id}`}
      className="memory-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(item)}
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        aspectRatio: '4/3',
        background: '#111'
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {item.type === 'video' ? (
        <video 
          src={item.src} 
          autoPlay={isHovered} 
          loop 
          muted 
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isHovered ? 1 : 0.7, transition: 'opacity 0.3s ease' }}
        />
      ) : (
        <img 
          src={item.src} 
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isHovered ? 1 : 0.8, transition: 'opacity 0.3s ease' }}
        />
      )}
      
      {item.type === 'video' && !isHovered && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '15px solid white', marginLeft: '5px' }}></div>
        </div>
      )}

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
        color: 'white',
        transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
        opacity: isHovered ? 1 : 0,
        transition: 'all 0.3s ease'
      }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>{item.title}</h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc' }}>{item.description}</p>
      </div>
    </motion.div>
  );
}

export default function MemoriesPage() {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#050505', color: '#ffffff', paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '15px' }}>
              Memories & Highlights
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#888', maxWidth: '600px', margin: '0 auto' }}>
              Relive the magical moments, epic performances, and beautiful memories from our previous Janmashtami celebrations.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '24px' 
          }}>
            {memoriesData.map(item => (
              <MemoryCard key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </div>

        </div>

        {/* Modal for full screen viewing */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.9)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px'
              }}
            >
              <motion.div 
                layoutId={`card-${selectedItem.id}`}
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', maxWidth: '1000px', position: 'relative' }}
              >
                <button 
                  onClick={() => setSelectedItem(null)}
                  style={{ position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}
                >
                  &times;
                </button>
                {selectedItem.type === 'video' ? (
                  <video 
                    src={selectedItem.src} 
                    controls 
                    autoPlay 
                    style={{ width: '100%', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                  />
                ) : (
                  <img 
                    src={selectedItem.src} 
                    alt={selectedItem.title}
                    style={{ width: '100%', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                  />
                )}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>{selectedItem.title}</h2>
                  <p style={{ margin: 0, fontSize: '1.2rem', color: '#ccc' }}>{selectedItem.description}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
