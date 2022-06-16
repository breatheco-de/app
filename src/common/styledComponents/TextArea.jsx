/* eslint-disable no-else-return */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Textarea, Text, useColorModeValue } from '@chakra-ui/react';
// import CustomTheme from 'styles/theme';

const SmartTextArea = ({ value, maxLength, ...props }) => {
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
    // else {
    //   // return 'text-black';
    //   return 'black';
    // }
  };
  return (
    <StyledTextArea>
      <div className="smart-text-area">
        <Textarea maxLength={maxLength} value={value} resize="none" padding="15px" {...props} />
        {/* <span className={`count ${textColor()}`}>
          {maxLength < (length + 40) && `${t('common:remaining')}:`}
          {' '}
          {maxLength - length}
        </span> */}
        <Text color={textColor()} zIndex={10} fontSize="xs" position="absolute" bottom="2px" right="20px" background={useColorModeValue('#FFF', '#17202A')}>
          {maxLength < (length + 40) && `${t('common:remaining')}:`}
          {' '}
          {maxLength - length}
        </Text>
      </div>
    </StyledTextArea>

  );
};

const StyledTextArea = styled.div`
width: 100%;
background: inherit;
.smart-text-area{
    position: relative;
    background: inherit;
    .count{
        position: absolute;
        bottom: 2px;
        right: 20px;
        font-size: 80%;
        background: inherit;
    }
    .text-danger{
        color: #dc3545;
    }
    .text-warning{
        color: #ffc107 ;
    }
}
`;

SmartTextArea.defaultProps = {
  value: null,
  maxLength: 1000,
};

SmartTextArea.propTypes = {
  value: PropTypes.string,
  maxLength: PropTypes.number,
};

export default SmartTextArea;
