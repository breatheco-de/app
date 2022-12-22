import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePersistent } from '../../hooks/usePersistent';

const useProgramList = () => {
  const router = useRouter();
  const state = useSelector((st) => st.programListReducer);
  const [programsList, setProgramsList] = usePersistent('programsList', {});
  const dispatch = useDispatch();

  const updateProgramList = (payload) => {
    dispatch({
      type: 'UPDATE_PROGRAM_LIST',
      payload,
    });
  };
  const addTasksProgramList = ({ list, percentage }) => {
    dispatch({
      type: 'UPDATE_PROGRAM_LIST',
      payload: {
        ...state,
        [router.query.cohortSlug]: {
          ...state[router.query.cohortSlug],
          ...programsList[router.query.cohortSlug],
          tasks: {
            list,
            percentage,
          },
        },
      },
    });
  };
  const addTeacherProgramList = ({ teacher, assistant }) => {
    dispatch({
      type: 'UPDATE_PROGRAM_LIST',
      payload: {
        ...state,
        [router.query.cohortSlug]: {
          ...state[router.query.cohortSlug],
          ...programsList[router.query.cohortSlug],
          teacher,
          assistant,
        },
      },
    });
  };

  useEffect(() => {
    if (Object.keys(state).length > 0) {
      setProgramsList({
        ...programsList,
        ...state,
      });
    }
  }, [state]);

  return {
    state,
    programsList,
    updateProgramList,
    addTasksProgramList,
    addTeacherProgramList,
  };
};

export default useProgramList;
