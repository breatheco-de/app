// import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  Box,
  useColorModeValue,
  Stack,
  Grid,
  Input,
  Button,
  Flex,
  InputLeftElement,
  InputGroup,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import Link from '../../common/components/NextChakraLink';
import Image from '../../common/components/Image';
import TagCapsule from '../../common/components/TagCapsule';
import Icon from '../../common/components/Icon';

export const getStaticProps = async ({ locale }) => {
  const data = await fetch(
    'https://breathecode-test.herokuapp.com/v1/registry/asset?type=exercise&big=true',
    {
      Accept: 'application/json, text/plain, */*',
    },
  ).then((res) => res.json());

  return {
    props: {
      ...(await serverSideTranslations(locale, ['home', 'navbar', 'footer'])),
      exercises: data,
    },
  };
};
function Exercices({ exercises }) {
  // const { t } = useTranslation(['home']);
  const defaultImage = '/static/images/code1.png';
  const bgBlur = '/static/images/codeBlur.png';

  console.log('PREVIEW', exercises);

  const onImageNotFound = (event) => {
    event.target.setAttribute('src', defaultImage);
    event.target.setAttribute('srcset', `${defaultImage} 1x`);
  };

  return (
    <Box height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <Flex
        justifyContent="space-between"
        flexDirection={{ base: 'column', md: 'row' }}
        flex="1"
        gridGap="20px"
        padding={{ base: '1.5% 4% 1.5% 4%', md: '1.5% 10% 1.5% 10%' }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
      >
        <Flex alignItems="center" gridGap="20px">
          <Box
            display="flex"
            justifyContent="center"
            width="35px"
            height="35px"
            borderRadius="3rem"
            backgroundColor="yellow.default"
          >
            <Icon icon="strength" color="white" width="22px" />
          </Box>

          <Heading as="h1" size="30px">
            Projects
          </Heading>
        </Flex>
        <InputGroup width={{ base: 'auto', md: '36rem' }}>
          <InputLeftElement pointerEvents="none">
            <Icon icon="search" color="gray" width="16px" height="16px" />
          </InputLeftElement>
          <Input
            id="search"
            width="100%"
            // width="70%"
            placeholder="Search Project"
            transition="all .2s ease"
            style={{
              borderRadius: '3px',
              backgroundColor: useColorModeValue('white', '#2D3748'),
            }}
          />
        </InputGroup>

        <Button
          variant="outline"
          border={1}
          borderStyle="solid"
          minWidth="125px"
          borderColor={useColorModeValue('#DADADA', 'gray.900')}
        >
          <Icon icon="setting" width="20px" height="20px" style={{ minWidth: '20px' }} />
          <Text textTransform="uppercase" color="black" pl="10px">
            Filtros
          </Text>
        </Button>
      </Flex>

      <Box flex="1" margin={{ base: '0 4% 0 4%', md: '0 10% 0 10%' }}>
        <Text
          size="md"
          display="flex"
          padding={{ base: '30px 8%', md: '30px 28%' }}
          textAlign="center"
        >
          Practice and develop your coding skills by building real live interactive autograded
          projects with solutions and video tutorials
        </Text>

        <Grid
          gridTemplateColumns={{
            base: 'repeat(auto-fill, minmax(15rem, 1fr))',
            md: 'repeat(auto-fill, minmax(20rem, 1fr))',
          }}
          gridGap="12px"
        >
          {exercises.map((ex) => {
            const getImage = ex.preview !== '' ? ex.preview : defaultImage;
            return (
              <Box
                py={2}
                key={`${ex.slug}-${ex.difficulty}`}
                border={useColorModeValue('1px solid #DADADA', 'none')}
                className="card pointer"
                bg={useColorModeValue('white', 'gray.800')}
                // boxShadow="xl"
                transition="transform .3s ease-in-out"
                _hover={{
                  transform: 'scale(1.05)',
                  boxShadow: '0 10px 20px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06)',
                }}
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
                      height="180px"
                      // NOTE: test performance in production - Blur Background
                      _after={{
                        transition: 'all .8s ease',
                        content: '""',
                        w: 'full',
                        h: 'full',
                        pos: 'absolute',
                        top: 0,
                        left: 0,
                        backgroundImage: `url(${bgBlur})`,
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
                      marginY="8px"
                      gap="10px"
                      paddingX="0"
                      key={`${ex.slug}-${ex.difficulty}`}
                    />
                  )}

                  <Stack align="center" padding="18px 0 0 0">
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
