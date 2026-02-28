import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Beaker, Users, ChevronRight, PlusCircle, Trash, Edit } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';

const Research = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Creation State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', description: '', status: 'ACTIVE' });
    // Edit State
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editProjectData, setEditProjectData] = useState({ title: '', description: '' });
    const { user } = useContext(AuthContext);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/research');
            setProjects(res.data);
        } catch (err) {
            console.error("Failed to fetch research", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/research', { 
                title: newProject.title, 
                description: newProject.description,
                status: newProject.status
            });
            setShowCreateModal(false);
            setNewProject({ title: '', description: '', status: 'ACTIVE' });
            fetchProjects();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create project');
        }
    };

    const handleJoinProject = async (projectId) => {
        try {
            await api.post(`/research/${projectId}/join`);
            alert("Successfully joined the research project!");
            fetchProjects();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to join project');
        }
    };
    const submitEditProject = async (e, projectId) => {
        e.preventDefault();
        try {
            await api.put(`/research/${projectId}`, {
                title: editProjectData.title, 
                description: editProjectData.description,
                status: editProjectData.status
            });
            setEditingProjectId(null);
            fetchProjects();
        } catch (err) {
            console.error("Failed to update project", err);
            alert("Failed to update research project.");
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm("Are you sure you want to delete this research project?")) return;
        try {
            await api.delete(`/research/${projectId}`);
            fetchProjects();
        } catch (err) {
            console.error("Failed to delete project", err);
            alert("Only the creator can delete this project.");
        }
    };

    if (loading) return <div>Loading research projects...</div>;

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <h1>Research & Innovation</h1>
                <button className="btn btn-secondary" onClick={() => setShowCreateModal(true)} style={{ width: 'auto' }}>
                    <PlusCircle size={20} /> Propose Project
                </button>
            </div>

            <div className="grid-2">
                {projects.length === 0 ? (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No research projects found.</p>
                ) : projects.map(proj => (
                    <div key={proj.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1 }}>
                            {editingProjectId === proj.id ? (
                                <form onSubmit={(e) => submitEditProject(e, proj.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <input type="text" className="form-input" value={editProjectData.title} onChange={e => setEditProjectData({...editProjectData, title: e.target.value})} placeholder="Project Title" required />
                                    <textarea className="form-input" rows="3" value={editProjectData.description} onChange={e => setEditProjectData({...editProjectData, description: e.target.value})} placeholder="Description" required></textarea>
                                    <select className="form-select" value={editProjectData.status} onChange={e => setEditProjectData({...editProjectData, status: e.target.value})}>
                                        <option value="ACTIVE">Active</option>
                                        <option value="PLANNING">Planning</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setEditingProjectId(null)} style={{ flex: 1 }}>Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ margin: 0, color: '#38bdf8' }}>{proj.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                                <Beaker size={16} /> Research Initiative by {proj.authorName}
                                            </div>
                                        </div>
                                        <span className={`badge badge-student`}>{proj.status}</span>
                                    </div>
                                    
                                    <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1 }}>{proj.description}</p>
                                </>
                            )}
                            
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Users size={14} /> Research Team ({proj.members?.length || 0})
                                    </h4>
                                    {(user?.name === proj.authorName) && editingProjectId !== proj.id && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => { setEditingProjectId(proj.id); setEditProjectData({ title: proj.title, description: proj.description, status: proj.status || 'ACTIVE' }); }} className="btn-icon" style={{ borderRadius: 'var(--radius-md)', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}><Edit size={14}/></button>
                                            <button onClick={() => handleDeleteProject(proj.id)} className="btn-icon" style={{ borderRadius: 'var(--radius-md)', padding: '0.2rem 0.4rem', color: 'var(--danger-color)', fontSize: '0.75rem' }}><Trash size={14}/></button>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {proj.members?.map((memberName, idx) => (
                                        <span key={idx} style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                            {memberName}
                                        </span>
                                    ))}
                                    {(!proj.members || proj.members.length === 0) && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No members yet</span>}
                                </div>
                            </div>
                        </div>

                        <button className="btn btn-secondary" onClick={() => handleJoinProject(proj.id)} style={{ width: '100%', borderColor: '#38bdf8', color: '#38bdf8' }}>
                            Request to Join <ChevronRight size={18} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Propose Research</h2>
                        <form onSubmit={handleCreateProject}>
                            <div className="form-group">
                                <label className="form-label">Project Title</label>
                                <input type="text" className="form-input" required value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Objective / Description</label>
                                <textarea className="form-input" required rows="4" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}></textarea>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Initial Status</label>
                                <select className="form-select" value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value})}>
                                    <option value="ACTIVE">Active</option>
                                    <option value="PLANNING">Planning</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                            <div className="flex-between" style={{ marginTop: '2rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)} style={{ width: '45%' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ width: '45%' }}>Submit Proposal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Research;
