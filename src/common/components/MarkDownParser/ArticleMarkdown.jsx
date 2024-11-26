import React from 'react';
import PropTypes from 'prop-types';
import useModuleHandler from '../../hooks/useModuleHandler';
import Toc from './toc';
import ContentHeading from './ContentHeading';
import SubTasks from './SubTasks';
import MarkDownParser from './index';
import ProjectInstructions from '../../../js_modules/syllabus/ProjectInstructions';

function ArticleMarkdown({
  content, withToc, frontMatter, titleRightSide, currentTask, currentData,
  showLineNumbers, showInlineLineNumbers, assetData, alerMessage, isGuidedExperience,
}) {
  const { subTasks } = useModuleHandler();

  const assetType = currentData?.asset_type;

  return (
    <>
      {!isGuidedExperience && (
        <ContentHeading
          titleRightSide={titleRightSide}
          callToAction={(currentData?.interactive || currentData?.asset_type === 'PROJECT') && (
            <ProjectInstructions currentAsset={currentData} />
          )}
          content={frontMatter}
          currentData={currentData}
        />
      )}
      {withToc && (
        <Toc content={content} />
      )}

      {alerMessage && alerMessage}

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
  alerMessage: PropTypes.node,
  isGuidedExperience: PropTypes.bool,
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
  alerMessage: null,
  isGuidedExperience: false,
};

export default ArticleMarkdown;
