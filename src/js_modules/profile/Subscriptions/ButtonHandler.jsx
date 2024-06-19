/* eslint-disable react/jsx-no-useless-fragment */
import { Button } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Link from '../../../common/components/NextChakraLink';
import profileHandlers from './handlers';

function ButtonHandler({
  subscription, onOpenUpgrade, setSubscriptionProps, onOpenCancelSubscription, children, ...restStyles
}) {
  const { t } = useTranslation('profile');
  const status = subscription?.status;
  const [isLoading, setIsLoading] = useState(false);
  const isFullyPaid = subscription?.status?.toLowerCase() === 'fully_paid';
  const planSlug = subscription?.plans?.[0]?.slug;
  const isPlanFinancingExpired = subscription?.type === 'plan_financing' && subscription?.valid_until < new Date().toISOString();

  const {
    getPlanOffer,
  } = profileHandlers({});

  const handlePlanOffer = () => {
    setIsLoading(true);
    getPlanOffer({ slug: planSlug, onOpenUpgrade })
      .finally(() => setIsLoading(false));
  };

  const getStyles = () => {
    if (subscription?.type !== 'plan_financing' && (status === 'ACTIVE' || status === 'FULLY_PAID')) {
      return {
        text: t('subscription.cancel'),
        style: {
          variant: 'link',
        },
      };
    }

    if (status === 'FREE_TRIAL' || (isPlanFinancingExpired && subscription?.planOffer?.pricing_exists)) {
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

    if (status === 'CANCELLED') {
      return {
        text: t('subscription.reactivate-subscription'),
        style: {
          variant: 'default',
          color: 'white',
          fontWeight: 700,
        },
        isComponent: true,
        component: (
          <Link variant="buttonDefault" justifyContent="center" display="inherit" href={`/checkout?plan=${planSlug}`} textAlign="center" margin="auto 0 0 0">
            {t('subscription.reactivate-subscription')}
          </Link>
        ),
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
            if (['FREE_TRIAL', 'PAYMENT_ISSUE'].includes(status)) handlePlanOffer();
            if (['ACTIVE', 'FULLY_PAID'].includes(status) && subscription?.type !== 'plan_financing') onOpenCancelSubscription();
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
};

ButtonHandler.defaultProps = {
  subscription: {},
  onOpenUpgrade: () => {},
  setSubscriptionProps: () => {},
  onOpenCancelSubscription: () => {},
  restStyles: {},
  children: null,
};

export default ButtonHandler;
