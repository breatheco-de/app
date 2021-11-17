/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-console */
import {
  Box,
  useColorModeValue,
  Flex,
  Button,
  FormControl,
  Input,
  SkeletonCircle,
  SkeletonText,
  useToast,
} from '@chakra-ui/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { useState } from 'react';
import atob from 'atob';
import Heading from '../../common/components/Heading';
import Link from '../../common/components/NextChakraLink';
import Text from '../../common/components/Text';
import SimpleTable from '../../js_modules/projects/SimpleTable';
import TagCapsule from '../../common/components/TagCapsule';
import Image from '../../common/components/Image';
import MarkDownParser from '../../common/components/MarkDownParser';

export const getStaticPaths = async () => {
  const data = await fetch(
    'https://breathecode-test.herokuapp.com/v1/registry/asset?type=exercise&big=true',
  )
    .then((res) => res.json())
    .catch((err) => console.log(err));
  const paths = data.map((res) => ({
    params: { slug: res.slug },
  }));
  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params, locale }) => {
  const { slug } = params;
  const results = await fetch(
    'https://breathecode-test.herokuapp.com/v1/registry/asset?type=exercise&big=true',
  )
    .then((res) => res.json())
    .then((data) => data.find((e) => e.slug === slug))
    .catch((err) => console.log(err));
  return {
    props: {
      fallback: false,
      ...(await serverSideTranslations(locale, ['navbar', 'footer'])),
      exercise: results,
    },
  };
};

const TabletWithForm = ({
  exercise,
  errorMessage,
  commonTextColor,
  validator,
  commonBorderColor,
}) => (
  <>
    <Box
      px="22px"
      pb="30px"
      pt="24px"
      borderBottom={1}
      borderStyle="solid"
      borderColor={commonBorderColor}
    >
      <Heading
        size="15px"
        textAlign="left"
        textTransform="uppercase"
        justify="center"
        width="100%"
        mt="0px"
        mb="0px"
      >
        Direct access request
      </Heading>

      <Text size="md" color={commonTextColor} textAlign="left" mt="10px" px="0px">
        Please enter your information and receive instant access
      </Text>

      <Formik
        initialValues={{ email: '', password: '' }}
        onSubmit={(values, actions) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            actions.setSubmitting(false);
          }, 1000);
        }}
      >
        {(props) => {
          const { isSubmitting } = props;
          return (
            <Form>
              <Box py="0" flexDirection="column" display="flex" alignItems="center">
                <Box color={useColorModeValue('danger', 'red')} mt="20px" mb="10px">
                  {errorMessage}
                </Box>
                <Field id="field923" name="email" validate={validator}>
                  {({ field, form }) => (
                    <FormControl
                      padding="6px 0"
                      isInvalid={form.errors.email && form.touched.email}
                    >
                      <Input
                        {...field}
                        id="email"
                        placeholder="Email"
                        style={{
                          borderRadius: '3px',
                          backgroundColor: useColorModeValue('#FFFFFF', '#17202A'),
                          transition: 'background 0.2s ease-in-out',
                        }}
                      />
                    </FormControl>
                  )}
                </Field>

                <Field id="field912" name="password">
                  {({ field, form }) => (
                    <FormControl
                      padding="6px 0"
                      isInvalid={form.errors.password && form.touched.password}
                    >
                      <Input
                        {...field}
                        id="password"
                        placeholder="Password"
                        type="password"
                        style={{
                          borderRadius: '3px',
                          backgroundColor: useColorModeValue('#FFFFFF', '#17202A'),
                          transition: 'background 0.2s ease-in-out',
                        }}
                      />
                    </FormControl>
                  )}
                </Field>
                <Button
                  marginTop="30px"
                  borderRadius="3px"
                  width="100%"
                  padding="0"
                  whiteSpace="normal"
                  isLoading={isSubmitting}
                  type="submit"
                  variant="default"
                  textTransform="uppercase"
                >
                  Get instant access
                </Button>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
    <Box px="22px" pb="30px" pt="24px">
      <SimpleTable
        difficulty={exercise.difficulty}
        repository={exercise.url}
        duration={exercise.duration}
        videoAvailable={exercise.solution_video_url}
        technologies={exercise.technologies}
        liveDemoAvailable={exercise.intro_video_url}
      />
    </Box>
  </>
);

const regex = {
  email:
    /^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@(?!mailinator|leonvero|ichkoch|naymeo|naymio)[a-zA-Z0-9]*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,
  phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
};

const ExerciseSlug = ({ exercise }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [notFound, setNotFound] = useState(false);
  const defaultImage = '/static/images/code1.png';
  const getImage = exercise.preview !== '' ? exercise.preview : defaultImage;
  const commonBorderColor = useColorModeValue('#DADADA', 'gray.900');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');

  const toast = useToast();

  const MDecoded = exercise.readme && typeof exercise.readme === 'string' ? atob(exercise.readme) : null;

  if (exercise.readme === '' && notFound === false) {
    setTimeout(() => {
      setNotFound(true);
      toast({
        title: 'The endpoint could not access the content of this exercise',
        // description: 'Content not found',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }, 4000);
  }

  const removeTitleAndImage = (str) => str.replace(new RegExp('(.+)', 'm'), '').replace(new RegExp('<a.*?>+.*>', 'g'), '');

  const onImageNotFound = (event) => {
    event.target.setAttribute('src', defaultImage);
    event.target.setAttribute('srcset', `${defaultImage} 1x`);
  };

  const validator = (value) => {
    let error;
    if (!value) {
      error = 'Email is required';
    } else if (!regex.email.test(value)) {
      error = 'Invalid email address';
    }
    setErrorMessage(error);
    return error;
  };

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      margin={{ base: '4% 4% 0 4%', md: '4% 10% 0 10%' }}
    >
      <Link
        href="/interactive-exercises"
        color={useColorModeValue('blue.default', 'blue.300')}
        display="inline-block"
        letterSpacing="0.05em"
        fontWeight="700"
        paddingBottom="10px"
      >
        {'< Back to Exercises'}
      </Link>

      <Flex height="100%" gridGap="26px">
        <Box flex="1">
          <TagCapsule
            variant="rounded"
            tags={exercise.technologies}
            fontSize="13px"
            marginY="18px"
            fontWeight="700"
            style={{
              padding: '4px 12px',
              margin: '0',
            }}
            gap="10px"
            paddingX="0"
          />
          <Heading
            as="h1"
            size="25px"
            fontWeight="700"
            transition="color 0.2s ease-in-out"
            color={useColorModeValue('black', 'white')}
            textTransform="uppercase"
          >
            {exercise.title}
          </Heading>

          <Image
            width="100%"
            height={{ base: '190px', md: '400px' }}
            margin="30px 0"
            maxWidth="55rem"
            maxHeight="500px"
            minHeight={{ base: 'auto', md: '300px' }}
            priority
            borderRadius="15px"
            pos="relative"
            _groupHover={{
              _after: {
                filter: 'blur(50px)',
              },
            }}
            onError={(e) => onImageNotFound(e)}
            style={{ borderRadius: '15px', overflow: 'hidden' }}
            objectFit="cover"
            src={getImage}
            alt={exercise.title}
          />

          <Box
            display={{ base: 'flex', md: 'none' }}
            flexDirection="column"
            margin="30px 0"
            backgroundColor={useColorModeValue('white', 'featuredDark')}
            transition="background 0.2s ease-in-out"
            width="100%"
            height="auto"
            borderWidth="0px"
            borderRadius="17px"
            overflow="hidden"
            border={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
          >
            <TabletWithForm
              exercise={exercise}
              errorMessage={errorMessage}
              commonTextColor={commonTextColor}
              commonBorderColor={commonBorderColor}
              validator={validator}
            />
          </Box>

          {/* MARKDOWN SIDE */}
          <Box
            padding="28px 32px"
            borderRadius="3px"
            background={useColorModeValue('featuredLight', 'featuredDark')}
          >
            {MDecoded ? (
              <MarkDownParser content={removeTitleAndImage(MDecoded)} />
            ) : (
              <Box
                padding="6"
                display={notFound === false ? 'block' : 'none'}
                boxShadow="lg"
                bg="white"
              >
                <SkeletonCircle size="10" />
                <SkeletonText mt="6" noOfLines={2} spacing="4" />
                <SkeletonText mt="16" noOfLines={10} spacing="4" />
              </Box>
            )}

            {notFound && <Text size="l">No content to see here 🙄</Text>}
          </Box>
        </Box>

        <Box
          display={{ base: 'none', md: 'flex' }}
          flexDirection="column"
          backgroundColor={useColorModeValue('white', 'featuredDark')}
          transition="background 0.2s ease-in-out"
          width="350px"
          minWidth="250px"
          height="fit-content"
          borderWidth="0px"
          borderRadius="17px"
          overflow="hidden"
          border={1}
          borderStyle="solid"
          borderColor={commonBorderColor}
        >
          <TabletWithForm
            exercise={exercise}
            errorMessage={errorMessage}
            commonTextColor={commonTextColor}
            commonBorderColor={commonBorderColor}
            validator={validator}
          />
        </Box>
      </Flex>
    </Box>
  );
};

ExerciseSlug.propTypes = {
  exercise: PropTypes.objectOf(PropTypes.any).isRequired,
};

TabletWithForm.propTypes = {
  exercise: PropTypes.objectOf(PropTypes.any).isRequired,
  errorMessage: PropTypes.string.isRequired,
  commonTextColor: PropTypes.string.isRequired,
  commonBorderColor: PropTypes.string.isRequired,
  validator: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};
TabletWithForm.defaultProps = {
  isSubmitting: false,
};

export default ExerciseSlug;
