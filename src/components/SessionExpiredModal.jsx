import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './SessionExpiredModal.css';

export default function SessionExpiredModal() {
  const { sessionExpiredMessage, setSessionExpiredMessage } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionExpiredMessage) {
      // Auto-redirect to login after showing message
      const timer = setTimeout(() => {
        setSessionExpiredMessage(false);
        navigate('/login', { 
          state: { message: 'Your session has expired. Please log in again.' } 
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [sessionExpiredMessage, navigate, setSessionExpiredMessage]);

  if (!sessionExpiredMessage) return null;

  return (
    <div className="session-expired-overlay">
      <div className="session-expired-modal">
        <AlertCircle size={48} className="icon-warning" />
        <h2>Session Expired</h2>
        <p>Your session has expired. Please log in again.</p>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setSessionExpiredMessage(false);
            navigate('/login', { 
              state: { message: 'Your session has expired. Please log in again.' } 
            });
          }}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
