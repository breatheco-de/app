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
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import { useEffect, useState } from 'react';
// import atob from 'atob';
import { useRouter } from 'next/router';
import getT from 'next-translate/getT';
import { languageLabel } from '../../../utils';
import Heading from '../../../common/components/Heading';
import Link from '../../../common/components/NextChakraLink';
import Text from '../../../common/components/Text';
import SimpleTable from '../../../js_modules/projects/SimpleTable';
// import TagCapsule from '../../common/components/TagCapsule';
// import Image from '../../common/components/Image';
import MarkDownParser from '../../../common/components/MarkDownParser';
import { MDSkeleton } from '../../../common/components/Skeleton';
import validationSchema from '../../../common/components/Forms/validationSchemas';
import { processFormEntry } from '../../../common/components/Forms/actions';
import getMarkDownContent from '../../../common/components/MarkDownParser/markdown';

export const getStaticPaths = async ({ locales }) => {
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?type=exercise&big=true`);
  const data = await resp.json();

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

export const getStaticProps = async ({ params, locale, locales }) => {
  const { slug } = params;
  const t = await getT(locale, 'how-to');
  const staticImage = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}?type=exercise`);
  const result = await resp.json();

  const {
    title, translations, description, preview,
  } = result;
  const markdownResp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.md`);
  const markdown = await markdownResp.text();

  // in "lesson.translations" rename "us" key to "en" key if exists
  if (result?.translations && result.translations.us) {
    result.translations.en = result.translations.us;
    delete result.translations.us;
  }

  if (resp.status >= 400) {
    return {
      notFound: true,
    };
  }

  const ogUrl = {
    en: `/interactive-exercise/${slug}`,
    us: `/interactive-exercise/${slug}`,
  };

  return {
    props: {
      seo: {
        type: 'article',
        title,
        image: preview || staticImage,
        description: description || '',
        translations,
        pathConnector: '/interactive-exercise',
        url: ogUrl.en || `/${locale}/interactive-exercise/${slug}`,
        keywords: result?.seo_keywords || '',
        card: 'large',
        locales,
        locale,
        publishedTime: result?.created_at || '',
        modifiedTime: result?.updated_at || '',
      },
      fallback: false,
      exercise: result,
      markdown,
      // translations: result.translations,
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
  const { t } = useTranslation('exercises');
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
          {t('direct-access-request')}
        </Heading>

        <Text size="md" color={commonTextColor} textAlign="left" my="10px" px="0px">
          {t('direct-access-request-description')}
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
                  title: t('alert-message:request-apply-success'),
                  description: t('alert-message:email-will-be-sent'),
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
                          placeholder={t('common:full-name')}
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
                          placeholder={t('common:email')}
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
                    {t('get-instant-access')}
                  </Button>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </Box>
      <Box px="22px" pb="30px" pt="24px">
        <SimpleTable
          href="/interactive-exercises"
          difficulty={exercise.difficulty !== null && exercise.difficulty.toLowerCase()}
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

const Exercise = ({ exercise, markdown }) => {
  const { t } = useTranslation(['exercises']);
  const markdownData = getMarkDownContent(markdown);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();
  const language = router.locale === 'en' ? 'us' : 'es';
  const currentLanguageLabel = languageLabel[language] || language;
  const { slug } = router.query;
  // const defaultImage = '/static/images/code1.png';
  // const getImage = exercise.preview !== '' ? exercise.preview : defaultImage;
  const commonBorderColor = useColorModeValue('#DADADA', 'gray.900');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const { colorMode } = useColorMode();

  const toast = useToast();

  // const MDecoded = exercise.readme
  //   && typeof exercise.readme === 'string' ? atob(exercise.readme) : null;

  if (exercise.readme === '' && notFound === false) {
    setTimeout(() => {
      setNotFound(true);
      toast({
        title: t('alert-message:content-not-found', { lesson: t('common:exercise') }),
        // description: 'Content not found',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }, 4000);
  }

  useEffect(() => {
    axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}?type=exercise`)
      .then(({ data }) => {
        let currentlocaleLang = data.translations[language];
        if (currentlocaleLang === undefined) currentlocaleLang = `${slug}-${language}`;
        axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${currentlocaleLang}?asset_type=EXERCISE`)
          .catch(() => {
            toast({
              title: t('alert-message:language-not-found', { currentLanguageLabel }),
              status: 'warning',
              duration: 5500,
              isClosable: true,
            });
          });
      });
  }, [language]);

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
      margin={{ base: '4% 4% 0 4%', lg: '4% 10% 0 10%' }}
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

      <Flex display={{ base: 'block', lg: 'flex' }} height="100%" gridGap="26px">
        <Box flex="1">
          <Heading
            as="h1"
            size="32px"
            fontWeight="700"
            textTransform="capitalize"
            padding="10px 0 35px 0"
            transition="color 0.2s ease-in-out"
            color={useColorModeValue('black', 'white')}
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
            display={{ base: 'flex', lg: 'none' }}
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
            borderRadius="3px"
            maxWidth="1012px"
            flexGrow={1}
            // margin="0 8vw 4rem 8vw"
            // width={{ base: '34rem', md: '54rem' }}
            className={`markdown-body ${colorMode === 'light' ? 'light' : 'dark'}`}
          >
            {markdown ? (
              <MarkDownParser content={markdownData.content} />
              // <MarkDownParser content={removeTitleAndImage(MDecoded)} />
            ) : (
              <MDSkeleton />
            )}
          </Box>
        </Box>

        <Box
          display={{ base: 'none', lg: 'flex' }}
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

Exercise.propTypes = {
  exercise: PropTypes.objectOf(PropTypes.any).isRequired,
  markdown: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
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

export default Exercise;
