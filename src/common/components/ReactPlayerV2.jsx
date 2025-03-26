import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';
import { Box, Flex, Heading, IconButton, Image, Skeleton, Portal } from '@chakra-ui/react';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';

function ReactPlayerV2({
  url, thumbnail, controls, closeOnOverlayClick, className, withThumbnail, iframeStyle, thumbnailStyle, title, withModal, containerStyle, autoPlay, loop, autoFullScreen, muted, volume, pictureInPicture, playerConfig, preview, previewDuration,
  ...rest
}) {
  const isVideoFromDrive = useMemo(() => url && url.includes('drive.google.com'), [url]);
  const isLoomVideo = useMemo(() => url && url.includes('loom.com'), [url]);
  const [showVideo, setShowVideo] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const { backgroundColor, hexColor, featuredColor } = useStyle();
  const isExternalVideoProvider = useMemo(() => isVideoFromDrive || isLoomVideo, [isVideoFromDrive, isLoomVideo]);
  const existsThumbnail = useMemo(() => thumbnail && thumbnail.length > 0, [thumbnail]);
  const previewPlayerRef = useRef(null);

  const getVideo = useCallback(() => {
    if (isLoomVideo) {
      return url.replace('/share/', '/embed/');
    }
    return url;
  }, [url, isLoomVideo]);

  const videoUrl = useMemo(() => getVideo(), [getVideo]);

  const handleButtonClick = useCallback(() => {
    if (previewPlayerRef.current) {
      previewPlayerRef.current.seekTo(0);
    }
    setShowVideo(true);
  }, []);

  const handleContainerClose = useCallback(() => {
    if (closeOnOverlayClick) {
      setShowVideo(false);
    }
  }, [closeOnOverlayClick]);

  const handlePreviewProgress = useCallback(({ playedSeconds }) => {
    if (preview && previewDuration && playedSeconds >= previewDuration) {
      if (previewPlayerRef.current) {
        previewPlayerRef.current.seekTo(0);
      }
    }
  }, [preview, previewDuration]);

  const handlePreviewReady = useCallback(() => {
    setIsPreviewReady(true);
  }, []);

  const getThumbnail = useCallback(async () => {
    if (!url) return;

    try {
      const cacheKey = `video_thumbnail_${url}`;
      const cachedThumbnail = sessionStorage.getItem(cacheKey);

      if (cachedThumbnail) {
        setVideoThumbnail(cachedThumbnail);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const resp = await fetch(`https://noembed.com/embed?url=${url}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!resp.ok) return;

      const data = await resp.json();
      if (data.thumbnail_url) {
        setVideoThumbnail(data.thumbnail_url);
        try {
          sessionStorage.setItem(cacheKey, data.thumbnail_url);
        } catch (e) {
          // Ignorar errores de cuota de sessionStorage
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching thumbnail:', error);
      }
    }
  }, [url]);

  useEffect(() => {
    if (url) {
      getThumbnail();
    }
  }, [url, getThumbnail]);

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
            position="relative"
            overflow="hidden"
            borderRadius="4px"
            style={{ ...thumbnailStyle }}
          >
            {preview ? (
              <Box
                position="absolute"
                width="100%"
                height="100%"
                top={0}
                left={0}
                pointerEvents="none"
                zIndex={0}
              >
                <ReactPlayer
                  ref={previewPlayerRef}
                  className={`react-player-preview ${className}`}
                  url={videoUrl}
                  playing={isPreviewReady}
                  muted
                  loop
                  width="100%"
                  height="100%"
                  onReady={handlePreviewReady}
                  onProgress={handlePreviewProgress}
                  playsinline
                  controls={false}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    ...iframeStyle,
                  }}
                  config={{
                    youtube: {
                      playerVars: {
                        modestbranding: 1,
                        controls: 0,
                        showinfo: 0,
                        rel: 0,
                        playsinline: 1,
                        autoplay: 1,
                        disablekb: 1,
                        iv_load_policy: 3,
                      },
                    },
                    vimeo: {
                      playerOptions: {
                        background: true,
                        controls: false,
                        autoplay: true,
                        keyboard: false,
                        title: false,
                        transparent: true,
                      },
                    },
                    file: {
                      attributes: {
                        autoPlay: true,
                        playsInline: true,
                        controls: false,
                      },
                    },
                  }}
                  {...rest}
                />
              </Box>
            ) : ((thumbnail || videoThumbnail) && (
              <Box
                position="absolute"
                width="100%"
                height="100%"
                backgroundImage={`url(${thumbnail || videoThumbnail})`}
                backgroundPosition="center center"
                backgroundSize="cover"
                zIndex={0}
              />
            ))}
            <IconButton
              aria-label="Play video"
              icon={<Icon icon="play2" width="40px" height="40px" borderRadius="6px" padding="4px" />}
              position="relative"
              zIndex={1}
              backgroundColor="rgba(0, 0, 0, 0.5)"
              _hover={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
              transition="all 0.2s"
            />
          </Flex>

          {showVideo && (
            <Portal>
              <Box
                position="fixed"
                top="0"
                left="0"
                width="100%"
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                background="rgba(0, 0, 0, 0.7)"
                zIndex="9999"
                className="video-overlay"
                onClick={handleContainerClose}
              >
                <Box
                  className="video-container"
                  position="relative"
                  onClick={(e) => e.stopPropagation()}
                  background={featuredColor}
                  padding="25px 25px"
                  borderRadius="12px"
                  style={{ ...containerStyle }}
                >
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
            </Portal>
          )}
        </>
      ) : (
        <>
          {url && !isExternalVideoProvider && (
            <Box
              position="relative"
              {...containerStyle}
            >
              <ReactPlayer
                className={`react-player ${className}`}
                url={videoUrl}
                light={existsThumbnail ? <Image src={thumbnail} width="100%" height="100%" /> : withThumbnail}
                playing={withThumbnail || existsThumbnail || autoPlay}
                playIcon={(
                  <IconButton
                    aria-label="Play video"
                    icon={<Icon icon="play2" width="40px" height="40px" borderRadius="6px" padding="4px" />}
                    backgroundColor="rgba(0, 0, 0, 0.5)"
                    _hover={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                    transition="all 0.2s"
                  />
                )}
                controls={controls}
                width="100%"
                volume={volume}
                muted={muted}
                pip={pictureInPicture}
                playsinline={autoFullScreen}
                fallback={<Skeleton width={iframeStyle.width || '100%'} height={iframeStyle.height || '100%'} />}
                height="-webkit-fill-available"
                loop={loop}
                style={{
                  background: 'black',
                  ...iframeStyle,
                }}
                config={playerConfig}
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
  containerStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  thumbnailStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  withModal: PropTypes.bool,
  title: PropTypes.string,
  autoPlay: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  loop: PropTypes.bool,
  autoFullScreen: PropTypes.bool,
  muted: PropTypes.bool,
  pictureInPicture: PropTypes.bool,
  volume: PropTypes.number,
  playerConfig: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  preview: PropTypes.bool,
  previewDuration: PropTypes.number,
};
ReactPlayerV2.defaultProps = {
  url: '',
  thumbnail: '',
  controls: true,
  className: '',
  withThumbnail: false,
  iframeStyle: {},
  containerStyle: {},
  thumbnailStyle: {},
  withModal: false,
  autoPlay: false,
  title: '',
  closeOnOverlayClick: true,
  loop: false,
  autoFullScreen: false,
  muted: false,
  volume: null,
  pictureInPicture: false,
  playerConfig: {},
  preview: false,
  previewDuration: 10,
};

export default ReactPlayerV2;
