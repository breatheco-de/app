import React from 'react';
import {
  Button,
  FormControl,
  Stack,
  Text,
  Box,
  Input,
  FormErrorMessage,
  FormLabel,
} from '@chakra-ui/react';
import { Form, Formik, Field } from 'formik';
import Icon from '../Icon/index';

function LogIn() {
  function validateEmail(value) {
    let error;
    if (!value) {
      error = 'Required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      error = 'Invalid email address';
    }
    return error;
  }

  return (
    <Formik
      initialValues={{
        email: '',
      }}
      onSubmit={({ values, actions }) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          actions.setSubmitting(false);
        }, 1000);
      }}
    >
      {() => (
        <Form>
          <Stack spacing={6} justifyContent="space-between">
            <Button cursor="pointer" variant="outline" weight="700">
              <Icon icon="github" width="18px" height="18px" />
              <Text fontSize="13px" marginLeft="10px">
                LOG IN WITH GITHUB
              </Text>
            </Button>
            <Box display="flex" justifyContent="center" width="100%">
              <Box
                borderBottom="solid 1px #DADADA"
                width="165px"
                marginRight="13px"
                marginBottom="9px"
              />
              <Box color="gray.default">or</Box>
              <Box
                borderBottom="solid 1px #DADADA"
                width="165px"
                marginLeft="14px"
                marginBottom="9px"
              />
            </Box>
            <Field name="email" validate={() => validateEmail()}>
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
            <FormControl id="password" borderRadius="3px">
              <Input
                type="password"
                placeholder="Password"
                height="50px"
                borderColor="gray.default"
                borderRadius="3px"
              />
            </FormControl>
            <Box margin="0px" color="blue.default" fontWeight="700" align="right">
              Reset Password
            </Box>
            <Button disabled="" variant="default" fontSize="l">
              LOGIN
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

export default LogIn;
