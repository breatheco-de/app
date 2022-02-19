import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  useDisclosure,
  IconButton,
  useToast,
  useColorMode,
} from '@chakra-ui/react';
import { ChevronRightIcon, ChevronLeftIcon, ArrowUpIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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

export const getServerSideProps = async ({ locale, params: { cohortSlug, lessonSlug } }) => ({
  props: {
    fallback: false,
    ...(await serverSideTranslations(locale, ['navbar', 'footer'])),
    cohortSlug,
    lessonSlug,
  },
});

const Content = ({ cohortSlug, lessonSlug }) => {
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode } = useColorMode();
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [readme, setReadme] = useState(null);
  const { syllabus = [], setSyllabus } = useSyllabus();
  const { user, choose } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const slide = {
    zIndex: 1200,
    position: 'sticky',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    flex: '1 0 auto',
    width: 'inherit',
    transform: isOpen ? 'none' : 'translateX(-30rem)',
    visibility: isOpen ? 'visible' : 'hidden',
    height: '100vh',
    outline: 0,
    borderRight: 1,
    borderStyle: 'solid',
    overflowX: 'hidden',
    overflowY: 'auto',
    borderColor: '#E2E8F0',
    transition: isOpen ? 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms' : 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    transitionProperty: isOpen ? 'transform' : 'box-shadow',
    transitionDuration: isOpen ? '225ms' : '300ms',
    transitionTimingFunction: isOpen ? 'cubic-bezier(0, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDelay: isOpen ? '0ms' : '0ms',
  };

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
      <Box flex="0 0 auto" width="30rem">
        <IconButton
          style={{ zIndex: 20 }}
          variant="default"
          onClick={onToggle}
          width="17px"
          height="36px"
          minW={0}
          position="fixed"
          transition={isOpen ? 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms' : 'margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms'}
          transitionProperty="margin"
          transitionDuration={isOpen ? '225ms' : '195ms'}
          transitionTimingFunction={isOpen ? 'cubic-bezier(0, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.6, 1)'}
          top="50%"
          left={isOpen ? '30rem' : 0}
          padding={0}
          icon={isOpen ? (
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
            position="sticky"
            top={0}
            zIndex={200}
            bg={colorMode === 'light' ? 'white' : 'darkTheme'}
            borderBottom={1}
            borderStyle="solid"
            borderColor="gray.200"
          >
            <Heading size="xsm">{user.active_cohort && user.active_cohort.syllabus_name}</Heading>
          </Box>

          <Box>
            {syllabus && syllabus.map((section) => (
              <Box
                padding="1.5rem"
                borderBottom={1}
                borderStyle="solid"
                borderColor="gray.200"
              >
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
        </Box>
      </Box>
      <Box
        flexGrow={1}
        marginLeft={isOpen ? '0' : '-20rem'}
        padding="6rem"
        marginRight="10rem"
        paddingTop="2rem"
        transition={isOpen ? 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms' : 'margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms'}
        transitionProperty="margin"
        transitionDuration={isOpen ? '225ms' : '195ms'}
        transitionTimingFunction={isOpen ? 'cubic-bezier(0, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.6, 1)'}
        transitionDelay="0ms"
      >
        {readme ? (
          <MarkdownParser content={readme.content} withToc frontMatter={readme.frontMatter || ''} />
        ) : (
          <MDSkeleton />
        )}
      </Box>
    </Flex>
  );
};

Content.propTypes = {
  cohortSlug: PropTypes.string.isRequired,
  lessonSlug: PropTypes.string.isRequired,
};

export default asPrivate(Content);
