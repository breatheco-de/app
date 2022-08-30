import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';

const ReactPlayerV2 = ({
  url, controls, className,
}) => {
  const isLoomVideo = url.includes('loom.com/embed/');

  return (
    <>
      {url && !isLoomVideo && (
        <ReactPlayer
          className={`react-player ${className}`}
          url={url}
          controls={controls}
          width="100%"
          height="-webkit-fill-available"
        />

      )}
      {url && isLoomVideo && (
        <div
          className={`lo-emb-vid ${className}`}
          style={{
            position: 'relative', paddingBottom: '75%', height: 0, borderRadius: '3px',
          }}
        >
          <iframe
            title="Loom video"
            src={url}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            }}
            frameBorder="0"
            webkitallowfullscreen
            mozallowfullscreen
            allowFullScreen
          />
        </div>
      )}
    </>
  );
};

ReactPlayerV2.propTypes = {
  url: PropTypes.string,
  controls: PropTypes.bool,
  className: PropTypes.string,
};
ReactPlayerV2.defaultProps = {
  url: '',
  controls: true,
  className: '',
};

export default ReactPlayerV2;
