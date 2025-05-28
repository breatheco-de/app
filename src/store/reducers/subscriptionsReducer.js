import {
  SET_SUBSCRIPTIONS, CANCEL_SUBSCRIPTION, SET_SUBSCRIPTIONS_LOADING, SET_ARE_SUBSCRIPTIONS_FECHED,
} from '../types';

const initialState = {
  subscriptions: null,
  isLoading: false,
  areSubscriptionsFetched: false,
};

const subscriptionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SUBSCRIPTIONS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case SET_SUBSCRIPTIONS:
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
    case SET_ARE_SUBSCRIPTIONS_FECHED:
      return {
        ...state,
        areSubscriptionsFetched: action.payload,
      };
    default:
      return state;
  }
};
export default subscriptionsReducer;
