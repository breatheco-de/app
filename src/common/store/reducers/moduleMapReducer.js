const initialState = {
  currentTask: null,
  subTasks: [],
  nextModule: null,
  prevModule: null,
};

const moduleMapReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHANGE_CURRENT_TASK':
      return {
        ...state,
        currentTask: action.payload,
      };
    case 'CHANGE_SUB_TASKS':
      return {
        ...state,
        subTasks: action.payload,
      };
    case 'CHANGE_NEXT_MODULE':
      return {
        ...state,
        nextModule: action.payload,
      };
    case 'CHANGE_PREV_MODULE':
      return {
        ...state,
        prevModule: action.payload,
      };
    default:
      return state;
  }
};
export default moduleMapReducer;
