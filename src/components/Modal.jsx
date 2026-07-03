import React from 'react';

export default function Modal({ title, message, icon, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-icon">{icon}</div>
        <h3 className="modal-title">{title}</h3>
        <div className="modal-message">{message}</div>
        <button className="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
