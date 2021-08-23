const initialState = {
  modules: [
    {
      title: 'Read',
      text: 'Introduction to the pre-work',
      icon: 'verified',
      status: 'inactive',
    },
    {
      title: 'Practice',
      text: 'Practice pre-work',
      icon: 'book',
      status: 'active',
    },
    {
      title: 'Practice',
      text: 'Star wars',
      icon: 'verified',
      status: 'finished',
    },
  ],
};

const moduleMapReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHANGE_STATUS':
      return {
        ...state,
        modules: action.payload,
      };
    default:
      return state;
  }
};
export default moduleMapReducer;
