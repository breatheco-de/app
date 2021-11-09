/* eslint-disable no-console */
import {
  Box, useColorModeValue, Flex, Button, FormControl, Input,
} from '@chakra-ui/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { useState } from 'react';
import Heading from '../../common/components/Heading';
import Link from '../../common/components/NextChakraLink';
import Text from '../../common/components/Text';
import SimpleTable from '../../js_modules/projects/SimpleTable';
import TagCapsule from '../../common/components/TagCapsule';
import Image from '../../common/components/Image';

export const getStaticPaths = async () => {
  const data = await fetch(
    'https://breathecode-test.herokuapp.com/v1/registry/asset?type=exercise&big=true',
  )
    .then((res) => res.json())
    .catch((err) => console.log(err));
  const paths = data.map((res) => {
    console.log('RESPONSE_PATH', res.slug);
    return {
      params: { slug: res.slug },
    };
  });
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

const regex = {
  email:
    /^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@(?!mailinator|leonvero|ichkoch|naymeo|naymio)[a-zA-Z0-9]*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,
  phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
};

const ExerciseSlug = ({ exercise }) => {
  console.log('EXERCISE_exercise:', exercise);
  const [errorMessage, setErrorMessage] = useState('');
  const defaultImage = '/static/images/code1.png';
  const getImage = exercise.preview !== '' ? exercise.preview : defaultImage;
  const commonBorderColor = useColorModeValue('#DADADA', 'gray.900');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');

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
        color={useColorModeValue('blue.600', 'blue.300')}
        display="inline-block"
        borderRadius="15px"
      >
        {'< Back to Projects'}
      </Link>

      <Flex height="100%" gridGap="26px">
        <Box flex="1">
          <TagCapsule
            variant="rounded"
            tags={exercise.technologies}
            fontSize="13px"
            marginY="8px"
            style={{
              padding: '2px 10px',
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
            priority
            borderRadius="15px"
            pos="relative"
            height={{ base: '60px', sm: '90px', md: '380px' }}
            width={{ base: '60px', sm: '90px', md: '100%' }}
            maxWidth={{ base: '300px', sm: '230px', md: '100%' }}
            // NOTE: test performance in production - Blur and animation
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

          <Link
            href={exercise.url}
            target="_blank"
            rel="noopener noreferrer"
            size="12px"
            color={useColorModeValue('blue.600', 'blue.300')}
          >
            {exercise.url}
          </Link>
        </Box>

        <Box
          backgroundColor={useColorModeValue('white', 'featuredDark')}
          transition="background 0.2s ease-in-out"
          width="350px"
          minWidth="250px"
          height="auto"
          borderWidth="0px"
          borderRadius="17px"
          overflow="hidden"
          border={1}
          borderStyle="solid"
          borderColor={commonBorderColor}
        >
          <Box px="22px" pb="30px" pt="24px">
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
                      <Box
                        color={useColorModeValue('danger', 'red')}
                        mt="20px"
                        mb="10px"
                        // height="20px"
                      >
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

            <SimpleTable
              difficulty={exercise.difficulty}
              repository={exercise.url}
              duration={exercise.duration}
              videoAvailable={exercise.intro_video_url}
              technologies={exercise.technologies}
              liveDemoAvailable={exercise.intro_video_url}
            />
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

ExerciseSlug.propTypes = {
  exercise: PropTypes.objectOf(PropTypes.any).isRequired,
  isSubmitting: PropTypes.bool,
};

ExerciseSlug.defaultProps = {
  isSubmitting: false,
};

export default ExerciseSlug;
