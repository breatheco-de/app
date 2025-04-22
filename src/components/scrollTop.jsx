import { ArrowUpIcon } from '@chakra-ui/icons';
import { Box, IconButton } from '@chakra-ui/react';
import { useRef, useState, useEffect } from 'react';
import { isWindow } from '../utils';

const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function ScrollTop() {
  const prevScrollY = useRef(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = isWindow && window.scrollY;
      if (prevScrollY.current > 400) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }

      prevScrollY.current = currentScrollY;
    };
    if (isWindow) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => isWindow && window.removeEventListener('scroll', handleScroll);
  }, [showScrollToTop]);

  return (
    <Box
      bottom="20px"
      position="fixed"
      right="30px"
      zIndex={33}
      // left="95%"
    >
      <IconButton
        aria-label="Scroll to top"
        icon={<ArrowUpIcon />}
        onClick={scrollTop}
        borderRadius="full"
        style={{ height: 40, display: showScrollToTop ? 'flex' : 'none' }}
        animation="fadeIn 0.3s"
        justifyContent="center"
        height="20px"
        variant="default"
        transition="opacity 0.4s"
        opacity="0.5"
        _hover={{
          opacity: 1,
        }}
      />
    </Box>
  );
}

export default ScrollTop;
