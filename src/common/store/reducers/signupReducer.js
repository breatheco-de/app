import {
  NEXT_STEP, PREV_STEP, HANDLE_STEP, SET_DATE_PROPS, SET_CHECKOUT_DATA, SET_LOCATION,
  SET_PAYMENT_INFO, SET_PLAN_DATA, SET_LOADER, SET_PLAN_CHECKOUT_DATA, SET_PLAN_PROPS, SET_COHORT_PLANS,
  TOGGLE_IF_ENROLLED, SET_SERVICE_PROPS, SET_SELECTED_SERVICE, SET_PAYMENT_METHODS, SET_PAYMENT_STATUS,
  SET_SUBMITTING_CARD, SET_SUBMITTING_PAYMENT,
} from '../types';

const initialState = {
  stepIndex: 0,
  dateProps: null,
  checkoutData: null,
  location: null,
  paymentInfo: {
    card_number: '',
    exp: '',
    cvc: '',
  },
  planData: null,
  selectedPlanCheckoutData: null,
  planProps: null,
  loader: {
    date: false,
    plan: true,
  },
  cohortPlans: null,
  alreadyEnrolled: false,
  paymentMethods: [],
  paymentStatus: 'idle',
  isSubmittingCard: false,
  isSubmittingPayment: false,
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
    case NEXT_STEP: {
      return {
        ...state,
        stepIndex: state.stepIndex + 1,
      };
    }
    case PREV_STEP: {
      return {
        ...state,
        stepIndex: state.stepIndex - 1,
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

    // dateProps
    case SET_DATE_PROPS: {
      return {
        ...state,
        dateProps: action.payload,
      };
    }

    // checkoutData
    case SET_CHECKOUT_DATA: {
      return {
        ...state,
        checkoutData: action.payload,
      };
    }

    // location
    case SET_LOCATION: {
      return {
        ...state,
        location: action.payload,
      };
    }

    // planData
    case SET_COHORT_PLANS: {
      return {
        ...state,
        cohortPlans: action.payload,
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
    case SET_SERVICE_PROPS: {
      return {
        ...state,
        serviceProps: action.payload,
      };
    }
    case SET_SELECTED_SERVICE: {
      return {
        ...state,
        selectedService: action.payload,
      };
    }
    case SET_PLAN_PROPS: {
      return {
        ...state,
        planProps: action.payload,
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
    default:
      return state;
  }
};
export default signupReducer;
