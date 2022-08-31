import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box, Flex, useDisclosure, IconButton, Link, useToast,
  useColorModeValue, useMediaQuery, Checkbox, Select, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalCloseButton, ModalBody, Button,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { ChevronRightIcon, ChevronLeftIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { isWindow, assetTypeValues, getExtensionName } from '../../../../../utils';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import Heading from '../../../../../common/components/Heading';
import { updateAssignment } from '../../../../../common/hooks/useModuleHandler';
import { ButtonHandlerByTaskStatus } from '../../../../../js_modules/moduleMap/taskHandler';
import Timeline from '../../../../../common/components/Timeline';
import getMarkDownContent from '../../../../../common/components/MarkDownParser/markdown';
import MarkdownParser from '../../../../../common/components/MarkDownParser';
import Text from '../../../../../common/components/Text';
import bc from '../../../../../common/services/breathecode';
import useAuth from '../../../../../common/hooks/useAuth';
import { MDSkeleton } from '../../../../../common/components/Skeleton';
import { usePersistent } from '../../../../../common/hooks/usePersistent';
import StickySideBar from '../../../../../common/components/StickySideBar';
import Icon from '../../../../../common/components/Icon';
import AlertMessage from '../../../../../common/components/AlertMessage';
import useModuleMap from '../../../../../common/store/actions/moduleMapAction';
import ShareButton from '../../../../../common/components/ShareButton';
import ModalInfo from '../../../../../js_modules/moduleMap/modalInfo';
import ReactPlayerV2 from '../../../../../common/components/ReactPlayerV2';

const Content = () => {
  const { t } = useTranslation('syllabus');
  const { choose } = useAuth();
  const [cohortSession] = usePersistent('cohortSession', {});
  const [sortedAssignments] = usePersistent('sortedAssignments', []);
  const [taskTodo, setTaskTodo] = usePersistent('taskTodo', []);
  const { contextState, setContextState } = useModuleMap();
  const [currentTask, setCurrentTask] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modalSettingsOpen, setModalSettingsOpen] = useState(false);
  const { isOpen, onToggle } = useDisclosure();
  const [openNextPageModal, setOpenNextPageModal] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [readme, setReadme] = useState(null);
  const [ipynbHtmlUrl, setIpynbHtmlUrl] = useState(null);
  const [extendedInstructions, setExtendedInstructions] = useState(null);
  const [extendedIsEnabled, setExtendedIsEnabled] = useState(false);
  const [showPendingTasks, setShowPendingTasks] = useState(false);
  const [currentSelectedModule, setCurrentSelectedModule] = useState(null);
  const [quizSlug, setQuizSlug] = useState(null);
  const [showSolutionVideo, setShowSolutionVideo] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState({});
  const [defaultSelectedSyllabus, setDefaultSelectedSyllabus] = useState({});
  const [callToActionProps, setCallToActionProps] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [readmeUrlPathname, setReadmeUrlPathname] = useState(null);
  const [openTargetBlankModal, setOpenTargetBlankModal] = useState(null);
  const [clickedPage, setClickedPage] = useState({});
  const [currentData, setCurrentData] = useState({});
  const toast = useToast();
  const router = useRouter();
  const prevScrollY = useRef(0);
  const taskIsNotDone = currentTask && currentTask.task_status !== 'DONE';

  const [isBelowLaptop] = useMediaQuery('(max-width: 996px)');
  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');
  const profesionalRoles = ['TEACHER', 'ASSISTANT', 'REVIEWER'];
  const accessToken = isWindow ? localStorage.getItem('accessToken') : '';

  //                                          gray.200    gray.500
  const commonBorderColor = useColorModeValue('#E2E8F0', '#718096');
  const commonFeaturedColors = useColorModeValue('featuredLight', 'featuredDark');
  const bgColor = useColorModeValue('#FFFFFF', '#17202A');
  const Open = !isOpen;
  const { label, teacherInstructions, keyConcepts } = selectedSyllabus;

  const filterEmptyModules = sortedAssignments.filter(
    (assignment) => assignment.modules.length > 0,
  );

  const currentTheme = useColorModeValue('light', 'dark');

  const slide = {
    minWidth: '290px',
    zIndex: 1200,
    position: isBelowLaptop ? 'inherit' : 'sticky',
    backgroundColor: bgColor,
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    flex: '1 0 auto',
    width: 'inherit',
    transform: Open ? 'translateX(0rem)' : 'translateX(-30rem)',
    visibility: Open ? 'visible' : 'hidden',
    height: isBelowTablet ? '100%' : '100vh',
    outline: 0,
    borderRight: 1,
    borderStyle: 'solid',
    // overflowX: 'hidden',
    // overflowY: 'auto',
    borderColor: commonBorderColor,
    transition: Open ? 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms' : 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    transitionProperty: Open ? 'transform' : 'box-shadow',
    transitionDuration: Open ? '225ms' : '300ms',
    transitionTimingFunction: Open ? 'cubic-bezier(0, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDelay: Open ? '0ms' : '0ms',
  };

  const { cohortSlug, lesson, lessonSlug } = router.query;

  const language = router.locale === 'en' ? 'us' : 'es';
  const currentLanguageLabel = router.language === 'en' ? t('common:english') : t('common:spanish');

  const isQuiz = lesson === 'answer';

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    Promise.all([
      bc.todo({ cohort: cohortSession.id }).getTaskByStudent(), // Tasks with cohort id
    ]).then(([taskTodoData]) => {
      setContextState({
        ...contextState,
        taskTodo: taskTodoData.data,
      });
    });
  }, []);

  useEffect(() => {
    if (contextState.taskTodo !== undefined) {
      setTaskTodo(contextState.taskTodo);
    }
  }, [contextState.taskTodo]);

  useEffect(() => {
    if (taskTodo.length > 0) {
      setCurrentTask(taskTodo.find((el) => el.task_type === assetTypeValues[lesson]
      && el.associated_slug === lessonSlug));
    }
  }, [taskTodo, lessonSlug, lesson]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = isWindow && window.scrollY;
      if (prevScrollY.current > 400) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }

      prevScrollY.current = currentScrollY;
    };
    if (isWindow) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => isWindow && window.removeEventListener('scroll', handleScroll);
  }, [showScrollToTop]);

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

  const sendProject = (task, githubUrl, taskStatus) => {
    setShowModal(true);
    updateAssignment({
      t, task, closeSettings, toast, githubUrl, taskStatus, contextState, setContextState,
    });
  };

  const onClickAssignment = (e, item) => {
    const link = `/syllabus/${cohortSlug}/${item.type.toLowerCase()}/${item.slug}`;
    if (item.target === 'blank') {
      window.open(link, '_blank');
    } else {
      router.push(link);
    }
    setCurrentData({});
    setCurrentSelectedModule(null);
    setCallToActionProps({});
    setReadme(null);
    setIpynbHtmlUrl(null);
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

  const defaultDataFetch = async () => {
    Promise.all([
      axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${lessonSlug}.md`),
      axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${lessonSlug}?asset_type=${assetTypeValues[lesson]}`),
    ])
      .then(([respMarkdown, respData]) => {
        const currData = respData.data;
        const markdownData = respMarkdown.data;
        toast({
          title: t('alert-message:language-not-found', { currentLanguageLabel }),
          // not found, showing the english version`,
          status: 'warning',
          duration: 5500,
          isClosable: true,
        });
        const exensionName = getExtensionName(currData.readme_url);

        if (lesson === 'answer') setQuizSlug(lessonSlug);
        else setQuizSlug(null);

        if (currData !== undefined && typeof markdownData === 'string') {
          // Binary base64 decoding ⇢ UTF-8
          const markdown = getMarkDownContent(markdownData);
          setReadme(markdown);
          setCurrentData(currData);
        }
        if (exensionName === 'ipynb') setIpynbHtmlUrl(`${process.env.BREATHECODE_HOST}/v1/registry/asset/preview/${lessonSlug}?theme=${currentTheme}&plain=true`);
        else setIpynbHtmlUrl(null);
      })
      .catch(() => {
        toast({
          title: t('alert-message:default-version-not-found', { lesson }),
          // description: 'Content not found',
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
  };

  useEffect(() => {
    bc.admissions().me()
      .then(({ data }) => {
        const { cohorts } = data;
        // find cohort with current slug
        const findCohort = cohorts.find((c) => c.cohort.slug === cohortSlug);
        const currentCohort = findCohort?.cohort;
        const { version, name } = currentCohort?.syllabus_version;
        choose({
          cohort_slug: cohortSlug,
          date_joined: data.date_joined,
          cohort_role: findCohort.role,
          version,
          slug: currentCohort?.syllabus_version.slug,
          cohort_name: currentCohort.name,
          cohort_id: currentCohort.id,
          syllabus_name: name,
          academy_id: currentCohort.academy.id,
        });
      })
      .catch((err) => {
        router.push('/choose-program');
        toast({
          title: t('alert-message:invalid-cohort-slug'),
          description: err,
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
  }, []);

  useEffect(() => {
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
              defaultDataFetch();
            });
        }
      }).catch(() => {
        EventIfNotFound();
      });
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
    const defaultSyllabus = sortedAssignments.filter(
      (l) => l.modules.find((m) => m.slug === lessonSlug),
    )[0];

    if (defaultSyllabus) {
      setSelectedSyllabus(findSelectedSyllabus || defaultSyllabus);
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

  const GetReadme = () => {
    if (ipynbHtmlUrl === null && readme === null && quizSlug !== lessonSlug) {
      return <MDSkeleton />;
    }
    if (ipynbHtmlUrl === null && readme) {
      return (
        <MarkdownParser
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
    return false;
  };

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

  const filteredCurrentAssignments = filterEmptyModules.map((section) => {
    const currentAssignments = showPendingTasks
      ? section.filteredModulesByPending
      : section.filteredModules;
    return currentAssignments;
  });

  const previousAssignment = filteredCurrentAssignments.map((section) => {
    const currentIndex = section.findIndex((l) => l.slug === lessonSlug);
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      return section[prevIndex];
    }
    return null;
  })[selectedSyllabus.id - 1];

  const nextAssignment = filteredCurrentAssignments.map((section) => {
    const currentIndex = section.findIndex((l) => l.slug === lessonSlug);
    const nextIndex = currentIndex + 1;
    if (nextIndex < section.length) {
      return section[nextIndex];
    }
    return null;
  })[selectedSyllabus.id - 1];

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
    },
  ];

  return (
    <Flex position="relative">
      <ModalInfo
        isOpen={openTargetBlankModal}
        onClose={() => setOpenTargetBlankModal(false)}
        title={t('dashboard:modules.target-blank-title')}
        isReadonly
        description={t('dashboard:modules.target-blank-msg', { title: clickedPage?.title })}
        link={`https://4geeks.com/syllabus/${cohortSlug}/${nextAssignment?.type?.toLowerCase()}/${nextAssignment?.slug}`}
        handlerText={t('common:open')}
        closeText={t('common:close')}
        closeButtonVariant="outline"
        actionHandler={() => {
          setOpenTargetBlankModal(false);
          window.open(`/syllabus/${cohortSlug}/${nextAssignment?.type?.toLowerCase()}/${nextAssignment?.slug}`, '_blank');
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

      <IconButton
        style={{ zIndex: 20 }}
        variant="default"
        display={Open ? 'none' : 'initial'}
        onClick={onToggle}
        width="17px"
        height="36px"
        minW={0}
        position="fixed"
        top="50%"
        left="0"
        padding={0}
        icon={(
          <ChevronRightIcon
            width="17px"
            height="36px"
          />
        )}
      />
      <Box
        bottom="20px"
        position="fixed"
        right="30px"
        // left="95%"
      >
        <IconButton
          icon={<ArrowUpIcon />}
          onClick={scrollTop}
          borderRadius="full"
          style={{ height: 40, display: showScrollToTop ? 'flex' : 'none' }}
          animation="fadeIn 0.3s"
          justifyContent="center"
          height="20px"
          variant="default"
          transition="opacity 0.4s"
          opacity="0.5"
          _hover={{
            opacity: 1,
          }}
        />
      </Box>
      <Box position={{ base: 'fixed', lg: Open ? 'initial' : 'fixed' }} display={Open ? 'initial' : 'none'} flex="0 0 auto" minWidth="290px" width={{ base: '74.6vw', md: '46.6vw', lg: '26.6vw' }} zIndex={Open ? 99 : 0}>
        <Box style={slide}>
          <Box
            padding="1.5rem"
            // position="sticky"
            display="flex"
            flexDirection="column"
            gridGap="6px"
            top={0}
            zIndex={200}
            bg={useColorModeValue('white', 'darkTheme')}
            borderBottom={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
          >
            {cohortSession?.syllabus_version && (
              <Heading size="xsm">{cohortSession?.syllabus_version?.name}</Heading>
            )}
            <Checkbox mb="-14px" onChange={(e) => setShowPendingTasks(e.target.checked)} color={useColorModeValue('gray.600', 'gray.350')}>
              {t('dashboard:modules.show-pending-tasks')}
            </Checkbox>
          </Box>

          <IconButton
            style={{ zIndex: 20 }}
            variant="default"
            onClick={onToggle}
            width="17px"
            height="36px"
            minW={0}
            position="absolute"
            transition={Open ? 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms' : 'margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms'}
            transitionProperty="margin"
            transitionDuration={Open ? '225ms' : '195ms'}
            transitionTimingFunction={Open ? 'cubic-bezier(0, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.6, 1)'}
            top="50%"
            right="-20px"
            padding={0}
            icon={(
              <ChevronLeftIcon
                width="17px"
                height="36px"
              />
            )}
            marginBottom="1rem"
          />

          <Box
            className={`horizontal-sroll ${currentTheme}`}
            height="100%"
            style={{
              overflowX: 'hidden',
              overflowY: 'auto',
            }}
          >
            {filterEmptyModules.map((section) => {
              const currentAssignments = showPendingTasks
                ? section.filteredModulesByPending
                : section.filteredModules;
              return (
                <Box
                  key={`${section.title}-${section.id}`}
                  padding={{ base: '1rem', md: '1.5rem' }}
                  borderBottom={1}
                  borderStyle="solid"
                  borderColor={commonBorderColor}
                >
                  <Timeline
                    key={section.id}
                    showPendingTasks={showPendingTasks}
                    assignments={currentAssignments}
                    technologies={section.technologies || []}
                    title={section.label}
                    onClickAssignment={onClickAssignment}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
      <Box width="100%" height="auto">
        {!isQuiz && currentData.intro_video_url && (
          <ReactPlayerV2
            url={currentData.intro_video_url}
          />
        )}
        <Box
          className={`markdown-body ${currentTheme}`}
          // id={lessonSlug}
          flexGrow={1}
          marginLeft={0}
          margin={{ base: '0', lg: Open ? '0' : '0 auto' }}
          padding={{
            base: GetReadme() !== false ? '0 5vw 4rem 5vw' : '4rem 4vw',
            md: GetReadme() !== false ? '25px 8vw 4rem 8vw' : '4rem 4vw',
          }}
          maxWidth="1012px"
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
                <MarkdownParser content={extendedInstructions.content} />
              </Box>
              <Box margin="4rem 0" height="4px" width="100%" background={commonBorderColor} />
            </>
          )}

          {!isQuiz && currentData.solution_video_url && showSolutionVideo && (
            <Box padding="1.2rem 2rem 2rem 2rem" borderRadius="3px" background={useColorModeValue('featuredLight', 'featuredDark')}>
              <Heading as="h2" size="16">
                Video Tutorial
              </Heading>
              <ReactPlayerV2
                url={currentData.solution_video_url}
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
              {previousAssignment !== null && (
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
                      setOpenTargetBlankModal(true);
                    } else {
                      router.push(`/syllabus/${cohortSlug}/${previousAssignment?.type?.toLowerCase()}/${previousAssignment?.slug}`);
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
              {nextAssignment !== null && (
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
                    setClickedPage(nextAssignment);
                    if (taskIsNotDone) {
                      setOpenNextPageModal(true);
                    }
                    if (!taskIsNotDone) {
                      if (nextAssignment?.target === 'blank') {
                        setOpenTargetBlankModal(true);
                      } else {
                        router.push(`/syllabus/${cohortSlug}/${nextAssignment?.type?.toLowerCase()}/${nextAssignment?.slug}`);
                      }
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
                          router.push(`/syllabus/${cohortSlug}/${nextAssignment?.type?.toLowerCase()}/${nextAssignment?.slug}`);
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
                              setOpenTargetBlankModal(true);
                            }, 1200);
                          } else {
                            setTimeout(() => {
                              router.push(`/syllabus/${cohortSlug}/${nextAssignment?.type?.toLowerCase()}/${nextAssignment?.slug}`);
                            }, 1200);
                          }
                          setOpenNextPageModal(false);
                        }}
                      />
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
