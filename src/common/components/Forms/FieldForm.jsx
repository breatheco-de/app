import PropTypes from 'prop-types';
import { Field } from 'formik';
import {
  FormControl, FormErrorMessage, FormLabel, Input,
} from '@chakra-ui/react';
import useStyle from '../../hooks/useStyle';

const FieldForm = ({
  // eslint-disable-next-line no-unused-vars
  type, name, label, placeholder, formProps, setFormProps, style, withLabel,
}) => {
  const { input } = useStyle();
  const inputBorderColor = input.borderColor;

  return (
    <Field name={name}>
      {({ field, form }) => (
        <FormControl style={style} isInvalid={form.errors[name] && form.touched[name]}>
          {withLabel && (
            <FormLabel
              margin="0px"
              color="gray.default"
              fontSize="sm"
              float="left"
              htmlFor={name}
            >
              {label}
            </FormLabel>
          )}
          <Input
            {...field}
            type={type}
            onChange={(e) => {
              setFormProps({ ...formProps, [name]: e.target.value });
              field.onChange(e);
            }}
            placeholder={withLabel ? placeholder : label}
            height="50px"
            borderColor={inputBorderColor}
            borderRadius="3px"
            flex={0.5}
          />
          <FormErrorMessage>{form.errors[name]}</FormErrorMessage>
        </FormControl>
      )}
    </Field>
  );
};

FieldForm.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  formProps: PropTypes.objectOf(PropTypes.any),
  setFormProps: PropTypes.func,
  style: PropTypes.objectOf(PropTypes.any),
  withLabel: PropTypes.bool,
};

FieldForm.defaultProps = {
  type: 'text',
  name: 'firstName',
  label: 'First Name',
  placeholder: 'Jhon',
  formProps: {},
  setFormProps: () => {},
  style: {},
  withLabel: false,
};

export default FieldForm;
