import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

export default function ResetPassword() {
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Enter OTP, 2: Set new password
    const navigate = useNavigate();
    const location = useLocation();
    
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit code');
            setIsLoading(false);
            return;
        }

        // Verify OTP is valid before moving to password step
        try {
            const response = await fetch('/api/auth/verify-reset-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            if (response.ok) {
                setStep(2);
                setError('');
            } else {
                const data = await response.json();
                setError(data.message || 'Invalid or expired code');
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                // Show success and redirect to login
                navigate('/login', { 
                    state: { message: 'Password reset successful! Please log in with your new password.' }
                });
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="otp-icon">
                        <Shield size={48} />
                    </div>
                    <h1>{step === 1 ? 'Enter Reset Code' : 'Set New Password'}</h1>
                    <p>
                        {step === 1 
                            ? `We sent a 6-digit code to ${email}`
                            : 'Choose a strong password for your account'
                        }
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}

                {step === 1 ? (
                    <form className="auth-form" onSubmit={handleOtpSubmit}>
                        <div className="form-group">
                            <label htmlFor="otp">Enter 6-digit Code</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    id="otp"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 6) setOtp(value);
                                    }}
                                    maxLength="6"
                                    required
                                    className="otp-input"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.875rem', marginTop: '1rem' }}
                            disabled={isLoading || otp.length !== 6}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="newPassword"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="field-hint">Minimum 8 characters</p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.875rem', marginTop: '1rem' }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
