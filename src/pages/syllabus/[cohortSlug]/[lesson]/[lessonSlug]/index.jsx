/* eslint-disable no-dupe-else-if */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-extra-boolean-cast */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Flex, useDisclosure, Link, useToast,
  useColorModeValue, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalCloseButton, ModalBody, Button,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { isWindow, assetTypeValues, getExtensionName } from '../../../../../utils';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import Heading from '../../../../../common/components/Heading';
import { updateAssignment, startDay, nestAssignments } from '../../../../../common/hooks/useModuleHandler';
import { ButtonHandlerByTaskStatus } from '../../../../../js_modules/moduleMap/taskHandler';
import getMarkDownContent from '../../../../../common/components/MarkDownParser/markdown';
import MarkDownParser from '../../../../../common/components/MarkDownParser';
import Text from '../../../../../common/components/Text';
import useAuth from '../../../../../common/hooks/useAuth';
import StickySideBar from '../../../../../common/components/StickySideBar';
import Icon from '../../../../../common/components/Icon';
import AlertMessage from '../../../../../common/components/AlertMessage';
import useModuleMap from '../../../../../common/store/actions/moduleMapAction';
import ShareButton from '../../../../../common/components/ShareButton';
import ModalInfo from '../../../../../js_modules/moduleMap/modalInfo';
import ReactPlayerV2 from '../../../../../common/components/ReactPlayerV2';
import ScrollTop from '../../../../../common/components/scrollTop';
import TimelineSidebar from '../../../../../js_modules/syllabus/TimelineSidebar';
import bc from '../../../../../common/services/breathecode';
import SyllabusMarkdownComponent from '../../../../../js_modules/syllabus/SyllabusMarkdownComponent';
import useHandler from '../../../../../common/hooks/useCohortHandler';
import modifyEnv from '../../../../../../modifyEnv';
import SimpleModal from '../../../../../common/components/SimpleModal';
import ReactSelect from '../../../../../common/components/ReactSelect';
import useStyle from '../../../../../common/hooks/useStyle';
import { ORIGIN_HOST } from '../../../../../utils/variables';
import useSession from '../../../../../common/hooks/useSession';
import { log } from '../../../../../utils/logging';

function Content() {
  const { t, lang } = useTranslation('syllabus');
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const { isLoading, user, choose } = useAuth();
  const { contextState, setContextState } = useModuleMap();
  const [currentTask, setCurrentTask] = useState(null);
  const { setUserSession } = useSession();
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
  const [currentAssetData, setCurrentAssetData] = useState(null);
  const [currentBlankProps, setCurrentBlankProps] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [clickedPage, setClickedPage] = useState({});
  const [currentData, setCurrentData] = useState({});
  const toast = useToast();
  const router = useRouter();
  const taskIsNotDone = currentTask && currentTask.task_status !== 'DONE';
  const {
    cohortSession, sortedAssignments, getCohortAssignments, getCohortData, prepareTasks,
    taskTodo, setTaskTodo,
  } = useHandler();
  const { featuredLight, fontColor, borderColor } = useStyle();

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
  const lastPrevTask = prevModule?.modules[prevModule?.modules?.length - 1];

  const cohortSlug = router?.query?.cohortSlug;
  const lesson = router?.query?.lesson;
  const lessonSlug = router?.query?.lessonSlug;

  const language = router?.locale === 'en' ? 'us' : router?.locale;

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

  const currentModule = filterEmptyModules[currentModuleIndex];

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
        router.push(`/syllabus/${cohortSlug}/${firstTask?.type?.toLowerCase()}/${firstTask?.slug}`);
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
    getCohortData({
      cohortSlug,
      choose,
    });
  }, []);

  useEffect(() => {
    if (currentTask && !currentTask.opened_at) {
      bc.todo().update({ ...currentTask, opened_at: new Date() })
        .then((result) => {
          if (result.data) {
            const updateTasks = taskTodo;
            const index = updateTasks.findIndex((el) => el.task_type === assetTypeValues[lesson] && el.associated_slug === lessonSlug);
            updateTasks[index].opened_at = result.data.opened_at;
            setTaskTodo([...updateTasks]);
          }
        }).catch((e) => log('update_task_error:', e));
    }
  }, [currentTask]);

  useEffect(() => {
    const assetSlug = currentData?.translations?.us || currentData?.translations?.en || lessonSlug;
    if (taskTodo.length > 0) {
      setCurrentTask(taskTodo.find((el) => el.task_type === assetTypeValues[lesson]
      && el.associated_slug === assetSlug));
    }
  }, [taskTodo, lessonSlug, lesson]);

  const closeSettings = () => {
    setSettingsOpen(false);
    setModalSettingsOpen(false);
  };

  const toggleSettings = async () => {
    const assetResp = await bc.lesson().getAsset(currentTask.associated_slug);
    if (assetResp.status < 400) {
      const assetData = await assetResp.data;
      setCurrentAssetData(assetData);
      if (openNextPageModal) {
        setModalSettingsOpen(!modalSettingsOpen);
      } else {
        setSettingsOpen(!settingsOpen);
      }
    }
  };

  const handleOpen = async (onOpen = () => {}) => {
    if (currentTask && currentTask?.task_type === 'PROJECT' && currentTask.task_status === 'DONE') {
      const assetResp = await bc.lesson().getAsset(currentTask.associated_slug);
      if (assetResp?.status < 400) {
        const assetData = await assetResp.data;
        setCurrentAssetData(assetData);

        if (typeof assetData?.delivery_formats === 'string' && !assetData?.delivery_formats.includes('url')) {
          const fileResp = await bc.todo().getFile({ id: currentTask.id, academyId: cohortSession?.academy?.id });
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
    event.preventDefault();
    await updateAssignment({
      t, task, taskStatus, closeSettings, toast, contextState, setContextState,
    });
  };

  const sendProject = async ({ task, githubUrl, taskStatus }) => {
    setShowModal(true);
    await updateAssignment({
      t, task, closeSettings, toast, githubUrl, taskStatus, contextState, setContextState,
    });
  };

  const cleanCurrentData = () => {
    setShowModal(false);
    setCurrentData({});
    setCurrentSelectedModule(null);
    setCallToActionProps({});
    setReadme(null);
    setIpynbHtmlUrl(null);
    setCurrentBlankProps(null);
  };
  const onClickAssignment = (e, item) => {
    const link = `/syllabus/${cohortSlug}/${item.type?.toLowerCase()}/${item.slug}`;

    router.push(link);
    cleanCurrentData();
  };

  const EventIfNotFound = () => {
    setReadme({
      content: t('no-content-found-description'),
    });
    setCurrentData({
      title: t('no-content-found'),
    });
  };

  useEffect(() => {
    const currTask = filterEmptyModules[currentModuleIndex]?.modules?.find((l) => l.slug === lessonSlug);
    const englishTaskUrls = {
      en: currTask?.translations?.en,
      us: currTask?.translations?.us,
    };
    const currentLanguageTaskUrl = englishTaskUrls[lang] || currTask?.translations?.[lang]?.slug || lessonSlug;
    if (currTask?.target === 'blank') {
      setCurrentBlankProps(currTask);
    } else if (currentBlankProps === null || currentBlankProps?.target !== 'blank') {
      axios.get(`${BREATHECODE_HOST}/v1/registry/asset/${currentLanguageTaskUrl}?asset_type=${assetTypeValues[lesson]}`)
        .then(({ data }) => {
          const translations = data?.translations;
          const exensionName = getExtensionName(data.readme_url);
          const isIpynb = exensionName === 'ipynb';
          const currentSlug = translations?.[language] || lessonSlug;
          const urlPathname = data.readme_url ? data.readme_url.split('https://github.com')[1] : null;
          const pathnameWithoutExtension = urlPathname ? urlPathname.split('.ipynb')[0] : null;
          const extension = urlPathname ? urlPathname.split('.').pop() : null;
          // const translatedExtension = language === 'us' ? '' : `.${language}`;
          const finalPathname = `${pathnameWithoutExtension}.${extension}`;

          setCallToActionProps({
            token: accessToken,
            assetSlug: lessonSlug,
            gitpod: data.gitpod,
            assetType: assetTypeValues[lesson],
          });
          setReadmeUrlPathname(finalPathname);
          let currentTranslationSlug = data?.lang === language ? data?.slug : data.translations[language];
          if (isIpynb) {
            setIpynbHtmlUrl(`${BREATHECODE_HOST}/v1/registry/asset/preview/${currentSlug}?plain=true`);
            setCurrentData(data);
          } else {
            setIpynbHtmlUrl(null);
            if (currentTranslationSlug === undefined) {
              currentTranslationSlug = `${lessonSlug}-${language}`;
            }
            Promise.all([
              axios.get(`${BREATHECODE_HOST}/v1/registry/asset/${currentTranslationSlug}.md`),
              axios.get(`${BREATHECODE_HOST}/v1/registry/asset/${currentTranslationSlug}?asset_type=${assetTypeValues[lesson]}`),
            ])
              .then(([respMarkdown, respData]) => {
                const currData = respData.data;
                const markdownData = respMarkdown.data;

                if (lesson === 'answer') {
                  setQuizSlug(currentTranslationSlug);
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
                setReadme({
                  content: t('no-traduction-found-description'),
                });
                setCurrentData({
                  ...data,
                  title: t('no-traduction-found'),
                });
              });
          }
        }).catch(() => {
          EventIfNotFound();
        });
    }
    return () => {
      setUserSession({
        translations: [],
      });
    };
  }, [router, lessonSlug]);

  useEffect(() => {
    if (sortedAssignments.length <= 0) {
      toast({
        position: 'top',
        title: t('alert-message:no-cohort-modules-found'),
        status: 'warning',
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
      getCohortAssignments({
        user, setContextState,
      });
    }
  }, [user]);

  useEffect(() => {
    const cohortProgram = contextState?.cohortProgram;
    prepareTasks({
      cohortProgram, contextState, nestAssignments,
    });
  }, [contextState.cohortProgram, contextState.taskTodo, router]);

  const teacherActions = profesionalRoles.includes(cohortSession.cohort_role)
    ? [
      {
        icon: 'message',
        slug: 'teacher-instructions',
        title: t('teacherSidebar.instructions'),
        content: extendedInstructions !== null,
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
    cleanCurrentData();
    if (nextAssignment !== null) {
      if (nextAssignment?.target === 'blank') {
        setCurrentBlankProps(nextAssignment);
        router.push({
          query: {
            cohortSlug,
            lesson: nextAssignment?.type?.toLowerCase(),
            lessonSlug: nextAssignment?.slug,
          },
        });
      } else {
        setCurrentBlankProps(null);
        router.push({
          query: {
            cohortSlug,
            lesson: nextAssignment?.type?.toLowerCase(),
            lessonSlug: nextAssignment?.slug,
          },
        });
      }
    } else if (!!nextModule) {
      if (firstTask.target !== 'blank') {
        if (cohortSlug && !!firstTask && !!nextModule?.filteredModules[0]) {
          router.push({
            query: {
              cohortSlug,
              lesson: firstTask?.type?.toLowerCase(),
              lessonSlug: firstTask?.slug,
            },
          });
        } else {
          setOpenNextModuleModal(true);
        }
      } else {
        router.push({
          query: {
            cohortSlug,
            lesson: firstTask?.type?.toLowerCase(),
            lessonSlug: firstTask?.slug,
          },
        });
        setCurrentBlankProps(firstTask);
      }
    }
  };

  const handlePrevPage = () => {
    cleanCurrentData();
    if (previousAssignment !== null) {
      if (previousAssignment?.target === 'blank') {
        setCurrentBlankProps(previousAssignment);
        router.push({
          query: {
            cohortSlug,
            lesson: previousAssignment?.type?.toLowerCase(),
            lessonSlug: previousAssignment?.slug,
          },
        });
      } else {
        setCurrentBlankProps(null);
        router.push({
          query: {
            cohortSlug,
            lesson: previousAssignment?.type?.toLowerCase(),
            lessonSlug: previousAssignment?.slug,
          },
        });
      }
    } else if (!!prevModule) {
      if (lastPrevTask.target !== 'blank') {
        if (cohortSlug && !!lastPrevTask) {
          router.push({
            query: {
              cohortSlug,
              lesson: lastPrevTask?.type?.toLowerCase(),
              lessonSlug: lastPrevTask?.slug,
            },
          });
        }
      } else {
        setCurrentBlankProps(lastPrevTask);
        setCurrentData(lastPrevTask);
        router.push({
          query: {
            cohortSlug,
            lesson: lastPrevTask?.type?.toLowerCase(),
            lessonSlug: lastPrevTask?.slug,
          },
        });
      }
    }
  };

  const pathConnector = {
    read: `${router.locale === 'en' ? '4geeks.com/lesson' : `4geeks.com/${router.locale}/lesson`}`,
    practice: `${router.locale === 'en' ? '4geeks.com/interactive-exercise' : `4geeks.com/${router.locale}/interactive-exercise`}`,
    project: `${router.locale === 'en' ? '4geeks.com/project' : `4geeks.com/${router.locale}/project`}`,
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

  const url = currentData?.readme_url || currentData?.url;
  const repoUrl = (ipynbHtmlUrl && url) ? `${url.replace('.inpynb', `${router.locale === 'en' ? '' : `.${router.locale}`}.inpynb`)}` : url;
  const inputModalLink = currentBlankProps && currentBlankProps.target === 'blank' ? currentBlankProps.url : `${ORIGIN_HOST}/syllabus/${cohortSlug}/${nextAssignment?.type?.toLowerCase()}/${nextAssignment?.slug}`;

  const cohortModule = sortedAssignments.find((module) => module?.id === cohortSession?.current_module);

  return (
    <>
      <Head>
        <title>{currentData?.title || '4Geeks'}</title>
      </Head>
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
            flexGrow={1}
            marginLeft={0}
            margin="25px auto 0 auto"
            padding={{ base: '0px 10px 0 10px', md: '0px 2rem 0 2rem' }}
            width="100%"
            maxWidth="1024px"
            transition={Open ? 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms' : 'margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms'}
            transitionProperty="margin"
            transitionDuration={Open ? '225ms' : '195ms'}
            transitionTimingFunction={Open ? 'cubic-bezier(0, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.6, 1)'}
            transitionDelay="0ms"
            position="relative"
          >

            {extendedInstructions !== null && (
              <SimpleModal isOpen={extendedIsEnabled} onClose={() => setExtendedIsEnabled(false)} padding="2rem 0 2rem 0" style={{ margin: '3rem 0' }}>
                <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap={{ base: '0', md: '10px' }} alignItems={{ base: 'start', md: 'center' }}>
                  <Heading size="m" style={{ margin: '0' }} padding={{ base: '0', md: '0 0 5px 0 !important' }}>
                    {`${t('teacherSidebar.instructions')}:`}
                  </Heading>
                  {sortedAssignments.length > 0 && (
                    <ReactSelect
                      unstyled
                      color="#0097CD"
                      fontWeight="700"
                      id="cohort-select"
                      fontSize="25px"
                      placeholder={t('common:select-cohort')}
                      noOptionsMessage={() => t('common:no-options-message')}
                      defaultValue={{
                        value: selectedSyllabus?.id || defaultSelectedSyllabus?.id,
                        slug: selectedSyllabus?.slug || defaultSelectedSyllabus?.slug,
                        label: selectedSyllabus?.id
                          ? `#${selectedSyllabus?.id} - ${selectedSyllabus?.label}`
                          : `#${defaultSelectedSyllabus?.id} - ${defaultSelectedSyllabus?.label}`,
                      }}
                      onChange={({ value }) => {
                        setCurrentSelectedModule(parseInt(value, 10));
                      }}
                      options={sortedAssignments.map((module) => ({
                        value: module?.id,
                        slug: module.slug,
                        label: `#${module?.id} - ${module?.label}`,
                      }))}
                    />
                  )}
                </Box>

                {selectedSyllabus && cohortModule?.id && cohortModule?.id !== selectedSyllabus?.id && (
                  <AlertMessage
                    type="info"
                    style={{
                      margin: '20px 0 18px 0',
                    }}
                    dangerouslySetInnerHTML
                    title={t('teacherSidebar.no-need-to-teach-today.title')}
                    message={t('teacherSidebar.no-need-to-teach-today.description', { module_name: `#${cohortModule?.id} - ${cohortModule?.label}` })}
                  />
                )}
                {selectedSyllabus && defaultSelectedSyllabus?.id !== selectedSyllabus?.id && (
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
                    {t('teacherSidebar.module-duration', { duration: selectedSyllabus?.duration_in_days || currentModule?.duration_in_days || 1 })}
                  </Heading>
                  <Text size="15px" letterSpacing="0.05em" style={{ margin: '0' }}>
                    {teacherInstructions}
                  </Text>
                </Box>
                <MarkDownParser content={extendedInstructions.content} />
              </SimpleModal>
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

            <Box display={{ base: 'flex', md: 'block' }} margin={{ base: '2rem 0 0 0', md: '0px' }} position={{ base: '', md: 'absolute' }} width={{ base: '100%', md: '172px' }} height="auto" top="0px" right="32px" background={featuredLight} borderRadius="4px" color={fontColor} zIndex="9">
              {repoUrl && !isQuiz && (
                <Link
                  display="flex"
                  target="_blank"
                  rel="noopener noreferrer"
                  width="100%"
                  gridGap="8px"
                  padding={{ base: '8px 12px', md: '8px' }}
                  background="transparent"
                  href={repoUrl}
                  _hover={{ opacity: 0.7 }}
                  style={{ color: fontColor, textDecoration: 'none' }}
                >
                  <Icon icon="pencil" color="#A0AEC0" width="20px" height="20px" />
                  {t('edit-page')}
                </Link>
              )}

              {ipynbHtmlUrl && currentData?.readme_url && (
                <Box width={{ base: '1px', md: '100%' }} height={{ base: 'auto', md: '1px' }} background={borderColor} />
              )}

              {ipynbHtmlUrl && readmeUrlPathname && (
                <Link display="flex" target="_blank" rel="noopener noreferrer" width="100%" gridGap="8px" padding={{ base: '8px 12px', md: '8px' }} background="transparent" color="white" href={`https://colab.research.google.com/github${readmeUrlPathname}`} _hover={{ opacity: 0.7 }} style={{ color: fontColor, textDecoration: 'none' }}>
                  <Icon icon="collab" color="#A0AEC0" width="28px" height="28px" />
                  {t('open-google-collab')}
                </Link>
              )}
            </Box>
            {ipynbHtmlUrl && (
              <iframe
                id="iframe"
                src={`${ipynbHtmlUrl}&theme=${currentTheme}`}
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
                  src={`https://assessment.4geeks.com/quiz/${quizSlug}?isAnon=true&token=${accessToken}&academy=${cohortSession?.academy?.id}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '14px',
                  }}
                  title="Breathecode Quiz"
                />
              </Box>
            ) : (
              <SyllabusMarkdownComponent
                {...{
                  ipynbHtmlUrl,
                  readme,
                  currentBlankProps,
                  callToActionProps,
                  currentData,
                  lesson,
                  quizSlug,
                  lessonSlug,
                  currentTask,
                }}
              />
            )}

            <Box margin="2.5rem 0 0 0" display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="20px" alignItems="center" justifyContent="space-between" padding="1.75rem 0 " borderTop="2px solid" borderColor={commonBorderColor} width="100%">
              <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="20px">
                <ButtonHandlerByTaskStatus
                  allowText
                  currentTask={currentTask}
                  sendProject={sendProject}
                  changeStatusAssignment={changeStatusAssignment}
                  currentAssetData={currentAssetData}
                  toggleSettings={toggleSettings}
                  closeSettings={closeSettings}
                  settingsOpen={settingsOpen}
                  handleOpen={handleOpen}
                  fileData={fileData}
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
              </Box>
              <Box display="flex" gridGap="3rem">
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
                        router.push({
                          query: {
                            cohortSlug,
                            lesson: previousAssignment?.type?.toLowerCase(),
                            lessonSlug: previousAssignment?.slug,
                          },
                        });
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
                            router.push({
                              query: {
                                cohortSlug,
                                lesson: nextAssignment?.type?.toLowerCase(),
                                lessonSlug: nextAssignment?.slug,
                              },
                            });
                          } else {
                            setCurrentBlankProps(null);
                            handleNextPage();
                          }
                        }
                      } else if (nextModule && cohortSlug && !!firstTask) {
                        router.push({
                          query: {
                            cohortSlug,
                            lesson: firstTask?.type?.toLowerCase(),
                            lessonSlug: firstTask?.slug,
                          },
                        });
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
                  <ModalContent style={{ margin: '3rem 0' }}>
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
                          currentAssetData={currentAssetData}
                          settingsOpen={modalSettingsOpen}
                          handleOpen={handleOpen}
                          fileData={fileData}
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
                  <ModalContent style={{ margin: '3rem 0' }}>
                    <ModalCloseButton />
                    <ModalBody padding={{ base: '26px 18px', md: '42px 36px' }}>
                      <Heading size="xsm" fontWeight="700" padding={{ base: '0 1rem 26px 1rem', md: '0 4rem 52px 4rem' }} textAlign="center">
                        {t('reached-the-end-of-the-module', { label, nextModuleLabel: nextModule?.label })}
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
                          {t('common:cancel')}
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
                          {t('start-next-module')}
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
    </>
  );
}

export default asPrivate(Content);
