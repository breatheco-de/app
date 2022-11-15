import { useInterval } from '@chakra-ui/react';
import { useState } from 'react';

const Counter = ({
  valueFrom = 0, // number to start from
  valueTo = 100, // number to end
  totalDuration = 3.5, // time in seconds for the count to be completed
  withDecimal = false, // true or false, if true the count will have decimal numbers
}) => {
  const [count, setCount] = useState(valueFrom);
  const value = withDecimal ? valueTo.toFixed(1) : Math.round(valueTo);

  if (withDecimal && value % 1 !== 0) {
    useInterval(() => {
      if (count < value) {
        setCount(Number((count + 0.1).toFixed(1)));
      }
      if (count > value) {
        setCount(Number((count - 0.1).toFixed(1)));
      }
    }, (totalDuration / value) * 300);
  }

  if (!withDecimal && value % 1 === 0) {
    useInterval(() => {
      if (count < value) {
        setCount(count + 1);
      }
      if (count > value) {
        setCount(count - 1);
      }
    }, (totalDuration / value) * 1000);
  }

  return count;
};

export default Counter;
