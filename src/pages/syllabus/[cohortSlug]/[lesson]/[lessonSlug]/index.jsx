/* eslint-disable no-extra-boolean-cast */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Flex, useDisclosure, Link, useToast,
  useColorModeValue, Select, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalCloseButton, ModalBody, Button,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { isWindow, assetTypeValues, getExtensionName } from '../../../../../utils';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import Heading from '../../../../../common/components/Heading';
import { updateAssignment, startDay } from '../../../../../common/hooks/useModuleHandler';
import { ButtonHandlerByTaskStatus } from '../../../../../js_modules/moduleMap/taskHandler';
import getMarkDownContent from '../../../../../common/components/MarkDownParser/markdown';
import MarkDownParser from '../../../../../common/components/MarkDownParser';
import Text from '../../../../../common/components/Text';
import useAuth from '../../../../../common/hooks/useAuth';
import { usePersistent } from '../../../../../common/hooks/usePersistent';
import StickySideBar from '../../../../../common/components/StickySideBar';
import Icon from '../../../../../common/components/Icon';
import AlertMessage from '../../../../../common/components/AlertMessage';
import useModuleMap from '../../../../../common/store/actions/moduleMapAction';
import ShareButton from '../../../../../common/components/ShareButton';
import ModalInfo from '../../../../../js_modules/moduleMap/modalInfo';
import ReactPlayerV2 from '../../../../../common/components/ReactPlayerV2';
import ScrollTop from '../../../../../common/components/scrollTop';
import TimelineSidebar from '../../../../../js_modules/syllabus/TimelineSidebar';
import {
  defaultDataFetch, getCurrentCohort, prepareCohortContext, prepareTaskModules,
} from '../../../../../js_modules/syllabus/dataFetch';
import getReadme from '../../../../../js_modules/syllabus/getReadme';

const Content = () => {
  const { t } = useTranslation('syllabus');
  const { isLoading, user, choose } = useAuth();
  const [cohortSession, setCohortSession] = usePersistent('cohortSession', {});
  const [sortedAssignments, setSortedAssignments] = usePersistent('sortedAssignments', []);
  const [taskTodo, setTaskTodo] = usePersistent('taskTodo', []);
  const { contextState, setContextState } = useModuleMap();
  const [currentTask, setCurrentTask] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modalSettingsOpen, setModalSettingsOpen] = useState(false);
  const { isOpen, onToggle } = useDisclosure();
  const [openNextPageModal, setOpenNextPageModal] = useState(false);
  const [readme, setReadme] = useState(null);
  const [ipynbHtmlUrl, setIpynbHtmlUrl] = useState(null);
  const [extendedInstructions, setExtendedInstructions] = useState(null);
  const [extendedIsEnabled, setExtendedIsEnabled] = useState(false);
  const [showPendingTasks, setShowPendingTasks] = useState(false);
  const [currentSelectedModule, setCurrentSelectedModule] = useState(null);
  const [nextModule, setNextModule] = useState(null);
  const [prevModule, setPrevModule] = useState(null);
  const [openNextModuleModal, setOpenNextModuleModal] = useState(false);
  const [quizSlug, setQuizSlug] = useState(null);
  const [showSolutionVideo, setShowSolutionVideo] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState({});
  const [defaultSelectedSyllabus, setDefaultSelectedSyllabus] = useState({});
  const [callToActionProps, setCallToActionProps] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [readmeUrlPathname, setReadmeUrlPathname] = useState(null);
  const [openTargetBlankModal, setOpenTargetBlankModal] = useState(null);
  const [currentBlankProps, setCurrentBlankProps] = useState(null);
  const [clickedPage, setClickedPage] = useState({});
  const [currentData, setCurrentData] = useState({});
  const toast = useToast();
  const router = useRouter();
  const taskIsNotDone = currentTask && currentTask.task_status !== 'DONE';

  const profesionalRoles = ['TEACHER', 'ASSISTANT', 'REVIEWER'];
  const accessToken = isWindow ? localStorage.getItem('accessToken') : '';

  //                                          gray.200    gray.500
  const commonBorderColor = useColorModeValue('#E2E8F0', '#718096');
  const commonFeaturedColors = useColorModeValue('featuredLight', 'featuredDark');

  const Open = !isOpen;
  const { label, teacherInstructions, keyConcepts } = selectedSyllabus;

  const filterEmptyModules = sortedAssignments.filter(
    (assignment) => assignment.modules.length > 0,
  );

  const currentTheme = useColorModeValue('light', 'dark');

  const firstTask = nextModule?.modules[0];
  const lastPrevTask = prevModule?.modules[prevModule?.modules.length - 1];

  // const { cohortSlug, lesson, lessonSlug } = router.query;
  const cohortSlug = router?.query?.cohortSlug;
  const lesson = router?.query?.lesson;
  const lessonSlug = router?.query?.lessonSlug;

  const language = router.locale === 'en' ? 'us' : 'es';

  const isQuiz = lesson === 'answer';

  const filteredCurrentAssignments = filterEmptyModules.map((section) => {
    const currentAssignments = showPendingTasks
      ? section.filteredModulesByPending
      : section.filteredModules;
    return currentAssignments;
  });

  const currentModuleIndex = filteredCurrentAssignments.findIndex((s) => {
    const currIndex = s?.some((l) => l.slug === lessonSlug);
    return currIndex;
  });

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartDay = () => {
    const updatedTasks = (nextModule.modules || [])?.map((l) => ({
      ...l,
      associated_slug: l.slug,
      cohort: cohortSession.id,
    }));
    const customHandler = () => {
      if (nextModule && cohortSlug && firstTask) {
        router.push(router.push(`/syllabus/${cohortSlug}/${firstTask?.type?.toLowerCase()}/${firstTask?.slug}`));
      }
    };
    if (user?.id) {
      startDay({
        t,
        id: user.id,
        newTasks: updatedTasks,
        contextState,
        setContextState,
        toast,
        customHandler,
      });
    }
  };

  useEffect(() => {
    getCurrentCohort({
      cohortSlug,
      choose,
      router,
      t,
    });
  }, []);

  useEffect(() => {
    if (taskTodo.length > 0) {
      setCurrentTask(taskTodo.find((el) => el.task_type === assetTypeValues[lesson]
      && el.associated_slug === lessonSlug));
    }
  }, [taskTodo, lessonSlug, lesson]);

  const closeSettings = () => {
    setSettingsOpen(false);
    setModalSettingsOpen(false);
  };
  const toggleSettings = () => {
    if (openNextPageModal) {
      setModalSettingsOpen(!modalSettingsOpen);
    } else {
      setSettingsOpen(!settingsOpen);
    }
  };

  const changeStatusAssignment = (event, task, taskStatus) => {
    event.preventDefault();
    updateAssignment({
      t, task, taskStatus, closeSettings, toast, contextState, setContextState,
    });
  };

  const sendProject = ({ task, githubUrl, taskStatus }) => {
    setShowModal(true);
    updateAssignment({
      t, task, closeSettings, toast, githubUrl, taskStatus, contextState, setContextState,
    });
  };

  const onClickAssignment = (e, item) => {
    const link = `/syllabus/${cohortSlug}/${item.type?.toLowerCase()}/${item.slug}`;

    router.push(link);
    setCurrentData({});
    setCurrentSelectedModule(null);
    setCallToActionProps({});
    setReadme(null);
    setIpynbHtmlUrl(null);
    setCurrentBlankProps(null);
  };

  const EventIfNotFound = () => {
    setCurrentData({});
    toast({
      title: t('alert-message:content-not-found', { lesson }),
      // description: 'Content not found',
      status: 'error',
      duration: 7000,
      isClosable: true,
    });
  };

  useEffect(() => {
    const currTask = filterEmptyModules[currentModuleIndex]?.modules?.find((l) => l.slug === lessonSlug);

    if (currTask?.target === 'blank') {
      setCurrentBlankProps(currTask);
    } else if (currentBlankProps === null || currentBlankProps?.target !== 'blank') {
      axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${lessonSlug}?asset_type=${assetTypeValues[lesson]}`)
        .then(({ data }) => {
          const urlPathname = data.readme_url ? data.readme_url.split('https://github.com')[1] : null;
          setCallToActionProps({
            token: accessToken,
            assetSlug: lessonSlug,
            gitpod: data.gitpod,
            assetType: assetTypeValues[lesson],
          });
          setReadmeUrlPathname(urlPathname);
          let currentlocaleLang = data.translations[language];
          const exensionName = getExtensionName(data.readme_url);
          if (exensionName === 'ipynb') {
            setIpynbHtmlUrl(`${process.env.BREATHECODE_HOST}/v1/registry/asset/preview/${lessonSlug}?theme=${currentTheme}&plain=true`);
            setCurrentData(data);
          } else {
            setIpynbHtmlUrl(null);
            if (currentlocaleLang === undefined) {
              currentlocaleLang = `${lessonSlug}-${language}`;
            }
            Promise.all([
              axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${currentlocaleLang}.md`),
              axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${currentlocaleLang}?asset_type=${assetTypeValues[lesson]}`),
            ])
              .then(([respMarkdown, respData]) => {
                const currData = respData.data;
                const markdownData = respMarkdown.data;

                if (lesson === 'answer') {
                  setQuizSlug(currentlocaleLang);
                } else {
                  setQuizSlug(null);
                }
                if (currData !== undefined && typeof markdownData === 'string') {
                  // Binary base64 decoding ⇢ UTF-8
                  const markdown = getMarkDownContent(markdownData);
                  setReadme(markdown);
                  setCurrentData(currData);
                }
              })
              .catch(() => {
                defaultDataFetch({
                  currentBlankProps,
                  lessonSlug,
                  assetTypeValues,
                  lesson,
                  setQuizSlug,
                  setReadme,
                  setCurrentData,
                  setIpynbHtmlUrl,
                  router,
                  t,
                });
              });
          }
        }).catch(() => {
          EventIfNotFound();
        });
    }
  }, [router, lessonSlug]);

  useEffect(() => {
    if (sortedAssignments.length <= 0) {
      router.push('/choose-program');
      toast({
        title: t('alert-message:no-cohort-modules-found'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
    const findSelectedSyllabus = sortedAssignments.find((l) => l.id === currentSelectedModule);
    const currModuleIndex = sortedAssignments.findIndex(
      (l) => l.modules.some((m) => m.slug === lessonSlug),
    );
    const nextModuleData = sortedAssignments[currModuleIndex + 1];
    const prevModuleData = sortedAssignments[currModuleIndex - 1];

    const defaultSyllabus = sortedAssignments.filter(
      (l) => l.modules.find((m) => m.slug === lessonSlug),
    )[0];

    if (defaultSyllabus) {
      setSelectedSyllabus(findSelectedSyllabus || defaultSyllabus);
      setNextModule(nextModuleData);
      setPrevModule(prevModuleData);
      setDefaultSelectedSyllabus(defaultSyllabus);
    }
  }, [sortedAssignments, lessonSlug, currentSelectedModule]);

  useEffect(() => {
    if (selectedSyllabus.extendedInstructions) {
      const content = selectedSyllabus.extendedInstructions;
      const markdown = getMarkDownContent(content);
      setExtendedInstructions(markdown);
    }
  }, [selectedSyllabus]);

  useEffect(() => {
    if (!isLoading && user?.active_cohort && cohortSession?.cohort_role) {
      prepareCohortContext({
        user, cohortSession, setCohortSession, setContextState, router, t,
      });
    }
  }, [isLoading]);

  useEffect(() => {
    const cohortProgram = contextState?.cohortProgram;
    const moduleData = cohortProgram.json?.days || cohortProgram.json?.modules;
    const cohort = cohortProgram.json ? moduleData : [];

    if (contextState.cohortProgram.json && contextState.taskTodo) {
      setTaskTodo(contextState.taskTodo);
      prepareTaskModules({
        contextState, cohort, setSortedAssignments,
      });
    }
  }, [contextState.cohortProgram, contextState.taskTodo, router]);

  const GetReadme = () => getReadme({
    ipynbHtmlUrl,
    readme,
    currentBlankProps,
    callToActionProps,
    currentData,
    lesson,
    quizSlug,
    lessonSlug,
    currentTask,
  });

  const teacherActions = profesionalRoles.includes(cohortSession.cohort_role)
    ? [
      {
        icon: 'message',
        slug: 'teacher-instructions',
        title: t('teacherSidebar.instructions'),
        content: true,
        actionHandler: () => {
          setExtendedIsEnabled(!extendedIsEnabled);
          if (extendedIsEnabled === false) {
            scrollTop();
          }
        },
        actionState: extendedIsEnabled,
        id: 1,
      },
      {
        icon: 'key',
        slug: 'key-concepts',
        title: t('teacherSidebar.key-concepts'),
        content: keyConcepts?.length > 0 ? keyConcepts : null,
        id: 2,
      },
    ] : [];

  const videoTutorial = currentData?.solution_video_url ? [{
    icon: 'youtube',
    slug: 'video-player',
    title: 'Video tutorial',
    content: true,
    actionHandler: () => setShowSolutionVideo(!showSolutionVideo),
    id: 3,
  }] : [];

  const previousAssignment = filteredCurrentAssignments.map((section) => {
    const currentIndex = section.findIndex((l) => l.slug === lessonSlug);
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      return section[prevIndex];
    }
    return null;
  })[currentModuleIndex];

  const nextAssignment = filteredCurrentAssignments.map((section) => {
    const currentIndex = section.findIndex((l) => l.slug === lessonSlug);
    const nextIndex = currentIndex + 1;

    if (nextIndex < section.length) {
      return section[nextIndex];
    }
    return null;
  })[currentModuleIndex];

  const handleNextPage = () => {
    setCurrentData({});
    if (nextAssignment !== null) {
      // router.push(`/syllabus/${cohortSlug}/${nextAssignment?.type?.toLowerCase()}/${nextAssignment?.slug}`);
      if (nextAssignment?.target === 'blank') {
        setCurrentBlankProps(nextAssignment);
        router.push(`/syllabus/${cohortSlug}/${nextAssignment?.type?.toLowerCase()}/${nextAssignment?.slug}`);
      } else {
        setCurrentBlankProps(null);
        router.push(`/syllabus/${cohortSlug}/${nextAssignment?.type?.toLowerCase()}/${nextAssignment?.slug}`);
      }
    } else if (!!nextModule) {
      if (firstTask.target !== 'blank') {
        if (cohortSlug && !!firstTask && !!nextModule?.filteredModules[0]) {
          router.push(router.push(`/syllabus/${cohortSlug}/${firstTask?.type?.toLowerCase()}/${firstTask?.slug}`));
        } else {
          setOpenNextModuleModal(true);
        }
      } else {
        router.push(router.push(`/syllabus/${cohortSlug}/${firstTask?.type?.toLowerCase()}/${firstTask?.slug}`));
        setCurrentBlankProps(firstTask);
      }
    }
  };

  const handlePrevPage = () => {
    setCurrentData({});
    if (previousAssignment !== null) {
      if (previousAssignment?.target === 'blank') {
        setCurrentBlankProps(previousAssignment);
        router.push(`/syllabus/${cohortSlug}/${previousAssignment?.type?.toLowerCase()}/${previousAssignment?.slug}`);
      } else {
        setCurrentBlankProps(null);
        router.push(`/syllabus/${cohortSlug}/${previousAssignment?.type?.toLowerCase()}/${previousAssignment?.slug}`);
      }
    } else if (!!prevModule) {
      if (lastPrevTask.target !== 'blank') {
        if (cohortSlug && !!lastPrevTask) {
          router.push(router.push(`/syllabus/${cohortSlug}/${lastPrevTask?.type?.toLowerCase()}/${lastPrevTask?.slug}`));
        }
      } else {
        setCurrentBlankProps(lastPrevTask);
        setCurrentData(lastPrevTask);
        router.push(router.push(`/syllabus/${cohortSlug}/${lastPrevTask?.type?.toLowerCase()}/${lastPrevTask?.slug}`));
      }
    }
  };

  const pathConnector = {
    read: `${router.locale === 'en' ? '4geeks.com/lesson' : `4geeks.com/${router.locale}/lesson`}`,
    practice: `${router.locale === 'en' ? '4geeks.com/interactive-exercise' : `4geeks.com/${router.locale}/interactive-exercise`}`,
    code: `${router.locale === 'en' ? '4geeks.com/project' : `4geeks.com/${router.locale}/project`}`,
    answer: 'https://assessment.4geeks.com/quiz',
  };
  const shareLink = currentTask ? `${pathConnector[lesson]}/${currentTask.associated_slug}` : '';
  const shareSocialMessage = {
    en: `I just finished coding ${currentTask?.title} at 4geeks.com`,
    es: `Acabo de terminar de programar ${currentTask?.title} en 4geeks.com`,
  };
  const socials = [
    {
      name: 'twitter',
      label: 'Twitter',
      href: `https://twitter.com/share?url=&text=${encodeURIComponent(shareSocialMessage[router.locale])} %23100DaysOfCode%0A%0A${shareLink}`,
      color: '#1DA1F2',
    },
    {
      name: 'linkedin',
      label: 'LinkedIn',
      href: `https://linkedin.com/sharing/share-offsite/?url=${shareLink}`,
      color: '#0077B5',
      target: 'popup',
    },
  ];

  const inputModalLink = currentBlankProps && currentBlankProps.target === 'blank' ? currentBlankProps.url : `https://4geeks.com/syllabus/${cohortSlug}/${nextAssignment?.type?.toLowerCase()}/${nextAssignment?.slug}`;

  return (
    <Flex position="relative">
      <ModalInfo
        isOpen={openTargetBlankModal}
        onClose={() => setOpenTargetBlankModal(false)}
        title={t('dashboard:modules.target-blank-title')}
        isReadonly
        description={t('dashboard:modules.target-blank-msg', { title: clickedPage?.title || currentBlankProps?.title })}
        link={inputModalLink}
        handlerText={t('common:open')}
        closeText={t('common:close')}
        closeButtonVariant="outline"
        actionHandler={() => {
          setOpenTargetBlankModal(false);
          if (currentBlankProps && currentBlankProps.target === 'blank') {
            window.open(currentBlankProps.url, '_blank');
          }
        }}
      />
      <StickySideBar
        width="auto"
        menu={[
          ...teacherActions,
          ...videoTutorial,
          // {
          //   icon: 'youtube',
          //   slug: 'video-player',
          //   title: 'Video tutorial',
          //   content: '#923jmi2m',
          //   id: 3,
          // },
        ]}
      />

      <ScrollTop />

      <TimelineSidebar
        cohortSession={cohortSession}
        filterEmptyModules={filterEmptyModules}
        onClickAssignment={onClickAssignment}
        showPendingTasks={showPendingTasks}
        setShowPendingTasks={setShowPendingTasks}
        isOpen={isOpen}
        onToggle={onToggle}
      />

      <Box width={{ base: '100%', md: '100%', lg: 'calc(100% - 26.6vw)' }} margin="0 auto" height="auto">
        {!isQuiz && currentData?.intro_video_url && (
          <ReactPlayerV2
            url={currentData?.intro_video_url}
          />
        )}
        <Box
          className={`markdown-body ${currentTheme}`}
          // id={lessonSlug}
          flexGrow={1}
          marginLeft={0}
          margin="0 auto"
          // margin={{ base: '0 auto', xl: Open ? '0 auto 0 8vw' : '0 auto' }}
          padding={{ base: '25px 10px 0 10px', md: '25px 2rem 0 2rem' }}
          // padding={{
          //   base: GetReadme() !== false ? '0 5vw 4rem 5vw' : '4rem 4vw',
          //   md: GetReadme() !== false ? '25px 8vw 4rem 8vw' : '4rem 4vw',
          // }}
          width="100%"
          maxWidth="1024px"
          // maxWidth={{
          //   base: '94vw', sm: '86vw', md: '70vh', lg: '82vh',
          // }}
          // marginRight="10rem"
          transition={Open ? 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms' : 'margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms'}
          transitionProperty="margin"
          transitionDuration={Open ? '225ms' : '195ms'}
          transitionTimingFunction={Open ? 'cubic-bezier(0, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.6, 1)'}
          transitionDelay="0ms"
        >
          {extendedIsEnabled && extendedInstructions !== null && (
            <>
              <Box
                margin="40px 0 0 0"
              >
                <Text onClick={() => setExtendedIsEnabled(false)} color="blue.default" width="fit-content" fontSize="15px" fontWeight="700" cursor="pointer" margin="15px 0 35px 0 !important">
                  {`← ${t('teacherSidebar.back-to-student-mode')}`}
                </Text>
                <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap={{ base: '0', md: '10px' }} alignItems={{ base: 'start', md: 'center' }}>
                  <Heading size="m" style={{ margin: '0' }} padding={{ base: '0', md: '0 0 5px 0 !important' }}>
                    {`${t('teacherSidebar.instructions')}:`}
                  </Heading>
                  {sortedAssignments.length > 0 && (
                    <Select
                      id="module"
                      placeholder="Select module"
                      style={{
                        padding: '0 16px 0 0',
                      }}
                      fontSize="20px"
                      value={selectedSyllabus.id || defaultSelectedSyllabus.id}
                      onChange={(e) => setCurrentSelectedModule(parseInt(e.target.value, 10))}
                      width="auto"
                      color="blue.default"
                      border="0"
                      cursor="pointer"
                    >
                      {sortedAssignments.map((module) => (
                        <option key={module.id} value={module.id}>
                          {`#${module.id} - ${module.label}`}
                        </option>
                      ))}
                    </Select>
                  )}
                </Box>

                {selectedSyllabus && defaultSelectedSyllabus.id !== selectedSyllabus.id && (
                  <AlertMessage
                    type="warning"
                    style={{
                      margin: '20px 0 18px 0',
                    }}
                    message={t('teacherSidebar.alert-updated-module-instructions')}
                  />
                )}

                <Box display="flex" flexDirection="column" background={commonFeaturedColors} p="25px" m="18px 0 30px 0" borderRadius="16px" gridGap="18px">
                  <Heading as="h2" size="sm" style={{ margin: '0' }}>
                    {`${label} - `}
                    {t('teacherSidebar.module-duration', { duration: module.duration_in_days || 1 })}
                  </Heading>
                  <Text size="15px" letterSpacing="0.05em" style={{ margin: '0' }}>
                    {teacherInstructions}
                  </Text>
                </Box>
                <MarkDownParser content={extendedInstructions.content} />
              </Box>
              <Box margin="4rem 0" height="4px" width="100%" background={commonBorderColor} />
            </>
          )}

          {!isQuiz && currentData?.solution_video_url && showSolutionVideo && (
            <Box padding="1.2rem 2rem 2rem 2rem" borderRadius="3px" background={useColorModeValue('featuredLight', 'featuredDark')}>
              <Heading as="h2" size="16">
                Video Tutorial
              </Heading>
              <ReactPlayerV2
                url={currentData?.solution_video_url}
              />
            </Box>
          )}

          {ipynbHtmlUrl && readmeUrlPathname && (
            <Link href={`https://colab.research.google.com/github${readmeUrlPathname}`} margin="0 8vw 1rem auto" width="fit-content" color="gray.400" target="_blank" rel="noopener noreferrer" display="flex" justifyContent="right" gridGap="12px" alignItems="center">
              <Icon icon="google-collab" color="#A0AEC0" width="28px" height="28px" />
              {t('open-google-collab')}
            </Link>
          )}
          {ipynbHtmlUrl && (
            <iframe
              id="iframe"
              src={ipynbHtmlUrl}
              style={{
                width: '100%',
                height: '99vh',
                borderRadius: '14px',
              }}
              title="4Geeks IPython Notebook"
            />
          )}

          {isQuiz ? (
            <Box background={useColorModeValue('featuredLight', 'featuredDark')} width="100%" height="100vh" borderRadius="14px">
              <iframe
                id="iframe"
                src={`https://assessment.4geeks.com/quiz/${quizSlug}`}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '14px',
                }}
                title="Breathecode Quiz"
              />
            </Box>
          ) : GetReadme()}

          <Box margin="4rem 0 0 0" display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="20px" alignItems="center" justifyContent="space-between" padding="1.75rem 0 " borderTop="2px solid" borderColor={commonBorderColor} width="100%">
            <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="20px">
              <ButtonHandlerByTaskStatus
                allowText
                currentTask={currentTask}
                sendProject={sendProject}
                changeStatusAssignment={changeStatusAssignment}
                toggleSettings={toggleSettings}
                closeSettings={closeSettings}
                settingsOpen={settingsOpen}
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
            </Box>
            <Box display="flex" gridGap="3rem">
              {/* showPendingTasks bool to change states */}
              {(previousAssignment || !!prevModule) && (
                <Box
                  color="blue.default"
                  cursor="pointer"
                  fontSize="15px"
                  display="flex"
                  alignItems="center"
                  gridGap="10px"
                  letterSpacing="0.05em"
                  fontWeight="700"
                  onClick={() => {
                    setClickedPage(previousAssignment);
                    if (previousAssignment?.target === 'blank') {
                      setCurrentBlankProps(previousAssignment);
                      router.push(`/syllabus/${cohortSlug}/${previousAssignment?.type?.toLowerCase()}/${previousAssignment?.slug}`);
                    } else {
                      handlePrevPage();
                    }
                  }}
                >
                  <Box
                    as="span"
                    display="block"
                  >
                    <Icon icon="arrowLeft2" width="18px" height="10px" />
                  </Box>
                  {t('previous-page')}
                </Box>
              )}

              {(nextAssignment || !!nextModule) && (
                <Box
                  color="blue.default"
                  cursor="pointer"
                  fontSize="15px"
                  display="flex"
                  alignItems="center"
                  gridGap="10px"
                  letterSpacing="0.05em"
                  fontWeight="700"
                  onClick={() => {
                    if (taskIsNotDone) {
                      setOpenNextPageModal(true);
                    } else if (nextAssignment !== null || !!firstTask) {
                      setClickedPage(nextAssignment);
                      if (!taskIsNotDone) {
                        if (nextAssignment?.target === 'blank') {
                          setCurrentBlankProps(nextAssignment);
                          router.push(`/syllabus/${cohortSlug}/${nextAssignment?.type?.toLowerCase()}/${nextAssignment?.slug}`);
                          // setOpenTargetBlankModal(true);
                        } else {
                          setCurrentBlankProps(null);
                          handleNextPage();
                          // router.push(`/syllabus/${cohortSlug}/${nextAssignment
                          // ?.type?.toLowerCase()}/${nextAssignment?.slug}`);
                        }
                      }
                    } else if (nextModule && cohortSlug && !!firstTask) {
                      router.push(router.push(`/syllabus/${cohortSlug}/${firstTask?.type?.toLowerCase()}/${firstTask?.slug}`));
                    } else {
                      setOpenNextModuleModal(true);
                    }
                  }}
                >
                  {t('next-page')}
                  <Box
                    as="span"
                    display="block"
                    transform="rotate(180deg)"
                  >
                    <Icon icon="arrowLeft2" width="18px" height="10px" />
                  </Box>
                </Box>
              )}

              <Modal isOpen={openNextPageModal} size="xl" margin="0 10px" onClose={() => setOpenNextPageModal(false)}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader borderBottom="1px solid" fontSize="15px" borderColor={commonBorderColor} textAlign="center">
                    {assetTypeValues[lesson]}
                  </ModalHeader>
                  <ModalCloseButton />
                  <ModalBody padding={{ base: '26px 18px', md: '42px 36px' }}>
                    <Heading size="xsm" fontWeight="700" padding={{ base: '0 1rem 26px 1rem', md: '0 4rem 52px 4rem' }} textAlign="center">
                      {t('ask-to-done', { taskType: assetTypeValues[lesson]?.toLowerCase() })}
                    </Heading>
                    <Box display="flex" flexDirection={{ base: 'column', sm: 'row' }} gridGap="12px" justifyContent="space-between">
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleNextPage();
                          setOpenNextPageModal(false);
                        }}
                        textTransform="uppercase"
                        fontSize="13px"
                      >
                        {t('mark-later')}
                      </Button>
                      <ButtonHandlerByTaskStatus
                        allowText
                        currentTask={currentTask}
                        sendProject={sendProject}
                        changeStatusAssignment={changeStatusAssignment}
                        toggleSettings={toggleSettings}
                        closeSettings={closeSettings}
                        settingsOpen={modalSettingsOpen}
                        onClickHandler={() => {
                          setShowModal(false);
                          if (nextAssignment?.target === 'blank') {
                            setTimeout(() => {
                              setCurrentBlankProps(nextAssignment);
                              setOpenTargetBlankModal(true);
                            }, 1200);
                          } else {
                            setTimeout(() => {
                              handleNextPage();
                            }, 1200);
                          }
                          setOpenNextPageModal(false);
                        }}
                      />
                    </Box>
                  </ModalBody>
                </ModalContent>
              </Modal>

              <Modal isOpen={openNextModuleModal} size="xl" margin="0 10px" onClose={() => setOpenNextModuleModal(false)}>
                <ModalOverlay />
                <ModalContent>
                  <ModalCloseButton />
                  <ModalBody padding={{ base: '26px 18px', md: '42px 36px' }}>
                    <Heading size="xsm" fontWeight="700" padding={{ base: '0 1rem 26px 1rem', md: '0 4rem 52px 4rem' }} textAlign="center">
                      {`You have reached the end of the current module "${label}" but you can start the next module "${nextModule?.label}" right way.`}
                    </Heading>
                    <Box display="flex" flexDirection={{ base: 'column', sm: 'row' }} gridGap="12px" justifyContent="space-around">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setOpenNextModuleModal(false);
                        }}
                        textTransform="uppercase"
                        fontSize="13px"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => {
                          handleStartDay();
                          setOpenNextModuleModal(false);
                        }}
                        textTransform="uppercase"
                        fontSize="13px"
                      >
                        Yes, let&apos;s start the next module
                      </Button>
                    </Box>
                  </ModalBody>
                </ModalContent>
              </Modal>
            </Box>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default asPrivate(Content);
