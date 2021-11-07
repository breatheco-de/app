const initialState = {
  checkboxOption: {
    technologies: [],
    difficulty: [],
  },
};

const filterReducer = (state = initialState, action) => {
  console.log('ACTION:::', action);
  console.log('Payload:::', action.payload);
  switch (action.type) {
    case 'HANDLE_FILTER':
      return {
        ...state,
        checkboxOption: action.payload,
      };
    // case 'DECREMENT':
    //   return {
    //     ...state,
    //     count: state.count - 1,
    //   };
    // case 'RESET':
    //   return {
    //     ...state,
    //     count: 0,
    //   };
    default:
      return state;
  }
};
export default filterReducer;
