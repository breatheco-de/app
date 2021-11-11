import React, { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import bc from '../services/breathecode';
import axiosInstance from '../../axios';

const initialState = {
  isAuthenticated: false,
  user: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INIT': {
      const { isAuthenticated, user } = action.payload;
      return {
        ...state,
        isAuthenticated,
        user,
      };
    }
    case 'LOGIN': {
      const { user } = action.payload;

      return {
        ...state,
        isAuthenticated: true,
        user,
      };
    }
    case 'CHOOSE': {
      return {
        ...state,
        isAuthenticated: true,
      };
    }
    case 'LOGOUT': {
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    }
    case 'REGISTER': {
      const { user } = action.payload;
      return {
        ...state,
        isAuthenticated: true,
        user,
      };
    }
    default: {
      return { ...state };
    }
  }
};

const setSession = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
    axiosInstance.defaults.headers.common.Authorization = `Token ${token}`;
  } else {
    localStorage.removeItem('accessToken');
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

const isValid = async (token) => {
  if (!token) return false;
  const response = await bc.auth().isValidToken(token);
  return response.status === 200;
};

const getToken = () => {
  const query = new URLSearchParams(window.location.search);
  const queryToken = query.get('token');
  if (queryToken) return queryToken;
  /*
   * NOTE: JSON.parse(localStorage.getItem('accessToken')) not works as expected
           returns:
              Uncaught (in promise) SyntaxError: Unexpected token a in JSON at position 1
              at JSON.parse (<anonymous>)
  */
  // localStorage.getItem('accessToken') returns token text instead of an object
  return localStorage.getItem('accessToken');
};

export const AuthContext = createContext({
  ...initialState,
});

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (await isValid(token)) {
        setSession(token);
        const response = await bc.auth().me();
        console.log('SESSION_RESPONSE:', response);
        dispatch({
          type: 'INIT',
          payload: { user: response, isAuthenticated: true },
        });
      } else {
        dispatch({
          type: 'INIT',
          payload: { user: null, isAuthenticated: false },
        });
      }
    })();
  }, []);

  const login = async (email, password) => {
    if (email && password) {
      const response = await bc.auth().login(email, password);
      if (response.status === 200) {
        console.log('Successfully logged:', response);
        router.push({
          query: {
            token: response.data.token,
          },
        });
        setSession(response.data.token || response.token);
        dispatch({
          type: 'LOGIN',
          payload: response.data,
        });
      }
    }
  };

  const register = async (payload = null) => {
    if (payload) {
      const response = await bc.auth().register(payload);
      if (response.status === 200) {
        setSession(response.data.token || response.token);
        dispatch({
          type: 'REGISTER',
          payload: {
            isAuthenticated: true,
            user: response.data,
          },
        });
      }
    }
  };

  const logout = () => {
    router.push({
      pathname: '/',
    });
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'Bearer',
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

AuthProvider.defaultProps = {
  children: null,
};

export default AuthProvider;
