import React, { useState, useEffect, useCallback, useRef } from 'react';
import Galaxy from '../components/Galaxy';
import Footer from '../components/Footer';
import { SpotlightNavbar } from '../components/SpotlightNavbar';
import { TIMELINE_EVENTS } from '../data/timelineData';
import CONFIG from '../config/config';

const apiUrl = import.meta.env.VITE_API_URL || '';

const CATEGORIES = ['General', 'Cultural', 'Games', 'Food', 'Devotional', 'Music', 'Dance', 'Sports', 'Art', 'Workshop'];
const TL_CATEGORIES = ['Cultural', 'Games', 'Food', 'Spiritual', 'Sports', 'General'];

const STATUS_STYLES = {
  published: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'rgba(16,185,129,0.4)', label: '● Published' },
  draft:     { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af', border: 'rgba(156,163,175,0.4)', label: '◌ Draft' },
  scheduled: { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24', border: 'rgba(251,191,36,0.4)',  label: '⏱ Scheduled' },
};

const EMPTY_FORM = {
  title: '', description: '', date: '', time: '', venue: '',
  capacity: '', category: 'General', imageUrl: '',
  status: 'draft', scheduledPublishAt: '', releaseAt: '',
};

const inp = {
  background: 'rgba(0,0,0,0.4)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.12)',
  padding: '10px 14px',
  borderRadius: '8px',
  width: '100%',
  boxSizing: 'border-box',
  fontSize: '0.95rem',
  outline: 'none',
};

const label = (text, color = '#aaa') => (
  <label style={{ display: 'block', color, fontSize: '0.8rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {text}
  </label>
);

// ─────────────────────────────────────────────
//  Login Gate
// ─────────────────────────────────────────────
function LoginGate({ onLogin }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${apiUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}><Galaxy /></div>
      <div style={{ zIndex: 10, width: '100%', maxWidth: '420px', padding: '48px 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', backdropFilter: 'blur(24px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.8rem' }}>Events Admin</h2>
          <p style={{ color: '#666', marginTop: '6px', fontSize: '0.9rem' }}>Secure access required</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input style={inp} type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required />
          <input style={inp} type="password" placeholder="Admin Password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p style={{ color: '#f43f5e', margin: 0, fontSize: '0.9rem' }}>{error}</p>}
          <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Verifying…' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
//  Event Form Modal
// ─────────────────────────────────────────────
function EventModal({ event, onClose, onSave, saving }) {
  const [form, setForm] = useState(event ? { ...EMPTY_FORM, ...event } : { ...EMPTY_FORM });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(event?.imageUrl || '');
  const fileRef = useRef(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('poster', file);
      const res = await fetch(`${apiUrl}/api/admin/settings/upload-poster`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      set('imageUrl', data.url);
      setPreviewUrl(data.url);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(8px)',
  };
  const modal = {
    background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '680px',
    maxHeight: '92vh', overflowY: 'auto', position: 'relative',
    boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
  };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>

        <h3 style={{ margin: '0 0 28px', color: 'var(--primary)', fontSize: '1.4rem' }}>
          {event ? 'Edit Event' : 'Create New Event'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Title */}
          <div>
            {label('Title *')}
            <input style={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Event Title" required />
          </div>

          {/* Description */}
          <div>
            {label('Description')}
            <textarea style={{ ...inp, minHeight: '90px', resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the event…" />
          </div>

          {/* Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              {label('Date *')}
              <input style={inp} type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
            <div>
              {label('Time *')}
              <input style={inp} type="time" value={form.time} onChange={e => set('time', e.target.value)} required />
            </div>
          </div>

          {/* Venue & Capacity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              {label('Venue')}
              <input style={inp} value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="e.g. Main Hall" />
            </div>
            <div>
              {label('Capacity')}
              <input style={inp} type="number" min="0" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="0 = unlimited" />
            </div>
          </div>

          {/* Category & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              {label('Category')}
              <select style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
              </select>
            </div>
            <div>
              {label('Status')}
              <select style={{ ...inp, cursor: 'pointer' }} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="draft" style={{ background: '#111' }}>Draft</option>
                <option value="published" style={{ background: '#111' }}>Published</option>
                <option value="scheduled" style={{ background: '#111' }}>Scheduled</option>
              </select>
            </div>
          </div>

          {/* Scheduled publish at */}
          {form.status === 'scheduled' && (
            <div>
              {label('⏱ Publish At (date & time)', '#fbbf24')}
              <input style={{ ...inp, borderColor: 'rgba(251,191,36,0.4)' }} type="datetime-local" value={form.scheduledPublishAt} onChange={e => set('scheduledPublishAt', e.target.value)} />
            </div>
          )}

          {/* Release / Data Release Date */}
          <div>
            {label('Data Release Date (optional)')}
            <input
              style={{ ...inp, borderColor: 'rgba(99,179,237,0.4)' }}
              type="datetime-local"
              value={form.releaseAt}
              onChange={e => set('releaseAt', e.target.value)}
            />
            <p style={{ color: '#555', fontSize: '0.75rem', marginTop: '4px' }}>When set, this event is only visible after this date/time</p>
          </div>

          {/* Poster Upload */}
          <div>
            {label('Event Poster')}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <input
                  style={inp}
                  value={form.imageUrl}
                  onChange={e => { set('imageUrl', e.target.value); setPreviewUrl(e.target.value); }}
                  placeholder="Paste URL  --  or upload below"
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    style={{ padding: '8px 16px', background: 'rgba(183,139,39,0.15)', color: 'var(--primary)', border: '1px solid rgba(183,139,39,0.4)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                  {previewUrl && <span style={{ color: '#10b981', fontSize: '0.8rem' }}>Image set</span>}
                </div>
              </div>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="poster preview"
                  style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                  onError={e => e.target.style.display = 'none'}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.06)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, var(--primary), #c97d20)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : (event ? 'Save Changes' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Event Card
// ─────────────────────────────────────────────
function EventCard({ event, onEdit, onDelete, onTogglePublish }) {
  const st = STATUS_STYLES[event.status] || STATUS_STYLES.draft;
  const dateStr = event.date ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const isPublished = event.status === 'published';
  const hasRelease = event.releaseAt && new Date(event.releaseAt) > new Date();

  return (
    <div
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s, transform 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(183,139,39,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {event.imageUrl ? (
        <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
      ) : (
        <div style={{ height: '80px', background: 'linear-gradient(135deg, rgba(183,139,39,0.2), rgba(100,60,180,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#666', letterSpacing: '1px' }}>No Poster</div>
      )}

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', lineHeight: 1.3, flex: 1 }}>{event.title}</h3>
          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
            {st.label}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem', color: '#888' }}>
          <span>Date: {dateStr}</span>
          <span>Time: {event.time || '—'}</span>
          {event.venue && <span>Venue: {event.venue}</span>}
          {event.capacity > 0 && <span>Capacity: {event.capacity}</span>}
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {event.category && (
            <span style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem' }}>
              {event.category}
            </span>
          )}
          {hasRelease && (
            <span style={{ background: 'rgba(99,179,237,0.15)', color: '#63b3ed', border: '1px solid rgba(99,179,237,0.3)', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem' }}>
              Releases {new Date(event.releaseAt).toLocaleDateString('en-IN')}
            </span>
          )}
        </div>

        {event.description && (
          <p style={{ margin: 0, color: '#777', fontSize: '0.85rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {event.description}
          </p>
        )}

        {event.status === 'scheduled' && event.scheduledPublishAt && (
          <p style={{ margin: 0, color: '#fbbf24', fontSize: '0.78rem' }}>
            Publishes: {new Date(event.scheduledPublishAt).toLocaleString('en-IN')}
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => onEdit(event)} style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.06)', color: '#ccc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
            Edit
          </button>
          <button onClick={() => onTogglePublish(event)} style={{ flex: 1, padding: '8px', background: isPublished ? 'rgba(156,163,175,0.1)' : 'rgba(16,185,129,0.1)', color: isPublished ? '#9ca3af' : '#10b981', border: `1px solid ${isPublished ? 'rgba(156,163,175,0.2)' : 'rgba(16,185,129,0.2)'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
            {isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button onClick={() => onDelete(event.id)} style={{ padding: '8px 12px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Timeline Editor Tab
// ─────────────────────────────────────────────
function TimelineEditor() {
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  useEffect(() => {
    // Load from Firestore first, fall back to static data
    fetch(`${apiUrl}/api/settings/timeline`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.timeline?.length) {
          setItems(data.timeline);
        } else {
          setItems(TIMELINE_EVENTS.map(e => ({ ...e })));
        }
      })
      .catch(() => setItems(TIMELINE_EVENTS.map(e => ({ ...e }))))
      .finally(() => setLoading(false));
  }, []);

  const updateItem = (idx, key, val) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), icon: 'X', name: '', time: '', description: '', category: 'General' }]);
  };

  const removeItem = (idx) => {
    if (!window.confirm('Remove this timeline entry?')) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDragStart = (idx) => { dragItem.current = idx; };
  const handleDragEnter = (idx) => { dragOver.current = idx; };
  const handleDragEnd = () => {
    const from = dragItem.current;
    const to = dragOver.current;
    if (from === null || to === null || from === to) return;
    const newItems = [...items];
    const [moved] = newItems.splice(from, 1);
    newItems.splice(to, 0, moved);
    setItems(newItems);
    dragItem.current = null;
    dragOver.current = null;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/settings/timeline`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ timeline: items }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed'); }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm('Reset timeline to the original static data?')) return;
    setItems(TIMELINE_EVENTS.map(e => ({ ...e })));
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>Loading timeline...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: '0 0 8px', color: '#fff', fontSize: '1.4rem' }}>Event Timeline</h2>
          <p style={{ color: '#555', margin: '4px 0 0', fontSize: '0.85rem' }}>Drag rows to reorder. Changes go live on the homepage when saved.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleReset} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
            Reset to Default
          </button>
          <button onClick={addItem} style={{ padding: '8px 16px', background: 'rgba(183,139,39,0.15)', color: 'var(--primary)', border: '1px solid rgba(183,139,39,0.4)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            + Add Entry
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', background: 'linear-gradient(135deg, var(--primary), #c97d20)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Timeline'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, idx) => (
          <div
            key={item.id ?? idx}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragEnter={() => handleDragEnter(idx)}
            onDragEnd={handleDragEnd}
            onDragOver={e => e.preventDefault()}
            style={{ display: 'grid', gridTemplateColumns: '32px 60px 1fr 1fr 1fr 130px 36px', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 12px', cursor: 'grab', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            {/* Drag handle */}
            <span style={{ color: '#444', fontSize: '1.1rem', userSelect: 'none', textAlign: 'center' }}>::::</span>

            {/* Icon */}
            <input
              value={item.icon}
              onChange={e => updateItem(idx, 'icon', e.target.value)}
              style={{ ...inp, padding: '6px 8px', textAlign: 'center', fontSize: '1.2rem', borderRadius: '6px' }}
              maxLength={4}
            />

            {/* Name */}
            <input
              value={item.name}
              onChange={e => updateItem(idx, 'name', e.target.value)}
              style={{ ...inp, padding: '6px 10px', fontSize: '0.88rem', borderRadius: '6px' }}
              placeholder="Event name"
            />

            {/* Time */}
            <input
              value={item.time}
              onChange={e => updateItem(idx, 'time', e.target.value)}
              style={{ ...inp, padding: '6px 10px', fontSize: '0.88rem', borderRadius: '6px' }}
              placeholder="e.g. 31 Aug • 5:00 PM"
            />

            {/* Description */}
            <input
              value={item.description}
              onChange={e => updateItem(idx, 'description', e.target.value)}
              style={{ ...inp, padding: '6px 10px', fontSize: '0.88rem', borderRadius: '6px' }}
              placeholder="Short description"
            />

            {/* Category */}
            <select
              value={item.category}
              onChange={e => updateItem(idx, 'category', e.target.value)}
              style={{ ...inp, padding: '6px 8px', fontSize: '0.82rem', borderRadius: '6px', cursor: 'pointer' }}
            >
              {TL_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
            </select>

            {/* Delete */}
            <button onClick={() => removeItem(idx)} style={{ padding: '6px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Del
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#444' }}>
        {items.length} entries  •  Drag grid handle to reorder
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Settings Tab (Countdown + Global)
// ─────────────────────────────────────────────
function SettingsPanel() {
  const [eventDate, setEventDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiUrl}/api/settings/event-date`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.eventDate) {
          // Convert ISO to datetime-local format (YYYY-MM-DDTHH:mm)
          const d = new Date(data.eventDate);
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setEventDate(local);
        } else {
          // Prefill from config
          const d = new Date(CONFIG.eventDate);
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setEventDate(local);
        }
      })
      .catch(() => {
        const d = new Date(CONFIG.eventDate);
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setEventDate(local);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!eventDate) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/settings/event-date`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventDate: new Date(eventDate).toISOString() }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed'); }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>Loading settings...</div>;

  return (
    <div style={{ maxWidth: '560px' }}>
      <h2 style={{ margin: '0 0 8px', color: '#fff', fontSize: '1.4rem' }}>Global Settings</h2>
      <p style={{ color: '#555', margin: '0 0 32px', fontSize: '0.85rem' }}>Changes take effect immediately on the live site.</p>

      {/* Countdown Clock */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.1rem' }}>Event Countdown Clock</h3>
            <p style={{ margin: '2px 0 0', color: '#555', fontSize: '0.82rem' }}>Controls the homepage countdown timer</p>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          {label('Event Date & Time', '#aaa')}
          <input
            type="datetime-local"
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
            style={{ ...inp, borderColor: 'rgba(183,139,39,0.4)', fontSize: '1rem' }}
          />
          <p style={{ color: '#444', fontSize: '0.75rem', marginTop: '6px' }}>
            Currently in config.js: <code style={{ color: '#888' }}>{CONFIG.eventDate}</code>
          </p>
        </div>

        <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, var(--primary), #c97d20)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : saved ? 'Saved! Timer updated live.' : 'Update Countdown Date'}
        </button>

        {saved && (
          <p style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '10px' }}>
            Homepage countdown timer will now count down to {new Date(eventDate).toLocaleString('en-IN')}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main Dashboard
// ─────────────────────────────────────────────
export default function AdminEventsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'timeline' | 'settings'

  useEffect(() => {
    fetch(`${apiUrl}/api/admin/events`, { credentials: 'include' })
      .then(r => { if (r.ok) { setIsAuthenticated(true); return r.json(); } throw new Error(); })
      .then(data => { setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/admin/events`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch events');
      setEvents(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isAuthenticated) fetchEvents(); }, [isAuthenticated]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const isEdit = modal && modal.id;
      const url = isEdit ? `${apiUrl}/api/admin/events/${modal.id}` : `${apiUrl}/api/admin/events`;
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed'); }
      setModal(null);
      await fetchEvents();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/events/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchEvents();
    } catch (err) { alert(err.message); }
  };

  const handleTogglePublish = async (event) => {
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`${apiUrl}/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchEvents();
    } catch (err) { alert(err.message); }
  };

  const handleLogout = async () => {
    await fetch(`${apiUrl}/api/admin/logout`, { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) return <LoginGate onLogin={() => { setIsAuthenticated(true); fetchEvents(); }} />;

  const filtered = events
    .filter(e => filter === 'all' || e.status === filter)
    .filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.description?.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    all: events.length,
    published: events.filter(e => e.status === 'published').length,
    draft: events.filter(e => e.status === 'draft').length,
    scheduled: events.filter(e => e.status === 'scheduled').length,
  };

  const TABS = [
    { key: 'events',   label: 'Events' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <SpotlightNavbar
          items={[
            { label: 'Home', href: '/' },
            { label: 'Payments', href: '/admin/payments' },
            { label: 'Volunteers', href: '/admin/volunteers' },
            { label: 'Logout', href: '#' },
          ]}
          onItemClick={item => item.label === 'Logout' ? handleLogout() : (window.location.href = item.href)}
        />
      </div>

      <main style={{ minHeight: '100vh', background: '#000', color: '#fff', position: 'relative', padding: '120px 24px 80px' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }}><Galaxy /></div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1280px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.4rem', color: 'var(--primary)', letterSpacing: '-1px' }}>Events Manager</h1>
              <p style={{ color: '#666', marginTop: '6px' }}>Create, schedule, and manage all events for Anantya 2026</p>
            </div>
            {activeTab === 'events' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={fetchEvents} style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.06)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  ⟳ Refresh
                </button>
                <button onClick={() => setModal('create')} style={{ padding: '10px 22px', background: 'linear-gradient(135deg, var(--primary), #c97d20)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
                  + New Event
                </button>
              </div>
            )}
          </div>

          {/* Tab Bar */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', width: 'fit-content' }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === tab.key ? 'rgba(183,139,39,0.2)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--primary)' : '#666',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.key ? 700 : 400,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Events Tab ── */}
          {activeTab === 'events' && (
            <>
              {/* Status filter bar */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { key: 'all',       label: 'All Events',  color: '#fff' },
                  { key: 'published', label: 'Published',   color: '#10b981' },
                  { key: 'scheduled', label: 'Scheduled',   color: '#fbbf24' },
                  { key: 'draft',     label: 'Drafts',      color: '#9ca3af' },
                ].map(({ key, label: lbl, color }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    style={{ padding: '7px 16px', borderRadius: '20px', cursor: 'pointer', border: `1px solid ${filter === key ? color : 'rgba(255,255,255,0.1)'}`, background: filter === key ? `${color}18` : 'rgba(255,255,255,0.03)', color: filter === key ? color : '#666', fontWeight: filter === key ? 700 : 400, fontSize: '0.84rem', transition: 'all 0.2s' }}
                  >
                    {lbl} <span style={{ opacity: 0.7 }}>({counts[key]})</span>
                  </button>
                ))}
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="🔍 Search events…"
                  style={{ ...inp, width: 'auto', flex: 1, minWidth: '180px', marginLeft: 'auto', fontSize: '0.88rem', padding: '7px 14px' }}
                />
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0', color: '#555' }}>Loading events…</div>
              ) : error ? (
                <div style={{ textAlign: 'center', color: '#f43f5e', padding: '60px 0' }}>{error}</div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                  <p style={{ color: '#555', fontSize: '1.1rem' }}>
                    {events.length === 0 ? 'No events yet. Create your first one!' : 'No events match your filter.'}
                  </p>
                  {events.length === 0 && (
                    <button onClick={() => setModal('create')} style={{ marginTop: '16px', padding: '12px 28px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
                      + Create First Event
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {filtered.map(ev => (
                    <EventCard
                      key={ev.id}
                      event={ev}
                      onEdit={e => setModal(e)}
                      onDelete={handleDelete}
                      onTogglePublish={handleTogglePublish}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Timeline Tab ── */}
          {activeTab === 'timeline' && <TimelineEditor />}

          {/* ── Settings Tab ── */}
          {activeTab === 'settings' && <SettingsPanel />}

        </div>
      </main>

      <Footer />

      {/* Event modal */}
      {modal && (
        <EventModal
          event={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </>
  );
}
