/* eslint-disable react/no-array-index-key */
import { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Container, Img,
} from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import Heading from './Heading';

const MktPartners = ({ id, title, images }) => {
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
    <Container maxW="container.xl" px="10px" id={id} width="100%" overflowX="hidden" marginTop="20px">
      <Heading as="h2" textAlign="center" marginBottom="20px">{title}</Heading>
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
    </Container>
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
