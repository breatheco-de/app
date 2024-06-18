import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { HYDRATE, createWrapper } from 'next-redux-wrapper';
import counterReducer from './common/store/reducers/counterReducer';
import todosReducer from './common/store/reducers/todoReducer';
import moduleMapReducer from './common/store/reducers/moduleMapReducer';
import filterReducer from './common/store/reducers/filterReducer';
import assignmentsReducer from './common/store/reducers/assignmentsReducer';
import programListReducer from './common/store/reducers/programListReducer';
import signupReducer from './common/store/reducers/signupReducer';
import finalProjectReducer from './common/store/reducers/finalProjectReducer';
import subscriptionsReducer from './common/store/reducers/subscriptionsReducer';
import cohortReducer from './common/store/reducers/cohortReducer';

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
