import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Devices from '../responsive';

const Heading = ({ type, children, className }) => {
  const Comp = type;
  return <Comp className={className}>{children}</Comp>;
};

Heading.propTypes = {
  type: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
Heading.defaultProps = {
  type: 'span',
  className: '',
};

const BaseHeading = styled(Heading)`
  display: ${(props) => props.display || 'block'};
  float: ${(props) => props.float || 'none'};
  width: ${(props) => props.width || '100%'};
  font-family: 'Lato', sans-serif;
  letter-spacing: ${(props) => props.letterSpacing};
  font-weight: ${(props) => props.fontWeight};
  font-size: ${(props) => props.fontSize};
  line-height: ${(props) => props.lineHeight};
  font-style: ${(props) => props.fontStyle || 'normal'};
  color: ${(props) => props.color};
  margin: ${(props) => props.margin};
  border: ${(props) => props.border};
  border-width: ${(props) => props.borderWidth};
  border-color: ${(props) => props.borderColor};
  text-shadow: ${(props) => props.textShadow};
  background-color: ${(props) => props.background};
  margin-top: ${(props) => props.marginTop};
  text-transform: ${(props) => props.textTransform};
  text-align: ${(props) => props.textAlign || 'center'};
  align-self: ${(props) => props.alignSelf};
  padding: ${(props) => props.padding};
  border-bottom: ${(props) => props.borderBottom};

  &:hover {
    background-color: ${(props) => props.bgHover || props.bg};
    color: ${(props) => props.colorHover};
  }
  @media ${Devices.xxs} {
  }
  @media ${Devices.xs} {
  }
  @media ${Devices.sm} {
    text-align: ${(props) => props.textAlign_sm};
  }
  @media ${Devices.tablet} {
    text-align: ${(props) => props.textAlign_tablet};
    font-size: ${(props) => props.fontSize_tablet};
    line-height: ${(props) => props.lineHeight_tablet};
    margin: ${(props) => props.margin_tablet};
    padding: ${(props) => props.padding_tablet};
    display: ${(props) => props.display_tablet};
    align-self: ${(props) => props.alignSelf_tablet};
  }
  @media ${Devices.md} {
    font-size: ${(props) => props.fontSize_md};
    text-align: ${(props) => props.textAlign_md};
    line-height: ${(props) => props.lineHeight_md};
    display: ${(props) => props.display_md};
    margin: ${(props) => props.margin_md};
    width: ${(props) => props.width_md};
    padding: ${(props) => props.padding_md};
  }
  @media ${Devices.lg} {
  }
  @media ${Devices.xl} {
  }
  @media ${Devices.xxl} {
  }
`;
export const H1 = styled(BaseHeading)`
  z-index: ${(props) => props.zIndex};
`;

export const H2 = styled(BaseHeading)`
  z-index: ${(props) => props.zIndex};
  letter-spacing: 0.05em;
`;
export const H3 = styled(BaseHeading)`
  font-weight: ${(props) => props.fontWeight || '700'};
  font-size: ${(props) => props.fonSize};
  text-align: ${(props) => props.textAlign};
  letter-spacing: 0.05em;
  place-self: ${(props) => props.placeSelf};
`;
export const H4 = styled(BaseHeading)`
  font-weight: ${(props) => props.fontWeight || '400'};
  letter-spacing: 0.05em;
  padding-right: ${(props) => props.paddingRight};
`;
export const H5 = styled(BaseHeading)`
  font-weight: 700;
  letter-spacing: 0px;
`;
