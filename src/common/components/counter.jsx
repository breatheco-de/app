import { Button, Heading, Stack } from '@chakra-ui/react';
import useCounter from '../store/actions/counterAction';

const Counter = () => {
  const {
    count, increment, decrement, reset,
  } = useCounter();
  console.log('COUNT', count);
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
