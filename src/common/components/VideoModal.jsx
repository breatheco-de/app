import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/lazy';
import PropTypes from 'prop-types';
import { Box, IconButton, Flex, useBreakpointValue, Text } from '@chakra-ui/react';
import Icon from './Icon';

function VideoModal({
  videoUrl,
  isOpen,
  onClose,
  positioningRef,
  title,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState(null);
  const [isPositioned, setIsPositioned] = useState(false);
  const playerWrapperRef = useRef(null);

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      setIsPositioned(false);
      setIsExpanded(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isMobile && isExpanded) {
      setIsExpanded(false);
    }
  }, [isMobile, isExpanded]);

  useEffect(() => {
    if (isOpen && !isPositioned && positioningRef?.current && playerWrapperRef.current) {
      const containerRect = positioningRef.current.getBoundingClientRect();
      const pipHeightPx = 180;
      const pipWidthPx = 320;

      const pipTop = window.scrollY + containerRect.top - pipHeightPx - 20;
      const pipLeft = window.scrollX + containerRect.left + (containerRect.width / 2) - (pipWidthPx / 2);

      setPosition({ top: pipTop, left: pipLeft });
      setTimeout(() => setIsPositioned(true), 0);
    }
  }, [isOpen, positioningRef, isPositioned]);

  useEffect(() => {
    if (isOpen && !isExpanded && !isMobile && positioningRef?.current && playerWrapperRef.current) {
      const containerRect = positioningRef.current.getBoundingClientRect();
      const pipHeightPx = 180;
      const pipWidthPx = 320;

      const pipTop = window.scrollY + containerRect.top - pipHeightPx - 20;
      const pipLeft = window.scrollX + containerRect.left + (containerRect.width / 2) - (pipWidthPx / 2);

      setPosition({ top: pipTop, left: pipLeft });
    }
  }, [isExpanded, isOpen, positioningRef, isMobile]);

  if (!isOpen) {
    return null;
  }

  const pipWidth = '320px';
  const pipHeight = '180px';
  const expandedWidth = '60vw';
  const expandedHeight = '33.75vw';

  const currentWidth = isExpanded && !isMobile ? expandedWidth : pipWidth;
  const currentHeight = isExpanded && !isMobile ? expandedHeight : pipHeight;
  let currentTop = '-9999px';
  let currentLeft = '-9999px';
  if (isExpanded && !isMobile) {
    currentTop = '50%';
    currentLeft = '50%';
  } else if (position) {
    currentTop = `${position.top}px`;
    currentLeft = `${position.left}px`;
  }
  const currentTransform = isExpanded && !isMobile ? 'translate(-50%, -50%)' : 'none';
  const currentOpacity = isPositioned ? 1 : 0;
  const handleExpandToggle = () => {
    if (!isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  const headerHeight = '40px';

  return (
    <Box
      ref={playerWrapperRef}
      position="absolute"
      top={currentTop}
      left={currentLeft}
      width={currentWidth}
      height={currentHeight}
      zIndex="modal"
      bg="gray.800"
      borderRadius="md"
      boxShadow="lg"
      overflow="hidden"
      opacity={currentOpacity}
      transform={currentTransform}
      transition="opacity 0.2s ease"
      display="flex"
      flexDirection="column"
    >
      <Flex
        align="center"
        justify="space-between"
        p={2}
        bg="gray.100"
        borderBottom="1px solid"
        borderColor="gray.300"
        height={headerHeight}
        flexShrink={0}
      >
        {!isMobile ? (
          <IconButton
            aria-label={isExpanded ? 'Shrink video' : 'Expand video'}
            icon={<Icon icon={isExpanded ? 'reducer' : 'expander'} color="#0097CF" width="15px" height="15px" />}
            size="sm"
            variant="ghost"
            color="gray.600"
            _hover={{ bg: 'gray.200' }}
            onClick={handleExpandToggle}
          />
        ) : (
          <Box w="40px" />
        )}

        <Text fontWeight="bold" fontSize="sm" color="gray.700" isTruncated>
          {title}
        </Text>

        <IconButton
          aria-label="Close video"
          icon={<Icon icon="close" width="15px" height="15px" />}
          size="sm"
          variant="ghost"
          color="gray.600"
          _hover={{ bg: 'gray.200' }}
          onClick={onClose}
        />
      </Flex>

      <Box flexGrow={1} width="100%" height="100%" bg="black">
        <ReactPlayer
          url={videoUrl}
          playing
          controls={false}
          width="100%"
          height="100%"
          config={{
            youtube: {
              playerVars: {
                showinfo: 0,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}

VideoModal.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  positioningRef: PropTypes.oneOfType([
    PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  title: PropTypes.string,
};

VideoModal.defaultProps = {
  positioningRef: null,
  title: 'Video',
};

export default VideoModal;
