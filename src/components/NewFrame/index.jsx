import { memo } from 'react';
import PropTypes from 'prop-types';
import loadable from '@loadable/component';

function NewFrame({
  src, style, width, height, title, id,
}) {
  if (typeof window === 'undefined' || !window) return '';

  const Iframe = loadable(() => import('./Iframe'), {
    fallback: <div>Loading...</div>,
  });

  return (
    <Iframe
      id={id}
      src={src}
      width={width}
      height={height}
      style={style}
      title={title}
    />
  );
}

NewFrame.propTypes = {
  src: PropTypes.string.isRequired,
  id: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  width: PropTypes.string,
  height: PropTypes.string,
  title: PropTypes.string,
};

NewFrame.defaultProps = {
  style: {},
  id: 'iframe',
  width: '100%',
  height: '100%',
  title: '',
};

export default memo(NewFrame);
