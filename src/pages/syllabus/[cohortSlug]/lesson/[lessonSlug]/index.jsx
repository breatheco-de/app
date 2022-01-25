import React, { useState } from 'react';
import {
  Box,
  Flex,
  Container,
  useDisclosure,
  Slide,
  IconButton,
} from '@chakra-ui/react';
import { ChevronRightIcon, ChevronLeftIcon, ArrowUpIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Heading from '../../../../../common/components/Heading';
import Timeline from '../../../../../common/components/Timeline';
import getMarkDownContent from '../../../../../common/components/MarkDownParser/markdown';
import MarkdownParser from '../../../../../common/components/MarkDownParser';
import useSyllabus from '../../../../../common/store/actions/syllabusActions';

export const getStaticProps = async ({ locale }) => {
  const results = await fetch(
    'https://raw.githubusercontent.com/breatheco-de/content/master/src/content/lesson/css-layouts.md',
  )
    .then((res) => res.text())
    .catch((err) => console.error(err));
  const markdownContent = getMarkDownContent(results);
  return {
    props: {
      fallback: false,
      ...(await serverSideTranslations(locale, ['navbar', 'footer'])),
      data: markdownContent,
    },
  };
};

export const getStaticPaths = async () => ({
  paths: [
    {
      params: { cohortSlug: 'santiago-pt-21', lessonSlug: 'intro-to-4geeks' },
    },
  ],
  fallback: false,
});

const Content = ({ data }) => {
  const { isOpen, onToggle } = useDisclosure();
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { syllabus = [] } = useSyllabus();
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

  return (
    <Flex position="relative">
      <IconButton
        style={{ zIndex: 20 }}
        variant="default"
        onClick={onToggle}
        position="fixed"
        top="50%"
        left={isOpen ? '19%' : '0%'}
        borderRadius="none"
        padding={0}
        icon={isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      />
      <IconButton
        icon={<ArrowUpIcon />}
        onClick={scrollTop}
        borderRadius="full"
        style={{ height: 40, display: showScrollToTop ? 'flex' : 'none' }}
        position="fixed"
        animation="fadeIn 0.3s"
        justifyContent="center"
        height="20px"
        bottom="20px"
        left="95%"
        variant="default"
        transition="opacity 0.4s"
        opacity="0.5"
        _hover={{
          opacity: 1,
        }}
      />
      <Slide
        direction="left"
        in={isOpen}
        style={{
          zIndex: 10,
          position: 'sticky',
          width: '20%',
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
          <Heading size="xsm">Full Stack Developer</Heading>
        </Box>
        <Box padding="1.5rem">
          {syllabus && syllabus.map((section) => (
            <Timeline
              key={section.id}
              title={section.label}
              assignments={section.lessons.concat(section.replits,
                section.assigments,
                section.quizzes)}
            />
          ))}
        </Box>
      </Slide>
      <Container maxW="container.xl">
        <MarkdownParser content={data.content} withToc frontMatter={data.frontMatter || ''} />
      </Container>
    </Flex>
  );
};

Content.propTypes = {
  data: PropTypes.string.isRequired,
};

export default Content;
