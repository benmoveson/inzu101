import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Home, MessageSquare, Loader2, CheckCheck } from 'lucide-react';
import './NotificationCenter.css';

export default function NotificationCenter() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('inzu_token');
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } else {
        setError('Failed to load notifications');
      }
    } catch {
      setError('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('inzu_token');
      const res = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setNotifications(notifications.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('inzu_token');
      const res = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Navigate to relevant screen
    if (notification.type === 'new_listing') {
      navigate(`/property/${notification.relatedId}`);
    } else if (notification.type === 'inquiry_reply') {
      navigate(`/inquiries`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_listing':
        return <Home size={24} color="#3b82f6" />;
      case 'inquiry_reply':
        return <MessageSquare size={24} color="#10b981" />;
      default:
        return <Bell size={24} color="#6b7280" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading || isLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" size={48} />
        <p>Loading notifications...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="notification-center-page">
      <div className="container">
        {/* Header */}
        <div className="notification-header">
          <div>
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <p className="unread-badge">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn btn-secondary">
              <CheckCheck size={20} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Notifications List */}
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={64} color="#ccc" />
              <h3>No notifications yet</h3>
              <p>You'll see notifications here when you receive updates</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
                {!notification.read && (
                  <div className="notification-dot"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
