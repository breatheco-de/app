import {
  FETCH_SUBSCRIPTIONS, CANCEL_SUBSCRIPTION,
} from '../types';

const initialState = {
  subscriptions: [],
};

const subscriptionsReducer = (state = initialState, action) => {
  switch (action.type) {
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
