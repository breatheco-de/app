import React, { useState, useRef, useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { Box, Button, useColorModeValue } from '@chakra-ui/react';
import ReactPlayerV2 from '../ReactPlayerV2';
import useStyle from '../../hooks/useStyle';
import Heading from '../Heading';
import Text from '../Text';
import Icon from '../Icon';

function ContentHeading({
  content, children, callToAction, titleRightSide, isGuidedExperience, currentData,
}) {
  const { t } = useTranslation('syllabus');
  const { backgroundColor4, hexColor } = useStyle();
  const { title, subtitle, assetType } = content;
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const headerRef = useRef(null);
  const assetTypeIcons = {
    LESSON: 'book',
    EXERCISE: 'strength',
    PROJECT: 'code',
    QUIZ: 'answer',
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderVisible(entry.isIntersecting);
      },
      {
        root: document.querySelector('.scrollable-container'),
        threshold: 0,
      },
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
    };
  }, []);

  const scrollTop = () => {
    const markdownBody = document.getElementById('markdown-body');
    markdownBody.scroll({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (assetType === 'PROJECT' && isGuidedExperience) {
    return (
      <>
        <Box
          borderStyle="solid"
          borderColor={useColorModeValue('gray.200', 'gray.900')}
        >
          <Box ref={headerRef} marginBottom="1.5rem">
            <Box
              background={backgroundColor4}
              margin={{ base: '0px -10px', md: '0px -2rem' }}
              borderRadius="11px 11px 0 0"
              padding="15px"
              borderBottom="1px solid #BBE5FE"
            >
              <Box display="flex" gap="20px">
                <Box display="flex" flexDirection="column" gap="16px">
                  <Box mb="16px">
                    <Box display="flex" gridGap="16px" alignItems="center">
                      <Icon icon={assetTypeIcons[assetType] || 'book'} height="30px" color={hexColor.blueDefault} width="28px" style={{ margin: 'auto', marginRight: '0.4rem' }} />
                      <Heading style={{ fontWeight: '400' }} size="sm" display="inline-flex" gridGap="10px" margin="0 0 0 0 !important">
                        {title}
                      </Heading>
                    </Box>
                    {currentData?.description && (
                      <Text style={{ margin: '0px' }} size="l">
                        {currentData.description}
                      </Text>
                    )}
                  </Box>
                  {children}
                </Box>
                <Box width="100%" borderRadius="11px" overflow="hidden">
                  <ReactPlayerV2
                    className="react-player-border-radius"
                    withThumbnail
                    iframeStyle={{ background: 'none', borderRadius: '11px' }}
                    thumbnailStyle={{
                      width: '100%',
                      borderRadius: '11px',
                    }}
                    url={currentData?.intro_video_url}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          zIndex="20"
          background={backgroundColor4}
          position="sticky"
          top="0"
          margin={{ base: '-1.5rem -10px 0 -10px', md: '-1.5rem -2rem 0 -2rem' }}
          borderBottom="1px solid #BBE5FE"
          padding="15px"
          display={isHeaderVisible ? 'none' : 'flex'}
          justifyContent="space-between"
          alignItems="center"
        >
          <Box display="flex" alignItems="center">
            <Icon icon={assetTypeIcons[assetType] || 'book'} width="20px" height="20px" color={hexColor.blueDefault} style={{ margin: 'auto', marginRight: '0.4rem' }} />
            <Heading style={{ fontWeight: '400' }} size="xsm" display="inline-flex" gridGap="10px" margin="0 0 0 0 !important">
              {title}
            </Heading>
          </Box>
          <Button display="flex" alignItems="center" gap="5px" variant="ghost" color={hexColor.blueDefault} onClick={scrollTop}>
            <Icon icon="layout" color={hexColor.blue} />
            {t('back-to-board')}
          </Button>
        </Box>
      </>
    );
  }

  return content && Object.keys(content).length !== 0 && (
    <Box
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
    >
      <Box marginBottom="1.5rem">
        <Box
          display="flex"
          justifyContent="space-between"
          gridGap="16px"
          background={isGuidedExperience && backgroundColor4}
          margin={isGuidedExperience ? { base: '0px -10px', md: '0px -2rem' } : { base: '1rem 0 0 0', md: '2rem 0 0 0' }}
          borderRadius={isGuidedExperience && '11px 11px 0 0'}
          padding={isGuidedExperience && '15px'}
          borderBottom={isGuidedExperience && '1px solid #BBE5FE'}
        >
          <Box display="flex" width={{ base: 'auto', md: 'calc(100% - 182px)' }} gridGap="16px" alignItems="center">
            <Icon icon={assetTypeIcons[assetType] || 'book'} height="30px" color="#0097CD" width="28px" style={{ margin: 'auto', marginRight: '0.4rem' }} />
            <Heading size="m" display="inline-flex" gridGap="10px" margin="0 0 0 0 !important">
              {title}
            </Heading>
          </Box>
          {titleRightSide}
        </Box>
        {callToAction}
        {subtitle && (
          <Text size="l" marginTop="0.5rem">
            {subtitle}
          </Text>
        )}
      </Box>
      {children}
    </Box>
  );
}

ContentHeading.propTypes = {
  content: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  callToAction: PropTypes.node,
  titleRightSide: PropTypes.node,
  isGuidedExperience: PropTypes.bool,
  currentData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
ContentHeading.defaultProps = {
  content: {},
  callToAction: null,
  titleRightSide: null,
  isGuidedExperience: false,
  currentData: null,
};

export default ContentHeading;
