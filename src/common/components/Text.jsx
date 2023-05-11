import React from 'react';
import { Text as ChakraText, Tooltip } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const sizes = {
  l: '15px',
  md: '14px',
  sm: '12px',
  xs: '10px',
};

function Text({
  children, size, maxWidth, letterSpacing, withLimit, ...rest
}) {
  return withLimit ? (
    <Tooltip label={children} hasArrow placement="top-start" openDelay={500}>
      <ChakraText
        className="text"
        letterSpacing={letterSpacing}
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        overflow="hidden"
        fontSize={sizes[size] || size}
        width={maxWidth || '13em'}
        border="0px"
        {...rest}
      >
        {children && children}
      </ChakraText>
    </Tooltip>
  ) : (
    <ChakraText letterSpacing={letterSpacing} maxWidth={maxWidth} fontSize={sizes[size] || size} {...rest}>
      {children && children}
    </ChakraText>
  );
}

Text.propTypes = {
  size: PropTypes.string,
  letterSpacing: PropTypes.string,
  maxWidth: PropTypes.string,
  children: PropTypes.node,
  withLimit: PropTypes.bool,
};
Text.defaultProps = {
  letterSpacing: '0.05em',
  size: 'sm',
  maxWidth: '',
  children: null,
  withLimit: false,
};

export default Text;
