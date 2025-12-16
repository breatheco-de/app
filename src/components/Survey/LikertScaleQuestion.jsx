import { Box, Flex, RadioGroup, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import useStyle from '../../hooks/useStyle';
import Heading from '../Heading';
import CustomText from '../Text';
import { languageFix } from '../../utils';

function LikertScaleQuestion({ question, value, onChange, error }) {
  const { borderColor, fontColor2 } = useStyle();
  const { lang } = useTranslation();
  const { scale, labels } = question.config || {};
  const scaleArray = Array.from({ length: scale || 5 }, (_, i) => i + 1);

  const getLabelForNumber = (num) => {
    if (!labels) return null;
    const labelsForLang = labels[lang] || labels.us || labels.en || labels;
    return labelsForLang?.[num] || null;
  };

  return (
    <Box width="100%">
      <Heading size="sm" marginBottom="16px" color={fontColor2}>
        {languageFix(question.title, lang)}
        {question.required && <Text as="span" color="red.500" marginLeft="4px">*</Text>}
      </Heading>
      <RadioGroup value={value?.toString()} onChange={(val) => onChange(parseInt(val, 10))}>
        <Flex
          direction="row"
          gap="8px"
          flexWrap="wrap"
          justifyContent="space-between"
        >
          {scaleArray.map((num) => (
            <Flex
              key={num}
              direction="column"
              alignItems="center"
              flex="1"
              minWidth="70px"
              maxWidth="100px"
              padding="12px 8px"
              borderRadius="8px"
              border="2px solid"
              borderColor={value === num ? 'blue.500' : borderColor}
              backgroundColor={value === num ? 'blue.50' : 'transparent'}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                borderColor: value === num ? 'blue.500' : 'blue.300',
                backgroundColor: value === num ? 'blue.50' : 'blue.25',
              }}
              onClick={() => onChange(num)}
            >
              <Text
                fontSize="24px"
                fontWeight="bold"
                color={value === num ? 'blue.600' : fontColor2}
                marginBottom={getLabelForNumber(num) ? '6px' : '0'}
              >
                {num}
              </Text>
              {getLabelForNumber(num) && (
                <CustomText
                  size="11px"
                  textAlign="center"
                  color={value === num ? 'blue.700' : fontColor2}
                  fontWeight={value === num ? '600' : '400'}
                  lineHeight="1.3"
                  wordBreak="break-word"
                >
                  {getLabelForNumber(num)}
                </CustomText>
              )}
            </Flex>
          ))}
        </Flex>
      </RadioGroup>
      {error && (
        <Text size="12px" color="red.500" marginTop="8px">
          {error}
        </Text>
      )}
    </Box>
  );
}

LikertScaleQuestion.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    required: PropTypes.bool,
    config: PropTypes.shape({
      scale: PropTypes.number,
      labels: PropTypes.objectOf(PropTypes.string),
    }),
  }).isRequired,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

LikertScaleQuestion.defaultProps = {
  value: null,
  error: null,
};

export default LikertScaleQuestion;
