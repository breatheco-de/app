import { Avatar, Box, Button, useColorModeValue, useToast } from '@chakra-ui/react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Link from './NextChakraLink';
import Text from './Text';
import FieldForm from './Forms/FieldForm';
import useAuth from '../hooks/useAuth';
import useStyle from '../hooks/useStyle';
import modifyEnv from '../../../modifyEnv';
import { setStorageItem } from '../../utils';
import ModalInfo from '../../js_modules/moduleMap/modalInfo';
import { SILENT_CODE } from '../../lib/types';
import bc from '../services/breathecode';
import useSubscribeToPlan from '../hooks/useSubscribeToPlan';

function ShowOnSignUp({
  headContent, title, description, childrenDescription, subContent,
  readOnly, children, hideForm, hideSwitchUser, refetchAfterSuccess, ...rest
}) {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const { isAuthenticated, user, logout } = useAuth();
  const { handleSubscribeToPlan, successModal } = useSubscribeToPlan();
  const { backgroundColor, featuredColor } = useStyle();
  const [showAlreadyMember, setShowAlreadyMember] = useState(false);
  const [verifyEmailProps, setVerifyEmailProps] = useState({});
  const { t } = useTranslation('workshops');
  const router = useRouter();
  const toast = useToast();
  const [formProps, setFormProps] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const subscriptionValidation = Yup.object().shape({
    first_name: Yup.string().min(2, t('common:validators.short-input')).max(50, t('common:validators.long-input')).required(t('common:validators.first-name-required')),
    last_name: Yup.string().min(2, t('common:validators.short-input')).max(50, t('common:validators.long-input')).required(t('common:validators.last-name-required')),
    email: Yup.string().email(t('common:validators.invalid-email')).required(t('common:validators.email-required')),
  });

  const commonBorderColor = useColorModeValue('gray.250', 'gray.700');

  const handleSubmit = async (actions, allValues) => {
    const resp = await fetch(`${BREATHECODE_HOST}/v1/auth/subscribe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': router?.locale || 'en',
      },
      body: JSON.stringify({
        ...allValues,
        plan: '4geeks-standard',
      }),
    });

    const data = await resp.json();
    if (data.silent_code === SILENT_CODE.USER_EXISTS
        || data.silent_code === SILENT_CODE.USER_INVITE_ACCEPTED_EXISTS) {
      setShowAlreadyMember(true);
    }
    if (resp?.status >= 400) {
      toast({
        position: 'top',
        title: data?.detail,
        status: 'error',
        isClosable: true,
        duration: 6000,
      });
    }
    setStorageItem('subscriptionId', data?.id);

    if (data?.access_token) {
      handleSubscribeToPlan({ slug: '4geeks-standard', accessToken: data?.access_token })
        .finally(() => {
          refetchAfterSuccess();
          setVerifyEmailProps({
            data: {
              ...allValues,
              ...data,
            },
            state: true,
          });
        });
      router.push({
        query: {
          ...router.query,
          token: data.access_token,
        },
      });
    }

    if (typeof resp?.status === 'number' && data?.access_token === null) {
      actions.setSubmitting(false);
      if (resp.status < 400 && typeof data?.id === 'number') {
        setStorageItem('subscriptionId', data.id);
        router.push('/thank-you');
      }
    }
  };
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

      <Box display="flex" flexDirection="column" gridGap={rest?.gridGap || '10px'} padding="0 18px 18px">
        {title && (
          <Text size="21px" fontWeight={700} lineHeight="25px">
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
                      logout(() => {
                        router.push('/login');
                      });
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
            <Formik
              initialValues={{
                first_name: '',
                last_name: '',
                email: '',
              }}
              onSubmit={(values, actions) => {
                handleSubmit(actions, values);
              }}
              validationSchema={subscriptionValidation}
            >
              {({ isSubmitting }) => (
                <Form
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gridGap: '10px',
                    padding: '10px 0 0 0',
                  }}
                >
                  <FieldForm
                    type="text"
                    name="first_name"
                    label={t('common:first-name')}
                    required
                    formProps={formProps}
                    setFormProps={setFormProps}
                    readOnly={readOnly}
                  />
                  <FieldForm
                    type="text"
                    name="last_name"
                    label={t('common:last-name')}
                    required
                    formProps={formProps}
                    setFormProps={setFormProps}
                    readOnly={readOnly}
                  />
                  <FieldForm
                    type="text"
                    name="email"
                    label={t('common:email')}
                    required
                    formProps={formProps}
                    setFormProps={setFormProps}
                    readOnly={readOnly}
                  />

                  <Button
                    mt="10px"
                    type="submit"
                    variant="default"
                    isLoading={isSubmitting}
                    title={t('join-workshop')}
                    isDisabled={readOnly}
                  >
                    {t('join-workshop')}
                  </Button>
                  <Text size="13px" padding="4px 8px" borderRadius="4px" background={featuredColor}>
                    {t('signup:already-have-account')}
                    {' '}
                    <Link redirectAfterLogin variant="default" href="/login" fontSize="13px">
                      {t('signup:login-here')}
                    </Link>
                  </Text>
                </Form>
              )}
            </Formik>
          </Box>
        )}
      </Box>

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
          router.push('/login?tab=login');
          setShowAlreadyMember(false);
        }}
        handlerText={t('common:login')}
      />

      {successModal}

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
  description: PropTypes.string,
  readOnly: PropTypes.bool,
  children: PropTypes.node,
  hideForm: PropTypes.bool,
  childrenDescription: PropTypes.node,
  hideSwitchUser: PropTypes.bool,
  refetchAfterSuccess: PropTypes.func,
};

ShowOnSignUp.defaultProps = {
  headContent: null,
  subContent: null,
  title: '',
  description: '',
  readOnly: false,
  children: null,
  hideForm: false,
  childrenDescription: null,
  hideSwitchUser: false,
  refetchAfterSuccess: () => {},
};

export default ShowOnSignUp;
