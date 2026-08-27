import React, { useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

const Ticket = ({ registrationData }) => {
  const ticketRef = useRef(null);

  useEffect(() => {
    let isDownloaded = false;
    
    const downloadTicket = async () => {
      if (ticketRef.current && !isDownloaded) {
        try {
          // Wait a tiny bit for the image to fully load
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const canvas = await html2canvas(ticketRef.current, { 
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null
          });
          const link = document.createElement('a');
          link.download = `anantya-ticket-${registrationData.regId || 'test'}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          isDownloaded = true;
        } catch (error) {
          console.error("Error generating ticket image:", error);
        }
      }
    };

    downloadTicket();
  }, [registrationData]);

  const data = {
    regId: registrationData?.regId || '73028',
    email: registrationData?.email || 'user@example.com',
    events: registrationData?.events || 'All Events',
    transactionId: registrationData?.transactionId || 'N/A',
    status: registrationData?.status || 'Pending Verification'
  };

  return (
    <div style={{ position: 'fixed', left: '-9999px', top: '0', pointerEvents: 'none' }}>
      <div 
        ref={ticketRef} 
        style={{
          position: 'relative',
          width: '600px', // Fixed width for consistent canvas rendering
          fontFamily: "'Inter', sans-serif"
        }}
      >
        <img 
          src="/assets/ticket.png" 
          alt="Event Ticket" 
          style={{ width: '100%', height: 'auto', display: 'block' }}
          crossOrigin="anonymous"
        />
        
        {/* Dynamic Fields Overlay */}
        {/* 1. Registration Code */}
        <div style={{
          position: 'absolute', top: '30%', left: '59%', width: '35%', height: '6%',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#233559', letterSpacing: '0.2em' }}>
            {data.regId}
          </span>
        </div>
        
        {/* 2. Email */}
        <div style={{
          position: 'absolute', top: '41.5%', left: '59%', width: '35%', height: '6%',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#34495e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
            {data.email}
          </span>
        </div>
        
        {/* 3. Registered Events */}
        <div style={{
          position: 'absolute', top: '53%', left: '59%', width: '35%', height: '6%',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#34495e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
            {data.events}
          </span>
        </div>
        
        {/* 4. Transaction ID */}
        <div style={{
          position: 'absolute', top: '64.5%', left: '59%', width: '35%', height: '6%',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#34495e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
            {data.transactionId}
          </span>
        </div>
        
        {/* 5. Session Token / Status */}
        <div style={{
          position: 'absolute', top: '76%', left: '59%', width: '35%', height: '6%',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ 
            fontSize: '16px', fontWeight: '600', fontStyle: 'italic', 
            color: data.status.toLowerCase().includes('verified') ? '#27ae60' : '#c0392b',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center'
          }}>
            ({data.status})
          </span>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
