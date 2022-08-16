import { Box } from '@chakra-ui/react';
import NextImage from 'next/image';
import PropTypes from 'prop-types';

const ChakraNextImage = (props) => {
  const {
    src, alt, objectFit, layout, quality, priority, classNameImg, styleImg, ...rest
  } = props;
  return (
    <Box position="relative" {...rest}>
      <NextImage
        className={classNameImg}
        style={styleImg}
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
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  alt: PropTypes.string.isRequired,
  quality: PropTypes.number,
  layout: PropTypes.string,
  priority: PropTypes.bool,
  objectFit: PropTypes.string,
  classNameImg: PropTypes.string,
  styleImg: PropTypes.objectOf(PropTypes.any),
};
ChakraNextImage.defaultProps = {
  src: '/static/images/code1.png',
  quality: 100,
  layout: 'fill',
  priority: false,
  objectFit: 'cover',
  classNameImg: '',
  styleImg: {},
};

export default ChakraNextImage;
