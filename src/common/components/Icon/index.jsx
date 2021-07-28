/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import loadable from '@loadable/component';
import PropTypes from 'prop-types';

const Icon = ({
  icon, color, width, height, style,
}) => {
  if (typeof window === 'undefined' || !window) return '';

  // eslint-disable-next-line no-console
  const Comp = loadable(() => import(`./set/${icon}`).catch((err) => console.error(err)));
  return <Comp color={color} width={width} height={height} style={style} />;
};
Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired,
  style: PropTypes.objectOf(PropTypes.object),
};
Icon.defaultProps = {
  style: {},
};
export default Icon;
