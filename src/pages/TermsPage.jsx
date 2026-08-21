import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: '30px', fontFamily: 'Cinzel, serif' }}>Terms & Conditions</h1>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '20px' }}>
              Welcome to the registration portal for Anantya 2026. By accessing this website and registering for events, you agree to comply with and be bound by the following terms and conditions.
            </p>

            <h3 style={{ color: '#fff', marginTop: '30px', marginBottom: '15px' }}>Registration & Payment</h3>
            <p style={{ marginBottom: '20px' }}>
              All registrations are final upon successful payment. Registration fees for games, events, or stalls are strictly non-refundable unless the entire event is canceled by the organizers.
            </p>

            <h3 style={{ color: '#fff', marginTop: '30px', marginBottom: '15px' }}>Attendance & Punctuality</h3>
            <p style={{ marginBottom: '20px' }}>
              Participants must report to their respective events on time. Failure to show up in time for registered games or events will result in forfeiture of the registration fee. There will be no refunds or rescheduling for late arrivals or no-shows for any reason.
            </p>

            <h3 style={{ color: '#fff', marginTop: '30px', marginBottom: '15px' }}>Code of Conduct</h3>
            <p style={{ marginBottom: '20px' }}>
              All participants are expected to adhere to the code of conduct set by Amrita Vishwa Vidyapeetham. The organizers reserve the right to disqualify or remove any participant found violating these rules, without any refund.
            </p>

            <h3 style={{ color: '#fff', marginTop: '30px', marginBottom: '15px' }}>Event Changes</h3>
            <p style={{ marginBottom: '20px' }}>
              The organizing committee reserves the right to modify event schedules, rules, or formats. While rare, any major changes will be communicated to registered participants.
            </p>

            <p style={{ marginTop: '30px' }}>
              By completing a payment on this site, you acknowledge that you have read and agreed to these Terms & Conditions.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
