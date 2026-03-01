import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, ScrollView, TextInput } from 'react-native';
import { Calendar, MapPin, PlusCircle, Edit, Trash, List, X, CheckCircle } from 'lucide-react-native';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function EventsScreen() {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [rsvpLoading, setRsvpLoading] = useState({});

    // Admin Creation State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', location: '', date: '' });

    // Admin Edit State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    // Attendees Modal State
    const [showAttendeesModal, setShowAttendeesModal] = useState(false);
    const [attendeesList, setAttendeesList] = useState([]);
    const [activeEventTitle, setActiveEventTitle] = useState('');

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data);
        } catch (err) {
            console.error("Failed to fetch events", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchEvents();
    };

    const handleRSVP = async (eventId, status) => {
        if (user?.role === 'ADMIN') return; // Admins don't RSVP natively via these buttons
        
        setRsvpLoading(prev => ({ ...prev, [eventId]: true }));
        try {
            await api.post(`/events/${eventId}/rsvp`, null, { params: { status } });
            setEvents(events.map(ev => 
                ev.id === eventId ? { ...ev, currentUserRsvp: status } : ev
            ));
        } catch (err) {
            Alert.alert("RSVP Failed", err.response?.data?.message || 'Could not update status');
        } finally {
            setRsvpLoading(prev => ({ ...prev, [eventId]: false }));
        }
    };

    // --- Admin Event Actions ---
    const handleCreateEvent = async () => {
        if (!newEvent.title || !newEvent.location || !newEvent.date) {
            Alert.alert("Error", "Title, Location, and Date are required");
            return;
        }

        try {
            // Simple string conditioning to ensure Spring Boot parses it correctly
            let formattedDate = newEvent.date.trim();
            if (formattedDate.includes(' ')) formattedDate = formattedDate.replace(' ', 'T');
            if (formattedDate.length === 16) formattedDate += ':00'; // Append seconds if missing YYYY-MM-DDTHH:mm:00

            await api.post('/events', { 
                title: newEvent.title, 
                description: newEvent.description, 
                location: newEvent.location, 
                eventDate: formattedDate 
            });
            setShowCreateModal(false);
            setNewEvent({ title: '', description: '', location: '', date: '' });
            fetchEvents();
            Alert.alert("Success", "Event scheduled successfully");
        } catch (err) {
            Alert.alert("Error", err.response?.data?.message || 'Failed to create event');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        Alert.alert(
            "Delete Event",
            "This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/events/${eventId}`);
                            fetchEvents();
                        } catch (err) {
                            Alert.alert("Error", "Failed to delete event");
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (evt) => {
        const formattedDate = evt.eventDate ? evt.eventDate.substring(0, 16) : '';
        setEditingEvent({ ...evt, date: formattedDate });
        setShowEditModal(true);
    };

    const handleEditSubmit = async () => {
        if (!editingEvent.title || !editingEvent.location) return;
        try {
            let formattedDate = editingEvent.date;
            if (formattedDate.includes(' ')) formattedDate = formattedDate.replace(' ', 'T');
            if (formattedDate.length === 16) formattedDate += ':00';

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
            Alert.alert("Error", 'Failed to update event');
        }
    };

    const handleViewAttendees = async (eventId, title) => {
        try {
            const res = await api.get(`/events/${eventId}/attendees`);
            setAttendeesList(res.data);
            setActiveEventTitle(title);
            setShowAttendeesModal(true);
        } catch (err) {
            Alert.alert("Error", 'Failed to fetch attendees');
        }
    };

    const renderEventItem = ({ item }) => {
        const isGoing = item.currentUserRsvp === 'GOING';
        const isDeclined = item.currentUserRsvp === 'NOT_GOING';
        const isLoading = rsvpLoading[item.id];

        let formattedDate = 'TBD';
        if (item.eventDate) {
           formattedDate = new Date(item.eventDate).toLocaleDateString() + ' ' + new Date(item.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.type || 'Event'}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Calendar size={16} color="#9ca3af" />
                    <Text style={styles.infoText}>{formattedDate}</Text>
                </View>
                
                <View style={styles.infoRow}>
                    <MapPin size={16} color="#9ca3af" />
                    <Text style={styles.infoText}>{item.location}</Text>
                </View>

                <Text style={styles.description}>{item.description}</Text>

                <View style={styles.actionContainer}>
                    {user?.role === 'ADMIN' ? (
                        <View style={styles.adminActionRow}>
                            <TouchableOpacity style={styles.adminBtn} onPress={() => handleViewAttendees(item.id, item.title)}>
                                <List size={16} color="#cbd5e1" style={styles.btnIcon} />
                                <Text style={styles.adminBtnText}>Attendees</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.adminBtn} onPress={() => openEditModal(item)}>
                                <Edit size={16} color="#cbd5e1" style={styles.btnIcon} />
                                <Text style={styles.adminBtnText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.adminBtn, styles.deleteBtn]} onPress={() => handleDeleteEvent(item.id)}>
                                <Trash size={16} color="#ef4444" style={styles.btnIcon} />
                                <Text style={styles.deleteBtnText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.rsvpContainer}>
                            <Text style={styles.rsvpLabel}>Your Status:</Text>
                            {isLoading ? (
                                <ActivityIndicator color="#6366f1" />
                            ) : (
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity 
                                        style={[styles.rsvpButton, isGoing && styles.goingActive]}
                                        onPress={() => handleRSVP(item.id, 'GOING')}
                                    >
                                        {isGoing && <CheckCircle size={16} color="#fff" style={{marginRight: 6}} />}
                                        <Text style={[styles.rsvpButtonText, isGoing && styles.activeText]}>
                                            {isGoing ? 'Attending' : 'Going'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.rsvpButton, isDeclined && styles.declineActive]}
                                        onPress={() => handleRSVP(item.id, 'NOT_GOING')}
                                    >
                                        <Text style={[styles.rsvpButtonText, isDeclined && styles.activeText]}>Decline</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>University Events</Text>
                {user?.role === 'ADMIN' && (
                    <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
                        <PlusCircle size={20} color="#fff" style={{marginRight: 8}} />
                        <Text style={styles.createBtnText}>Schedule Event</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={events}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEventItem}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
                ListEmptyComponent={<Text style={styles.emptyText}>No upcoming events currently scheduled.</Text>}
            />

            {/* Create Event Modal */}
            <Modal visible={showCreateModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Schedule Event</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <X size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.label}>Event Title</Text>
                            <TextInput 
                                style={styles.input} 
                                value={newEvent.title} 
                                onChangeText={t => setNewEvent({...newEvent, title: t})} 
                            />
                            
                            <Text style={styles.label}>Location</Text>
                            <TextInput 
                                style={styles.input} 
                                value={newEvent.location} 
                                onChangeText={t => setNewEvent({...newEvent, location: t})} 
                            />

                            <Text style={styles.label}>Date & Time (YYYY-MM-DD HH:mm)</Text>
                            <TextInput 
                                style={styles.input} 
                                value={newEvent.date} 
                                onChangeText={t => setNewEvent({...newEvent, date: t})} 
                                placeholder="2025-01-01 10:30"
                                placeholderTextColor="#475569"
                            />

                            <Text style={styles.label}>Description</Text>
                            <TextInput 
                                style={[styles.input, { height: 80 }]} 
                                value={newEvent.description} 
                                onChangeText={t => setNewEvent({...newEvent, description: t})} 
                                multiline
                                textAlignVertical="top"
                            />

                            <TouchableOpacity style={styles.submitModalBtn} onPress={handleCreateEvent}>
                                <Text style={styles.submitModalBtnText}>Create Event</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Edit Event Modal */}
            <Modal visible={showEditModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Event</Text>
                            <TouchableOpacity onPress={() => { setShowEditModal(false); setEditingEvent(null); }}>
                                <X size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.label}>Event Title</Text>
                            <TextInput 
                                style={styles.input} 
                                value={editingEvent?.title} 
                                onChangeText={t => setEditingEvent({...editingEvent, title: t})} 
                            />
                            
                            <Text style={styles.label}>Location</Text>
                            <TextInput 
                                style={styles.input} 
                                value={editingEvent?.location} 
                                onChangeText={t => setEditingEvent({...editingEvent, location: t})} 
                            />

                            <Text style={styles.label}>Date & Time</Text>
                            <TextInput 
                                style={styles.input} 
                                value={editingEvent?.date} 
                                onChangeText={t => setEditingEvent({...editingEvent, date: t})} 
                            />

                            <Text style={styles.label}>Description</Text>
                            <TextInput 
                                style={[styles.input, { height: 80 }]} 
                                value={editingEvent?.description} 
                                onChangeText={t => setEditingEvent({...editingEvent, description: t})} 
                                multiline
                                textAlignVertical="top"
                            />

                            <TouchableOpacity style={styles.submitModalBtn} onPress={handleEditSubmit}>
                                <Text style={styles.submitModalBtnText}>Save Changes</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* View Attendees Modal */}
            <Modal visible={showAttendeesModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Attendees List</Text>
                                <Text style={styles.modalSubtitle}>{activeEventTitle}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowAttendeesModal(false)}>
                                <X size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            {attendeesList.length === 0 ? (
                                <Text style={styles.emptyText}>No one has RSVP'd yet.</Text>
                            ) : (
                                attendeesList.map(attendee => (
                                    <View key={attendee.id} style={styles.attendeeItem}>
                                        <View style={styles.attendeeAvatar}>
                                            <Text style={styles.attendeeAvatarText}>{attendee.name.charAt(0)}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.attendeeName}>{attendee.name}</Text>
                                            <Text style={styles.attendeeRole}>{attendee.role}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    createBtn: {
        flexDirection: 'row',
        backgroundColor: '#4f46e5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    listContainer: { padding: 16, paddingBottom: 40 },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    eventTitle: { color: '#38bdf8', fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 8 },
    badge: { backgroundColor: 'rgba(99, 102, 241, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#818cf8', fontSize: 12, fontWeight: 'bold' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    infoText: { color: '#9ca3af', fontSize: 14 },
    description: { color: '#d1d5db', fontSize: 14, lineHeight: 20, marginVertical: 12 },
    
    actionContainer: {
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    rsvpContainer: { width: '100%' },
    rsvpLabel: { color: '#9ca3af', fontSize: 12, marginBottom: 8 },
    buttonRow: { flexDirection: 'row', gap: 12 },
    rsvpButton: {
        flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155'
    },
    rsvpButtonText: { color: '#9ca3af', fontWeight: 'bold' },
    goingActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
    declineActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
    activeText: { color: '#ffffff' },

    adminActionRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
    adminBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 10, borderRadius: 8 },
    btnIcon: { marginRight: 6 },
    adminBtnText: { color: '#cbd5e1', fontSize: 13, fontWeight: 'bold' },
    deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    deleteBtnText: { color: '#ef4444', fontSize: 13, fontWeight: 'bold' },

    emptyText: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 16 },

    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1e293b',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    modalSubtitle: { color: '#9ca3af', fontSize: 13, marginTop: 4 },
    modalBody: { flex: 1 },
    label: { color: '#e2e8f0', fontSize: 14, marginBottom: 6, fontWeight: '500' },
    input: {
        backgroundColor: 'rgba(15, 23, 42, 1)',
        color: '#fff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
    },
    submitModalBtn: {
        backgroundColor: '#4f46e5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 40,
    },
    submitModalBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    attendeeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 12,
        marginBottom: 8,
    },
    attendeeAvatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#10b981',
        justifyContent: 'center', alignItems: 'center'
    },
    attendeeAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    attendeeName: { color: '#fff', fontSize: 15, fontWeight: '600' },
    attendeeRole: { color: '#9ca3af', fontSize: 13 },
});
