/* eslint-disable react/prop-types */
import { Box, useColorMode } from '@chakra-ui/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Heading from '../common/components/Heading';
import Link from '../common/components/NextChakraLink';
import getMarkDownContent from '../common/components/MarkDownParser/markdown';
import renderMarkdown from '../common/components/MarkDownParser/markdownToHtml';

export const getStaticProps = async ({ locale }) => {
  const results = await fetch(
    'https://raw.githubusercontent.com/breatheco-de/content/master/src/content/lesson/intro-to-4geeks.es.md',
  )
    .then((res) => res.text())
    .catch((err) => console.error(err));
  const markdownContent = getMarkDownContent(results);
  const html = await renderMarkdown(markdownContent.content);
  // console.log(html, '###########');
  return {
    // props: { data:..., slug:..., more... },
    props: {
      fallback: false,
      ...(await serverSideTranslations(locale, ['navbar', 'footer'])),
      data: html,
    },
  };
};

const AboutUs = ({ data }) => {
  // console.log('MD_DATA:', data);
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
        <Heading
          as="h1"
          size="xl"
          fontWeight="700"
          color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
          textTransform="uppercase"
        >
          About Us - Markdown
        </Heading>
        <main dangerouslySetInnerHTML={{ __html: data }} />
      </Box>
    </Box>
  );
};

export default AboutUs;
