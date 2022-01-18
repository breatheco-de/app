/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import { Box, useColorModeValue, useToast } from '@chakra-ui/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Heading from '../../common/components/Heading';
import MarkDownParser from '../../common/components/MarkDownParser';
import { MDSkeleton } from '../../common/components/Skeleton';
import TagCapsule from '../../common/components/TagCapsule';
import Link from '../../common/components/NextChakraLink';
// import atob from 'atob';

export const getStaticPaths = async () => {
  let lessons = [];
  const data = await fetch('https://breathecode.herokuapp.com/v1/registry/asset?type=lesson')
    .then((res) => res.json())
    .catch((err) => console.log(err));

  lessons = Object.values(data);
  if (data.status >= 200 && data.status < 400) {
    console.log(`Original lessons: ${lessons}`);
  } else {
    console.error(`Error fetching lessons with ${data.status}`);
  }

  const paths = lessons.map((res) => ({
    params: {
      slug: res.slug,
    },
  }));
  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params, locale }) => {
  const { slug } = params;
  // `https://breathecode.herokuapp.com/v1/registry/asset/${slug}`
  // `https://breathecode.herokuapp.com/v1/registry/asset/readme/${slug}`
  const results = await fetch(`https://breathecode.herokuapp.com/v1/registry/asset/${slug}`)
    .then((res) => res.json())
    .catch((err) => console.log(err));

  return {
    props: {
      fallback: false,
      ...(await serverSideTranslations(locale, ['navbar', 'footer'])),
      lesson: results,
    },
  };
};

const LessonSlug = ({ lesson }) => {
  const [readme, setReadme] = useState('');
  // const [notFound, setNotFound] = useState(false);
  // const commonBorderColor = useColorModeValue('#DADADA', 'gray.900');
  // const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const router = useRouter();
  const toast = useToast();

  const EventIfNotFound = () => {
    toast({
      title: 'The endpoint could not access the content of this lesson',
      // description: 'Content not found',
      status: 'error',
      duration: 7000,
      isClosable: true,
    });
  };

  // const removeTitleAndImage = (str) => str.replace(new RegExp('(.+)', 'm'), '')
  // .replace(new RegExp('<a.*?>+.*>', 'g'), '');

  // const MDecoded = lesson.readme && typeof lesson.readme === 'string'
  // ? atob(lesson.readme) : null;
  // console.log('readme', MDecoded);

  // if (lesson.readme === '' && notFound === false) {
  //   setTimeout(() => {
  //     setNotFound(true);
  //     toast({
  //       title: 'The endpoint could not access the content of this lesson',
  //       // description: 'Content not found',
  //       status: 'error',
  //       duration: 7000,
  //       isClosable: true,
  //     });
  //   }, 4000);
  // }

  useEffect(() => {
    const language = router.query.lang || router.locale;

    if (lesson.readme_url !== null) {
      const branch = 'master';
      const slugCutted = lesson.readme_url.substring(lesson.readme_url.lastIndexOf(branch));
      const indexOfMetaData = '---\n\n';
      const rawSlug = `https://raw.githubusercontent.com/breatheco-de/content/${slugCutted}`;
      fetch(rawSlug)
        .then((resp) => resp.text())
        .then((text) => text.substring(text.indexOf(indexOfMetaData) + indexOfMetaData.length))
        .then((data) => {
          setReadme({ markdown: data, lang: language });
        })
        .catch((err) => {
          console.error('Error loading markdown file from github', err);
          setTimeout(() => {
            EventIfNotFound();
          }, 4000);
        });
    } else {
      setTimeout(() => {
        EventIfNotFound();
      }, 4000);
    }
  }, []);

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      margin={{ base: '4rem 4% 0 4%', md: '4% 14% 0 14%' }}
    >
      <Link
        href="/lessons"
        color={useColorModeValue('blue.default', 'blue.300')}
        display="inline-block"
        letterSpacing="0.05em"
        fontWeight="700"
        paddingBottom="10px"
      >
        {'< Back to Lessons'}
      </Link>

      <Box flex="1" margin={{ base: '28px 0', md: '28px 14% 0 14%' }}>
        <TagCapsule
          variant="rounded"
          tags={lesson.technologies}
          marginY="8px"
          fontSize="13px"
          style={{
            padding: '2px 10px',
            margin: '0',
          }}
          gap="10px"
          paddingX="0"
        />
        <Heading
          as="h1"
          size="30px"
          fontWeight="700"
          margin="22px 0 35px 0"
          transition="color 0.2s ease-in-out"
          color={useColorModeValue('black', 'white')}
          textTransform="uppercase"
        >
          {lesson.title}
        </Heading>

        <Box
          borderRadius="3px"
          background={useColorModeValue('white', 'dark')}
          width={{ base: '100%', md: 'auto' }}
          // useColorModeValue('blue.default', 'blue.300')
          // colorMode === 'light' ? 'light' : 'dark'
          className={`markdown-body ${useColorModeValue('light', 'dark')}`}
        >
          {/* {MDecoded ? <MarkDownParser content={removeTitleAndImage(MDecoded)} />
          : <MDSkeleton />} */}
          {readme.markdown ? <MarkDownParser content={readme.markdown} /> : <MDSkeleton />}
        </Box>
      </Box>
    </Box>
  );
};

LessonSlug.propTypes = {
  lesson: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default LessonSlug;
