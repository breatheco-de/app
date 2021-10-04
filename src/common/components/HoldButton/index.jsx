import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const duration = 1600;

const tick = keyframes`
  100% {
    -webkit-transform: rotate(-90deg) translate(0, -5px) scale(var(--progress-scale));
            transform: rotate(-90deg) translate(0, -5px) scale(var(--progress-scale));
  }
}
`;

const ButtonContainer = styled.button`
  --color: #f6f8ff;
  --background: #2b3044;
  --icon: var(--color);
  --progress-border: #646b8c;
  --progress-active: #fff;
  --progress-success: #5c86ff;
  --tick-stroke: var(--progress-active);
  --shadow: rgba(0, 9, 61, 0.2);
  font-size: 16px;
  font-weight: 500;
  line-height: 19px;
  min-width: 112px;
  padding: 12px 20px 12px 12px;
  border: 0;
  border-radius: 24px;
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
    --progress-scale: 0.11;
    --tick-stroke: var(--progress-success);
    --background-scale: 0;
    --tick-offset: 36;
  }

  &:focus {
    &:not {
      & .process {
        --shadow-y: 8px;
        --shadow-blur: 16px;
      }
    }
  }

  &:hover {
    &:not {
      & .process {
        --shadow-y: 8px;
        --shadow-blur: 16px;
      }
    }
  }

  &:active {
    &:not {
      & .success {
        --scale: 0.96;
        --shadow-y: 4px;
        --shadow-blur: 8px;
      }
    }
  }
`;

const ProgressLoader = styled.div`
  margin-right: 4px;
  border-radius: 50%;
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
const SVG = styled.svg`
  display: block;

  & .icon {
    position: absolute;

    width: 8px;
    height: 8px;
    left: 6px;
    top: 6px;
    fill: var(--icon);
    z-index: 1;
    -webkit-transition: opacity 0.2s, -webkit-transform 0.2s;
    transition: opacity 0.2s, -webkit-transform 0.2s;
    transition: opacity 0.2s, transform 0.2s;
    transition: opacity 0.2s, transform 0.2s, -webkit-transform 0.2s;
    opacity: var(--icon-opacity, 1);
    -webkit-transform: translateY(var(--icon-y, 0)) scale(var(--icon-scale, 1));
    transform: translateY(var(--icon-y, 0)) scale(var(--icon-scale, 1));
  }
  & .tick {
    position: absolute;

    width: 20px;
    height: 20px;
    left: 0;
    top: 0;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke: var(--tick-stroke);
    -webkit-transition: stroke 0.3s ease 0.7s;
    transition: stroke 0.3s ease 0.7s;
  }

  & .progress {
    width: 20px;
    height: 20px;
    -webkit-transform: rotate(-90deg) scale(var(--progress-scale, 1));
    transform: rotate(-90deg) scale(var(--progress-scale, 1));
    -webkit-transition: -webkit-transform 0.5s ease;
    transition: -webkit-transform 0.5s ease;
    transition: transform 0.5s ease;
    transition: transform 0.5s ease, -webkit-transform 0.5s ease;

    -webkit-animation: ${tick} 0.3s linear forwards 0.4s;
    animation: ${tick} 0.3s linear forwards 0.4s;
  }
`;

const Circle = styled.circle`
  stroke-dashoffset: 1;
  stroke-dasharray: var(--progress-array, 0) 52;
  stroke-width: 16;
  stroke: var(--progress-active);
  -webkit-transition: stroke-dasharray ${duration} linear;
  transition: stroke-dasharray ${duration} linear;
`;

const Polyline = styled.polyline`
  stroke-dasharray: 18 18 18;
  stroke-dashoffset: var(--tick-offset, 18);
  -webkit-transition: stroke-dashoffset 0.4s ease 0.7s;
  transition: stroke-dashoffset 0.4s ease 0.7s;
`;

const HoldButton = () => {
  const [isSuccess, setSuccess] = useState(false);
  const [isProcess, setProcess] = useState(false);
  const buttonHold = useRef(null);

  const success = () => {
    setSuccess(true);
    // button.classList.add('success');
  };

  let buttonRef;
  useEffect(() => {
    buttonRef = buttonHold?.current;
    console.log('HoldButtonREF:::', buttonRef?.timeout);
  });

  const eventHandler = (e) => {
    // button.style.setProperty('--duration', duration + 'ms');

    // NOTE: Funcionó con estilos default in global.css, ahora debo
    // TODO: Adaptar css correcto a styled components
    e.target.style.setProperty('--duration', `${duration}ms`);

    console.log('EVENT', e.type);
    // || e.type !== 'keypress'
    // || (e.type === 'keypress' && e.which === 32 && !buttonRef?.className.includes('process'))
    // // e.type === 'onTouchStart'
    if (e.type === 'mousedown') {
      setProcess(true);
      buttonRef.timeout = setTimeout(success, duration, buttonRef);
    } else if (e.type !== 'keyup' || (e.type === 'keyup' && e.which === 32)) {
      setProcess(false);
      clearTimeout(buttonRef.timeout);
      // console.log("OUT_PROCESS:::", isProcess)
    }
  };

  console.log('PROCESS:::', isProcess);

  return (
    <ButtonContainer
      ref={buttonHold}
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
        <SVG className="icon" viewBox="0 0 16 16">
          <polygon points="1.3,6.7 2.7,8.1 7,3.8 7,16 9,16 9,3.8 13.3,8.1 14.7,6.7 8,0" />
        </SVG>
        <SVG className="progress" viewBox="0 0 32 32">
          <Circle r="8" cx="16" cy="16" />
        </SVG>
        <SVG className="tick" viewBox="0 0 24 24">
          <Polyline points="18,7 11,16 6,12" />
        </SVG>

        {/* <Icon style={{display: 'block'}} icon="loaderButton" /> */}
      </ProgressLoader>
      Publish
    </ButtonContainer>
  );
};

export default HoldButton;
