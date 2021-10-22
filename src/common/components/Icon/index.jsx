/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import loadable from '@loadable/component';
import PropTypes from 'prop-types';

const Icon = ({
  icon, width, height, style, color, fill,
}) => {
  if (typeof window === 'undefined' || !window) return '';

  // eslint-disable-next-line no-console
  const Comp = loadable(() => import(`./set/${icon}`).catch((err) => console.error(err)));
  return <Comp width={width} height={height} style={style} color={color} fill={fill} />;
};
Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
  color: PropTypes.string,
  fill: PropTypes.string,
  style: PropTypes.shape({
    transform: PropTypes.string,
    transition: PropTypes.string,
  }),
};
Icon.defaultProps = {
  style: {},
  width: '100%',
  height: '100%',
  color: '',
  fill: '',
};
export default Icon;
