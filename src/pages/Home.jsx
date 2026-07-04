import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CountdownTimer from '../components/CountdownTimer';
import About from '../components/About';
import Timeline from '../components/Timeline';
import Committee from '../components/Committee';
import Footer from '../components/Footer';
import { FaqAccordion } from '../components/forgeui/faq-accordion';
import ContactSection from '../components/ContactSection';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Committee variant="avatars" />
        <CountdownTimer />
        <About />
        <Timeline />
        <section id="faq" className="section" style={{ background: 'var(--bg-alt)' }}>
          <div className="container">
            <FaqAccordion />
          </div>
        </section>
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
