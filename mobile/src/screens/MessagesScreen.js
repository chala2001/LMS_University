import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Send, User as UserIcon, Search, MessageSquare, ChevronLeft } from 'lucide-react-native';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function MessagesScreen() {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const [activeChatUser, setActiveChatUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCounts, setUnreadCounts] = useState({});
    const [latestMessages, setLatestMessages] = useState({});

    const scrollViewRef = useRef(null);

    const fetchDirectory = async () => {
        if (!user) return;
        try {
            const [usersRes, msgsRes] = await Promise.all([
                api.get('/users'),
                api.get('/messages')
            ]);
            
            const otherUsers = usersRes.data.filter(u => u.id !== user?.id);
            const allMessages = msgsRes.data;

            const interactionMap = {};
            const unreadMap = {};
            const latestMsgMap = {};

            allMessages.forEach(msg => {
                const otherId = msg.sender?.id === user?.id ? msg.receiver?.id : msg.sender?.id;
                if (!otherId) return;
                
                if (!interactionMap[otherId]) {
                    interactionMap[otherId] = new Date(msg.sentAt).getTime() || 0;
                    latestMsgMap[otherId] = msg.content;
                }
                
                if (msg.receiver?.id === user?.id && !msg.isRead) {
                    unreadMap[otherId] = (unreadMap[otherId] || 0) + 1;
                }
            });

            otherUsers.sort((a, b) => {
                const timeA = interactionMap[a.id] || 0;
                const timeB = interactionMap[b.id] || 0;
                return timeB - timeA;
            });

            setUsers(otherUsers);
            setUnreadCounts(unreadMap);
            setLatestMessages(latestMsgMap);
        } catch (err) {
            console.error("Failed to fetch directory info", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDirectory();
        const interval = setInterval(fetchDirectory, 10000); // refresh list every 10s
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
        } else {
            const q = searchQuery.toLowerCase();
            setFilteredUsers(users.filter(u => 
                (u.name && u.name.toLowerCase().includes(q)) || 
                (u.email && u.email.toLowerCase().includes(q))
            ));
        }
    }, [searchQuery, users]);

    // Active Chat fetch loop
    useEffect(() => {
        let chatInterval;
        const fetchMessages = async () => {
            if (!activeChatUser) return;
            try {
                const res = await api.get(`/messages/${activeChatUser.id}`);
                const sorted = res.data.sort((a,b) => new Date(a.sentAt) - new Date(b.sentAt));
                setMessages(sorted);
                fetchDirectory(); // clearing unread badges
            } catch (err) {
                console.error("Failed to fetch conversation", err);
            }
        };

        if (activeChatUser) {
            fetchMessages();
            chatInterval = setInterval(fetchMessages, 5000);
        }

        return () => {
            if (chatInterval) clearInterval(chatInterval);
        };
    }, [activeChatUser]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeChatUser) return;
        
        const content = newMessage;
        setNewMessage(''); // optimistic clear
        
        try {
            const res = await api.post(`/messages/${activeChatUser.id}?content=${encodeURIComponent(content)}`);
            setMessages(prev => [...prev, res.data]);
            fetchDirectory();
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity style={styles.userCard} onPress={() => setActiveChatUser(item)}>
            <View style={styles.avatar}>
                {item.name ? (
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                ) : (
                    <UserIcon size={20} color="#fff" />
                )}
            </View>
            <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                    <Text style={[styles.userName, unreadCounts[item.id] && styles.userNameUnread]}>
                        {item.name || item.email}
                    </Text>
                    {unreadCounts[item.id] > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadCounts[item.id]}</Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.recentMessage, unreadCounts[item.id] && styles.recentMessageUnread]} numberOfLines={1}>
                    {latestMessages[item.id] || item.role}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Direct Messages</Text>
            </View>

            <View style={styles.searchContainer}>
                <Search size={20} color="#9ca3af" style={styles.searchIcon} />
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Search directory..."
                    placeholderTextColor="#64748b"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredUsers}
                keyExtractor={item => item.id.toString()}
                renderItem={renderUserItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
            />

            {/* Chat Modal */}
            <Modal visible={!!activeChatUser} animationType="slide" onRequestClose={() => setActiveChatUser(null)}>
                <KeyboardAvoidingView 
                    style={styles.chatContainer} 
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* Chat Header */}
                    <View style={styles.chatHeader}>
                        <TouchableOpacity onPress={() => setActiveChatUser(null)} style={styles.backBtn}>
                            <ChevronLeft size={28} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.chatHeaderAvatar}>
                            {activeChatUser?.name ? (
                                <Text style={styles.avatarText}>{activeChatUser.name.charAt(0)}</Text>
                            ) : (
                                <UserIcon size={20} color="#fff" />
                            )}
                        </View>
                        <View>
                            <Text style={styles.chatHeaderName}>{activeChatUser?.name || activeChatUser?.email}</Text>
                            <Text style={styles.chatHeaderRole}>{activeChatUser?.role}</Text>
                        </View>
                    </View>

                    {/* Messages ScrollView */}
                    <ScrollView 
                        style={styles.messagesScroll} 
                        contentContainerStyle={styles.messagesContainer}
                        ref={scrollViewRef}
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    >
                        {messages.length === 0 ? (
                            <View style={styles.emptyChat}>
                                <MessageSquare size={48} color="#475569" style={{marginBottom: 16}} />
                                <Text style={styles.emptyChatText}>Start a conversation with {activeChatUser?.name}</Text>
                            </View>
                        ) : (
                            messages.map((msg, index) => {
                                const isMine = msg.sender?.id === user?.id;
                                return (
                                    <View key={index} style={[styles.messageBubbleWrapper, isMine ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
                                        <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.theirBubble]}>
                                            <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
                                                {msg.content}
                                            </Text>
                                        </View>
                                        <Text style={styles.messageTime}>
                                            {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>

                    {/* Input Area */}
                    <View style={styles.inputArea}>
                        <TextInput
                            style={styles.chatInput}
                            placeholder="Type a message..."
                            placeholderTextColor="#9ca3af"
                            value={newMessage}
                            onChangeText={setNewMessage}
                            onSubmitEditing={handleSendMessage}
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                            <Send size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    searchContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(30, 41, 59, 1)',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, color: '#fff', fontSize: 15 },
    listContainer: { paddingHorizontal: 16, paddingBottom: 40 },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#6366f1',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    userInfo: { flex: 1, justifyContent: 'center' },
    userNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
    userName: { color: '#e2e8f0', fontSize: 16, fontWeight: '500' },
    userNameUnread: { color: '#fff', fontWeight: 'bold' },
    recentMessage: { color: '#9ca3af', fontSize: 13 },
    recentMessageUnread: { color: '#e2e8f0', fontWeight: '600' },
    badge: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: 10, minWidth: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    emptyText: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 16 },

    // Chat Modal
    chatContainer: { flex: 1, backgroundColor: '#0f172a' },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: '#1e293b',
    },
    backBtn: { padding: 4, marginRight: 4 },
    chatHeaderAvatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#6366f1',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    chatHeaderName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    chatHeaderRole: { color: '#9ca3af', fontSize: 12 },
    
    messagesScroll: { flex: 1 },
    messagesContainer: { padding: 16, paddingBottom: 32 },
    emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyChatText: { color: '#9ca3af', fontSize: 15 },
    
    messageBubbleWrapper: { marginBottom: 16, maxWidth: '80%' },
    myBubbleWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    theirBubbleWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    messageBubble: { padding: 12, borderRadius: 18 },
    myBubble: { backgroundColor: '#6366f1', borderBottomRightRadius: 4 },
    theirBubble: { backgroundColor: '#1e293b', borderBottomLeftRadius: 4 },
    myMessageText: { color: '#fff', fontSize: 15 },
    theirMessageText: { color: '#e2e8f0', fontSize: 15 },
    messageTime: { color: '#64748b', fontSize: 11, marginTop: 4, marginHorizontal: 4 },

    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 32 : 12,
        backgroundColor: '#1e293b',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    chatInput: {
        flex: 1,
        backgroundColor: '#0f172a',
        color: '#fff',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
    },
    sendBtn: {
        backgroundColor: '#6366f1',
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
        marginLeft: 12,
    }
});
