import { Button, Heading, Stack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useCounter from '../store/actions/counterAction';

const Counter = ({ title, resetText }) => {
  const {
    count, increment, decrement, reset,
  } = useCounter();

  return (
    <div>
      <Heading py="30px" as="h2" size="xl" isTruncated>
        {title}
        :
        <span data-testid="count">
          {' '}
          {count}
        </span>
      </Heading>
      <Stack direction="row" spacing={4} align="center" justify="center" py="5px">
        <Button colorScheme="green" variant="default" type="button" onClick={increment}>
          +1
        </Button>
        <Button colorScheme="green" variant="default" type="button" onClick={decrement}>
          -1
        </Button>
        <Button colorScheme="green" variant="black" type="button" onClick={reset}>
          {resetText}
        </Button>
      </Stack>
    </div>
  );
};

Counter.propTypes = {
  title: PropTypes.string,
  resetText: PropTypes.string,
};
Counter.defaultProps = {
  title: 'Counter',
  resetText: 'reset',
};

export default Counter;
