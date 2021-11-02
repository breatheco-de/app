/* eslint-disable react/prop-types */
import { Box, useColorMode } from '@chakra-ui/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Heading from '../common/components/Heading';
import Link from '../common/components/NextChakraLink';
import Text from '../common/components/Text';

export const getStaticProps = async ({ locale }) => {
  const results = await fetch(
    'https://raw.githubusercontent.com/breatheco-de/main-documentation/master/README.md',
  )
    .then((res) => res.text())
    .catch((err) => console.error(err));
  return {
    // props: { data:..., slug:..., more... },
    props: {
      fallback: false,
      ...(await serverSideTranslations(locale, ['navbar', 'footer'])),
      data: results,
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
        <Text>{data}</Text>
      </Box>
    </Box>
  );
};

export default AboutUs;
