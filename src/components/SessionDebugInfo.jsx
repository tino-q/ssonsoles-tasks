import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SessionDebugInfo = ({ user, getSessionInfo }) => {
  const [showDebug, setShowDebug] = useState(false);
  const { t } = useTranslation();
  
  if (!user || process.env.NODE_ENV === 'production') return null;

  const sessionInfo = getSessionInfo();
  if (!sessionInfo) return null;

  const formatTime = (date) => {
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="session-debug">
      <button 
        onClick={() => setShowDebug(!showDebug)}
        className="debug-toggle"
        title="Session Debug Info"
      >
        🔍
      </button>
      
      {showDebug && (
        <div className="debug-panel">
          <h4>Session Info (Dev)</h4>
          <div className="debug-item">
            <strong>User:</strong> {user.name} ({user.id})
          </div>
          <div className="debug-item">
            <strong>Login:</strong> {formatTime(sessionInfo.loginTime)}
          </div>
          <div className="debug-item">
            <strong>Last Activity:</strong> {formatTime(sessionInfo.lastActivity)}
          </div>
          <div className="debug-item">
            <strong>Time Logged:</strong> {formatDuration(sessionInfo.timeLoggedIn)}
          </div>
          <div className="debug-item">
            <strong>Session Restored:</strong> {sessionInfo.isSessionRestored ? 'Yes' : 'No'}
          </div>
          <div className="debug-item">
            <strong>Days Until Expiry:</strong> {sessionInfo.daysUntilExpiry.toFixed(1)}
          </div>
          <div className="debug-item">
            <strong>Language:</strong> {localStorage.getItem('cleaningApp.language') || 'es'}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDebugInfo;