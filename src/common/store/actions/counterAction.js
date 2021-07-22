import { useSelector, useDispatch } from 'react-redux';

const useCounter = () => {
  const count = useSelector((state) => state.counterReducer.count);
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

export default useCounter;
