import React, { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import bc from '../services/breathecode';
import { isWindow } from '../../utils';
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
        user: {
          ...state.user,
          active_cohort: action.payload,
        },
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
    // document.cookie = `accessToken=${token}; path=/`;
  } else {
    // document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    localStorage.removeItem('syllabus');
    localStorage.removeItem('programMentors');
    localStorage.removeItem('programServices');
    localStorage.removeItem('cohortSession');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('taskTodo');
    localStorage.removeItem('sortedAssignments');
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

const isValid = async (token, router, setCookie, removeCookie) => {
  if (!token) return false;
  const response = await bc
    .auth()
    .isValidToken(token)
    .then((res) => {
      setCookie('accessToken', token, { path: '/' });
      return res;
    })
    // remove token from localstorage if expired (it prevents throwing error)
    .catch(() => {
      router.push('/login');
      removeCookie('accessToken', { path: '/' });
      // document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      setSession(null);
    });
  return response.status === 200;
};

const getToken = () => {
  if (isWindow) {
    const query = new URLSearchParams(window.location.search || '');
    const queryToken = query.get('token');
    if (queryToken) return queryToken;
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const AuthContext = createContext({
  ...initialState,
});

const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [, setCookie, removeCookie] = useCookies(['accessToken']);

  // Validate and Fetch user token from localstorage when it changes
  const token = getToken();
  useEffect(async () => {
    const isValidToken = await isValid(token, router, setCookie, removeCookie);
    if (isValidToken) {
      setSession(token);
      const response = await bc.auth().me();
      dispatch({
        type: 'INIT',
        payload: { user: response.data, isAuthenticated: true },
      });
    } else {
      removeCookie('accessToken', { path: '/' });
      setSession(null);
      dispatch({
        type: 'INIT',
        payload: { user: null, isAuthenticated: false },
      });
    }
  }, [token]);

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
      }
      throw Error('Empty values');
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
      }
      throw Error('Empty values');
    } catch (e) {
      const message = e.details || e.detail || Array.isArray(e.non_field_errors)
        ? e.non_field_errors[0]
        : 'Unable to register';
      throw Error(message);
    }
  };

  const choose = async (payload) => {
    dispatch({
      type: 'CHOOSE',
      payload,
    });
  };

  const logout = () => {
    router.push('/login');
    setSession(null);
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
        choose,
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
