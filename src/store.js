import { createStore, applyMiddleware, combineReducers } from 'redux';
import { HYDRATE, createWrapper } from 'next-redux-wrapper';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import counterReducer from './common/store/reducers/counterReducer';
import todosReducer from './common/store/reducers/todoReducer';
import moduleMapReducer from './common/store/reducers/moduleMapReducer';
import filterReducer from './common/store/reducers/filterReducer';
import syllabusReducer from './common/store/reducers/syllabusReducer';
import assignmentsReducer from './common/store/reducers/assignmentsReducer';

const bindMiddleware = (middleware) => {
  if (process.env.NODE_ENV !== 'production') {
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

const combinedReducer = combineReducers({
  counterReducer,
  todosReducer,
  moduleMapReducer,
  filterReducer,
  syllabusReducer,
  assignmentsReducer,
});

const reducer = (state, action) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    };
    return nextState;
  }
  return combinedReducer(state, action);
};

export const initStore = () => createStore(reducer, bindMiddleware([thunkMiddleware]));

const wrapper = createWrapper(initStore);
export default wrapper;
