import {
  HANDLE_STEP, SET_CHECKOUT_DATA,
  SET_PAYMENT_INFO, SET_PLAN_DATA, SET_LOADER, SET_PLAN_CHECKOUT_DATA,
  TOGGLE_IF_ENROLLED, SET_SERVICE, SET_SELECTED_SERVICE, SET_PAYMENT_METHODS, SET_PAYMENT_STATUS,
  SET_SUBMITTING_CARD, SET_SUBMITTING_PAYMENT, SET_SELF_APPLIED_COUPON, SET_SIGNUP_INITIAL_STATE, SET_DECLINED_PAYMENT,
} from '../types';

const initialState = {
  stepIndex: 1,
  checkoutData: null,
  paymentInfo: {
    card_number: '',
    exp: '',
    cvc: '',
  },
  planData: null,
  selectedPlanCheckoutData: null,
  loader: {
    plan: true,
  },
  alreadyEnrolled: false,
  paymentMethods: [],
  paymentStatus: 'idle',
  isSubmittingCard: false,
  isSubmittingPayment: false,
  selfAppliedCoupon: null,
  service: null,
  declinedPayment: {
    title: '',
    description: '',
  },
};
const signupReducer = (state = initialState, action) => {
  switch (action.type) {
    // stepIndex
    case TOGGLE_IF_ENROLLED: {
      return {
        ...state,
        alreadyEnrolled: action.payload,
      };
    }
    case HANDLE_STEP: {
      return {
        ...state,
        stepIndex: action.payload,
      };
    }
    case SET_LOADER: {
      return {
        ...state,
        loader: {
          ...state.loader,
          [action.payload]: action.value,
        },
      };
    }

    // checkoutData
    case SET_CHECKOUT_DATA: {
      return {
        ...state,
        checkoutData: action.payload,
      };
    }

    case SET_PLAN_DATA: {
      return {
        ...state,
        planData: action.payload,
      };
    }
    case SET_PLAN_CHECKOUT_DATA: {
      return {
        ...state,
        selectedPlanCheckoutData: action.payload,
      };
    }
    case SET_SERVICE: {
      return {
        ...state,
        service: action.payload,
      };
    }
    case SET_SELECTED_SERVICE: {
      return {
        ...state,
        selectedService: action.payload,
      };
    }

    // paymentInfo
    case SET_PAYMENT_INFO: {
      return {
        ...state,
        paymentInfo: {
          ...state.paymentInfo,
          [action.payload]: action.value,
        },
      };
    }
    case SET_PAYMENT_METHODS: {
      return {
        ...state,
        paymentMethods: action.payload,
      };
    }
    case SET_PAYMENT_STATUS: {
      return {
        ...state,
        paymentStatus: action.payload,
      };
    }
    case SET_SUBMITTING_CARD: {
      return {
        ...state,
        isSubmittingCard: action.payload,
      };
    }
    case SET_SUBMITTING_PAYMENT: {
      return {
        ...state,
        isSubmittingPayment: action.payload,
      };
    }
    case SET_SELF_APPLIED_COUPON: {
      return {
        ...state,
        selfAppliedCoupon: action.payload,
      };
    }
    case SET_DECLINED_PAYMENT: {
      return {
        ...state,
        declinedPayment: action.payload,
      };
    }
    case SET_SIGNUP_INITIAL_STATE: {
      return {
        ...state,
        ...initialState,
      };
    }
    default:
      return state;
  }
};
export default signupReducer;
