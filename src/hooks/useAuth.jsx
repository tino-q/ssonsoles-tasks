import { useState, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

const useAuth = () => {
  const [user, setUser] = useLocalStorage('cleaningApp.user', null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verificar si hay una sesión válida al cargar
  useEffect(() => {
    if (user && user.id && user.name && user.phone) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);

  const login = (userData) => {
    // Guardar datos del usuario con timestamp
    const userWithTimestamp = {
      ...userData,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    setUser(userWithTimestamp);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateLastActivity = () => {
    if (user) {
      // Solo actualizar si han pasado más de 5 minutos desde la última actualización
      const now = new Date();
      const lastActivity = user.lastActivity ? new Date(user.lastActivity) : new Date(0);
      const timeDiff = now - lastActivity;
      
      // Actualizar solo cada 5 minutos (300000 ms)
      if (timeDiff > 300000) {
        setUser(prevUser => ({
          ...prevUser,
          lastActivity: now.toISOString()
        }));
      }
    }
  };

  // Verificar si la sesión ha expirado (opcional: después de 7 días)
  const isSessionValid = () => {
    if (!user || !user.loginTime) return false;
    
    const loginTime = new Date(user.loginTime);
    const now = new Date();
    const daysElapsed = (now - loginTime) / (1000 * 60 * 60 * 24);
    
    // Sesión válida por 7 días
    return daysElapsed < 7;
  };

  // Obtener información de la sesión
  const getSessionInfo = () => {
    if (!user || !user.loginTime) return null;
    
    const loginTime = new Date(user.loginTime);
    const lastActivity = user.lastActivity ? new Date(user.lastActivity) : loginTime;
    const now = new Date();
    
    return {
      loginTime,
      lastActivity,
      timeLoggedIn: now - loginTime,
      isSessionRestored: (now - loginTime) > 5 * 60 * 1000, // Más de 5 minutos
      daysUntilExpiry: 7 - (now - loginTime) / (1000 * 60 * 60 * 24)
    };
  };

  // Verificar validez de sesión al cargar
  useEffect(() => {
    if (user && !isSessionValid()) {
      logout();
    }
  }, [user]);

  return {
    user,
    isLoggedIn,
    login,
    logout,
    updateLastActivity,
    isSessionValid,
    getSessionInfo
  };
};

export default useAuth;