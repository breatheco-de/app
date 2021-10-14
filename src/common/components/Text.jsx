/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Text, useColorMode } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const sizes = {
  l: '15px',
  md: '14px',
  sm: '12px',
  xs: '10px',
};

const ThemeText = ({
  children, size, color, ...rest
}) => {
  const { colorMode } = useColorMode();

  return (
    <Text fontSize={sizes[size] || size} color={colorMode === 'light' ? color : 'white'} {...rest}>
      {children}
    </Text>
  );
};

ThemeText.propTypes = {
  size: PropTypes.string.isRequired,
  color: PropTypes.string,
  children: PropTypes.node.isRequired,
};
ThemeText.defaultProps = {
  color: 'black',
};

export default ThemeText;
