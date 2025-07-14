import { useState, useEffect } from 'react';

const useLocalStorage = (key, initialValue) => {
  // Función para obtener valor del localStorage
  const getStoredValue = () => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // Estado que se sincroniza con localStorage
  const [storedValue, setStoredValue] = useState(getStoredValue);

  // Función para actualizar tanto el estado como localStorage
  const setValue = (value) => {
    try {
      // Permitir que value sea una función para consistencia con useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Actualizar estado
      setStoredValue(valueToStore);
      
      // Actualizar localStorage
      if (valueToStore === null || valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Escuchar cambios en localStorage desde otras pestañas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue];
};

export default useLocalStorage;