import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';


const Steps = ({ steps, onClick, currentIndex }) => {

    const StyledSteps = styled.div`
    .multi-steps > li.is-active ~ li:before, .multi-steps > li.is-active:before {
  content: counter(stepNum);
  font-family: inherit;
  font-weight: 700;
}
.multi-steps > li.is-active ~ li:after, .multi-steps > li.is-active:after {
  background-color: #ededed;
}

.multi-steps {
  display: table;
  table-layout: fixed;
  width: 100%;
}
.multi-steps > li {
  counter-increment: stepNum;
  text-align: center;
  display: table-cell;
  position: relative;
  color:#0f64ff;
}
.multi-steps > li:before {
  content: "";
  content: "✓;";
  content: "𐀃";
  content: "𐀄";
  content: "✓";
  display: block;
  margin: 0 auto 4px;
  background-color: #fff;
  width: 36px;
  height: 36px;
  line-height: 32px;
  text-align: center;
  font-weight: bold;
  border-width: 2px;
  border-style: solid;
  border-color:#0f64ff;
  border-radius: 50%;
}
.multi-steps > li:after {
  content: "";
  height: 2px;
  width: 100%;
  background-color:#0f64ff;
  position: absolute;
  top: 16px;
  left: 50%;
  z-index: -1;
}
.multi-steps > li:last-child:after {
  display: none;
}
.multi-steps > li.is-active:before {
  background-color: #d0e1ff;
  border-color: #0f64ff;
}
.multi-steps > li.is-active ~ li {
  color: #808080;
}
.multi-steps > li.is-active ~ li:before {
  background-color: #ededed;
  border-color: #ededed;
}
`
    return (<StyledSteps>
      <ul className="list-unstyled multi-steps mt-4">
        {Array.isArray(steps) && steps.length > 1 && steps.map((step, i) => 
            <li className={currentIndex === i ? "is-active" : ""}>
                <a onClick={() => onClick(step)} aria-controls="discover" role="tab" data-toggle="tab">
                    {steps.icon && <i className={step.icon} aria-hidden="true"></i>}
                    {steps.label && <p>{step.label}</p>}
                </a>
            </li>
        )}
    </ul>  
    </StyledSteps>)
    
}

Steps.defaultProps = {
  onClick: () => {},
}

Steps.propTypes = {
  steps: PropTypes.array.isRequired,
  onClick: PropTypes.func,
  currentIndex: PropTypes.number.isRequired
};

export default Steps;