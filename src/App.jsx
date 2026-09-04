import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Lenis from 'lenis';
import Home from './pages/Home';
import RegisterPage from './pages/RegisterPage';
import GamePage from './pages/GamePage';
import VerifyPage from './pages/VerifyPage';
import RegistrationFormPage from './pages/RegistrationFormPage';
import MemoriesPage from './pages/MemoriesPage';
import MembersPage from './pages/MembersPage';
import StatusPage from './pages/StatusPage';
import VenueVerifyPage from './pages/VenueVerifyPage';
import TermsPage from './pages/TermsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import ContactUsPage from './pages/ContactUsPage';
import MusicPlayer from './components/MusicPlayer';
import SplashScreen from './components/SplashScreen';
import EventConcludedScreen from './components/EventConcludedScreen';

const AdminPaymentsPage = lazy(() => import('./pages/AdminPaymentsPage'));
const AdminVolunteersPage = lazy(() => import('./pages/AdminVolunteersPage'));
const AdminMovies = lazy(() => import('./pages/AdminMovies'));
const AdminMovieBookings = lazy(() => import('./pages/AdminMovieBookings'));
// const AdminEventsPage = lazy(() => import('./pages/AdminEventsPage'));

import SeatSelectionPage from './pages/SeatSelectionPage';
import SnacksSelectionPage from './pages/SnacksSelectionPage';
import MovieCheckoutPage from './pages/MovieCheckoutPage';
import MovieVerifyPage from './pages/MovieVerifyPage';
import MovieStatusPage from './pages/MovieStatusPage';
import MoviesSelectionPage from './pages/MoviesSelectionPage';

export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('splashShown'));

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Initialize Lenis for buttery smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard ease-out-expo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  return (
    <>
      <EventConcludedScreen />
      {isMobile ? (
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
      ) : (
        <>
          {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
          <MusicPlayer />
          <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/games/:id" element={<GamePage />} />
        <Route path="/form" element={<RegistrationFormPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/memories" element={<MemoriesPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        
        {/* Movie Booking Routes */}
        <Route path="/movies" element={<MoviesSelectionPage />} />
        <Route path="/movies/:showtimeId/seats" element={<SeatSelectionPage />} />
        <Route path="/movies/:showtimeId/snacks" element={<SnacksSelectionPage />} />
        <Route path="/movies/:showtimeId/checkout" element={<MovieCheckoutPage />} />
        <Route path="/movies/verify" element={<MovieVerifyPage />} />
        <Route path="/movies/status" element={<MovieStatusPage />} />
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
        <Route path="/admin/movies" element={
          <Suspense fallback={<div style={{color: 'white', textAlign: 'center', marginTop: '100px'}}>Loading dashboard...</div>}>
            <AdminMovies />
          </Suspense>
        } />
        <Route path="/admin/movie-bookings" element={
          <Suspense fallback={<div style={{color: 'white', textAlign: 'center', marginTop: '100px'}}>Loading dashboard...</div>}>
            <AdminMovieBookings />
          </Suspense>
        } />
        {/* <Route path="/admin/events" element={
          <Suspense fallback={<div style={{color: 'white', textAlign: 'center', marginTop: '100px'}}>Loading dashboard...</div>}>
            <AdminEventsPage />
          </Suspense>
        } /> */}
        <Route path="/status" element={<StatusPage />} />
        <Route path="/venue" element={<VenueVerifyPage />} />
      </Routes>
        </>
      )}
    </>
  );
}
