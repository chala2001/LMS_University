import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, ScrollView, TextInput } from 'react-native';
import { BookOpen, Users, PlusCircle, Edit, Trash, X, ChevronRight } from 'lucide-react-native';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function ResearchScreen() {
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', description: '', status: 'ACTIVE' });
    
    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editProjectData, setEditProjectData] = useState({ title: '', description: '', status: 'ACTIVE' });

    const fetchProjects = async () => {
        try {
            const res = await api.get('/research');
            setProjects(res.data);
        } catch (err) {
            console.error("Failed to fetch research projects", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProjects();
    };

    const handleCreateProject = async () => {
        if (!newProject.title || !newProject.description) {
            Alert.alert("Error", "Title and description are required.");
            return;
        }

        try {
            await api.post('/research', { 
                title: newProject.title, 
                description: newProject.description,
                status: newProject.status
            });
            setShowCreateModal(false);
            setNewProject({ title: '', description: '', status: 'ACTIVE' });
            fetchProjects();
            Alert.alert("Success", "Project proposed successfully");
        } catch (err) {
            Alert.alert("Error", err.response?.data?.message || 'Failed to create project');
        }
    };

    const handleJoinProject = async (projectId) => {
        try {
            await api.post(`/research/${projectId}/join`);
            Alert.alert("Success", "Successfully joined the research project!");
            fetchProjects();
        } catch (err) {
            Alert.alert("Error", err.response?.data?.message || 'Failed to join project');
        }
    };

    const submitEditProject = async () => {
        if (!editProjectData.title || !editProjectData.description) return;
        try {
            await api.put(`/research/${editingProjectId}`, {
                title: editProjectData.title, 
                description: editProjectData.description,
                status: editProjectData.status
            });
            setShowEditModal(false);
            setEditingProjectId(null);
            fetchProjects();
        } catch (err) {
            Alert.alert("Error", "Failed to update research project.");
        }
    };

    const handleDeleteProject = async (projectId) => {
        Alert.alert(
            "Delete Project",
            "Are you sure you want to delete this research project?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/research/${projectId}`);
                            fetchProjects();
                        } catch (err) {
                            Alert.alert("Error", "Only the creator can delete this project.");
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (proj) => {
        setEditingProjectId(proj.id);
        setEditProjectData({ title: proj.title, description: proj.description, status: proj.status || 'ACTIVE' });
        setShowEditModal(true);
    };

    const cycleStatus = (currentStatus, setStatusCallback) => {
        const statuses = ['ACTIVE', 'PLANNING', 'COMPLETED'];
        const idx = statuses.indexOf(currentStatus);
        const next = statuses[(idx + 1) % statuses.length];
        setStatusCallback(next);
    };

    const renderProjectItem = ({ item }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.projectTitle}>{item.title}</Text>
                        <View style={styles.authorRow}>
                            <BookOpen size={14} color="#9ca3af" />
                            <Text style={styles.authorText}>Research Initiative by {item.authorName}</Text>
                        </View>
                    </View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.status}</Text>
                    </View>
                </View>

                <Text style={styles.description}>{item.description}</Text>

                <View style={styles.teamContainer}>
                    <View style={styles.teamHeaderRow}>
                        <View style={styles.teamTitleRow}>
                            <Users size={16} color="#9ca3af" />
                            <Text style={styles.teamTitleText}>Research Team ({item.members?.length || 0})</Text>
                        </View>
                        
                        {(user?.name === item.authorName) && (
                            <View style={styles.adminActionRow}>
                                <TouchableOpacity style={styles.adminBtn} onPress={() => openEditModal(item)}>
                                    <Edit size={16} color="#9ca3af" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.adminBtn} onPress={() => handleDeleteProject(item.id)}>
                                    <Trash size={16} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.membersRow}>
                        {item.members?.length > 0 ? (
                            item.members.map((memberName, idx) => (
                                <View key={idx} style={styles.memberChip}>
                                    <Text style={styles.memberChipText}>{memberName}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noMembersText}>No members yet.</Text>
                        )}
                    </View>
                </View>

                <TouchableOpacity style={styles.joinButton} onPress={() => handleJoinProject(item.id)}>
                    <Text style={styles.joinButtonText}>Request to Join</Text>
                    <ChevronRight size={18} color="#38bdf8" />
                </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Research & Innovation</Text>
                <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
                    <PlusCircle size={20} color="#fff" style={{marginRight: 8}} />
                    <Text style={styles.createBtnText}>Propose Project</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={projects}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderProjectItem}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
                ListEmptyComponent={<Text style={styles.emptyText}>No research projects found.</Text>}
            />

            {/* Create Project Modal */}
            <Modal visible={showCreateModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Propose Research</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <X size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.label}>Project Title</Text>
                            <TextInput 
                                style={styles.input} 
                                value={newProject.title} 
                                onChangeText={t => setNewProject({...newProject, title: t})} 
                            />
                            
                            <Text style={styles.label}>Objective / Description</Text>
                            <TextInput 
                                style={[styles.input, { height: 100 }]} 
                                value={newProject.description} 
                                onChangeText={t => setNewProject({...newProject, description: t})} 
                                multiline
                                textAlignVertical="top"
                            />

                            <Text style={styles.label}>Status (Tap to change)</Text>
                            <TouchableOpacity style={styles.input} onPress={() => cycleStatus(newProject.status, (s) => setNewProject({...newProject, status: s}))}>
                                <Text style={{ color: '#fff' }}>{newProject.status}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.submitModalBtn} onPress={handleCreateProject}>
                                <Text style={styles.submitModalBtnText}>Submit Proposal</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Edit Project Modal */}
            <Modal visible={showEditModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Project</Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <X size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.label}>Project Title</Text>
                            <TextInput 
                                style={styles.input} 
                                value={editProjectData.title} 
                                onChangeText={t => setEditProjectData({...editProjectData, title: t})} 
                            />
                            
                            <Text style={styles.label}>Description</Text>
                            <TextInput 
                                style={[styles.input, { height: 100 }]} 
                                value={editProjectData.description} 
                                onChangeText={t => setEditProjectData({...editProjectData, description: t})} 
                                multiline
                                textAlignVertical="top"
                            />

                            <Text style={styles.label}>Status (Tap to change)</Text>
                            <TouchableOpacity style={styles.input} onPress={() => cycleStatus(editProjectData.status, (s) => setEditProjectData({...editProjectData, status: s}))}>
                                <Text style={{ color: '#fff' }}>{editProjectData.status}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.submitModalBtn} onPress={submitEditProject}>
                                <Text style={styles.submitModalBtnText}>Save Changes</Text>
                            </TouchableOpacity>
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
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
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
    projectTitle: { color: '#38bdf8', fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 8, marginBottom: 4 },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    authorText: { color: '#9ca3af', fontSize: 13 },
    badge: { backgroundColor: 'rgba(56, 189, 248, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#38bdf8', fontSize: 12, fontWeight: 'bold' },
    description: { color: '#d1d5db', fontSize: 14, lineHeight: 20, marginVertical: 12 },
    
    teamContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    teamHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    teamTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    teamTitleText: { color: '#9ca3af', fontSize: 13, fontWeight: 'bold' },
    adminActionRow: { flexDirection: 'row', gap: 8 },
    adminBtn: { padding: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6 },
    membersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    memberChip: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    memberChipText: { color: '#cbd5e1', fontSize: 12 },
    noMembersText: { color: '#64748b', fontSize: 12 },

    joinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.05)',
    },
    joinButtonText: { color: '#38bdf8', fontWeight: 'bold', marginRight: 4 },
    
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
});
