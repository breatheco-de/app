import { useSelector, useDispatch } from 'react-redux';
import { useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import {
  NEXT_STEP, PREV_STEP, HANDLE_STEP, SET_DATE_PROPS, SET_CHECKOUT_DATA, SET_LOCATION, SET_PAYMENT_INFO,
  SET_PLAN_DATA,
  SET_LOADER,
} from '../types';
import { getTimeProps } from '../../../utils';
import bc from '../../services/breathecode';

const useSignup = () => {
  const state = useSelector((sl) => sl.signupReducer);
  const { t } = useTranslation(['alert-message']);
  const toast = useToast();
  const router = useRouter();
  const dispatch = useDispatch();

  const { stepIndex, checkoutData } = state;
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

  const setLoader = (payload, value) => dispatch({
    type: SET_LOADER,
    payload,
    value,
  });

  const handlePayment = () => new Promise((resolve, reject) => {
    bc.payment().pay2({
      type: checkoutData.type,
      token: checkoutData.token,
      chosen_period: 'HALF',
    })
      .then((response) => {
        console.log('Payment_response:', response);
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

  const handleChooseDate = (cohortData) => new Promise((resolve, reject) => {
    setLoader('date', true);
    const { kickoffDate, weekDays, availableTime } = getTimeProps(cohortData);
    setDateProps({
      ...cohortData,
      kickoffDate,
      weekDays,
      availableTime,
    });

    bc.payment().checking({
      type: 'PREVIEW',
      cohort: cohortData.id,
      academy: cohortData?.academy.id,
    })
      .then((response) => {
        if (response.status < 400) {
          setCheckoutData(response.data);
          handleStep(2);
        }
        resolve();
      })
      .catch(() => {
        toast({
          title: t('alert-message:something-went-wrong-choosing-date'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        reject();
      })
      .finally(() => {
        setLoader('date', false);
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
    handleChooseDate,
  };
};

export default useSignup;
