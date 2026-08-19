import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MoviesSelectionPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Use relative path to take advantage of Vite's proxy and avoid CORS
    fetch('/api/movies/shows')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch movies');
        return res.json();
      })
      .then(data => {
        setMovies(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Could not load available movies. Please try again later.');
        setLoading(false);
      });
  }, []);

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % movies.length);
  };

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + movies.length) % movies.length);
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#050505', color: '#ffffff', paddingTop: '100px', paddingBottom: '100px', overflowX: 'hidden' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontFamily: '"Isabella", serif', fontSize: '3rem', color: 'var(--primary)', textAlign: 'center', marginBottom: '10px' }}>
            Book Movie Tickets
          </h1>
          <p style={{ textAlign: 'center', color: '#ccc', marginBottom: '50px', fontSize: '1.2rem' }}>
            Select a movie screening to view the seating layout and book your tickets!
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--primary)', fontSize: '1.5rem', marginTop: '50px' }}>
              Loading movies...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: 'red', fontSize: '1.2rem', marginTop: '50px' }}>
              {error}
            </div>
          ) : movies.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#aaa', fontSize: '1.2rem', marginTop: '50px' }}>
              No movie screenings are currently available. Check back soon!
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center', perspective: '1000px' }}>
              {movies.map((movie, index) => {
                const offset = index - activeIndex;
                let normalizedOffset = offset;
                if (offset > Math.floor(movies.length / 2)) normalizedOffset -= movies.length;
                if (offset < -Math.floor(movies.length / 2)) normalizedOffset += movies.length;

                const isActive = normalizedOffset === 0;

                return (
                  <motion.div
                    key={movie.id}
                    onClick={() => {
                      if (isActive) {
                        navigate(`/movies/${movie.id}/seats`);
                      } else {
                        setActiveIndex(index);
                      }
                    }}
                    initial={false}
                    animate={{
                      x: `${normalizedOffset * 65}%`,
                      scale: isActive ? 1 : 0.8,
                      zIndex: 10 - Math.abs(normalizedOffset),
                      opacity: Math.abs(normalizedOffset) > 2 ? 0 : 1,
                      filter: isActive ? 'brightness(1)' : 'brightness(0.3)',
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      width: '320px',
                      height: '450px',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      cursor: isActive ? 'pointer' : 'pointer',
                      boxShadow: isActive ? '0 20px 50px rgba(0,0,0,0.8)' : '0 10px 30px rgba(0,0,0,0.5)',
                      display: 'flex',
                      flexDirection: 'column',
                      background: '#111'
                    }}
                  >
                    {movie.image ? (
                      <img src={movie.image} alt={movie.movieTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, zIndex: 0 }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#222', position: 'absolute', inset: 0, zIndex: 0 }} />
                    )}
                    
                    {/* Gradient Overlay for Text */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 50%)', zIndex: 1 }} />
                    
                    <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto', padding: '20px' }}>
                      <h2 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '5px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontFamily: '"Cinzel", serif' }}>{movie.movieTitle || movie.id}</h2>
                      <div style={{ display: 'flex', gap: '15px', color: '#ccc', fontSize: '0.9rem', marginBottom: '15px' }}>
                        <span>{movie.language || 'Multiple'}</span>
                        <span>•</span>
                        <span>{movie.time || 'TBD'}</span>
                      </div>
                      
                      {isActive && (
                        <motion.button 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '20px',
                            fontSize: '1.05rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            width: '100%',
                            boxShadow: '0 5px 15px rgba(183,139,39,0.4)'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/movies/${movie.id}/seats`);
                          }}
                        >
                          Book Tickets
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Controls */}
          {!loading && !error && movies.length > 1 && (
            <div style={{ display: 'flex', gap: '20px', marginTop: '30px', zIndex: 10 }}>
              <button onClick={handlePrev} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                &larr;
              </button>
              <button onClick={handleNext} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                &rarr;
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
