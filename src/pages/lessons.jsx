import {
  Box, useColorModeValue, Flex, Grid,
} from '@chakra-ui/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Heading from '../common/components/Heading';
import Text from '../common/components/Text';
import Search from '../js_modules/projects/Search';
import TitleContent from '../js_modules/projects/TitleContent';
// import Link from '../common/components/NextChakraLink';

export const getStaticProps = async ({ locale }) => {
  const data = await fetch(
    'https://breathecode-test.herokuapp.com/v1/admissions/syllabus/full-stack/version/latest',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
        Academy: 4,
      },
    },
  ).then((res) => res.json());

  return {
    props: {
      fallback: false,
      ...(await serverSideTranslations(locale, ['navbar', 'footer'])),
      data,
    },
  };
};

const Lessons = ({ data }) => {
  const router = useRouter();
  console.log('MD_DATA:', data);

  const contains = (lesson) => {
    const lessonTitle = lesson.label.toLowerCase();
    if (typeof router.query.search === 'string' && !lessonTitle.includes(router.query.search)) return false;
    return true;
  };

  const filteredBySearch = data.json.days.filter((lesson) => contains(lesson));

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
          color={useColorModeValue('gray.600', 'gray.200')}
          textTransform="uppercase"
          textAlign="center"
        >
          Module map
        </Text>
        <Heading as="h1" fontWeight="700" size="m" textAlign="center">
          Full Stack Developer
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
        {filteredBySearch.map(
          (element) => element.label !== '' && (
          <Box key={`${element.id} - ${element.position}`} margin="50px 0 0 0">
            <Flex
              justifyContent="space-between"
              padding="18px 0"
              borderBottom={1}
              borderStyle="solid"
              flexDirection={{ base: 'column', md: 'row' }}
              borderColor={useColorModeValue('gray.200', 'gray.900')}
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
              color="gray.dark"
              letterSpacing="0.05em"
              lineHeight="24px"
            >
              {element.description}
            </Text>
            {element.lessons.length >= 1 && (
            <Grid
              background="featuredLight"
              gridTemplateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
              padding="22px 30px"
              borderRadius="18px"
            >
              {element.lessons.map((lesson) => (
                <Text
                  key={`${lesson.slug}-${lesson.title}`}
                  color="blue.default"
                  size="l"
                  lineHeight="28px"
                  fontWeight="700"
                >
                  {lesson.title}
                </Text>
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

Lessons.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Lessons;
