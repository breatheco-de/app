/* eslint-disable no-unsafe-optional-chaining */
import {
  Box,
  useColorModeValue,
  Button,
  FormControl,
  Input,
  useToast,
  useColorMode,
  FormErrorMessage,
  Skeleton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ListItem,
  OrderedList,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Formik, Form, Field } from 'formik';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import getT from 'next-translate/getT';
import styled from 'styled-components';
import Head from 'next/head';
import useAuth from '../../../common/hooks/useAuth';
import Heading from '../../../common/components/Heading';
import Link from '../../../common/components/NextChakraLink';
import Text from '../../../common/components/Text';
import Icon from '../../../common/components/Icon';
import SimpleTable from '../../../js_modules/projects/SimpleTable';
import TagCapsule from '../../../common/components/TagCapsule';
import MarkDownParser from '../../../common/components/MarkDownParser';
import { MDSkeleton } from '../../../common/components/Skeleton';
import validationSchema from '../../../common/components/Forms/validationSchemas';
import { processFormEntry } from '../../../common/components/Forms/actions';
import getMarkDownContent from '../../../common/components/MarkDownParser/markdown';
import MktRecommendedCourses from '../../../common/components/MktRecommendedCourses';
import CustomTheme from '../../../../styles/theme';
import GridContainer from '../../../common/components/GridContainer';
import redirectsFromApi from '../../../../public/redirects-from-api.json';
// import MktSideRecommendedCourses from '../../../common/components/MktSideRecommendedCourses';
import useStyle from '../../../common/hooks/useStyle';
import { parseQuerys } from '../../../utils/url';
import { cleanObject } from '../../../utils';

export const getStaticPaths = async ({ locales }) => {
  const querys = parseQuerys({
    asset_type: 'EXERCISE',
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    academy: process.env.WHITE_LABLE_ACADEMY || '4,5,6,47',
    limit: 2000,
  });
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset${querys}`);
  const data = await resp.json();

  const paths = data.results.flatMap((res) => locales.map((locale) => ({
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
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}?asset_type=exercise`);
  const result = await resp.json();

  const engPrefix = {
    us: 'en',
    en: 'en',
  };

  const isCurrenLang = locale === engPrefix[result?.lang] || locale === result?.lang;

  if (resp.status >= 400 || result.asset_type !== 'EXERCISE' || !isCurrenLang) {
    return {
      notFound: true,
    };
  }

  const {
    title, translations, description, preview,
  } = result;
  const markdownResp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.md`);

  if (markdownResp?.status >= 400) {
    return {
      notFound: true,
    };
  }

  const markdown = await markdownResp.text();

  // in "lesson.translations" rename "us" key to "en" key if exists
  if (result?.translations && result.translations.us) {
    result.translations.en = result.translations.us;
    delete result.translations.us;
  }

  const ogUrl = {
    en: `/interactive-exercise/${slug}`,
    us: `/interactive-exercise/${slug}`,
  };

  const translationArray = [
    {
      value: 'us',
      lang: 'en',
      slug: translations?.us,
      link: `/interactive-exercise/${translations?.us}`,
    },
    {
      value: 'en',
      lang: 'en',
      slug: translations?.en,
      link: `/interactive-exercise/${translations?.en}`,
    },
    {
      value: 'es',
      lang: 'es',
      slug: translations?.es,
      link: `/es/interactive-exercise/${translations?.es}`,
    },
  ].filter((item) => translations?.[item?.value] !== undefined);

  const eventStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: result?.title,
    description: result?.description,
    url: `https://4geeks.com/${slug}`,
    image: `https://4geeks.com/thumbnail?slug=${slug}`,
    datePublished: result?.published_at,
    dateModified: result?.updated_at,
    author: result?.author ? {
      '@type': 'Person',
      name: `${result?.author?.first_name} ${result?.author?.last_name}`,
    } : null,
    keywords: result?.seo_keywords,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://4geeks.com/${slug}`,
    },
  };

  const cleanedStructuredData = cleanObject(eventStructuredData);

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
        slug,
        keywords: result?.seo_keywords || '',
        card: 'large',
        locales,
        locale,
        publishedTime: result?.created_at || '',
        modifiedTime: result?.updated_at || '',
      },
      fallback: false,
      exercise: {
        ...result,
        structuredData: cleanedStructuredData,
      },
      translations: translationArray,
      markdown,
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

function TabletWithForm({
  toast,
  exercise,
  commonTextColor,
  commonBorderColor,
}) {
  const { t } = useTranslation('exercises');
  const { user } = useAuth();
  const [formSended, setFormSended] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formStatus, setFormStatus] = useState({ status: 'idle', msg: '' });
  const { backgroundColor } = useStyle();

  const UrlInput = styled.input`
    cursor: pointer;
    background: none;
    width: 100%;
    &:focus {
      outline: none;
    }
  `;

  return (
    <>
      {exercise?.structuredData?.name && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(exercise.structuredData) }}
          />
        </Head>
      )}
      <Box
        px="22px"
        pb="30px"
        pt="24px"
        borderBottom={1}
        borderStyle="solid"
        borderColor={commonBorderColor}
      >
        {!user && !formSended
          ? (
            <>
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
                        position: 'top',
                        title: t('alert-message:request-apply-success'),
                        description: t('alert-message:email-will-be-sent'),
                        status: 'success',
                        duration: 7000,
                        isClosable: true,
                      });
                      setFormSended(true);
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
                                backgroundColor={backgroundColor}
                                style={{
                                  borderRadius: '3px',
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
                                backgroundColor={backgroundColor}
                                style={{
                                  borderRadius: '3px',
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
                          isDisabled={formStatus.status === 'thank-you'}
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
            </>
          ) : (
            <>
              {user ? (
                <Heading
                  size="15px"
                  textAlign="center"
                  textTransform="uppercase"
                  width="100%"
                  fontWeight="900"
              // mt="30px"
                  mb="0px"
                >
                  {t('download')}
                </Heading>
              ) : (
                <>
                  <Icon style={{ margin: 'auto' }} width="104px" height="104px" icon="circle-check" />
                  <Heading
                    size="15px"
                    textAlign="center"
                    textTransform="uppercase"
                    width="100%"
                    fontWeight="900"
                    mt="30px"
                    mb="0px"
                  >
                    {t('thanks')}
                  </Heading>
                  <Text size="md" color={commonTextColor} textAlign="center" marginTop="10px" px="0px">
                    {t('download')}
                  </Text>
                </>
              )}

              <Button
                marginTop="20px"
                borderRadius="3px"
                width="100%"
                padding="0"
                whiteSpace="normal"
                variant="default"
                color="white"
                // color={fontColor}
                fontSize="14px"
                alignItems="center"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open(`https://gitpod.io#${exercise.url}`, '_blank').focus();
                  }
                }}
              >
                {'  '}
                <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="gitpod" color="currentColor" />
                {t('open-gitpod')}
              </Button>
              <Text
                color={CustomTheme.colors.blue.default}
                fontSize="13px"
                textAlign="center"
                marginTop="10px"
              >
                {t('powered')}
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.learnpack.co"
                // color={useColorModeValue('blue.default', 'blue.300')}
                  display="inline-block"
                  letterSpacing="0.05em"
                  fontFamily="Lato, Sans-serif"
                >
                  Learnpack
                </Link>
              </Text>
              <Button
                marginTop="20px"
                borderRadius="3px"
                width="100%"
                fontSize="14px"
                padding="0"
                whiteSpace="normal"
                variant="otuline"
                border="1px solid"
                textTransform="uppercase"
                borderColor="blue.default"
                color="blue.default"
                onClick={() => setShowModal(true)}
              >
                {t('clone')}
              </Button>
            </>
          )}
        <Modal
          isOpen={showModal}
          size="md"
          margin="0 10px"
          onClose={() => {
            setShowModal(false);
          }}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader borderBottom="1px solid" fontSize="15px" textTransform="uppercase" borderColor={commonBorderColor} textAlign="center">
              {t('modal.title')}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody padding={{ base: '30px' }}>
              <Text marginBottom="15px" fontSize="14px" lineHeight="24px">
                {t('modal.text-part-one')}
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://marketplace.visualstudio.com/items?itemName=learn-pack.learnpack-vscode"
                  color={useColorModeValue('blue.default', 'blue.300')}
                  display="inline-block"
                  letterSpacing="0.05em"
                  fontFamily="Lato, Sans-serif"
                >
                  Learnpack Plugin
                </Link>
                {t('modal.text-part-two')}
              </Text>
              <Text
                // cursor="pointer"
                id="command-container"
                padding="9px"
                background={useColorModeValue('featuredLight', 'darkTheme')}
                fontWeight="400"
                marginBottom="5px"
                style={{ borderRadius: '5px' }}
                fontSize="14px"
                lineHeight="24px"
              >
                <UrlInput
                  id="clone-command"
                  value={`git clone ${exercise.url}`}
                  type="text"
                  readOnly
                  onClick={(e) => {
                    e.target.select();
                    navigator.clipboard.writeText(`git clone ${exercise.url}`);
                    toast({
                      position: 'top',
                      title: t('modal.copy-command'),
                      status: 'success',
                      duration: 7000,
                      isClosable: true,
                    });
                  }}
                />
              </Text>
              <Text marginBottom="15px" fontSize="12px" fontWeight="700" lineHeight="24px">
                {t('modal.note', { folder: exercise?.url ? exercise?.url?.substr(exercise?.url?.lastIndexOf('/') + 1, exercise?.url?.length) : '' })}
              </Text>
              <OrderedList>
                {t('modal.steps', {}, { returnObjects: true }).map((step) => (
                  <ListItem key={step} fontSize="14px">{step}</ListItem>
                ))}
              </OrderedList>
              <Text display="flex" alignItems="center" marginTop="15px">
                <Icon width="19px" height="19px" style={{ display: 'inline-block' }} icon="help" />
                <Link
                  href="/how-to/github-clone-repository"
                  target="_blank"
                  fontSize="15px"
                  fontWeight="700"
                  color={useColorModeValue('blue.default', 'blue.300')}
                  display="inline-block"
                  letterSpacing="0.05em"
                  fontFamily="Lato, Sans-serif"
                  marginLeft="10px"
                >
                  {t('how-to-clone')}
                </Link>
              </Text>
            </ModalBody>
          </ModalContent>
        </Modal>
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
}

function Exercise({ exercise, markdown }) {
  const [tags, setTags] = useState([]);
  const { t } = useTranslation(['exercises']);
  const translations = exercise?.translations || { es: '', en: '' };
  const markdownData = markdown ? getMarkDownContent(markdown) : '';
  const router = useRouter();
  const language = router.locale === 'en' ? 'us' : 'es';
  const { slug } = router.query;
  const { locale } = router;
  const commonBorderColor = useColorModeValue('gray.250', 'gray.900');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const { colorMode } = useColorMode();

  const toast = useToast();

  const handleRedirect = async () => {
    const redirect = redirectsFromApi?.find((r) => r?.source === `${locale === 'en' ? '' : `/${locale}`}/interactive-exercise/${slug}`);

    if (redirect) {
      router.push(redirect?.destination);
    }
  };

  useEffect(() => {
    handleRedirect();
  }, [router, router.locale, translations]);

  const tagsArray = (exer) => {
    const values = [];
    if (exer) {
      if (exer.difficulty) values.push({ name: t(`common:${exer.difficulty.toLowerCase()}`) });
      if (exer.interactive) values.push({ name: t('common:interactive') });
      if (exer.duration) values.push({ name: `${exer.duration}HRS` });
    }

    setTags(values);
  };

  useEffect(() => {
    tagsArray(exercise);
  }, [language]);

  return (
    <>
      {exercise?.title && (
        <Script async defer src="https://buttons.github.io/buttons.js" />
      )}
      <Box
        background={useColorModeValue('featuredLight', 'featuredDark')}
      >
        <GridContainer
          className="box-heading"
          padding={{ base: '2rem 15px 2rem 15px', md: '2rem 0 2rem 0' }}
          margin="0 auto"
          withContainer
          gridTemplateColumns="repeat(12, 1fr)"
          gridColumn={{ base: '2 / span 12', lg: '2 / span 7' }}
          gridGap="36px"
          childrenStyle={{
            padding: '0 30px 0 0',
          }}
        >
          <Link
            href="/interactive-exercises"
            color={useColorModeValue('blue.default', 'blue.300')}
            display="inline-block"
            letterSpacing="0.05em"
            fontWeight="700"
            paddingBottom="10px"
            width="fit-content"
          >
            {`← ${t('exercises:backToExercises')}`}
          </Link>
          <TagCapsule
            variant="rounded"
            tags={tags}
            marginY="8px"
            style={{
              padding: '2px 10px',
              margin: '0',
            }}
            gap="10px"
            paddingX="0"
          />
          {exercise?.title ? (
            <Heading
              as="h1"
              size="40px"
              fontWeight="700"
              textTransform="capitalize"
              paddingTop="10px"
              marginBottom="10px"
              transition="color 0.2s ease-in-out"
              color={useColorModeValue('black', 'white')}
            >
              {exercise.title}
            </Heading>
          ) : (
            <Skeleton height="45px" width="100%" m="22px 0 35px 0" borderRadius="10px" />
          )}
          {exercise?.sub_title && (
          <Text size="md" color={commonTextColor} textAlign="left" marginBottom="10px" px="0px">
            {exercise.sub_title}
          </Text>
          )}
          {exercise?.title && (
            <a className="github-button" href={exercise?.url} data-icon="octicon-star" aria-label="Star ntkme/github-buttons on GitHub">Star</a>
          )}
          {exercise?.author && (
          <Text size="md" textAlign="left" my="10px" px="0px">
            {`${t('exercises:created')} ${exercise.author.first_name} ${exercise.author.last_name}`}
          </Text>
          )}
        </GridContainer>
      </Box>
      <GridContainer
        height="100%"
        minHeight="500px"
        gridTemplateColumns={{ base: 'repeat(12, 1fr)', lg: 'repeat(12, 1fr)' }}
        gridGap="36px"
        padding={{ base: '0 10px', md: '0' }}
      >
        {/* <Box display={{ base: 'none', lg: 'grid' }} position="sticky" top="20px" height="fit-content" gridColumn="1 / span 1" margin={{ base: '0 0 40px', md: '1rem 0 0 0' }}>
          <MktSideRecommendedCourses />
        </Box> */}
        <Box display={{ base: 'block', lg: 'flex' }} gridColumn={{ base: '2 / span 6', lg: '2 / span 7' }}>
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
            {exercise?.slug ? (
              <TabletWithForm
                toast={toast}
                exercise={exercise}
                commonTextColor={commonTextColor}
                commonBorderColor={commonBorderColor}
              />
            ) : (
              <Skeleton height="646px" width="300px" borderRadius="17px" />
            )}
          </Box>

          {/* MARKDOWN SIDE */}
          <Box
            borderRadius="3px"
            maxWidth="1012px"
            flexGrow={1}
          // margin="0 8vw 4rem 8vw"
          // width={{ base: '34rem', md: '54rem' }}
            width={{ base: 'auto', lg: '60%' }}
            className={`markdown-body ${colorMode === 'light' ? 'light' : 'dark'}`}
          >
            {markdown ? (
              <MarkDownParser content={markdownData.content} />
            // <MarkDownParser content={removeTitleAndImage(MDecoded)} />
            ) : (
              <MDSkeleton />
            )}
            <MktRecommendedCourses
              title={t('common:continue-learning', { technologies: exercise?.technologies.slice(0, 4).join(', ') })}
              technologies={exercise?.technologies.join(',')}
            />
          </Box>
        </Box>

        <Box
          display={{ base: 'none', md: 'flex' }}
          gridColumn={{ base: '8 / span 4', lg: '9 / span 3' }}
          margin={{ base: '20px 0 0 auto', lg: '-10rem 0 0 auto' }}
          flexDirection="column"
          backgroundColor={useColorModeValue('white', 'featuredDark')}
          transition="background 0.2s ease-in-out"
          width={{ base: '300px', lg: '350px', xl: '350px' }}
          minWidth="250px"
          height="fit-content"
          borderWidth="0px"
          borderRadius="17px"
          overflow="hidden"
          border={1}
          borderStyle="solid"
          borderColor={commonBorderColor}
        >
          {exercise?.slug ? (
            <TabletWithForm
              toast={toast}
              exercise={exercise}
              commonTextColor={commonTextColor}
              commonBorderColor={commonBorderColor}
            />
          ) : (
            <Skeleton height="646px" width="100%" borderRadius="17px" />
          )}
        </Box>
      </GridContainer>

      {/* <GridContainer
        withContainer
      >
        <MktRecommendedCourses
          title={t('common:related-courses')}
          technologies={exercise?.technologies.join(',')}
        />
      </GridContainer> */}
    </>
  );
}

Exercise.propTypes = {
  exercise: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  markdown: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

TabletWithForm.propTypes = {
  isSubmitting: PropTypes.bool,
  toast: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  user: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  commonTextColor: PropTypes.string.isRequired,
  commonBorderColor: PropTypes.string.isRequired,
  exercise: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};
TabletWithForm.defaultProps = {
  isSubmitting: false,
  user: {},
};

export default Exercise;
