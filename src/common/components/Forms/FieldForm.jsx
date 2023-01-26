import PropTypes from 'prop-types';
import { Field } from 'formik';
import {
  Box, FormControl, FormLabel, Input, Textarea,
} from '@chakra-ui/react';
import useStyle from '../../hooks/useStyle';
import FileInput from './FileInput';

const FieldForm = ({
  type, name, label, placeholder, formProps, setFormProps, style, withLabel, pattern, handleOnChange, externValue, onClick,
  acceptedFiles, maxFileSize, multipleFiles, fileProps, setFileProps, setFieldValue, translation, required, hint, maxLength,
  spellcheck,
}) => {
  const { input } = useStyle();
  const inputBorderColor = input.borderColor;

  return (
    <Field name={name}>
      {({ field, form }) => {
        const inputLength = field?.value?.length;

        return (
          (
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
                <Box position="relative">
                  <Textarea
                    {...field}
                    className="hideOverflowX__"
                    spellcheck={spellcheck ? 'true' : 'false'}
                    value={externValue || field.value}
                    type={type}
                    onClick={onClick}
                    onChange={(e) => {
                      if (maxLength > 0 && e.target.value.length > maxLength) {
                        e.preventDefault();
                      } else {
                        setFormProps({ ...formProps, [name]: e.target.value });
                        handleOnChange(e);
                        field.onChange(e);
                      }
                      // if input exceeds max length, prevent input
                    }}
                    pattern={pattern > 0 ? pattern : null}
                    placeholder={withLabel ? placeholder : `${required ? `${label}*` : label}`}
                    height="180px"
                    borderColor={inputBorderColor}
                    borderRadius="3px"
                    flex={0.5}
                  />
                  {maxLength > 0 && (
                    <Box position="absolute" color={inputBorderColor} bottom="6px" right={3}>
                      {`${inputLength || 0}/${maxLength}`}
                    </Box>
                  )}
                </Box>
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
                  required={required}
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
                  placeholder={withLabel ? placeholder : `${required ? `${label}*` : label}`}
                  height="50px"
                  borderColor={inputBorderColor}
                  borderRadius="3px"
                  flex={0.5}
                />
              )}
              {hint && !form.errors[name] && (
                <Box fontSize="sm" mt={2}>{hint}</Box>
              )}
              {form.errors[name] && (
                <Box className="error-message">{form.errors[name]}</Box>
              )}
            </FormControl>
          )
        );
      }}
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
  required: PropTypes.bool,
  hint: PropTypes.string,
  spellcheck: PropTypes.bool,
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
  required: false,
  hint: '',
  spellcheck: false,
};

export default FieldForm;
