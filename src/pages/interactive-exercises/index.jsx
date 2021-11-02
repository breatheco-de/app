import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  Box, useColorMode, useColorModeValue, Stack, Grid,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import Link from '../../common/components/NextChakraLink';
import Image from '../../common/components/Image';
import TagCapsule from '../../common/components/TagCapsule';

export const getStaticProps = async ({ locale }) => {
  const data = await fetch(
    'https://breathecode-test.herokuapp.com/v1/registry/asset?type=exercise&big=true',
    {
      Accept: 'application/json, text/plain, */*',
    },
  ).then((res) => res.json());
  // const data = await res.json();

  return {
    props: {
      ...(await serverSideTranslations(locale, ['home', 'navbar', 'footer'])),
      exercises: data,
    },
  };
};
function Exercices({ exercises }) {
  const { t } = useTranslation(['home']);
  const { colorMode } = useColorMode();
  const defaultImage = '/static/images/person-smile1.png';

  console.log('PREVIEW', exercises);

  const onImageNotFound = (event) => {
    console.log('EVENT:TARGET:::', event.target);
    event.target.setAttribute('src', defaultImage);
    event.target.setAttribute('srcset', `${defaultImage} 1x`);
  };

  return (
    <Box height="100%" flexDirection="column" justifyContent="center" alignItems="center">
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
          gridTemplateColumns={{
            base: "repeat(auto-fill, minmax(15rem, 1fr))",
            md: "repeat(auto-fill, minmax(20rem, 1fr))"
          }}
          // gridAutoRows="28rem"
          gridGap="12px"
        >
          {exercises.map((ex) => {
            // console.log('EX_PREVIEW', ex.preview);
            const getImage = ex.preview !== '' ? ex.preview : defaultImage;

            return (
              <Box
                py={2}
                key={`${ex.slug}-${ex.difficulty}`}
                border={useColorModeValue('1px solid #DADADA', 'none')}
                className="card pointer"
                bg={useColorModeValue('white', 'gray.800')}
                boxShadow="2xl"
                borderRadius="16px"
                padding="22px"
              >
                <Box display="inline-block" role="group" w="full" zIndex={1} borderRadius="15px">
                  {/* CARD IMAGE */}
                  <Link
                    href={`/interactive-exercises/${ex.slug}`}
                    display="inline-block"
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
                        backgroundImage: `url(${getImage})`,
                        filter: 'blur(15px)',
                        zIndex: 0,
                      }}
                      _groupHover={{
                        _after: {
                          filter: 'blur(50px)',
                        },
                      }}
                      onError={(e) => onImageNotFound(e)}
                      style={{ borderRadius: '15px', overflow: 'hidden' }}
                      objectFit="cover"
                      src={getImage}
                      alt={ex.title}
                    />
                  </Link>

                  {ex.technologies.length >= 1 && (
                    <TagCapsule
                      tags={ex.technologies}
                      variant="rounded"
                      paddingX="0"
                      key={`${ex.slug}-${ex.difficulty}`}
                    />
                  )}

                  <Stack align="center">
                    <Link
                      href={`/interactive-exercises/${ex.slug}`}
                      display="inline-block"
                      w="full"
                      zIndex={1}
                      color="blue.default"
                    >
                      <Heading
                        size="20px"
                        textAlign="left"
                        width="100%"
                        fontFamily="body"
                        fontWeight={700}
                      >
                        {ex.title}
                      </Heading>
                    </Link>
                    {/* <Text
                    color="gray.500"
                    textAlign="left"
                    width="100%"
                    size="sm"
                    textTransform="uppercase"
                  >
                    All you&apos;ve learned needs to be put together. Lets make our first entire
                    professional application using the Agile Development method!
                  </Text> */}
                  </Stack>
                </Box>
              </Box>
            );
          })}
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

export default Exercices;
