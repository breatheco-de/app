import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Button, FormControl, Stack, Text, Box, Input, FormErrorMessage,
  FormLabel, useToast, Link, Spacer, Flex, InputRightElement, InputGroup,
} from '@chakra-ui/react';
import { Form, Formik, Field } from 'formik';
import { reportDatalayer } from '../../../utils/requests';
// import { useRouter } from 'next/router';
import Icon from '../Icon/index';
import validationSchema from './validationSchemas';
import useAuth from '../../hooks/useAuth';
import useStyle from '../../hooks/useStyle';
import modifyEnv from '../../../../modifyEnv';

function LogIn({ hideLabel, actionfontSize, callBack, disableRedirect }) {
  const { t } = useTranslation('login');
  const [showPSW, setShowPSW] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  // const router = useRouter();
  const [curUrl, setUrl] = useState('');
  useEffect(() => setUrl(typeof window !== 'undefined' ? window.location.href : ''), []);
  const { borderColor } = useStyle();

  const githubLoginUrl = (typeof window !== 'undefined')
    ? `${BREATHECODE_HOST}/v1/auth/github?url=${curUrl}`
    : '#';

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
              // description: error.message,
              status: 'error',
              duration: 9000,
              isClosable: true,
            });
          });
      }}
      validationSchema={validationSchema.login}
    >
      {({ isSubmitting }) => (
        <Form>
          <Stack spacing={6} justifyContent="space-between">
            <Button
              as="a"
              href={githubLoginUrl}
              cursor="pointer"
              variant="outline"
              weight="700"
              onClick={() => {
                reportDatalayer({
                  dataLayer: {
                    event: 'login',
                    path: '/login',
                    method: 'github',
                  },
                });
              }}
            >
              <Icon icon="github" width="18px" height="18px" />
              <Text fontSize="13px" marginLeft="10px" textTransform="uppercase">
                {t('login:login-with-github')}
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
            <Field name="email">
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.email && form.touched.email}>
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
                    placeholder={hideLabel ? t('common:email') : 'email@example.co'}
                    height="50px"
                    borderColor="gray.default"
                    borderRadius="3px"
                  />
                  <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="password">
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.password && form.touched.password}>
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
            <Button variant="default" fontSize={actionfontSize || 'l'} isLoading={isSubmitting} type="submit">
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
