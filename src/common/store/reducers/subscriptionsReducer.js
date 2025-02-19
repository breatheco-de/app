import {
  FETCH_SUBSCRIPTIONS, CANCEL_SUBSCRIPTION, IS_LOADING,
} from '../types';

const initialState = {
  subscriptions: [],
  isLoading: true, // This should be well tested, I don't think it should be the solution
};

const subscriptionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case IS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case FETCH_SUBSCRIPTIONS:
      return {
        ...state,
        subscriptions: action.payload,
      };
    case CANCEL_SUBSCRIPTION: {
      const updatedSubscription = action.payload;
      const updatedSubscriptions = state?.subscriptions?.subscriptions?.map((subscription) => {
        if (subscription.id === updatedSubscription.id) {
          return updatedSubscription;
        }
        return subscription;
      });
      return {
        ...state,
        subscriptions: {
          ...state.subscriptions,
          subscriptions: updatedSubscriptions,
        },
      };
    }

    default:
      return state;
  }
};
export default subscriptionsReducer;
