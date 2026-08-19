import React, { useState, useEffect } from 'react';
import { SpotlightNavbar } from '../components/SpotlightNavbar';

export default function AdminMovies() {
  const [screens, setScreens] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  // In a real implementation, you would use form states and API calls to create these.
  // For the sake of this implementation plan, this is a placeholder UI.
  
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', paddingBottom: '100px' }}>
      <SpotlightNavbar />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '100px', paddingLeft: '20px', paddingRight: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px', color: 'var(--primary)' }}>
          Manage Movie Bookings (Admin)
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: 'var(--primary)' }}>Screens / Venues</h3>
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Configure physical hall layouts and seat categories.</p>
            
            <button className="submit-btn" style={{ marginTop: '20px', width: 'auto', padding: '10px 20px' }}>
              + Add New Screen
            </button>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: 'var(--primary)' }}>Showtimes</h3>
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Schedule movies, set pricing, and link to a screen layout.</p>
            
            <button className="submit-btn" style={{ marginTop: '20px', width: 'auto', padding: '10px 20px' }}>
              + Schedule Showtime
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
