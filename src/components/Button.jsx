import { Button as ChakraButton } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useState } from 'react';

function Button({ to, onClick, children, ...rest }) {
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

  return (
    <ChakraButton isLoading={isLoading} onClick={clickHandler} {...rest}>
      {children}
    </ChakraButton>
  );
}

Button.propTypes = {
  to: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
};
Button.defaultProps = {
  to: '',
  onClick: () => {},
};

export default Button;
