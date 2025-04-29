import { useSelector, useDispatch } from 'react-redux';
import {
  HANDLE_STEP, SET_CHECKOUT_DATA, SET_PAYMENT_INFO,
  SET_PLAN_DATA, SET_LOADER, SET_PLAN_CHECKOUT_DATA, SET_PLAN_PROPS, SET_COHORT_PLANS, TOGGLE_IF_ENROLLED,
  SET_SERVICE_PROPS, SET_SELECTED_SERVICE, SET_PAYMENT_METHODS, SET_PAYMENT_STATUS,
  SET_SUBMITTING_CARD, SET_SUBMITTING_PAYMENT, SET_SELF_APPLIED_COUPON, SET_SIGNUP_INITIAL_STATE,
} from '../types';

const signupAction = () => {
  const state = useSelector((sl) => sl.signupReducer);
  const dispatch = useDispatch();

  const handleStep = (step) => dispatch({
    type: HANDLE_STEP,
    payload: step,
  });

  const setCheckoutData = (payload) => dispatch({
    type: SET_CHECKOUT_DATA,
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
  const setPaymentMethods = (payload) => dispatch({
    type: SET_PAYMENT_METHODS,
    payload,
  });
  const setPaymentStatus = (payload) => dispatch({
    type: SET_PAYMENT_STATUS,
    payload,
  });
  const setIsSubmittingCard = (payload) => dispatch({
    type: SET_SUBMITTING_CARD,
    payload,
  });
  const setIsSubmittingPayment = (payload) => dispatch({
    type: SET_SUBMITTING_PAYMENT,
    payload,
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
  const setSelfAppliedCoupon = (payload) => dispatch({
    type: SET_SELF_APPLIED_COUPON,
    payload,
  });

  const restartSignup = () => dispatch({
    type: SET_SIGNUP_INITIAL_STATE,
  });

  return {
    state,
    toggleIfEnrolled,
    setLoader,
    handleStep,
    setCheckoutData,
    setPaymentMethods,
    setPaymentStatus,
    setIsSubmittingCard,
    setIsSubmittingPayment,
    setPaymentInfo,
    setSelfAppliedCoupon,
    setPlanData,
    setSelectedPlanCheckoutData,
    setPlanProps,
    setCohortPlans,
    setSelectedService,
    restartSignup,
    setServiceProps,
  };
};

export default signupAction;
