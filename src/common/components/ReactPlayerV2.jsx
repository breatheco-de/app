import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';
import { Image, Skeleton } from '@chakra-ui/react';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';

function ReactPlayerV2({
  url, thumbnail, controls, className, iframeStyle, ...rest
}) {
  const isVideoFromDrive = url && url.includes('drive.google.com');
  const isLoomVideo = url && url.includes('loom.com');
  const { hexColor } = useStyle();
  const isExternalVideoProvider = isVideoFromDrive || isLoomVideo;
  const existsThumbnail = thumbnail && thumbnail.length > 0;
  const getVideo = () => {
    if (isLoomVideo) {
      return url.replace('/share/', '/embed/');
    }
    return url;
  };

  const videoUrl = getVideo();

  return (
    <>
      {url && !isExternalVideoProvider && (
        <ReactPlayer
          className={`react-player ${className}`}
          url={videoUrl}
          light={existsThumbnail && <Image src={thumbnail} width="100%" height="100%" />}
          playing={existsThumbnail}
          playIcon={<Icon icon="play" color={hexColor.blueDefault} width="40px" height="40px" background={hexColor.featuredColor} borderRadius="6px" padding="4px" />}
          controls={controls}
          width="100%"
          fallback={<Skeleton width={iframeStyle.width || '100%'} height={iframeStyle.height || '100%'} />}
          height="-webkit-fill-available"
          style={{
            background: 'black',
            ...iframeStyle,
          }}
          {...rest}
        />

      )}
      {url && isExternalVideoProvider && (
        <div
          className={`lo-emb-vid ${className}`}
          style={{
            position: 'relative', paddingBottom: '75%', height: 0, borderRadius: '3px',
          }}
        >
          <iframe
            title="Loom video"
            src={videoUrl}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', ...iframeStyle,
            }}
            webkitallowfullscreen
            mozallowfullscreen
            allowFullScreen
          />
        </div>
      )}
    </>
  );
}

ReactPlayerV2.propTypes = {
  url: PropTypes.string,
  thumbnail: PropTypes.string,
  controls: PropTypes.bool,
  className: PropTypes.string,
  iframeStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
};
ReactPlayerV2.defaultProps = {
  url: '',
  thumbnail: '',
  controls: true,
  className: '',
  iframeStyle: {},
};

export default ReactPlayerV2;
