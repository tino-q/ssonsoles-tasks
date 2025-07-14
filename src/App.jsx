import { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import CleanerPanel from "./components/CleanerPanel";
import LoginForm from "./components/LoginForm";
import GlobalSpinner from "./components/GlobalSpinner";
import LanguageSelector from "./components/LanguageSelector";
import SessionNotification from "./components/SessionNotification";
import SessionDebugInfo from "./components/SessionDebugInfo";
import { LoadingProvider } from "./context/LoadingContext";
import useAuth from "./hooks/useAuth";
import "./App.css";

function App() {
  const { user, isLoggedIn, login, logout, updateLastActivity, getSessionInfo } = useAuth();
  const { t } = useTranslation();

  // Actualizar última actividad en cada interacción (throttled)
  useEffect(() => {
    let lastActivityUpdate = 0;
    
    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle: solo ejecutar updateLastActivity una vez por minuto
      if (now - lastActivityUpdate > 60000) {
        lastActivityUpdate = now;
        updateLastActivity();
      }
    };

    // Escuchar solo eventos significativos de actividad del usuario
    const events = ['click', 'keydown', 'scroll'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [updateLastActivity]);

  return (
    <LoadingProvider>
      <div className="App">
        <header className="app-header">
          <div className="header-top">
            <h1>{t('app.title')}</h1>
            <LanguageSelector />
          </div>
          {isLoggedIn && (
            <div className="user-info">
              <span>{t('app.welcome', { name: user?.name })}</span>
              <button onClick={logout} className="logout-btn">
                {t('app.logout')}
              </button>
            </div>
          )}
        </header>

        <main className="app-main">
          {!isLoggedIn ? (
            <LoginForm onLogin={login} />
          ) : (
            <CleanerPanel currentUser={user} />
          )}
        </main>
        
        <GlobalSpinner />
        <SessionNotification user={user} />
        <SessionDebugInfo user={user} getSessionInfo={getSessionInfo} />
      </div>
    </LoadingProvider>
  );
}

export default App;
