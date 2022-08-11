import {
  useToast,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useEffect, useState, memo } from 'react';
import { useRouter } from 'next/router';
import { updateAssignment } from '../../common/hooks/useModuleHandler';
import useModuleMap from '../../common/store/actions/moduleMapAction';
import { ButtonHandlerByTaskStatus } from './taskHandler';
import ModuleComponent from '../../common/components/Module';
import { isWindow } from '../../utils/index';
import ShareButton from '../../common/components/ShareButton';
// import { usePersistent } from '../../common/hooks/usePersistent';

const Module = ({
  data, taskTodo, currIndex,
}) => {
  const { t } = useTranslation('dashboard');
  // const [cohortSession] = usePersistent('cohortSession', {});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { contextState, setContextState } = useModuleMap();
  const [currentTask, setCurrentTask] = useState(null);
  const [, setUpdatedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const pathConnector = {
    lesson: `${router.locale === 'en' ? '4geeks.com/lesson' : `4geeks.com/${router.locale}/lesson`}`,
    exercise: `${router.locale === 'en' ? '4geeks.com/interactive-exercise' : `4geeks.com/${router.locale}/interactive-exercise`}`,
    project: `${router.locale === 'en' ? '4geeks.com/project' : `4geeks.com/${router.locale}/project`}`,
    quiz: 'https://assessment.4geeks.com/quiz',
  };
  const shareLink = currentTask ? `${pathConnector[currentTask?.task_type?.toLowerCase()]}/${currentTask.associated_slug}` : '';
  const shareSocialMessage = {
    en: `I just finished coding ${currentTask?.title} at 4geeks.com`,
    es: `Acabo de terminar de programar ${currentTask?.title} en 4geeks.com`,
  };

  const socials = [
    {
      name: 'twitter',
      label: 'Twitter',
      href: `https://twitter.com/share?url=&text=${shareSocialMessage[router.locale]} %23100DaysOfCode%0A%0A${shareLink}`,
      color: '#1DA1F2',
    },
    {
      name: 'linkedin',
      label: 'LinkedIn',
      href: `https://linkedin.com/sharing/share-offsite/?url=${shareLink}`,
      color: '#0077B5',
    },
  ];

  const cohortSession = isWindow ? JSON.parse(localStorage.getItem('cohortSession') || '{}') : {};

  const closeSettings = () => {
    setSettingsOpen(false);
  };
  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  const currentSlug = data.slug ? data.slug : '';
  useEffect(() => {
    setCurrentTask(taskTodo.find((el) => el.task_type === data.task_type
    && el.associated_slug === currentSlug));
  }, [taskTodo, data.task_type, currentSlug]);

  const changeStatusAssignment = (event, task, taskStatus) => {
    event.preventDefault();
    setUpdatedTask({
      ...task,
    });
    updateAssignment({
      t, task, taskStatus, closeSettings, toast, contextState, setContextState,
    });
  };

  const sendProject = (task, githubUrl, taskStatus) => {
    setShowModal(true);
    updateAssignment({
      t, task, closeSettings, toast, githubUrl, taskStatus, contextState, setContextState,
    });
  };

  const isDone = currentTask?.task_status === 'DONE' || currentTask?.revision_status === 'APPROVED';
  const isMandatoryTimeOut = data?.task_type === 'PROJECT' && data?.task_status === 'PENDING' && data?.mandatory === true && data?.daysDiff >= 14; // exceeds 2 weeks
  return (
    <>
      <ModuleComponent
        mandatory={isMandatoryTimeOut}
        currIndex={currIndex}
        textWithLink
        link={`/syllabus/${cohortSession.slug}/${data.type.toLowerCase()}/${currentTask?.associated_slug}`}
        isDone={isDone}
        data={{
          type: data.type || 'Read',
          title: data.title,
          icon: data.icon,
        }}
        rightItemHandler={(
          <ButtonHandlerByTaskStatus
            currentTask={currentTask}
            sendProject={sendProject}
            changeStatusAssignment={changeStatusAssignment}
            toggleSettings={toggleSettings}
            closeSettings={closeSettings}
            settingsOpen={settingsOpen}
          />
        )}
      />
      {currentTask?.task_status === 'DONE' && showModal && (
        <ShareButton
          variant="outline"
          title={t('projects:share-certificate.title')}
          shareText={t('projects:share-certificate.share-via', { project: currentTask?.title })}
          link={shareLink}
          socials={socials}
          onlyModal
          withParty
        />
      )}
    </>
  );
};

Module.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  currIndex: PropTypes.number,
  taskTodo: PropTypes.arrayOf(PropTypes.object).isRequired,
};
Module.defaultProps = {
  data: {},
  currIndex: 0,
};

export default memo(Module);
