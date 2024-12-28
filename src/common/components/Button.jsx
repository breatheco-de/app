import { Button as ChakraButton } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useState } from 'react';

function Button({ to, onClick, children, variant = 'primary', disabled = false, ...rest }) {
  // console.log('Variant', variant);
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
    success: {
      background: '#25BF6C',
      color: 'white',
      hover: { background: '#2CE883', color: 'white' },
      disabled: { background: '#A9A9A9', color: 'white', cursor: 'not-allowed' },
      active: { background: '#06AB52', color: 'white' },
    },
    outline: {
      background: '#FFFFFF',
      color: '#0097CF',
      borderColor: '#0097CF',
      hover: { background: '#EEF9FE', color: '#02A9EA', borderColor: '#02A9EA' },
      disabled: { background: '#F9F9F9', color: '#DADADA', borderColor: '#F9F9F9', cursor: 'not-allowed' },
      active: { background: '#EEF9FE', color: '#0084FF', borderColor: '#0084FF' },
    },
    unstyled: {},
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
      border={variant === 'outline' ? '1px solid' : undefined}
      borderColor={customStyles.borderColor}
      isDisabled={disabled}
      variant={variant === 'unstyled' ? 'unstyled' : undefined}
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
  variant: PropTypes.oneOf(['primary', 'success', 'outline', 'unstyled']),
  disabled: PropTypes.bool,
};
Button.defaultProps = {
  to: '',
  onClick: () => {},
  variant: 'primary',
  disabled: false,
};

export default Button;
