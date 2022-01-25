import React from 'react';
import { Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const sizes = {
  l: '15px',
  md: '14px',
  sm: '12px',
  xs: '10px',
};

const ThemeText = ({
  children, size, letterSpacing, ...rest
}) => (
  <Text letterSpacing={letterSpacing} fontSize={sizes[size] || size} {...rest}>
    {children}
  </Text>
);

ThemeText.propTypes = {
  size: PropTypes.string,
  letterSpacing: PropTypes.string,
  children: PropTypes.node.isRequired,
};
ThemeText.defaultProps = {
  letterSpacing: '0.05em',
  size: 'sm',
};

export default ThemeText;
