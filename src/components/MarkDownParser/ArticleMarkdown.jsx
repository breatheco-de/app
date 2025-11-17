import React from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Box, Text, Flex, Button, Link, Heading, useColorModeValue } from '@chakra-ui/react';
import useModuleHandler from '../../hooks/useModuleHandler';
import Toc from './toc';
import ContentHeading from './ContentHeading';
import SubTasks from './SubTasks';
import MarkDownParser from './index';
import Icon from '../Icon';
import ProjectInstructions from '../GuidedExperience/ProjectInstructions';
import { languageFix } from '../../utils';
import useStyle from '../../hooks/useStyle';

function ArticleMarkdown({
  content, withToc, frontMatter, titleRightSide, currentTask, currentData,
  showLineNumbers, showInlineLineNumbers, assetData, isGuidedExperience, showTeachAlert,
  cohortModule,
}) {
  const { subTasks } = useModuleHandler();
  const { t, lang } = useTranslation('syllabus');
  const { hexColor } = useStyle();
  const yellowLight = useColorModeValue('#FFF4DC', '#4A3A1A');
  const yellowLight2 = useColorModeValue('#FFB718', '#D69E2E');

  const assetType = currentData?.asset_type;

  return (
    <>
      {!isGuidedExperience && (
        <ContentHeading
          titleRightSide={titleRightSide}
          callToAction={(assetType && assetType !== 'LESSON' && assetType !== 'ANSWER') && (
            <ProjectInstructions currentAsset={currentData} marginTop="20px" variant={!currentData.interactive && 'extra-small'} />
          )}
          content={frontMatter}
          currentData={currentData}
        />
      )}
      {showTeachAlert && cohortModule && (
        <Box bg="blue.100" p="4" mb="4" borderRadius="md" width="100%">
          <Flex alignItems="center" gap={4}>
            <Icon icon="warning" height="30px" width="30px" />
            <Text color="blue.800" fontWeight="bold">
              {
                t('teacherSidebar.no-need-to-teach-today.description', {
                  module_name: `#${cohortModule.id} - ${languageFix(cohortModule.label, lang)}`,
                })
              }
            </Text>
          </Flex>
        </Box>
      )}
      {withToc && (
        <Toc content={content} />
      )}

      {Array.isArray(subTasks) && subTasks?.length > 0 && (
        <SubTasks subTasks={subTasks} assetType={assetType} />
      )}

      {currentData?.solution_url && assetType !== 'LESSON' && assetType !== 'ANSWER' && (
        <Box
          display="flex"
          flexDirection="column"
          borderRadius="18px"
          p="16px 22px"
          mt="18px"
          gridGap="12px"
          background={yellowLight}
          border="1px solid"
          borderColor={yellowLight2}
        >
          <Heading as="p" size="14px" style={{ margin: 0 }} color={hexColor.fontColor2}>
            {t('project-has-solution')}
          </Heading>
          <Link
            href={currentData.solution_url}
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ textDecoration: 'none', opacity: 0.8 }}
          >
            <Button
              size="sm"
              colorScheme="yellow"
              variant="solid"
              width="fit-content"
            >
              {t('view-solution')}
            </Button>
          </Link>
        </Box>
      )}

      <MarkDownParser
        showLineNumbers={showLineNumbers}
        showInlineLineNumbers={showInlineLineNumbers}
        assetData={assetData}
        currentTask={currentTask}
        content={content}
      />
    </>
  );
}

ArticleMarkdown.propTypes = {
  content: PropTypes.string,
  withToc: PropTypes.bool,
  frontMatter: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
  titleRightSide: PropTypes.node,
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
  currentData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
  showLineNumbers: PropTypes.bool,
  showInlineLineNumbers: PropTypes.bool,
  assetData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object])),
  isGuidedExperience: PropTypes.bool,
  showTeachAlert: PropTypes.bool,
  cohortModule: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.number, PropTypes.array])),
};
ArticleMarkdown.defaultProps = {
  content: '',
  withToc: false,
  frontMatter: {},
  titleRightSide: null,
  currentTask: {},
  currentData: {},
  showLineNumbers: true,
  showInlineLineNumbers: true,
  assetData: null,
  isGuidedExperience: false,
  showTeachAlert: false,
  cohortModule: null,
};

export default ArticleMarkdown;
