import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Button, FormControl, Stack, Box, Input, FormErrorMessage,
  FormLabel, useToast, Link, Spacer, Flex, InputRightElement, InputGroup,
} from '@chakra-ui/react';
import { Form, Formik, Field } from 'formik';
import { useRouter } from 'next/router';
import { reportDatalayer } from '../../../utils/requests';
import bc from '../../services/breathecode';
import Icon from '../Icon';
import Text from '../Text';
import validationSchema from './validationSchemas';
import useAuth from '../../hooks/useAuth';
import useStyle from '../../hooks/useStyle';
import { BREATHECODE_HOST } from '../../../utils/variables';
import { getBrowserInfo } from '../../../utils';
import { email as emailRe } from '../../../utils/regex';

function LogIn({ hideLabel, actionfontSize, callBack, disableRedirect }) {
  const { t, lang } = useTranslation('login');
  const router = useRouter();
  const { query } = router;
  const [emailValidation, setEmailValidation] = useState({
    valid: false,
    loading: false,
    error: null,
    status: null,
  });
  const [showPSW, setShowPSW] = useState(false);
  const [googleError, setGoogleError] = useState(false);
  const [step, setStep] = useState(1);

  const { login } = useAuth();
  const toast = useToast();
  const [curUrl, setUrl] = useState('');
  const [invitationSent, setInvitationSent] = useState(false);
  useEffect(() => setUrl(typeof window !== 'undefined' ? window.location.href : ''), []);
  const { hexColor, borderColor } = useStyle();

  const githubLoginUrl = (typeof window !== 'undefined')
    ? `${BREATHECODE_HOST}/v1/auth/github?url=${curUrl}`
    : '#';

  const googleLoginUrl = (typeof window !== 'undefined')
    ? `${BREATHECODE_HOST}/v1/auth/google?url=${curUrl}`
    : '#';

  useEffect(() => {
    const { error, ...queryParams } = query;
    if (error === 'google-user-not-found') {
      setGoogleError(true);
      router.push({ ...queryParams });
    }
  }, [query]);

  const validateEmail = async (email) => {
    try {
      setEmailValidation({
        valid: false,
        loading: true,
        error: null,
        status: null,
      });

      const response = await bc.auth().verifyEmail(email, lang);

      if (response.status && response.status >= 400) {
        const result = await response.json();
        setEmailValidation({
          valid: false,
          loading: false,
          error: result.detail,
          status: response.status,
        });
      } else {
        setEmailValidation({
          valid: true,
          loading: false,
          error: null,
          status: response.status,
        });
        setStep(2);
      }
    } catch (e) {
      console.log(e);
      setEmailValidation({
        valid: false,
        loading: false,
        error: typeof e === 'string' ? e : e.message,
        status: null,
      });
    }
  };

  const sendConfirmationLink = async (email) => {
    try {
      const resp = await bc.auth().resendConfirmationEmail(email);
      if (resp?.status === 200) {
        setInvitationSent(true);
        toast({
          position: 'top',
          title: t('invitation-sended'),
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
      } else {
        const { data } = resp;
        toast({
          position: 'top',
          title: data.detail,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (e) {
      console.log(e);
      toast({
        position: 'top',
        title: t('invitation-error'),
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
      }}
      onSubmit={(values, actions) => {
        login(values, disableRedirect)
          .then((data) => {
            actions.setSubmitting(false);
            callBack();
            if (data.status === 200) {
              toast({
                position: 'top',
                title: t('alert-message:welcome'),
                status: 'success',
                duration: 9000,
                isClosable: true,
              });
            }
          })
          .catch(() => {
            actions.setSubmitting(false);
            toast({
              position: 'top',
              title: t('alert-message:account-not-found'),
              status: 'error',
              duration: 9000,
              isClosable: true,
            });
          });
      }}
      validationSchema={validationSchema.login}
    >
      {({ isSubmitting, values, errors, setFieldTouched }) => (
        <Form>
          {/* FIRST STEP */}
          <Stack display={step !== 1 && 'none'} spacing={4} justifyContent="space-between">
            {googleError && (
              <Box padding="5px" borderRadius="5px" border="1px solid" borderColor={hexColor.danger} background="red.light">
                <Text color={hexColor.danger} textAlign="center" dangerouslySetInnerHTML={{ __html: t('google-login-error') }} />
              </Box>
            )}
            <Button
              as="a"
              href={googleLoginUrl}
              cursor="pointer"
              variant="outline"
              weight="700"
              width="100%"
              onClick={() => {
                reportDatalayer({
                  dataLayer: {
                    event: 'login',
                    path: '/login',
                    method: 'google',
                    agent: getBrowserInfo(),
                  },
                });
              }}
            >
              <Icon icon="google" width="18px" height="18px" />
              <Text as="span" size="md" marginLeft="10px" textTransform="uppercase">
                {t('login-with-google')}
              </Text>
            </Button>
            <Button
              as="a"
              href={githubLoginUrl}
              cursor="pointer"
              variant="outline"
              weight="700"
              width="100%"
              onClick={() => {
                reportDatalayer({
                  dataLayer: {
                    event: 'login',
                    path: '/login',
                    method: 'github',
                    agent: getBrowserInfo(),
                  },
                });
              }}
            >
              <Icon icon="github" width="18px" height="18px" />
              <Text as="span" size="md" marginLeft="10px" textTransform="uppercase">
                {t('login-with-github')}
              </Text>
            </Button>
            <Box display="flex" justifyContent="center" width="100%">
              <Box
                borderBottom="solid 1px"
                borderColor={borderColor}
                width="100%"
                marginRight="13px"
                marginBottom="9px"
              />
              <Box color="gray.default">{t('common:word-connector.or')}</Box>
              <Box
                borderBottom="solid 1px"
                borderColor={borderColor}
                width="100%"
                marginLeft="14px"
                marginBottom="9px"
              />
            </Box>
            <Field name="email" autoComplete="email">
              {({ field, form }) => (
                <FormControl
                  isInvalid={form.errors.email && form.touched.email}
                  onChange={() => {
                    setEmailValidation({
                      valid: false,
                      loading: false,
                      error: null,
                      status: null,
                    });
                  }}
                >
                  {!hideLabel && (
                    <FormLabel
                      margin="0px"
                      color="gray.default"
                      fontSize="sm"
                      float="left"
                      htmlFor="email"
                    >
                      {t('common:email')}
                    </FormLabel>
                  )}
                  <Input
                    {...field}
                    type="email"
                    id="email"
                    autoComplete="email"
                    placeholder={hideLabel ? t('common:email') : 'email@example.co'}
                    height="50px"
                    borderColor="gray.default"
                    borderRadius="3px"
                  />
                  <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            {emailValidation.error && !invitationSent && (
              <Text marginTop="5px !important" color={hexColor.danger}>
                {emailValidation.error}
                {emailValidation.status === 403 && (
                  <>
                    ,
                    {'  '}
                    <Button textDecoration="underline" padding="0" color={hexColor.danger} variant="link" onClick={() => sendConfirmationLink(values.email)}>
                      {t('validation-link')}
                    </Button>
                  </>
                )}
              </Text>
            )}
            {!invitationSent ? (
              <Button
                onClick={() => {
                  const validate = values.email.match(emailRe);
                  if (validate) validateEmail(values.email);
                  else setFieldTouched('email', true, true);
                }}
                width="100%"
                isLoading={emailValidation.loading}
                isDisabled={errors.email}
                variant="default"
                fontSize={actionfontSize || 'l'}
                type="button"
              >
                {t('next')}
              </Button>
            ) : (
              <Box padding="5px" borderRadius="5px" background={hexColor.featuredColor}>
                <Text size="md" marginLeft="10px">
                  {t('invitation-message')}
                </Text>
              </Box>
            )}
          </Stack>
          {/* SECOND STEP */}
          <Stack display={step !== 2 && 'none'} spacing={4} justifyContent="space-between">
            <Text textAlign="left">
              <Button size="xs" onClick={() => setStep(1)} variant="link">
                ←
                {'  '}
                {t('common:go-back')}
              </Button>
            </Text>
            <Text size="md" textAlign="center">
              {t('welcome', { email: values.email })}
            </Text>
            <Field name="password">
              {({ field, form }) => (
                <FormControl marginTop="4px !important" isInvalid={form.errors.password && form.touched.password}>
                  {!hideLabel && (
                    <FormLabel
                      margin="0px"
                      color="gray.default"
                      fontSize="sm"
                      float="left"
                      htmlFor="password"
                    >
                      {t('common:password')}
                    </FormLabel>
                  )}
                  <InputGroup>
                    <Input
                      {...field}
                      id="current-password"
                      autoComplete="current-password"
                      type={showPSW ? 'text' : 'password'}
                      placeholder={hideLabel ? t('common:password') : '***********'}
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <InputRightElement width="2.5rem" top="5px" right="10px">
                      <Button
                        background="transparent"
                        width="100%"
                        height="100%"
                        padding="0"
                        onClick={() => setShowPSW(!showPSW)}
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
                  </InputGroup>
                  <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Flex marginTop="1.5rem">
              <Spacer />
              <Link
                margin="0"
                color="blue.default"
                fontWeight="700"
                align="right"
                fontSize={actionfontSize}
                target="_blank"
                rel="noopener noreferrer"
                href={`${BREATHECODE_HOST}/v1/auth/password/reset?url=${curUrl}`}
              >
                {t('login:forgot-password')}
              </Link>
            </Flex>
            <Button width="100%" variant="default" fontSize={actionfontSize || 'l'} isLoading={isSubmitting} type="submit">
              {t('login:login')}
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

LogIn.propTypes = {
  hideLabel: PropTypes.bool,
  actionfontSize: PropTypes.string,
  disableRedirect: PropTypes.bool,
  callBack: PropTypes.func,
};
LogIn.defaultProps = {
  hideLabel: false,
  actionfontSize: '',
  disableRedirect: false,
  callBack: () => {},
};

export default LogIn;
