import { useSelector, useDispatch } from 'react-redux';

const useFinalProjectProps = () => {
  const data = useSelector((state) => state.finalProjectReducer);
  const dispatch = useDispatch();
  const setFinalProjectData = (newState) => dispatch({
    type: 'SET_FINAL_PROJECT_DATA',
    payload: newState,
  });
  return {
    finalProjectData: data.finalProjectData,
    setFinalProjectData,
  };
};

export default useFinalProjectProps;
