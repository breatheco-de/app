import {
  Box, useColorModeValue, Flex, Grid,
} from '@chakra-ui/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import Search from '../../js_modules/projects/Search';
import TitleContent from '../../js_modules/projects/TitleContent';
import Link from '../../common/components/NextChakraLink';

export const getStaticPaths = async () => {
  const syllabus = process.env.SYLLABUS;
  const syllabusArray = syllabus?.split(',');

  const paths = syllabusArray.map((res) => ({
    params: { slug: res },
  }));
  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params, locale }) => {
  const { slug } = params;

  const data = await fetch(
    `${process.env.BREATHECODE_HOST}/v1/admissions/syllabus/${slug}/version/latest`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
        Academy: 4,
      },
    },
  )
    .then((res) => res.json());

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      fallback: false,
      ...(await serverSideTranslations(locale, ['navbar', 'footer'])),
      data,
    },
  };
};

const Read = ({ data }) => {
  const router = useRouter();
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');

  const containsQueryString = (lesson) => {
    const lessonTitle = lesson.label.toLowerCase();
    if (typeof router.query.search === 'string' && !lessonTitle.includes(router.query.search)) return false;
    if (lesson.lessons.length <= 0) return false;
    return true;
  };

  const filteredBySearch = () => {
    if (data === null) return [];
    return data.json.days.filter(containsQueryString);
  };
  const datafiltered = filteredBySearch();

  return (
    <Box height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <TitleContent title="Lessons" mobile />
      <Flex
        justifyContent="space-between"
        flex="1"
        gridGap="20px"
        padding={{ base: '3% 4% 4% 4%', md: '1.5% 10% 1.5% 10%' }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
      >
        <TitleContent title="Lessons" mobile={false} />

        <Search />

        <Box width="0" height="0" display={{ base: 'none', md: 'block' }} />
      </Flex>
      <Flex
        flex="1"
        flexDirection="column"
        justifyContent="center"
        background="yellow.light"
        height="auto"
        padding="20px 0"
        minHeight="220px"
        gridGap="10px"
      >
        <Text
          fontWeight="400"
          letterSpacing="0.05em"
          size="md"
          color={useColorModeValue('gray.600', 'gray.600')}
          textTransform="uppercase"
          textAlign="center"
        >
          Module map
        </Text>
        <Heading
          as="h1"
          fontWeight="700"
          color={useColorModeValue('gray.900', 'gray.900')}
          size="m"
          textAlign="center"
        >
          {data.name}
        </Heading>
        <Text
          size="md"
          padding={{ base: '0 8%', md: '0 28%' }}
          textAlign="center"
          color="gray.dark"
        >
          The following lessons explain different programing concepts and have been published by
          breathe code members, search for a partiulars lesson using the filters bellow
        </Text>
      </Flex>
      <Box flex="1" margin={{ base: '0 4% 0 4%', md: '0 22% 0 22%' }}>
        {datafiltered.map(
          (element) => element.label !== '' && (
          <Box key={`${element.id} - ${element.position}`} margin="50px 0 0 0">
            <Flex
              justifyContent="space-between"
              padding="18px 0"
              borderBottom={2}
              borderStyle="solid"
              flexDirection={{ base: 'column', md: 'row' }}
              borderColor={useColorModeValue('gray.200', 'gray.500')}
            >
              <Heading as="h2" fontWeight="700" size="xsm">
                {element.label}
              </Heading>
              <Text
                as="span"
                size="l"
                letterSpacing="0.05em"
                fontWeight="400"
                textAlign={{ base: 'left', md: 'center' }}
                color="gray.default"
                textTransform="uppercase"
              >
                {element.lessons.length}
                {' '}
                lessons
              </Text>
            </Flex>
            <Text
              size="md"
              padding="15px 0"
              // color="gray.dark"
              letterSpacing="0.05em"
              lineHeight="24px"
              color={commonTextColor}
            >
              {element.description}
            </Text>
            {element.lessons.length >= 1 && (
            <Grid
              background={useColorModeValue('featuredLight', 'featuredDark')}
              gridRowGap="10px"
              gridTemplateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
              padding="22px 30px"
              borderRadius="18px"
            >
              {element.lessons.map((lesson) => (
                <Link
                  key={`${lesson.slug}-${lesson.title}`}
                  href={`/lesson/${lesson.slug}`}
                  fontSize="15px"
                  width="fit-content"
                  height="fit-content"
                  color={useColorModeValue('blue.default', 'blue.300')}
                  display="inline-block"
                  letterSpacing="0.05em"
                  fontWeight="700"
                >
                  {lesson.title}
                </Link>
              ))}
            </Grid>
            )}
          </Box>
          ),
        )}
      </Box>
    </Box>
  );
};

Read.propTypes = {
  data: PropTypes.string,
};
Read.defaultProps = {
  data: null,
};

export default Read;
