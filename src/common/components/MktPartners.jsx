/* eslint-disable react/no-array-index-key */
import { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Img,
} from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import Heading from './Heading';
import GridContainer from './GridContainer';

const MktPartners = ({ id, title, images, ...rest }) => {
  const cleanImages = images.length > 0 && typeof images[0] === 'string' ? images : images.map((obj) => obj.text);
  const controls = useAnimation();
  const observer = useRef();
  const motionRef = useRef(false);

  const animationSettings = {
    x: [0, -150 * cleanImages.length],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 30,
        ease: 'linear',
      },
    },
  };

  const lastElementRef = useCallback((node) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) {
        motionRef.current = true;
        controls.start(animationSettings);
      } else if (motionRef.current) setTimeout(controls.start, 5000, animationSettings);
    }, { rootMargin: '100% 0% 100% 0%' });
    if (node) observer.current.observe(node);
  }, [motionRef]);

  return (
    <GridContainer
      id={id}
      gridTemplateColumns="repeat(10, 1fr)"
      px={{ base: '10px', md: '0' }}
      {...rest}
    >
      <Box
        display={{ base: 'block', md: 'grid' }}
        gridColumn="2 / span 8"
      >
        <Heading as="h2" textAlign="center" marginBottom="20px">{title}</Heading>
      </Box>
      <Box
        display={{ base: 'block', md: 'grid' }}
        gridColumn="2 / span 8"
        px={{ base: '10px', md: '0' }}
        width="100%"
        overflowX="hidden"
      >
        <motion.div
          width="100%"
          height="55px"
          animate={controls}
          style={{
            display: 'flex',
            gridGap: '15px',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {cleanImages.map((image, i) => (cleanImages.length === i + 1 ? (
            <Img
              ref={lastElementRef}
              key={`image-${i}`}
              src={image}
              height="55px"
              margin="0 20px"
              maxWidth="160px"
            />
          ) : (
            <Img
              key={`image-${i}`}
              src={image}
              height="55px"
              margin="0 20px"
              maxWidth="160px"
            />
          )))}
        </motion.div>
      </Box>
    </GridContainer>
  );
};

MktPartners.propTypes = {
  title: PropTypes.string,
  images: PropTypes.arrayOf(PropTypes.any),
  id: PropTypes.string,
};

MktPartners.defaultProps = {
  title: null,
  images: [],
  id: '',
};

export default MktPartners;
