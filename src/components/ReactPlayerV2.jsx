import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';
import { Box, Flex, Heading, IconButton, Skeleton, Portal } from '@chakra-ui/react';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';

function ModalPlayerContent({
  className, videoUrl, thumbnail, iframeStyle, thumbnailStyle, title, containerStyle, controls, playerConfig, isPlayDisabled, preview,
  handleButtonClick, isPreviewReady, previewPlayerRef, handlePreviewReady, handlePreviewProgress, videoThumbnail,
  showVideo, handleContainerClose, featuredColor, backgroundColor, hexColor, setShowVideo,
  ...rest
}) {
  return (
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
                  playerVars: { modestbranding: 1, controls: 0, showinfo: 0, rel: 0, playsinline: 1, autoplay: 1, disablekb: 1, iv_load_policy: 3 },
                },
                vimeo: {
                  playerOptions: { background: true, controls: false, autoplay: true, keyboard: false, title: false, transparent: true },
                },
                file: {
                  attributes: { autoPlay: true, playsInline: true, controls: false },
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
          id="play-video-button-modal"
          aria-label="Play video"
          icon={<Icon icon="play2" width="40px" height="40px" borderRadius="6px" padding="4px" />}
          position="relative"
          zIndex={1}
          backgroundColor="rgba(0, 0, 0, 0.5)"
          _hover={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          transition="all 0.2s"
          onClick={(e) => {
            if (isPlayDisabled) {
              e.stopPropagation();
            } else {
              handleButtonClick();
              e.stopPropagation();
            }
          }}
          isDisabled={isPlayDisabled}
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
                config={playerConfig}
                {...rest}
              />
            </Box>
          </Box>
        </Portal>
      )}
    </>
  );
}

ModalPlayerContent.propTypes = {
  className: PropTypes.string,
  videoUrl: PropTypes.string.isRequired,
  thumbnail: PropTypes.string,
  iframeStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  thumbnailStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  title: PropTypes.string,
  containerStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  controls: PropTypes.bool,
  playerConfig: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  isPlayDisabled: PropTypes.bool,
  preview: PropTypes.bool,
  handleButtonClick: PropTypes.func.isRequired,
  isPreviewReady: PropTypes.bool.isRequired,
  previewPlayerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.element })]),
  handlePreviewReady: PropTypes.func.isRequired,
  handlePreviewProgress: PropTypes.func.isRequired,
  videoThumbnail: PropTypes.string,
  showVideo: PropTypes.bool.isRequired,
  handleContainerClose: PropTypes.func.isRequired,
  setShowVideo: PropTypes.func.isRequired,
  featuredColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  hexColor: PropTypes.objectOf(PropTypes.string),
};

ModalPlayerContent.defaultProps = {
  className: '',
  thumbnail: '',
  iframeStyle: {},
  thumbnailStyle: {},
  title: '',
  containerStyle: {},
  controls: true,
  playerConfig: {},
  isPlayDisabled: false,
  preview: false,
  videoThumbnail: '',
  featuredColor: '#f0f0f0',
  backgroundColor: '#ffffff',
  hexColor: {},
  previewPlayerRef: null,
};

function ReactPlayerV2({
  url, thumbnail, controls, closeOnOverlayClick, className, withThumbnail, iframeStyle, thumbnailStyle, title,
  withModal, containerStyle, autoPlay, loop, playsInline, muted, volume, pictureInPicture, playerConfig,
  preview, previewDuration, isPlayDisabled = false,
  ...rest
}) {
  const isVideoFromDrive = useMemo(() => url && url.includes('drive.google.com'), [url]);
  const isLoomVideo = useMemo(() => url && url.includes('loom.com'), [url]);
  const isVideoAsk = useMemo(() => url && url.includes('videoask.com'), [url]);
  const [showVideo, setShowVideo] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [showInlineVideoFull, setShowInlineVideoFull] = useState(autoPlay && !preview && !isPlayDisabled);
  const { backgroundColor, hexColor, featuredColor } = useStyle();
  const isExternalVideoProvider = useMemo(() => isVideoFromDrive || isLoomVideo || isVideoAsk, [isVideoFromDrive, isLoomVideo, isVideoAsk]);
  const previewPlayerRef = useRef(null);

  const getVideo = useCallback(() => {
    if (isLoomVideo) {
      return url.replace('/share/', '/embed/');
    }
    if (isVideoAsk) {
      return url;
    }
    return url;
  }, [url, isLoomVideo, isVideoAsk]);

  const videoUrl = useMemo(() => getVideo(), [getVideo]);

  const handleModalShowVideoClick = useCallback(() => {
    if (isPlayDisabled) {
      return;
    }
    if (previewPlayerRef.current) {
      previewPlayerRef.current.seekTo(0);
    }
    setShowVideo(true);
  }, [isPlayDisabled]);

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
          console.log('Error setting thumbnail:', e);
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

  const handleInlinePlayButtonClick = useCallback(() => {
    if (isPlayDisabled) {
      return;
    }
    if (preview && previewPlayerRef.current) {
      previewPlayerRef.current.seekTo(0);
    }
    setShowInlineVideoFull(true);
  }, [isPlayDisabled, preview]);

  return videoUrl?.length > 0 && (
    <>
      {withModal && !isExternalVideoProvider ? (
        <ModalPlayerContent
          className={className}
          videoUrl={videoUrl}
          thumbnail={thumbnail}
          iframeStyle={iframeStyle}
          thumbnailStyle={thumbnailStyle}
          title={title}
          containerStyle={containerStyle}
          controls={controls}
          playerConfig={playerConfig}
          isPlayDisabled={isPlayDisabled}
          preview={preview}
          handleButtonClick={handleModalShowVideoClick}
          isPreviewReady={isPreviewReady}
          previewPlayerRef={previewPlayerRef}
          handlePreviewReady={handlePreviewReady}
          handlePreviewProgress={handlePreviewProgress}
          videoThumbnail={videoThumbnail}
          showVideo={showVideo}
          handleContainerClose={handleContainerClose}
          setShowVideo={setShowVideo}
          featuredColor={featuredColor}
          backgroundColor={backgroundColor}
          hexColor={hexColor}
          {...rest}
        />
      ) : (
        <>
          {url && !isExternalVideoProvider && (
            <Box position="relative" width="100%" {...containerStyle}>
              {!showInlineVideoFull ? (
                <Flex
                  width="100%"
                  alignItems="center"
                  justifyContent="center"
                  aspectRatio="16/9"
                  background="black"
                  onClick={!isPlayDisabled ? handleInlinePlayButtonClick : undefined}
                  cursor={!isPlayDisabled ? 'pointer' : 'default'}
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
                        playing={isPreviewReady && !isPlayDisabled}
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
                            playerVars: { modestbranding: 1, controls: 0, showinfo: 0, rel: 0, playsinline: 1, autoplay: 1, disablekb: 1, iv_load_policy: 3 },
                          },
                          vimeo: {
                            playerOptions: { background: true, controls: false, autoplay: true, keyboard: false, title: false, transparent: true },
                          },
                          file: {
                            attributes: { autoPlay: true, playsInline: true, controls: false },
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
                  {!isPlayDisabled && (
                    <IconButton
                      id="play-inline-video-button"
                      aria-label="Play video"
                      icon={<Icon icon="play2" width="40px" height="40px" borderRadius="6px" padding="4px" />}
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      zIndex={1}
                      backgroundColor="rgba(0, 0, 0, 0.5)"
                      _hover={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                      transition="all 0.2s"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInlinePlayButtonClick();
                      }}
                    />
                  )}
                </Flex>
              ) : (
                <ReactPlayer
                  className={`react-player ${className}`}
                  url={videoUrl}
                  playing={!isPlayDisabled}
                  controls={controls}
                  width="100%"
                  height="100%"
                  volume={volume}
                  muted={isPlayDisabled ? true : muted}
                  pip={pictureInPicture}
                  playsinline={playsInline}
                  fallback={<Skeleton width="100%" height="100%" />}
                  loop={loop}
                  style={{
                    ...iframeStyle,
                  }}
                  config={playerConfig}
                  {...rest}
                />
              )}
            </Box>
          )}
          {url && isExternalVideoProvider && (
            <>
              {isVideoAsk ? (
                <Box
                  className={`videoask-player ${className}`}
                  position="relative"
                  width="100%"
                  height="600px"
                  minHeight="500px"
                  borderRadius="3px"
                  overflow="hidden"
                >
                  <iframe
                    title="VideoAsk video"
                    src={videoUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      ...iframeStyle,
                    }}
                    allow="camera *; microphone *; autoplay *; encrypted-media *; fullscreen *; display-capture *;"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
                  />
                </Box>
              ) : (
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
          )}
        </>
      )}
    </>
  );
}

ReactPlayerV2.propTypes = {
  url: PropTypes.string,
  thumbnail: PropTypes.string,
  controls: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  className: PropTypes.string,
  withThumbnail: PropTypes.bool,
  iframeStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  containerStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  thumbnailStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  withModal: PropTypes.bool,
  title: PropTypes.string,
  autoPlay: PropTypes.bool,
  loop: PropTypes.bool,
  playsInline: PropTypes.bool,
  muted: PropTypes.bool,
  pictureInPicture: PropTypes.bool,
  volume: PropTypes.number,
  playerConfig: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  preview: PropTypes.bool,
  previewDuration: PropTypes.number,
  isPlayDisabled: PropTypes.bool,
};

ReactPlayerV2.defaultProps = {
  url: '',
  thumbnail: '',
  controls: true,
  closeOnOverlayClick: true,
  className: '',
  withThumbnail: false,
  iframeStyle: {},
  containerStyle: {},
  thumbnailStyle: {},
  withModal: false,
  title: '',
  autoPlay: false,
  loop: false,
  playsInline: false,
  muted: false,
  pictureInPicture: false,
  volume: null,
  playerConfig: {},
  preview: false,
  previewDuration: 10,
  isPlayDisabled: false,
};

export default ReactPlayerV2;
