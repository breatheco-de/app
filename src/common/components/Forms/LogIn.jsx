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
import PropTypes from 'prop-types';
import Icon from '../Icon/index';
import useAuth from '../../hooks/useAuth';

const regex = {
  email:
    /^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@(?!mailinator|leonvero|ichkoch|naymeo|naymio)[a-zA-Z0-9]*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,
};
function LogIn() {
  // eslint-disable-next-line no-unused-vars
  const { login } = useAuth();

  const validator = (value) => {
    let error;
    if (!value) {
      error = 'Email is required';
    } else if (!regex.email.test(value)) {
      error = 'Invalid email address';
    }
    return error;
  };

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
      }}
      onSubmit={async (values, actions) => {
        console.log('EMAIL', values.email);
        console.log('PASSWORD', values.password);
        try {
          await login(values.email, values.password);
          // history.push('/');
          actions.setSubmitting(false);
        } catch (e) {
          console.log(e);
          actions.setSubmitting(false);
          // setMessage(e.message);
          // setLoading(false);
        }

        // setTimeout(() => {
        //   alert(JSON.stringify(values, null, 2));
        actions.setSubmitting(false);
        // }, 1000);
      }}
    >
      {(props) => {
        const { isSubmitting } = props;
        return (
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
              <Field name="email" validate={validator}>
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
                      id="email"
                      type="email"
                      placeholder="Andrea@4geeks.co"
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              {/* <FormControl id="password" borderRadius="3px">
              <Input
                type="password"
                placeholder="Password"
                height="50px"
                borderColor="gray.default"
                borderRadius="3px"
              />
            </FormControl> */}

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
                      id="password"
                      type="password"
                      placeholder="Password"
                      height="50px"
                      borderColor="gray.default"
                      borderRadius="3px"
                    />
                    <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Box margin="0px" color="blue.default" fontWeight="700" align="right">
                Reset Password
              </Box>
              <Button
                type="submit"
                isLoading={isSubmitting}
                variant="default"
                fontSize="l"
                textTransform="uppercase"
              >
                Login
              </Button>
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
}

LogIn.propTypes = {
  isSubmitting: PropTypes.bool,
};

LogIn.defaultProps = {
  isSubmitting: false,
};

export default LogIn;
