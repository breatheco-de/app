import useTranslation from 'next-translate/useTranslation';
import {
  Button,
  FormControl,
  Stack,
  FormLabel,
  Input,
  FormErrorMessage,
  Box,
  Avatar,
  useToast,
  Checkbox,
  // InputRightElement,
} from '@chakra-ui/react';
import { Form, Formik, Field } from 'formik';
import { useRouter } from 'next/router';
// import Icon from '../Icon';
import { useState } from 'react';
import PropTypes from 'prop-types';
import validationSchema from './validationSchemas';
import { getStorageItem, setStorageItem } from '../../../utils';
import modifyEnv from '../../../../modifyEnv';
import NextChakraLink from '../NextChakraLink';
import ModalInfo from '../../../js_modules/moduleMap/modalInfo';
import Text from '../Text';
import { SILENT_CODE } from '../../../lib/types';
import bc from '../../services/breathecode';
import useSession from '../../hooks/useSession';
import { usePersistent } from '../../hooks/usePersistent';
import useSubscribeToPlan from '../../hooks/useSubscribeToPlan';
import { BASE_PLAN } from '../../../utils/variables';

function Register({ setIsLoggedFromRegister }) {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const { userSession } = useSession();
  const [cohortSession] = usePersistent('cohortSession', {});
  const { t } = useTranslation('login');
  const [showAlreadyMember, setShowAlreadyMember] = useState(false);
  const { handleSubscribeToPlan, successModal } = useSubscribeToPlan({ enableRedirectOnCTA: true });
  const [verifyEmailProps, setVerifyEmailProps] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const accessToken = getStorageItem('accessToken');
  const toast = useToast();
  // const [showPSW, setShowPSW] = useState(false);
  // const [showRepeatPSW, setShowRepeatPSW] = useState(false);

  const router = useRouter();

  // const toggleShowRepeatPSW = () => setShowRepeatPSW(!showRepeatPSW);
  // const toggleShowPSW = () => setShowPSW(!showPSW);

  return (
    <>
      {successModal}
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
        forceHandler={accessToken}
        closeButtonVariant="outline"
        disableCloseButton={accessToken}
        closeButtonStyles={{ borderRadius: '3px', color: '#0097CD', borderColor: '#0097CD' }}
        buttonHandlerStyles={accessToken ? { variant: 'outline', borderRadius: '3px', color: '#0097CD', borderColor: '#0097CD' } : { variant: 'default' }}
        actionHandler={() => {
          if (accessToken) {
            router.push({
              pathname: '/checkout',
              query: {
                plan: 'basic',
              },
            });
          } else {
            router.push('/login');
            setShowAlreadyMember(false);
          }
        }}
        handlerText={accessToken ? t('common:close') : t('common:login')}
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
          setVerifyEmailProps({
            ...verifyEmailProps,
            state: false,
          });
        }}
      />
      <Formik
        initialValues={{
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          // dateOfBirth: '',
          // password: '',
          // passwordConfirmation: '',
        }}
        onSubmit={async (values, actions) => {
          const academy = cohortSession?.academy?.slug;
          const resp = await fetch(`${BREATHECODE_HOST}/v1/auth/subscribe/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept-Language': router?.locale || 'en',
            },
            body: JSON.stringify({
              ...values,
              plan: '4geeks-standard',
              conversion_info: {
                ...userSession,
                location: academy,
              },
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
            setIsLoggedFromRegister(true);

            handleSubscribeToPlan({
              slug: BASE_PLAN,
              accessToken: data?.access_token,
            })
              .finally(() => {
                setVerifyEmailProps({
                  data: {
                    ...values,
                    ...data,
                  },
                  state: true,
                });
              });
            router.push({
              query: {
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
        }}
        validationSchema={validationSchema.register}
      >
        {({ isSubmitting }) => (
          <Form>
            <Stack spacing={6}>
              <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="25px">
                <Field name="first_name">
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.first_name && form.touched.first_name}>
                      <FormLabel
                        margin="0px"
                        color="gray.default"
                        fontSize="sm"
                        float="left"
                        htmlFor="first_name"
                      >
                        {t('common:first-name')}
                      </FormLabel>
                      <Input
                        {...field}
                        type="text"
                        placeholder={t('common:first-name')}
                        height="50px"
                        borderColor="gray.default"
                        borderRadius="3px"
                      />
                      <FormErrorMessage>{form.errors.first_name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="last_name">
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.last_name && form.touched.last_name}>
                      <FormLabel
                        margin="0px"
                        color="gray.default"
                        fontSize="sm"
                        float="left"
                        htmlFor="lest_name"
                      >
                        {t('common:last-name')}
                      </FormLabel>
                      <Input
                        {...field}
                        type="text"
                        placeholder={t('common:last-name')}
                        height="50px"
                        borderColor="gray.default"
                        borderRadius="3px"
                      />
                      <FormErrorMessage>{form.errors.last_name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </Box>

              <Field name="phone">
                {({ field, form }) => (
                  <FormControl isInvalid={form.errors.phone && form.touched.phone}>
                    <FormLabel
                      margin="0px"
                      color="gray.default"
                      fontSize="sm"
                      float="left"
                      htmlFor="phone"
                    >
                      {t('common:phone')}
                    </FormLabel>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="+123 4567 8900"
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <Text size="12px" color="blue.default">
                      {t('signup:phone-info')}
                    </Text>
                    <FormErrorMessage>{form.errors.phone}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Field name="email">
                {({ field, form }) => (
                  <FormControl isInvalid={form.errors.email && form.touched.email}>
                    <FormLabel
                      margin="0px"
                      color="gray.default"
                      fontSize="sm"
                      float="left"
                      htmlFor="email"
                    >
                      {t('common:email')}
                    </FormLabel>
                    <Input
                      {...field}
                      type="email"
                      placeholder="jhon.doe@gmail.com"
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              {/* <FormControl>
                <FormLabel margin="0px" color="gray.default" fontSize="sm" float="left">
                  Date of Birth
                </FormLabel>
                <Input
                  type="date"
                  placeholder="29 / 10 / 1990"
                  height="50px"
                  borderColor="gray.default"
                  borderRadius="3px"
                />
              </FormControl> */}

              {/* <Field name="password">
                {({ field, form }) => (
                  <FormControl isInvalid={form.errors.password && form.touched.password}>
                    <FormLabel
                      margin="0px"
                      color="gray.default"
                      fontSize="sm"
                      float="left"
                      htmlFor="password"
                    >
                      Password
                    </FormLabel>
                    <Input
                      {...field}
                      type={showPSW ? 'text' : 'password'}
                      placeholder="***********"
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <InputRightElement width="2.5rem" top="33.5px" right="10px">
                      <Button
                        background="transparent"
                        width="100%"
                        height="100%"
                        padding="0"
                        onClick={toggleShowPSW}
                        _hover={{
                          background: 'transparent',
                        }}
                        _active={{
                          background: 'transparent',
                        }}
                      >
                        {showPSW ? (
                          <Icon icon="eyeOpen" color="#A4A4A4" width="24px" height="24px" />
                        ) : (
                          <Icon icon="eyeClosed" color="#A4A4A4" width="24px" height="24px" />
                        )}
                      </Button>
                    </InputRightElement>
                    <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="passwordConfirmation">
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.passwordConfirmation && form.touched.passwordConfirmation}
                  >
                    <FormLabel
                      margin="0px"
                      color="gray.default"
                      fontSize="sm"
                      htmlFor="repeatPassword"
                    >
                      Repeat Password
                    </FormLabel>
                    <Input
                      {...field}
                      type={showRepeatPSW ? 'text' : 'password'}
                      placeholder="***********"
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <InputRightElement width="2.5rem" top="33.5px" right="10px">
                      <Button
                        background="transparent"
                        width="100%"
                        height="100%"
                        padding="0"
                        onClick={toggleShowRepeatPSW}
                        _hover={{
                          background: 'transparent',
                        }}
                        _active={{
                          background: 'transparent',
                        }}
                      >
                        {showRepeatPSW ? (
                          <Icon icon="eyeOpen" color="#A4A4A4" width="24px" height="24px" />
                        ) : (
                          <Icon icon="eyeClosed" color="#A4A4A4" width="24px" height="24px" />
                        )}
                      </Button>
                    </InputRightElement>
                    <FormErrorMessage>{form.errors.passwordConfirmation}</FormErrorMessage>
                  </FormControl>
                )}
              </Field> */}

              <Checkbox size="md" spacing="8px" colorScheme="green" isChecked={isChecked} onChange={() => setIsChecked(!isChecked)}>
                <Text size="10px">
                  {t('signup:validators.termns-and-conditions-required')}
                  {' '}
                  <NextChakraLink variant="default" fontSize="10px" href="/privacy-policy" target="_blank">
                    {t('common:privacy-policy')}
                  </NextChakraLink>
                </Text>
              </Checkbox>

              <Button
                variant="default"
                fontSize="l"
                isLoading={isSubmitting}
                type="submit"
                isDisabled={isChecked === false}
              >
                {t('register')}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </>
  );
}

Register.propTypes = {
  setIsLoggedFromRegister: PropTypes.func,
};
Register.defaultProps = {
  setIsLoggedFromRegister: () => {},
};

export default Register;
