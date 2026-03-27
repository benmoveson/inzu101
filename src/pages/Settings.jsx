import { User, BarChart3, Settings as SettingsIcon, Shield, LogOut, Loader2, Trash2, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Profile.css';

export default function Settings() {
    const { user, logout, updateUser, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Account deletion modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeletePassword, setShowDeletePassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        
        if (!deletePassword.trim()) {
            setMessage({ type: 'error', text: 'Please enter your password' });
            return;
        }

        setIsDeleting(true);
        try {
            const token = localStorage.getItem('inzu_token');
            const res = await fetch('http://localhost:5000/api/users/account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: deletePassword })
            });

            const data = await res.json();
            
            if (res.ok) {
                // Clear session and navigate to login
                localStorage.removeItem('inzu_token');
                setMessage({ type: 'success', text: 'Account deleted successfully' });
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to delete account' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete account' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Loader2 className="animate-spin" size={48} />
                <p>Loading settings...</p>
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

                        {/* Profile Section */}
                        <div className="profile-section">
                            <h2 className="section-title">Profile</h2>
                            <p className="section-description">Manage your personal information</p>
                            <button
                                className="btn btn-secondary btn-normal"
                                onClick={() => navigate('/profile')}
                            >
                                Edit Profile
                            </button>
                        </div>

                        {/* Security Section */}
                        <div className="profile-section">
                            <h2 className="section-title">Security</h2>
                            <p className="section-description">Manage your password and security settings</p>
                            <button
                                className="btn btn-secondary btn-normal"
                                onClick={() => navigate('/profile/security')}
                            >
                                Security Settings
                            </button>
                        </div>

                        {/* Preferences Section */}
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
                                        <h4>Notifications</h4>
                                        <p>Manage notification preferences</p>
                                    </div>
                                    <button
                                        className="btn btn-secondary btn-normal"
                                        onClick={() => navigate('/profile/preferences')}
                                    >
                                        Manage
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Account Section */}
                        <div className="profile-section">
                            <h2 className="section-title">Account</h2>
                            <div className="account-actions">
                                <button
                                    className="btn btn-secondary btn-normal"
                                    onClick={() => navigate('/terms')}
                                >
                                    Terms & Conditions
                                </button>
                                <button
                                    className="btn btn-secondary btn-normal"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                                <button
                                    className="btn btn-danger btn-normal"
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    <Trash2 size={18} />
                                    <span>Delete Account</span>
                                </button>
                            </div>
                        </div>

                        {/* Delete Account Modal */}
                        {showDeleteModal && (
                            <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                                <div className="modal-card card animate-pop" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h3>Delete Account</h3>
                                        <button className="btn-close" onClick={() => setShowDeleteModal(false)}>×</button>
                                    </div>
                                    <div className="modal-body">
                                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                            Are you sure you want to delete your account? This action cannot be undone. 
                                            All your data including favorites, inquiries, and messages will be permanently deleted.
                                        </p>
                                        <form onSubmit={handleDeleteAccount}>
                                            <div className="form-group">
                                                <label>Confirm your password</label>
                                                <div className="input-with-icon">
                                                    <input
                                                        type={showDeletePassword ? "text" : "password"}
                                                        className="input"
                                                        value={deletePassword}
                                                        onChange={(e) => setDeletePassword(e.target.value)}
                                                        placeholder="Enter your password"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-toggle-btn"
                                                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                                                    >
                                                        {showDeletePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    style={{ flex: 1 }}
                                                    onClick={() => setShowDeleteModal(false)}
                                                    disabled={isDeleting}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn btn-danger"
                                                    style={{ flex: 1 }}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
