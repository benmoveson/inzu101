import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home as HouseIcon } from 'lucide-react';
import './SplashScreen.css';

export default function SplashScreen() {
    const { user, loading, getToken } = useAuth();
    const navigate = useNavigate();
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        // Ensure minimum display time of 2 seconds
        const minDisplayTimer = setTimeout(() => {
            setAnimationComplete(true);
        }, 2000);

        return () => clearTimeout(minDisplayTimer);
    }, []);

    useEffect(() => {
        if (!loading && animationComplete) {
            const token = getToken();
            
            if (user && token) {
                // Valid session exists, go to Home Feed
                navigate('/home');
            } else {
                // No valid session, go to Login
                navigate('/login');
            }
        }
    }, [loading, user, getToken, navigate, animationComplete]);

    return (
        <div className="splash-screen">
            <div className="splash-content">
                <div className="splash-logo">
                    <HouseIcon size={80} strokeWidth={2.5} />
                </div>
                <h1 className="splash-title">INZU</h1>
                <p className="splash-tagline">Find your dream property in Rwanda</p>
                <div className="splash-loader">
                    <div className="loader-spinner"></div>
                </div>
            </div>
        </div>
    );
}
