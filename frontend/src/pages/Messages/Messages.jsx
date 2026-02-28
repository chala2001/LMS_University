import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import { Send, User as UserIcon, Search, MessageSquare } from 'lucide-react';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [latestMessages, setLatestMessages] = useState({});
  
  const messagesEndRef = useRef(null);

  // Fetch directory of users and latest messages for sorting
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
         
         // MSGs are ordered DESC from the backend, so the first one we see is the latest
         if (!interactionMap[otherId]) {
            interactionMap[otherId] = new Date(msg.sentAt).getTime() || 0;
            latestMsgMap[otherId] = msg.content;
         }
         
         if (msg.receiver?.id === user?.id && !msg.isRead) {
            unreadMap[otherId] = (unreadMap[otherId] || 0) + 1;
         }
      });

      // Sort users by most recent interaction first
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
    }
  };

  useEffect(() => {
    fetchDirectory();
    const interval = setInterval(fetchDirectory, 10000); // refresh list every 10s
    return () => clearInterval(interval);
  }, [user]);

  // Handle Search Filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(users.filter(u => 
        u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      ));
    }
  }, [searchQuery, users]);

  // Fetch Conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChatUser) return;
      try {
        const res = await api.get(`/messages/${activeChatUser.id}`);
        const sorted = res.data.sort((a,b) => new Date(a.sentAt) - new Date(b.sentAt));
        setMessages(sorted);
        
        // Unconditionally refresh directory after jumping into chat to clear badges natively
        fetchDirectory();
      } catch (err) {
        console.error("Failed to fetch conversation", err);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // polling every 10s
    return () => clearInterval(interval);
  }, [activeChatUser]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatUser) return;
    
    try {
      const res = await api.post(`/messages/${activeChatUser.id}?content=${encodeURIComponent(newMessage)}`);
      setMessages([...messages, res.data]);
      setNewMessage('');
      fetchDirectory(); // Refresh directory to pull our user to the top instantly!
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '1.5rem' }}>
      
      {/* Sidebar: Users List */}
      <div className="glass-panel" style={{ width: '300px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
          <h2 style={{ margin: '0 0 1rem 0' }}>Direct Messages</h2>
          
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', paddingBottom: '0.4rem', paddingTop: '0.4rem' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {filteredUsers.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</p>
          ) : (
            filteredUsers.map(u => (
              <div 
                key={u.id}
                onClick={() => setActiveChatUser(u)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  background: activeChatUser?.id === u.id ? 'var(--surface-color)' : 'transparent',
                  border: activeChatUser?.id === u.id ? '1px solid var(--surface-border)' : '1px solid transparent',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '12px', flexShrink: 0 }}>
                  {u.name ? u.name.charAt(0) : <UserIcon size={20} />}
                </div>
                
                <div style={{ overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: unreadCounts[u.id] ? 700 : 500, color: 'var(--text-main)' }}>
                      {u.name || 'Unknown User'}
                    </h4>
                    {/* Placeholder for timestamp if we decide to add it later, keeps layout stable */}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: unreadCounts[u.id] ? 'var(--text-main)' : 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: unreadCounts[u.id] ? 600 : 'normal', paddingRight: '8px' }}>
                       {latestMessages[u.id] || u.role}
                    </p>
                    {unreadCounts[u.id] > 0 && (
                      <div style={{ background: 'var(--primary-color)', color: 'white', borderRadius: '10px', minWidth: '20px', height: '20px', padding: '0 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', flexShrink: 0 }}>
                        {unreadCounts[u.id]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Area: Active Chat */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeChatUser ? (
          <>
            {/* Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {activeChatUser.name ? activeChatUser.name.charAt(0) : <UserIcon size={24} />}
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{activeChatUser.name || activeChatUser.email}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activeChatUser.role}</p>
              </div>
            </div>

            {/* Message History */}
            <div style={{ flex: 1, padding: '1.5rem', paddingRight: '2.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <MessageSquare size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                  <p>Start the conversation with {activeChatUser.name || 'this user'}</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.sender?.id === user?.id;
                  return (
                    <div 
                      key={msg.id} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        alignSelf: isMine ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{ 
                        padding: '10px 16px', 
                        borderRadius: isMine ? '18px 18px 0 18px' : '18px 18px 18px 0',
                        background: isMine ? 'var(--primary-color)' : 'var(--surface-color)',
                        color: isMine ? '#fff' : 'var(--text-main)',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}>
                        {msg.content}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ flex: 1, borderRadius: 'var(--radius-lg)' }}
                />
                <button type="submit" className="btn btn-primary" style={{ width: 'auto', borderRadius: '50%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <h3>Your Messages</h3>
            <p>Select a user from the directory to start chatting.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Messages;
