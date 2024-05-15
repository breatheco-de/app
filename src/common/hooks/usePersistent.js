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
    const item = isWindow ? window.sessionStorage.getItem(key) : null;
    const isObject = typeof item === 'object';
    const objectValue = JSON.parse(item) || initialValue;
    return isObject ? objectValue : item || initialValue;
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(getStoredValues);

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('usePersistent_error:', error);
    }
  };
  return [storedValue, setValue];
};

export {
  usePersistent,
  usePersistentBySession,
};
