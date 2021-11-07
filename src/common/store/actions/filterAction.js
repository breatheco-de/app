import { useSelector, useDispatch } from 'react-redux';

const useFilter = () => {
  const filteredBy = useSelector((state) => state.filterReducer);
  const dispatch = useDispatch();
  const setFilter = (newState) => dispatch({
    type: 'HANDLE_FILTER',
    payload: newState,
  });
  // const removeFilter = () => dispatch({
  //   type: 'removeFilter',
  // });
  // const reset = () => dispatch({
  //   type: 'RESET',
  // });
  return {
    filteredBy,
    setFilter,
    // removeFilter,
    // reset,
  };
};

export default useFilter;
