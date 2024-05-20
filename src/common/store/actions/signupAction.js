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
import { formatPrice, getDiscountedPrice, getNextDateInMonths, getQueryString, getStorageItem, getTimeProps } from '../../../utils';
import bc from '../../services/breathecode';
import modifyEnv from '../../../../modifyEnv';
import { usePersistent } from '../../hooks/usePersistent';
import { reportDatalayer } from '../../../utils/requests';
import { generatePlan, getTranslations } from '../../handlers/subscriptions';

// eslint-disable-next-line no-unused-vars
const useSignup = () => {
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
  const couponsQuery = getQueryString('coupons');
  const planTranslationsObj = getTranslations(t);
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

  const handlePayment = (data, disableRedirects = false) => new Promise((resolve, reject) => {
    const manyInstallmentsExists = selectedPlanCheckoutData?.how_many_months > 0 || selectedPlanCheckoutData?.period === 'FINANCING';
    const isTtrial = ['FREE', 'TRIAL'].includes(selectedPlanCheckoutData?.type);

    const getRequests = () => {
      if (!isTtrial) {
        return {
          type: data?.type || checkoutData.type,
          token: data?.token || checkoutData.token,
          how_many_installments: data?.installments || selectedPlanCheckoutData?.how_many_months || undefined,
          chosen_period: manyInstallmentsExists ? undefined : (selectedPlanCheckoutData?.period || 'HALF'),
          coupons: checkoutData?.discountCoupon?.slug ? [checkoutData.discountCoupon.slug] : undefined,
        };
      }
      return {
        type: data?.type || checkoutData.type,
        token: data?.token || checkoutData.token,
      };
    };
    const requests = getRequests();
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
              event: 'purchase',
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
      coupons: couponsQuery ? [couponsQuery] : undefined,
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
        const currentPlan = data?.plans?.[0];
        const planSlug = encodeURIComponent(currentPlan?.slug);
        const finalData = await generatePlan(planSlug, planTranslationsObj).then((respData) => respData);
        setPlanProps(finalData?.featured_info);

        if (response.status < 400) {
          setCheckoutData({
            ...data,
            ...finalData,
          });
          resolve({
            ...data,
            ...finalData,
          });
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
          slug: `${numItems}-${data?.serviceInfo?.type}`,
          title: `${numItems} ${data?.serviceInfo?.type === 'mentorship' ? 'mentorship sessions' : 'events'}`,
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
      })
      .catch((err) => {
        reject(err);
        if (err?.status === 400) {
          handleStep(1);
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
        const totalAmount = selectedPlanCheckoutData?.price * selectedPlanCheckoutData?.how_many_months;
        return t('info.will-pay-month', {
          price: selectedPlanCheckoutData?.price,
          qty_months: selectedPlanCheckoutData?.how_many_months,
          total_amount: Math.round(totalAmount * 100) / 100,
        });
      }
      if (
        selectedPlanCheckoutData?.financing_options?.length > 0
        && selectedPlanCheckoutData?.financing_options[0]?.monthly_price > 0
        && selectedPlanCheckoutData?.financing_options[0]?.how_many_months === 1
      ) {
        const totalAmount = selectedPlanCheckoutData?.financing_options[0]?.monthly_price * selectedPlanCheckoutData?.financing_options[0]?.how_many_months;
        return t('info.will-pay-month', {
          price: selectedPlanCheckoutData?.financing_options[0]?.monthly_price,
          qty_months: selectedPlanCheckoutData?.financing_options[0]?.how_many_months,
          total_amount: Math.round(totalAmount * 100) / 100,
        });
      }
      if (
        selectedPlanCheckoutData?.financing_options?.length > 0
        && selectedPlanCheckoutData?.financing_options[0]?.monthly_price > 0
        && selectedPlanCheckoutData?.financing_options[0]?.how_many_months > 0
      ) {
        const totalAmount = selectedPlanCheckoutData?.financing_options[0]?.monthly_price * selectedPlanCheckoutData?.financing_options[0]?.how_many_months;
        return t('info.will-pay-monthly', {
          price: selectedPlanCheckoutData?.financing_options[0]?.monthly_price,
          qty_months: selectedPlanCheckoutData?.financing_options[0]?.how_many_months,
          total_amount: Math.round(totalAmount * 100) / 100,
          next_month: nextMonthText,
        });
      }

      if (
        selectedPlanCheckoutData?.financing_options?.length > 0
        && selectedPlanCheckoutData?.financing_options[0]?.monthly_price > 0
        && selectedPlanCheckoutData?.financing_options[0]?.how_many_months === 0
      ) return t('info.will-pay-now', { price: selectedPlanCheckoutData?.financing_options[0]?.monthly_price });

      if (period === 'MONTH') {
        return t('info.will-pay-per-month', { price: selectedPlanCheckoutData?.price });
      }
      if (period === 'QUARTER') {
        return t('info.will-pay-per-quarter', { price: selectedPlanCheckoutData?.price });
      }
      if (period === 'HALF') {
        return t('info.will-pay-per-half-year', { price: selectedPlanCheckoutData?.price });
      }
      if (period === 'YEAR') {
        return t('info.will-pay-per-year', { price: selectedPlanCheckoutData?.price });
      }
      if (period === 'ONE_TIME') {
        return t('info.one-time-connector', { value: selectedPlanCheckoutData?.price });
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
