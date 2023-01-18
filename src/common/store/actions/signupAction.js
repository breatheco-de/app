import { useSelector, useDispatch } from 'react-redux';
import { useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import {
  NEXT_STEP, PREV_STEP, HANDLE_STEP, SET_DATE_PROPS, SET_CHECKOUT_DATA, SET_LOCATION, SET_PAYMENT_INFO,
  SET_PLAN_DATA, SET_LOADER, SET_PLAN_CHECKOUT_DATA, SET_PLAN_PROPS, SET_COHORT_PLANS,
} from '../types';
import { getNextDateInMonths, getTimeProps, toCapitalize, unSlugify } from '../../../utils';
import bc from '../../services/breathecode';

const useSignup = () => {
  const state = useSelector((sl) => sl.signupReducer);
  const { t } = useTranslation('signup');
  const toast = useToast();
  const router = useRouter();
  const { locale } = router;
  const dispatch = useDispatch();

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

  const handlePayment = (data) => new Promise((resolve, reject) => {
    const manyInstallmentsExists = selectedPlanCheckoutData?.financing_options.length > 0 && selectedPlanCheckoutData?.financing_options[0]?.how_many_months;
    bc.payment().pay({
      type: data?.type || checkoutData.type,
      token: data?.token || checkoutData.token,
      how_many_installments: data?.installments || selectedPlanCheckoutData?.financing_options[0]?.how_many_months || undefined,
      chosen_period: manyInstallmentsExists ? undefined : (selectedPlanCheckoutData?.period || 'HALF'),
    })
      .then((response) => {
        if (response?.data?.status === 'FULFILLED') {
          router.push('/choose-program');
        }
        resolve(response);
      })
      .catch(() => {
        toast({
          title: t('alert-message:payment-error'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        reject();
      });
  });

  const getUnitPrice = ({ plan, data }) => {
    const financingOptionsExists = plan?.financing_options.length > 0 && plan?.financing_options[0]?.monthly_price > 0;
    if (financingOptionsExists) {
      return 'FINANCING';
    }
    if (!financingOptionsExists) {
      if (data?.amount_per_year > 0) {
        return {
          amount: data.amount_per_year,
          period: 'YEAR',
        };
      }
      if (data?.amount_per_quarter > 0) {
        return {
          amount: data.amount_per_quarter,
          period: 'QUARTER',
        };
      }
      if (data?.amount_per_month > 0) {
        return {
          amount: data.amount_per_month,
          period: 'MONTH',
        };
      }
      if (data?.amount_per_half > 0) {
        return {
          amount: data.amount_per_half,
          period: 'HALF',
        };
      }
    }
    return {
      amount: data?.amount_per_month,
      period: 'MONTH',
    };
  };
  const getPaymentProps = ({ plan, data }) => {
    const { amount, period } = getUnitPrice({ plan, data });
    const price = amount;

    return {
      price,
      period,
    };
  };

  const getChecking = (cohortData) => new Promise((resolve, reject) => {
    const selectedPlan = cohortData?.plan ? cohortData?.plan : undefined;
    const cohortPlan = cohortPlans?.length > 0 ? cohortPlans[cohortData?.index || 0] : selectedPlan;

    bc.payment().checking({
      type: 'PREVIEW',
      cohort: cohortData?.id || dateProps?.id,
      academy: cohortData?.academy?.id || dateProps?.academy?.id || Number(academy),
      syllabus,
      plans: [selectedPlan?.slug || (cohortPlans?.length > 0 ? cohortPlan?.slug : undefined)],
    })
      .then((response) => {
        const { data } = response;
        const existsAmountPerHalf = cohortPlan?.price_per_half > 0 || data?.amount_per_half > 0;
        const existsAmountPerMonth = cohortPlan?.price_per_half > 0 || data?.amount_per_month > 0;
        const existsAmountPerQuarter = cohortPlan?.price_per_quarter > 0 || data?.amount_per_quarter > 0;
        const existsAmountPerYear = cohortPlan?.price_per_year > 0 || data?.amount_per_year > 0;

        const isNotTrial = existsAmountPerHalf || existsAmountPerMonth || existsAmountPerQuarter || existsAmountPerYear;
        const financingOptionsExists = cohortPlan?.financing_options.length > 0 && cohortPlan?.financing_options[0]?.monthly_price > 0;

        const plans = data?.plans?.length > 0 ? data?.plans.map((plan) => {
          const { price, period } = getPaymentProps({ plan, data });
          const title = plan?.title ? plan?.title : toCapitalize(unSlugify(String(plan?.slug)));
          return {
            ...plan,
            price,
            period,
            title,
          };
        }) : [data];
        const finalData = {
          ...data,
          isTrial: !isNotTrial && !financingOptionsExists,
          plans,
        };
        if (response.status < 400) {
          setCheckoutData(finalData);
          resolve(finalData);
        }
      })
      .catch((err) => {
        console.log(err);
        reject();
      })
      .finally(() => {
        setLoader('date', false);
      });
  });

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
        console.log(err);
        toast({
          title: t('alert-message:something-went-wrong-choosing-date'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
  });

  const getPaymentText = () => {
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
    if (checkoutData?.amount_per_half > 0
      || checkoutData?.amount_per_month > 0) return t('info.will-pay-per-month', { price: checkoutData?.amount_per_month || checkoutData?.amount_per_half });

    if (checkoutData?.amount_per_quarter > 0
      || checkoutData?.amount_per_year > 0) return t('info.will-pay-per-year', { price: checkoutData?.amount_per_year || checkoutData?.amount_per_quarter });

    return '';
  };

  return {
    state,
    isFirstStep,
    isSecondStep,
    isThirdStep,
    isFourthStep,
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
  };
};

export default useSignup;
