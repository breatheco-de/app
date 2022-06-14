import React, { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import useSWR from 'swr';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import bc from '../services/breathecode';
import { isWindow } from '../../utils';
import axiosInstance from '../../axios';
import { usePersistent } from '../hooks/usePersistent';

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

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const setSession = (token, setCookie, removeCookie) => {
  if (token) {
    localStorage.setItem('accessToken', token);
    setCookie('accessToken', token, { path: '/' });
    axiosInstance.defaults.headers.common.Authorization = `Token ${token}`;
    // document.cookie = `accessToken=${token}; path=/`;
  } else {
    // document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    localStorage.removeItem('syllabus');
    localStorage.removeItem('programMentors');
    localStorage.removeItem('programServices');
    localStorage.removeItem('cohortSession');
    localStorage.removeItem('accessToken');
    removeCookie('accessToken', { path: '/' });
    localStorage.removeItem('taskTodo');
    localStorage.removeItem('sortedAssignments');
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

const getToken = (cookies) => {
  if (isWindow) {
    const query = new URLSearchParams(window.location.search || '');
    const queryToken = query.get('token')?.split('?')[0]; // sometimes endpoint redirection returns 2 ?token querystring
    if (queryToken) return queryToken;
    return cookies.accessToken;
    // return localStorage.getItem('accessToken');
  }
  return null;
};

export const AuthContext = createContext({
  ...initialState,
});

const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
  const [profile, setProfile] = usePersistent('profile', {});

  // Validate and Fetch user token from localstorage when it changes
  const token = getToken(cookies);
  const handleSession = (tokenString) => setSession(tokenString, setCookie, removeCookie);
  const { data, isValidating } = useSWR(`${process.env.BREATHECODE_HOST}/v1/auth/token/${token}`, fetcher);
  const loading = isValidating || !data;

  const isValidToken = data?.token !== undefined && token !== undefined && data?.token === token;
  const tokenStatusSafe = data?.status_code !== 403;

  useEffect(async () => {
    if (loading) return;
    if (tokenStatusSafe === true && isValidToken === true) {
      handleSession(data.token);
      const response = await bc.auth().me();
      setProfile({
        ...profile,
        ...response.data,
      });
      dispatch({
        type: 'INIT',
        payload: { user: response.data, isAuthenticated: true },
      });
    } else if (cookies?.accessToken !== undefined) {
      removeCookie('accessToken', { path: '/' });
      handleSession(null);
      router.push('/login');
      setProfile({});
      dispatch({
        type: 'INIT',
        payload: { user: null, isAuthenticated: false },
      });
    }
  }, [isValidToken, tokenStatusSafe, data]);

  const login = async (payload = null) => {
    try {
      if (payload) {
        const response = await bc.auth().login(payload);
        if (response.status === 200) {
          handleSession(response.data.token || response.token);
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
          handleSession(response.data.token || response.token);
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
    handleSession(null);
    setProfile({});
    removeCookie('accessToken', { path: '/' });
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
