const initialState = {
  contextState: {
    allTasks: [],
    tasksCount: 0,
  },
};

const assignmentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHANGE_ASSIGNMENTS_STATE':
      return {
        ...state,
        contextState: action.payload,
      };
    default:
      return state;
  }
};
export default assignmentsReducer;
