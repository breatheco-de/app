import { useState, useMemo } from 'react';

const usePersistent = (key, initialValue) => {
  const getStoredValues = useMemo(() => {
    const item = window.localStorage.getItem(key);
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

export default usePersistent;
