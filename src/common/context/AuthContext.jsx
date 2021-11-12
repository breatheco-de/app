import React, { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
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
  return JSON.parse(localStorage.getItem('accessToken'));
};

export const AuthContext = createContext({
  ...initialState,
});

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (isValid(token)) {
        setSession(token);
        const response = await bc.auth().me();
        dispatch({
          type: 'INIT',
          payload: { user: response.data, isAuthenticated: true },
        });
      } else {
        dispatch({
          type: 'INIT',
          payload: { user: null, isAuthenticated: false },
        });
      }
    })();
  }, []);

  const login = async (payload = null) => {
    try {
      if (payload) {
        const response = await bc.auth().login(payload);
        if (response.status === 200) {
          setSession(response.data.token || response.token);
          dispatch({
            type: 'LOGIN',
            payload: response.data,
          });
        }
        return response;
      } throw Error('Empty values');
    } catch (e) {
      const message = e.details || e.detail || Array.isArray(e.non_field_errors)
        ? e.non_field_errors[0]
        : 'Unable to login';
      throw Error(message);
    }
  };

  const register = async (payload = null) => {
    try {
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
        return response;
      } throw Error('Empty values');
    } catch (e) {
      const message = e.details || e.detail || Array.isArray(e.non_field_errors)
        ? e.non_field_errors[0]
        : 'Unable to register';
      throw Error(message);
    }
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
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
