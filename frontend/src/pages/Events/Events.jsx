import React, { useState, useEffect, useContext } from 'react';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import { Calendar as CalIcon, MapPin, Users, CheckCircle, PlusCircle, Trash2, Edit, List } from 'lucide-react';

const Events = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rsvpStatus, setRsvpStatus] = useState({});

    // Admin Creation State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', location: '', date: '' });

    // Admin Edit/Delete/Attendee State
    const [editingEvent, setEditingEvent] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [attendeesList, setAttendeesList] = useState([]);
    const [showAttendeesModal, setShowAttendeesModal] = useState(false);
    const [activeEventTitle, setActiveEventTitle] = useState('');

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data);
        } catch (err) {
            console.error("Failed to fetch events", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleRSVP = async (eventId, status) => {
        try {
            await api.post(`/events/${eventId}/rsvp?status=${status}`);
            setRsvpStatus(prev => ({ ...prev, [eventId]: { success: true, msg: `RSVP updated to ${status}` } }));
            fetchEvents();
        } catch (err) {
            setRsvpStatus(prev => ({ ...prev, [eventId]: { success: false, msg: err.response?.data?.message || 'Failed to RSVP' } }));
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            // Append seconds if datetime-local only provides up to minutes
            const formattedDate = newEvent.date.length === 16 ? `${newEvent.date}:00` : newEvent.date;
            await api.post('/events', { 
                title: newEvent.title, 
                description: newEvent.description, 
                location: newEvent.location, 
                eventDate: formattedDate 
            });
            setShowCreateModal(false);
            setNewEvent({ title: '', description: '', location: '', date: '' });
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create event');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
        try {
            await api.delete(`/events/${eventId}`);
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete event');
        }
    };

    const openEditModal = (evt) => {
        // format date for datetime-local input (YYYY-MM-DDTHH:mm)
        const formattedDate = evt.eventDate ? evt.eventDate.substring(0, 16) : '';
        setEditingEvent({ ...evt, date: formattedDate });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const formattedDate = editingEvent.date.length === 16 ? `${editingEvent.date}:00` : editingEvent.date;
            await api.put(`/events/${editingEvent.id}`, { 
                title: editingEvent.title, 
                description: editingEvent.description, 
                location: editingEvent.location, 
                eventDate: formattedDate 
            });
            setShowEditModal(false);
            setEditingEvent(null);
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update event');
        }
    };

    const handleViewAttendees = async (eventId, title) => {
        try {
            const res = await api.get(`/events/${eventId}/attendees`);
            setAttendeesList(res.data);
            setActiveEventTitle(title);
            setShowAttendeesModal(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to fetch attendees');
        }
    };

    if (loading) return <div>Loading events...</div>;

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <h1>University Events</h1>
                {user?.role === 'ADMIN' && (
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ width: 'auto' }}>
                        <PlusCircle size={20} /> Schedule Event
                    </button>
                )}
            </div>

            <div className="grid-2">
                {events.length === 0 ? (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No upcoming events currently scheduled.</p>
                ) : events.map(evt => (
                    <div key={evt.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, color: 'var(--accent-color)', marginBottom: '0.5rem' }}>{evt.title}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CalIcon size={16} /> {new Date(evt.eventDate).toLocaleString()}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={16} /> {evt.location || 'TBA'}
                                </div>
                            </div>
                            <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>{evt.description}</p>
                        </div>

                        {rsvpStatus[evt.id] && (
                             <div style={{ padding: '0.5rem', textAlign: 'center', borderRadius: 'var(--radius-md)', background: rsvpStatus[evt.id].success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: rsvpStatus[evt.id].success ? 'var(--success-color)' : 'var(--danger-color)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                {rsvpStatus[evt.id].msg}
                             </div>
                        )}

                        <div className="flex-between" style={{ gap: '1rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                            {user?.role === 'ADMIN' ? (
                                <>
                                    <button className="btn btn-secondary" onClick={() => handleViewAttendees(evt.id, evt.title)} style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}>
                                        <List size={16} /> Attendees
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => openEditModal(evt)} style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}>
                                        <Edit size={16} /> Edit
                                    </button>
                                    <button className="btn btn-primary" onClick={() => handleDeleteEvent(evt.id)} style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)' }}>
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="btn btn-secondary" onClick={() => handleRSVP(evt.id, 'GOING')} style={{ flex: 1, color: evt.currentUserRsvp === 'GOING' ? '#fff' : 'var(--success-color)', background: evt.currentUserRsvp === 'GOING' ? 'var(--success-color)' : 'transparent', borderColor: 'var(--success-color)' }}>
                                        <CheckCircle size={18} /> {evt.currentUserRsvp === 'GOING' ? 'Attending' : 'Going'}
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => handleRSVP(evt.id, 'NOT_GOING')} style={{ flex: 1, color: evt.currentUserRsvp === 'NOT_GOING' ? '#fff' : 'var(--danger-color)', background: evt.currentUserRsvp === 'NOT_GOING' ? 'var(--danger-color)' : 'transparent', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                                        Decline
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Admin Event Creation Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Schedule New Event</h2>
                        <form onSubmit={handleCreateEvent}>
                            <div className="form-group">
                                <label className="form-label">Event Title</label>
                                <input type="text" className="form-input" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input type="text" className="form-input" required value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date & Time</label>
                                <input type="datetime-local" className="form-input" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input" required rows="3" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}></textarea>
                            </div>
                            <div className="flex-between" style={{ marginTop: '2rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)} style={{ width: '45%' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ width: '45%' }}>Create Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Admin Edit Modal */}
            {showEditModal && editingEvent && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Edit Event</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label className="form-label">Event Title</label>
                                <input type="text" className="form-input" required value={editingEvent.title} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input type="text" className="form-input" required value={editingEvent.location} onChange={e => setEditingEvent({...editingEvent, location: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date & Time</label>
                                <input type="datetime-local" className="form-input" required value={editingEvent.date} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input" required rows="3" value={editingEvent.description} onChange={e => setEditingEvent({...editingEvent, description: e.target.value})}></textarea>
                            </div>
                            <div className="flex-between" style={{ marginTop: '2rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)} style={{ width: '45%' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ width: '45%' }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Admin Attendees Modal */}
            {showAttendeesModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Attendees List</h2>
                            <button className="btn btn-secondary" onClick={() => setShowAttendeesModal(false)} style={{ padding: '0.25rem 0.5rem' }}>✕</button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{activeEventTitle} ({attendeesList.length} going)</p>
                        
                        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {attendeesList.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No one has RSVP'd yet.</p>
                            ) : (
                                attendeesList.map(attendee => (
                                    <div key={attendee.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {attendee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{attendee.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{attendee.role}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;
