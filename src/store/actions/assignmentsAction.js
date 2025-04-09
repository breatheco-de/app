import { useDispatch, useSelector } from 'react-redux';

const useAssignments = () => {
  const dispatch = useDispatch();
  const contextState = useSelector((state) => state.assignmentsReducer.contextState);

  const setContextState = (newState) => {
    dispatch({
      type: 'CHANGE_ASSIGNMENTS_STATE',
      payload: newState,
    });
  };

  return {
    contextState,
    setContextState,
  };
};

export default useAssignments;
