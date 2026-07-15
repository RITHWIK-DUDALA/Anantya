import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RegisterPage from './pages/RegisterPage';
import GamePage from './pages/GamePage';
import VerifyPage from './pages/VerifyPage';
import RegistrationFormPage from './pages/RegistrationFormPage';
import MemoriesPage from './pages/MemoriesPage';
import StatusPage from './pages/StatusPage';
import VenueVerifyPage from './pages/VenueVerifyPage';
import MusicPlayer from './components/MusicPlayer';

const AdminPaymentsPage = lazy(() => import('./pages/AdminPaymentsPage'));
const AdminVolunteersPage = lazy(() => import('./pages/AdminVolunteersPage'));

export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff', textAlign: 'center', padding: '20px', boxSizing: 'border-box' }}>
        <div style={{ padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(183,139,39,0.3)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>💻</div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '15px', fontFamily: 'Cinzel, serif', fontSize: '1.8rem' }}>Desktop Only</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>
            The Anantya 2026 experience is strictly designed for desktop devices. <br/><br/>
            Please open this website on your computer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MusicPlayer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/games/:id" element={<GamePage />} />
        <Route path="/form" element={<RegistrationFormPage />} />
        <Route path="/memories" element={<MemoriesPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/admin/payments" element={
          <Suspense fallback={<div style={{color: 'white', textAlign: 'center', marginTop: '100px'}}>Loading dashboard...</div>}>
            <AdminPaymentsPage />
          </Suspense>
        } />
        <Route path="/admin/volunteers" element={
          <Suspense fallback={<div style={{color: 'white', textAlign: 'center', marginTop: '100px'}}>Loading dashboard...</div>}>
            <AdminVolunteersPage />
          </Suspense>
        } />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/venue" element={<VenueVerifyPage />} />
      </Routes>
    </>
  );
}
