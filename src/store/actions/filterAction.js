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
  const setHowToFilters = (newState) => dispatch({
    type: 'HANDLE_FILTER_HOW_TO',
    payload: newState,
  });
  return {
    filteredBy,
    setProjectFilters,
    setExerciseFilters,
    setHowToFilters,
  };
};

export default useFilter;
