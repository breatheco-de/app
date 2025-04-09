import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { HYDRATE, createWrapper } from 'next-redux-wrapper';
import counterReducer from './reducers/counterReducer';
import todosReducer from './reducers/todoReducer';
import moduleMapReducer from './reducers/moduleMapReducer';
import filterReducer from './reducers/filterReducer';
import assignmentsReducer from './reducers/assignmentsReducer';
import programListReducer from './reducers/programListReducer';
import signupReducer from './reducers/signupReducer';
import finalProjectReducer from './reducers/finalProjectReducer';
import subscriptionsReducer from './reducers/subscriptionsReducer';
import cohortReducer from './reducers/cohortReducer';

const combinedReducer = combineReducers({
  counterReducer,
  todosReducer,
  moduleMapReducer,
  filterReducer,
  assignmentsReducer,
  programListReducer,
  signupReducer,
  finalProjectReducer,
  subscriptionsReducer,
  cohortReducer,
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

export const initStore = () => configureStore({
  reducer,
  devTools: process.env.VERCEL_ENV !== 'production' && process.env.NODE_ENV !== 'production',
  // middleware: [],
});

const wrapper = createWrapper(initStore);
export default wrapper;
