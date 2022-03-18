import { useDispatch, useSelector } from 'react-redux';

// NOTE: it was created to handle syllabus page but
// it's not used anymore (replaced for usePersistent hook)
const useSyllabus = () => {
  const dispatch = useDispatch();
  const syllabus = useSelector((state) => state.syllabusReducer.syllabus);

  const setSyllabus = (s) => {
    dispatch({
      type: 'SET_SYLLABUS',
      payload: s,
    });
  };
  return {
    syllabus,
    setSyllabus,
  };
};

export default useSyllabus;
