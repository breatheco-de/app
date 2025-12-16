import { Box, Textarea, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import useStyle from '../../hooks/useStyle';
import Heading from '../Heading';
import CustomText from '../Text';
import { languageFix } from '../../utils';

function OpenQuestion({ question, value, onChange, error }) {
  const { t, lang } = useTranslation('survey');
  const { fontColor2, input } = useStyle();
  const { max_length: maxLength } = question.config || {};
  const currentLength = value?.length || 0;

  return (
    <Box width="100%">
      <Heading size="sm" marginBottom="12px" color={fontColor2}>
        {languageFix(question.title, lang)}
        {question.required && <Text as="span" color="red.500" marginLeft="4px">*</Text>}
      </Heading>
      <Textarea
        value={value || ''}
        onChange={(e) => {
          const newValue = e.target.value;
          if (!maxLength || newValue.length <= maxLength) {
            onChange(newValue);
          }
        }}
        placeholder={languageFix(question.placeholder, lang) || ''}
        rows={4}
        borderColor={error ? 'red.500' : input.borderColor}
        _focus={{
          borderColor: error ? 'red.500' : 'blue.500',
          boxShadow: error ? '0 0 0 1px red.500' : '0 0 0 1px blue.500',
        }}
        resize="vertical"
      />
      {maxLength && (
        <CustomText size="12px" color={fontColor2} marginTop="4px" textAlign="right">
          {currentLength}
          {' / '}
          {maxLength}
          {' '}
          {currentLength === 1 ? t('character') : t('characters')}
        </CustomText>
      )}
      {error && (
        <Text size="12px" color="red.500" marginTop="8px">
          {error}
        </Text>
      )}
    </Box>
  );
}

OpenQuestion.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    required: PropTypes.bool,
    placeholder: PropTypes.string,
    config: PropTypes.shape({
      max_length: PropTypes.number, // eslint-disable-line camelcase
    }),
  }).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

OpenQuestion.defaultProps = {
  value: '',
  error: null,
};

export default OpenQuestion;
