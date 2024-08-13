const initialState = {
  cohortProgram: {},
  taskTodo: [],
};

const moduleMapReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHANGE_TASK_TO_DO':
      return {
        ...state,
        taskTodo: action.payload,
      };
    case 'CHANGE_COHORT_PROGRAM':
      return {
        ...state,
        cohortProgram: action.payload,
      };
    default:
      return state;
  }
};
export default moduleMapReducer;
