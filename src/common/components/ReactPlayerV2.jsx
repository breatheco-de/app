import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';
import useTranslation from 'next-translate/useTranslation';
import { Box, Flex, Heading, IconButton, Image, Skeleton } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';

function ReactPlayerV2({
  url, thumbnail, controls, closeOnOverlayClick, className, withThumbnail, iframeStyle, thumbnailStyle, title, withModal, ...rest
}) {
  const { lang } = useTranslation('exercises');
  const isVideoFromDrive = url && url.includes('drive.google.com');
  const isLoomVideo = url && url.includes('loom.com');
  const [showVideo, setShowVideo] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const { backgroundColor, hexColor, featuredColor } = useStyle();
  const isExternalVideoProvider = isVideoFromDrive || isLoomVideo;
  const existsThumbnail = thumbnail && thumbnail.length > 0;
  const getVideo = () => {
    if (isLoomVideo) {
      return url.replace('/share/', '/embed/');
    }
    return url;
  };
  const videoUrl = getVideo();

  const handleButtonClick = () => {
    setShowVideo(true);
  };
  const handleContainerClose = () => {
    if (closeOnOverlayClick) {
      setShowVideo(false);
    }
  };
  const getThumbnail = async () => {
    if (url) {
      const resp = await fetch(`https://noembed.com/embed?url=${url}`);
      const data = await resp.json();
      setVideoThumbnail(data.thumbnail_url);
    }
  };

  // The lang triggers this to change the thumbnail when the page is translated
  useEffect(() => {
    getThumbnail();
  }, [lang]);

  return videoUrl?.length > 0 && (
    <>
      {withModal && !isExternalVideoProvider ? (
        <>
          <Flex
            width="100%"
            height="100%"
            alignItems="center"
            justifyContent="center"
            aspectRatio="16/9"
            background="black"
            onClick={handleButtonClick}
            cursor="pointer"
            backgroundPosition="center center"
            backgroundSize="cover"
            backgroundImage={`url(${thumbnail || videoThumbnail || ''})`}
            borderRadius="4px"
            style={{ ...thumbnailStyle }}
          >
            <IconButton
              aria-label="Play video"
              icon={<Icon icon="play" color={hexColor.blueDefault} width="40px" height="40px" background="darkTheme" borderRadius="6px" padding="4px" />}
            />
          </Flex>

          <Box display={showVideo ? 'flex' : 'none'} className="video-overlay" onClick={handleContainerClose}>
            <Box className="video-container" position="relative" onClick={(e) => e.stopPropagation()} background={featuredColor} padding="25px 25px" borderRadius="12px">
              {title?.length > 0 && (<Heading as="h2" size="xl" mb="25px">{title}</Heading>)}
              <IconButton
                position="absolute"
                top={4}
                right={5}
                borderColor="blue.default"
                color="blue.default"
                background={backgroundColor}
                onClick={() => setShowVideo(false)}
                icon={<Icon icon="close" color={hexColor.black} width="25px" height="25px" />}
              />
              <ReactPlayer
                className={`react-player ${className}`}
                url={videoUrl}
                playing={showVideo}
                controls={controls}
                width="100%"
                height="auto"
                aspectRatio="16/9"
                style={{
                  background: 'black',
                  borderRadius: '4px',
                  ...iframeStyle,
                }}
                {...rest}
              />
            </Box>
          </Box>
        </>
      ) : (
        <>
          {url && !isExternalVideoProvider && (
            <Box position="relative">
              <ReactPlayer
                className={`react-player ${className}`}
                url={videoUrl}
                light={existsThumbnail ? <Image src={thumbnail} width="100%" height="100%" /> : withThumbnail}
                playing={withThumbnail || existsThumbnail}
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
            </Box>
          )}
        </>
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
  withThumbnail: PropTypes.bool,
  iframeStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  thumbnailStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  withModal: PropTypes.bool,
  title: PropTypes.string,
  closeOnOverlayClick: PropTypes.bool,
};
ReactPlayerV2.defaultProps = {
  url: '',
  thumbnail: '',
  controls: true,
  className: '',
  withThumbnail: false,
  iframeStyle: {},
  thumbnailStyle: {},
  withModal: false,
  title: '',
  closeOnOverlayClick: true,
};

export default ReactPlayerV2;
