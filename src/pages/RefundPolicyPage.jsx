import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: '30px', fontFamily: 'Cinzel, serif' }}>Refund & Cancellation Policy</h1>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '20px' }}>
              Thank you for registering for Anantya 2026. Please read our refund and cancellation policy carefully before making any payments.
            </p>

            <h3 style={{ color: '#fff', marginTop: '30px', marginBottom: '15px' }}>Strict No-Refund Policy</h3>
            <p style={{ marginBottom: '20px' }}>
              All payments made towards event registrations, game fees, stalls, and any other activities associated with Anantya 2026 are <strong>strictly non-refundable</strong> under normal circumstances.
            </p>

            <h3 style={{ color: '#fff', marginTop: '30px', marginBottom: '15px' }}>Exceptions (Event Cancellation)</h3>
            <p style={{ marginBottom: '20px' }}>
              Refunds will <strong>only</strong> be processed in the rare event that the <strong>entire Anantya 2026 event is officially canceled</strong> by the organizing committee of Amrita Vishwa Vidyapeetham, Chennai Campus.
            </p>
            <p style={{ marginBottom: '20px' }}>
              If such a cancellation occurs, registered participants will be notified via the contact information provided during registration, and refunds will be initiated to the original source of payment within 7-10 business days.
            </p>

            <h3 style={{ color: '#fff', marginTop: '30px', marginBottom: '15px' }}>No-Shows and Late Arrivals</h3>
            <p style={{ marginBottom: '20px' }}>
              No refunds will be granted if you fail to attend the event or arrive late. If you do not show up in time for your registered games, events, or slots, your registration will be forfeited, and no money will be returned.
            </p>

            <h3 style={{ color: '#fff', marginTop: '30px', marginBottom: '15px' }}>Contact for Queries</h3>
            <p>
              If you have any questions regarding this policy, please reach out to us at <a href="mailto:events@avvchennai.edu.in" style={{ color: 'var(--primary)' }}>events@avvchennai.edu.in</a>.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
