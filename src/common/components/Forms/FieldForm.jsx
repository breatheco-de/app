import PropTypes from 'prop-types';
import { Field } from 'formik';
import {
  FormControl, FormErrorMessage, FormLabel, Input,
} from '@chakra-ui/react';
import useStyle from '../../hooks/useStyle';

const FieldForm = ({
  type, name, label, placeholder, formProps, setFormProps, style, withLabel, pattern, handleOnChange, externValue, onClick,
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
            value={externValue || field.value}
            // defaultValue={defaultValue}
            type={type}
            onClick={onClick}
            onChange={(e) => {
              setFormProps({ ...formProps, [name]: e.target.value });
              handleOnChange(e);
              field.onChange(e);
            }}
            pattern={pattern > 0 ? pattern : null}
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
  pattern: PropTypes.string,
  handleOnChange: PropTypes.func,
  maxLength: PropTypes.number,
  externValue: PropTypes.string,
  onClick: PropTypes.func,
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
  pattern: '',
  handleOnChange: () => {},
  maxLength: 0,
  externValue: '',
  onClick: () => {},
};

export default FieldForm;
