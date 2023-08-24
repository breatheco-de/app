/* eslint-disable react/prop-types */
import useTranslation from 'next-translate/useTranslation';
import MarkDownParser from '../../common/components/MarkDownParser';
import { MDSkeleton } from '../../common/components/Skeleton';

function SyllabusMarkdownComponent({
  ipynbHtmlUrl, readme, currentBlankProps, callToActionProps, currentData, lesson,
  quizSlug, lessonSlug, currentTask,
}) {
  const { t } = useTranslation('syllabus');
  const blankText = t('blank-page', { url: currentBlankProps?.url });

  if (ipynbHtmlUrl === null && readme && currentBlankProps?.target !== 'blank') {
    return (
      <MarkDownParser
        content={readme.content}
        callToActionProps={callToActionProps}
        withToc={lesson?.toLowerCase() === 'read'}
        frontMatter={{
          title: currentData.title,
          // subtitle: currentData.description,
          assetType: currentData.asset_type,
        }}
        currentTask={currentTask}
        currentData={currentData}
      />
    );
  }
  if (currentBlankProps?.target === 'blank') {
    return (
      <MarkDownParser
        content={blankText}
        callToActionProps={callToActionProps}
        withToc={lesson?.toLowerCase() === 'read'}
        frontMatter={{
          title: currentBlankProps?.title,
          // subtitle: currentBlankProps.description,
          assetType: currentBlankProps?.asset_type,
        }}
        currentData={currentBlankProps}
      />
    );
  }
  if (ipynbHtmlUrl === null && readme === null && quizSlug !== lessonSlug) {
    return <MDSkeleton />;
  }
  return false;
}

export default SyllabusMarkdownComponent;
