const initialState = {
  filterOptions: {
    technologies: [],
    difficulty: [],
    videoTutorials: false,
  },
};

const filterReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'HANDLE_FILTER':
      return {
        ...state,
        filterOptions: action.payload,
      };
    default:
      return state;
  }
};
export default filterReducer;
