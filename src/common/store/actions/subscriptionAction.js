import { useSelector, useDispatch } from 'react-redux';
import { useToast } from '@chakra-ui/react';
import { CANCEL_SUBSCRIPTION, FETCH_SUBSCRIPTIONS } from '../types';
import bc from '../../services/breathecode';

const useSubscriptionsHandler = () => {
  const state = useSelector((st) => st.subscriptionsReducer);
  const toast = useToast();
  const dispatch = useDispatch();

  const fetchSubscriptions = () => new Promise((resolve, reject) => {
    bc.payment({
      status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE',
    }).subscriptions()
      .then(({ data }) => {
        resolve(data);
        dispatch({
          type: FETCH_SUBSCRIPTIONS,
          payload: data,
        });
      })
      .catch((err) => {
        reject(err);
      });
  });

  const cancelSubscription = (id) => {
    bc.payment().cancelMySubscription(id)
      .then(({ data }) => {
        console.log('Subscription cancelled');
        dispatch({
          type: CANCEL_SUBSCRIPTION,
          payload: data,
        });
      })
      .catch((err) => {
        toast({
          title: 'Error cancelling subscription',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        console.log('Error cancelling subscription', err);
      });
  };

  return {
    state,
    fetchSubscriptions,
    cancelSubscription,
  };
};

export default useSubscriptionsHandler;
