import { Button as ChakraButton } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useState } from 'react';

function Button({ to, onClick, children, variant = 'inactive', ...rest }) {
  console.log('Variant', variant);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const existsHash = to.includes('#');
  const clickHandler = () => {
    if (!existsHash) {
      setIsLoading(true);
    }
    if (to) {
      router.push(to);
    } else {
      setIsLoading(true);
      onClick();
    }
  };

  const variants = {
    primary: {
      inactive: { background: 'gray.300', color: 'gray.700' },
      active: { background: 'blue.light', color: 'black' },
      hover: { background: 'blue.600', color: 'white' },
      disabled: { background: 'gray.100', color: 'gray.400', cursor: 'not_allowed' },
    },
  };

  const customStyles = variants[variant] || {};

  return (
    <ChakraButton
      isLoading={isLoading}
      onClick={clickHandler}
      _hover={customStyles.hover}
      backgroundColor={customStyles.background}
      color={customStyles.color}
      {...rest}
    >
      {children}
    </ChakraButton>
  );
}

Button.propTypes = {
  to: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['inactive', 'active', 'hover', 'disabled']),
};
Button.defaultProps = {
  to: '',
  onClick: () => {},
  variant: 'inactive',
};

export default Button;
