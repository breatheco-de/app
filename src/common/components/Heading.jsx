import React from 'react';
import { Heading as THeading } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const sizes = {
  xxl: 'var(--heading-xxl)', // min 42px ---- max 70px
  xl: 'var(--heading-xl)', // min 35px ---- min 50px
  l: 'var(--heading-l)', // min 30px ---- max 40px
  m: 'var(--heading-m)', // min 26px ---- max 32px
  sm: 'var(--heading-sm)', // min 20px ---- max 26px
  xsm: 'var(--heading-xsm)', // min 16px ---- max 22px
};

function Heading({ children, size, ...rest }) {
  return (
    <THeading fontSize={sizes[size] || size} {...rest}>
      {children}
    </THeading>
  );
}

Heading.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.node,
};

Heading.defaultProps = {
  size: 'l',
  children: null,
};

export default Heading;
