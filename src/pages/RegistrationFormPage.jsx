import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SpotlightNavbar } from '../components/SpotlightNavbar';
import Footer from '../components/Footer';
import Registration from '../components/Registration';

export default function RegistrationFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const gameId = searchParams.get('game');

  useEffect(() => {
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
          activeIndex={2}
          onItemClick={(item) => {
            if (item.href) {
              navigate(item.href);
            }
          }}
        />
      </div>
      <main style={{ minHeight: '100vh', background: '#000000', color: '#ffffff', paddingTop: '120px' }}>
        <div style={{ position: 'relative', zIndex: 20, width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          <Registration hideTabs={!gameId} onlyGames={!!gameId} initialGameId={gameId} />
        </div>
      </main>
      <Footer />
    </>
  );
}
