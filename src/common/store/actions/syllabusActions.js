import { useDispatch, useSelector } from 'react-redux';

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
