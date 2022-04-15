import { useState, useEffect } from 'react';
import { Box, useColorModeValue, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Heading from '../../common/components/Heading';
import MarkDownParser from '../../common/components/MarkDownParser';
import { MDSkeleton } from '../../common/components/Skeleton';
import TagCapsule from '../../common/components/TagCapsule';
import decodeFromBinary from '../../utils/markdown';
import getMarkDownContent from '../../common/components/MarkDownParser/markdown';

export const getStaticPaths = async () => {
  let lessons = [];
  const data = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?type=lesson`)
    .then((res) => res.json())
    .catch((err) => console.log(err));

  lessons = Object.values(data);
  if (data.status >= 200 && data.status < 400) {
    data.asset_type = 'lesson';
    console.log(`Original lessons: ${lessons}`);
  } else {
    console.error(`Error fetching lessons with ${data.status}`);
  }
  const paths = lessons.flatMap((res) => Object.keys(res.translations).map((locale) => {
    const localeToUsEs = locale === 'us' ? 'en' : 'es';
    return ({
      params: {
        slug: res.translations[locale],
      },
      locale: localeToUsEs,
    });
  }));

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;
  const lesson = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}`)
    .then((res) => res.json())
    .catch((err) => console.log(err));

  // in "lesson.translations" rename "us" key to "en" key if exists
  if (lesson.translations.us) {
    lesson.translations.en = lesson.translations.us;
    delete lesson.translations.us;
  }

  if (lesson.status_code === 404) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      fallback: false,
      lesson,
      translations: lesson.translations,
    },
  };
};

const LessonSlug = ({ lesson }) => {
  const [readme, setReadme] = useState(null);
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

  useEffect(() => {
    const language = router.query.lang || router.locale;

    if (lesson.readme !== null) {
      const MDecoded = lesson.readme && typeof lesson.readme === 'string' ? decodeFromBinary(lesson.readme) : null;
      const markdown = getMarkDownContent(MDecoded);
      const { content } = markdown;
      setReadme({ markdown: content, lang: language });
    } else {
      setTimeout(() => {
        EventIfNotFound();
      }, 4000);
    }
  }, [lesson]);

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      margin={{ base: '4rem 4% 0 4%', md: '4% 14% 0 14%' }}
    >
      {/* <Link
        href="/lessons"
        color={useColorModeValue('blue.default', 'blue.300')}
        display="inline-block"
        letterSpacing="0.05em"
        fontWeight="700"
        paddingBottom="10px"
      >
        {'< Back to Lessons'}
      </Link> */}

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
          transition="all 0.2s ease-in-out"
          borderRadius="3px"
          background={useColorModeValue('white', 'dark')}
          width={{ base: '100%', md: 'auto' }}
          // useColorModeValue('blue.default', 'blue.300')
          // colorMode === 'light' ? 'light' : 'dark'
          className={`markdown-body ${useColorModeValue('light', 'dark')}`}
        >
          {(readme && readme.markdown)
            ? <MarkDownParser content={readme.markdown} />
            : <MDSkeleton />}
        </Box>
      </Box>
    </Box>
  );
};

LessonSlug.propTypes = {
  lesson: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default LessonSlug;
