import React from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Box, Text } from '@chakra-ui/react';
import useModuleHandler from '../../hooks/useModuleHandler';
import Toc from './toc';
import ContentHeading from './ContentHeading';
import SubTasks from './SubTasks';
import MarkDownParser from './index';
import ProjectInstructions from '../GuidedExperience/ProjectInstructions';
import { languageFix } from '../../utils';

function ArticleMarkdown({
  content, withToc, frontMatter, titleRightSide, currentTask, currentData,
  showLineNumbers, showInlineLineNumbers, assetData, isGuidedExperience, showTeachAlert,
  cohortModule,
}) {
  const { subTasks } = useModuleHandler();
  const { t, lang } = useTranslation('syllabus');

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
          <Text color="blue.800" fontWeight="bold">
            {
              t('teacherSidebar.no-need-to-teach-today.description', {
                module_name: `#${cohortModule.id} - ${languageFix(cohortModule.label, lang)}`,
              })
            }
          </Text>
        </Box>
      )}
      {withToc && (
        <Toc content={content} />
      )}

      {Array.isArray(subTasks) && subTasks?.length > 0 && (
        <SubTasks subTasks={subTasks} assetType={assetType} />
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
