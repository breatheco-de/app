import { useInterval } from '@chakra-ui/react';
import { useState } from 'react';

const Counter = ({
  valueFrom = 0,
  valueTo = 100,
  totalDuration = 3.5,
}) => {
  const [count, setCount] = useState(valueFrom);

  useInterval(() => {
    if (count < valueTo) {
      setCount(count + 1);
    }
  }, (totalDuration / valueTo) * 1000);

  return count;
};

export default Counter;
