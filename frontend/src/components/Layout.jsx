import React, { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { 
  Home, 
  Briefcase, 
  Calendar, 
  Beaker, 
  LogOut, 
  User, 
  Bell,
  MessageSquare
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetchNotifs();
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    fetchNotifs();
    setShowNotifs(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase size={20} /> },
    { name: 'Events', path: '/events', icon: <Calendar size={20} /> },
    { name: 'Research', path: '/research', icon: <Beaker size={20} /> },
    { name: 'Messages', path: '/messages', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        position: 'fixed',
        height: '100vh',
        borderRight: '1px solid var(--surface-border)',
        background: 'var(--surface-color)',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ marginBottom: '3rem', paddingLeft: '1rem' }}>
          <h2 style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
             LMS<span style={{color: 'white'}}>University</span>
          </h2>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                color: location.pathname === item.path ? 'white' : 'var(--text-muted)',
                background: location.pathname === item.path ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                borderLeft: location.pathname === item.path ? '3px solid var(--primary-color)' : '3px solid transparent',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              {React.cloneElement(item.icon, { 
                color: location.pathname === item.path ? 'var(--primary-color)' : 'currentColor' 
              })}
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Footer */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid var(--surface-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white', flex: 1 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name ? user.name.charAt(0) : user?.email?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
          </Link>
          <button onClick={logout} className="btn-icon" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--surface-border)',
          position: 'relative'
        }}>
           <button className="btn-icon" onClick={() => { setShowNotifs(!showNotifs); if(!showNotifs) fetchNotifs(); }} style={{ position: 'relative' }}>
             <Bell size={20} />
             {notifications.filter(n => !n.isRead).length > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--danger-color)', width: 8, height: 8, borderRadius: '50%' }}></span>
             )}
           </button>
           
           {showNotifs && (
             <div className="glass-card animate-fade-in" style={{ position: 'absolute', top: '50px', right: '0', width: '320px', zIndex: 50, padding: '1rem' }}>
                <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0 }}>Notifications</h4>
                  {notifications.filter(n => !n.isRead).length > 0 && (
                     <button className="btn-icon" onClick={markAllRead} style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>Mark all read</button>
                  )}
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', textAlign: 'center' }}>You're all caught up!</p>
                  ) : notifications.map(n => (
                    <div key={n.id} style={{ padding: '0.75rem', background: n.isRead ? 'transparent' : 'rgba(79, 70, 229, 0.1)', borderRadius: 'var(--radius-md)', borderLeft: n.isRead ? '3px solid transparent' : '3px solid var(--primary-color)' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: n.isRead ? 'var(--text-muted)' : 'var(--text-main)' }}>{n.message}</p>
                      <div className="flex-between" style={{ marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                        {!n.isRead && <button onClick={() => markAsRead(n.id)} style={{ border: 'none', background: 'transparent', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.75rem' }}>Mark read</button>}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           )}
        </header>

        {/* Page specific content renders here */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
