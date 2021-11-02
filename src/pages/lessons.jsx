/* eslint-disable react/prop-types */
import { Box, useColorMode } from '@chakra-ui/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Heading from '../common/components/Heading';
import Link from '../common/components/NextChakraLink';
import Text from '../common/components/Text';

export const getStaticProps = async ({ locale }) => {
  const results = await fetch('https://content.breatheco.de/static/api/lessons.json')
    .then((res) => res.json())
    .then((res) => res.filter((l) => l.status === 'draft' || l.status === 'published'))
    .catch((err) => console.error(err));

  const authors = results.map((l) => l.authors);
  return {
    // props: { data:..., slug:..., more... },
    props: {
      fallback: false,
      ...(await serverSideTranslations(locale, ['navbar', 'footer'])),
      authors: authors.filter((item, pos) => authors.indexOf(item) === pos && item !== null),
      data: results || null,
    },
  };
};

const Lessons = ({ data, authors }) => {
  console.log('MD_DATA:', data);
  console.log('authors', authors);

  const { colorMode } = useColorMode();

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      margin={{ base: '4% 4% 0 4%', md: '4% 10% 0 10%' }}
    >
      <Link href="/" display="inline-block" w="full" borderRadius="15px">
        {'< Back to Home'}
      </Link>

      <Box flex="1" margin={{ base: '4% 4% 0 4%', md: '4% 10% 0 10%' }}>
        {data.map((lesson) => (
          <Box padding="15px 0">
            <Heading
              as="h1"
              size="l"
              fontWeight="700"
              color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
              textTransform="uppercase"
            >
              {lesson.title}
            </Heading>
            <Text size="lg">{lesson.subtitle}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Lessons;
