// const [stepIndex, setStepIndex] = useState(0);
// const [dateProps, setDateProps] = useState(null);
// const [checkoutData, setCheckoutData] = useState(null);
// const [location, setLocation] = useState(null);
// const [paymentInfo, setPaymentInfo] = useState({});
// const [planData, setPlanData] = useState(null);
import {
  NEXT_STEP, PREV_STEP, HANDLE_STEP, SET_DATE_PROPS, SET_CHECKOUT_DATA, SET_LOCATION,
  SET_PAYMENT_INFO, SET_PLAN_DATA, SET_LOADER, SET_PLAN_CHECKOUT_DATA,
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
  loader: {
    date: false,
  },
};
const signupReducer = (state = initialState, action) => {
  switch (action.type) {
    // stepIndex
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
    default:
      return state;
  }
};
export default signupReducer;
