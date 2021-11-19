import React from 'react';
import {
  Button,
  FormControl,
  Stack,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';
import { Form, Formik, Field } from 'formik';
import { useRouter } from 'next/router';
import validationSchema from './validationSchemas';
import useAuth from '../../hooks/useAuth';

function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const toast = useToast();
  return (
    <Formik
      initialValues={{
        name: '',
        email: '',
        dateOfBirth: '',
        password: '',
        passwordConfirmation: '',
      }}
      onSubmit={(values, actions) => {
        register(values).then((data) => {
          if (data.status === 200) {
            actions.setSubmitting(false);
            toast({
              title: 'Welcome',
              description: 'Find everything in the dashboard',
              status: 'success',
              duration: 9000,
              isClosable: true,
            });
            router.push('/choose-program');
          }
        }).catch((error) => {
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
      validationSchema={validationSchema.register}
    >
      {({ isSubmitting }) => (
        <Form>
          <Stack spacing={6}>
            <Field name="name">
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.name && form.touched.name}>
                  <FormLabel
                    margin="0px"
                    color="gray.default"
                    fontSize="sm"
                    float="left"
                    htmlFor="name"
                  >
                    Full Name
                  </FormLabel>
                  <Input
                    {...field}
                    type="name"
                    placeholder="Name"
                    height="50px"
                    borderColor="gray.default"
                    borderRadius="3px"
                  />
                  <FormErrorMessage>{form.errors.name}</FormErrorMessage>
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
                    Email
                  </FormLabel>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Email"
                    height="50px"
                    borderColor="gray.default"
                    borderRadius="3px"
                  />
                  <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                </FormControl>
              )}
            </Field>

            <FormControl>
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
            </FormControl>
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
                    type="password"
                    placeholder="***********"
                    height="50px"
                    borderColor="gray.default"
                    borderRadius="3px"
                  />
                  <FormErrorMessage>{form.errors.passwordConfirmation}</FormErrorMessage>
                </FormControl>
              )}
            </Field>

            <Button
              variant="default"
              fontSize="l"
              isLoading={isSubmitting}
              type="submit"
            >
              REGISTER
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

export default Register;
