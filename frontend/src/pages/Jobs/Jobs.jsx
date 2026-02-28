import React, { useState, useEffect, useContext } from 'react';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import { Briefcase, MapPin, Search, PlusCircle, Send, Users } from 'lucide-react';

const Jobs = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [applyStatus, setApplyStatus] = useState({});

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
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleApply = async (jobId) => {
        try {
            await api.post(`/jobs/${jobId}/apply`);
            setApplyStatus(prev => ({ ...prev, [jobId]: { success: true, msg: 'Applied successfully!' } }));
            fetchJobs();
        } catch (err) {
            setApplyStatus(prev => ({ ...prev, [jobId]: { success: false, msg: err.response?.data?.message || 'Failed to apply' } }));
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            await api.post('/jobs', newJob);
            setShowCreateModal(false);
            setNewJob({ title: '', description: '', company: '', type: 'FULL_TIME', requirements: '' });
            fetchJobs();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create job');
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job posting?")) return;
        try {
            await api.delete(`/jobs/${jobId}`);
            fetchJobs();
        } catch (err) {
            console.error("Failed to delete job", err);
            alert("Only Admins or Alumni who posted this can delete it.");
        }
    };

    const submitEditJob = async (e, jobId) => {
        e.preventDefault();
        try {
            await api.put(`/jobs/${jobId}`, editJobData);
            setEditingJobId(null);
            fetchJobs();
        } catch (err) {
            console.error("Failed to update job", err);
            alert("Failed to update job posting.");
        }
    };

    const filteredJobs = jobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.company?.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleViewApplicants = async (jobId, title) => {
        try {
            const res = await api.get(`/jobs/${jobId}/applicants`);
            setApplicantsList(res.data);
            setActiveJobTitle(title);
            setShowApplicantsModal(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to fetch applicants');
        }
    };

    if (loading) return <div>Loading jobs...</div>;

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <h1>Career Opportunities</h1>
                {(user?.role === 'ADMIN' || user?.role === 'ALUMNI') && (
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ width: 'auto' }}>
                        <PlusCircle size={20} /> Post New Job
                    </button>
                )}
            </div>

            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <Search size={24} color="var(--text-muted)" />
                <input 
                    type="text" 
                    placeholder="Search by job title or company..." 
                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '1rem' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid-2">
                {filteredJobs.length === 0 ? (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No job postings available matching your search.</p>
                ) : filteredJobs.map(job => (
                    <div key={job.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1 }}>
                            {editingJobId === job.id ? (
                                <form onSubmit={(e) => submitEditJob(e, job.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <input type="text" className="form-input" value={editJobData.title} onChange={e => setEditJobData({...editJobData, title: e.target.value})} placeholder="Job Title" required />
                                    <input type="text" className="form-input" value={editJobData.company} onChange={e => setEditJobData({...editJobData, company: e.target.value})} placeholder="Company" required />
                                    <textarea className="form-input" rows="3" value={editJobData.description} onChange={e => setEditJobData({...editJobData, description: e.target.value})} placeholder="Description" required></textarea>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setEditingJobId(null)} style={{ flex: 1 }}>Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{job.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                                <Briefcase size={16} /> {job.company || 'University network'}
                                            </div>
                                        </div>
                                        <span className="badge badge-neutral">{new Date(job.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1 }}>{job.description}</p>
                                </>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Users size={16} /> {job.applicationCount || 0} Applicants
                                </div>
                                {(user?.role === 'ADMIN' || user?.role === 'ALUMNI') && editingJobId !== job.id && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleViewApplicants(job.id, job.title)} className="btn-icon" style={{ borderRadius: 'var(--radius-md)', padding: '0.4rem 0.6rem', fontSize: '0.8rem', color: 'var(--accent-color)' }}>
                                            View Applicants
                                        </button>
                                        <button onClick={() => { setEditingJobId(job.id); setEditJobData({ title: job.title, company: job.company, description: job.description }); }} className="btn-icon" style={{ borderRadius: 'var(--radius-md)', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>Edit</button>
                                        <button onClick={() => handleDeleteJob(job.id)} className="btn-icon" style={{ borderRadius: 'var(--radius-md)', padding: '0.4rem 0.6rem', color: 'var(--danger-color)', fontSize: '0.8rem' }}>Delete</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {applyStatus[job.id] ? (
                             <div style={{ padding: '0.75rem', textAlign: 'center', borderRadius: 'var(--radius-md)', background: applyStatus[job.id].success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: applyStatus[job.id].success ? 'var(--success-color)' : 'var(--danger-color)', fontSize: '0.875rem' }}>
                                {applyStatus[job.id].msg}
                             </div>
                        ) : (
                            <button className="btn btn-secondary" onClick={() => handleApply(job.id)} disabled={user?.role !== 'STUDENT'} style={{ opacity: user?.role !== 'STUDENT' ? 0.5 : 1 }}>
                                <Send size={18} /> {user?.role === 'STUDENT' ? 'Apply Now' : 'Students Only'}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Admin Job Creation Modal (Simplified inline for now) */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Post New Job</h2>
                        <form onSubmit={handleCreateJob}>
                            <div className="form-group">
                                <label className="form-label">Job Title</label>
                                <input type="text" className="form-input" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Company / Department</label>
                                <input type="text" className="form-input" required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input" required rows="4" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})}></textarea>
                            </div>
                            <div className="flex-between" style={{ marginTop: '2rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)} style={{ width: '45%' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ width: '45%' }}>Create Job</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Admin Applicants Modal */}
            {showApplicantsModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Applicants List</h2>
                            <button className="btn btn-secondary" onClick={() => setShowApplicantsModal(false)} style={{ padding: '0.25rem 0.5rem' }}>✕</button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{activeJobTitle}</p>
                        
                        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {applicantsList.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No one has applied yet.</p>
                            ) : (
                                applicantsList.map(applicant => (
                                    <div key={applicant.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {applicant.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{applicant.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{applicant.email}</div>
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

export default Jobs;
