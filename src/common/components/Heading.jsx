import React from 'react';
import { Heading } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const sizes = {
  xxl: '68px',
  xl: '50px',
  l: '40px',
  m: '32px',
  sm: '26px',
  xsm: '22px',
};

const ThemeHeading = ({ children, size, ...rest }) => (
  // size per default => in case of Heading need a size less than 20px (xxsm)
  <Heading fontSize={sizes[size] || size} {...rest}>
    {children}
  </Heading>
);

ThemeHeading.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.node,
};

ThemeHeading.defaultProps = {
  size: 'l',
  children: null,
};

export default ThemeHeading;
