import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, MessageSquare, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import './BottomNavigation.css';

function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { socket, isConnected, usePolling } = useWebSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count from API
  const fetchUnreadCount = async () => {
    if (!token) return;
    
    try {
      const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${serverUrl}/api/messages/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [token]);

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = () => {
      fetchUnreadCount();
    };

    const handleMessageRead = () => {
      fetchUnreadCount();
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_read', handleMessageRead);
    };
  }, [socket, isConnected]);

  // Polling fallback
  useEffect(() => {
    if (!usePolling) return;

    const handlePollingUpdate = (event) => {
      if (event.detail.type === 'messages') {
        setUnreadCount(event.detail.unreadCount || 0);
      }
    };

    window.addEventListener('polling-update', handlePollingUpdate);

    return () => {
      window.removeEventListener('polling-update', handlePollingUpdate);
    };
  }, [usePolling]);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/home' },
    { id: 'search', label: 'Search', icon: Search, path: '/search' },
    { id: 'favorites', label: 'Favorites', icon: Heart, path: '/favorites' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages', badge: unreadCount },
    { id: 'profile', label: 'Settings', icon: User, path: '/profile' }
  ];

  const isActive = (path) => {
    // Handle /profile and all its sub-routes as profile tab
    if (path === '/profile') {
      return location.pathname.startsWith('/profile') || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="bottom-navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);
        
        return (
          <button
            key={tab.id}
            className={`bottom-nav-tab ${active ? 'active' : ''}`}
            onClick={() => handleNavigation(tab.path)}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            <div className="bottom-nav-icon-wrapper">
              <Icon className="bottom-nav-icon" size={24} />
              {tab.badge > 0 && (
                <span className="bottom-nav-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>
              )}
            </div>
            <span className="bottom-nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNavigation;
