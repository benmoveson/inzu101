import { AlertCircle, RefreshCw } from 'lucide-react';
import './ErrorMessage.css';

export default function ErrorMessage({ message, onRetry, type = 'error' }) {
  const isNetworkError = message?.toLowerCase().includes('connection') || 
                         message?.toLowerCase().includes('network');

  return (
    <div className={`error-message ${type}`}>
      <div className="error-content">
        <AlertCircle size={24} />
        <div className="error-text">
          <p className="error-title">
            {isNetworkError ? 'Connection Error' : 'Error'}
          </p>
          <p className="error-description">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          <RefreshCw size={16} />
          Retry
        </button>
      )}
    </div>
  );
}
