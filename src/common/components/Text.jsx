import React from 'react';
import { Text as ChakraText } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const sizes = {
  l: '15px',
  md: '14px',
  sm: '12px',
  xs: '10px',
};

const Text = ({
  children, size, letterSpacing, ...rest
}) => (
  <ChakraText letterSpacing={letterSpacing} fontSize={sizes[size] || size} {...rest}>
    {children}
  </ChakraText>
);

Text.propTypes = {
  size: PropTypes.string,
  letterSpacing: PropTypes.string,
  children: PropTypes.node.isRequired,
};
Text.defaultProps = {
  letterSpacing: '0.05em',
  size: 'sm',
};

export default Text;
