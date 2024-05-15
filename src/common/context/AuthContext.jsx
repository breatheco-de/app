import React, { createContext, useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { Avatar, Box, useToast } from '@chakra-ui/react';
import bc from '../services/breathecode';
import { getQueryString, isWindow, removeStorageItem, removeURLParameter } from '../../utils';
import { reportDatalayer } from '../../utils/requests';
import axiosInstance, { cancelAllCurrentRequests } from '../../axios';
import { usePersistent, usePersistentBySession } from '../hooks/usePersistent';
import modifyEnv from '../../../modifyEnv';
import ModalInfo from '../../js_modules/moduleMap/modalInfo';
import Text from '../components/Text';
import { SILENT_CODE } from '../../lib/types';
import { warn } from '../../utils/logging';

const initialState = {
  isLoading: true,
  isAuthenticated: false,
  isAuthenticatedWithRigobot: false,
  user: null,
};

const langHelper = {
  us: 'en',
  en: 'en',
  es: 'es',
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INIT': {
      const { isLoading, isAuthenticated, isAuthenticatedWithRigobot, user } = action.payload;
      return {
        ...state,
        isLoading,
        isAuthenticated,
        isAuthenticatedWithRigobot,
        user,
      };
    }
    case 'LOGIN': {
      const { user } = action.payload;
      return {
        ...state,
        isLoading: false,
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
        isLoading: false,
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
    case 'UPDATE_PROFILE_PICTURE': {
      return {
        ...state,
        isLoading: false,
        user: action.payload,
      };
    }
    default: {
      return { ...state };
    }
  }
};

const setTokenSession = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
    axiosInstance.defaults.headers.common.Authorization = `Token ${token}`;
  } else {
    removeStorageItem('syllabus');
    removeStorageItem('programMentors');
    removeStorageItem('programServices');
    removeStorageItem('cohortSession');
    removeStorageItem('accessToken');
    removeStorageItem('taskTodo');
    removeStorageItem('profile');
    removeStorageItem('sortedAssignments');
    removeStorageItem('days_history_log');
    removeStorageItem('queryCache');
    removeStorageItem('hasPaidSubscription');
    removeStorageItem('programsList');
    removeStorageItem('isClosedLateModal');
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

const getToken = () => {
  if (isWindow) {
    const query = new URLSearchParams(window.location.search || '');
    const queryToken = query.get('token')?.split('?')[0]; // sometimes endpoint redirection returns 2 ?token querystring
    if (queryToken) return queryToken;
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const AuthContext = createContext({
  ...initialState,
});

function AuthProvider({ children, pageProps }) {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const router = useRouter();
  const { t, lang } = useTranslation('footer');
  const toast = useToast();
  const queryCoupon = getQueryString('coupon');
  const [, setCoupon] = usePersistentBySession('coupon', []);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [modalState, setModalState] = useState({
    state: false,
    user: null,
  });
  const [profile, setProfile] = usePersistent('profile', {});
  // const [session, setSession] = usePersistent('session', {});

  const query = isWindow && new URLSearchParams(window.location.search || '');
  const queryToken = isWindow && query.get('token')?.split('?')[0];
  const cleanUrl = isWindow && removeURLParameter(window.location.href, 'token');
  const queryTokenExists = isWindow && queryToken !== undefined && queryToken.length > 0;

  // Validate and Fetch user token from localstorage when it changes
  const handleSession = (tokenString) => setTokenSession(tokenString);

  const updateSettingsLang = async () => {
    try {
      await bc.auth().updateSettings({ lang });
    } catch (e) {
      warn('error function "updateSettingsLang": ', e);
    }
  };
  const authHandler = async () => {
    const token = getToken();

    if (token !== undefined && token !== null) {
      const respRigobotAuth = await bc.auth().verifyRigobotConnection(token);
      const isAuthenticatedWithRigobot = respRigobotAuth && respRigobotAuth?.status === 200;
      const requestToken = await fetch(`${BREATHECODE_HOST}/v1/auth/token/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (requestToken.status >= 400) {
        handleSession(null);
        if (!queryTokenExists) {
          router.reload();
        } else {
          router.push(cleanUrl);
        }
        dispatch({
          type: 'INIT',
          payload: { user: null, isAuthenticated: false, isLoading: false },
        });
      } else {
        handleSession(token);
        bc.auth().me()
          .then(({ data }) => {
            dispatch({
              type: 'INIT',
              payload: { user: data, isAuthenticated: true, isAuthenticatedWithRigobot, isLoading: false },
            });
            const permissionsSlug = data.permissions.map((l) => l.codename);
            const settingsLang = data?.settings.lang;

            setProfile({
              ...profile,
              ...data,
              permissionsSlug,
            });
            reportDatalayer({
              dataLayer: {
                event: 'session_load',
                method: 'native',
                user_id: data.id,
                email: data.email,
                // is_saas: data.roles.filter(r => r.role.toLowerCase() == "student" && r.)
                first_name: data.first_name,
                last_name: data.last_name,
                avatar_url: data.profile?.avatar_url || data.github?.avatar_url,
                language: data.profile?.settings?.lang === 'us' ? 'en' : data.profile?.settings?.lang,
              },
            });
            if (data.github) {
              localStorage.setItem('showGithubWarning', 'closed');
            } else if (!localStorage.getItem('showGithubWarning') || localStorage.getItem('showGithubWarning') !== 'postponed') {
              localStorage.setItem('showGithubWarning', 'active');
            }
            if (!pageProps.disableLangSwitcher && langHelper[router?.locale] !== settingsLang) {
              updateSettingsLang();
            }
          })
          .catch(() => {
            handleSession(null);
          });
      }
    }

    return null;
  };
  useEffect(() => {
    if (queryCoupon) {
      setCoupon(queryCoupon);
    }
    authHandler();
  }, [router]);

  const login = async (payload = null, disableRedirect = false) => {
    const redirect = isWindow && localStorage.getItem('redirect');
    try {
      if (payload) {
        const response = await bc.auth().login2(payload, lang);
        const responseData = await response.json();

        if (responseData?.silent_code === SILENT_CODE.EMAIL_NOT_VALIDATED) {
          setModalState({
            ...payload,
            ...responseData,
            state: true,
          });
        }
        if (responseData?.silent !== true && responseData?.non_field_errors?.length > 0) {
          for (let i = 0; i < responseData.non_field_errors?.length; i += 1) {
            const indexFromOne = i + 1;
            toast({
              position: 'top',
              status: 'error',
              title: responseData.non_field_errors[i],
              duration: 5000 + (1000 * indexFromOne),
              isClosable: true,
            });
          }
        }

        if (response.status === 200) {
          handleSession(responseData.token || response.token);
          dispatch({
            type: 'LOGIN',
            payload: responseData,
          });
          if (!disableRedirect) {
            if (redirect && redirect.length > 0) {
              router.push(redirect);
              localStorage.removeItem('redirect');
            } else {
              router.push('/choose-program');
              localStorage.removeItem('redirect');
            }
          } else {
            router.reload();
          }
          reportDatalayer({
            dataLayer: {
              event: 'login',
              path: router.pathname,
              method: 'native',
              user_id: responseData.user_id,
              email: responseData.email,
            },
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
              isLoading: false,
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

  const logout = (callback = null) => {
    cancelAllCurrentRequests();
    handleSession(null);
    setProfile({});

    if (typeof callback === 'function') callback();
    if (typeof callback !== 'function') {
      if (queryTokenExists) {
        router.push(cleanUrl)
          .then(() => {
            router.reload();
          });
      } else {
        router.reload();
      }
    }
    localStorage.removeItem('showGithubWarning');
    localStorage.removeItem('redirect');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfilePicture = async (payload) => {
    dispatch({
      type: 'UPDATE_PROFILE_PICTURE',
      payload,
    });
  };

  return (
    <AuthContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        ...state,
        method: 'Bearer',
        login,
        logout,
        register,
        choose,
        updateProfilePicture,
      }}
    >
      {children}
      <ModalInfo
        headerStyles={{ textAlign: 'center' }}
        title={t('signup:alert-message.validate-email-title')}
        footerStyle={{ flexDirection: 'row-reverse' }}
        closeButtonVariant="outline"
        closeButtonStyles={{ borderRadius: '3px', color: '#0097CD', borderColor: '#0097CD' }}
        childrenDescription={(
          <Box display="flex" flexDirection="column" alignItems="center" gridGap="17px">
            <Avatar src={`${BREATHECODE_HOST}/static/img/avatar-1.png`} border="3px solid #0097CD" width="91px" height="91px" borderRadius="50px" />
            <Text
              size="14px"
              textAlign="center"
              dangerouslySetInnerHTML={{ __html: t('signup:alert-message.validate-email-description', { email: modalState?.email }) }}
            />
          </Box>
        )}
        isOpen={modalState.state}
        buttonHandlerStyles={{ variant: 'default' }}
        actionHandler={() => {
          const inviteId = modalState?.data?.[0]?.id;
          bc.auth().resendConfirmationEmail(inviteId)
            .then((resp) => {
              const data = resp?.data;
              if (data === undefined) {
                toast({
                  position: 'top',
                  status: 'info',
                  title: t('signup:alert-message.email-already-sent'),
                  isClosable: true,
                  duration: 6000,
                });
              } else {
                toast({
                  position: 'top',
                  status: 'success',
                  title: t('signup:alert-message.email-sent-to', { email: data?.email }),
                  isClosable: true,
                  duration: 6000,
                });
              }
            });
        }}
        handlerText={t('signup:resend')}
        onClose={() => setModalState({
          ...modalState,
          state: false,
        })}
      />
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
  pageProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

AuthProvider.defaultProps = {
  children: null,
  pageProps: {},
};

export default AuthProvider;
