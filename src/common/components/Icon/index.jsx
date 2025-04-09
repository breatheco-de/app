import React, { memo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { Box } from '@chakra-ui/react';
import iconDict from '../../../iconDict.json';

function Icon({
  icon, width, size, height, style, color, secondColor, fill, className, props, full, text, ...rest
}) {
  const [isMounted, setIsMounted] = useState(false);

  if (typeof window === 'undefined' || !window) return '';
  const iconExists = iconDict.includes(icon);

  const Comp = dynamic(() => import(`./set/${iconExists ? icon : 'info'}`));

  // fix hydration error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted && (
    <Box as="span" id={`icon-${icon}`} className={className} {...rest}>
      <Comp
        width={size || width}
        height={size || height}
        style={{
          ...style,
          minWidth: size || width,
          height: size || height,
        }}
        color={color}
        secondColor={secondColor}
        fill={fill}
        full={full}
        text={text}
        {...props}
      />
    </Box>
  );
}

Icon.propTypes = {
  icon: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  color: PropTypes.string,
  secondColor: PropTypes.string,
  fill: PropTypes.string,
  full: PropTypes.bool,
  className: PropTypes.string,
  props: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  style: PropTypes.shape({
    transform: PropTypes.string,
    transition: PropTypes.string,
  }),
  text: PropTypes.string,
  size: PropTypes.string,
};
Icon.defaultProps = {
  icon: '',
  size: '',
  style: {},
  width: '',
  height: '',
  color: '',
  secondColor: '',
  fill: '',
  full: false,
  className: '',
  props: {},
  text: '',
};
export default memo(Icon);
