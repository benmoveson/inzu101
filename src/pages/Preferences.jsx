import { User, BarChart3, Settings as SettingsIcon, Shield, Loader2, Moon, Sun } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Profile.css';

export default function Preferences() {
    const { user, updateUser, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Auto-dismiss messages after 3 seconds
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (loading) {
        return (
            <div className="loading-container">
                <Loader2 className="animate-spin" size={48} />
                <p>Loading preferences...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const menuItems = [
        { id: 'personal', label: 'Personal Information', icon: User, path: '/profile' },
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/profile/dashboard' },
        { id: 'preferences', label: 'Preferences', icon: SettingsIcon, path: '/profile/preferences' },
        { id: 'security', label: 'Security', icon: Shield, path: '/profile/security' },
        { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/profile/settings' },
    ];

    return (
        <div className="profile-page-new">
            <div className="container">
                <div className="profile-layout">
                    {/* Sidebar */}
                    <aside className="profile-sidebar">
                        <div className="profile-sidebar-header">
                            <div className="profile-avatar">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} />
                                ) : (
                                    <User size={32} />
                                )}
                            </div>
                            <h3>{user.name}</h3>
                            <p>{user.email}</p>
                        </div>

                        <nav className="profile-nav">
                            {menuItems.map(item => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <button
                                        key={item.id}
                                        className={`profile-nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="profile-main">
                        {message.text && (
                            <div className={`alert alert-${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="profile-section">
                            <h2 className="section-title">Preferences</h2>
                            <div className="preferences-list">
                                <div className="preference-item">
                                    <div>
                                        <h4>Theme</h4>
                                        <p>Switch between light and dark mode</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            toggleTheme();
                                            setMessage({ type: 'success', text: 'Theme updated!' });
                                        }}
                                        className="theme-toggle-btn"
                                        aria-label="Toggle theme"
                                    >
                                        {theme === 'light' ? (
                                            <Moon size={20} />
                                        ) : (
                                            <Sun size={20} />
                                        )}
                                        <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
                                    </button>
                                </div>
                                <div className="preference-item">
                                    <div>
                                        <h4>Language</h4>
                                        <p>Choose your preferred language</p>
                                    </div>
                                    <select
                                        value={user.language || 'en'}
                                        onChange={async (e) => {
                                            const token = localStorage.getItem('inzu_token');
                                            const res = await fetch('http://localhost:5000/api/users/profile', {
                                                method: 'PATCH',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${token}`
                                                },
                                                body: JSON.stringify({ language: e.target.value })
                                            });
                                            if (res.ok) {
                                                updateUser({ language: e.target.value });
                                                setMessage({ type: 'success', text: 'Language updated!' });
                                            }
                                        }}
                                        className="input"
                                    >
                                        <option value="en">English</option>
                                        <option value="rw">Kinyarwanda</option>
                                        <option value="fr">Français</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
