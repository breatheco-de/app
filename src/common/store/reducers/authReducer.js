export const LOGIN = 'LOGIN';

const initialState = {
  user: {},
};

const AuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN: {
      return {
        ...state,
        user: action.payload,
      };
    }
    default: {
      return {
        ...state,
      };
    }
  }
};

export default AuthReducer;
