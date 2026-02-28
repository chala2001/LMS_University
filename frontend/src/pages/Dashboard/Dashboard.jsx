import React, { useState, useEffect, useContext } from 'react';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import { MessageSquare, Heart, Send, Activity, Users, Briefcase, Calendar as CalendarIcon } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext); // Make sure to import AuthContext at top

  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostContent, setEditPostContent] = useState('');

  const fetchData = async () => {
    try {
      const postsRes = await api.get('/posts');
      if (Array.isArray(postsRes.data)) {
        const sortedPosts = postsRes.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sortedPosts);
      }

      try {
        if (user?.role === 'ADMIN') {
          const statsRes = await api.get('/analytics');
          setStats(statsRes.data);
        }
      } catch (statsErr) {
        console.warn("Analytics fetch failed (expected if non-admin or unauthorized):", statsErr);
      }

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      await api.post('/posts', { content: newPost });
      setNewPost('');
      fetchData();
    } catch (err) {
      console.error("Failed to post:", err);
    }
  };

  const toggleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      fetchData();
    } catch (err) {
      console.error("Failed to like:", err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Only the author or an admin can delete a post.");
    }
  };

  const submitEditPost = async (e, postId) => {
    e.preventDefault();
    if (!editPostContent.trim()) return;
    try {
      await api.put(`/posts/${postId}`, { content: editPostContent });
      setEditingPostId(null);
      fetchData();
    } catch (err) {
      console.error("Failed to update post", err);
    }
  };

  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState({});

  const handleToggleComments = async (postId) => {
    if (activeCommentPost === postId) {
      setActiveCommentPost(null);
      return;
    }
    setActiveCommentPost(postId);
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setPostComments(prev => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("Fetch comments failed", err);
    }
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api.post(`/posts/${postId}/comments`, { content: commentText });
      setCommentText('');
      const res = await api.get(`/posts/${postId}/comments`);
      setPostComments(prev => ({ ...prev, [postId]: res.data }));
    } catch(err) {
        console.error("Comment failed", err);
    }
  };

  if (loading) return <div className="animate-fade-in"><p>Loading dashboard...</p></div>;

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '1.5rem' }}>Dashboard Overview</h1>
      
      {stats && user?.role === 'ADMIN' && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Admin Analytics</h2>
          <div className="grid-3">
            <div className="glass-card">
              <div className="flex-between">
                <div>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Total Network Users</p>
                  <h2 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalUsers}</h2>
                </div>
                <div style={{ background: 'rgba(79, 70, 229, 0.2)', padding: '12px', borderRadius: '50%', color: 'var(--primary-color)' }}>
                  <Users size={24} />
                </div>
              </div>
            </div>
            <div className="glass-card">
              <div className="flex-between">
                <div>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Total Posts</p>
                  <h2 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalPosts}</h2>
                </div>
                <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '12px', borderRadius: '50%', color: '#38bdf8' }}>
                  <Activity size={24} />
                </div>
              </div>
            </div>
            <div className="glass-card">
              <div className="flex-between">
                <div>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Active Jobs</p>
                  <h2 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalJobs}</h2>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '50%', color: 'var(--success-color)' }}>
                  <Briefcase size={24} />
                </div>
              </div>
            </div>
            <div className="glass-card">
              <div className="flex-between">
                <div>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Job Applications</p>
                  <h2 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalApplications}</h2>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '12px', borderRadius: '50%', color: 'var(--warning-color)' }}>
                  <Briefcase size={24} />
                </div>
              </div>
            </div>
            <div className="glass-card">
              <div className="flex-between">
                <div>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Upcoming Events</p>
                  <h2 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalEvents}</h2>
                </div>
                <div style={{ background: 'rgba(14, 165, 233, 0.2)', padding: '12px', borderRadius: '50%', color: 'var(--accent-color)' }}>
                  <CalendarIcon size={24} />
                </div>
              </div>
            </div>
            <div className="glass-card">
              <div className="flex-between">
                <div>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Total Messages</p>
                  <h2 style={{ fontSize: '2rem', margin: 0 }}>{stats.totalMessages}</h2>
                </div>
                <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '12px', borderRadius: '50%', color: '#8b5cf6' }}>
                  <MessageSquare size={24} />
                </div>
              </div>
            </div>
            <div className="glass-card" style={{ gridColumn: 'span 3' }}>
              <div className="flex-between">
                <div>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Most Popular Post</p>
                  <h3 style={{ margin: '0.5rem 0 0 0' }}>{stats.mostPopularPost || 'No data yet'}</h3>
                </div>
                <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '12px', borderRadius: '50%', color: '#ec4899' }}>
                  <Heart size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1rem' }}>Activity Feed</h2>
        
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleCreatePost} className="flex-between gap-4">
            <input 
              type="text" 
              className="form-input" 
              placeholder="What's on your mind? Share an update or research progress..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              style={{ flex: 1, background: 'var(--bg-color)' }}
            />
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
              <Send size={18} /> Post
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {posts.map((post) => (
            <div key={post.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {post.authorName ? post.authorName.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{post.authorName || 'Unknown User'}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {editingPostId === post.id ? (
                  <form onSubmit={(e) => submitEditPost(e, post.id)} style={{ marginBottom: '1.5rem', display: 'flex', gap: '8px' }}>
                    <input type="text" className="form-input" style={{ flex: 1 }} value={editPostContent} onChange={(e) => setEditPostContent(e.target.value)} />
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Save</button>
                    <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setEditingPostId(null)}>Cancel</button>
                  </form>
              ) : (
                  <p style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                    {post.content}
                   </p>
              )}

              <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                <button 
                  onClick={() => toggleLike(post.id)} 
                  className="btn-icon" 
                  style={{ gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', color: post.likeCount > 0 ? '#ec4899' : 'currentColor' }}
                >
                  <Heart size={18} fill={post.likeCount > 0 ? '#ec4899' : 'transparent'} /> {post.likeCount} Like{post.likeCount !== 1 ? 's' : ''}
                </button>
                <button 
                  onClick={() => handleToggleComments(post.id)} 
                  className="btn-icon" 
                  style={{ gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}
                >
                  <MessageSquare size={18} /> {post.commentCount} Comment{post.commentCount !== 1 ? 's' : ''}
                </button>
                
                {/* Admin or Author Controls */}
                {(user?.role === 'ADMIN' || user?.name === post.authorName) && (
                  <div style={{ display: 'flex', marginLeft: 'auto', gap: '0.5rem' }}>
                     <button onClick={() => { setEditingPostId(post.id); setEditPostContent(post.content); }} className="btn-icon" style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem', fontSize: '0.8rem' }}>Edit</button>
                     <button onClick={() => handleDeletePost(post.id)} className="btn-icon" style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem', color: 'var(--danger-color)', fontSize: '0.8rem' }}>Delete</button>
                  </div>
                )}
              </div>

              {activeCommentPost === post.id && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                  <form onSubmit={(e) => handleAddComment(post.id, e)} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>Reply</button>
                  </form>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(postComments[post.id] || []).map(comment => (
                      <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                           {comment.user?.name ? comment.user.name.charAt(0) : 'U'}
                        </div>
                        <div style={{ flex: 1, background: 'var(--surface-color)', padding: '0.75rem', borderRadius: '0 var(--radius-md) var(--radius-md) var(--radius-md)' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                             <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{comment.user?.name || comment.user?.email || 'Unknown User'}</span>
                             <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                           </div>
                           <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    {postComments[post.id]?.length === 0 && <p style={{ fontSize: '0.875rem', textAlign: 'center' }}>No comments yet.</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
          {posts.length === 0 && (
            <div className="glass-card text-center" style={{ padding: '3rem' }}>
              <Activity size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
              <h3>It's quiet here</h3>
              <p>Be the first to share an update with the university network!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
