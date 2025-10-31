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
  const { subscription_id: subscriptionId, plan_financing_id: planFinancingId, early_renewal_window_days: earlyRenewalWindowDays } = router.query;

  const {
    state,
    setSelectedPlan,
  } = signupAction();
  const { selectedPlan } = state;

  const { originalPlan } = useCheckout();

  const [existingSubscription, setExistingSubscription] = useState(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [initialPlanFinancingPrice, setInitialPlanFinancingPrice] = useState(null);
  const [planFinancingOption, setPlanFinancingOption] = useState(null);

  useEffect(() => {
    const fetchExistingSubscription = async () => {
      if (!subscriptionId && !planFinancingId) {
        createToast({
          position: 'top',
          title: t('alert-message:missing-subscription-id'),
          description: t('alert-message:missing-subscription-id-description'),
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
          title: t('alert-message:multiple-subscription-ids'),
          description: t('alert-message:multiple-subscription-ids-description'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        router.push('/');
        setIsLoadingSubscription(false);
        return;
      }

      if (!earlyRenewalWindowDays) {
        createToast({
          position: 'top',
          title: t('alert-message:missing-renewal-window'),
          description: t('alert-message:missing-renewal-window-description'),
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
        };

        const response = await bc.payment(queryParams).subscriptions();

        const subscription = response.data.subscriptions?.[0] || response.data.plan_financings?.[0];

        if (subscription) {
          const currentUser = user?.id;
          const subscriptionUserId = subscription.user?.id;
          if (currentUser && subscriptionUserId && currentUser !== subscriptionUserId) {
            createToast({
              position: 'top',
              title: t('alert-message:subscription-not-yours'),
              description: t('alert-message:subscription-not-yours-description'),
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
              title: t('alert-message:subscription-deprecated-status'),
              description: t('alert-message:subscription-deprecated-status-description'),
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
              title: t('alert-message:subscription-cancelled-status'),
              description: t('alert-message:subscription-cancelled-status-description'),
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
              title: t('alert-message:subscription-expired-status'),
              description: t('alert-message:subscription-expired-status-description'),
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
              title: t('alert-message:subscription-invalid-status'),
              description: t('alert-message:subscription-invalid-status-description'),
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
              title: t('alert-message:subscription-expired'),
              description: t('alert-message:subscription-expired-description'),
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
            const windowDays = Number(earlyRenewalWindowDays);

            const renewalWindowStart = new Date(nextPayment);
            renewalWindowStart.setDate(renewalWindowStart.getDate() - windowDays);
            if (earlyRenewalWindowDays) {
              if (now < renewalWindowStart) {
                createToast({
                  position: 'top',
                  title: t('alert-message:too-early-to-renew'),
                  description: t('alert-message:too-early-to-renew-description', {
                    startDate: renewalWindowStart.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }),
                    nextDate: nextPayment.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }),
                  }),
                  status: 'error',
                  duration: 7000,
                  isClosable: true,
                });
                router.push('/profile/subscriptions');
                return;
              }

              if (now > nextPayment && subscription.status !== 'PAYMENT_ISSUE') {
                createToast({
                  position: 'top',
                  title: t('alert-message:payment-overdue'),
                  description: t('alert-message:payment-overdue-description'),
                  status: 'error',
                  duration: 7000,
                  isClosable: true,
                });
                router.push('/profile/subscriptions');
                return;
              }
            }

            const renewalWindowEnd = subscription.status === 'PAYMENT_ISSUE' ? now : nextPayment;
            const recentPayment = subscription.invoices
              ?.filter((invoice) => invoice.status === 'FULFILLED'
                && new Date(invoice.paid_at) >= renewalWindowStart
                && new Date(invoice.paid_at) <= renewalWindowEnd)
              ?.sort((a, b) => new Date(b.paid_at) - new Date(a.paid_at))[0];

            if (recentPayment) {
              const paidAtDate = new Date(recentPayment.paid_at);
              createToast({
                position: 'top',
                title: t('alert-message:already-renewed'),
                description: t('alert-message:already-renewed-description', {
                  paidDate: paidAtDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                  nextDate: nextPayment.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                }),
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
            title: t('alert-message:subscription-not-found'),
            description: t('alert-message:subscription-not-found-description'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        createToast({
          position: 'top',
          title: t('alert-message:error-loading-subscription'),
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
  }, [subscriptionId, planFinancingId, earlyRenewalWindowDays]);

  useEffect(() => {
    if (!existingSubscription || !originalPlan?.plans) return;
    console.log('existingSubscription', existingSubscription);
    const firstInvoice = existingSubscription.invoices?.[0];

    const payEvery = existingSubscription.pay_every || existingSubscription.how_many_installments;
    const payEveryUnit = existingSubscription.pay_every_unit;

    let matchingPlan;

    if (payEvery === 1 && payEveryUnit === 'MONTH') {
      matchingPlan = originalPlan.plans.find((plan) => plan.period === 'MONTH');
    } else if (payEvery === 1 && payEveryUnit === 'YEAR') {
      matchingPlan = originalPlan.plans.find((plan) => plan.period === 'YEAR');
    } else {
      matchingPlan = originalPlan.plans.find((plan) => plan.how_many_months === payEvery);

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
      matchingPlan = originalPlan.plans.find((plan) => plan.period === 'MONTH')
        || originalPlan.plans.find((plan) => plan.period === 'YEAR')
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
        return_url: `${window.location.origin}/choose-program?coinbase_pending=true&coinbase_is_renewal=true`,
        cancel_url: window.location.href,
      });
    } else if (planFinancingId) {
      resp = await bc.payment().renewPlanFinancing({
        planfinancing: planFinancingId,
        payment_method: 'coinbase',
        return_url: `${window.location.origin}/choose-program?coinbase_pending=true&coinbase_is_renewal=true`,
        cancel_url: window.location.href,
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

  return {
    isLoadingSubscription,
    handleRenewalPayment,
    handleCoinbaseRenewalPayment,
    initialPlanFinancingPrice,
    calculateTotalPlanFinancingPrice,
  };
};

export default useRenewal;
