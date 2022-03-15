import {
  Box,
  useColorModeValue,
  Flex,
  Button,
  FormControl,
  Input,
  useToast,
  useColorMode,
  FormErrorMessage,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Formik, Form, Field } from 'formik';
import { useState } from 'react';
import atob from 'atob';
import Heading from '../../common/components/Heading';
import Link from '../../common/components/NextChakraLink';
import Text from '../../common/components/Text';
import SimpleTable from '../../js_modules/projects/SimpleTable';
// import TagCapsule from '../../common/components/TagCapsule';
// import Image from '../../common/components/Image';
import MarkDownParser from '../../common/components/MarkDownParser';
import { MDSkeleton } from '../../common/components/Skeleton';
import validationSchema from '../../common/components/Forms/validationSchemas';
import { processFormEntry } from '../../common/components/Forms/actions';

export const getStaticPaths = async ({ locales }) => {
  const data = await fetch(
    `${process.env.BREATHECODE_HOST}/v1/registry/asset?type=exercise&big=true`,
  )
    .then((res) => res.json())
    .catch((err) => console.log(err));

  const paths = data.flatMap((res) => locales.map((locale) => ({
    params: {
      slug: res.slug,
    },
    locale,
  })));

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;
  const results = await fetch(
    `${process.env.BREATHECODE_HOST}/v1/registry/asset?type=exercise&big=true`,
  )
    .then((res) => res.json())
    .then((data) => data.find((e) => e.slug === slug))
    .catch((err) => console.log(err));
  return {
    props: {
      fallback: false,
      exercise: results,
    },
  };
};

const fields = {
  full_name: {
    value: '', type: 'name', required: true, place_holder: 'Full name *', error: 'Please specify a valid full name',
  },
  email: {
    value: '', type: 'email', required: true, place_holder: 'Email *', error: 'Please specify a valid email',
  },
};

const TabletWithForm = ({
  toast,
  exercise,
  commonTextColor,
  commonBorderColor,
}) => {
  const [formStatus, setFormStatus] = useState({ status: 'idle', msg: '' });
  return (
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

        <Text size="md" color={commonTextColor} textAlign="left" my="10px" px="0px">
          Please enter your information and receive instant access
        </Text>

        <Formik
          initialValues={{ full_name: '', email: '', current_download: exercise.slug }}
          onSubmit={(values, actions) => {
            processFormEntry(values).then((data) => {
              actions.setSubmitting(false);
              if (data && data.error !== false && data.error !== undefined) {
                setFormStatus({ status: 'error', msg: data.error });
              } else {
                setFormStatus({ status: 'thank-you', msg: 'Thank you for your request!' });
                toast({
                  title: 'Thank you for your request!',
                  description: 'An email will be sent to you shortly.',
                  status: 'success',
                  duration: 7000,
                  isClosable: true,
                });
              }
            })
              .catch((error) => {
                console.error('error', error);
                actions.setSubmitting(false);
                setFormStatus({ status: 'error', msg: error.message || error });
              });
          }}
          validationSchema={validationSchema.leadForm}
        >
          {(props) => {
            const { isSubmitting } = props;
            return (
              <Form>
                <Box py="0" flexDirection="column" display="flex" alignItems="center">
                  <Field id="field912" name="full_name">
                    {({ field, form }) => (
                      <FormControl
                        padding="6px 0"
                        isInvalid={form.errors.full_name && form.touched.full_name}
                      >
                        <Input
                          {...field}
                          id="full_name"
                          placeholder={fields.full_name.place_holder}
                          type="name"
                          style={{
                            borderRadius: '3px',
                            backgroundColor: useColorModeValue('#FFFFFF', '#17202A'),
                            transition: 'background 0.2s ease-in-out',
                          }}
                        />
                        <FormErrorMessage>{fields.full_name.error}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field id="field923" name="email">
                    {({ field, form }) => (
                      <FormControl
                        padding="6px 0"
                        isInvalid={form.errors.email && form.touched.email}
                      >
                        <Input
                          {...field}
                          id="email"
                          placeholder={fields.email.place_holder}
                          type="email"
                          style={{
                            borderRadius: '3px',
                            backgroundColor: useColorModeValue('#FFFFFF', '#17202A'),
                            transition: 'background 0.2s ease-in-out',
                          }}
                        />
                        <FormErrorMessage>{fields.email.error}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  {formStatus.status === 'error' && (
                    <FormErrorMessage>{formStatus.msg}</FormErrorMessage>
                  )}
                  <Button
                    marginTop="30px"
                    borderRadius="3px"
                    width="100%"
                    padding="0"
                    disabled={formStatus.status === 'thank-you'}
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
};

const ExerciseSlug = ({ exercise }) => {
  const { t } = useTranslation(['exercises']);
  const [notFound, setNotFound] = useState(false);
  // const defaultImage = '/static/images/code1.png';
  // const getImage = exercise.preview !== '' ? exercise.preview : defaultImage;
  const commonBorderColor = useColorModeValue('#DADADA', 'gray.900');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const { colorMode } = useColorMode();

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

  // const onImageNotFound = (event) => {
  //   event.target.setAttribute('src', defaultImage);
  //   event.target.setAttribute('srcset', `${defaultImage} 1x`);
  // };

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
        {`← ${t('exercises:backToExercises')}`}
      </Link>

      <Flex height="100%" gridGap="26px">
        <Box flex="1">
          {/* <TagCapsule
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
          /> */}
          <Heading
            as="h1"
            size="25px"
            fontWeight="700"
            padding="10px 0 35px 0"
            transition="color 0.2s ease-in-out"
            color={useColorModeValue('black', 'white')}
            textTransform="uppercase"
          >
            {exercise.title}
          </Heading>

          {/* <Image
            width="100%"
            height={{ base: '190px', md: '400px' }}
            margin="30px 0"
            maxWidth="55rem"
            maxHeight="500px"
            minHeight={{ base: 'auto', md: '300px' }}
            priority
            borderRadius="3px"
            pos="relative"
            _groupHover={{
              _after: {
                filter: 'blur(50px)',
              },
            }}
            onError={(e) => onImageNotFound(e)}
            style={{ overflow: 'hidden' }}
            objectFit="cover"
            src={getImage}
            alt={exercise.title}
          /> */}

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
              toast={toast}
              exercise={exercise}
              commonTextColor={commonTextColor}
              commonBorderColor={commonBorderColor}
            />
          </Box>

          {/* MARKDOWN SIDE */}
          <Box
            padding="28px 32px"
            borderRadius="3px"
            background={useColorModeValue('#F2F6FA', 'featuredDark')}
            width={{ base: '34rem', md: '54rem' }}
            className={`markdown-body ${colorMode === 'light' ? 'light' : 'dark'}`}
          >
            {MDecoded ? (
              <MarkDownParser content={removeTitleAndImage(MDecoded)} />
            ) : (
              <MDSkeleton />
            )}
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
            toast={toast}
            exercise={exercise}
            commonTextColor={commonTextColor}
            commonBorderColor={commonBorderColor}
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
  isSubmitting: PropTypes.bool,
  toast: PropTypes.func.isRequired,
  commonTextColor: PropTypes.string.isRequired,
  commonBorderColor: PropTypes.string.isRequired,
  exercise: PropTypes.objectOf(PropTypes.any).isRequired,
};
TabletWithForm.defaultProps = {
  isSubmitting: false,
};

export default ExerciseSlug;
