import { useSelector, useDispatch } from 'react-redux';

const useFilter = () => {
  const filteredBy = useSelector((state) => state.filterReducer);
  const dispatch = useDispatch();
  const setProjectFilters = (newState) => dispatch({
    type: 'HANDLE_FILTER_PROJECTS',
    payload: newState,
  });
  const setExerciseFilters = (newState) => dispatch({
    type: 'HANDLE_FILTER_EXERCISES',
    payload: newState,
  });
  return {
    filteredBy,
    setProjectFilters,
    setExerciseFilters,
  };
};

export default useFilter;
