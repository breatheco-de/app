import React from 'react';
import { Heading } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const sizes = {
  xl: '50px',
  l: '22px',
  m: '15px',
  sm: '12px',
};

const ThemeHeading = ({
  children, size, ...rest
}) => (
  <Heading fontSize={sizes[size]} {...rest}>
    {children}
  </Heading>
);

ThemeHeading.propTypes = {
  size: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default ThemeHeading;
