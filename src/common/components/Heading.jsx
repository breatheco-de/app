import React from 'react';
import { Heading } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const sizes = {
  xxl: 'clamp(2.625rem, 2.6rem + 3vw, 4.375rem)', // min 42px ---- max 70px
  xl: 'clamp(2.1875rem, 1.74rem + 1.99vw, 3.125rem)', // min 35px ---- min 50px
  l: 'clamp(1.875rem, 1.45rem + 2.29vw, 2.5rem)', // min 30px ---- max 40px
  m: 'clamp(1.625rem, 1.3rem + 1.8vw, 2rem)', // min 26px ---- max 32px
  sm: 'clamp(1.25rem, 1rem + 1.47vw, 1.625rem)', // min 20px ---- max 26px
  xsm: 'clamp(1rem, 0.6rem + 1.42vw, 1.375rem)', // min 16px ---- max 22px
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
