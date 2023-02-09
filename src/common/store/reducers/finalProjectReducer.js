const initialState = {
  finalProjectData: {},
};

const finalProjectReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_FINAL_PROJECT_DATA':
      return {
        ...state,
        finalProjectData: action.payload,
      };
    default:
      return state;
  }
};
export default finalProjectReducer;
