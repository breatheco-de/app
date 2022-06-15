/* eslint-disable no-else-return */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';

const SmartTextArea = ({ value, maxLength, ...props }) => {
  const { t } = useTranslation('survey');
  const length = value && typeof (value) === 'string' ? value.length : 0;
  const textColor = () => {
    if (maxLength <= (length + 1)) {
      return 'text-danger';
    } else if (maxLength < (length + 40)) {
      return 'text-warning';
    } else {
      return 'text-black';
    }
  };
  return (
    <StyledTextArea>
      <div className="smart-text-area">
        <textarea maxLength={maxLength} {...props} />
        <span className={`count ${textColor()}`}>
          {maxLength < (length + 40) && `${t('common:remaining')}:`}
          {' '}
          {maxLength - length}
        </span>
      </div>
    </StyledTextArea>

  );
};

const StyledTextArea = styled.div`
width: 100%;
.smart-text-area{
    position: relative;
    textarea{
        border-style: none;
        box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.4);
        border-radius:10px;
        padding: 15px;
        resize: none;
        width: -webkit-fill-available;
    }
    textarea:focus{
        outline: none;
        box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.4);
    }
    textarea:active{
        box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.4);
    }
    .count{
        position: absolute;
        bottom: 10px;
        right: 20px;
        font-size: 80%;
        background: white;
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
