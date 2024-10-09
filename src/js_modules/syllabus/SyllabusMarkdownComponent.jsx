/* eslint-disable react/prop-types */
import useTranslation from 'next-translate/useTranslation';
import MarkDownParser from '../../common/components/MarkDownParser';
import { MDSkeleton } from '../../common/components/Skeleton';

function SyllabusMarkdownComponent({
  ipynbHtmlUrl, readme, currentBlankProps, currentData, lesson,
  quizSlug, lessonSlug, currentTask, alerMessage, isGuidedExperience,
  grantSyllabusAccess,
}) {
  const { t } = useTranslation('syllabus');
  const blankText = t('blank-page', { url: currentBlankProps?.url });

  if (ipynbHtmlUrl === null && readme && currentBlankProps?.target !== 'blank' && grantSyllabusAccess) {
    return (
      <MarkDownParser
        content={readme.content}
        withToc={lesson?.toLowerCase() === 'read'}
        showContentHeading={!(currentData.asset_type === 'PROJECT' && isGuidedExperience)}
        isGuidedExperience={isGuidedExperience}
        frontMatter={{
          title: currentData.title,
          // subtitle: currentData.description,
          assetType: currentData.asset_type,
        }}
        currentTask={currentTask}
        currentData={currentData}
        alerMessage={alerMessage}
      />
    );
  }
  if (currentBlankProps?.target === 'blank' && grantSyllabusAccess) {
    return (
      <MarkDownParser
        content={blankText}
        withToc={lesson?.toLowerCase() === 'read'}
        isGuidedExperience={isGuidedExperience}
        frontMatter={{
          title: currentBlankProps?.title,
          // subtitle: currentBlankProps.description,
          assetType: currentBlankProps?.asset_type,
        }}
        currentData={currentBlankProps}
        alerMessage={alerMessage}
      />
    );
  }
  if ((ipynbHtmlUrl === null && readme === null && quizSlug !== lessonSlug) || !grantSyllabusAccess) {
    return <MDSkeleton />;
  }
  return false;
}

export default SyllabusMarkdownComponent;
