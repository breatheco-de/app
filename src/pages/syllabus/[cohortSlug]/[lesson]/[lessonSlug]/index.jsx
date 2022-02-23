import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  useDisclosure,
  IconButton,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronRightIcon, ChevronLeftIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import atob from 'atob';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import Heading from '../../../../../common/components/Heading';
import Timeline from '../../../../../common/components/Timeline';
import getMarkDownContent from '../../../../../common/components/MarkDownParser/markdown';
import MarkdownParser from '../../../../../common/components/MarkDownParser';
import useSyllabus from '../../../../../common/store/actions/syllabusActions';
import bc from '../../../../../common/services/breathecode';
import useAuth from '../../../../../common/hooks/useAuth';
import { MDSkeleton } from '../../../../../common/components/Skeleton';

const Content = () => {
  const { isOpen, onToggle } = useDisclosure();
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [readme, setReadme] = useState(null);
  const [quizSlug, setQuizSlug] = useState(null);
  const { syllabus = [], setSyllabus } = useSyllabus();
  const { user, choose } = useAuth();
  const toast = useToast();
  const router = useRouter();

  //                                          gray.200    gray.500
  const commonBorderColor = useColorModeValue('#E2E8F0', '#718096');
  const Open = !isOpen;

  const slide = {
    zIndex: 1200,
    position: 'sticky',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    flex: '1 0 auto',
    width: 'inherit',
    transform: Open ? 'none' : 'translateX(-30rem)',
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
    router.push(`/syllabus/${cohortSlug}/${item.subtitle.toLowerCase()}/${item.slug}`);
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
    bc.admissions().me().then((res) => {
      const { cohorts } = res.data;
      // find cohort with current slug
      const findCohort = cohorts.find((c) => c.cohort.slug === cohortSlug);
      const currentCohort = findCohort?.cohort;
      const { version, name } = currentCohort?.syllabus_version;
      choose({
        cohort_slug: cohortSlug,
        version,
        slug: currentCohort?.syllabus_version.slug,
        cohort_name: currentCohort.name,
        syllabus_name: name,
        academy_id: currentCohort.academy.id,
      });
    });
  }, []);

  useEffect(() => {
    if (user && user.active_cohort) {
      const academyId = user.active_cohort.academy_id;
      const { version, slug } = user.active_cohort;
      bc.syllabus().get(academyId, slug, version).then((res) => {
        const studentLessons = res.data;
        setSyllabus(studentLessons.json.days);
      });
    }
  }, [user]);

  const decodeFromBinary = (encoded) => {
    // decode base 64 encoded string with emojis
    const decoded = decodeURIComponent(
      atob(encoded).split('').map((c) => {
        const decodedEmoist = `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`;
        return decodedEmoist;
      }).join(''),
    );

    return decoded;
  };

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
      <Box flex="0 0 auto" width="28.6vw">
        <IconButton
          style={{ zIndex: 20 }}
          variant="default"
          onClick={onToggle}
          width="17px"
          height="36px"
          minW={0}
          position="fixed"
          transition={Open ? 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms' : 'margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms'}
          transitionProperty="margin"
          transitionDuration={Open ? '225ms' : '195ms'}
          transitionTimingFunction={Open ? 'cubic-bezier(0, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.6, 1)'}
          top="50%"
          left={Open ? '28.6vw' : 0}
          padding={0}
          icon={Open ? (
            <ChevronLeftIcon
              width="17px"
              height="36px"
            />
          ) : (
            <ChevronRightIcon
              width="17px"
              height="36px"
            />
          )}
          marginBottom="1rem"
        />
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

          <Box
            className={`horizontal-sroll ${useColorModeValue('light', 'dark')}`}
            style={{
              height: '90.5vh',
              overflowX: 'hidden',
              overflowY: 'auto',
            }}
          >
            {syllabus && syllabus.map((section) => (
              <Box
                padding="1.5rem"
                borderBottom={1}
                borderStyle="solid"
                borderColor={commonBorderColor}
              >
                <Timeline
                  key={section.id}
                  technologies={section.technologies.length > 0
                    ? section.technologies.map((t) => t.title) : []}
                  title={section.label}
                  lessons={section.lessons}
                  answer={section.quizzes}
                  code={section.assignments}
                  practice={section.replits}
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
        marginLeft={Open ? '0' : '-28.6vw'}
        padding="4rem 8vw"
        // marginRight="10rem"
        transition={Open ? 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms' : 'margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms'}
        transitionProperty="margin"
        transitionDuration={Open ? '225ms' : '195ms'}
        transitionTimingFunction={Open ? 'cubic-bezier(0, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.6, 1)'}
        transitionDelay="0ms"
      >
        {GetReadme() !== false ? (
          GetReadme()
        ) : (
          <Box width="100%" height="100vh">
            <iframe
              id="iframe"
              src={`https://assessment.4geeks.com/quiz/${quizSlug}`}
              style={{
                width: '100%',
                height: '100%',
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

// <Slide
// direction="left"
// in={Open}
// // className="horizontal-slide"
// style={{
//   zIndex: 5,
//   position: 'sticky',
//   // perfect size for tablets and devices above 700px
//   width: '28.6vw',
//   display: Open ? 'block' : 'none',
//   height: '100%',
//   borderRight: 1,
//   borderStyle: 'solid',
//   overflowX: 'hidden',
//   overflowY: 'auto',
//   borderColor: commonBorderColor,
// }}
// >
// <Box
//   padding="1.5rem"
//   borderBottom={1}
//   borderStyle="solid"
//   borderColor={commonBorderColor}
// >
//   <Heading size="xsm">{user.active_cohort && user.active_cohort.syllabus_name}</Heading>
// </Box>
// <Box
//   padding="1.5rem"
//   className="horizontal-slide"
//   style={{
//     height: '87.2vh',
//     overflowX: 'hidden',
//     overflowY: 'auto',
//   }}
// >
//   {syllabus && syllabus.map((section) => (
//     <Box key={section.id} marginBottom="2rem">
//       <Timeline
//         technologies={section.technologies.length > 0
//           ? section.technologies.map((t) => t.title) : []}
//         title={section.label}
//         lessons={section.lessons}
//         answer={section.quizzes}
//         code={section.assignments}
//         practice={section.replits}
//         onClickAssignment={onClickAssignment}
//       />
//     </Box>
//   ))}
// </Box>
// </Slide>
// <Container
// className={`markdown-body ${useColorModeValue('light', 'dark')}`}
// marginTop="6vh"
// height="100%"
// maxW="container.md"
// >
// {GetReadme() !== false ? (
//   GetReadme()
