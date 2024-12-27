import { Button as ChakraButton } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useState } from 'react';

function Button({ to, onClick, children, variant = 'primary', disabled = false, ...rest }) {
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
      background: '#0097CF',
      color: 'white',
      hover: { background: '#02A9EA', color: 'white' },
      disabled: { background: '#DADADA', color: 'white', cursor: 'not-allowed' },
      active: { background: '#0084FF', color: 'white' },
    },
  };

  const customStyles = variants[variant] || {};

  return (
    <ChakraButton
      isLoading={isLoading}
      onClick={clickHandler}
      _hover={customStyles.hover}
      _active={customStyles.active}
      _disabled={customStyles.disabled}
      backgroundColor={customStyles.background}
      color={customStyles.color}
      isDisabled={disabled}
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
  disabled: PropTypes.bool,
};
Button.defaultProps = {
  to: '',
  onClick: () => {},
  variant: 'primary',
  disabled: false,
};

export default Button;
