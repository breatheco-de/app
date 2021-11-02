import { Box } from '@chakra-ui/react';
import NextImage from 'next/image';
import PropTypes from 'prop-types';

const ChakraNextImage = (props) => {
  const {
    src, alt, objectFit, layout, quality, priority, classNameImg, ...rest
  } = props;
  return (
    <Box position="relative" {...rest}>
      <NextImage
        className={classNameImg}
        objectFit={objectFit}
        layout={layout}
        quality={quality}
        src={src}
        alt={alt}
      />
    </Box>
  );
};

ChakraNextImage.propTypes = {
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  alt: PropTypes.string.isRequired,
  quality: PropTypes.number,
  layout: PropTypes.string,
  priority: PropTypes.bool,
  objectFit: PropTypes.string,
  classNameImg: PropTypes.string,
};
ChakraNextImage.defaultProps = {
  quality: 100,
  layout: 'fill',
  priority: false,
  objectFit: 'cover',
  classNameImg: '',
};

export default ChakraNextImage;
