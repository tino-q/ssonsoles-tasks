import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SessionNotification = ({ user, onClose }) => {
  const [show, setShow] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (user && user.loginTime) {
      const loginTime = new Date(user.loginTime);
      const now = new Date();
      const timeDiff = now - loginTime;
      
      // Mostrar notificación si la sesión se restauró (login time es anterior a hace 5 minutos)
      if (timeDiff > 5 * 60 * 1000) {
        setShow(true);
        
        // Auto-ocultar después de 4 segundos
        const timer = setTimeout(() => {
          setShow(false);
          if (onClose) onClose();
        }, 4000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user, onClose]);

  if (!show) return null;

  return (
    <div className="session-notification">
      <div className="notification-content">
        <span className="notification-icon">👋</span>
        <span className="notification-message">
          {t('session.welcome', { name: user?.name })}
        </span>
        <button 
          onClick={() => setShow(false)}
          className="notification-close"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SessionNotification;