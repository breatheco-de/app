import React from 'react';
import { Field, useField, useFormikContext } from 'formik';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FormControl, FormErrorMessage } from '@chakra-ui/react';

function DatePickerField({ onChange, style, ...props }) {
  const { setFieldValue } = useFormikContext();
  const [field] = useField(props);

  return (
    <Field name={field.name}>
      {({ form }) => (
        <FormControl style={style} isInvalid={form.errors[field.name] && form.touched[field.name]}>
          <DatePicker
            {...field}
            {...props}
            selected={(field.value && new Date(field.value)) || null}
            onChange={(val) => {
              onChange(val);
              setFieldValue(field.name, val || '');
            }}
          />
          <FormErrorMessage>{form.errors[field.name]}</FormErrorMessage>
        </FormControl>
      )}
    </Field>
  );
}

DatePickerField.propTypes = {
  onChange: PropTypes.func,
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

DatePickerField.defaultProps = {
  onChange: () => {},
  style: {},
};

export default DatePickerField;
