import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, TextInput, Modal, ScrollView } from 'react-native';
import { Briefcase, Send, Users, Search, PlusCircle, Edit, Trash, X } from 'lucide-react-native';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function JobsScreen() {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [applyingObj, setApplyingObj] = useState({});
    
    const [searchTerm, setSearchTerm] = useState('');

    // Admin Creation State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', description: '', company: '', type: 'FULL_TIME', requirements: '' });

    // Edit State
    const [editingJobId, setEditingJobId] = useState(null);
    const [editJobData, setEditJobData] = useState({ title: '', description: '', company: '' });

    // Applicants Modal State
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    const [applicantsList, setApplicantsList] = useState([]);
    const [activeJobTitle, setActiveJobTitle] = useState('');

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs');
            setJobs(res.data);
        } catch (err) {
            console.error("Failed to fetch jobs", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    const handleApply = async (jobId) => {
        if (user?.role !== 'STUDENT') {
            Alert.alert("Access Denied", "Only students can apply for jobs natively.");
            return;
        }

        setApplyingObj(prev => ({ ...prev, [jobId]: true }));
        try {
            await api.post(`/jobs/${jobId}/apply`);
            Alert.alert("Success", "You have successfully applied for this job!");
            fetchJobs();
        } catch (err) {
            Alert.alert("Application Failed", err.response?.data?.message || 'Failed to apply');
        } finally {
            setApplyingObj(prev => ({ ...prev, [jobId]: false }));
        }
    };

    const handleCreateJob = async () => {
        if (!newJob.title || !newJob.company || !newJob.description) {
            Alert.alert("Error", "Please fill out all fields");
            return;
        }
        try {
            await api.post('/jobs', newJob);
            setShowCreateModal(false);
            setNewJob({ title: '', description: '', company: '', type: 'FULL_TIME', requirements: '' });
            fetchJobs();
            Alert.alert("Success", "Job posted successfully");
        } catch (err) {
            Alert.alert("Error", err.response?.data?.message || 'Failed to create job');
        }
    };

    const handleDeleteJob = async (jobId) => {
        Alert.alert(
            "Delete Job",
            "Are you sure you want to delete this job posting?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/jobs/${jobId}`);
                            fetchJobs();
                        } catch (err) {
                            Alert.alert("Error", "Only Admins or Alumni who posted this can delete it.");
                        }
                    }
                }
            ]
        );
    };

    const submitEditJob = async (jobId) => {
        if (!editJobData.title || !editJobData.company || !editJobData.description) return;
        try {
            await api.put(`/jobs/${jobId}`, editJobData);
            setEditingJobId(null);
            fetchJobs();
        } catch (err) {
            Alert.alert("Error", "Failed to update job posting.");
        }
    };

    const handleViewApplicants = async (jobId, title) => {
        try {
            const res = await api.get(`/jobs/${jobId}/applicants`);
            setApplicantsList(res.data);
            setActiveJobTitle(title);
            setShowApplicantsModal(true);
        } catch (err) {
            Alert.alert("Error", err.response?.data?.message || 'Failed to fetch applicants');
        }
    };

    const filteredJobs = jobs.filter(j => 
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (j.company && j.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const renderJobItem = ({ item }) => (
        <View style={styles.card}>
            {editingJobId === item.id ? (
                <View style={styles.editForm}>
                    <TextInput 
                        style={styles.input} 
                        value={editJobData.title} 
                        onChangeText={(text) => setEditJobData({...editJobData, title: text})} 
                        placeholder="Job Title" 
                        placeholderTextColor="#9ca3af"
                    />
                    <TextInput 
                        style={styles.input} 
                        value={editJobData.company} 
                        onChangeText={(text) => setEditJobData({...editJobData, company: text})} 
                        placeholder="Company" 
                        placeholderTextColor="#9ca3af"
                    />
                    <TextInput 
                        style={[styles.input, { height: 80 }]} 
                        value={editJobData.description} 
                        onChangeText={(text) => setEditJobData({...editJobData, description: text})} 
                        placeholder="Description" 
                        placeholderTextColor="#9ca3af"
                        multiline
                    />
                    <View style={styles.editActionRow}>
                        <TouchableOpacity style={styles.saveBtn} onPress={() => submitEditJob(item.id)}>
                            <Text style={styles.saveBtnText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingJobId(null)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.jobTitle}>{item.title}</Text>
                            <View style={styles.companyRow}>
                                <Briefcase size={14} color="#9ca3af" />
                                <Text style={styles.companyText}>{item.company}</Text>
                            </View>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
                    </View>

                    <Text style={styles.description}>{item.description}</Text>

                    <View style={styles.footerRow}>
                        <View style={styles.applicantRow}>
                            <Users size={14} color="#6366f1" />
                            <Text style={styles.applicantText}>{item.applicationCount || 0} Applicants</Text>
                        </View>
                        
                        {(user?.role === 'ADMIN' || user?.role === 'ALUMNI') && (
                            <View style={styles.adminControls}>
                                <TouchableOpacity 
                                    style={styles.iconBtn} 
                                    onPress={() => handleViewApplicants(item.id, item.title)}>
                                    <Text style={styles.viewAppText}>View</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.iconBtn}
                                    onPress={() => {
                                        setEditingJobId(item.id);
                                        setEditJobData({ title: item.title, company: item.company, description: item.description });
                                    }}>
                                    <Edit size={16} color="#9ca3af" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDeleteJob(item.id)}>
                                    <Trash size={16} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity 
                        style={[styles.applyButton, user?.role !== 'STUDENT' && styles.applyButtonDisabled]} 
                        onPress={() => handleApply(item.id)}
                        disabled={user?.role !== 'STUDENT' || applyingObj[item.id]}
                    >
                        {applyingObj[item.id] ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Send size={16} color={user?.role === 'STUDENT' ? '#fff' : '#64748b'} style={{ marginRight: 8 }} />
                                <Text style={[styles.applyButtonText, user?.role !== 'STUDENT' && styles.applyButtonTextDisabled]}>
                                    {user?.role === 'STUDENT' ? 'Apply Now' : 'Students Only'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </>
            )}
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header & Search */}
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Search size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search jobs or companies..."
                        placeholderTextColor="#64748b"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                </View>
                {(user?.role === 'ADMIN' || user?.role === 'ALUMNI') && (
                    <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
                        <PlusCircle size={24} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredJobs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderJobItem}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
                ListEmptyComponent={<Text style={styles.emptyText}>No job postings match your search.</Text>}
            />

            {/* Create Job Modal */}
            <Modal visible={showCreateModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Post New Job</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <X size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.label}>Job Title</Text>
                            <TextInput 
                                style={styles.input} 
                                value={newJob.title} 
                                onChangeText={t => setNewJob({...newJob, title: t})} 
                                placeholderTextColor="#64748b"
                            />
                            
                            <Text style={styles.label}>Company</Text>
                            <TextInput 
                                style={styles.input} 
                                value={newJob.company} 
                                onChangeText={t => setNewJob({...newJob, company: t})} 
                                placeholderTextColor="#64748b"
                            />

                            <Text style={styles.label}>Description</Text>
                            <TextInput 
                                style={[styles.input, { height: 100 }]} 
                                value={newJob.description} 
                                onChangeText={t => setNewJob({...newJob, description: t})} 
                                multiline
                                textAlignVertical="top"
                            />

                            <TouchableOpacity style={styles.submitModalBtn} onPress={handleCreateJob}>
                                <Text style={styles.submitModalBtnText}>Create Job</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* View Applicants Modal */}
            <Modal visible={showApplicantsModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Applicants List</Text>
                                <Text style={styles.modalSubtitle}>{activeJobTitle}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowApplicantsModal(false)}>
                                <X size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            {applicantsList.length === 0 ? (
                                <Text style={styles.emptyText}>No one has applied yet.</Text>
                            ) : (
                                applicantsList.map(applicant => (
                                    <View key={applicant.id} style={styles.applicantItem}>
                                        <View style={styles.applicantAvatar}>
                                            <Text style={styles.applicantAvatarText}>{applicant.name.charAt(0)}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.applicantName}>{applicant.name}</Text>
                                            <Text style={styles.applicantEmail}>{applicant.email}</Text>
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
        padding: 16,
        paddingBottom: 0,
        gap: 12,
        alignItems: 'center',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(30, 41, 59, 1)',
        borderRadius: 8,
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, color: '#fff', fontSize: 15 },
    createBtn: {
        backgroundColor: '#4f46e5',
        width: 44,
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
    jobTitle: { color: '#6366f1', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    companyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    companyText: { color: '#9ca3af', fontSize: 13 },
    badge: { backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#e2e8f0', fontSize: 11 },
    description: { color: '#d1d5db', fontSize: 14, lineHeight: 20, marginBottom: 16 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    applicantRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    applicantText: { color: '#6366f1', fontSize: 13, fontWeight: '600' },
    adminControls: { flexDirection: 'row', gap: 8 },
    iconBtn: { padding: 6, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 6 },
    viewAppText: { color: '#38bdf8', fontSize: 12, fontWeight: 'bold' },
    applyButton: {
        flexDirection: 'row',
        backgroundColor: '#4f46e5',
        padding: 14,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonDisabled: { backgroundColor: 'rgba(30, 41, 59, 1)', borderWidth: 1, borderColor: '#334155' },
    applyButtonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
    applyButtonTextDisabled: { color: '#64748b' },
    emptyText: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 16 },
    
    // Forms
    editForm: { gap: 8 },
    input: {
        backgroundColor: 'rgba(15, 23, 42, 1)',
        color: '#fff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 8,
    },
    editActionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    saveBtn: { flex: 1, backgroundColor: '#4f46e5', padding: 12, borderRadius: 8, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: 'bold' },
    cancelBtn: { flex: 1, backgroundColor: '#334155', padding: 12, borderRadius: 8, alignItems: 'center' },
    cancelBtnText: { color: '#cbd5e1', fontWeight: 'bold' },

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
    submitModalBtn: {
        backgroundColor: '#4f46e5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 40, // Safe area
    },
    submitModalBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    
    applicantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 12,
        marginBottom: 8,
    },
    applicantAvatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#38bdf8',
        justifyContent: 'center', alignItems: 'center'
    },
    applicantAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    applicantName: { color: '#fff', fontSize: 15, fontWeight: '600' },
    applicantEmail: { color: '#9ca3af', fontSize: 13 },
});
