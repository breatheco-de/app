import { useSelector, useDispatch } from 'react-redux';
import {
  HANDLE_STEP, SET_CHECKING_DATA, SET_PAYMENT_INFO,
  SET_PLAN_DATA, SET_LOADER, SET_SELECTED_PLAN, TOGGLE_IF_ENROLLED,
  SET_SERVICE, SET_SELECTED_SERVICE, SET_PAYMENT_METHODS, SET_PAYMENT_STATUS,
  SET_SUBMITTING_CARD, SET_SUBMITTING_PAYMENT, SET_SELF_APPLIED_COUPON, SET_SIGNUP_INITIAL_STATE,
  SET_DECLINED_PAYMENT,
} from '../types';

const signupAction = () => {
  const state = useSelector((sl) => sl.signupReducer);
  const dispatch = useDispatch();

  const handleStep = (step) => dispatch({
    type: HANDLE_STEP,
    payload: step,
  });

  const setCheckingData = (payload) => dispatch({
    type: SET_CHECKING_DATA,
    payload,
  });

  const setPaymentInfo = (payload, value) => dispatch({
    type: SET_PAYMENT_INFO,
    payload,
    value,
  });
  const setService = (payload) => dispatch({
    type: SET_SERVICE,
    payload,
  });

  const setPlanData = (payload) => dispatch({
    type: SET_PLAN_DATA,
    payload,
  });
  const setSelectedPlan = (payload) => dispatch({
    type: SET_SELECTED_PLAN,
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

  const setDeclinedPayment = (payload) => dispatch({
    type: SET_DECLINED_PAYMENT,
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
    setCheckingData,
    setPaymentMethods,
    setPaymentStatus,
    setIsSubmittingCard,
    setIsSubmittingPayment,
    setPaymentInfo,
    setSelfAppliedCoupon,
    setPlanData,
    setSelectedPlan,
    setSelectedService,
    restartSignup,
    setService,
    setDeclinedPayment,
  };
};

export default signupAction;
