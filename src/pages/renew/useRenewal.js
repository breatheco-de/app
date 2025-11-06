import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useCheckout from '../checkout/useCheckout';
import bc from '../../services/breathecode';
import useCustomToast from '../../hooks/useCustomToast';
import signupAction from '../../store/actions/signupAction';
import useAuth from '../../hooks/useAuth';
import { reportDatalayer } from '../../utils/requests';
import { getBrowserInfo } from '../../utils';

const useRenewal = () => {
  const { t } = useTranslation('signup');
  const { createToast } = useCustomToast();
  const router = useRouter();
  const { user } = useAuth();
  const { subscription_id: subscriptionId, plan_financing_id: planFinancingId, plan } = router.query;

  const {
    state,
    setSelectedPlan,
  } = signupAction();
  const { selectedPlan } = state;

  const { originalPlan, currencySymbol } = useCheckout();

  const [existingSubscription, setExistingSubscription] = useState(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [initialPlanFinancingPrice, setInitialPlanFinancingPrice] = useState(null);
  const [planFinancingOption, setPlanFinancingOption] = useState(null);

  useEffect(() => {
    if (!plan) {
      createToast({
        position: 'top',
        title: t('signup:alert-message.missing-plan-slug'),
        description: t('signup:alert-message.missing-plan-slug-description'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      router.push('/');
      setIsLoadingSubscription(false);
    }
  }, [plan]);

  useEffect(() => {
    const fetchExistingSubscription = async () => {
      if (!subscriptionId && !planFinancingId) {
        createToast({
          position: 'top',
          title: t('signup:alert-message.missing-subscription-id'),
          description: t('signup:alert-message.missing-subscription-id-description'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        router.push('/');
        setIsLoadingSubscription(false);
        return;
      }

      if (subscriptionId && planFinancingId) {
        createToast({
          position: 'top',
          title: t('signup:alert-message.multiple-subscription-ids'),
          description: t('signup:alert-message.multiple-subscription-ids-description'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        router.push('/');
        setIsLoadingSubscription(false);
        return;
      }

      const id = subscriptionId || planFinancingId;

      try {
        setIsLoadingSubscription(true);
        const queryParams = {
          subscription: subscriptionId ? id : undefined,
          'plan-financing': planFinancingId ? id : undefined,
          status: 'ACTIVE,CANCELLED,PAYMENT_ISSUE,DEPRECATED,EXPIRED',
          plan,
        };

        const response = await bc.payment(queryParams).subscriptions();

        const subscription = response.data.subscriptions?.[0] || response.data.plan_financings?.[0];

        if (subscription) {
          const currentUser = user?.id;
          const subscriptionUserId = subscription.user?.id;
          if (currentUser && subscriptionUserId && currentUser !== subscriptionUserId) {
            createToast({
              position: 'top',
              title: t('signup:alert-message.subscription-not-yours'),
              description: t('signup:alert-message.subscription-not-yours-description'),
              status: 'error',
              duration: 7000,
              isClosable: true,
            });
            router.push('/');
            return;
          }
          if (subscription.status === 'DEPRECATED') {
            createToast({
              position: 'top',
              title: t('signup:alert-message.subscription-deprecated-status'),
              description: t('signup:alert-message.subscription-deprecated-status-description'),
              status: 'error',
              duration: 7000,
              isClosable: true,
            });
            router.push('/');
            return;
          }
          if (subscription.status === 'CANCELLED') {
            createToast({
              position: 'top',
              title: t('signup:alert-message.subscription-cancelled-status'),
              description: t('signup:alert-message.subscription-cancelled-status-description'),
              status: 'error',
              duration: 7000,
              isClosable: true,
            });
            router.push('/');
            return;
          }
          if (subscription.status === 'EXPIRED') {
            createToast({
              position: 'top',
              title: t('signup:alert-message.subscription-expired-status'),
              description: t('signup:alert-message.subscription-expired-status-description'),
              status: 'error',
              duration: 7000,
              isClosable: true,
            });
            router.push('/');
            return;
          }
          const validStatuses = ['ACTIVE', 'PAYMENT_ISSUE'];
          if (!validStatuses.includes(subscription.status)) {
            createToast({
              position: 'top',
              title: t('signup:alert-message.subscription-invalid-status'),
              description: t('signup:alert-message.subscription-invalid-status-description'),
              status: 'error',
              duration: 7000,
              isClosable: true,
            });
            router.push('/');
            return;
          }

          if (subscription.valid_until && new Date(subscription.valid_until) < new Date()) {
            createToast({
              position: 'top',
              title: t('signup:alert-message.subscription-expired-status'),
              description: t('signup:alert-message.subscription-expired-status-description'),
              status: 'error',
              duration: 7000,
              isClosable: true,
            });
            router.push('/');
            return;
          }

          setExistingSubscription(subscription);

          if (subscription.next_payment_at) {
            const nextPayment = new Date(subscription.next_payment_at);
            const now = new Date();

            if (now > nextPayment && subscription.status !== 'PAYMENT_ISSUE') {
              createToast({
                position: 'top',
                title: t('signup:alert-message.payment-overdue'),
                description: t('signup:alert-message.payment-overdue-description'),
                status: 'error',
                duration: 7000,
                isClosable: true,
              });
              router.push('/profile/subscriptions');
              return;
            }
          }
        } else {
          createToast({
            position: 'top',
            title: t('signup:alert-message.subscription-not-found'),
            description: t('signup:alert-message.subscription-not-found-description'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching subscripti  on:', error);
        createToast({
          position: 'top',
          title: t('signup:alert-message.error-loading-subscription'),
          description: error?.response?.data?.detail || error.message,
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchExistingSubscription();
  }, [subscriptionId, planFinancingId]);

  useEffect(() => {
    if (!existingSubscription || !originalPlan?.plans) return;
    const firstInvoice = existingSubscription.invoices?.[0];

    const payEvery = existingSubscription.pay_every || existingSubscription.how_many_installments;
    const payEveryUnit = existingSubscription.pay_every_unit;

    let matchingPlan;

    if (payEvery === 1 && payEveryUnit === 'MONTH') {
      matchingPlan = originalPlan.plans.find((p) => p.period === 'MONTH');
    } else if (payEvery === 1 && payEveryUnit === 'YEAR') {
      matchingPlan = originalPlan.plans.find((p) => p.period === 'YEAR');
    } else {
      matchingPlan = originalPlan.plans.find((p) => p.how_many_months === payEvery);

      // Derive the display price per installment from the first invoice amount, but exclude reward coupons
      let amount = Number(firstInvoice?.amount) || 0;
      const coupons = Array.isArray(firstInvoice?.bag?.coupons) ? firstInvoice.bag.coupons : [];
      const rewardCoupons = coupons.filter((coup) => (
        coup && coup.referral_type === 'NO_REFERRAL' && coup.allowed_user
      ));

      rewardCoupons.forEach((coup) => {
        const v = Number(coup?.discount_value) || 0;
        if (coup?.discount_type === 'PERCENT_OFF') {
          const factor = 1 - v;
          if (factor > 0) amount /= factor;
        } else if (coup?.discount_type === 'FIXED_PRICE') {
          amount += v;
        }
      });

      setInitialPlanFinancingPrice(amount);
      setPlanFinancingOption(existingSubscription.how_many_installments);
    }

    if (!matchingPlan) {
      matchingPlan = originalPlan.plans.find((p) => p.period === 'MONTH')
        || originalPlan.plans.find((p) => p.period === 'YEAR')
        || originalPlan.plans[0];
    }

    if (matchingPlan) {
      setSelectedPlan(matchingPlan);
    }
  }, [existingSubscription, originalPlan]);

  const handleRenewalPayment = async () => {
    try {
      let resp;
      if (subscriptionId) {
        resp = await bc.payment().renewSubscription({
          subscription: subscriptionId,
          payment_method: 'stripe',
        });
      } else if (planFinancingId) {
        resp = await bc.payment().renewPlanFinancing({
          planfinancing: planFinancingId,
          payment_method: 'stripe',
        });
      } else {
        throw new Error('No subscription_id or plan_financing_id provided');
      }

      if (resp.data.status === 'ok') {
        const currency = selectedPlan?.currency?.code;
        reportDatalayer({
          dataLayer: {
            event: 'renewal_payment',
            path: '/renew',
            value: selectedPlan?.price,
            currency,
            payment_type: 'Credit card',
            plan: selectedPlan?.plan_slug,
            period_label: selectedPlan?.period_label,
            agent: getBrowserInfo(),
          },
        });
      }

      return resp?.data;
    } catch (error) {
      console.error('Error in renewal:', error);
      return error.response?.data;
    }
  };

  const handleCoinbaseRenewalPayment = async () => {
    let resp;

    if (subscriptionId) {
      resp = await bc.payment().renewSubscription({
        subscription: subscriptionId,
        payment_method: 'coinbase',
        return_url: `${window.location.origin}/crypto-payment-success`,
      });
    } else if (planFinancingId) {
      resp = await bc.payment().renewPlanFinancing({
        planfinancing: planFinancingId,
        payment_method: 'coinbase',
        return_url: `${window.location.origin}/crypto-payment-success`,
      });
    } else {
      throw new Error('No subscription_id or plan_financing_id provided');
    }
    return resp;
  };

  const calculateTotalPlanFinancingPrice = () => {
    if (!initialPlanFinancingPrice) return '';
    return initialPlanFinancingPrice * planFinancingOption;
  };
  const getRemainingInstallments = () => {
    if (!existingSubscription || !existingSubscription.how_many_installments) {
      return null;
    }

    const totalInstallments = existingSubscription.how_many_installments;
    const fulfilledInvoices = existingSubscription.invoices?.filter(
      (invoice) => invoice.status === 'FULFILLED' && invoice.bag?.was_delivered === true,
    ) || [];

    const paidInstallments = fulfilledInvoices.length;
    return totalInstallments - paidInstallments;
  };
  const renderPlanFinancingDetails = () => {
    if (selectedPlan?.price > 0) {
      const remaining = getRemainingInstallments();

      return (
        `${currencySymbol}${initialPlanFinancingPrice?.toFixed(2)} / ${remaining}`
      );
    }

    return null;
  };

  return {
    isLoadingSubscription,
    handleRenewalPayment,
    handleCoinbaseRenewalPayment,
    initialPlanFinancingPrice,
    calculateTotalPlanFinancingPrice,
    renderPlanFinancingDetails,
  };
};

export default useRenewal;
