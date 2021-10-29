import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  Box, useColorMode, useColorModeValue, Stack, Grid,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import getConfig from 'next/config';
import axios from 'axios';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import Link from '../../common/components/NextChakraLink';
import Image from '../../common/components/Image';
import TagCapsule from '../../common/components/TagCapsule';

const { publicRuntimeConfig } = getConfig();
function Exercices({ exercises }) {
  const { t } = useTranslation(['home']);
  const { colorMode } = useColorMode();

  // console.log('EXERCISES:::', exercises);
  return (
    <Box height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <Head>
        <title>Exercices</title>
        <meta name="description" content="Learn with Breatheco.de" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box flex="1" margin={{ base: '4% 4% 0 4%', md: '4% 10% 0 10%' }}>
        <Heading
          as="h1"
          size="14px"
          fontWeight="700"
          color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
          textTransform="uppercase"
        >
          Exercices
        </Heading>
        <Heading as="h2" size={{ base: '50px', md: '70px' }} style={{ wordWrap: 'normal' }}>
          {t('welcome')}
        </Heading>
        <Text size="12px" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
          {t('description')}
        </Text>

        <Text size="md" display="flex" alignItems="center" gridGap="14px">
          {t('followUs')}
          <Icon icon="youtube" width="15px" height="15px" color="black" />
          <Icon icon="github" width="15px" height="15px" />
        </Text>

        <Grid
          // maxHeight="300vh"
          gridTemplateColumns={{
            base: 'repeat(auto-fill, minmax(15rem, 1fr))',
            md: 'repeat(auto-fill, minmax(20rem, 1fr))',
          }}
          gridAutoRows="28rem"
          gridGap="12px"
        >
          {/* {exercises.map((ex) => (
            <Box borderRadius="17px" border="1px solid">
              <Link
                className="card pointer"
                href={`/interactive-exercise/${ex.slug}`}
                key={`${ex.title}-${ex.difficulty}`}
              >
                {ex.preview && (
                  <Image
                    src={ex.preview}
                    width="100%"
                    height="150px"
                    mb="0"
                    alt={`Preview for ${ex.title}`}
                  />
                )}
                <Box className="card-body">
                  <Heading as="h5" size="20px" className="card-title">
                    {ex.title}
                  </Heading>
                </Box>
              </Link>
            </Box>
          ))} */}

          {exercises.map((ex) => (
            <Box
              py={2}
              key={`${ex.slug}-${ex.difficulty}`}
              border="1px solid #DADADA"
              className="card pointer"
              bg={useColorModeValue('white', 'gray.800')}
              boxShadow="2xl"
              borderRadius="16px"
              // pos="relative"
              padding="22px"
              // margin="22px 0"
              // padding="20px"
            >
              {/* <Center py={2} key={`${ex.slug}-${ex.difficulty}`} border="1px solid"> */}
              <Box
                display="inline-block"
                role="group"
                // maxW="330px"
                w="full"
                zIndex={1}
                borderRadius="15px"
              >
                {ex.preview && (
                  <Link
                    href={`/interactive-exercises/${ex.slug}`}
                    display="inline-block"
                    // maxW="330px"
                    w="full"
                    zIndex={1}
                    borderRadius="15px"
                  >
                    <Image
                      priority
                      borderRadius="15px"
                      classNameImg="centerImageForBlur"
                      pos="relative"
                      height="230px"
                      _after={{
                        transition: 'all .8s ease',
                        content: '""',
                        w: 'full',
                        h: 'full',
                        pos: 'absolute',
                        top: 0,
                        left: 0,
                        backgroundImage: `url(${ex.preview})`,
                        filter: 'blur(15px)',
                        zIndex: 0,
                      }}
                      _groupHover={{
                        _after: {
                          filter: 'blur(50px)',
                        },
                      }}
                      style={{ borderRadius: '15px', overflow: 'hidden' }}
                      // borderRadius="2xl"
                      // height={230}
                      // width={282}
                      objectFit="cover"
                      src={ex.preview}
                      alt={ex.title}
                    />
                  </Link>
                )}

                {ex.technologies.length >= 1 && (
                  <TagCapsule
                    tags={ex.technologies}
                    variant="rounded"
                    paddingX="0"
                    key={`${ex.slug}-${ex.difficulty}`}
                  />
                )}

                <Stack align="center">
                  <Heading
                    size="20px"
                    textAlign="left"
                    width="100%"
                    fontFamily="body"
                    fontWeight={500}
                  >
                    {ex.title}
                  </Heading>
                  <Text
                    color="gray.500"
                    textAlign="left"
                    width="100%"
                    size="sm"
                    textTransform="uppercase"
                  >
                    {/* {ex.title} */}
                    All you&apos;ve learned needs to be put together. Lets make our first entire
                    professional application using the Agile Development method!
                  </Text>
                </Stack>
              </Box>
              {/* </Center> */}
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

Exercices.propTypes = {
  exercises: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};
Exercices.defaultProps = {
  exercises: [],
};

export const getStaticProps = async ({ locale }) => {
  const data = await axios
    .get(`${publicRuntimeConfig.BREATHECODE_HOST}/registry/asset?type=exercise&big=true`, {
      Accept: 'application/json, text/plain, */*',
    })
    .then((res) => res.json())
    .catch((err) => console.log(err));
  // const data = await res.json();

  return {
    props: {
      ...(await serverSideTranslations(locale, ['home', 'navbar', 'footer'])),
      exercises: data || null,
    },
  };
};

export default Exercices;
