/* eslint-disable react/jsx-no-useless-fragment */
import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import useSubscriptions from '../../../hooks/useSubscriptions';
import useCustomToast from '../../../hooks/useCustomToast';
import { reportDatalayer } from '../../../utils/requests';
import { getBrowserInfo } from '../../../utils';

function SubsriptionButton({
  subscription, setSubscriptionProps, onOpenCancelSubscription, children, allSubscriptions, ...restStyles
}) {
  const { t } = useTranslation('profile');
  const { createToast } = useCustomToast({ toastId: 'subscription-button' });
  const status = subscription?.status;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const planSlug = subscription?.plans?.[0]?.slug;
  const isPlanFinancingExpired = subscription?.type === 'plan_financing' && subscription?.valid_until < new Date().toISOString();
  const planOfferedAcquired = allSubscriptions?.some((sub) => sub.plans.some((plan) => plan.slug === subscription?.planOffer?.slug));

  const isFreeTrial = status === 'FREE_TRIAL';
  const isActive = status === 'ACTIVE';
  const isFullyPaid = subscription?.status?.toLowerCase() === 'fully_paid';
  const isError = status === 'ERROR';
  const isCancelled = status === 'CANCELLED';
  const isExpired = status === 'EXPIRED';
  const isPaymentIssue = status === 'PAYMENT_ISSUE';

  const { getPlanOffer, reactivateSubscription } = useSubscriptions();
  const handlePlanOffer = async () => {
    try {
      setIsLoading(true);
      const planOffer = await getPlanOffer(planSlug);
      router.push(`/checkout?plan=${planOffer.suggested_plan.slug}`);
    } catch (error) {
      createToast({
        position: 'top',
        title: t('alert-message:error-getting-offer'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivatePlan = async () => {
    setIsLoading(true);
    try {
      await reactivateSubscription(subscription);
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const manageActionBasedOnLocation = () => {
    if (router.pathname === '/profile/[slug]') {
      reportDatalayer({
        dataLayer: {
          event: 'chat_with_support',
          plan: planSlug,
          agent: getBrowserInfo(),
        },
      });
      return;
    }
    router.push('/profile/subscriptions');
  };

  const getStyles = () => {
    if (planOfferedAcquired && (isFreeTrial || isFullyPaid)) {
      return {
        text: '',
        style: {
          display: 'none',
        },
      };
    }

    if (planOfferedAcquired && isActive) {
      return {
        text: '',
        style: {
          display: 'none',
        },
      };
    }

    if (isFreeTrial || (subscription?.type !== 'plan_financing' && (isActive || isFullyPaid) && subscription?.planOffer?.slug)) {
      return {
        text: t('subscription.upgrade'),
        style: {
          variant: 'outline',
          color: 'blue.default',
          borderColor: 'currentColor',
          fontWeight: 700,
        },
      };
    }

    if (subscription?.type !== 'plan_financing' && (isActive || isFullyPaid)) {
      return {
        text: t('subscription.cancel'),
        style: {
          variant: 'link',
        },
      };
    }

    if (isCancelled) {
      return {
        text: t('subscription.reactivate-subscription'),
        style: {
          variant: 'default',
          color: 'white',
          fontWeight: 500,
        },
      };
    }

    if ((isPaymentIssue || isError || isExpired) && !subscription?.planOffer?.slug) {
      return {
        text: t('subscription.contact-support'),
        isComponent: true,
        component: (
          <>
            {isExpired && planSlug && (
              <Button
                onClick={() => router.push(`/checkout?plan=${planSlug}`)}
                marginTop="5px"
                textAlign="center"
                userSelect="none"
                justifyContent="center"
                fontSize="sm"
                fontWeight={700}
                color="white"
                width="100%"
                background="blue.default"
                _hover={{ opacity: 0.8 }}
              >
                {t('subscription.renew-subscription')}
              </Button>
            )}
            {isPaymentIssue && (
              <Button
                onClick={() => {
                  setSubscriptionProps(subscription);
                  if (isCancelled) {
                    handleReactivatePlan();
                  } else {
                    onOpenCancelSubscription();
                  }
                }}
                marginTop="5px"
                textAlign="center"
                userSelect="none"
                justifyContent="center"
                fontSize="sm"
                fontWeight={700}
                color="blue.1000"
                width="100%"
                _hover="none"
                _active="none"
                background="auto"
                height="none"
              >
                {isCancelled ? t('subscription.reactivate-subscription') : t('subscription.cancel')}
              </Button>
            )}
            <Button onClick={manageActionBasedOnLocation} marginTop="5px" textAlign="center" userSelect="none" justifyContent="center" fontSize="sm" fontWeight={700} color="blue.1000" width="100%" _hover="none" _active="none" background="auto" height="none">
              {router.pathname === '/profile/[slug]' ? t('subscription.contact-support') : t('subscription.manage-subscription')}
            </Button>
          </>
        ),
      };
    }

    return {
      text: '',
      style: {
        display: 'none',
      },
    };
  };

  const buttonProps = getStyles();

  return (
    <>
      {!isFullyPaid && buttonProps.isComponent && (
        <>
          {buttonProps?.component}
        </>
      )}
      {!isFullyPaid && !buttonProps.isComponent && (
        <Button
          isLoading={isLoading}
          onClick={() => {
            setSubscriptionProps(subscription);
            if (isPlanFinancingExpired) handlePlanOffer();
            if ((['FREE_TRIAL', 'PAYMENT_ISSUE'].includes(status)) || (['ACTIVE', 'FULLY_PAID'].includes(status) && subscription?.planOffer?.slug)) handlePlanOffer();
            if (['ACTIVE', 'FULLY_PAID'].includes(status) && subscription?.type !== 'plan_financing' && !subscription?.planOffer?.slug) onOpenCancelSubscription();
            if (['CANCELLED'].includes(status)) handleReactivatePlan();
          }}
          color="blue.default"
          margin="auto 0 0 0"
          {...buttonProps.style}
          {...restStyles}
        >
          {children || buttonProps.text}
        </Button>
      )}
    </>
  );
}

SubsriptionButton.propTypes = {
  subscription: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  setSubscriptionProps: PropTypes.func,
  onOpenCancelSubscription: PropTypes.func,
  restStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  children: PropTypes.node,
  allSubscriptions: PropTypes.arrayOf(PropTypes.objectOf([PropTypes.any])),
};

SubsriptionButton.defaultProps = {
  subscription: {},
  setSubscriptionProps: () => { },
  onOpenCancelSubscription: () => { },
  restStyles: {},
  children: null,
  allSubscriptions: [],
};

export default SubsriptionButton;
