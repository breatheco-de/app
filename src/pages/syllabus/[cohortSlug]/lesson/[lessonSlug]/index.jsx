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
import { useRouter } from 'next/router';
import Heading from '../../../../../common/components/Heading';
import Timeline from '../../../../../common/components/Timeline';
import getMarkDownContent from '../../../../../common/components/MarkDownParser/markdown';
import MarkdownParser from '../../../../../common/components/MarkDownParser';
import useSyllabus from '../../../../../common/store/actions/syllabusActions';

export const getServerSideProps = async ({ locale, params: { cohortSlug } }) => {
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
      cohortSlug,
    },
  };
};

const Content = ({ data, cohortSlug }) => {
  const { isOpen, onToggle } = useDisclosure();
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { syllabus = [] } = useSyllabus();
  const router = useRouter();
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
          width: '40%',
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
            <Box marginBottom="2rem">
              <Timeline
                key={section.id}
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
        <MarkdownParser content={data.content} withToc frontMatter={data.frontMatter || ''} />
      </Container>
    </Flex>
  );
};

Content.propTypes = {
  data: PropTypes.string.isRequired,
  cohortSlug: PropTypes.string.isRequired,
};

export default Content;
