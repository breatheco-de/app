import { useSelector, useDispatch } from 'react-redux';

const useFilter = () => {
  const filteredBy = useSelector((state) => state.filterReducer);
  const dispatch = useDispatch();
  const setFilter = (newState) => dispatch({
    type: 'HANDLE_FILTER',
    payload: newState,
  });
  return {
    filteredBy,
    setFilter,
  };
};

export default useFilter;
