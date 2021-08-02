/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import loadable from '@loadable/component';
import PropTypes from 'prop-types';

const Icon = ({
  icon, width, height, style,
}) => {
  if (typeof window === 'undefined' || !window) return '';

  // eslint-disable-next-line no-console
  const Comp = loadable(() => import(`./set/${icon}`).catch((err) => console.error(err)));
  return <Comp width={width} height={height} style={style} />;
};
Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.object),
};
Icon.defaultProps = {
  style: {},
  width: '100%',
  height: '100%',
};
export default Icon;
