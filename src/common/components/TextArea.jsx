/* eslint-disable no-else-return */
import React from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import {
  Textarea, Text, useColorModeValue, Container,
} from '@chakra-ui/react';
import CustomTheme from '../../../styles/theme';

function SmartTextArea({ value, maxLength, ...props }) {
  const { t } = useTranslation('survey');
  const length = value && typeof (value) === 'string' ? value.length : 0;
  const textColor = () => {
    if (maxLength <= (length + 1)) {
      // return 'text-danger';
      return '#dc3545';
    } else if (maxLength < (length + 40)) {
      // return 'text-warning';
      return '#ffc107';
    }
    return '';
  };
  return (
    <Container maxW="none" padding="0" background="inherit" position="relative">
      <Textarea maxLength={maxLength} value={value} resize="none" padding="15px" {...props} />
      <Text
        color={textColor()}
        zIndex={10}
        fontSize="xs"
        position="absolute"
        bottom="2px"
        right="20px"
        background={useColorModeValue(CustomTheme.colors.white, CustomTheme.colors.darkTheme)}
      >
        {maxLength < (length + 40) && `${t('common:remaining')}:`}
        {' '}
        {maxLength - length}
      </Text>
    </Container>

  );
}

SmartTextArea.defaultProps = {
  value: null,
  maxLength: 1000,
};

SmartTextArea.propTypes = {
  value: PropTypes.string,
  maxLength: PropTypes.number,
};

export default SmartTextArea;
