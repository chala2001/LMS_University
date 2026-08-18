import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Briefcase, Calendar as CalendarIcon, Users, MessageSquare, Heart, Send, Activity, Edit, Trash } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function DashboardScreen() {
    const { user } = useContext(AuthContext);
    
    // Admin Stats Data
    const [stats, setStats] = useState(null);
    
    // Social Feed Data
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Edit Post State
    const [editingPostId, setEditingPostId] = useState(null);
    const [editPostContent, setEditPostContent] = useState('');

    // Comments State
    const [activeCommentPost, setActiveCommentPost] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [postComments, setPostComments] = useState({});

    const fetchData = async () => {
        try {
            // Fetch Social Posts
            const postsRes = await api.get('/posts');
            if (Array.isArray(postsRes.data)) {
                const sortedPosts = postsRes.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPosts(sortedPosts);
            }

            // Fetch Admin Analytics
            if (user?.role === 'ADMIN') {
                try {
                    const statsRes = await api.get('/analytics/dashboard');
                    setStats(statsRes.data); // NOTE: web used /analytics, mobile had /analytics/dashboard
                } catch (statsErr) {
                    // Mobile fallback to /analytics if needed based on web code, but keeping dashboard route from existing mobile codebase first
                    try {
                        const fallBack = await api.get('/analytics');
                        setStats(fallBack.data);
                    } catch (e) {
                         console.warn("Analytics fetch failed");
                    }
                }
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Post Actions
    const handleCreatePost = async () => {
        if (!newPost.trim()) return;
        try {
            await api.post('/posts', { content: newPost });
            setNewPost('');
            fetchData();
        } catch (err) {
            Alert.alert("Error", "Failed to create post");
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
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/posts/${postId}`);
                            fetchData();
                        } catch (err) {
                            Alert.alert("Error", "Only the author or an admin can delete a post.");
                        }
                    }
                }
            ]
        );
    };

    const submitEditPost = async (postId) => {
        if (!editPostContent.trim()) return;
        try {
            await api.put(`/posts/${postId}`, { content: editPostContent });
            setEditingPostId(null);
            fetchData();
        } catch (err) {
            Alert.alert("Error", "Failed to update post");
        }
    };

    // Comment Actions
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

    const handleAddComment = async (postId) => {
        if (!commentText.trim()) return;
        try {
            await api.post(`/posts/${postId}/comments`, { content: commentText });
            setCommentText('');
            const res = await api.get(`/posts/${postId}/comments`);
            setPostComments(prev => ({ ...prev, [postId]: res.data }));
        } catch(err) {
            Alert.alert("Error", "Failed to add comment");
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
            nestedScrollEnabled={true}
        >
            <Text style={styles.greeting}>Dashboard Overview</Text>
            
            {/* Admin Analytics Grid */}
            {stats && user?.role === 'ADMIN' && (
                <View style={styles.analyticsContainer}>
                    <Text style={styles.sectionTitleAdmin}>Admin Analytics</Text>
                    <View style={styles.grid}>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.cardTitle}>Total Users</Text>
                                    <Text style={styles.cardNumber}>{stats.totalUsers || 0}</Text>
                                </View>
                                <View style={[styles.iconCircle, { backgroundColor: 'rgba(79, 70, 229, 0.2)' }]}>
                                    <Users color="#6366f1" size={24} />
                                </View>
                            </View>
                        </View>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.cardTitle}>Total Posts</Text>
                                    <Text style={styles.cardNumber}>{stats.totalPosts || 0}</Text>
                                </View>
                                <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                                    <Activity color="#38bdf8" size={24} />
                                </View>
                            </View>
                        </View>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.cardTitle}>Active Jobs</Text>
                                    <Text style={styles.cardNumber}>{stats.totalJobs || 0}</Text>
                                </View>
                                <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                                    <Briefcase color="#10b981" size={24} />
                                </View>
                            </View>
                        </View>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.cardTitle}>Total Events</Text>
                                    <Text style={styles.cardNumber}>{stats.totalEvents || 0}</Text>
                                </View>
                                <View style={[styles.iconCircle, { backgroundColor: 'rgba(14, 165, 233, 0.2)' }]}>
                                    <CalendarIcon color="#0ea5e9" size={24} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Social Feed */}
            <View style={styles.feedContainer}>
                <Text style={styles.sectionTitle}>Activity Feed</Text>

                {/* Create Post */}
                <View style={styles.createPostCard}>
                    <View style={styles.createPostRow}>
                        <TextInput 
                            style={styles.postInput}
                            placeholder="What's on your mind?"
                            placeholderTextColor="#9ca3af"
                            value={newPost}
                            onChangeText={setNewPost}
                            multiline
                        />
                        <TouchableOpacity style={styles.postButton} onPress={handleCreatePost}>
                            <Send size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Posts List */}
                {posts.map((post) => (
                    <View key={post.id} style={styles.postCard}>
                        {/* Post Header */}
                        <View style={styles.postHeader}>
                            <View style={styles.authorRow}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{post.authorName ? post.authorName.charAt(0) : 'U'}</Text>
                                </View>
                                <View>
                                    <Text style={styles.authorName}>{post.authorName || 'Unknown User'}</Text>
                                    <Text style={styles.timestamp}>{new Date(post.createdAt).toLocaleString()}</Text>
                                </View>
                            </View>
                            
                            {/* Author/Admin Controls */}
                            {(user?.role === 'ADMIN' || user?.name === post.authorName) && (
                                <View style={styles.controlRow}>
                                    <TouchableOpacity 
                                        style={styles.controlBtn} 
                                        onPress={() => {
                                            setEditingPostId(post.id);
                                            setEditPostContent(post.content);
                                        }}>
                                        <Edit size={16} color="#9ca3af" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.controlBtn} onPress={() => handleDeletePost(post.id)}>
                                        <Trash size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Post Body */}
                        {editingPostId === post.id ? (
                            <View style={styles.editContainer}>
                                <TextInput
                                    style={styles.editInput}
                                    value={editPostContent}
                                    onChangeText={setEditPostContent}
                                    multiline
                                />
                                <View style={styles.editActionRow}>
                                    <TouchableOpacity style={styles.saveBtn} onPress={() => submitEditPost(post.id)}>
                                        <Text style={styles.saveBtnText}>Save</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingPostId(null)}>
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <Text style={styles.postContent}>{post.content}</Text>
                        )}

                        {/* Post Footer Actions */}
                        <View style={styles.postFooter}>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(post.id)}>
                                <Heart size={18} color={post.likeCount > 0 ? '#ec4899' : '#9ca3af'} fill={post.likeCount > 0 ? '#ec4899' : 'transparent'} />
                                <Text style={[styles.actionText, post.likeCount > 0 && {color: '#ec4899'}]}>{post.likeCount} Likes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggleComments(post.id)}>
                                <MessageSquare size={18} color="#9ca3af" />
                                <Text style={styles.actionText}>{post.commentCount} Comments</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Comments Section */}
                        {activeCommentPost === post.id && (
                            <View style={styles.commentsSection}>
                                <View style={styles.createCommentRow}>
                                    <TextInput 
                                        style={styles.commentInput}
                                        placeholder="Write a comment..."
                                        placeholderTextColor="#64748b"
                                        value={commentText}
                                        onChangeText={setCommentText}
                                    />
                                    <TouchableOpacity style={styles.commentBtn} onPress={() => handleAddComment(post.id)}>
                                        <Text style={styles.commentBtnText}>Reply</Text>
                                    </TouchableOpacity>
                                </View>

                                {(postComments[post.id] || []).map(comment => (
                                    <View key={comment.id} style={styles.commentRow}>
                                        <View style={styles.commentAvatar}>
                                            <Text style={styles.commentAvatarText}>{comment.user?.name ? comment.user.name.charAt(0) : 'U'}</Text>
                                        </View>
                                        <View style={styles.commentBubble}>
                                            <View style={styles.commentHeader}>
                                                <Text style={styles.commentAuthor}>{comment.user?.name || comment.user?.email || 'Unknown User'}</Text>
                                                <Text style={styles.commentTime}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
                                            </View>
                                            <Text style={styles.commentBody}>{comment.content}</Text>
                                        </View>
                                    </View>
                                ))}

                                {postComments[post.id]?.length === 0 && (
                                    <Text style={styles.emptyComments}>No comments yet.</Text>
                                )}
                            </View>
                        )}
                    </View>
                ))}

                {posts.length === 0 && (
                    <View style={styles.emptyFeed}>
                        <Activity size={48} color="#475569" style={{marginBottom: 16}} />
                        <Text style={styles.emptyFeedTitle}>It's quiet here</Text>
                        <Text style={styles.emptyFeedText}>Be the first to share an update!</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        margin: 16,
    },
    analyticsContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitleAdmin: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#818cf8',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardTitle: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardNumber: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    iconCircle: {
        padding: 10,
        borderRadius: 20,
    },
    feedContainer: {
        paddingBottom: 40,
    },
    createPostCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 16,
        marginHorizontal: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    createPostRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    postInput: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        color: '#fff',
        borderRadius: 8,
        padding: 12,
        minHeight: 48,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    postButton: {
        backgroundColor: '#4f46e5',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    postCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        padding: 16,
        marginHorizontal: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    authorName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    timestamp: {
        color: '#64748b',
        fontSize: 12,
        marginTop: 2,
    },
    controlRow: {
        flexDirection: 'row',
        gap: 8,
    },
    controlBtn: {
        padding: 6,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 6,
    },
    postContent: {
        color: '#e2e8f0',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 16,
    },
    editContainer: {
        marginBottom: 16,
    },
    editInput: {
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        color: '#fff',
        borderRadius: 8,
        padding: 12,
        minHeight: 80,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 8,
    },
    editActionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    saveBtn: {
        backgroundColor: '#4f46e5',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    cancelBtn: {
        backgroundColor: '#334155',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    cancelBtnText: {
        color: '#cbd5e1',
        fontWeight: 'bold',
    },
    postFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 12,
        gap: 16,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 8,
    },
    actionText: {
        color: '#9ca3af',
        fontSize: 14,
        fontWeight: '500',
    },
    commentsSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    createCommentRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    commentInput: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        color: '#fff',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    commentBtn: {
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    commentBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    commentRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#0ea5e9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentAvatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    commentBubble: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 12,
        borderRadius: 12,
        borderTopLeftRadius: 4,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    commentAuthor: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    commentTime: {
        color: '#64748b',
        fontSize: 11,
    },
    commentBody: {
        color: '#cbd5e1',
        fontSize: 13,
    },
    emptyComments: {
        color: '#64748b',
        textAlign: 'center',
        fontSize: 13,
        paddingVertical: 8,
    },
    emptyFeed: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        marginHorizontal: 16,
        borderRadius: 12,
    },
    emptyFeedTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyFeedText: {
        color: '#9ca3af',
        fontSize: 14,
    }
});
