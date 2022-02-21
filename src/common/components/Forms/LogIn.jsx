import React, { useEffect, useState } from 'react';
import {
  Button,
  FormControl,
  Stack,
  Text,
  Box,
  Input,
  FormErrorMessage,
  FormLabel,
  useToast,
  Link,
  Spacer,
  Flex,
} from '@chakra-ui/react';
import { Form, Formik, Field } from 'formik';
import { useRouter } from 'next/router';
import Icon from '../Icon/index';
import validationSchema from './validationSchemas';
import useAuth from '../../hooks/useAuth';

function LogIn() {
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [curUrl, setUrl] = useState('');
  useEffect(() => setUrl(typeof window !== 'undefined' ? window.location.href : ''), []);

  const githubLoginUrl = (typeof window !== 'undefined')
    ? `${process.env.BREATHECODE_HOST}/v1/auth/github?url=${curUrl}`
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
                title: 'Welcome to 4Geeks',
                description: 'Select a program',
                status: 'success',
                duration: 9000,
                isClosable: true,
              });
              router.push('/choose-program');
            }
          })
          .catch((error) => {
            actions.setSubmitting(false);
            toast({
              title: 'There was an error',
              description: error.message,
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
              <Text fontSize="13px" marginLeft="10px">
                LOG IN WITH GITHUB
              </Text>
            </Button>
            <Box display="flex" justifyContent="center" width="100%">
              <Box
                borderBottom="solid 1px #DADADA"
                width="100%"
                marginRight="13px"
                marginBottom="9px"
              />
              <Box color="gray.default">or</Box>
              <Box
                borderBottom="solid 1px #DADADA"
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
                    Email
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
                    Password
                  </FormLabel>
                  <Input
                    {...field}
                    type="password"
                    placeholder="***********"
                    height="50px"
                    borderColor="gray.default"
                    borderRadius="3px"
                  />
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
                href={`${process.env.BREATHECODE_HOST}/v1/auth/password/reset?url=${curUrl}`}
              >
                Reset Password
              </Link>
            </Flex>
            <Button variant="default" fontSize="l" isLoading={isSubmitting} type="submit">
              LOGIN
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

export default LogIn;
