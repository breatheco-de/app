import { Box, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PropTypes from 'prop-types';
import Heading from '../common/components/Heading';
import Link from '../common/components/NextChakraLink';
import getMarkDownContent from '../common/components/MarkDownParser/markdown';
import MarkDownParser from '../common/components/MarkDownParser';

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
      data: markdownContent.content,
    },
  };
};

const AboutUs = ({ data }) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      padding="45px 0 0 0"
      margin={{ base: '0', md: '4% 10% 0 10%' }}
    >
      <Link
        href="/"
        display="inline-block"
        padding={{ base: '0px 10px 15px 10px', md: '0' }}
        w="auto"
        borderRadius="15px"
      >
        {'< Back to Home'}
      </Link>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        flex="1"
        margin={{ base: '0', md: '4% 10% 0 10%' }}
      >
        <Heading
          as="h1"
          w="100%"
          padding="0 0 30px 0"
          size="xl"
          fontWeight="700"
          color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
          textTransform="uppercase"
        >
          About Us - Markdown
        </Heading>

        <Box
          padding="28px 32px"
          borderRadius="3px"
          background={useColorModeValue('#F2F6FA', 'featuredDark')}
          width="100%"
          className={`markdown-body ${colorMode === 'light' ? 'light' : 'dark'}`}
          transition="background .2s ease"
        >
          <MarkDownParser content={data} />
        </Box>
      </Box>
    </Box>
  );
};

AboutUs.propTypes = {
  data: PropTypes.string.isRequired,
};

export default AboutUs;
