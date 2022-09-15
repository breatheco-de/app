import { Icon, Link } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import MarkDownParser from '../../common/components/MarkDownParser';
import { MDSkeleton } from '../../common/components/Skeleton';

const getReadme = ({
  ipynbHtmlUrl, readme, currentBlankProps, callToActionProps, currentData, lesson,
  quizSlug, lessonSlug,
}) => {
  const { t } = useTranslation('syllabus');

  if (ipynbHtmlUrl === null && readme && currentBlankProps?.target !== 'blank') {
    return (
      <MarkDownParser
        content={readme.content}
        callToActionProps={callToActionProps}
        titleRightSide={!ipynbHtmlUrl && currentData.url && (
          <Link href={`${currentData.url}`} width="fit-content" color="gray.400" target="_blank" rel="noopener noreferrer" display="flex" justifyContent="right" gridGap="12px" alignItems="center">
            <Icon icon="pencil" color="#A0AEC0" width="20px" height="20px" />
            {t('edit-page')}
          </Link>
        )}
        withToc={lesson.toLowerCase() === 'read'}
        frontMatter={{
          title: currentData.title,
          // subtitle: currentData.description,
          assetType: currentData.asset_type,
        }}
      />
    );
  }
  if (currentBlankProps?.target === 'blank') {
    return (
      <MarkDownParser
        content="# This Asset must open in external page"
        callToActionProps={callToActionProps}
        titleRightSide={currentBlankProps?.url && (
          <Link href={`${currentBlankProps?.url}`} width="fit-content" color="gray.400" target="_blank" rel="noopener noreferrer" display="flex" justifyContent="right" gridGap="12px" alignItems="center">
            <Icon icon="pencil" color="#A0AEC0" width="20px" height="20px" />
            {t('edit-page')}
          </Link>
        )}
        withToc={lesson.toLowerCase() === 'read'}
        frontMatter={{
          title: currentBlankProps?.title,
          // subtitle: currentBlankProps.description,
          assetType: currentBlankProps?.asset_type,
        }}
      />
    );
  }
  if (ipynbHtmlUrl === null && readme === null && quizSlug !== lessonSlug) {
    return <MDSkeleton />;
  }
  return false;
};

export default getReadme;
