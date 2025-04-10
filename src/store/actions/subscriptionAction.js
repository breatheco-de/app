import { useSelector, useDispatch } from 'react-redux';
import { CANCEL_SUBSCRIPTION, FETCH_SUBSCRIPTIONS, IS_LOADING } from '../types';
import bc from '../../services/breathecode';
import useCustomToast from '../../hooks/useCustomToast';
import profileHandlers from '../../components/Profile/Subscriptions/handlers';

const useSubscriptionsHandler = () => {
  const state = useSelector((st) => st.subscriptionsReducer);
  const { createToast } = useCustomToast({ toastId: 'canceling-subscription-error-action' });
  const dispatch = useDispatch();
  const {
    getPlanOffer,
  } = profileHandlers();

  const fetchSubscriptions = async () => {
    let result;
    try {
      dispatch({
        type: IS_LOADING,
        payload: true,
      });

      const { data } = await bc.payment({
        status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE,EXPIRED,ERROR',
      }).subscriptions();

      const subscriptionsDataWithPlanOffer = data?.subscriptions?.length > 0
        ? await Promise.all(data.subscriptions.map(async (s) => {
          const planOffer = await getPlanOffer({ slug: s?.plans[0]?.slug, disableRedirects: true });
          return { ...s, type: 'subscription', planOffer };
        }))
        : [];

      const planFinancingsDataWithPlanOffer = data?.plan_financings?.length > 0
        ? await Promise.all(data.plan_financings.map(async (f) => {
          const planOffer = await getPlanOffer({ slug: f?.plans[0]?.slug, disableRedirects: true });
          return { ...f, type: 'plan_financing', planOffer };
        }))
        : [];

      result = {
        subscriptions: subscriptionsDataWithPlanOffer,
        plan_financings: planFinancingsDataWithPlanOffer,
      };

      dispatch({
        type: FETCH_SUBSCRIPTIONS,
        payload: result,
      });
    } catch (error) {
      result = error;
    } finally {
      dispatch({
        type: IS_LOADING,
        payload: false,
      });
      // eslint-disable-next-line no-unsafe-finally
      return result;
    }
  };

  const cancelSubscription = async (id) => {
    try {
      const { data } = await bc.payment().cancelMySubscription(id);
      dispatch({
        type: CANCEL_SUBSCRIPTION,
        payload: data,
      });
      return data;
    } catch (err) {
      createToast({
        position: 'top',
        title: 'Error while cancelling subscription',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return err;
    }
  };

  return {
    state,
    fetchSubscriptions,
    cancelSubscription,
  };
};

export default useSubscriptionsHandler;
