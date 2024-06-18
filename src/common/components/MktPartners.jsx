/* eslint-disable react/no-array-index-key */
// import { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Img,
} from '@chakra-ui/react';
// import { motion, useAnimation } from 'framer-motion';
import { useRef } from 'react';
import Heading from './Heading';
import GridContainer from './GridContainer';
import useGrabToScroll from '../hooks/useGrabToScroll';
import { toCapitalize } from '../../utils';

function MktPartners({ id, title, images, ...rest }) {
  const scrollContainerRef = useRef(null);
  const { grabToScroll } = useGrabToScroll({ ref: scrollContainerRef, horizontal: true });
  // const bgColor = useColorModeValue('', 'white');

  const cleanImages = images.length > 0 && typeof images[0] === 'string' ? images : images.map((obj) => obj.text);
  const limitedImages = cleanImages.splice(0, 5);
  // const controls = useAnimation();
  // const observer = useRef();
  // const motionRef = useRef(false);

  // const animationSettings = {
  //   x: [0, -150 * cleanImages.length],
  //   transition: {
  //     x: {
  //       repeat: Infinity,
  //       repeatType: 'loop',
  //       duration: 30,
  //       ease: 'linear',
  //     },
  //   },
  // };

  // const lastElementRef = useCallback((node) => {
  //   if (observer.current) observer.current.disconnect();
  //   observer.current = new IntersectionObserver((entries) => {
  //     if (!entries[0].isIntersecting) {
  //       motionRef.current = true;
  //       controls.start(animationSettings);
  //     } else if (motionRef.current) setTimeout(controls.start, 5000, animationSettings);
  //   }, { rootMargin: '100% 0% 100% 0%' });
  //   if (node) observer.current.observe(node);
  // }, [motionRef]);

  return (
    <GridContainer
      id={id}
      gridTemplateColumns="repeat(10, 1fr)"
      maxWidth="1280px"
      px={{ base: '10px', md: '2rem' }}
      {...rest}
    >
      <Box
        display={{ base: 'block', md: 'grid' }}
        gridColumn="2 / span 8"
      >
        <Heading as="h2" size="sm" textAlign="center" mb="1rem">{title}</Heading>
      </Box>
      <Box
        display={{ base: 'block', md: 'grid' }}
        gridColumn="2 / span 8"
        px={{ base: '10px', md: '0' }}
        width="100%"
      >
        <Box
          ref={scrollContainerRef}
          width="100%"
          // height="70px"
          className="hideOverflowX__"
          onMouseDown={grabToScroll}
          overflowX="auto"
          style={{
            display: 'flex',
            gridGap: '15px',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {limitedImages.map((image, i) => {
            const altTitle = image.split('/logos/')[1].split('.')[0].replace('-', ' ');

            return (limitedImages.length === i + 1 ? (
              <Img
                key={`image-${i}`}
                src={image}
                height="76px"
                margin="0 20px"
                borderRadius="5px"
                padding="6px"
                background="white"
                maxWidth="186px"
                objectFit="contain"
                title={toCapitalize(altTitle)}
                alt={altTitle}
              />
            ) : (
              <Img
                key={`image-${i}`}
                src={image}
                height="76px"
                margin="0 20px"
                borderRadius="5px"
                padding="6px"
                background="white"
                maxWidth="186px"
                objectFit="contain"
                title={toCapitalize(altTitle)}
                alt={altTitle}
              />
            ));
          })}
        </Box>
      </Box>
    </GridContainer>
  );
}

MktPartners.propTypes = {
  title: PropTypes.string,
  images: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  id: PropTypes.string,
};

MktPartners.defaultProps = {
  title: null,
  images: [],
  id: '',
};

export default MktPartners;
