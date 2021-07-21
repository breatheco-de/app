const initialState = {
  list: [],
};

const todosReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return state.list.concat([action.payload]);
    default:
      return state;
  }
};
export default todosReducer;
