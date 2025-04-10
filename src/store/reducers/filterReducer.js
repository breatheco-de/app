const initialState = {
  projectsOptions: {
    technologies: [],
    difficulty: [],
    videoTutorials: false,
  },
  exercisesOptions: {
    technologies: [],
    difficulty: [],
    videoTutorials: false,
  },
  howToOptions: {
    technologies: [],
    difficulty: [],
    videoTutorials: false,
  },
};

const filterReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'HANDLE_FILTER_PROJECTS':
      return {
        ...state,
        projectsOptions: action.payload,
      };
    case 'HANDLE_FILTER_EXERCISES':
      return {
        ...state,
        exercisesOptions: action.payload,
      };
    case 'HANDLE_FILTER_HOW_TO':
      return {
        ...state,
        howToOptions: action.payload,
      };
    default:
      return state;
  }
};
export default filterReducer;
