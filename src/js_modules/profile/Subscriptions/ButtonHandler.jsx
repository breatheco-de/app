import { Button } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Link from '../../../common/components/NextChakraLink';
import bc from '../../../common/services/breathecode';
import { isNumber, toCapitalize, unSlugify } from '../../../utils';

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

  const getPlanProps = async (slug) => {
    const resp = await bc.payment().getPlanProps(encodeURIComponent(slug));
    const data = await resp?.data;
    return data;
  };

  const getPlanOffer = (slug) => {
    setIsLoading(true);
    bc.payment({
      original_plan: slug,
    }).planOffer()
      .then(async (res) => {
        const data = res?.data;
        const currentOffer = data.find((item) => item?.original_plan?.slug === slug);

        // const originalPlan = currentOffer?.original_plan;
        const offerData = currentOffer?.suggested_plan;
        const bullets = await getPlanProps(offerData?.slug);
        const outOfConsumables = currentOffer?.original_plan?.service_items.some((item) => item?.how_many === 0);

        // -------------------------------------------------- PREPARING PRICES --------------------------------------------------
        const existsAmountPerHalf = offerData?.price_per_half > 0;
        const existsAmountPerMonth = offerData?.price_per_month > 0;
        const existsAmountPerQuarter = offerData?.price_per_quarter > 0;
        const existsAmountPerYear = offerData?.price_per_year > 0;

        const isNotTrial = existsAmountPerHalf || existsAmountPerMonth || existsAmountPerQuarter || existsAmountPerYear;
        const financingOptionsExists = offerData?.financing_options?.length > 0;

        const financingOptions = financingOptionsExists
          ? offerData?.financing_options
            .filter((l) => l?.monthly_price > 0)
            .sort((a, b) => a?.monthly_price - b?.monthly_price)
          : [];

        const getTrialLabel = () => {
          if (offerData?.trial_duration_unit === 'DAY') {
            return {
              priceText: `${t('subscription.upgrade-modal.duration_days', { duration: offerData?.trial_duration })} ${t('subscription.upgrade-modal.connector_duration_trial')}`,
              description: `${t('subscription.upgrade-modal.no_card_needed')} ${t('subscription.upgrade-modal.duration_days', { duration: offerData?.trial_duration })}`,
            };
          }
          if (offerData?.trial_duration_unit === 'MONTH') {
            return {
              priceText: `${offerData?.trial_duration} month trial`,
              description: `${t('subscription.upgrade-modal.no_card_needed')} ${t('subscription.upgrade-modal.duration_month', { duration: offerData?.trial_duration })}`,
            };
          }
          return {
            priceText: t('subscription.upgrade-modal.free_trial'),
            description: '',
          };
        };
        const trialPlan = isNumber(offerData?.trial_duration) ? {
          title: t('subscription.upgrade-modal.free_trial'),
          price: 0,
          priceText: getTrialLabel().priceText,
          trialDuration: offerData?.trial_duration,
          period: offerData?.trial_duration_unit,
          description: getTrialLabel().description,
          type: 'TRIAL',
          isFree: true,
          show: true,
        } : {};

        const monthPlan = existsAmountPerMonth ? {
          title: t('subscription.upgrade-modal.monthly_payment'),
          price: offerData?.price_per_month,
          priceText: `$${offerData?.price_per_month}`,
          period: 'MONTH',
          description: t('subscription.upgrade-modal.full_access'),
          type: 'PAYMENT',
          show: true,
        } : {};

        const yearPlan = existsAmountPerYear ? {
          title: t('subscription.upgrade-modal.yearly_payment'),
          price: offerData?.price_per_year,
          priceText: `$${offerData?.price_per_year}`,
          period: 'YEAR',
          description: t('subscription.upgrade-modal.full_access'),
          type: 'PAYMENT',
          show: true,
        } : {};

        const financingOption = financingOptionsExists ? financingOptions.map((item, index) => ({
          title: `${t('subscription.upgrade-modal.scholarship_level')} ${index + 1}`,
          price: item?.monthly_price,
          priceText: `$${item?.monthly_price} x ${item?.how_many_months}`,
          period: 'FINANCING',
          description: t('subscription.upgrade-modal.scholarship_description', { monthly_price: item?.monthly_price, many_months: item?.how_many_months }),
          how_many_months: item?.how_many_months,
          type: 'PAYMENT',
          show: true,
        })) : {};

        const consumableOption = outOfConsumables && offerData?.service_items?.length > 0
          ? offerData?.service_items.map((item) => ({
            title: toCapitalize(unSlugify(String(item?.service?.slug))),
            price: item?.service?.price_per_unit,
            how_many: item?.how_many,
            type: 'CONSUMABLE',
            show: true,
          }))
          : {};

        const paymentList = [monthPlan, yearPlan, trialPlan].filter((plan) => Object.keys(plan).length > 0);
        const financingList = [financingOption].filter((plan) => Object.keys(plan).length > 0);
        const consumableList = [consumableOption].filter((plan) => Object.keys(plan).length > 0);

        const finalData = {
          title: toCapitalize(unSlugify(String(offerData?.slug))),
          slug: offerData?.slug,
          details: offerData?.details,
          expires_at: offerData?.expires_at,
          show_modal: currentOffer?.show_modal,
          pricing_exists: isNotTrial || financingOptionsExists,
          paymentOptions: paymentList,
          financingOptions: financingList,
          outOfConsumables,
          consumableOptions: consumableList,
          bullets,
        };
        // -------------------------------------------------- END PREPARING PRICES --------------------------------------------------

        if (currentOffer?.show_modal) {
          onOpenUpgrade(finalData);
        }

        if (currentOffer?.show_modal === false && offerData) {
          router.push(`/signup?plan=${offerData?.slug}`);
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
