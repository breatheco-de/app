import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Container,
  useDisclosure,
  Slide,
  IconButton,
  useToast,
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
  const { syllabus = [], setSyllabus } = useSyllabus();
  const { user, choose } = useAuth();
  const toast = useToast();
  const router = useRouter();

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
      title: 'The endpoint could not access the content of this Project',
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

  useEffect(() => {
    bc.lesson({
      type: 'lesson',
      slug: lessonSlug,
      big: true,
    })
      .get()
      .then((lesson) => {
        console.log(lesson);
        if (lesson.data[0] !== undefined && lesson.data[0].readme !== null) {
          const MDecoded = lesson.data[0].readme && typeof lesson.data[0].readme === 'string' ? atob(lesson.data[0].readme) : null;
          console.log(MDecoded);
          const markdown = getMarkDownContent(MDecoded);
          setReadme(markdown);
        } else {
          setTimeout(() => {
            EventIfNotFound();
          }, 4000);
        }
      });
  }, [lessonSlug]);

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
          icon={isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          marginBottom="1rem"
        />
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

      <Slide
        direction="left"
        in={isOpen}
        style={{
          zIndex: 10,
          position: 'sticky',
          width: '30%',
          display: isOpen ? 'block' : 'none',
          height: '100vh',
          borderRight: 1,
          borderStyle: 'solid',
          overflowX: 'hidden',
          overflowY: 'auto',
          borderColor: '#E2E8F0',
        }}
      >
        <Box
          padding="1.5rem"
          borderBottom={1}
          borderStyle="solid"
          borderColor="gray.200"
        >
          <Heading size="xsm">{user.active_cohort && user.active_cohort.syllabus_name}</Heading>
        </Box>
        <Box padding="1.5rem">
          {syllabus && syllabus.map((section) => (
            <Box marginBottom="2rem">
              <Timeline
                key={section.id}
                technologies={section.technologies.length > 0
                  ? section.technologies.map((t) => t.title) : []}
                title={section.label}
                lessons={section.lessons}
                answer={section.quizzes}
                code={section.assigments}
                practice={section.replits}
                onClickAssignment={onClickAssignment}
              />
            </Box>
          ))}
        </Box>
      </Slide>
      <Container maxW="container.xl">
        {readme ? (
          <MarkdownParser content={readme.content} withToc frontMatter={readme.frontMatter || ''} />
        ) : (
          <MDSkeleton />
        )}

      </Container>
    </Flex>
  );
};

export default asPrivate(Content);
