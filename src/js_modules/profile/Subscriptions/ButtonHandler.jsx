/* eslint-disable react/jsx-no-useless-fragment */
import { Button } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useState } from 'react';
import profileHandlers from './handlers';

function ButtonHandler({
  subscription, onOpenUpgrade, setSubscriptionProps, onOpenCancelSubscription, children, allSubscriptions, ...restStyles
}) {
  const { t } = useTranslation('profile');
  const status = subscription?.status;
  const [isLoading, setIsLoading] = useState(false);
  const isFullyPaid = subscription?.status?.toLowerCase() === 'fully_paid';
  const planSlug = subscription?.plans?.[0]?.slug;
  const isPlanFinancingExpired = subscription?.type === 'plan_financing' && subscription?.valid_until < new Date().toISOString();
  const planOfferedAcquired = allSubscriptions?.some((sub) => sub.plans.some((plan) => plan.slug === subscription?.planOffer?.slug));

  const { getPlanOffer, reactivatePlan } = profileHandlers({});
  const handlePlanOffer = () => {
    setIsLoading(true);
    getPlanOffer({ slug: planSlug, onOpenUpgrade }).finally(() => setIsLoading(false));
  };

  const handleReactivatePlan = () => {
    setIsLoading(true);
    reactivatePlan(planSlug, status);
  };

  const getStyles = () => {
    if (planOfferedAcquired && (status === 'FREE_TRIAL' || status === 'FULLY_PAID')) {
      return {
        text: '',
        style: {
          display: 'none',
        },
      };
    }

    if (planOfferedAcquired && status === 'ACTIVE') {
      return {
        text: '',
        style: {
          display: 'none',
        },
      };
    }

    if (status === 'FREE_TRIAL' || (subscription?.type !== 'plan_financing' && (status === 'ACTIVE' || status === 'FULLY_PAID') && subscription?.planOffer.slug)) {
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

    if (subscription?.type !== 'plan_financing' && (status === 'ACTIVE' || status === 'FULLY_PAID')) {
      return {
        text: t('subscription.cancel'),
        style: {
          variant: 'link',
        },
      };
    }

    if (status === 'CANCELLED') {
      return {
        text: t('subscription.reactivate-subscription'),
        style: {
          variant: 'default',
          color: 'white',
          fontWeight: 500,
        },
      };
    }

    // if (status === 'PAYMENT_ISSUE') {
    //   return {
    //     text: t('subscription.reactivate-subscription'),
    //     style: {
    //       variant: 'default',
    //       color: 'white',
    //       fontWeight: 700,
    //     },
    //     isComponent: true,
    //     component: (
    //       <Link variant="buttonDefault" justifyContent="center" display="inherit" href={`/checkout?plan=${planSlug}`} textAlign="center" margin="auto 0 0 0">
    //         {t('subscription.reactivate-subscription')}
    //       </Link>
    //     ),
    //   };
    // }

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
            if (isPlanFinancingExpired) handlePlanOffer();
            if ((['FREE_TRIAL', 'PAYMENT_ISSUE'].includes(status)) || (['ACTIVE', 'FULLY_PAID'].includes(status) && subscription?.planOffer.slug)) handlePlanOffer();
            if (['ACTIVE', 'FULLY_PAID'].includes(status) && subscription?.type !== 'plan_financing' && !subscription?.planOffer.slug) onOpenCancelSubscription();
            if (['CANCELLED'].includes(status)) handleReactivatePlan();
            setSubscriptionProps(subscription);
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

ButtonHandler.propTypes = {
  subscription: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  onOpenUpgrade: PropTypes.func,
  setSubscriptionProps: PropTypes.func,
  onOpenCancelSubscription: PropTypes.func,
  restStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  children: PropTypes.node,
  allSubscriptions: PropTypes.arrayOf(PropTypes.objectOf([PropTypes.any])),
};

ButtonHandler.defaultProps = {
  subscription: {},
  onOpenUpgrade: () => { },
  setSubscriptionProps: () => { },
  onOpenCancelSubscription: () => { },
  restStyles: {},
  children: null,
  allSubscriptions: [],
};

export default ButtonHandler;
