import { useSelector, useDispatch } from 'react-redux';
import { Button, Heading, Stack } from '@chakra-ui/react';
// import styles from '../../../styles/Home.module.css';

const useCounter = () => {
  const count = useSelector((state) => state.count);
  const dispatch = useDispatch();
  const increment = () => dispatch({
    type: 'INCREMENT',
  });
  const decrement = () => dispatch({
    type: 'DECREMENT',
  });
  const reset = () => dispatch({
    type: 'RESET',
  });
  return {
    count,
    increment,
    decrement,
    reset,
  };
};

const Counter = () => {
  const {
    count, increment, decrement, reset,
  } = useCounter();
  return (
    <div>
      <Heading py="30px" as="h2" size="xl" isTruncated>
        Redux Count:
        {' '}
        <span>{count}</span>
      </Heading>
      <Stack direction="row" spacing={4} align="center" justify="center" py="5px">
        <Button colorScheme="green" variant="outline" type="button" onClick={increment}>
          +1
        </Button>
        <Button colorScheme="green" variant="outline" type="button" onClick={decrement}>
          -1
        </Button>
        <Button colorScheme="green" variant="outline" type="button" onClick={reset}>
          Reset
        </Button>
      </Stack>
    </div>
  );
};

export default Counter;
