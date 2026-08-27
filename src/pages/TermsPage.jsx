import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsPage() {
  const handleDownload = () => {
    const text = `# Terms & Conditions — Payments, Refunds & Cancellations

By registering and completing payment for this event, you agree to the following terms.

## 1. No Refund Policy
All payments made towards registration are **final and non-refundable**, under any of the following circumstances:
- **Event rescheduled:** If the event date, time, or venue is changed for any reason (including but not limited to venue unavailability, weather, technical issues, low registrations, or force majeure), your registration will automatically carry forward to the new date/time. No refund will be issued for the change itself.
- **Participant no-show / late arrival:** If you fail to show up, arrive after the event/session has started, or are unable to attend for any personal reason, the amount paid will not be refunded or credited.
- **Incorrect registration details:** If you select the wrong event, category, ticket type, or enter incorrect details (name, email, game/session choice, etc.) at the time of registration, the organizers are not liable to issue a refund. Please review all details carefully before submitting payment.
- **Payment/transaction errors on your end:** If you enter an incorrect or invalid Transaction ID/UTR, pay an incorrect amount, or your payment fails verification due to details you provided being wrong, no refund will be processed. You are responsible for ensuring accurate submission of payment details.
- **Disqualification/removal:** If you are removed from the event for violating event rules, code of conduct, or safety guidelines, no refund will be issued.

## 2. Slot Capacity & First-Come, First-Served Policy
All game and event registrations are processed strictly on a **first-come, first-served basis** due to limited participant slots and venue capacity.
- If your registration cannot be accommodated or is **not selected** because slots were filled before your submission/verification, we sincerely apologize for that.
- In this case, your full registration fee will be **refunded within 2 days of the event**.

## 3. Event Cancellation by Organizers
The organizers reserve the full right to cancel the event due to reasons including but not limited to: insufficient number of participating teams/registrations not meeting the minimum required threshold, technical difficulties, venue/logistical issues, or any other unforeseen circumstance.
- If the event is **cancelled** (not rescheduled) for any of the above reasons, the registration amount paid will be **refunded within 2 days of the event** to the original payment method/account used.
- Refunds will only be processed for participants whose payments were successfully verified prior to cancellation.
- The organizers are not liable for any delays in refund caused by banking/UPI processing times beyond their control.
- If the event is merely **rescheduled** (not cancelled), Section 1 applies and no refund is issued — your registration carries forward to the new date.

## 4. Disqualification
The organizers reserve the full right to disqualify or remove any participant/team from the event for a suitable reason, including but not limited to violation of event rules, code of conduct, unfair practices, or misconduct towards coordinators, volunteers, or other participants. No refund will be issued in case of disqualification (see Section 1).

## 4. Code of Conduct & Grievance Redressal
All participants are expected to behave in a civilized and respectful manner throughout the event, and to comply with all campus rules and event-specific rules and instructions given by organizers, coordinators, and volunteers.
- **Do not argue with or confront coordinators or volunteers directly**, even if you disagree with a decision.
- If you have a concern or grievance involving a **volunteer**, raise it with the event **coordinator** for that area.
- If you have a concern or grievance involving a **coordinator**, raise it **immediately** with a **core team member**, either verbally or by raising a formal complaint/ticket.
- **Manhandling, physical altercation, verbal abuse, or aggressive behavior towards any organizer, coordinator, volunteer, or fellow participant will not be tolerated** under any circumstance and may result in immediate disqualification and removal from the venue, with no refund.
- All decisions made by the core organizing team in response to a grievance are final.

## 5. Verification Disputes
Manual payment verification is done by cross-checking the Transaction ID/UTR you submit against actual payment records. If:
- Your payment is genuine but rejected due to a mismatch (e.g. wrong UTR entered, amount mismatch), you may raise a dispute at **[support email]** within **[X days]** of rejection, with proof of payment (screenshot + your registered email/Registration ID).
- Disputes raised after this window may not be entertained.
- Raising a dispute does not guarantee reinstatement — it will be reviewed manually and the organizers' decision is final.

## 6. General
- All decisions regarding verification, rejection, disqualification, and disputes rest solely with the organizing team.
- The organizers reserve the right to modify these terms at any time; the version active at the time of your registration applies to you.
- By completing payment, you confirm you have read, understood, and agreed to these terms.

---
*For any payment-related queries or disputes, contact: [support email] | [support phone/WhatsApp if applicable]*
`;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Anantya_Terms_and_Conditions.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
            <h1 style={{ color: 'var(--primary)', fontFamily: 'Cinzel, serif', margin: 0 }}>Terms & Conditions</h1>
            <button 
              onClick={handleDownload}
              style={{ background: 'var(--primary)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ↓ Download T&C
            </button>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '20px' }}>
              By registering and completing payment for this event, you agree to the following terms.
            </p>

            <h3 style={{ color: 'var(--primary)', marginTop: '30px', marginBottom: '15px' }}>1. No Refund Policy</h3>
            <p style={{ marginBottom: '10px' }}>All payments made towards registration are <strong>final and non-refundable</strong>, under any of the following circumstances:</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li><strong>Event rescheduled:</strong> If the event date, time, or venue is changed for any reason (including but not limited to venue unavailability, weather, technical issues, low registrations, or force majeure), your registration will automatically carry forward to the new date/time. No refund will be issued for the change itself.</li>
              <li><strong>Participant no-show / late arrival:</strong> If you fail to show up, arrive after the event/session has started, or are unable to attend for any personal reason, the amount paid will not be refunded or credited.</li>
              <li><strong>Incorrect registration details:</strong> If you select the wrong event, category, ticket type, or enter incorrect details (name, email, game/session choice, etc.) at the time of registration, the organizers are not liable to issue a refund. Please review all details carefully before submitting payment.</li>
              <li><strong>Payment/transaction errors on your end:</strong> If you enter an incorrect or invalid Transaction ID/UTR, pay an incorrect amount, or your payment fails verification due to details you provided being wrong, no refund will be processed. You are responsible for ensuring accurate submission of payment details.</li>
              <li><strong>Disqualification/removal:</strong> If you are removed from the event for violating event rules, code of conduct, or safety guidelines, no refund will be issued.</li>
            </ul>

            <h3 style={{ color: 'var(--primary)', marginTop: '30px', marginBottom: '15px' }}>2. Slot Capacity & First-Come, First-Served Policy</h3>
            <p style={{ marginBottom: '10px' }}>All game and event registrations are processed strictly on a <strong>first-come, first-served basis</strong> due to limited participant slots and venue capacity.</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li>If your registration cannot be accommodated or is <strong>not selected</strong> because slots were filled before your submission/verification, we sincerely apologize for that.</li>
              <li>In this case, your full registration fee will be <strong>refunded within 2 days of the event</strong>.</li>
            </ul>

            <h3 style={{ color: 'var(--primary)', marginTop: '30px', marginBottom: '15px' }}>3. Event Cancellation by Organizers</h3>
            <p style={{ marginBottom: '10px' }}>The organizers reserve the full right to cancel the event due to reasons including but not limited to: insufficient number of participating teams/registrations not meeting the minimum required threshold, technical difficulties, venue/logistical issues, or any other unforeseen circumstance.</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li>If the event is <strong>cancelled</strong> (not rescheduled) for any of the above reasons, the registration amount paid will be <strong>refunded within 2 days of the event</strong> to the original payment method/account used.</li>
              <li>Refunds will only be processed for participants whose payments were successfully verified prior to cancellation.</li>
              <li>The organizers are not liable for any delays in refund caused by banking/UPI processing times beyond their control.</li>
              <li>If the event is merely <strong>rescheduled</strong> (not cancelled), Section 1 applies and no refund is issued — your registration carries forward to the new date.</li>
            </ul>

            <h3 style={{ color: 'var(--primary)', marginTop: '30px', marginBottom: '15px' }}>4. Disqualification</h3>
            <p style={{ marginBottom: '20px' }}>
              The organizers reserve the full right to disqualify or remove any participant/team from the event for a suitable reason, including but not limited to violation of event rules, code of conduct, unfair practices, or misconduct towards coordinators, volunteers, or other participants. No refund will be issued in case of disqualification (see Section 1).
            </p>

            <h3 style={{ color: 'var(--primary)', marginTop: '30px', marginBottom: '15px' }}>4. Code of Conduct & Grievance Redressal</h3>
            <p style={{ marginBottom: '10px' }}>All participants are expected to behave in a civilized and respectful manner throughout the event, and to comply with all campus rules and event-specific rules and instructions given by organizers, coordinators, and volunteers.</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li><strong>Do not argue with or confront coordinators or volunteers directly</strong>, even if you disagree with a decision.</li>
              <li>If you have a concern or grievance involving a <strong>volunteer</strong>, raise it with the event <strong>coordinator</strong> for that area.</li>
              <li>If you have a concern or grievance involving a <strong>coordinator</strong>, raise it <strong>immediately</strong> with a <strong>core team member</strong>, either verbally or by raising a formal complaint/ticket.</li>
              <li><strong>Manhandling, physical altercation, verbal abuse, or aggressive behavior towards any organizer, coordinator, volunteer, or fellow participant will not be tolerated</strong> under any circumstance and may result in immediate disqualification and removal from the venue, with no refund.</li>
              <li>All decisions made by the core organizing team in response to a grievance are final.</li>
            </ul>

            <h3 style={{ color: 'var(--primary)', marginTop: '30px', marginBottom: '15px' }}>5. Verification Disputes</h3>
            <p style={{ marginBottom: '10px' }}>Manual payment verification is done by cross-checking the Transaction ID/UTR you submit against actual payment records. If:</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li>Your payment is genuine but rejected due to a mismatch (e.g. wrong UTR entered, amount mismatch), you may raise a dispute at <strong>[support email]</strong> within <strong>[X days]</strong> of rejection, with proof of payment (screenshot + your registered email/Registration ID).</li>
              <li>Disputes raised after this window may not be entertained.</li>
              <li>Raising a dispute does not guarantee reinstatement — it will be reviewed manually and the organizers' decision is final.</li>
            </ul>

            <h3 style={{ color: 'var(--primary)', marginTop: '30px', marginBottom: '15px' }}>6. General</h3>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li>All decisions regarding verification, rejection, disqualification, and disputes rest solely with the organizing team.</li>
              <li>The organizers reserve the right to modify these terms at any time; the version active at the time of your registration applies to you.</li>
              <li>By completing payment, you confirm you have read, understood, and agreed to these terms.</li>
            </ul>

            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '40px 0 20px 0' }} />
            <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9rem' }}>
              For any payment-related queries or disputes, contact: [support email] | [support phone/WhatsApp if applicable]
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
