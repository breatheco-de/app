import { useSelector, useDispatch } from 'react-redux';
import { useToast } from '@chakra-ui/react';
import { CANCEL_SUBSCRIPTION, FETCH_SUBSCRIPTIONS, IS_LOADING } from '../types';
import bc from '../../services/breathecode';
import profileHandlers from '../../../js_modules/profile/Subscriptions/handlers';

const useSubscriptionsHandler = () => {
  const state = useSelector((st) => st.subscriptionsReducer);
  const toast = useToast();
  const dispatch = useDispatch();
  const {
    getPlanOffer,
  } = profileHandlers({});

  const fetchSubscriptions = () => new Promise((resolve, reject) => {
    dispatch({
      type: IS_LOADING,
      payload: true,
    });
    bc.payment({
      status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE,EXPIRED,ERROR',
    }).subscriptions()
      .then(async ({ data }) => {
        const subscriptionsDataWithPlanOffer = data?.subscriptions?.length > 0 ? await Promise.all(data?.subscriptions.map(async (s) => {
          const planOffer = await getPlanOffer({ slug: s?.plans[0]?.slug, disableRedirects: true });
          return {
            ...s,
            type: 'subscription',
            planOffer,
          };
        })) : [];
        const planFinancingsDataWithPlanOffer = data?.plan_financings?.length > 0 ? await Promise.all(data?.plan_financings.map(async (f) => {
          const planOffer = await getPlanOffer({ slug: f?.plans[0]?.slug, disableRedirects: true });
          return {
            ...f,
            type: 'plan_financing',
            planOffer,
          };
        })) : [];

        resolve({
          subscriptions: subscriptionsDataWithPlanOffer,
          plan_financings: planFinancingsDataWithPlanOffer,
        });
        dispatch({
          type: FETCH_SUBSCRIPTIONS,
          payload: {
            subscriptions: subscriptionsDataWithPlanOffer,
            plan_financings: planFinancingsDataWithPlanOffer,
          },
        });
      })
      .catch((err) => {
        reject(err);
      })
      .finally(() => {
        dispatch({
          type: IS_LOADING,
          payload: false,
        });
      });
  });

  const cancelSubscription = (id) => new Promise((resolve, reject) => {
    bc.payment().cancelMySubscription(id)
      .then(({ data }) => {
        dispatch({
          type: CANCEL_SUBSCRIPTION,
          payload: data,
        });
        resolve(data);
      })
      .catch((err) => {
        toast({
          position: 'top',
          title: 'Error cancelling subscription',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        reject(err);
      });
  });

  return {
    state,
    fetchSubscriptions,
    cancelSubscription,
  };
};

export default useSubscriptionsHandler;
