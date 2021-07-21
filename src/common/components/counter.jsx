import { Button, Heading, Stack } from '@chakra-ui/react';
import getConfig from 'next/config';
import useCounter from '../store/actions/counterAction';

const {
  // publicRuntimeConfig: { MY_API_URL }, // Available both client and server side
  serverRuntimeConfig: { GITHUB_TOKEN }, // Only available server side
} = getConfig();

const Counter = () => {
  const {
    count, increment, decrement, reset,
  } = useCounter();
  console.log('GITHUB_TOKEN:::', GITHUB_TOKEN);

  return (
    <div>
      <Heading py="30px" as="h2" size="xl" isTruncated>
        Redux Count:
        {' '}
        <span data-testid="count">{count}</span>
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
