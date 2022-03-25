import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  useDisclosure,
  IconButton,
  useToast,
  useColorModeValue,
  useMediaQuery,
} from '@chakra-ui/react';
import { ChevronRightIcon, ChevronLeftIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import Heading from '../../../../../common/components/Heading';
import Timeline from '../../../../../common/components/Timeline';
import getMarkDownContent from '../../../../../common/components/MarkDownParser/markdown';
import MarkdownParser from '../../../../../common/components/MarkDownParser';
import decodeFromBinary from '../../../../../utils/markdown';
// import useSyllabus from '../../../../../common/store/actions/syllabusActions';
import bc from '../../../../../common/services/breathecode';
import useAuth from '../../../../../common/hooks/useAuth';
import { MDSkeleton } from '../../../../../common/components/Skeleton';
import usePersistent from '../../../../../common/hooks/usePersistent';
import StickySideBar from '../../../../../common/components/StickySideBar';

const Content = () => {
  const { isOpen, onToggle } = useDisclosure();
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [readme, setReadme] = useState(null);
  const [extendedInstructions, setExtendedInstructions] = useState(null);
  const [extendedIsEnabled, setExtendedIsEnabled] = useState(false);
  const [quizSlug, setQuizSlug] = useState(null);
  // const { syllabus = [], setSyllabus } = useSyllabus();
  const [sortedAssignments] = usePersistent('sortedAssignments', []);
  const [cohortSession] = usePersistent('cohortSession', {});
  const [selectedSyllabus, setSelectedSyllabus] = useState({});
  const { user, choose } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [isBelowLaptop] = useMediaQuery('(max-width: 996px)');
  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');

  //                                          gray.200    gray.500
  const commonBorderColor = useColorModeValue('#E2E8F0', '#718096');
  const commonFeaturedColors = useColorModeValue('featuredLight', 'featuredDark');
  const bgColor = useColorModeValue('#FFFFFF', '#17202A');
  const Open = !isOpen;
  const { teacherInstructions, keyConcepts } = selectedSyllabus;

  const slide = {
    minWidth: '310px',
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
    height: '100vh',
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

  const { cohortSlug, lessonSlug, lesson } = router.query;

  const checkScrollTop = () => {
    if (!showScrollToTop && window.pageYOffset > 400) {
      setShowScrollToTop(true);
    } else if (showScrollToTop && window.pageYOffset <= 400) {
      setShowScrollToTop(false);
    }
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', checkScrollTop);
  }

  const onClickAssignment = (e, item) => {
    router.push(`/syllabus/${cohortSlug}/${item.type.toLowerCase()}/${item.slug}`);
    setReadme(null);
  };

  const EventIfNotFound = () => {
    toast({
      title: 'The endpoint could not access the content of this lesson',
      // description: 'Content not found',
      status: 'error',
      duration: 7000,
      isClosable: true,
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
          title: 'Invalid cohort slug',
          // description: 'Content not found',
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
  }, []);

  useEffect(() => {
    bc.lesson({
      // type: 'lesson',
      slug: lessonSlug,
      big: true,
    })
      .get()
      .then((le) => {
        if (le.data.length === 0 || le.data[0].asset_type === 'QUIZ') {
          setQuizSlug(lessonSlug);
        }
        if (le.data.length !== 0
          && le.data[0] !== undefined
          && le.data[0].readme !== null
        ) {
          // Binary base64 decoding ⇢ UTF-8
          const MDecoded = le.data[0].readme && typeof le.data[0].readme === 'string' ? decodeFromBinary(le.data[0].readme) : null;
          const markdown = getMarkDownContent(MDecoded);
          setReadme(markdown);
        }
      }).catch(() => {
        setTimeout(() => {
          EventIfNotFound();
        }, 4000);
      });
  }, [lessonSlug]);

  useEffect(() => {
    const findSelectedSyllabus = sortedAssignments.filter(
      (l) => l.modules.find((m) => m.slug === router.query.lessonSlug),
    )[0];

    if (findSelectedSyllabus) {
      setSelectedSyllabus(findSelectedSyllabus);
    }
  }, [sortedAssignments, router.query.lessonSlug]);

  useEffect(() => {
    if (selectedSyllabus.extendedInstructions) {
      const content = selectedSyllabus.extendedInstructions;
      // const MDecoded = content && typeof content === 'string' ? decodeFromBinary(content) : null;
      const markdown = getMarkDownContent(content);
      setExtendedInstructions(markdown);
    }
  }, [selectedSyllabus]);

  const containerSlide = () => {
    if (isBelowLaptop) {
      return '0';
    }
    return Open ? '0' : '0 auto';
  };

  const timelineSlide = () => {
    if (isBelowLaptop) {
      return 'fixed';
    }
    return Open ? 'initial' : 'fixed';
  };

  const timelineWidth = () => {
    if (isBelowTablet) {
      return '74.6vw';
    }
    if (isBelowLaptop) {
      return '46.6vw';
    }
    return '26.6vw';
  };

  const GetReadme = () => {
    if (readme === null && quizSlug !== lessonSlug) {
      return <MDSkeleton />;
    }
    if (readme) {
      return <MarkdownParser content={readme.content} withToc={lesson.toLowerCase() === 'read'} frontMatter={readme.frontMatter || ''} />;
    }
    return false;
  };

  return (
    <Flex position="relative">
      {
        ['TEACHER', 'ASSISTANT'].includes(cohortSession.cohort_role) && (
          <StickySideBar
            width="auto"
            menu={[
              {
                icon: 'message',
                slug: 'teacher-instructions',
                title: 'Teacher instructions',
                content: teacherInstructions,
                actionHandler: () => setExtendedIsEnabled(!extendedIsEnabled),
                actionState: extendedIsEnabled,
                id: 1,
              },
              {
                icon: 'key',
                slug: 'key-concepts',
                title: 'Key Concepts',
                content: keyConcepts,
                id: 2,
              },
            ]}
          />
        )
      }

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
        left="95%"
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
      <Box position={timelineSlide} flex="0 0 auto" minWidth="310px" width={timelineWidth} zIndex={Open ? 99 : 0}>
        <Box style={slide}>
          <Box
            padding="1.5rem"
            // position="sticky"
            top={0}
            zIndex={200}
            bg={useColorModeValue('white', 'darkTheme')}
            borderBottom={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
          >
            <Heading size="xsm">{user.active_cohort && user.active_cohort.syllabus_name}</Heading>
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
            className={`horizontal-sroll ${useColorModeValue('light', 'dark')}`}
            style={{
              height: '90.5vh',
              overflowX: 'hidden',
              overflowY: 'auto',
            }}
          >
            {sortedAssignments && sortedAssignments.map((section) => (
              <Box
                padding="1.5rem"
                borderBottom={1}
                borderStyle="solid"
                borderColor={commonBorderColor}
              >
                <Timeline
                  key={section.id}
                  assignments={section.modules}
                  technologies={section.technologies || []}
                  title={section.label}
                  onClickAssignment={onClickAssignment}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Box
        className={`markdown-body ${useColorModeValue('light', 'dark')}`}
        flexGrow={1}
        marginLeft={0}
        margin={containerSlide}
        padding={GetReadme() !== false ? '4rem 8vw' : '4rem 4vw'}
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
        {GetReadme() !== false ? (
          GetReadme()
        ) : (
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
        )}
      </Box>
    </Flex>
  );
};

export default asPrivate(Content);
