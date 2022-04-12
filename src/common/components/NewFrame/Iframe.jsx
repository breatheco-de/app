import PropTypes from 'prop-types';
import { memo } from 'react';

const Iframe = ({
  src, style, width, height, title, id,
}) => (
  <iframe
    id={id}
    src={src}
    width={width}
    height={height}
    style={style}
    title={title}
  />
);

Iframe.propTypes = {
  src: PropTypes.string.isRequired,
  id: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.any),
  width: PropTypes.string,
  height: PropTypes.string,
  title: PropTypes.string,
};

Iframe.defaultProps = {
  style: {},
  id: 'iframe',
  width: '100%',
  height: '100%',
  title: '',
};

export default memo(Iframe);
