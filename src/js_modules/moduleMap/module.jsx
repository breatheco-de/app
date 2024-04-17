import {
  Box,
  Button,
  useToast,
  Link,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useState, memo } from 'react';
import { updateAssignment } from '../../common/hooks/useModuleHandler';
import useStyle from '../../common/hooks/useStyle';
import useModuleMap from '../../common/store/actions/moduleMapAction';
import { ButtonHandlerByTaskStatus } from './taskHandler';
import ModuleComponent from '../../common/components/Module';
import { isWindow } from '../../utils/index';
import bc from '../../common/services/breathecode';
import ShareButton from '../../common/components/ShareButton';
import Icon from '../../common/components/Icon';
import { reportDatalayer } from '../../utils/requests';
// import { usePersistent } from '../../common/hooks/usePersistent';

function Module({
  data, taskTodo, currIndex, isDisabled, onDisabledClick, variant,
}) {
  const { t, lang } = useTranslation('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { contextState, setContextState } = useModuleMap();
  const [currentAssetData, setCurrentAssetData] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [, setUpdatedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { hexColor } = useStyle();
  const toast = useToast();

  const currentSlug = data.slug ? data.slug : '';
  const currentTask = taskTodo?.length > 0 ? taskTodo.find((el) => el?.task_type === data?.task_type
  && el.associated_slug === currentSlug) : {};
  const taskTypeLowerCase = data?.task_type.toLowerCase();

  const {
    type, title, icon, target, url,
  } = data;

  const pathConnector = {
    lesson: `${lang === 'en' ? '4geeks.com/lesson' : `4geeks.com/${lang}/lesson`}`,
    exercise: `${lang === 'en' ? '4geeks.com/interactive-exercise' : `4geeks.com/${lang}/interactive-exercise`}`,
    project: `${lang === 'en' ? '4geeks.com/project' : `4geeks.com/${lang}/project`}`,
    quiz: 'https://assessment.4geeks.com/quiz',
  };

  const shareLink = () => {
    if (currentTask?.slug) {
      if (target?.toLowerCase() === 'blank') {
        return url;
      }
      return `${pathConnector[currentTask?.task_type?.toLowerCase()]}/${currentTask.associated_slug}`;
    }
    return '';
  };

  const shareSocialMessage = {
    en: `I just finished coding ${currentTask?.title} at 4geeks.com`,
    es: `Acabo de terminar de programar ${currentTask?.title} en 4geeks.com`,
  };

  const socials = [
    {
      name: 'twitter',
      label: 'Twitter',
      href: `https://twitter.com/share?url=&text=${encodeURIComponent(shareSocialMessage[lang])} %23100DaysOfCode%0A%0A${shareLink()}`,
      color: '#1DA1F2',
    },
    {
      name: 'linkedin',
      label: 'LinkedIn',
      href: `https://linkedin.com/sharing/share-offsite/?url=${shareLink()}`,
      color: '#0077B5',
      target: 'popup',
    },
  ];

  const cohortSession = isWindow ? JSON.parse(localStorage.getItem('cohortSession') || '{}') : {};

  const closeSettings = () => {
    setSettingsOpen(false);
  };
  const toggleSettings = async () => {
    const assetResp = await bc.lesson().getAsset(currentTask.associated_slug);
    if (assetResp?.status < 400) {
      const assetData = await assetResp.data;
      if (assetData?.translations?.[lang]) {
        const localeResp = await bc.lesson().getAsset(assetResp?.data?.translations[lang]);
        const localeData = await localeResp.data;
        if (localeResp?.status < 400) {
          setCurrentAssetData(localeData);
        } else {
          setCurrentAssetData(assetData);
        }
      } else {
        setCurrentAssetData(assetData);
      }
      setSettingsOpen(!settingsOpen);
    } else {
      toast({
        position: 'top',
        title: t('alert-message:something-went-wrong'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  const handleOpen = async (onOpen = () => {}) => {
    const taskIsApprovedOrRejected = currentTask?.revision_status === 'APPROVED' || currentTask?.revision_status === 'REJECTED';
    if (currentTask && currentTask?.task_type === 'PROJECT' && (currentTask.task_status === 'DONE' || taskIsApprovedOrRejected)) {
      const assetResp = await bc.lesson().getAsset(currentTask.associated_slug);
      if (assetResp?.status < 400) {
        const assetData = await assetResp.data;
        setCurrentAssetData(assetData);

        if (!assetData?.delivery_formats.includes('url')) {
          const fileResp = await bc.todo().getFile({ id: currentTask.id });
          const respData = await fileResp.data;
          setFileData(respData);
          onOpen();
        } else {
          onOpen();
        }
      } else {
        onOpen();
      }
    }
  };

  const changeStatusAssignment = async (event, task, taskStatus) => {
    if (currentTask?.slug || currentTask?.associated_slug) {
      event.preventDefault();
      reportDatalayer({
        dataLayer: {
          event: 'assignment_status_updated',
          task_status: taskStatus,
          task_id: task.id,
          task_title: task.title,
          task_associated_slug: task.associated_slug,
          task_type: task.task_type,
          task_revision_status: task.revision_status,
        },
      });
      setUpdatedTask({
        ...task,
      });
      await updateAssignment({
        t, task, taskStatus, closeSettings, toast, contextState, setContextState,
      });
    }
  };

  const sendProject = async ({
    task, githubUrl, taskStatus,
  }) => {
    setShowModal(true);
    await updateAssignment({
      t, task, closeSettings, toast, githubUrl, taskStatus, contextState, setContextState,
    });
  };

  const isDone = currentTask?.task_status === 'DONE' || currentTask?.revision_status === 'APPROVED';
  const isMandatoryTimeOut = data?.task_type === 'PROJECT' && !isDone && data?.mandatory === true && data?.daysDiff >= 14; // exceeds 2 weeks

  const wordConnector = {
    lesson: t('modules.read'),
    exercise: t('modules.start'),
    project: t('modules.start'),
    quiz: t('modules.answer'),
  };
  const langLink = lang !== 'en' ? `/${lang}` : '';
  const taskTranslations = lang === 'en' ? (data?.translations?.en || data?.translations?.us) : (data?.translations?.[lang] || {});

  const link = isDisabled ? '#disabled' : `${langLink}/syllabus/${cohortSession.slug}/${data.type.toLowerCase()}/${taskTranslations?.slug || currentTask?.associated_slug}`;

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
      <ModuleComponent
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
          <ButtonHandlerByTaskStatus
            currentTask={currentTask}
            sendProject={sendProject}
            changeStatusAssignment={changeStatusAssignment}
            toggleSettings={toggleSettings}
            closeSettings={closeSettings}
            settingsOpen={settingsOpen}
            handleOpen={handleOpen}
            currentAssetData={currentAssetData}
            fileData={fileData}
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
          link={shareLink()}
          socials={socials}
          currentTask={currentTask}
          onlyModal
          withParty
        />
      )}
    </>
  );
}

Module.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  currIndex: PropTypes.number,
  taskTodo: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))).isRequired,
  isDisabled: PropTypes.bool,
  onDisabledClick: PropTypes.func,
  variant: PropTypes.string,
};
Module.defaultProps = {
  data: {},
  currIndex: 0,
  isDisabled: false,
  onDisabledClick: () => {},
  variant: 'default',
};

export default memo(Module);
