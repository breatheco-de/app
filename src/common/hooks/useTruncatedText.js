import { useEffect, useRef, useState } from 'react';

const useTruncatedText = (text, limit = 40) => {
  const [truncatedText, setTruncatedText] = useState('');
  const originalText = useRef(text);

  useEffect(() => {
    if (originalText?.current?.length > limit) {
      setTruncatedText(`${originalText.current.substring(0, limit)}...`);
    } else {
      setTruncatedText(originalText.current);
    }
  }, []);

  const handleMouseOver = () => {
    setTruncatedText(originalText.current);
  };

  const handleMouseOut = () => {
    if (originalText?.current?.length > limit) {
      setTruncatedText(`${originalText.current.substring(0, limit)}...`);
    } else {
      setTruncatedText(originalText.current);
    }
  };

  return [truncatedText, handleMouseOver, handleMouseOut];
};

export default useTruncatedText;
