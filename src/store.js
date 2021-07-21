import { createStore, applyMiddleware, combineReducers } from 'redux';
import { HYDRATE, createWrapper } from 'next-redux-wrapper';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import counterReducer from './common/store/reducers/counterReducer';
import todosReducer from './common/store/reducers/todoReducer';

const bindMiddleware = (middleware) => {
  if (process.env.NODE_ENV !== 'production') {
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

const combinedReducer = combineReducers({
  counterReducer,
  todosReducer,
});

const reducer = (state, action) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    };
    return nextState;
  }
  // console.log('working state:::', state);
  return combinedReducer(state, action);
};

const initStore = () => createStore(reducer, bindMiddleware([thunkMiddleware]));

const wrapper = createWrapper(initStore);
export default wrapper;
