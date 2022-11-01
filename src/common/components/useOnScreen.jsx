import { useEffect, useState, useRef } from 'react';

const useOnScreen = (ref, options) => {
  const [isOnScreen, setIsOnScreen] = useState(false);
  const observerRef = useRef(null);
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      ([entry]) => setIsOnScreen(entry.isIntersecting),
      options,
    );
  }, []);

  useEffect(() => {
    observerRef.current.observe(ref.current);

    return () => {
      observerRef.current.disconnect();
    };
  }, [ref]);

  return isOnScreen;
};

export default useOnScreen;
