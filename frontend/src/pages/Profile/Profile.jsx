import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';
import { User, Shield, Key } from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });

    // Admin Panel States
    const [targetUserId, setTargetUserId] = useState('');
    const [newRole, setNewRole] = useState('STUDENT');
    const [adminStatus, setAdminStatus] = useState({ type: '', msg: '' });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/users/me', { name, password: password || null });
            setUser(res.data);
            setStatus({ type: 'success', msg: 'Profile updated successfully!' });
            setPassword('');
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to update profile.' });
        }
    };

    const handleRoleChange = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${targetUserId}/role?role=${newRole}`);
            setAdminStatus({ type: 'success', msg: `User ${targetUserId} successfully promoted to ${newRole}!` });
            setTargetUserId('');
        } catch (error) {
            setAdminStatus({ type: 'error', msg: error.response?.data?.message || 'Role change failed. Only Admins can execute this.' });
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Profile & Settings</h1>

            <div className="grid-2">
                {/* Personal Info Update */}
                <div className="glass-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                        <User size={20} /> Personal Information
                    </h3>

                    {status.msg && (
                        <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: status.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)' }}>
                            {status.msg}
                        </div>
                    )}

                    <form onSubmit={handleUpdateProfile}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address (Read Only)</label>
                            <input type="email" className="form-input" value={user?.email || ''} readOnly style={{ opacity: 0.7 }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">User ID (Read Only)</label>
                            <input type="text" className="form-input" value={user?.id || ''} readOnly style={{ opacity: 0.7 }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password (Optional)</label>
                            <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep unchanged" />
                        </div>
                        <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }}>Update Profile</button>
                    </form>
                </div>

                {/* Account Details & Role */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1.5rem auto' }}>
                            {user?.name ? user.name.charAt(0) : user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{user?.name || 'User'}</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}>User ID: #{user?.id}</p>
                        <span className={`badge ${user?.role === 'ADMIN' ? 'badge-admin' : user?.role === 'ALUMNI' ? 'badge-alumni' : 'badge-student'}`}>
                            {user?.role} Access Level
                        </span>
                    </div>

                    {/* Admin Zone */}
                    {user?.role === 'ADMIN' && (
                        <div className="glass-card" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', marginBottom: '1rem' }}>
                                <Shield size={20} /> Administrator Control
                            </h3>
                            <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>Promote students to ALUMNI or grant ADMIN rights.</p>

                            {adminStatus.msg && (
                                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', background: adminStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: adminStatus.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)', fontSize: '0.875rem' }}>
                                    {adminStatus.msg}
                                </div>
                            )}

                            <form onSubmit={handleRoleChange}>
                                <div className="form-group">
                                    <label className="form-label">Target User ID</label>
                                    <input type="number" className="form-input" required value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} placeholder="e.g. 8" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Role</label>
                                    <select className="form-select" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                                        <option value="STUDENT">Student</option>
                                        <option value="ALUMNI">Alumni</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)', width: '100%', marginTop: '0.5rem' }}>
                                    <Key size={18} /> Execute Role Change
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
