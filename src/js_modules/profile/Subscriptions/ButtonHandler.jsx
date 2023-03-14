import { Button } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Link from '../../../common/components/NextChakraLink';
import bc from '../../../common/services/breathecode';
import { toCapitalize, unSlugify } from '../../../utils';

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
        const currentOffer = data.find((item) => item?.original_plan?.slug === slug);
        const originalPlan = currentOffer?.original_plan;
        const offerData = currentOffer?.suggested_plan;
        const outOfConsumables = currentOffer?.original_plan?.service_items.some((item) => item?.how_many === 0);

        // -------------------------------------------------- PREPARING PRICES --------------------------------------------------
        const existsAmountPerHalf = offerData?.price_per_half > 0;
        const existsAmountPerMonth = offerData?.price_per_month > 0;
        const existsAmountPerQuarter = offerData?.price_per_quarter > 0;
        const existsAmountPerYear = offerData?.price_per_year > 0;

        const isNotTrial = existsAmountPerHalf || existsAmountPerMonth || existsAmountPerQuarter || existsAmountPerYear;
        const financingOptionsExists = offerData?.financing_options?.length > 0 && offerData?.financing_options[0]?.monthly_price > 0;

        const trialPlan = !isNotTrial ? {
          title: 'Free Trial',
          price: 0,
          priceText: t('free-trial'),
          trialDuration: offerData?.trial_duration,
          period: offerData?.trial_duration_unit,
          type: 'TRIAL',
          isFree: true,
          show: true,
        } : {};

        const monthPlan = existsAmountPerMonth ? {
          title: 'Monthly Payment',
          price: offerData?.price_per_month,
          priceText: `$${offerData?.price_per_month}`,
          period: 'MONTH',
          type: 'PAYMENT',
          show: true,
        } : {};

        const yearPlan = existsAmountPerYear ? {
          title: 'Yearly Payment',
          price: offerData?.price_per_year,
          priceText: `$${offerData?.price_per_year}`,
          period: 'YEAR',
          type: 'PAYMENT',
          show: true,
        } : {};
        const financingOption = financingOptionsExists ? {
          title: 'Scholarship Level 1',
          price: offerData?.financing_options[0]?.monthly_price,
          priceText: `$${offerData?.financing_options[0]?.monthly_price} x ${offerData?.financing_options[0]?.how_many_months}`,
          period: 'FINANCING',
          how_many_months: offerData?.financing_options[0]?.how_many_months,
          type: 'PAYMENT',
          show: true,
        } : {};

        const consumableOption = outOfConsumables && offerData?.service_items?.length > 0
          ? offerData?.service_items.map((item) => ({
            title: toCapitalize(unSlugify(String(item?.service?.slug))),
            price: item?.service?.price_per_unit,
            how_many: item?.how_many,
            type: 'CONSUMABLE',
            show: true,
          }))
          : {};

        const paymentList = [trialPlan, monthPlan, yearPlan].filter((plan) => Object.keys(plan).length > 0);
        const financingList = [financingOption].filter((plan) => Object.keys(plan).length > 0);
        const consumableList = [consumableOption].filter((plan) => Object.keys(plan).length > 0);

        const finalData = {
          title: toCapitalize(unSlugify(String(offerData?.slug))),
          details: offerData?.details,
          expires_at: offerData?.expires_at,
          show_modal: currentOffer?.show_modal,
          isTrial: !isNotTrial && !financingOptionsExists,
          paymentOptions: paymentList,
          financingOptions: financingList,
          outOfConsumables,
          consumableOptions: consumableList,
        };
        // -------------------------------------------------- END PREPARING PRICES --------------------------------------------------

        if (currentOffer?.show_modal) {
          onOpenUpgrade(finalData);
        }

        if (currentOffer?.show_modal === false && currentOffer?.original_plan) {
          router.push(`/signup?plan=${originalPlan?.slug}`);
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
