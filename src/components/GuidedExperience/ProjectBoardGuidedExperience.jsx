/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import {
  Box, useColorModeValue, Flex, Tooltip,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import SubtasksPill from './SubtasksPill';
import StatusPill from './StatusPill';
import Topbar from './Topbar';
import TaskCodeRevisions from './TaskCodeRevisions';
import ProjectInstructions from './ProjectInstructions';
import useModuleHandler from '../../hooks/useModuleHandler';
import useStyle from '../../hooks/useStyle';
import ReactPlayerV2 from '../ReactPlayerV2';
import Heading from '../Heading';
import Text from '../Text';
import Icon from '../Icon';

function ProjectHeading({ currentAsset, isDelivered, handleStartLearnpack }) {
  const { backgroundColor4, hexColor } = useStyle();

  const title = currentAsset?.title;
  const assetType = currentAsset?.asset_type;
  const includesVideo = currentAsset?.intro_video_url;
  const assetTypeIcons = {
    LESSON: 'book',
    EXERCISE: 'strength',
    PROJECT: 'code',
    QUIZ: 'answer',
  };

  return (
    <>
      <Box
        width="100%"
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        // marginBottom={!isDelivered && '1.5rem'}
        background={backgroundColor4}
        borderRadius={!isDelivered ? '11px 11px 0 0' : '11px'}
        padding="15px"
        borderBottom={!isDelivered && '1px solid #BBE5FE'}
        display="flex"
        gap="20px"
        justifyContent="space-between"
        flexDirection={{ base: 'column', sm: isDelivered ? 'column' : 'row' }}
      >
        <Box display="flex" flexDirection="column" gap="16px" width="100%">
          <Box display="flex" flexDirection={includesVideo ? 'column' : 'row'} flexWrap={!includesVideo && 'wrap'} justifyContent="space-between" height="100%" gap="20px">
            <Box>
              <Box mb={includesVideo && '16px'} display="flex" gridGap="16px" alignItems="center" height={!includesVideo && '100%'}>
                <Icon icon={assetTypeIcons[assetType] || 'book'} height="30px" color={hexColor.blueDefault} width="28px" style={{ margin: 'auto', marginRight: '0.4rem' }} />
                <Heading style={{ fontWeight: '400' }} size="sm" display="inline-flex" gridGap="10px" margin="0 0 0 0 !important">
                  {title}
                </Heading>
              </Box>
              {currentAsset?.description && includesVideo && (
                <Text style={{ margin: '0px' }} size="l">
                  {currentAsset.description}
                </Text>
              )}
            </Box>
            <Box>
              <ProjectInstructions variant={includesVideo ? 'small' : 'extra-small'} currentAsset={currentAsset} handleStartLearnpack={handleStartLearnpack} />
            </Box>
          </Box>
        </Box>
        <ReactPlayerV2
          className="react-player-border-radius"
          controls={false}
          withThumbnail
          iframeStyle={{ background: 'none', borderRadius: '11px' }}
          thumbnailStyle={{
            width: '100%',
            borderRadius: '11px',
          }}
          url={currentAsset?.intro_video_url}
          containerStyle={{
            width: '100%',
            maxWidth: { base: 'none', sm: isDelivered ? 'none' : '50%' },
          }}
        />
      </Box>
    </>
  );
}

function ProjectBoardGuidedExperience({ currentAsset, handleStartLearnpack }) {
  const { t } = useTranslation('syllabus');
  const { currentTask } = useModuleHandler();
  const headerRef = useRef(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const {
    hexColor, backgroundColor, featuredLight,
  } = useStyle();

  const isDelivered = currentTask?.task_status === 'DONE' && currentAsset?.delivery_formats !== 'no_delivery';

  const getTooltipInfo = (status) => {
    switch (status) {
      case 'APPROVED':
        return {
          label: t('approved-tooltip'),
          bg: hexColor.green,
        };
      case 'REJECTED':
        return {
          label: t('rejected-tooltip'),
          bg: hexColor.error,
        };
      case 'PENDING':
        return {
          label: t('pending-tooltip'),
          bg: hexColor.warning,
        };
      default:
        return {
          label: null,
          bg: hexColor.fontColor3,
        };
    }
  };

  const tooltipInfo = getTooltipInfo(currentTask?.revision_status);

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

  return (
    <>
      <Box
        id="project-board"
        ref={headerRef}
        display="flex"
        gap="20px"
        mb={isDelivered && '1.5rem'}
        flexDirection={{ base: 'column', md: 'row' }}
      >
        <Box display="flex" flexDirection="column" gap="20px" width="100%">
          <ProjectHeading currentAsset={currentAsset} isDelivered={isDelivered} handleStartLearnpack={handleStartLearnpack} />
          {isDelivered && (
            <Box padding="16px" background={backgroundColor} borderRadius="16px" height="100%">
              <Flex justifyContent="space-between">
                <Heading size="18px" mb="16px">
                  {t('teachers-feedback')}
                </Heading>
                <Tooltip label={tooltipInfo.label} placement="top">
                  <Flex
                    alignItems="flex-start"
                    gap="4px"
                    mb="16px"
                    cursor="pointer"
                    background={tooltipInfo.bg}
                    padding="0 8px"
                    borderRadius="full"
                  >
                    <Text
                      size="md"
                      color="white"
                    >
                      {`${t('assignments:type.project')} ${t(`assignments:status.${currentTask?.revision_status?.toLowerCase()}`).toLowerCase()}`}
                    </Text>
                    <Icon
                      alignSelf="center"
                      pt="2px"
                      icon="info"
                      color="white"
                      width="10px"
                      height="10px"
                      style={{ margin: '0px' }}
                    />
                  </Flex>
                </Tooltip>
              </Flex>
              {currentTask.description ? (
                <Box height="calc(100% - 40px)" background={featuredLight} borderRadius="11px" padding="8px">
                  <Text size="md" color={hexColor.fontColor3}>
                    {currentTask.description}
                  </Text>
                </Box>
              ) : (
                <>
                  <Heading textAlign="center" size="18px" mb="16px" color={hexColor.fontColor3}>
                    {t('no-feedback')}
                  </Heading>
                  <Text size="md" textAlign="center" color={hexColor.fontColor3}>
                    {t('task-notification')}
                  </Text>
                </>
              )}
            </Box>
          )}
        </Box>
        {isDelivered && (
          <TaskCodeRevisions />
        )}
      </Box>
      <Topbar currentAsset={currentAsset} display={isHeaderVisible ? 'none' : 'flex'} handleStartLearnpack={handleStartLearnpack} buttonsHandlerVariant="extra-small" />
    </>
  );
}

ProjectBoardGuidedExperience.propTypes = {
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  handleStartLearnpack: PropTypes.func.isRequired,
};
ProjectBoardGuidedExperience.defaultProps = {
  currentAsset: null,
};

ProjectHeading.propTypes = {
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  isDelivered: PropTypes.bool,
  handleStartLearnpack: PropTypes.func.isRequired,
};
ProjectHeading.defaultProps = {
  currentAsset: null,
  isDelivered: false,
};

export default ProjectBoardGuidedExperience;

export { StatusPill, SubtasksPill };
