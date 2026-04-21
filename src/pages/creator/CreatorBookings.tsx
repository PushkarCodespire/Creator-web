import { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Plus, ChevronLeft, ChevronRight, Sparkles, X, Trash2 } from 'lucide-react';
import { bookingApi, creatorApi } from '../../services/api';
import { message as antMessage } from 'antd';

const card: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ede8e3',
  borderRadius: 16,
  padding: 24,
};

const SLOT_TYPES = ['consultation', 'coaching', 'review'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const CreatorBookings = () => {
  const [acceptingBookings, setAcceptingBookings] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [slots, setSlots] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [requests, setRequests] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [confirmedBookings, setConfirmedBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSlots: 0, totalBookings: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // "YYYY-MM-DD"

  // Meeting link per pending request (keyed by request id)
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});
  // Edit state for confirmed bookings — maps requestId -> draft link while editing
  const [editingLinks, setEditingLinks] = useState<Record<string, string>>({});

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [timeSlots, setTimeSlots] = useState<{ startTime: string; type: string; price: string }[]>([
    { startTime: '10:00', type: 'consultation', price: '' },
  ]);
  const [slotSaving, setSlotSaving] = useState(false);
  const [_modalError, setModalError] = useState('');

  const fetchData = async () => {
    try {
      const [slotsRes, reqRes, statsRes] = await Promise.allSettled([
        bookingApi.getSlots(),
        bookingApi.getRequests(),
        bookingApi.getStats(),
      ]);
      if (slotsRes.status === 'fulfilled') setSlots(slotsRes.value.data.data || []);
      if (reqRes.status === 'fulfilled') {
        const allReqs = reqRes.value.data.data || [];
        setRequests(allReqs.filter((r: { status: string }) => r.status === 'PENDING'));
        setConfirmedBookings(allReqs.filter((r: { status: string }) => r.status === 'ACCEPTED'));
      }
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data || stats);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAccept = async (id: string, name: string) => {
    const linkInput = (meetingLinks[id] || '').trim();
    // Basic client-side URL validation
    if (linkInput) {
      try {
        const u = new URL(linkInput);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('bad protocol');
      } catch {
        antMessage.error('Meeting link must be a valid http:// or https:// URL');
        return;
      }
    }
    try {
      await bookingApi.acceptRequest(id, linkInput ? { meetingLink: linkInput } : undefined);
      antMessage.success(`Accepted booking from ${name}`);
      setMeetingLinks(prev => { const next = { ...prev }; delete next[id]; return next; });
      fetchData();
    } catch { antMessage.error('Failed to accept'); }
  };

  const handleSaveLink = async (id: string) => {
    const link = (editingLinks[id] || '').trim();
    if (link) {
      try {
        const u = new URL(link);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('bad protocol');
      } catch {
        antMessage.error('Meeting link must be a valid http:// or https:// URL');
        return;
      }
    }
    try {
      await bookingApi.updateMeetingLink(id, link || null);
      antMessage.success(link ? 'Meeting link updated' : 'Meeting link removed');
      setEditingLinks(prev => { const next = { ...prev }; delete next[id]; return next; });
      fetchData();
    } catch { antMessage.error('Failed to save meeting link'); }
  };

  const handleDecline = async (id: string, name: string) => {
    try { await bookingApi.declineRequest(id); antMessage.info(`Declined booking from ${name}`); fetchData(); }
    catch { antMessage.error('Failed to decline'); }
  };

  const handleDeleteSlot = async (id: string) => {
    try { await bookingApi.deleteSlot(id); antMessage.success('Slot removed'); fetchData(); }
    catch { antMessage.error('Failed to delete'); }
  };

  // Open modal for a date
  const openModal = (dateStr: string) => {
    setModalDate(dateStr);
    setTimeSlots([{ startTime: '10:00', type: 'consultation', price: '' }]);
    setModalError('');
    setShowModal(true);
  };

  // Add another time slot row in modal
  const addTimeSlotRow = () => {
    const lastTime = timeSlots[timeSlots.length - 1]?.startTime || '10:00';
    const [h, m] = lastTime.split(':').map(Number);
    const nextH = h + 1 > 23 ? 23 : h + 1;
    setTimeSlots([...timeSlots, { startTime: `${String(nextH).padStart(2, '0')}:${String(m).padStart(2, '0')}`, type: 'consultation', price: '' }]);
  };

  const removeTimeSlotRow = (idx: number) => {
    if (timeSlots.length <= 1) return;
    setTimeSlots(timeSlots.filter((_, i) => i !== idx));
  };

  const updateTimeSlot = (idx: number, field: string, value: string) => {
    setTimeSlots(timeSlots.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  // Save all slots for the modal date
  const handleSaveSlots = async () => {
    if (!modalDate || timeSlots.length === 0) return;
    setSlotSaving(true);
    setModalError('');
    try {
      let created = 0;
      for (const ts of timeSlots) {
        if (!ts.startTime) continue;
        const startTime = new Date(`${modalDate}T${ts.startTime}:00`);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        await bookingApi.createSlot({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          price: parseFloat(ts.price) || 0,
          type: ts.type,
        });
        created++;
      }
      setShowModal(false);
      antMessage.success(`${created} slot${created > 1 ? 's' : ''} created!`);
      fetchData();
    } catch (err: unknown) {
      antMessage.config({ top: 20, getContainer: () => document.body });
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      antMessage.error(e?.response?.data?.error?.message || 'Failed to create slot');
    } finally {
      setSlotSaving(false);
    }
  };

  // Calendar helpers
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const getDateStr = (day: number) => `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getSlotsForDate = (dateStr: string) => slots.filter(s => new Date(s.startTime).toISOString().split('T')[0] === dateStr);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#9ca3af', fontSize: 15 }}>Loading bookings...</div>;
  }

  const selectedSlots = selectedDate ? getSlotsForDate(selectedDate) : [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>Calendar & Bookings</h1>
          <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>Click any date to set your availability</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: acceptingBookings ? '#10b981' : '#d1d5db' }} />
            <span style={{ fontSize: 12, color: '#6b7280' }}>Accepting</span>
          </div>
          <button type="button" onClick={() => { setAcceptingBookings(v => !v); creatorApi.updateProfile({ allowNewConversations: !acceptingBookings }); }} style={{
            width: 40, height: 22, borderRadius: 99, padding: 2,
            background: acceptingBookings ? '#10b981' : '#d1d5db',
            border: 'none', cursor: 'pointer', transition: 'background 0.2s ease',
          }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'transform 0.2s ease', transform: acceptingBookings ? 'translateX(18px)' : 'translateX(0)' }} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { icon: <Calendar size={18} />, label: 'Total Slots', value: String(stats.totalSlots), color: '#ff3e48', bg: '#fff5f5' },
          { icon: <Clock size={18} />, label: 'Confirmed', value: String(stats.totalBookings), color: '#ff3e48', bg: '#fff5f5' },
          { icon: <DollarSign size={18} />, label: 'Pending', value: String(stats.pendingRequests), color: '#f59e0b', bg: '#fffbeb' },
        ].map((s, i) => (
          <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 20 }}>

        {/* Full Month Calendar */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button type="button" onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #ede8e3', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}><ChevronLeft size={16} /></button>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>{MONTH_NAMES[calMonth]} {calYear}</h3>
            <button type="button" onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #ede8e3', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}><ChevronRight size={16} /></button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 8 }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#9ca3af', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const dateStr = getDateStr(day);
              const isToday = dateStr === todayStr;
              const isPast = new Date(dateStr) < today;
              const isSelected = dateStr === selectedDate;
              const daySlots = getSlotsForDate(dateStr);
              const hasSlots = daySlots.length > 0;

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    if (!isPast) {
                      setSelectedDate(dateStr);
                    }
                  }}
                  style={{
                    textAlign: 'center', padding: '8px 4px', borderRadius: 10, cursor: isPast ? 'default' : 'pointer',
                    background: isSelected ? '#ff3e48' : isToday ? '#fff5f5' : hasSlots ? '#fef3c7' : 'transparent',
                    border: isSelected ? '2px solid #ff3e48' : isToday ? '2px solid #ff3e48' : '2px solid transparent',
                    opacity: isPast ? 0.3 : 1,
                    transition: 'all 0.12s ease',
                    minHeight: 52,
                  }}
                >
                  <div style={{
                    fontSize: 14, fontWeight: isToday || isSelected ? 700 : 500,
                    color: isSelected ? '#fff' : '#111827',
                  }}>{day}</div>
                  {hasSlots && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 4 }}>
                      {daySlots.slice(0, 3).map((s, si) => (
                        <div key={si} style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? '#fff' : s.isAvailable ? '#10b981' : '#ff3e48' }} />
                      ))}
                      {daySlots.length > 3 && <span style={{ fontSize: 8, color: isSelected ? '#fff' : '#9ca3af' }}>+{daySlots.length - 3}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Selected date slots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedDate ? (
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <button type="button" onClick={() => openModal(selectedDate)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 8, background: '#ff3e48', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  <Plus size={14} /> Add Slots
                </button>
              </div>

              {selectedSlots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>
                  No slots for this date. Click "Add Slots" to set availability.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedSlots.map(slot => (
                    <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fafaf8', borderRadius: 10, borderLeft: `3px solid ${slot.isAvailable ? '#10b981' : '#ff3e48'}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                          {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                          {slot.type} · {Number(slot.price) > 0 ? `₹${Number(slot.price).toFixed(0)}` : 'Free'}
                          {!slot.isAvailable && <span style={{ color: '#ff3e48', fontWeight: 600 }}> · Booked</span>}
                        </div>
                      </div>
                      <button type="button" onClick={() => handleDeleteSlot(slot.id)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #fecaca', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ff3e48' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ ...card, textAlign: 'center', padding: '40px 24px', color: '#9ca3af' }}>
              <Calendar size={28} style={{ marginBottom: 10, opacity: 0.4 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', margin: '0 0 4px' }}>Select a date</p>
              <p style={{ fontSize: 12, margin: 0 }}>Click any date on the calendar to view or add time slots</p>
            </div>
          )}

          {/* Insight card */}
          <div style={{ background: 'linear-gradient(135deg, #ff3e48 0%, #ff6b6b 100%)', borderRadius: 16, padding: 20, color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Sparkles size={14} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Insight</span>
            </div>
            <p style={{ fontSize: 13, margin: 0, opacity: 0.95, lineHeight: 1.5 }}>
              {stats.pendingRequests > 0
                ? `You have ${stats.pendingRequests} pending request${stats.pendingRequests > 1 ? 's' : ''} waiting below.`
                : stats.totalSlots === 0
                ? 'Click any date to add your first time slot.'
                : `You have ${stats.totalSlots} slot${stats.totalSlots > 1 ? 's' : ''} set up. Share your profile to get bookings!`}
            </p>
          </div>
        </div>
      </div>

      {/* Booking Requests */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Booking Requests</h3>
          {requests.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: '#ff3e48', padding: '2px 10px', borderRadius: 6 }}>{requests.length} NEW</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {requests.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>No pending requests</div>
          )}
          {requests.map((req) => (
            <div key={req.id} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff3e48', fontSize: 13, fontWeight: 700 }}>
                  {(req.user?.name || 'U').split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{req.user?.name || 'User'}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    {req.slot ? `${new Date(req.slot.startTime).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at ${new Date(req.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : req.type || 'Consultation'}
                  </div>
                </div>
              </div>
              {req.message && <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, marginBottom: 14, fontStyle: 'italic' }}>"{req.message}"</p>}
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Meeting link (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={meetingLinks[req.id] || ''}
                  onChange={(e) => setMeetingLinks(prev => ({ ...prev, [req.id]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ede8e3', fontSize: 12, outline: 'none', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => handleAccept(req.id, req.user?.name)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#ff3e48', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Accept</button>
                <button type="button" onClick={() => handleDecline(req.id, req.user?.name)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, border: '1px solid #ede8e3', cursor: 'pointer' }}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmed Bookings */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Confirmed Bookings</h3>
          {confirmedBookings.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: '#10b981', padding: '2px 10px', borderRadius: 6 }}>{confirmedBookings.length}</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {confirmedBookings.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>No confirmed bookings yet</div>
          )}
          {confirmedBookings.map((req) => (
            <div key={req.id} style={{ ...card, borderLeft: '3px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: 13, fontWeight: 700 }}>
                  {(req.user?.name || 'U').split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{req.user?.name || 'User'}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    {req.slot ? `${new Date(req.slot.startTime).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at ${new Date(req.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Scheduled'}
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', background: '#ecfdf5', padding: '3px 10px', borderRadius: 6 }}>Confirmed</span>
              </div>
              {req.message && <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, fontStyle: 'italic', margin: '0 0 10px' }}>"{req.message}"</p>}

              {/* Meeting link section */}
              {editingLinks[req.id] !== undefined ? (
                <div>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={editingLinks[req.id]}
                    onChange={(e) => setEditingLinks(prev => ({ ...prev, [req.id]: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ede8e3', fontSize: 12, outline: 'none', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => handleSaveLink(req.id)} style={{ padding: '6px 14px', borderRadius: 6, background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Save</button>
                    <button type="button" onClick={() => setEditingLinks(prev => { const n = { ...prev }; delete n[req.id]; return n; })} style={{ padding: '6px 14px', borderRadius: 6, background: '#fff', color: '#6b7280', fontSize: 11, fontWeight: 600, border: '1px solid #ede8e3', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : req.meetingLink ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <a
                    href={req.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Open Meeting →
                  </a>
                  <button type="button" onClick={() => setEditingLinks(prev => ({ ...prev, [req.id]: req.meetingLink || '' }))} style={{ fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Edit</button>
                </div>
              ) : (
                <button type="button" onClick={() => setEditingLinks(prev => ({ ...prev, [req.id]: '' }))} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#3b82f6', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  + Add Meeting Link
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ==================== */}
      {/* ADD SLOTS MODAL */}
      {/* ==================== */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: '#fff', borderRadius: 24, width: 420, maxWidth: '92vw', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>

            {/* Header */}
            <div style={{ padding: '24px 28px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Set Availability</h3>
                  <p style={{ fontSize: 13, color: '#9ca3af', margin: '6px 0 0' }}>
                    {new Date(modalDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <button type="button" onClick={() => setShowModal(false)} style={{ width: 32, height: 32, borderRadius: 8, background: '#f3f4f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}><X size={16} /></button>
              </div>
            </div>

            {/* Slots */}
            <div style={{ padding: '20px 28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {timeSlots.map((ts, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Time */}
                    <div style={{ flex: 1 }}>
                      <input type="time" value={ts.startTime} onChange={(e) => updateTimeSlot(idx, 'startTime', e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #ede8e3', fontSize: 14, outline: 'none', fontFamily: 'inherit', colorScheme: 'light', background: '#fafaf8' }} />
                    </div>
                    {/* Type */}
                    <div style={{ width: 120 }}>
                      <select value={ts.type} onChange={(e) => updateTimeSlot(idx, 'type', e.target.value)}
                        style={{ width: '100%', padding: '10px 8px', borderRadius: 10, border: '1px solid #ede8e3', fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'pointer', background: '#fafaf8', color: '#374151' }}>
                        {SLOT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select>
                    </div>
                    {/* Price */}
                    <div style={{ width: 80 }}>
                      <input type="number" value={ts.price} onChange={(e) => updateTimeSlot(idx, 'price', e.target.value)} placeholder="Free"
                        style={{ width: '100%', padding: '10px 10px', borderRadius: 10, border: '1px solid #ede8e3', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fafaf8', textAlign: 'center' }} />
                    </div>
                    {/* Remove */}
                    <button type="button" onClick={() => removeTimeSlotRow(idx)} disabled={timeSlots.length <= 1}
                      style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: timeSlots.length <= 1 ? 'transparent' : '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: timeSlots.length <= 1 ? 'default' : 'pointer', color: '#ff3e48', opacity: timeSlots.length <= 1 ? 0.2 : 1, flexShrink: 0 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add more */}
              <button type="button" onClick={addTimeSlotRow}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 0', borderRadius: 10, border: 'none', background: 'none', color: '#ff3e48', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 12 }}>
                <Plus size={15} /> Add another slot
              </button>
            </div>

            {/* Footer */}
            <div style={{ padding: '0 28px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
                {timeSlots.length} slot{timeSlots.length > 1 ? 's' : ''} · 1 hour each · {timeSlots.map(ts => ts.startTime).filter(Boolean).join(', ')}
              </div>
              <button type="button" onClick={handleSaveSlots} disabled={slotSaving}
                style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: '#ff3e48', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: slotSaving ? 'not-allowed' : 'pointer' }}>
                {slotSaving ? 'Creating...' : `Save ${timeSlots.length} Slot${timeSlots.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorBookings;
