import { Button } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Link from '../../../common/components/NextChakraLink';
import bc from '../../../common/services/breathecode';

const ButtonHandler = ({
  translations, subscription, onOpenUpgrade, setSubscriptionProps, onOpenCancelSubscription,
}) => {
  const { t } = useTranslation('profile');
  const status = subscription?.status;
  const [isLoading, setIsLoading] = useState(false);
  const isFullyPaid = subscription?.status.toLowerCase() === 'fully_paid';
  const planSlug = subscription?.plans?.[0]?.slug;
  const subscriptionTR = translations?.subscription;
  const router = useRouter();

  const getPlanOffer = (slug) => {
    setIsLoading(true);
    bc.payment({
      original_plan: slug,
    }).planOffer()
      .then((res) => {
        const data = res?.data;
        const currentPlanOffer = data.find((item) => item?.original_plan?.slug === slug);
        const currentSlug = currentPlanOffer?.original_plan?.slug;
        // const hasConsumables = currentPlanOffer?.original_plan?.service_items.some((item) => item?.how_many > 0);

        if (data[0]?.show_modal) {
          onOpenUpgrade(currentPlanOffer);
        }

        if (data[0]?.show_modal === false && data[0]?.original_plan) {
          router.push(`/signup?plan=${currentSlug}`);
        }
      })
      .finally(() => setIsLoading(false));
  };

  const getStyles = () => {
    // ACTIVE, FREE_TRIAL, FULLY_PAID, CANCELLED, PAYMENT_ISSUE
    if (status === 'ACTIVE' || status === 'FULLY_PAID') {
      return {
        text: subscriptionTR?.cancel || t('subscription.cancel'),
        style: {
          variant: 'link',
        },
      };
    }
    if (status === 'FREE_TRIAL') {
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
      };
    }

    // ANOTHER STATUS
    return {
      text: subscriptionTR?.upgrade || t('subscription.upgrade'),
      style: {
        variant: 'outline',
        color: 'blue.default',
        borderColor: 'currentColor',
        fontWeight: 700,
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
            if (['FREE_TRIAL', 'PAYMENT_ISSUE'].includes(status)) getPlanOffer(planSlug);
            if (['ACTIVE', 'FULLY_PAID'].includes(status)) onOpenCancelSubscription();
            setSubscriptionProps(subscription);
          }}
          color="blue.default"
          margin="auto 0 0 0"
          {...buttonProps.style}
        >
          {buttonProps.text}
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
};

ButtonHandler.defaultProps = {
  translations: {},
  subscription: {},
  onOpenUpgrade: () => {},
  setSubscriptionProps: () => {},
  onOpenCancelSubscription: () => {},
};

export default ButtonHandler;
