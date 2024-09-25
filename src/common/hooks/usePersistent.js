import { useState, useMemo } from 'react';
import { isWindow } from '../../utils/index';

const usePersistent = (key, initialValue) => {
  const getStoredValues = useMemo(() => {
    const item = isWindow ? window.localStorage.getItem(key) : null;
    return JSON.parse(item) || initialValue;
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(getStoredValues);

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('usePersistent_error:', error);
    }
  };
  return [storedValue, setValue];
};

const usePersistentBySession = (key, initialValue) => {
  const getStoredValues = useMemo(() => {
    if (typeof window === 'undefined') return initialValue;

    const item = isWindow ? window.sessionStorage.getItem(key) : null;
    if (item === null) return initialValue;

    if (item.startsWith('{') || item.startsWith('[')) {
      return JSON.parse(item);
    }

    return item;
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(getStoredValues);

  const setValue = (value) => {
    setStoredValue(value);
    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
    window.sessionStorage.setItem(key, valueToStore);
  };
  return [storedValue, setValue];
};

export {
  usePersistent,
  usePersistentBySession,
};
