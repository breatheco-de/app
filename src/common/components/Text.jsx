import React from 'react';
import { Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const sizes = {
  l: '15px',
  m: '14px',
  sm: '12px',
};

const ThemeText = ({
  children, size, ...rest
}) => (
  <Text fontSize={sizes[size]} {...rest}>
    {children}
  </Text>
);

ThemeText.propTypes = {
  size: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default ThemeText;
