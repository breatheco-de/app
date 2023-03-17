import { Button } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Link from '../../../common/components/NextChakraLink';
import profileHandlers from './handlers';

const ButtonHandler = ({
  translations, subscription, onOpenUpgrade, setSubscriptionProps, onOpenCancelSubscription, onlyUpgrade, children, ...restStyles
}) => {
  const { t } = useTranslation('profile');
  const status = subscription?.status;
  const [isLoading, setIsLoading] = useState(false);
  const isFullyPaid = subscription?.status?.toLowerCase() === 'fully_paid';
  const planSlug = subscription?.plans?.[0]?.slug;
  const subscriptionTR = translations?.subscription;
  const isPlanFinancingExpired = subscription.type === 'plan_financing' && subscription.valid_until < new Date().toISOString();

  const {
    getPlanOffer,
  } = profileHandlers();

  const handlePlanOffer = () => {
    setIsLoading(true);
    getPlanOffer(planSlug)
      .finally(() => setIsLoading(false));
  };

  const getStyles = () => {
    // ACTIVE, FREE_TRIAL, FULLY_PAID, CANCELLED, PAYMENT_ISSUE
    if (subscription.type !== 'plan_financing' && (status === 'ACTIVE' || status === 'FULLY_PAID')) {
      return {
        text: subscriptionTR?.cancel || t('subscription.cancel'),
        style: {
          variant: 'link',
        },
      };
    }

    if (status === 'FREE_TRIAL' || isPlanFinancingExpired) {
      return {
        text: subscriptionTR?.upgrade || t('subscription.upgrade'),
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
        text: subscriptionTR?.['reactivate-subscription'] || t('subscription.reactivate-subscription'),
        style: {
          variant: 'default',
          color: 'white',
          fontWeight: 700,
        },
        isComponent: true,
        component: (
          <Link variant="buttonDefault" href={`/signup?plan=${planSlug}`} textAlign="center" margin="auto 0 0 0">
            {subscriptionTR?.['reactivate-subscription'] || t('subscription.reactivate-subscription')}
          </Link>
        ),
        // component: (
        //   <Button
        //     variant="default"
        //     href={`/signup?plan=${planSlug}`}
        //     onClick={() => {
        //       bc.payment({
        //         original_plan: planSlug,
        //       }).planOffer()
        //         .then((response) => {
        //           const data = response?.data;
        //           const currentOffer = data.find((item) => item?.original_plan?.slug === planSlug);

        //           if (response.data) {
        //             router.push(`/signup?plan=${currentOffer?.suggested_plan?.slug}`);
        //           }
        //         });
        //     }}
        //     textAlign="center"
        //     margin="auto 0 0 0"
        //   >
        //     {subscriptionTR?.['reactivate-subscription'] || t('subscription.reactivate-subscription')}
        //   </Button>
        // ),
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
            if (isPlanFinancingExpired) handlePlanOffer();
            if (['FREE_TRIAL', 'PAYMENT_ISSUE'].includes(status)) handlePlanOffer();
            if (['ACTIVE', 'FULLY_PAID'].includes(status) && subscription.type !== 'plan_financing') onOpenCancelSubscription();
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
};

ButtonHandler.propTypes = {
  translations: PropTypes.objectOf(PropTypes.any),
  subscription: PropTypes.objectOf(PropTypes.any),
  onOpenUpgrade: PropTypes.func,
  setSubscriptionProps: PropTypes.func,
  onOpenCancelSubscription: PropTypes.func,
  onlyUpgrade: PropTypes.bool,
  restStyles: PropTypes.objectOf(PropTypes.any),
  children: PropTypes.node,
};

ButtonHandler.defaultProps = {
  translations: {},
  subscription: {},
  onOpenUpgrade: () => {},
  setSubscriptionProps: () => {},
  onOpenCancelSubscription: () => {},
  onlyUpgrade: false,
  restStyles: {},
  children: null,
};

export default ButtonHandler;
