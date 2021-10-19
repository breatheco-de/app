/* eslint-disable react/jsx-props-no-spreading */
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
  children, size, ...rest
}) => (
  <Text fontSize={sizes[size] || size} {...rest}>
    {children}
  </Text>
);

ThemeText.propTypes = {
  size: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
ThemeText.defaultProps = {
};

export default ThemeText;
