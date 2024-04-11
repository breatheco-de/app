import { Avatar, Box, Button, useColorModeValue, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Text from './Text';
import Signup from './Forms/Signup';
import useGoogleMaps from '../hooks/useGoogleMaps';
import useSignup from '../store/actions/signupAction';
import useAuth from '../hooks/useAuth';
import useStyle from '../hooks/useStyle';
import modifyEnv from '../../../modifyEnv';
import { setStorageItem } from '../../utils';
import ModalInfo from '../../js_modules/moduleMap/modalInfo';
import bc from '../services/breathecode';
import useSubscribeToPlan from '../hooks/useSubscribeToPlan';
import { error } from '../../utils/logging';

function ShowOnSignUp({
  headContent, title, description, childrenDescription, subContent, footerContent, submitText, padding, isLive,
  subscribeValues, readOnly, children, hideForm, hideSwitchUser, refetchAfterSuccess, existsConsumables,
  conversionTechnologies, setNoConsumablesFound, invertHandlerPosition, formContainerStyle, buttonStyles,
  onLastAttempt, maxAttemptsToRefetch, ...rest
}) {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const GOOGLE_KEY = process.env.GOOGLE_GEO_KEY;
  const { gmapStatus, getUserLocation } = useGoogleMaps(
    GOOGLE_KEY,
    'places',
  );
  const { setLocation } = useSignup();
  const { isAuthenticated, user, logout } = useAuth();
  const { handleSubscribeToPlan } = useSubscribeToPlan();
  const { backgroundColor, featuredColor, hexColor } = useStyle();
  const [showAlreadyMember, setShowAlreadyMember] = useState(false);
  const [verifyEmailProps, setVerifyEmailProps] = useState({});
  const [alreadyLogged, setAlreadyLogged] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { t } = useTranslation('signup');
  const [isReadyToRefetch, setIsReadyToRefetch] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const [formProps, setFormProps] = useState({
    first_name: '',
    last_name: '',
    email: '',
    // phone: '',
  });
  const isLogged = alreadyLogged || isAuthenticated;
  const commonBorderColor = useColorModeValue('gray.250', 'gray.700');
  const defaultPlan = process.env.BASE_PLAN || 'basic';

  useEffect(() => {
    getUserLocation()
      .then((loc) => setLocation(loc))
      .catch((e) => error('function getUserLocation()', e));
  }, [gmapStatus]);

  useEffect(() => {
    let intervalId;
    if (isLogged && !existsConsumables && !isReadyToRefetch) {
      setNoConsumablesFound(true);
    }
    if (isLogged && !existsConsumables && attempts === maxAttemptsToRefetch) {
      setNoConsumablesFound(true);
      onLastAttempt();
    }
    if (isLogged && !existsConsumables && attempts < maxAttemptsToRefetch && isReadyToRefetch) {
      intervalId = setInterval(() => {
        setAttempts((prevTime) => prevTime + 1);
        refetchAfterSuccess();
      }, 2000);
    }

    return () => clearInterval(intervalId);
  }, [isLogged, attempts, isReadyToRefetch, existsConsumables]);

  const isAuth = isAuthenticated && user?.id;

  return (
    <Box
      display="flex"
      flexDirection="column"
      gridGap="10px"
      borderRadius="17px"
      border={1}
      borderStyle="solid"
      borderColor={commonBorderColor}
      backgroundColor={backgroundColor}
      {...rest}
    >
      {headContent}
      {subContent}

      <Box display="flex" flexDirection="column" gridGap={rest?.gridGap || '10px'} padding={padding || (footerContent ? '0 18px 0 18px' : '0 18px 18px')}>
        {title && (
          <Text as="h2" textAlign="center" size="21px" fontWeight={700} lineHeight="25px">
            {title}
          </Text>
        )}
        {description && (
          <Text size="14px" fontWeight={700} lineHeight="18px">
            {description}
          </Text>
        )}
        {childrenDescription}
        {isAuth && (
          <>
            {children}

            {hideSwitchUser ? null : (
              <Text size="13px" padding="4px 8px" borderRadius="4px" background={featuredColor}>
                {t('switch-user-connector', { name: user.first_name })}
                {' '}
                <Button
                  variant="link"
                  fontSize="13px"
                  height="auto"
                  onClick={() => {
                    setStorageItem('redirect', router?.asPath);
                    setTimeout(() => {
                      logout();
                    }, 150);
                  }}
                >
                  {`${t('common:logout-and-switch-user')}.`}
                </Button>
              </Text>
            )}
          </>
        )}

        {!isAuth && !hideForm && (
          <Box>
            <Signup
              columnLayout
              showLoginLink
              invertHandlerPosition={invertHandlerPosition}
              showVerifyEmail={false}
              formProps={formProps}
              setFormProps={setFormProps}
              subscribeValues={subscribeValues}
              conversionTechnologies={conversionTechnologies}
              buttonStyles={{ background: hexColor.greenLight, ...buttonStyles }}
              onHandleSubmit={(data) => {
                handleSubscribeToPlan({ slug: defaultPlan, accessToken: data?.access_token, disableRedirects: true })
                  .then((respData) => {
                    if (respData.status === 'FULFILLED') {
                      setIsReadyToRefetch(true);
                      setAlreadyLogged(true);
                      refetchAfterSuccess();
                      setVerifyEmailProps({
                        data,
                        state: true,
                      });
                    }
                  });
              }}
              formContainerStyle={formContainerStyle}
            />
          </Box>
        )}
      </Box>
      {footerContent}
      <ModalInfo
        isOpen={showAlreadyMember}
        headerStyles={{ textAlign: 'center' }}
        onClose={() => setShowAlreadyMember(false)}
        title={t('signup:alert-message.title')}
        childrenDescription={(
          <Box display="flex" flexDirection="column" alignItems="center" gridGap="17px">
            <Avatar src={`${BREATHECODE_HOST}/static/img/avatar-7.png`} border="3px solid #0097CD" width="91px" height="91px" borderRadius="50px" />
            <Text
              size="14px"
              textAlign="center"
              dangerouslySetInnerHTML={{ __html: t('signup:alert-message.description') }}
            />
          </Box>
        )}
        closeButtonVariant="outline"
        closeButtonStyles={{ borderRadius: '3px', color: '#0097CD', borderColor: '#0097CD' }}
        buttonHandlerStyles={{ variant: 'default' }}
        actionHandler={() => {
          setStorageItem('redirect', router?.asPath);
          router.push('/login');
          setShowAlreadyMember(false);
        }}
        handlerText={t('common:login')}
      />

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
              dangerouslySetInnerHTML={{ __html: t('signup:alert-message.validate-email-description', { email: verifyEmailProps?.data?.email }) }}
            />
          </Box>
        )}
        isOpen={verifyEmailProps.state}
        buttonHandlerStyles={{ variant: 'default' }}
        actionHandler={() => {
          const inviteId = verifyEmailProps?.data?.id;
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
        forceHandlerAndClose
        onClose={() => {
          refetchAfterSuccess();
          setVerifyEmailProps({
            ...verifyEmailProps,
            state: false,
          });
        }}
      />
    </Box>
  );
}

ShowOnSignUp.propTypes = {
  headContent: PropTypes.node,
  subContent: PropTypes.node,
  title: PropTypes.string,
  padding: PropTypes.string,
  description: PropTypes.string,
  submitText: PropTypes.string,
  subscribeValues: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  readOnly: PropTypes.bool,
  children: PropTypes.node,
  hideForm: PropTypes.bool,
  childrenDescription: PropTypes.node,
  hideSwitchUser: PropTypes.bool,
  refetchAfterSuccess: PropTypes.func,
  setNoConsumablesFound: PropTypes.func,
  isLive: PropTypes.bool,
  existsConsumables: PropTypes.bool,
  conversionTechnologies: PropTypes.string,
  footerContent: PropTypes.node,
  invertHandlerPosition: PropTypes.bool,
  formContainerStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  buttonStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  maxAttemptsToRefetch: PropTypes.number,
  onLastAttempt: PropTypes.func,
};

ShowOnSignUp.defaultProps = {
  headContent: null,
  subContent: null,
  title: '',
  padding: null,
  description: '',
  submitText: null,
  subscribeValues: {},
  readOnly: false,
  children: null,
  hideForm: false,
  childrenDescription: null,
  hideSwitchUser: false,
  refetchAfterSuccess: () => {},
  setNoConsumablesFound: () => {},
  isLive: false,
  existsConsumables: false,
  conversionTechnologies: null,
  footerContent: null,
  invertHandlerPosition: false,
  formContainerStyle: {},
  buttonStyles: {},
  maxAttemptsToRefetch: 10,
  onLastAttempt: () => {},
};

export default ShowOnSignUp;
