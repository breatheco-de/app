import { useSelector, useDispatch } from 'react-redux';
import { useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import {
  NEXT_STEP, PREV_STEP, HANDLE_STEP, SET_DATE_PROPS, SET_CHECKOUT_DATA, SET_LOCATION, SET_PAYMENT_INFO,
  SET_PLAN_DATA, SET_LOADER, SET_PLAN_CHECKOUT_DATA, SET_PLAN_PROPS, SET_COHORT_PLANS,
} from '../types';
import { getTimeProps, toCapitalize, unSlugify } from '../../../utils';
import bc from '../../services/breathecode';

const useSignup = () => {
  const state = useSelector((sl) => sl.signupReducer);
  const { t } = useTranslation(['alert-message']);
  const toast = useToast();
  const router = useRouter();
  const dispatch = useDispatch();

  // eslint-disable-next-line no-unused-vars
  const { syllabus, academy, plan: queryPlan } = router.query;

  const {
    stepIndex,
    checkoutData,
    selectedPlanCheckoutData,
    dateProps,
    cohortPlans,
  } = state;
  // const isSecondStep = stepIndex === 1; // Choose your class
  // const isThirdStep = stepIndex === 2; // Payment info
  // const isFourthStep = stepIndex === 3; // Summary
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
    bc.payment().pay({
      type: data?.type || checkoutData.type,
      token: data?.token || checkoutData.token,
      // chosen_period: selectedPlanCheckoutData.chosen_period,
      chosen_period: 'HALF',
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

  const getUnitDescription = ({ plan, isNotTrial }) => {
    const everyNumber = plan.pay_every;

    if (isNotTrial) {
      if (plan.pay_every_unit === 'YEAR') {
        return t('common:payment.pay-per-year', { value: everyNumber === 1 ? t('common:each', { value: everyNumber }) : everyNumber });
      }
      if (plan.pay_every_unit === 'QUARTER') {
        return t('common:payment.pay-per-quarter', { value: everyNumber === 1 ? t('common:each', { value: everyNumber }) : everyNumber });
        // return `Pay ${everyNumber === 1 ? 'each' : everyNumber} quarter`;
      }
      if (plan.pay_every_unit === 'MONTH') {
        return t('common:payment.pay-per-month', { value: everyNumber === 1 ? t('common:each', { value: everyNumber }) : everyNumber });
        // return `Pay ${everyNumber === 1 ? 'each' : everyNumber} month`;
      }
      if (plan.pay_every_unit === 'HALF') {
        return t('common:payment.pay-per-half', { value: everyNumber === 1 ? t('common:each', { value: everyNumber }) : everyNumber });
        // return `Pay ${everyNumber === 1 ? 'each' : everyNumber} half`;
      }
    }
    return '';
  };
  const getUnitPrice = ({ plan, isNotTrial, data }) => {
    if (isNotTrial) {
      if (plan.pay_every_unit === 'YEAR') {
        return {
          payEvery: plan.pay_every,
          amount: data.amount_per_year,
          period: 'YEAR',
        };
      }
      if (plan.pay_every_unit === 'QUARTER') {
        return {
          payEvery: plan.pay_every,
          amount: data.amount_per_quarter,
          period: 'QUARTER',
        };
      }
      if (plan.pay_every_unit === 'MONTH') {
        return {
          payEvery: plan.pay_every,
          amount: data.amount_per_month,
          period: 'MONTH',
        };
      }
      if (plan.pay_every_unit === 'HALF') {
        return {
          payEvery: plan.pay_every,
          amount: data.amount_per_half,
          period: 'HALF',
        };
      }
    }
    return {
      amount: 0,
      payEvery: plan.pay_every,
      period: plan.pay_every_unit,
    };
  };
  const getPaymentProps = ({ plan, isNotTrial, data }) => {
    const { amount, period, payEvery } = getUnitPrice({ plan, isNotTrial, data });
    const description = getUnitDescription({ plan, isNotTrial });
    const price = amount;

    return {
      payEvery,
      price,
      period,
      description,
    };
  };

  const getChecking = (cohortData) => new Promise((resolve, reject) => {
    const selectedPlan = selectedPlanCheckoutData?.slug ? selectedPlanCheckoutData.slug : undefined;
    const cohortPlan = cohortPlans[cohortData?.index || 0];

    bc.payment().checking({
      type: 'PREVIEW',
      cohort: cohortData?.id || dateProps?.id,
      academy: cohortData?.academy.id || dateProps?.academy?.id || Number(academy),
      syllabus,
      plans: selectedPlan || cohortPlans?.length > 0 ? cohortPlan?.slug : null,
      // plans: selectedPlan || Number.isNaN(queryPlan) ? queryPlan : Number(queryPlan),

      // plans: selectedPlan || queryPlans.map((plan) => (Number.isNaN(plan) ? plan : Number(plan))),
    })
      .then((response) => {
        // const { data } = response;
        const { token } = response?.data;
        const data = response?.data.plans.length > 0
          ? response?.data
          : { ...cohortPlan, token };

        const existsAmountPerHalf = data?.amount_per_half > 0 || data?.price_per_half > 0;
        const existsAmountPerMonth = data?.amount_per_month > 0 || data?.price_per_month > 0;
        const existsAmountPerQuarter = data?.amount_per_quarter > 0 || data?.price_per_quarter > 0;
        const existsAmountPerYear = data?.amount_per_year > 0 || data?.price_per_year > 0;

        const isNotTrial = existsAmountPerHalf || existsAmountPerMonth || existsAmountPerQuarter || existsAmountPerYear;

        const plans = data?.plans?.length > 0 ? data?.plans.map((plan) => {
          const { price, period, description } = getPaymentProps({ plan, isNotTrial, data });
          const title = plan?.title ? plan?.title : toCapitalize(unSlugify(String(plan?.slug)));
          return {
            ...plan,
            price,
            period,
            title,
            description,
          };
        }) : [data];
        const finalData = {
          ...data,
          isTrial: !isNotTrial,
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
      .catch(() => {
        reject();
        toast({
          title: t('alert-message:something-went-wrong-choosing-date'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
  });

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
  };
};

export default useSignup;
