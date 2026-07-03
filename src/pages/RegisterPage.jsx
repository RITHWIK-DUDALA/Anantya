import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpotlightNavbar } from '../components/SpotlightNavbar';
import Galaxy from '../components/Galaxy';
import Footer from '../components/Footer';
import DiagonalCarousel from '../components/forgeui/diagonal-carousel';
import CONFIG from '../config/config';
import { gameCardsData } from '../data/gamesData';
import FlipFadeText from '../components/forgeui/flip-fade-text';

export default function RegisterPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Scroll to top when loading the new page
    window.scrollTo(0, 0);
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Games", href: "/register" },
    { label: "Volunteer", href: "/form" },
    { label: "Status", href: "/status" }
  ];

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <SpotlightNavbar 
          items={navItems}
          activeIndex={1}
          onItemClick={(item) => {
            if (item.href) {
              navigate(item.href);
            }
          }}
        />
      </div>
      <main style={{ minHeight: '100vh', background: '#000000', color: '#ffffff' }}>
        
        {/* Galaxy Hero section */}
        <div style={{ width: '100%', height: '100vh', position: 'relative', minHeight: '600px' }}>
          <Galaxy 
            mouseRepulsion
            mouseInteraction
            density={1}
            glowIntensity={0.3}
            saturation={0}
            hueShift={140}
            twinkleIntensity={0.3}
            rotationSpeed={0.1}
            repulsionStrength={2}
            autoCenterRepulsion={0}
            starSpeed={0.5}
            speed={1}
          />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 5 }}>
            <FlipFadeText 
              words={["REGISTER NOW", "COMPETE", "CELEBRATE"]}
              subtext="Secure your spot for the grand Janmashtami celebrations and competitions."
              textStyle={{ fontSize: '3.5rem' }}
            />
          </div>
        </div>
        
        {/* Main Content Section */}
        <div style={{ 
          padding: '80px 20px 100px', 
          position: 'relative', 
          zIndex: 10, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          background: 'linear-gradient(140deg, #FFF5E0 0%, #FFE8C0 22%, #EEF5FF 55%, #F5EEFF 80%, #FFF0E8 100%)',
          borderTop: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 -20px 40px rgba(0,0,0,0.3), inset 0 20px 40px rgba(255,255,255,0.8), inset 0 -20px 40px rgba(0,0,0,0.05)',
          minHeight: '600px'
        }}>
          <DiagonalCarousel 
            items={gameCardsData} 
            onItemClick={(item) => navigate(`/games/${item.id}`)} 
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
