import { Avatar, Box, Button, useColorModeValue } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Text from './Text';
import Signup from './Forms/Signup';
import useAuth from '../hooks/useAuth';
import useStyle from '../hooks/useStyle';
import { setStorageItem } from '../../utils';
import { BREATHECODE_HOST } from '../../utils/variables';
import ModalInfo from './ModalInfo';
import useSubscribeToPlan from '../hooks/useSubscribeToPlan';
import useSignup from '../store/actions/signupAction';

function ShowOnSignUp({
  headContent, title, description, childrenDescription, subContent, footerContent, submitText, padding, isLive,
  subscribeValues, readOnly, children, hideForm, hideSwitchUser, refetchAfterSuccess, existsConsumables,
  conversionTechnologies, setNoConsumablesFound, invertHandlerPosition, formContainerStyle, buttonStyles,
  onLastAttempt, maxAttemptsToRefetch, showVerifyEmail, onSubmit, ...rest
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const { handleSubscribeToPlan } = useSubscribeToPlan();
  const { backgroundColor, featuredColor, hexColor } = useStyle();
  const [showAlreadyMember, setShowAlreadyMember] = useState(false);
  const [alreadyLogged, setAlreadyLogged] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { t } = useTranslation('signup');
  const [isReadyToRefetch, setIsReadyToRefetch] = useState(false);
  const router = useRouter();
  const isLogged = alreadyLogged || isAuthenticated;
  const commonBorderColor = useColorModeValue('gray.250', 'gray.700');
  const defaultPlan = process.env.BASE_PLAN || 'basic';
  const { setSelectedPlanCheckoutData } = useSignup();

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
              showVerifyEmail={showVerifyEmail}
              columnLayout
              showLoginLink
              invertHandlerPosition={invertHandlerPosition}
              subscribeValues={subscribeValues}
              conversionTechnologies={conversionTechnologies}
              buttonStyles={{ background: hexColor.greenLight, ...buttonStyles }}
              textAlign="left"
              extraFields={[{
                name: 'phone',
                required: true,
                type: 'phone',
                label: '',
                error: t('validators.invalid-phone'),
              }]}
              onHandleSubmit={(data) => {
                onSubmit();
                handleSubscribeToPlan({ slug: defaultPlan, accessToken: data?.access_token, disableRedirects: true })
                  .then((respData) => {
                    if (respData.status === 'FULFILLED') {
                      setIsReadyToRefetch(true);
                      setAlreadyLogged(true);
                      refetchAfterSuccess();
                      setSelectedPlanCheckoutData({
                        plan_slug: defaultPlan,
                        price: respData.data?.price || 0,
                        period_label: respData.data?.period_label || 'one-time',
                        ...respData.data,
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
  showVerifyEmail: PropTypes.bool,
  onSubmit: PropTypes.func,
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
  showVerifyEmail: true,
  onSubmit: () => {},
};

export default ShowOnSignUp;
