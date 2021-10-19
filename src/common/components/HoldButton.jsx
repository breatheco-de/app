import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const duration = 1600;

const ButtonContainer = styled.button`
  --color: #f6f8ff;
  --background: ${(props) => props.background};
  --icon: var(--color);
  --progress-border: ${(props) => props.progressBorder};
  --progress-active: #fff;
  --progress-success: ${(props) => props.successIconColor};
  --tick-stroke: var(--progress-active);
  --shadow: rgba(0, 9, 61, 0.2);

  -webkit-tap-highlight-color: rgba(0,0,0,0);
  cursor: pointer;
  user-select: none
  box-sizing: inherit;
  font-size: 16px;
  font-weight: 500;
  line-height: 19px;
  min-width: 112px;
  padding: 12px 20px 12px 12px;
  border: 0;
  border-radius: ${(props) => props.borderRadius};
  outline: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  cursor: pointer;
  -webkit-backface-visibility: hidden;
  -webkit-appearance: none;
  -webkit-transition: -webkit-transform 0.3s, -webkit-box-shadow 0.3s;
  transition: -webkit-transform 0.3s, -webkit-box-shadow 0.3s;
  transition: transform 0.3s, box-shadow 0.3s;
  transition: transform 0.3s, box-shadow 0.3s, -webkit-transform 0.3s, -webkit-box-shadow 0.3s;
  -webkit-box-shadow: 0 var(--shadow-y, 4px) var(--shadow-blur, 12px) var(--shadow);
  box-shadow: 0 var(--shadow-y, 4px) var(--shadow-blur, 12px) var(--shadow);
  -webkit-transform: scale(var(--scale, 1)) translateZ(0);
  transform: scale(var(--scale, 1)) translateZ(0);
  color: var(--color);
  background: var(--background);

  & .process {
    --progress-array: 52;
    --icon-y: -4px;
    --icon-scale: 0.6;
    --icon-opacity: 0;
  }
  & .success {
    --progress-array: 52;
    --icon-y: -4px;
    --icon-scale: 0.6;
    --icon-opacity: 0;

    --progress-border: none;
    --progress-scale: 0.05;
    --tick-stroke: var(--progress-success);
    --background-scale: 0;
    --tick-offset: 36;
  }

  &:focus:not(.process) {
    --shadow-y: 8px;
    --shadow-blur: 16px;
  }

  &:hover:not(.process) {
    --shadow-y: 8px;
    --shadow-blur: 16px;
  }

  &:active:not(.success) {
    --scale: 0.96;
    --shadow-y: 4px;
    --shadow-blur: 8px;
  }
`;

const ProgressLoader = styled.div`
  box-sizing: inherit;
  margin-right: 4px;
  border-radius: 50%;
  height: 20px;
  display: inline-block;
  vertical-align: top;
  position: relative;
  background: var(--progress-border);

  &:before {
    content: '';
    width: 16px;
    height: 16px;
    left: 2px;
    top: 2px;
    z-index: 1;
    position: absolute;
    box-sizing: inherit;
    background: var(--background);
    border-radius: inherit;
    -webkit-transform: scale(var(--background-scale, 1));
    transform: scale(var(--background-scale, 1));
    -webkit-transition: -webkit-transform 0.32s ease;
    transition: -webkit-transform 0.32s ease;
    transition: transform 0.32s ease;
    transition: transform 0.32s ease, -webkit-transform 0.32s ease;
  }
`;

const HoldButton = ({
  text, background, progressBorder, borderRadius, successIconColor,
}) => {
  const [isSuccess, setSuccess] = useState(false);
  const [isProcess, setProcess] = useState(false);
  const buttonHold = useRef(null);

  const success = () => {
    setSuccess(true);
  };

  let buttonRef;
  useEffect(() => {
    buttonRef = buttonHold?.current;
  });

  const eventHandler = (e) => {
    e.preventDefault();
    e.target.style.setProperty('--duration', `${duration}ms`);

    if (e.type === 'mousedown' || e.type === 'touchstart') {
      setProcess(true);
      buttonRef.timeout = setTimeout(success, duration, buttonRef);
    } else if (
      e.type === 'touchend'
      || e.type !== 'keyup'
      || (e.type === 'keyup' && e.which === 32)
    ) {
      setProcess(false);
      clearTimeout(buttonRef?.timeout);
    }
  };

  return (
    <ButtonContainer
      background={background}
      progressBorder={progressBorder}
      borderRadius={borderRadius}
      successIconColor={successIconColor}
      ref={buttonHold}
      onPointerOver={eventHandler}
      onMouseDown={eventHandler}
      onKeyPress={eventHandler}
      onTouchStart={eventHandler}
      onMouseUp={eventHandler}
      onMouseOut={eventHandler}
      onTouchEnd={eventHandler}
      onKeyUp={eventHandler}
      className={`button-hold ${isSuccess === true ? 'success' : ''} ${
        isProcess === true ? 'process' : ''
      }`}
    >
      <ProgressLoader>
        <svg className="icon" viewBox="0 0 16 16">
          <polygon points="1.3,6.7 2.7,8.1 7,3.8 7,16 9,16 9,3.8 13.3,8.1 14.7,6.7 8,0" />
        </svg>
        <svg className="progress" viewBox="0 0 32 32">
          <circle r="8" cx="16" cy="16" />
        </svg>
        <svg className="tick" viewBox="0 0 24 24">
          <polyline points="18,7 11,16 6,12" />
        </svg>
      </ProgressLoader>
      {text}
    </ButtonContainer>
  );
};

HoldButton.propTypes = {
  text: PropTypes.string.isRequired,
  background: PropTypes.string,
  progressBorder: PropTypes.string,
  borderRadius: PropTypes.string,
  successIconColor: PropTypes.string,
};
HoldButton.defaultProps = {
  background: '#2b3044',
  progressBorder: '#646b8c',
  borderRadius: '14px',
  successIconColor: '#25BF6C',
};

export default HoldButton;
