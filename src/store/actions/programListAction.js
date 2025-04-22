import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';

const useProgramList = () => {
  const router = useRouter();
  const state = useSelector((st) => st.programListReducer);
  const dispatch = useDispatch();

  const updateProgramList = (payload) => {
    dispatch({
      type: 'UPDATE_PROGRAM_LIST',
      payload,
    });
  };
  const addTeacherProgramList = ({ teacher, assistant }) => {
    dispatch({
      type: 'UPDATE_PROGRAM_LIST',
      payload: {
        ...state,
        [router.query.cohortSlug]: {
          ...state[router.query.cohortSlug],
          teacher,
          assistant,
        },
      },
    });
  };

  return {
    state,
    updateProgramList,
    addTeacherProgramList,
  };
};

export default useProgramList;
