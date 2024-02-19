/* eslint-disable camelcase */
/* eslint-disable no-unsafe-optional-chaining */
import { useSelector, useDispatch } from 'react-redux';
import { useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import {
  NEXT_STEP, PREV_STEP, HANDLE_STEP, SET_DATE_PROPS, SET_CHECKOUT_DATA, SET_LOCATION, SET_PAYMENT_INFO,
  SET_PLAN_DATA, SET_LOADER, SET_PLAN_CHECKOUT_DATA, SET_PLAN_PROPS, SET_COHORT_PLANS, TOGGLE_IF_ENROLLED, PREPARING_FOR_COHORT, SET_SERVICE_PROPS, SET_SELECTED_SERVICE,
} from '../types';
import { formatPrice, getDiscountedPrice, getNextDateInMonths, getStorageItem, getTimeProps, toCapitalize, unSlugify } from '../../../utils';
import bc from '../../services/breathecode';
import modifyEnv from '../../../../modifyEnv';
import { usePersistent } from '../../hooks/usePersistent';
import { reportDatalayer } from '../../../utils/requests';

// eslint-disable-next-line no-unused-vars
const useSignup = ({ disableRedirectAfterSuccess = false } = {}) => {
  const state = useSelector((sl) => sl.signupReducer);
  const [, setSubscriptionProcess] = usePersistent('subscription-process', null);
  const { t } = useTranslation('signup');
  const toast = useToast();
  const router = useRouter();
  const { locale } = router;
  const dispatch = useDispatch();
  const accessToken = getStorageItem('accessToken');
  const redirect = getStorageItem('redirect');
  const redirectedFrom = getStorageItem('redirected-from');
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

  const { syllabus, academy } = router.query;
  const nextMonthText = getNextDateInMonths(1).translation[locale];

  const {
    stepIndex,
    checkoutData,
    dateProps,
    cohortPlans,
    selectedPlanCheckoutData,
  } = state;

  const isFirstStep = stepIndex === 0; // Contact
  const isSecondStep = stepIndex === 1; // Choose your class
  const isThirdStep = stepIndex === 2; // Summary
  const isFourthStep = stepIndex === 3; // Payment

  const nextStep = () => dispatch({
    type: NEXT_STEP,
  });
  const prevStep = () => dispatch({
    type: PREV_STEP,
  });
  const handleStep = (step) => dispatch({
    type: HANDLE_STEP,
    payload: step,
  });

  const setDateProps = (payload) => dispatch({
    type: SET_DATE_PROPS,
    payload,
  });
  const setCheckoutData = (payload) => dispatch({
    type: SET_CHECKOUT_DATA,
    payload,
  });

  const setLocation = (payload) => dispatch({
    type: SET_LOCATION,
    payload,
  });

  const setPaymentInfo = (payload, value) => dispatch({
    type: SET_PAYMENT_INFO,
    payload,
    value,
  });
  const setServiceProps = (payload) => dispatch({
    type: SET_SERVICE_PROPS,
    payload,
  });

  const setPlanData = (payload) => dispatch({
    type: SET_PLAN_DATA,
    payload,
  });
  const setSelectedPlanCheckoutData = (payload) => dispatch({
    type: SET_PLAN_CHECKOUT_DATA,
    payload,
  });

  const setLoader = (payload, value) => dispatch({
    type: SET_LOADER,
    payload,
    value,
  });
  const setCohortPlans = (payload) => dispatch({
    type: SET_COHORT_PLANS,
    payload,
  });

  const setPlanProps = (payload) => dispatch({
    type: SET_PLAN_PROPS,
    payload,
  });
  const toggleIfEnrolled = (payload) => dispatch({
    type: TOGGLE_IF_ENROLLED,
    payload,
  });
  const setSelectedService = (payload) => dispatch({
    type: SET_SELECTED_SERVICE,
    payload,
  });

  const freeTrialPeriod = (qty, period) => {
    const periodValue = period?.toLowerCase();
    const singularTranslation = {
      day: t('common:word-connector.day'),
      week: t('common:word-connector.week'),
      month: t('common:word-connector.month'),
      year: t('common:word-connector.year'),
    };
    const pluralTranslation = {
      day: t('common:word-connector.days'),
      week: t('common:word-connector.weeks'),
      month: t('common:word-connector.months'),
      year: t('common:word-connector.years'),
    };
    const periodText = qty > 1 ? pluralTranslation[periodValue] : singularTranslation[periodValue];
    return t('signup:info.free-trial-period', { qty, period: periodText });
  };

  const handlePayment = (data, disableRedirects = false) => new Promise((resolve, reject) => {
    const manyInstallmentsExists = selectedPlanCheckoutData?.financing_options?.length > 0 && selectedPlanCheckoutData?.period === 'FINANCING';
    const isTtrial = ['FREE', 'TRIAL'].includes(selectedPlanCheckoutData?.type);

    const getRequests = () => {
      if (!isTtrial) {
        return {
          type: data?.type || checkoutData.type,
          token: data?.token || checkoutData.token,
          how_many_installments: data?.installments || selectedPlanCheckoutData?.how_many_months || undefined,
          chosen_period: manyInstallmentsExists ? undefined : (selectedPlanCheckoutData?.period || 'HALF'),
        };
      }
      return {
        type: data?.type || checkoutData.type,
        token: data?.token || checkoutData.token,
      };
    };
    const requests = getRequests();
    console.log('on handle payment');
    bc.payment().pay({
      ...requests,
    })
      .then(async (response) => {
        const transactionData = await response.json();
        if (transactionData?.status === 'FULFILLED') {
          setSubscriptionProcess({
            status: PREPARING_FOR_COHORT,
            id: dateProps?.id,
            slug: dateProps?.slug,
            plan_slug: dateProps?.plan?.slug,
            academy_info: dateProps?.academy,
          });
          let currency = 'USD';
          let simplePlans = [];
          if (cohortPlans) {
            currency = cohortPlans[0]?.plan?.currency?.code || 'USD';
            simplePlans = cohortPlans.map((cohortPlan) => {
              const { plan } = cohortPlan;
              const { service_items, ...restOfPlan } = plan;
              return { plan: { ...restOfPlan } };
            });
          }
          reportDatalayer({
            dataLayer: {
              event: selectedPlanCheckoutData?.price > 0 ? 'purchase' : 'sign_up',
              value: selectedPlanCheckoutData?.price,
              currency,
              payment_type: 'Credit card',
              plan: selectedPlanCheckoutData?.slug,
              period_label: selectedPlanCheckoutData?.period_label,
              items: simplePlans,
            },
          });

          if (!disableRedirects) {
            if ((redirect && redirect?.length > 0) || (redirectedFrom && redirectedFrom.length > 0)) {
              router.push(redirect || redirectedFrom);
              localStorage.removeItem('redirect');
              localStorage.removeItem('redirected-from');
            } else {
              router.push('/choose-program');
            }
          }
          if (transactionData === undefined || transactionData.status >= 400) {
            toast({
              position: 'top',
              title: t('alert-message:payment-error'),
              status: 'error',
              duration: 7000,
              isClosable: true,
            });
          }
          resolve(transactionData);
        } else {
          resolve(transactionData);
        }
      })
      .catch((error) => {
        console.error('Error handling payment bc.payment().pay', error);
        reject(error);
      });
  });

  const getChecking = (cohortData) => new Promise((resolve, reject) => {
    const selectedPlan = cohortData?.plan ? cohortData?.plan : undefined;
    const cohortPlan = cohortPlans?.length > 0 ? cohortPlans[cohortData?.index || 0] : selectedPlan;

    const checkingBody = {
      type: 'PREVIEW',
      cohort: cohortData?.id || dateProps?.id,
      academy: cohortData?.academy?.id || dateProps?.academy?.id || (Number(academy) || undefined),
      syllabus,
      plans: [selectedPlan?.slug || (cohortPlans?.length > 0 ? cohortPlan?.slug : undefined)],
    };

    fetch(`${BREATHECODE_HOST}/v1/payments/checking`, {
      method: 'PUT',
      headers: new Headers({
        'content-type': 'application/json',
        Authorization: `Token ${cohortData?.token || accessToken}`,
      }),
      body: JSON.stringify(checkingBody),
    })
      .then(async (response) => {
        const data = await response.json();

        const existsAmountPerHalf = data?.amount_per_half > 0;
        const existsAmountPerMonth = data?.amount_per_month > 0;
        const existsAmountPerQuarter = data?.amount_per_quarter > 0;
        const existsAmountPerYear = data?.amount_per_year > 0;
        const currentPlan = data?.plans?.[0];

        const isNotTrial = existsAmountPerHalf || existsAmountPerMonth || existsAmountPerQuarter || existsAmountPerYear;
        const financingOptionsExists = currentPlan?.financing_options?.length > 0;
        const singlePlan = data?.plans?.length > 0 ? data?.plans[0] : data;
        const isTotallyFree = !isNotTrial && singlePlan?.trial_duration === 0;

        const financingOptions = financingOptionsExists
          ? currentPlan?.financing_options
            .filter((l) => l?.monthly_price > 0)
            .sort((a, b) => a?.monthly_price - b?.monthly_price)
          : [];

        const trialPlan = (!financingOptionsExists && !isNotTrial) ? {
          ...singlePlan,
          title: singlePlan?.title ? singlePlan?.title : toCapitalize(unSlugify(String(singlePlan?.slug))),
          price: 0,
          priceText: isTotallyFree ? t('free') : t('free_trial'),
          plan_id: `p-${singlePlan?.trial_duration}-trial`,
          period: isTotallyFree ? 'FREE' : singlePlan?.trial_duration_unit,
          period_label: isTotallyFree
            ? t('totally_free')
            : freeTrialPeriod(singlePlan?.trial_duration, singlePlan?.trial_duration_unit),
          type: isTotallyFree ? 'FREE' : 'TRIAL',
        } : {};

        const monthPlan = existsAmountPerMonth ? {
          ...singlePlan,
          title: singlePlan?.title ? singlePlan?.title : t('monthly_payment'),
          price: data?.amount_per_month,
          priceText: `$${data?.amount_per_month}`,
          plan_id: `p-${data?.amount_per_month}`,
          period: 'MONTH',
          period_label: t('monthly'),
          type: 'PAYMENT',
        } : {};
        const quarterPlan = existsAmountPerQuarter ? {
          ...singlePlan,
          title: singlePlan?.title ? singlePlan?.title : t('quarterly_payment'),
          price: data?.amount_per_quarter,
          priceText: `$${data?.amount_per_quarter}`,
          plan_id: `p-${data?.amount_per_quarter}`,
          period: 'QUARTER',
          period_label: t('quarterly'),
          type: 'PAYMENT',
        } : {};
        const halfPlan = existsAmountPerHalf ? {
          ...singlePlan,
          title: singlePlan?.title ? singlePlan?.title : t('half_yearly_payment'),
          price: data?.amount_per_half,
          priceText: `$${data?.amount_per_half}`,
          plan_id: `p-${data?.amount_per_half}`,
          period: 'HALF',
          period_label: t('half_yearly'),
          type: 'PAYMENT',
        } : {};

        const yearPlan = existsAmountPerYear ? {
          ...singlePlan,
          title: singlePlan?.title ? singlePlan?.title : t('yearly_payment'),
          price: data?.amount_per_year,
          priceText: `$${data?.amount_per_year}`,
          plan_id: `p-${data?.amount_per_year}`,
          period: 'YEAR',
          period_label: t('yearly'),
          type: 'PAYMENT',
        } : {};

        const financingOption = financingOptionsExists ? financingOptions.map((item, index) => {
          const financingTitle = item?.how_many_months === 1 ? t('one_payment') : t('many_months_payment', { qty: item?.how_many_months });

          return ({
            ...singlePlan,
            financingId: index + 1,
            title: singlePlan?.title ? singlePlan?.title : financingTitle,
            price: item?.monthly_price,
            priceText: `$${item?.monthly_price} x ${item?.how_many_months}`,
            plan_id: `f-${item?.monthly_price}-${item?.how_many_months}`,
            period: 'FINANCING',
            period_label: t('financing'),
            how_many_months: item?.how_many_months,
            type: 'PAYMENT',
          });
        }) : [{}];

        const planList = [trialPlan, monthPlan, quarterPlan, halfPlan, yearPlan, ...financingOption].filter((plan) => Object.keys(plan).length > 0);
        const finalData = {
          ...data,
          isTrial: !isNotTrial && !financingOptionsExists,
          plans: planList,
        };

        if (response.status < 400) {
          setCheckoutData(finalData);
          resolve(finalData);
        }
        if (response.status >= 400) {
          reject(response);
        }
      })
      .catch((error) => {
        reject(error);
      })
      .finally(() => {
        setLoader('date', false);
      });
  });

  const handleServiceToConsume = (data) => {
    const discountRatio = data?.discount_ratio;
    const bundleSize = data?.bundle_size;
    const pricePerUnit = data?.price_per_unit;
    const maxItems = data?.max_items;
    const maxNumItems = Math.floor(maxItems / bundleSize);
    const allItems = [];

    for (let num = 1; num <= maxNumItems; num += 1) {
      const numItems = num * bundleSize;

      if (numItems % bundleSize === 0) {
        const price = getDiscountedPrice({
          numItems, maxItems, discountRatio, bundleSize, pricePerUnit, startDiscountFrom: 1,
        });

        allItems.push({
          id: num,
          title: `${numItems} Mentorship sessions`,
          qty: numItems,
          pricePerUnit: price.discounted / numItems,
          price: price.original,
          priceText: formatPrice(price.discounted, true),
          priceDiscounted: price.discounted,
          type: 'CONSUMABLE',
        });
      }
    }

    setServiceProps({
      ...data,
      list: allItems,
    });
  };

  const handleChecking = (cohortData) => new Promise((resolve, reject) => {
    if (cohortData?.id) {
      const { kickoffDate, weekDays, availableTime } = getTimeProps(cohortData);
      setDateProps({
        ...cohortData,
        kickoffDate,
        weekDays,
        availableTime,
      });
    }
    getChecking(cohortData)
      .then((data) => {
        resolve(data);
        // handleStep(1);
      })
      .catch((err) => {
        reject(err);
        if (err?.status === 400) {
          toggleIfEnrolled(true);
        } else {
          toast({
            position: 'top',
            title: t('alert-message:something-went-wrong-choosing-date'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
        }
      });
  });

  const getPaymentText = () => {
    const planIsNotTrial = selectedPlanCheckoutData?.type !== 'TRIAL';
    const period = selectedPlanCheckoutData?.period;
    if (planIsNotTrial) {
      if (period === 'FINANCING') {
        return t('info.will-pay-month', {
          price: selectedPlanCheckoutData?.price,
          qty_months: selectedPlanCheckoutData?.how_many_months,
          total_amount: selectedPlanCheckoutData?.price * selectedPlanCheckoutData?.how_many_months,
        });
      }
      if (
        selectedPlanCheckoutData?.financing_options?.length > 0
        && selectedPlanCheckoutData?.financing_options[0]?.monthly_price > 0
        && selectedPlanCheckoutData?.financing_options[0]?.how_many_months === 1
      ) {
        return t('info.will-pay-month', {
          price: selectedPlanCheckoutData?.financing_options[0]?.monthly_price,
          qty_months: selectedPlanCheckoutData?.financing_options[0]?.how_many_months,
          total_amount: selectedPlanCheckoutData?.financing_options[0]?.monthly_price * selectedPlanCheckoutData?.financing_options[0]?.how_many_months,
        });
      }
      if (
        selectedPlanCheckoutData?.financing_options?.length > 0
        && selectedPlanCheckoutData?.financing_options[0]?.monthly_price > 0
        && selectedPlanCheckoutData?.financing_options[0]?.how_many_months > 0
      ) {
        return t('info.will-pay-monthly', {
          price: selectedPlanCheckoutData?.financing_options[0]?.monthly_price,
          qty_months: selectedPlanCheckoutData?.financing_options[0]?.how_many_months,
          total_amount: selectedPlanCheckoutData?.financing_options[0]?.monthly_price * selectedPlanCheckoutData?.financing_options[0]?.how_many_months,
          next_month: nextMonthText,
        });
      }

      if (
        selectedPlanCheckoutData?.financing_options?.length > 0
        && selectedPlanCheckoutData?.financing_options[0]?.monthly_price > 0
        && selectedPlanCheckoutData?.financing_options[0]?.how_many_months === 0
      ) return t('info.will-pay-now', { price: selectedPlanCheckoutData?.financing_options[0]?.monthly_price });

      if (selectedPlanCheckoutData?.period === 'MONTH') {
        return t('info.will-pay-per-month', { price: selectedPlanCheckoutData?.price });
      }
      if (selectedPlanCheckoutData?.period === 'QUARTER') {
        return t('info.will-pay-per-quarter', { price: selectedPlanCheckoutData?.price });
      }
      if (selectedPlanCheckoutData?.period === 'HALF') {
        return t('info.will-pay-per-half-year', { price: selectedPlanCheckoutData?.price });
      }
      if (selectedPlanCheckoutData?.period === 'YEAR') {
        return t('info.will-pay-per-year', { price: selectedPlanCheckoutData?.price });
      }
    }

    return '';
  };

  return {
    state,
    isFirstStep,
    isSecondStep,
    isThirdStep,
    isFourthStep,
    toggleIfEnrolled,
    nextStep,
    prevStep,
    setLoader,
    handleStep,
    setDateProps,
    setCheckoutData,
    setLocation,
    setPaymentInfo,
    handlePayment,
    setPlanData,
    setSelectedPlanCheckoutData,
    handleChecking,
    setPlanProps,
    setCohortPlans,
    getPaymentText,
    handleServiceToConsume,
    setSelectedService,
  };
};

export default useSignup;
