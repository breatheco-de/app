import React, { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Button, FormControl, Stack, Text, Box, Input, FormErrorMessage,
  FormLabel, useToast, Link, Spacer, Flex, InputRightElement, InputGroup,
} from '@chakra-ui/react';
import { Form, Formik, Field } from 'formik';
// import { useRouter } from 'next/router';
import Icon from '../Icon/index';
import validationSchema from './validationSchemas';
import useAuth from '../../hooks/useAuth';
import useStyle from '../../hooks/useStyle';
import modifyEnv from '../../../../modifyEnv';

function LogIn() {
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
        login(values)
          .then((data) => {
            if (data.status === 200) {
              actions.setSubmitting(false);
              toast({
                title: t('alert-message:welcome'),
                // description: t('alert-message:select-program'),
                status: 'success',
                duration: 9000,
                isClosable: true,
              });
            }
          })
          .catch(() => {
            actions.setSubmitting(false);
            toast({
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
            <Button as="a" href={githubLoginUrl} cursor="pointer" variant="outline" weight="700">
              <Icon icon="github" width="18px" height="18px" />
              <Text fontSize="13px" marginLeft="10px" textTransform="uppercase">
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
              <Box color="gray.default">{t('or')}</Box>
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
                    placeholder="email@example.co"
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
                  <FormLabel
                    margin="0px"
                    color="gray.default"
                    fontSize="sm"
                    float="left"
                    htmlFor="password"
                  >
                    {t('common:password')}
                  </FormLabel>
                  <InputGroup>
                    <Input
                      {...field}
                      id="current-password"
                      autoComplete="current-password"
                      type={showPSW ? 'text' : 'password'}
                      placeholder="***********"
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
                target="_blank"
                rel="noopener noreferrer"
                href={`${BREATHECODE_HOST}/v1/auth/password/reset?url=${curUrl}`}
              >
                {t('forgot-password')}
              </Link>
            </Flex>
            <Button variant="default" fontSize="l" isLoading={isSubmitting} type="submit">
              {t('login')}
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

export default LogIn;
