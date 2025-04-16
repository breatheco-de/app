import { useRouter } from 'next/router';
import subscriptionAction from '../store/actions/subscriptionAction';
import bc from '../services/breathecode';
import useCustomToast from './useCustomToast';
import { toCapitalize, unSlugify } from '../utils';

const useSubscriptions = () => {
  const router = useRouter();
  const { state, setSubscriptionsLoading, setSubscriptions, setCancelSubscription, setPaymentStatus } = subscriptionAction();
  const { subscriptions } = state;
  const { createToast } = useCustomToast({ toastId: 'canceling-subscription-error-action' });

  const getPlanOffer = async (slug) => {
    const { data } = await bc.payment({
      original_plan: slug,
    }).planOffer();

    const currentOffer = data.find((item) => item.original_plan?.slug === slug);

    return currentOffer;
  };

  const managePlanOffer = async ({ slug }) => {
    try {
      const currentOffer = await getPlanOffer(slug);

      // find out if a plan has a plan offer
      const offerData = currentOffer?.suggested_plan;
      if (offerData) {
        const outOfConsumables = currentOffer.original_plan?.service_items.some((item) => item.how_many === 0);

        return {
          title: toCapitalize(unSlugify(String(offerData.slug))),
          slug: offerData.slug,
          details: offerData.details,
          expires_at: offerData.expires_at,
          show_modal: currentOffer.show_modal,
          outOfConsumables,
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const getSubscriptions = async () => {
    const { data } = await bc.payment({
      status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE,EXPIRED,ERROR',
    }).subscriptions();
    return data;
  };

  const reactivatePlan = (planSlug, planStatus) => {
    if (planStatus === 'CANCELLED') {
      setPaymentStatus('idle');
      router.push(`/checkout?plan=${planSlug}`);
    }
  };

  const initializeSubscriptionsData = async () => {
    let result;
    try {
      setSubscriptionsLoading(true);

      const data = await getSubscriptions();

      const subscriptionsDataWithPlanOffer = data?.subscriptions?.length > 0
        ? await Promise.all(data.subscriptions.map(async (s) => {
          const planOffer = await managePlanOffer({ slug: s?.plans[0]?.slug });
          console.log('planOffer', planOffer);
          return { ...s, type: 'subscription', planOffer };
        }))
        : [];

      const planFinancingsDataWithPlanOffer = data?.plan_financings?.length > 0
        ? await Promise.all(data.plan_financings.map(async (f) => {
          const planOffer = await managePlanOffer({ slug: f?.plans[0]?.slug });
          return { ...f, type: 'plan_financing', planOffer };
        }))
        : [];

      result = {
        subscriptions: subscriptionsDataWithPlanOffer,
        plan_financings: planFinancingsDataWithPlanOffer,
      };

      setSubscriptions(result);
    } catch (error) {
      result = error;
    } finally {
      setSubscriptionsLoading(false);
      // eslint-disable-next-line no-unsafe-finally
      return result;
    }
  };

  const cancelSubscription = async (id) => {
    try {
      const { data } = await bc.payment().cancelMySubscription(id);
      setCancelSubscription(data);
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

  const allSubscriptions = (subscriptions?.subscriptions
    && subscriptions?.plan_financings
    && [...subscriptions.subscriptions, ...subscriptions.plan_financings]) || [];

  return {
    ...state,
    state,
    allSubscriptions,
    getPlanOffer,
    reactivatePlan,
    initializeSubscriptionsData,
    cancelSubscription,
    getSubscriptions,
  };
};

export default useSubscriptions;
