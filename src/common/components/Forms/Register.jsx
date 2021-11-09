import React from 'react';
import {
  Button,
  FormControl,
  Stack,
  FormLabel,
  Input,
  FormErrorMessage,
} from '@chakra-ui/react';
import { Form, Formik, Field } from 'formik';

function Register() {
  function validateEmail(value) {
    let error;
    if (!value) {
      error = 'Required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      error = 'Invalid email address';
    }
    return error;
  }

  function validateName(value) {
    let error;
    if (!value) {
      error = 'Required';
    }
    // else if () {
    //   error = "Invalid Name";
    // }
    return error;
  }

  function validatePassword(value) {
    let error;
    if (!value) {
      error = 'Required';
    }
    // else if () {
    //   error = "Invalid Password";
    // }
    return error;
  }

  function validateConfirmPassword(password, repeatPassword) {
    let error = 'Password Required';
    if (repeatPassword !== password) {
      error = 'Password not matched';
    }
    return error;
  }

  return (
    <Formik
      initialValues={{
        name: '',
        email: '',
        dateOfBirth: '',
        password: '',
        repeatPasword: '',
      }}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          actions.setSubmitting(false);
        }, 1000);
      }}
    >
      {(props) => (
        <Form>
          <Stack spacing={6}>
            <Field name="name" validate={(value) => validateName(value)}>
              {({ field, form }) => (
                <FormControl
                  isInvalid={form.errors.name && form.touched.name}
                >
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
                    id="name"
                    type="name"
                    placeholder="Andrea Castillo"
                    height="50px"
                    borderColor="gray.default"
                    borderRadius="3px"
                  />
                  <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                </FormControl>
              )}
            </Field>

            <Field name="email" validate={(value) => validateEmail(value)}>
              {({ field, form }) => (
                <FormControl
                  isInvalid={form.errors.email && form.touched.email}
                >
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
                    id="email"
                    type="email"
                    placeholder="Andrea@4geeks.co"
                    height="50px"
                    borderColor="gray.default"
                    borderRadius="3px"
                  />
                  <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                </FormControl>
              )}
            </Field>

            <FormControl>
              <FormLabel
                margin="0px"
                color="gray.default"
                fontSize="sm"
                float="left"
              >
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
            <Field name="password" validate={(value) => validatePassword(value)}>
              {({ field, form }) => (
                <FormControl
                  isInvalid={form.errors.password && form.touched.password}
                >
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
                    id="password"
                    type="password"
                    placeholder="***********"
                    height="50px"
                    borderColor="gray.default"
                    borderRadius="3px"
                  />
                  <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                </FormControl>
              )}
            </Field>

            <Field name="repeatPassword" validate={(value) => validateConfirmPassword(value, props.password)}>
              {({ field, form }) => (
                <FormControl
                  isInvalid={form.errors.password && form.touched.password}
                >
                  <FormLabel
                    margin="0px"
                    color="gray.default"
                    fontSize="sm"
                    htmlFor="password"
                  >
                    Repeat Password
                  </FormLabel>
                  <Input
                    {...field}
                    id="password_confirm"
                    type="password"
                    placeholder="***********"
                    height="50px"
                    borderColor="gray.default"
                    borderRadius="3px"
                  />
                  <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                </FormControl>
              )}
            </Field>

            <Button
              variant="default"
              fontSize="l"
              // isLoading={props.isSubmitting}
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
