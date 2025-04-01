/* eslint-disable camelcase */
import React, { createContext, useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { Avatar, Box, useToast } from '@chakra-ui/react';
import bc from '../services/breathecode';
import { getQueryString, isWindow, removeStorageItem, removeURLParameter, getBrowserInfo } from '../../utils';
import { reportDatalayer, getPrismicPages } from '../../utils/requests';
import { getPrismicPagesUrls } from '../../utils/url';
import { BREATHECODE_HOST, RIGOBOT_HOST } from '../../utils/variables';
import axiosInstance, { cancelAllCurrentRequests } from '../../axios';
import { usePersistentBySession } from '../hooks/usePersistent';
import useRigo from '../hooks/useRigo';
import ModalInfo from '../components/ModalInfo';
import Text from '../components/Text';
import { SILENT_CODE } from '../../lib/types';
import { warn } from '../../utils/logging';
import { generateUserContext } from '../../utils/rigobotContext';

const initialState = {
  isLoading: true,
  isAuthenticated: false,
  isAuthenticatedWithRigobot: false,
  user: null,
  cohorts: [],
  blockedServices: null,
};

const langHelper = {
  us: 'en',
  en: 'en',
  es: 'es',
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INIT': {
      const { isLoading, isAuthenticated, isAuthenticatedWithRigobot, user, cohorts } = action.payload;
      return {
        ...state,
        isLoading,
        isAuthenticated,
        isAuthenticatedWithRigobot,
        user,
        cohorts,
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
    case 'UPDATE_PROFILE': {
      return {
        ...state,
        isLoading: false,
        user: action.payload,
      };
    }
    case 'SET_COHORTS': {
      return {
        ...state,
        cohorts: action.payload,
      };
    }
    case 'SET_COHORTS_AND_USER': {
      const { user, cohorts } = action.payload;
      return {
        ...state,
        user,
        cohorts,
      };
    }
    case 'LOADING': {
      return {
        ...state,
        isLoading: action.payload,
      };
    }
    case 'SET_BLOCKED_SERVICES': {
      return {
        ...state,
        blockedServices: action.payload,
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
  const router = useRouter();
  const { t, lang } = useTranslation('footer');
  const toast = useToast();
  const { rigo, isRigoInitialized } = useRigo();
  const queryCoupon = getQueryString('coupon');
  const [, setCoupon] = usePersistentBySession('coupon', []);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = state;
  const [modalState, setModalState] = useState({
    state: false,
    user: null,
  });

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
  const conntectToRigobot = () => {
    const accessToken = getToken();
    const callBackUrl = window.location.href;
    // Create buffer object, specifying utf8 as encoding
    const bufferObj = Buffer.from(callBackUrl, 'utf8');

    // Encode the Buffer as a base64 string
    const base64String = bufferObj.toString('base64');
    const inviteUrl = `${RIGOBOT_HOST}/invite/?referer=4geeks&token=${accessToken}&callback=${base64String}`;
    window.location.href = inviteUrl;
  };

  useEffect(() => {
    if (state.isAuthenticated && (router.pathname === '/' || router.pathname === '')) {
      router.push('/choose-program');
    }
  }, [state.isAuthenticated, router.pathname]);

  const parseCohortUser = (elem) => {
    const { cohort, ...cohort_user } = elem;
    const { syllabus_version } = cohort;
    return {
      ...cohort,
      selectedProgramSlug: `/cohort/${cohort.slug}/${syllabus_version.slug}/v${syllabus_version.version}`,
      cohort_user,
    };
  };

  const fetchUserAndCohorts = async () => {
    try {
      const { data } = await bc.admissions().me();
      const { cohorts: cohortUsers, ...userData } = data;
      const cohorts = cohortUsers.map(parseCohortUser);

      return { cohorts, userData };
    } catch (e) {
      console.log(e);
      return e;
    }
  };

  const reSetUserAndCohorts = async () => {
    const { cohorts, userData } = await fetchUserAndCohorts();
    dispatch({
      type: 'SET_COHORTS_AND_USER',
      payload: { user: userData, cohorts },
    });

    return { cohorts, userData };
  };

  const setCohorts = (cohorts) => {
    dispatch({
      type: 'SET_COHORTS',
      payload: cohorts,
    });
  };

  const fetchBlockedServices = async () => {
    try {
      const { data } = await bc.payment().getBlockedServices();
      dispatch({
        type: 'SET_BLOCKED_SERVICES',
        payload: data,
      });
    } catch (err) {
      warn('Error fetching blocked services:', err);
      dispatch({
        type: 'SET_BLOCKED_SERVICES',
        payload: null,
      });
    }
  };

  const authHandler = async () => {
    const token = getToken();

    if (token !== undefined && token !== null) {
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
          payload: { user: null, isAuthenticated: false, isLoading: false, cohorts: [] },
        });
      } else {
        handleSession(token);
        try {
          // only fetch user info if it is null
          if (!user) {
            const { cohorts, userData } = await fetchUserAndCohorts();

            const [respRigobotAuth] = await Promise.all([
              bc.auth().verifyRigobotConnection(token),
              fetchBlockedServices(),
            ]);

            const isAuthenticatedWithRigobot = respRigobotAuth && respRigobotAuth?.status === 200;

            dispatch({
              type: 'INIT',
              payload: { user: userData, cohorts, isAuthenticated: true, isAuthenticatedWithRigobot, isLoading: false },
            });
            const settingsLang = userData?.settings.lang;

            reportDatalayer({
              dataLayer: {
                event: 'session_load',
                method: 'native',
                user_id: userData.id,
                email: userData.email,
                is_academy_legacy: [...new Set(userData.roles.map((role) => role.academy.id))].join(', '),
                is_available_as_saas: !userData.roles.some((r) => r.academy.id !== 47),
                first_name: userData.first_name,
                last_name: userData.last_name,
                avatar_url: userData.profile?.avatar_url || userData.github?.avatar_url,
                language: userData.profile?.settings?.lang === 'us' ? 'en' : userData.profile?.settings?.lang,
                agent: getBrowserInfo(),
              },
            });
            if (userData.github) {
              localStorage.setItem('showGithubWarning', 'closed');
            } else if (!localStorage.getItem('showGithubWarning') || localStorage.getItem('showGithubWarning') !== 'postponed') {
              localStorage.setItem('showGithubWarning', 'active');
            }
            if (!pageProps.disableLangSwitcher && langHelper[router?.locale] !== settingsLang) {
              updateSettingsLang();
            }
          }
        } catch (e) {
          handleSession(null);
        }
      }
    } else {
      dispatch({
        type: 'LOADING',
        payload: false,
      });
    }

    return null;
  };
  useEffect(() => {
    if (queryCoupon) {
      setCoupon(queryCoupon);
    }
    authHandler();
  }, [router]);

  useEffect(() => {
    if (user && isRigoInitialized) {
      const token = getToken();
      const context = generateUserContext(user);

      rigo.updateOptions({
        context,
        user: {
          token,
          nickname: `${user.first_name} ${user.last_name}`,
          avatar_url: user.profile?.avatar_url,
        },
      });
    }
  }, [user, isRigoInitialized]);

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

          const prismicPages = await getPrismicPages();
          const prismicPagesUrls = getPrismicPagesUrls(prismicPages);

          // disabledRedirectUrls are urls that we will ignore if included as redirect.
          const disabledRedirectUrls = [...prismicPagesUrls, '/'];

          if (!disableRedirect) {
            if (redirect && redirect.length > 0 && !disabledRedirectUrls.includes(redirect)) {
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
              agent: getBrowserInfo(),
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

  const logout = (callback = null) => {
    cancelAllCurrentRequests();
    handleSession(null);

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

  const updateProfile = async (payload) => {
    dispatch({
      type: 'UPDATE_PROFILE',
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
        updateProfile,
        conntectToRigobot,
        setCohorts,
        reSetUserAndCohorts,
        fetchUserAndCohorts,
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
