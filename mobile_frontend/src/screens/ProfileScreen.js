import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, Switch } from 'react-native';
import { User, Mail, Shield, LogOut, Key } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function ProfileScreen() {
    const { user, setUser, logout } = useContext(AuthContext);
    
    // Personal Info State
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [statusMsg, setStatusMsg] = useState(null);

    // Admin Panel State
    const [targetUserId, setTargetUserId] = useState('');
    const [newRole, setNewRole] = useState('STUDENT');
    const [adminStatusMsg, setAdminStatusMsg] = useState(null);

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: async () => await logout() }
            ]
        );
    };

    const handleUpdateProfile = async () => {
        try {
            const res = await api.put('/users/me', { name, password: password || null });
            setUser(res.data);
            setStatusMsg("Profile updated successfully!");
            setPassword('');
            setTimeout(() => setStatusMsg(null), 3000);
        } catch (error) {
            Alert.alert("Error", "Failed to update profile.");
        }
    };

    const cycleRole = () => {
        const roles = ['STUDENT', 'ALUMNI', 'ADMIN'];
        const idx = roles.indexOf(newRole);
        setNewRole(roles[(idx + 1) % roles.length]);
    };

    const handleRoleChange = async () => {
        if (!targetUserId) {
            Alert.alert("Error", "Target User ID is required.");
            return;
        }

        try {
            await api.put(`/users/${targetUserId}/role?role=${newRole}`);
            setAdminStatusMsg(`User ${targetUserId} successfully promoted to ${newRole}!`);
            setTargetUserId('');
            setTimeout(() => setAdminStatusMsg(null), 4000);
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || 'Role change failed. Only Admins can execute this.');
        }
    };

    if (!user) return null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{user.name ? user.name.charAt(0) : user.email?.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.name}>{user.name || 'LMS User'}</Text>
                <Text style={styles.userIdText}>User ID: #{user.id}</Text>
                <View style={[styles.roleBadge, user.role === 'ADMIN' ? styles.adminBadge : user.role === 'ALUMNI' ? styles.alumniBadge : styles.studentBadge]}>
                    <Text style={styles.roleText}>{user.role} Access Level</Text>
                </View>
            </View>

            {/* Personal Information Setup */}
            <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                    <User size={20} color="#e2e8f0" />
                    <Text style={styles.cardTitle}>Personal Information</Text>
                </View>

                {statusMsg && (
                    <View style={styles.successBox}>
                        <Text style={styles.successText}>{statusMsg}</Text>
                    </View>
                )}

                <Text style={styles.label}>Full Name</Text>
                <TextInput 
                    style={styles.input} 
                    value={name} 
                    onChangeText={setName} 
                />

                <Text style={styles.label}>Email Address (Read Only)</Text>
                <TextInput 
                    style={[styles.input, styles.inputDisabled]} 
                    value={user.email} 
                    editable={false}
                />

                <Text style={styles.label}>New Password (Optional)</Text>
                <TextInput 
                    style={styles.input} 
                    value={password} 
                    onChangeText={setPassword} 
                    placeholder="Leave blank to keep unchanged"
                    placeholderTextColor="#64748b"
                    secureTextEntry
                />

                <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdateProfile}>
                    <Text style={styles.primaryBtnText}>Update Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Admin Control Setup */}
            {user.role === 'ADMIN' && (
                <View style={[styles.card, styles.adminCard]}>
                    <View style={styles.cardHeaderRow}>
                        <Shield size={20} color="#f87171" />
                        <Text style={[styles.cardTitle, { color: '#f87171' }]}>Administrator Control</Text>
                    </View>
                    <Text style={styles.adminDesc}>Promote students to ALUMNI or grant ADMIN rights.</Text>

                    {adminStatusMsg && (
                        <View style={styles.successBox}>
                            <Text style={styles.successText}>{adminStatusMsg}</Text>
                        </View>
                    )}

                    <Text style={styles.label}>Target User ID</Text>
                    <TextInput 
                        style={styles.input} 
                        value={targetUserId} 
                        onChangeText={setTargetUserId} 
                        keyboardType="number-pad"
                        placeholder="e.g. 8"
                        placeholderTextColor="#64748b"
                    />

                    <Text style={styles.label}>New Role (Tap to change)</Text>
                    <TouchableOpacity style={styles.input} onPress={cycleRole}>
                        <Text style={{ color: '#fff' }}>{newRole}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#ef4444' }]} onPress={handleRoleChange}>
                        <Key size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.primaryBtnText}>Execute Role Change</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut color="#ef4444" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
    header: { alignItems: 'center', marginTop: 30, marginBottom: 30 },
    avatarContainer: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: '#6366f1',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' },
    name: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
    userIdText: { color: '#9ca3af', fontSize: 13, fontWeight: '500', marginBottom: 12 },
    
    roleBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    adminBadge: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
    alumniBadge: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
    studentBadge: { backgroundColor: 'rgba(56, 189, 248, 0.2)' },
    roleText: { color: '#e2e8f0', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 20,
    },
    adminCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: { color: '#e2e8f0', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
    adminDesc: { color: '#9ca3af', fontSize: 13, marginBottom: 20 },

    label: { color: '#9ca3af', fontSize: 13, marginBottom: 6 },
    input: {
        backgroundColor: 'rgba(15, 23, 42, 1)',
        color: '#fff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
    },
    inputDisabled: { opacity: 0.6 },

    successBox: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    successText: { color: '#10b981', fontSize: 13, textAlign: 'center' },

    primaryBtn: {
        flexDirection: 'row',
        backgroundColor: '#4f46e5',
        padding: 14,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

    logoutButton: {
        flexDirection: 'row',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 16, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)',
        marginBottom: 20,
    },
    logoutText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' }
});
