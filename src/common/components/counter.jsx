import { Button, Heading, Stack } from '@chakra-ui/react';
import getConfig from 'next/config';
import useCounter from '../store/actions/counterAction';

// Only holds serverRuntimeConfig and publicRuntimeConfig
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

const Counter = () => {
  const {
    count, increment, decrement, reset,
  } = useCounter();

  console.log('GITHUB_TOKEN:::', serverRuntimeConfig.GITHUB_TOKEN); // return undefined in browser but in console return the value
  console.log('NEXT_ID:::', publicRuntimeConfig.NEXT_PUBLIC_ID);
  console.log('MY_API:::', publicRuntimeConfig.MY_API_URL);

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
