/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { Box, Button, useColorModeValue } from '@chakra-ui/react';
import TaskCodeRevisions from './TaskCodeRevisions';
import useModuleHandler from '../../common/hooks/useModuleHandler';
import useStyle from '../../common/hooks/useStyle';
import SubTasks from '../../common/components/MarkDownParser/SubTasks';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';

function ProjectHeading({ currentAsset, isDelivered }) {
  const { backgroundColor4, hexColor } = useStyle();
  const { subTasks } = useModuleHandler();

  const title = currentAsset?.title;
  const assetType = currentAsset?.asset_type;
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
        flexDirection={{ base: 'column', sm: 'row' }}
      >
        <Box display="flex" flexDirection="column" gap="16px">
          <Box mb="16px">
            <Box display="flex" gridGap="16px" alignItems="center">
              <Icon icon={assetTypeIcons[assetType] || 'book'} height="30px" color={hexColor.blueDefault} width="28px" style={{ margin: 'auto', marginRight: '0.4rem' }} />
              <Heading style={{ fontWeight: '400' }} size="sm" display="inline-flex" gridGap="10px" margin="0 0 0 0 !important">
                {title}
              </Heading>
            </Box>
            {currentAsset?.description && (
            <Text style={{ margin: '0px' }} size="l">
              {currentAsset.description}
            </Text>
            )}
          </Box>
          <Box display="flex" alignItems="center" gap="16px" flexDirection={{ base: 'column', sm: 'row' }}>
            {Array.isArray(subTasks) && subTasks?.length > 0 && (
              <SubTasks variant={isDelivered && 'square'} subTasks={subTasks} assetType={assetType} mt="none" />
            )}
            {isDelivered && (
              <Box width="100%" borderRadius="11px" overflow="hidden" height="100%">
                <ReactPlayerV2
                  className="react-player-border-radius"
                  withThumbnail
                  containerStyle={{ height: '100%' }}
                  iframeStyle={{ background: 'none', borderRadius: '11px', height: '100% !important' }}
                  thumbnailStyle={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '11px',
                  }}
                  url={currentAsset?.intro_video_url}
                  height="100%"
                />
              </Box>
            )}
          </Box>
        </Box>
        {!isDelivered && (
          <ReactPlayerV2
            className="react-player-border-radius"
            withThumbnail
            iframeStyle={{ background: 'none', borderRadius: '11px' }}
            thumbnailStyle={{
              width: '100%',
              borderRadius: '11px',
            }}
            url={currentAsset?.intro_video_url}
            containerStyle={{ width: '100%', maxWidth: '600px' }}
          />
        )}
      </Box>
    </>
  );
}

function ProjectBoardGuidedExperience({ currentAsset }) {
  const { t } = useTranslation('syllabus');
  const { currentTask } = useModuleHandler();
  const headerRef = useRef(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const { backgroundColor4, hexColor, backgroundColor, featuredLight } = useStyle();

  const title = currentAsset?.title;
  const assetType = currentAsset?.asset_type;

  const isDelivered = currentTask?.task_status === 'DONE';
  const isRevissionPending = currentTask?.revission_status === 'DONE';

  const assetTypeIcons = {
    LESSON: 'book',
    EXERCISE: 'strength',
    PROJECT: 'code',
    QUIZ: 'answer',
  };

  const scrollTop = () => {
    const markdownBody = document.getElementById('main-container');
    markdownBody.scroll({
      top: 0,
      behavior: 'smooth',
    });
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

  return (
    <>
      <Box
        id="project-board"
        ref={headerRef}
        display="flex"
        gap="20px"
        mb={isDelivered && '1.5rem'}
        flexDirection={{ base: 'column', md: 'row' }}
        // margin={{ base: '0px -10px', md: '0px -2rem' }}
      >
        <Box display="flex" flexDirection="column" gap="20px" width="100%">
          <ProjectHeading currentAsset={currentAsset} isDelivered={isDelivered} />
          {isDelivered && (
            <Box padding="16px" background={backgroundColor} borderRadius="16px" height="100%">
              <Heading size="18px" mb="16px">
                {t('teachers-feedback')}
              </Heading>
              {currentTask.description ? (
                <Box height="calc(100% - 40px)" background={featuredLight} borderRadius="11px" padding="8px">
                  <Text size="md" color={hexColor.fontColor3}>
                    {currentTask.description}
                  </Text>
                </Box>
              ) : (
                <>
                  <Heading textAlign="center" size="18px" mb="8px" color={hexColor.fontColor3}>
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
          <TaskCodeRevisions currentTask={currentTask} />
        )}
      </Box>
      <Box
        zIndex="20"
        background={backgroundColor4}
        position="sticky"
        top="0"
        // margin={{ base: '-1.5rem -10px 0 -10px', md: '-1.5rem -2rem 0 -2rem' }}
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

ProjectBoardGuidedExperience.propTypes = {
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
ProjectBoardGuidedExperience.defaultProps = {
  currentAsset: null,
};

ProjectHeading.propTypes = {
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  isDelivered: PropTypes.bool,
};
ProjectHeading.defaultProps = {
  currentAsset: null,
  isDelivered: false,
};

export default ProjectBoardGuidedExperience;
