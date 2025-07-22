import {
  Box,
  Button,
  Link,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useState, memo } from 'react';
import useCohortHandler from '../../hooks/useCohortHandler';
import useStyle from '../../hooks/useStyle';
import useSocialShare from '../../hooks/useSocialShare';
import AssignmentButton from '../AssignmentButton';
import TaskBar from '../TaskBar';
import ShareButton from '../ShareButton';
import Icon from '../Icon';

function SyllabusActivity({
  data, currIndex, isDisabled, onDisabledClick, variant, showWarning, cohortSlug, setStage,
}) {
  const { t, lang } = useTranslation('dashboard');
  const { taskTodo, state, updateAssignment } = useCohortHandler();
  const { cohortSession, cohortsAssignments } = state;
  const [showModal, setShowModal] = useState(false);
  const { hexColor } = useStyle();

  const currentSlug = data.slug || '';
  const tasks = cohortSlug ? cohortsAssignments[cohortSlug]?.tasks : taskTodo;
  const currentTask = tasks?.length > 0 ? tasks.find((el) => el?.task_type === data?.task_type
    && el.associated_slug === currentSlug) : {};
  const taskTypeLowerCase = data?.task_type.toLowerCase();

  const {
    type, title, icon, target, url,
  } = data;

  const { socials, shareLink } = useSocialShare({
    info: currentTask,
    shareMessage: t('dashboard:share-message', { title: currentTask?.title }),
  });

  const sendProject = async ({
    task, githubUrl, taskStatus, flags,
  }) => {
    await updateAssignment({
      task, githubUrl, taskStatus, flags,
    });
    setShowModal(true);
  };

  const isDone = currentTask?.task_status === 'DONE' || currentTask?.revision_status === 'APPROVED';
  const isMandatoryTimeOut = showWarning && data?.task_type === 'PROJECT' && !isDone && data?.mandatory === true && data?.daysDiff >= 14; // exceeds 2 weeks

  const wordConnector = {
    lesson: t('modules.read'),
    exercise: t('modules.start'),
    project: t('modules.start'),
    quiz: t('modules.answer'),
  };
  const langLink = lang !== 'en' ? `/${lang}` : '';
  const taskTranslations = lang === 'en' ? (data?.translations?.en || data?.translations?.us) : (data?.translations?.[lang] || {});

  const baseLink = `${langLink}/syllabus/${cohortSlug || cohortSession?.slug}/${data.type.toLowerCase()}/${taskTranslations?.slug || currentTask?.associated_slug}`;
  const generateLink = () => {
    if (cohortSlug) {
      return `/main-cohort/${cohortSession?.slug}${baseLink}`;
    }
    return baseLink;
  };
  const link = isDisabled ? '#disabled' : generateLink();

  const variants = {
    'open-only': {
      rightItemHandler: (
        <Link href={link} color={hexColor.blueDefault}>
          {t('common:open')}
          {'  '}
          {data.type}
        </Link>
      ),
    },
  };

  return (
    <>
      <TaskBar
        mandatory={isMandatoryTimeOut}
        currIndex={currIndex}
        textWithLink
        link={link}
        isDone={isDone}
        onDisabledClick={onDisabledClick}
        leftContentStyle={isDisabled ? {
          textDecoration: 'none',
        } : {}}
        data={{
          type,
          title: taskTranslations?.title || title,
          icon,
          target,
          url,
        }}
        rightItemHandler={!isDisabled ? (
          <AssignmentButton
            currentTask={currentTask}
            sendProject={sendProject}
            setStage={setStage}
          />
        ) : (
          <Button variant="link" gridGap="4px" onClick={() => onDisabledClick({ ...data, title: taskTranslations?.title || title })}>
            <Icon icon="padlock" width="20px" height="20px" />
            <Box as="span" display={{ base: 'none', sm: 'initial' }}>
              {`${wordConnector?.[taskTypeLowerCase]} ${t(`common:${taskTypeLowerCase}`).toLocaleLowerCase()}`}
            </Box>
          </Button>
        )}
        {...variants[variant]}
      />
      {currentTask?.task_status === 'DONE' && showModal && (
        <ShareButton
          variant="outline"
          title={t('projects:share-certificate.title')}
          shareText={t('projects:share-certificate.share-via', { project: currentTask?.title })}
          link={shareLink}
          socials={socials}
          currentTask={currentTask}
          onlyModal
          withParty
        />
      )}
    </>
  );
}

SyllabusActivity.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  currIndex: PropTypes.number,
  isDisabled: PropTypes.bool,
  onDisabledClick: PropTypes.func,
  variant: PropTypes.string,
  showWarning: PropTypes.bool,
  cohortSlug: PropTypes.string,
  setStage: PropTypes.func,
};

SyllabusActivity.defaultProps = {
  data: {},
  currIndex: 0,
  isDisabled: false,
  onDisabledClick: () => { },
  variant: 'default',
  showWarning: true,
  cohortSlug: null,
  setStage: null,
};

export default memo(SyllabusActivity);
