import React from 'react';
import { SpotlightNavbar } from '../components/SpotlightNavbar';

export default function AdminMovieBookings() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', paddingBottom: '100px' }}>
      <SpotlightNavbar />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '100px', paddingLeft: '20px', paddingRight: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px', color: 'var(--primary)' }}>
          Movie Bookings Dashboard
        </h1>
        <p style={{ color: '#aaa', fontSize: '1rem', marginBottom: '40px' }}>
          View all bookings, manage cancellations, and verify manual payments.
        </p>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
           <h3>Recent Bookings</h3>
           <p style={{ color: '#888', marginTop: '10px' }}>No bookings available to display yet.</p>
        </div>

      </div>
    </div>
  );
}
