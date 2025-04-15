import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import subscriptionAction from '../store/actions/subscriptionAction';
import bc from '../services/breathecode';
import useCustomToast from './useCustomToast';
import { toCapitalize, unSlugify } from '../utils';

const useSubscriptions = () => {
  const { t } = useTranslation('profile');
  const router = useRouter();
  const { state, setSubscriptionsLoading, setSubscriptions, setCancelSubscription, setPaymentStatus } = subscriptionAction();
  const { subscriptions } = state;
  const { createToast } = useCustomToast({ toastId: 'canceling-subscription-error-action' });

  const getPlanOffer = async ({ slug, onOpenUpgrade = () => { }, disableRedirects = false, withCurrentPlan = false }) => {
    try {
      const res = await bc.payment({
        original_plan: slug,
      }).planOffer();
      const data = res?.data;
      const currentOffer = data.find((item) => item.original_plan?.slug === slug);
      // find out if a plan has a plan offer
      const currentSuggestedPlan = withCurrentPlan ? currentOffer?.original_plan : currentOffer?.suggested_plan;
      if (currentOffer && currentSuggestedPlan?.slug) {
        const offerData = currentSuggestedPlan;
        const { data: bullets } = await bc.payment().getServiceItemsByPlan(encodeURIComponent(slug));
        const outOfConsumables = currentOffer.original_plan?.service_items.some((item) => item.how_many === 0);

        // -------------------------------------------------- PREPARING PRICES --------------------------------------------------
        const existsAmountPerHalf = offerData.price_per_half > 0;
        const existsAmountPerMonth = offerData.price_per_month > 0;
        const existsAmountPerQuarter = offerData.price_per_quarter > 0;
        const existsAmountPerYear = offerData.price_per_year > 0;

        const isNotTrial = existsAmountPerHalf || existsAmountPerMonth || existsAmountPerQuarter || existsAmountPerYear;
        const financingOptionsExists = offerData.financing_options?.length > 0;
        const financingOptionsManyMonthsExists = financingOptionsExists && offerData.financing_options.some((l) => l.monthly_price > 0 && l.how_many_months > 1);
        const financingOptionsOnePaymentExists = financingOptionsExists && offerData.financing_options.some((l) => l.monthly_price > 0 && l.how_many_months === 1);

        const isTotallyFree = !isNotTrial && offerData.trial_duration === 0 && !financingOptionsExists;

        const financingOptionsManyMonths = financingOptionsManyMonthsExists
          ? offerData.financing_options
            .filter((l) => l.monthly_price > 0 && l.how_many_months > 1)
            .sort((a, b) => a.monthly_price - b.monthly_price)
          : [];

        const financingOptionsOnePayment = financingOptionsOnePaymentExists
          ? offerData.financing_options
            .filter((l) => l.monthly_price > 0 && l.how_many_months === 1)
            .sort((a, b) => a.monthly_price - b.monthly_price)
          : [];

        const getTrialLabel = () => {
          const labels = {
            WEEK: {
              priceText: `${t('subscription.upgrade-modal.duration_days', { duration: offerData.trial_duration * 7 })} ${t('subscription.upgrade-modal.connector_duration_trial')}`,
              description: `${t('subscription.upgrade-modal.no_card_needed')} ${t('subscription.upgrade-modal.duration_days', { duration: offerData.trial_duration * 7 })}`,
            },
            DAY: {
              priceText: `${t('subscription.upgrade-modal.duration_days', { duration: offerData.trial_duration })} ${t('subscription.upgrade-modal.connector_duration_trial')}`,
              description: `${t('subscription.upgrade-modal.no_card_needed')} ${t('subscription.upgrade-modal.duration_days', { duration: offerData.trial_duration })}`,
            },
            MONTH: {
              priceText: `${offerData.trial_duration} month trial`,
              description: `${t('subscription.upgrade-modal.no_card_needed')} ${t('subscription.upgrade-modal.duration_month', { duration: offerData.trial_duration })}`,
            },
          };
          if (isTotallyFree) {
            return {
              priceText: t('subscription.upgrade-modal.free-course'),
              description: t('subscription.upgrade-modal.full_access'),
            };
          }
          if (offerData.trial_duration_unit in labels) {
            return labels[offerData.trial_duration_unit];
          }
          return {
            priceText: t('subscription.upgrade-modal.free_trial'),
            description: '',
          };
        };

        const onePaymentFinancing = financingOptionsOnePaymentExists ? financingOptionsOnePayment.map((item) => ({
          title: t('subscription.upgrade-modal.one_payment'),
          price: item.monthly_price,
          priceText: `$${item.monthly_price}`,
          period: 'FINANCING',
          description: t('subscription.upgrade-modal.full_access'),
          plan_id: `f-${item.monthly_price}-${item.how_many_months}`,
          suggested_plan: offerData,
          type: 'PAYMENT',
          show: true,
          how_many_months: item.how_many_months,
        })) : [];

        const trialPlan = (!financingOptionsExists && !isNotTrial) ? {
          title: t('subscription.upgrade-modal.free_trial'),
          price: 0,
          priceText: getTrialLabel().priceText,
          period: offerData.trial_duration_unit,
          description: getTrialLabel().description,
          plan_id: `p-${offerData.trial_duration}-trial`,
          suggested_plan: offerData,
          type: isTotallyFree ? 'FREE' : 'TRIAL',
          show: true,
          trialDuration: offerData.trial_duration,
          isFreeTier: true,
        } : {};

        const monthPlan = !financingOptionsOnePaymentExists && existsAmountPerMonth ? [{
          title: t('subscription.upgrade-modal.monthly_payment'),
          price: offerData.price_per_month,
          priceText: `$${offerData.price_per_month}`,
          period: 'MONTH',
          description: t('subscription.upgrade-modal.full_access'),
          plan_id: `p-${offerData.price_per_month}`,
          suggested_plan: offerData,
          type: 'PAYMENT',
          show: true,
        }] : onePaymentFinancing;

        const yearPlan = existsAmountPerYear ? {
          title: t('subscription.upgrade-modal.yearly_payment'),
          price: offerData.price_per_year,
          priceText: `$${offerData.price_per_year}`,
          period: 'YEAR',
          description: t('subscription.upgrade-modal.full_access'),
          plan_id: `p-${offerData.price_per_year}`,
          suggested_plan: offerData,
          type: 'PAYMENT',
          show: true,
        } : {};

        const financingOption = financingOptionsManyMonthsExists ? financingOptionsManyMonths.map((item) => ({
          title: t('subscription.upgrade-modal.many_months_payment', { qty: item.how_many_months }),
          price: item.monthly_price,
          priceText: `$${item.monthly_price} x ${item.how_many_months}`,
          period: 'FINANCING',
          description: t('subscription.upgrade-modal.many_months_description', { monthly_price: item.monthly_price, many_months: item.how_many_months }),
          plan_id: `f-${item.monthly_price}-${item.how_many_months}`,
          suggested_plan: offerData,
          type: 'PAYMENT',
          show: true,
          how_many_months: item.how_many_months,
        })) : [];

        const paymentList = [...monthPlan, yearPlan, trialPlan].filter((plan) => Object.keys(plan).length > 0);
        const financingList = financingOption?.filter((plan) => Object.keys(plan).length > 0);

        const finalData = {
          title: toCapitalize(unSlugify(String(offerData.slug))),
          slug: offerData.slug,
          isTotallyFree,
          details: offerData.details,
          expires_at: offerData.expires_at,
          show_modal: currentOffer.show_modal,
          pricing_exists: isNotTrial || financingOptionsExists,
          paymentOptions: paymentList,
          financingOptions: financingList,
          outOfConsumables,
          consumableOptions: [],
          bullets,
        };
        // -------------------------------------------------- END PREPARING PRICES --------------------------------------------------

        if (currentOffer.show_modal && !disableRedirects) {
          onOpenUpgrade(finalData);
        }

        if (currentOffer.show_modal === false && offerData && !disableRedirects) {
          router.push(`/checkout?plan=${offerData.slug}`);
        }
        return finalData;
      }
      return {
        status: 'error-getting-plan-offer',
      };
    } catch (e) {
      createToast({
        position: 'top',
        title: t('alert-message:error-getting-offer'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
