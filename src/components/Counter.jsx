import { Button, Heading, Stack } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import useCounter from '../store/actions/counterAction';

function Counter() {
  const { t } = useTranslation(['counter']);
  const {
    count, increment, decrement, reset,
  } = useCounter();

  return (
    <div>
      <Heading py="30px" as="h2" size="xl" isTruncated>
        {t('title')}
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
          {t('resetText')}
        </Button>
      </Stack>
    </div>
  );
}

export default Counter;
