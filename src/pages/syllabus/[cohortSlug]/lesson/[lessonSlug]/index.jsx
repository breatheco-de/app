import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Container,
  useDisclosure,
  Slide,
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

  const { cohortSlug, lessonSlug } = router.query;

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
    router.push(`/syllabus/${cohortSlug}/lesson/${item.slug}`);
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

  const Open = !isOpen;

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
      .then((lesson) => {
        if (lesson.data.length === 0 || lesson.data[0].asset_type === 'QUIZ') {
          setQuizSlug(lessonSlug);
        }
        if (lesson.data.length !== 0
            && lesson.data[0] !== undefined
            && lesson.data[0].readme !== null
        ) {
          // Binary base64 decoding ⇢ UTF-8
          const MDecoded = lesson.data[0].readme && typeof lesson.data[0].readme === 'string' ? decodeFromBinary(lesson.data[0].readme) : null;
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
      return <MarkdownParser content={readme.content} withToc frontMatter={readme.frontMatter || ''} />;
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
          style={{ zIndex: 20 }}
          variant="default"
          onClick={onToggle}
          borderRadius="full"
          padding={0}
          fontSize="20px"
          icon={Open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          marginBottom="1rem"
        />
        <IconButton
          fontSize="20px"
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

      <Slide
        direction="left"
        in={Open}
        // className="horizontal-slide"
        style={{
          zIndex: 5,
          position: 'sticky',
          // perfect size for tablets and devices above 700px
          width: '56vh',
          display: Open ? 'block' : 'none',
          height: '100%',
          borderRight: 1,
          borderStyle: 'solid',
          overflowX: 'hidden',
          overflowY: 'auto',
          borderColor: commonBorderColor,
        }}
      >
        <Box
          padding="1.5rem"
          borderBottom={1}
          borderStyle="solid"
          borderColor={commonBorderColor}
        >
          <Heading size="xsm">{user.active_cohort && user.active_cohort.syllabus_name}</Heading>
        </Box>
        <Box
          padding="1.5rem"
          className="horizontal-slide"
          style={{
            height: '87.2vh',
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
        >
          {syllabus && syllabus.map((section) => (
            <Box key={section.id} marginBottom="2rem">
              <Timeline
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
      </Slide>
      <Container
        className={`markdown-body ${useColorModeValue('light', 'dark')}`}
        marginTop="6vh"
        height="100%"
        maxW="container.md"
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
      </Container>
    </Flex>
  );
};

export default asPrivate(Content);
