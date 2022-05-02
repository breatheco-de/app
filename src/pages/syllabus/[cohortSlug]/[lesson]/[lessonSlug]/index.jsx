import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Flex,
  useDisclosure,
  IconButton,
  Link,
  useToast,
  useColorModeValue,
  useMediaQuery,
  Checkbox,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { ChevronRightIcon, ChevronLeftIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import {
  isWindow, getExtensionName, devLog, languageLabel,
} from '../../../../../utils';
import ReactPlayer from '../../../../../common/components/ReactPlayer';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import Heading from '../../../../../common/components/Heading';
import Timeline from '../../../../../common/components/Timeline';
import getMarkDownContent from '../../../../../common/components/MarkDownParser/markdown';
import MarkdownParser from '../../../../../common/components/MarkDownParser';
// import decodeFromBinary from '../../../../../utils/markdown';
import bc from '../../../../../common/services/breathecode';
import useAuth from '../../../../../common/hooks/useAuth';
import { MDSkeleton } from '../../../../../common/components/Skeleton';
import { usePersistent } from '../../../../../common/hooks/usePersistent';
import StickySideBar from '../../../../../common/components/StickySideBar';
import Icon from '../../../../../common/components/Icon';

const Content = () => {
  const { t } = useTranslation('syllabus');
  const { isOpen, onToggle } = useDisclosure();
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [readme, setReadme] = useState(null);
  const [ipynbHtmlUrl, setIpynbHtmlUrl] = useState(null);
  const [extendedInstructions, setExtendedInstructions] = useState(null);
  const [extendedIsEnabled, setExtendedIsEnabled] = useState(false);
  const [showPendingTasks, setShowPendingTasks] = useState(false);
  const [quizSlug, setQuizSlug] = useState(null);
  // const { syllabus = [], setSyllabus } = useSyllabus();
  const [sortedAssignments] = usePersistent('sortedAssignments', []);
  const [showSolutionVideo, setShowSolutionVideo] = useState(false);
  const [cohortSession] = usePersistent('cohortSession', {});
  const [selectedSyllabus, setSelectedSyllabus] = useState({});
  const [readmeUrlPathname, setReadmeUrlPathname] = useState(null);
  const [currentData, setCurrentData] = useState({});
  const { user, choose } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const prevScrollY = useRef(0);
  const [isBelowLaptop] = useMediaQuery('(max-width: 996px)');
  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');
  const profesionalRoles = ['TEACHER', 'ASSISTANT', 'REVIEWER'];
  const accessToken = isWindow ? localStorage.getItem('accessToken') : '';

  //                                          gray.200    gray.500
  const commonBorderColor = useColorModeValue('#E2E8F0', '#718096');
  const commonFeaturedColors = useColorModeValue('featuredLight', 'featuredDark');
  const bgColor = useColorModeValue('#FFFFFF', '#17202A');
  const Open = !isOpen;
  const { teacherInstructions, keyConcepts } = selectedSyllabus;

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
  const assetTypeValues = {
    read: 'LESSON',
    practice: 'EXERCISE',
    code: 'PROJECT',
    answer: 'QUIZ',
  };
  const language = router.locale === 'en' ? 'us' : 'es';
  const currentLanguageLabel = languageLabel[language] || language;

  const isQuiz = lesson === 'answer';

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const callToActionProps = {
    token: accessToken,
    assetSlug: lessonSlug,
    gitpod: currentData.gitpod,
    assetType: assetTypeValues[lesson],
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = isWindow && window.scrollY;
      if (prevScrollY.current > 400) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
      /*
        // visible when scrolls to top and hide when scrolls down

        if (prevScrollY.current < currentScrollY && showScrollToTop) {
          setShowScrollToTop(false);
        }
        if (prevScrollY.current > currentScrollY === 400 && !showScrollToTop) {
          setShowScrollToTop(true);
        }
      */
      prevScrollY.current = currentScrollY;
    };
    if (isWindow) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => isWindow && window.removeEventListener('scroll', handleScroll);
  }, [showScrollToTop]);

  const onClickAssignment = (e, item) => {
    router.push(`/syllabus/${cohortSlug}/${item.type.toLowerCase()}/${item.slug}`);
    setCurrentData({});
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
        console.log('err_admissions_me:', err);
        toast({
          title: t('alert-message:invalid-cohort-slug'),
          // description: 'Content not found',
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
    const findSelectedSyllabus = sortedAssignments.filter(
      (l) => l.modules.find((m) => m.slug === lessonSlug),
    )[0];

    if (findSelectedSyllabus) {
      setSelectedSyllabus(findSelectedSyllabus);
    }
  }, [sortedAssignments, lessonSlug]);

  useEffect(() => {
    if (selectedSyllabus.extendedInstructions) {
      const content = selectedSyllabus.extendedInstructions;
      // const MDecoded = content && typeof content === 'string' ? decodeFromBinary(content) : null;
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
          titleRightSide={(
            <>
              {!ipynbHtmlUrl && currentData.url && (
                <Link href={`${currentData.url}`} width="fit-content" color="gray.400" target="_blank" rel="noopener noreferrer" display="flex" justifyContent="right" gridGap="12px" alignItems="center" margin="20px 0 10px !important">
                  <Icon icon="pencil" color="#A0AEC0" width="20px" height="20px" />
                  {t('edit-page')}
                </Link>
              )}
              {ipynbHtmlUrl && readmeUrlPathname && (
                <Link href={`https://colab.research.google.com/github${readmeUrlPathname}`} width="fit-content" color="gray.400" target="_blank" rel="noopener noreferrer" display="flex" justifyContent="right" gridGap="12px" alignItems="center" margin="20px 0 10px !important">
                  <Icon icon="google-collab" color="#A0AEC0" width="28px" height="28px" />
                  {t('open-google-collab')}
                </Link>
              )}
            </>
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

  devLog('currentData:', currentData);

  const teacherActions = profesionalRoles.includes(cohortSession.cohort_role)
    ? [
      {
        icon: 'message',
        slug: 'teacher-instructions',
        title: t('teacherSidebar.instructions'),
        content: teacherInstructions,
        actionHandler: () => setExtendedIsEnabled(!extendedIsEnabled),
        actionState: extendedIsEnabled,
        id: 1,
      },
      {
        icon: 'key',
        slug: 'key-concepts',
        title: t('teacherSidebar.key-concepts'),
        content: keyConcepts,
        id: 2,
      },
    ] : [];

  const videoTutorial = currentData?.solution_video_url ? [{
    icon: 'youtube',
    slug: 'video-player',
    title: 'Video tutorial',
    content: '',
    actionHandler: () => setShowSolutionVideo(!showSolutionVideo),
    id: 3,
  }] : [];

  return (
    <Flex position="relative">
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
            <Heading size="xsm">{user.active_cohort && user.active_cohort.syllabus_name}</Heading>
            <Checkbox mb="-14px" onChange={(e) => setShowPendingTasks(e.target.checked)} color="gray.600">
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
          <ReactPlayer
            id={currentData.intro_video_url}
            playOnThumbnail
            imageSize="hqdefault"
            style={{
              width: '100%',
              maxWidth: isBelowTablet ? '100%' : '70vw',
              objectFit: 'cover',
              aspectRatio: '16/9',
            }}
          />
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

        {!ipynbHtmlUrl && (
          <Box
            className={`markdown-body ${currentTheme}`}
            // id={lessonSlug}
            flexGrow={1}
            marginLeft={0}
            margin={{ base: '0', lg: Open ? '0' : '0 auto' }}
            padding={{
              base: GetReadme() !== false ? '0 5vw 4rem 5vw' : '4rem 4vw',
              md: GetReadme() !== false ? '0 8vw 4rem 8vw' : '4rem 4vw',
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
                  p="20px 20px 30px 20px"
                  borderRadius="3px"
                  background={commonFeaturedColors}
                >
                  <MarkdownParser content={extendedInstructions.content} />
                </Box>
                <Box margin="4rem 0" height="4px" width="100%" background={commonBorderColor} />
              </>
            )}

            {!isQuiz && currentData.solution_video_url && showSolutionVideo && (
              <Box padding="0.4rem 2rem 2rem 2rem" background={useColorModeValue('featuredLight', 'featuredDark')}>
                <Heading as="h2" size="sm">
                  Video Tutorial
                </Heading>
                <ReactPlayer
                  id={currentData.solution_video_url}
                  playOnThumbnail
                  imageSize="hqdefault"
                  style={{
                    width: '100%',
                    objectFit: 'cover',
                    aspectRatio: '16/9',
                  }}
                />
              </Box>
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
          </Box>
        )}
      </Box>
    </Flex>
  );
};

export default asPrivate(Content);
