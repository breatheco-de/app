import PropTypes from 'prop-types';
import {
  Container, Img,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Heading from './Heading';

const MktPartners = ({ id, title, images }) => {
  const cleanImages = images.length > 0 && typeof images[0] === 'string' ? images : images.map((obj) => obj.text);
  const marqueeVariants = {
    animate: {
      x: [0, -130 * cleanImages.length],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: 30,
          ease: 'linear',
        },
      },
    },
  };
  return (
    <Container maxW="container.xl" px="10px" id={id} width="100%" overflowX="hidden" marginTop="20px">
      <Heading as="h1" textAlign="center" marginBottom="20px">{title}</Heading>
      <motion.div
        width="100%"
        height="60px"
        variants={marqueeVariants}
        animate="animate"
        display="flex"
        style={{
          display: 'flex',
          gridGap: '15px',
          width: '100%',
        }}
      >
        {cleanImages.map((image) => (
          <Img
            key={image}
            src={image}
            height="60px"
            margin="0 20px"
          />
        ))}
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
