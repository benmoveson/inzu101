import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function OTPVerification() {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [canResend, setCanResend] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const { verify2FA } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const email = location.state?.email;
    const userId = location.state?.userId;

    useEffect(() => {
        if (!email || !userId) {
            navigate('/signup');
            return;
        }

        // Countdown timer for resend
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [email, userId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit code');
            setIsLoading(false);
            return;
        }

        try {
            const result = await verify2FA(userId, otp);
            if (result.success) {
                navigate('/home');
            } else {
                setError(result.error || 'Invalid or expired code');
            }
        } catch {
            setError('An error occurred during verification');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setIsLoading(true);
        setError('');
        
        try {
            // Call backend to resend OTP
            const response = await fetch('/api/auth/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, email }),
            });

            if (response.ok) {
                setCanResend(false);
                setCountdown(60);
                setError('');
                
                // Restart countdown
                const timer = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            setCanResend(true);
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setError('Failed to resend code. Please try again.');
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only digits
        if (value.length <= 6) {
            setOtp(value);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <button 
                    className="back-button"
                    onClick={() => navigate('/signup')}
                    type="button"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="auth-header">
                    <div className="otp-icon">
                        <Shield size={48} />
                    </div>
                    <h1>Verify Your Account</h1>
                    <p>We sent a 6-digit code to</p>
                    <p className="email-display">{email}</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="otp">Enter 6-digit Code</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="otp"
                                placeholder="000000"
                                value={otp}
                                onChange={handleOtpChange}
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
                        {isLoading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>

                <div className="resend-section">
                    {canResend ? (
                        <button
                            type="button"
                            className="resend-button"
                            onClick={handleResend}
                            disabled={isLoading}
                        >
                            Resend Code
                        </button>
                    ) : (
                        <p className="resend-timer">
                            Resend code in {countdown}s
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
