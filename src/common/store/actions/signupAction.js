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
    const manyInstallmentsExists = selectedPlanCheckoutData?.financing_options?.length > 0 && selectedPlanCheckoutData?.period === 'FINANCING';
    const isTtrial = selectedPlanCheckoutData?.type === 'TRIAL';

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
    bc.payment().pay({
      ...requests,
    })
      .then((response) => {
        if (response?.data?.status === 'FULFILLED') {
          router.push('/choose-program');
        }
        if (response === undefined || response.status >= 400) {
          toast({
            title: t('alert-message:payment-error'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
        }
        resolve(response);
      })
      .catch(() => {
        reject();
      });
  });

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
        const existsAmountPerHalf = data?.amount_per_half > 0;
        const existsAmountPerMonth = data?.amount_per_month > 0;
        const existsAmountPerQuarter = data?.amount_per_quarter > 0;
        const existsAmountPerYear = data?.amount_per_year > 0;
        const currentPlan = data?.plans?.[0];

        const isNotTrial = existsAmountPerHalf || existsAmountPerMonth || existsAmountPerQuarter || existsAmountPerYear;
        const financingOptionsExists = currentPlan?.financing_options?.length > 0;
        const singlePlan = data?.plans?.length > 0 ? data?.plans[0] : data;

        const financingOptions = financingOptionsExists
          ? currentPlan?.financing_options
            .filter((l) => l?.monthly_price > 0)
            .sort((a, b) => a?.monthly_price - b?.monthly_price)
          : [];

        const trialPlan = (!isNotTrial && !financingOptionsExists) ? {
          ...singlePlan,
          title: singlePlan?.title ? singlePlan?.title : toCapitalize(unSlugify(String(singlePlan?.slug))),
          price: data?.amount_per_month,
          priceText: t('free-trial'),
          period: singlePlan?.trial_duration_unit,
          type: 'TRIAL',
        } : {};

        const monthPlan = existsAmountPerMonth ? {
          ...singlePlan,
          title: singlePlan?.title ? singlePlan?.title : toCapitalize(unSlugify(String(singlePlan?.slug))),
          price: data?.amount_per_month,
          priceText: `$${data?.amount_per_month}`,
          period: 'MONTH',
          type: 'PAYMENT',
        } : {};

        const yearPlan = existsAmountPerYear ? {
          ...singlePlan,
          title: singlePlan?.title ? singlePlan?.title : toCapitalize(unSlugify(String(singlePlan?.slug))),
          price: data?.amount_per_year,
          priceText: `$${data?.amount_per_year}`,
          period: 'YEAR',
          type: 'PAYMENT',
        } : {};

        const financingOption = financingOptionsExists ? financingOptions.map((item, index) => ({
          ...singlePlan,
          financingId: index + 1,
          title: singlePlan?.title ? singlePlan?.title : toCapitalize(unSlugify(String(singlePlan?.slug))),
          price: item?.monthly_price,
          priceText: `$${item?.monthly_price} x ${item?.how_many_months}`,
          period: 'FINANCING',
          how_many_months: item?.how_many_months,
          type: 'PAYMENT',
        })) : {};

        const planList = [trialPlan, monthPlan, yearPlan, ...financingOption].filter((plan) => Object.keys(plan).length > 0);
        const finalData = {
          ...data,
          isTrial: !isNotTrial && !financingOptionsExists,
          plans: planList,
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
