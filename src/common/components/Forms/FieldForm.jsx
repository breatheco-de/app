import PropTypes from 'prop-types';
import { Field } from 'formik';
import {
  Box, FormControl, FormLabel, Input, Textarea,
} from '@chakra-ui/react';
import useStyle from '../../hooks/useStyle';
import FileInput from './FileInput';

const FieldForm = ({
  type, name, label, placeholder, formProps, setFormProps, style, withLabel, pattern, handleOnChange, externValue, onClick,
  acceptedFiles, maxFileSize, multipleFiles, fileProps, setFileProps, setFieldValue, translation,
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
          {type === 'textarea' && (
            <Textarea
              {...field}
              value={externValue || field.value}
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
          )}
          {type === 'file' && (
            <FileInput
              name={name}
              formProps={formProps}
              setFormProps={setFormProps}
              handleOnChange={handleOnChange}
              acceptedFiles={acceptedFiles}
              maxFileSize={maxFileSize}
              multipleFiles={multipleFiles}
              fileProps={fileProps}
              setFileProps={setFileProps}
              setFieldValue={setFieldValue}
              form={form}
              field={field}
              translation={translation}
            />
          )}
          {type !== 'textarea' && type !== 'file' && (
            <Input
              {...field}
              value={externValue || field.value}
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
          )}
          <Box className="error-message">{form.errors[name]}</Box>
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
  acceptedFiles: PropTypes.string,
  maxFileSize: PropTypes.number,
  multipleFiles: PropTypes.bool,
  fileProps: PropTypes.arrayOf(PropTypes.any),
  setFileProps: PropTypes.func,
  setFieldValue: PropTypes.func,
  translation: PropTypes.objectOf(PropTypes.any),
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
  acceptedFiles: '*',
  maxFileSize: 1000000, // 1mb
  multipleFiles: false,
  fileProps: [],
  setFileProps: () => {},
  setFieldValue: () => {},
  translation: {},
};

export default FieldForm;
