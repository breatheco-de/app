const initialState = {};

const programListReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_PROGRAM_LIST':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
export default programListReducer;
