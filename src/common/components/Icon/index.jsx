import React, { memo } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { Box } from '@chakra-ui/react';
import iconDic from '../../utils/iconDict.json';

function Icon({
  icon, width, height, style, color, secondColor, fill, className, props, full, text, ...rest
}) {
  if (typeof window === 'undefined' || !window) return '';
  const iconExists = iconDic.includes(icon);

  const Comp = dynamic(() => import(`./set/${iconExists ? icon : 'info'}`));

  return (
    <Box as="span" id={`icon-${icon}`} className={className} {...rest}>
      <Comp
        width={width}
        height={height}
        style={{ ...style, minWidth: width, height }}
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
};
Icon.defaultProps = {
  icon: '',
  style: {},
  width: '100%',
  height: '100%',
  color: '',
  secondColor: '',
  fill: '',
  full: false,
  className: '',
  props: {},
  text: '',
};
export default memo(Icon);
