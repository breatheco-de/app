import {
  FormControl, Input, FormLabel, FormErrorMessage, Button,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';

const FormHandlerControl = () => {
  const validateName = (value) => {
    let error;
    if (!value) {
      error = 'Name is required';
    } else if (value.toLowerCase() !== 'naruto') {
      error = "Jeez! You're not a fan 😱";
    }
    return error;
  };

  return (
    <Formik
      initialValues={{ name: 'Sasuke' }}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          actions.setSubmitting(false);
        }, 1000);
      }}
    >
      {(props) => {
        const { isSubmitting } = props;
        return (
          <Form>
            <Field id="field923" name="name" validate={validateName}>
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.name && form.touched.name}>
                  <FormLabel id="formLabel2328" htmlFor="name">
                    First name
                  </FormLabel>
                  <Input {...field} id="name" placeholder="name" />
                  <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Button mt={4} colorScheme="teal" isLoading={isSubmitting} type="submit">
              Submit
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
};

FormHandlerControl.propTypes = {
  isSubmitting: PropTypes.bool,
};

FormHandlerControl.defaultProps = {
  isSubmitting: false,
};

export default FormHandlerControl;
