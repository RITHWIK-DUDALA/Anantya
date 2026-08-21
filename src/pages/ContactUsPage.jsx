import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CONFIG from '../config/config';

export default function ContactUsPage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: '30px', fontFamily: 'Cinzel, serif' }}>Contact Us</h1>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '20px' }}>
              If you have any questions about {CONFIG.eventName}, please feel free to reach out to us through the following channels:
            </p>

            <h3 style={{ color: '#fff', marginTop: '30px', marginBottom: '15px' }}>Email</h3>
            <p style={{ marginBottom: '20px' }}>
              For general inquiries, reach out to: <br/>
              <a href={`mailto:${CONFIG.committeeEmail}`} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{CONFIG.committeeEmail}</a>
            </p>

            <h3 style={{ color: '#fff', marginTop: '30px', marginBottom: '15px' }}>Address</h3>
            <p style={{ marginBottom: '20px' }}>
              {CONFIG.collegeName}<br/>
              {CONFIG.eventVenue}
            </p>

            <h3 style={{ color: '#fff', marginTop: '30px', marginBottom: '15px' }}>Event Contacts</h3>
            <p style={{ marginBottom: '20px' }}>
              For urgent queries, you can contact our event heads:<br/>
              <strong>Punith Vuppala</strong>: +91 7989863060<br/>
              <strong>Dimple Hassini</strong>: +91 9390252586<br/>
              <strong>Rithwik Satya D</strong>: +91 9346710580
            </p>

            <h3 style={{ color: '#fff', marginTop: '30px', marginBottom: '15px' }}>Social Media</h3>
            <p style={{ marginBottom: '20px' }}>
              Follow us on Instagram for updates: <a href={CONFIG.socials.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>@avv_janmashtami</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
