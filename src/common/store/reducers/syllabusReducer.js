const initialState = {
  syllabus: [],
};

const syllabusReducer = (state = initialState, action) => {
  // This reducer is used when cohort is selected.
  switch (action.type) {
    case 'SET_SYLLABUS':
      return {
        ...state,
        syllabus: action.payload,
      };
    default:
      return state;
  }
};

export default syllabusReducer;
