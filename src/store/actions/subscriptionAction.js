import { useSelector, useDispatch } from 'react-redux';
import { CANCEL_SUBSCRIPTION, SET_SUBSCRIPTIONS, SET_SUBSCRIPTIONS_LOADING, SET_ARE_SUBSCRIPTIONS_FECHED } from '../types';

const subscriptionAction = () => {
  const state = useSelector((st) => st.subscriptionsReducer);
  const dispatch = useDispatch();

  const setSubscriptionsLoading = (payload) => dispatch({
    type: SET_SUBSCRIPTIONS_LOADING,
    payload,
  });

  const setSubscriptions = (payload) => dispatch({
    type: SET_SUBSCRIPTIONS,
    payload,
  });

  const setCancelSubscription = (payload) => dispatch({
    type: CANCEL_SUBSCRIPTION,
    payload,
  });

  const setAreSubscriptionsFetched = (payload) => dispatch({
    type: SET_ARE_SUBSCRIPTIONS_FECHED,
    payload,
  });

  return {
    state,
    setSubscriptionsLoading,
    setSubscriptions,
    setCancelSubscription,
    setAreSubscriptionsFetched,
  };
};

export default subscriptionAction;
