import { User, BarChart3, Settings as SettingsIcon, Shield, Loader2, Camera, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
    const { user, updateUser, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editedProfile, setEditedProfile] = useState({
        name: '',
        email: '',
        phone: '',
        location: ''
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isAvatarLoading, setIsAvatarLoading] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (user) {
            setEditedProfile({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                location: user.location || ''
            });
        }
    }, [user]);

    // Auto-dismiss messages after 3 seconds
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleAvatarClick = () => {
        document.getElementById('avatar-input').click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsAvatarLoading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const token = localStorage.getItem('inzu_token');
            const res = await fetch('http://localhost:5000/api/users/avatar', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                updateUser({ avatar: data.avatar });
                setMessage({ type: 'success', text: 'Profile picture updated!' });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to upload image.' });
        } finally {
            setIsAvatarLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!confirm('Are you sure you want to remove your profile picture?')) return;

        setIsAvatarLoading(true);
        try {
            const token = localStorage.getItem('inzu_token');
            const res = await fetch('http://localhost:5000/api/users/avatar', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                updateUser({ avatar: null });
                setMessage({ type: 'success', text: 'Profile picture removed!' });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to remove image.' });
        } finally {
            setIsAvatarLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        setMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('inzu_token');
            const res = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editedProfile)
            });

            const data = await res.json();
            if (res.ok) {
                updateUser(data.user);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setIsSavingProfile(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Loader2 className="animate-spin" size={48} />
                <p>Loading profile...</p>
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
                            <div className="avatar-upload-container">
                                <div
                                    className={`profile-avatar ${isAvatarLoading ? 'loading' : ''}`}
                                    onClick={handleAvatarClick}
                                    style={{ cursor: 'pointer', position: 'relative' }}
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} />
                                    ) : (
                                        <User size={32} />
                                    )}
                                    <div className="avatar-overlay">
                                        <Camera size={20} color="white" />
                                    </div>
                                    {isAvatarLoading && (
                                        <div className="avatar-loader">
                                            <Loader2 size={24} className="animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    id="avatar-input"
                                    hidden
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <h3>{user.name}</h3>
                            <p>{user.email}</p>
                            {user.avatar && (
                                <button
                                    className="btn-remove-avatar"
                                    onClick={handleRemoveAvatar}
                                    disabled={isAvatarLoading}
                                >
                                    <Trash2 size={14} />
                                    Remove Photo
                                </button>
                            )}
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
                            <h2 className="section-title">Personal Information</h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={editedProfile.name}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        className="input"
                                        value={editedProfile.email}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        className="input"
                                        value={editedProfile.phone}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                        placeholder="Not provided"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={editedProfile.location}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                                        placeholder="Not provided"
                                    />
                                </div>
                            </div>
                            <button
                                className="btn btn-primary btn-normal"
                                onClick={handleSaveProfile}
                                disabled={isSavingProfile}
                            >
                                {isSavingProfile ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
