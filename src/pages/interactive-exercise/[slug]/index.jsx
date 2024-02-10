/* eslint-disable no-unsafe-optional-chaining */
import {
  Box,
  useColorModeValue,
  Button,
  useToast,
  useColorMode,
  Skeleton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Grid,
  GridItem,
  ListItem,
  OrderedList,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import React, { useState } from 'react';
import Script from 'next/script';
import getT from 'next-translate/getT';
import Head from 'next/head';
import useAuth from '../../../common/hooks/useAuth';
import Heading from '../../../common/components/Heading';
import Link from '../../../common/components/NextChakraLink';
import Text from '../../../common/components/Text';
import Icon from '../../../common/components/Icon';
import SimpleTable from '../../../js_modules/projects/SimpleTable';
import TagCapsule from '../../../common/components/TagCapsule';
import MarkDownParser from '../../../common/components/MarkDownParser';
import ShowOnSignUp from '../../../common/components/ShowOnSignup';
import { MDSkeleton } from '../../../common/components/Skeleton';
import getMarkDownContent from '../../../common/components/MarkDownParser/markdown';
import MktRecommendedCourses from '../../../common/components/MktRecommendedCourses';
import DynamicCallToAction from '../../../common/components/DynamicCallToAction';
// import CustomTheme from '../../../../styles/theme';
import GridContainer from '../../../common/components/GridContainer';
// import MktSideRecommendedCourses from '../../../common/components/MktSideRecommendedCourses';
import useStyle from '../../../common/hooks/useStyle';
import { cleanObject } from '../../../utils';
import { ORIGIN_HOST } from '../../../utils/variables';
import { getCacheItem, setCacheItem, reportDatalayer } from '../../../utils/requests';
import RelatedContent from '../../../common/components/RelatedContent';
import ReactPlayerV2 from '../../../common/components/ReactPlayerV2';
import UpcomingWorkshops from '../../../common/components/UpcomingWorkshops';

export const getStaticPaths = async ({ locales }) => {
  const assetList = await import('../../../lib/asset-list.json');
  const data = assetList.excersises;

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
  const staticImage = t('seo.image', { domain: ORIGIN_HOST });

  try {
    let result;
    let markdown;
    result = await getCacheItem(slug);
    const langPrefix = locale === 'en' ? '' : `/${result?.lang || locale}`;

    if (!result) {
      console.log(`${slug} not found on cache`);
      const assetList = await import('../../../lib/asset-list.json')
        .then((res) => res.default)
        .catch(() => []);
      result = assetList.excersises.find((l) => l?.slug === slug);
      const engPrefix = {
        us: 'en',
        en: 'en',
      };
      const isCurrenLang = locale === engPrefix[result?.lang] || locale === result?.lang;

      if (result.asset_type !== 'EXERCISE' || !isCurrenLang) {
        return {
          notFound: true,
        };
      }

      const markdownResp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.md`);

      if (markdownResp?.status >= 400) {
        return {
          notFound: true,
        };
      }
      markdown = await markdownResp.text();

      await setCacheItem(slug, { ...result, markdown });
    } else {
      markdown = result.markdown;
    }

    const {
      title, translations, description, preview,
    } = result;

    // in "lesson.translations" rename "us" key to "en" key if exists
    if (result?.translations && result.translations.us) {
      result.translations.en = result.translations.us;
      delete result.translations.us;
    }

    const translationInEnglish = translations?.en || translations?.us;
    const translationArray = [
      {
        value: 'en',
        lang: 'en',
        slug: (result?.lang === 'en' || result?.lang === 'us') ? result?.slug : translationInEnglish,
        link: `/interactive-exercise/${(result?.lang === 'en' || result?.lang === 'us') ? result?.slug : translationInEnglish}`,
      },
      {
        value: 'es',
        lang: 'es',
        slug: result?.lang === 'es' ? result.slug : translations?.es,
        link: `/es/interactive-exercise/${result?.lang === 'es' ? result.slug : translations?.es}`,
      },
    ].filter((item) => item?.slug !== undefined);
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      name: result?.title,
      description: result?.description,
      url: `${ORIGIN_HOST}${langPrefix}/interactive-exercise/${slug}`,
      image: preview || staticImage,
      datePublished: result?.published_at,
      dateModified: result?.updated_at,
      author: result?.author ? {
        '@type': 'Person',
        name: `${result?.author?.first_name} ${result?.author?.last_name}`,
      } : null,
      keywords: result?.seo_keywords,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${ORIGIN_HOST}${langPrefix}/interactive-exercise/${slug}`,
      },
    };
    const cleanedStructuredData = cleanObject(structuredData);

    return {
      props: {
        seo: {
          type: 'article',
          title,
          image: cleanedStructuredData.image,
          description: description || '',
          translations: translationArray,
          pathConnector: '/interactive-exercise',
          url: `/interactive-exercise/${slug}`,
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
  } catch (error) {
    console.error(`Error fetching page type EXERCISE for /${locale}/interactive-exercise/${slug}`, error);
    return {
      notFound: true,
    };
  }
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
  const [showCloneModal, setShowCloneModal] = useState(false);
  const { hexColor } = useStyle();
  const conversionTechnologies = exercise.technologies?.map((item) => item?.slug).join(',');

  const ReportOpenInProvisioningVendor = (vendor = '') => {
    reportDatalayer({
      dataLayer: {
        event: 'open_interactive_exercise',
        user_id: user.id,
        vendor,
      },
    });
  };

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
      <Box px="22px" pb="20px" display={{ base: 'block', md: 'none' }}>
        <SimpleTable
          href="/interactive-exercises"
          difficulty={exercise.difficulty !== null && exercise.difficulty.toLowerCase()}
          repository={exercise.url}
          duration={exercise.duration}
          videoAvailable={exercise.solution_video_url}
          liveDemoAvailable={exercise.intro_video_url}
        />
      </Box>
      <Box
        backgroundColor={useColorModeValue('white', 'featuredDark')}
        transition="background 0.2s ease-in-out"
        borderRadius="17px"
        border={2}
        borderStyle="solid"
        borderColor={hexColor.greenLight}
        overflow="hidden"
      >
        <ShowOnSignUp
          headContent={exercise?.intro_video_url && (
            <ReactPlayerV2
              title="Video tutorial"
              withModal
              url={exercise?.intro_video_url}
              withThumbnail
              thumbnailStyle={{
                borderRadius: '0 0 0 0',
              }}
            />
          )}
          hideForm={!user && formSended}
          title={!user ? t('direct-access-request') : ''}
          submitText={t('get-instant-access')}
          subscribeValues={{ asset_slug: exercise.slug }}
          refetchAfterSuccess={() => {
            setFormSended(true);
          }}
          padding="24px 22px 30px 22px"
          background="none"
          border="none"
          conversionTechnologies={conversionTechnologies}
          borderRadius="0"
        >
          <>
            {user && !formSended && (
              <Heading
                size="15px"
                textAlign="center"
                textTransform="uppercase"
                width="100%"
                fontWeight="900"
                mb="0px"
              >
                {t('download')}
              </Heading>
            )}
            {formSended && (
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
              fontSize="14px"
              alignItems="center"
              background={hexColor.greenLight}
              onClick={() => setShowModal(true)}
            >
              {'  '}
              <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="learnpack" color="currentColor" />
              {t('open-learnpack')}
            </Button>
            <Button
              borderRadius="3px"
              width="100%"
              fontSize="14px"
              padding="0"
              whiteSpace="normal"
              variant="otuline"
              border="1px solid"
              textTransform="uppercase"
              borderColor={hexColor.greenLight}
              color={hexColor.greenLight}
              onClick={() => {
                ReportOpenInProvisioningVendor('local');
                setShowCloneModal(true);
              }}
            >
              {t('clone')}
            </Button>
          </>
        </ShowOnSignUp>
        <Modal
          isOpen={showModal}
          size="xl"
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
              <Text marginBottom="15px" fontSize="14px" lineHeight="24px" textAlign="center">
                {t('modal.text-part-one')}
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={2} marginBottom="15px">
                <GridItem w="100%">
                  <Button
                    borderRadius="3px"
                    width="100%"
                    fontSize="14px"
                    padding="0"
                    whiteSpace="normal"
                    variant="otuline"
                    border="1px solid"
                    borderColor="blue.default"
                    fontWeight="700"
                    color="blue.default"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        ReportOpenInProvisioningVendor('gitpod');
                        window.open(`https://gitpod.io#${exercise.url}`, '_blank').focus();
                      }
                    }}
                  >
                    {'  '}
                    <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="gitpod" color={hexColor.blueDefault} />
                    Gitpod
                  </Button>
                </GridItem>
                <GridItem w="100%">
                  <Button
                    borderRadius="3px"
                    width="100%"
                    fontSize="14px"
                    padding="0"
                    whiteSpace="normal"
                    variant="otuline"
                    border="1px solid"
                    borderColor="blue.default"
                    fontWeight="700"
                    color="blue.default"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        ReportOpenInProvisioningVendor('codespaces');
                        window.open(`https://github.com/codespaces/new/?repo=${exercise.url.replace('https://github.com/', '')}`, '_blank').focus();
                      }
                    }}
                  >
                    {'  '}
                    <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="github" color={hexColor.blueDefault} />
                    Github Codespaces
                  </Button>
                </GridItem>
              </Grid>
              <Text
                // cursor="pointer"
                id="command-container"
                padding="9px"
                background={useColorModeValue('featuredLight', 'darkTheme')}
                fontWeight="400"
                marginBottom="5px"
                style={{ borderRadius: '5px' }}
                textAlign="center"
                fontSize="14px"
                lineHeight="24px"
              >
                {t('modal.text-part-two')}
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${ORIGIN_HOST}/lesson/how-to-use-gitpod`}
                  display="inline-block"
                  letterSpacing="0.05em"
                  fontFamily="Lato, Sans-serif"
                  color="blue.default"
                >
                  Gitpod
                </Link>
                {t('modal.or')}
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${ORIGIN_HOST}/lesson/what-is-github-codespaces`}
                  color="blue.default"
                  display="inline-block"
                  letterSpacing="0.05em"
                  fontFamily="Lato, Sans-serif"
                >
                  Github Codespaces
                </Link>
              </Text>

            </ModalBody>
          </ModalContent>
        </Modal>
        <Modal
          isOpen={showCloneModal}
          size="md"
          margin="0 10px"
          onClose={() => {
            setShowCloneModal(false);
          }}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader borderBottom="1px solid" fontSize="15px" textTransform="uppercase" borderColor={commonBorderColor} textAlign="center">
              {t('clone-modal.title')}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody padding={{ base: '30px' }}>
              <Text marginBottom="15px" fontSize="14px" lineHeight="24px">
                {t('clone-modal.text-part-one')}
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
                {t('clone-modal.text-part-two')}
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={2} marginBottom="15px">
                <GridItem w="100%">
                  <Button
                    borderRadius="3px"
                    width="100%"
                    fontSize="14px"
                    padding="0"
                    whiteSpace="normal"
                    variant="otuline"
                    border="1px solid"
                    borderColor="blue.default"
                    fontWeight="700"
                    color="blue.default"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(`https://gitpod.io#${exercise.url}`, '_blank').focus();
                      }
                    }}
                  >
                    {'  '}
                    <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="gitpod" color={hexColor.blueDefault} />
                    Gitpod
                  </Button>
                </GridItem>
                <GridItem w="100%">
                  <Button
                    borderRadius="3px"
                    width="100%"
                    fontSize="14px"
                    padding="0"
                    whiteSpace="normal"
                    variant="otuline"
                    border="1px solid"
                    borderColor="blue.default"
                    fontWeight="700"
                    color="blue.default"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(`https://github.com/codespaces/new/?repo=${exercise.url.replace('https://github.com/', '')}`, '_blank').focus();
                      }
                    }}
                  >
                    {'  '}
                    <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="github" color={hexColor.blueDefault} />
                    Github Codespaces
                  </Button>
                </GridItem>
              </Grid>
              <Text
                // cursor="pointer"
                id="command-container"
                padding="9px"
                background={useColorModeValue('featuredLight', 'darkTheme')}
                fontWeight="400"
                marginBottom="5px"
                style={{ borderRadius: '5px' }}
                textAlign="center"
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
                      title: t('clone-modal.copy-command'),
                      status: 'success',
                      duration: 7000,
                      isClosable: true,
                    });
                  }}
                />
              </Text>
              <Text marginBottom="15px" fontSize="12px" fontWeight="700" lineHeight="24px">
                {t('clone-modal.note', { folder: exercise?.url ? exercise?.url?.substr(exercise?.url?.lastIndexOf('/') + 1, exercise?.url?.length) : '' })}
              </Text>
              <OrderedList>
                {t('clone-modal.steps', {}, { returnObjects: true }).map((step) => (
                  <ListItem key={step} fontSize="14px">{step}</ListItem>
                ))}
              </OrderedList>
              <Text display="flex" alignItems="center" marginTop="15px">
                <span>
                  <Icon width="19px" height="19px" style={{ display: 'inline-block' }} icon="help" />
                </span>
                <Link
                  href={t('clone-link')}
                  target="_blank"
                  rel="noopener noreferrer"
                  display="inline-block"
                  letterSpacing="0.05em"
                  fontFamily="Lato, Sans-serif"
                  color="blue.default"
                >
                  Gitpod
                </Link>
                {t('modal.or')}
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${ORIGIN_HOST}/lesson/what-is-github-codespaces`}
                  color="blue.default"
                  display="inline-block"
                  letterSpacing="0.05em"
                  fontFamily="Lato, Sans-serif"
                >
                  Github Codespaces
                </Link>
              </Text>

            </ModalBody>
          </ModalContent>
        </Modal>
        <Box px="22px" pb="0" pt="0" display={{ base: 'none', md: 'block' }}>
          <SimpleTable
            href="/interactive-exercises"
            difficulty={exercise.difficulty !== null && exercise.difficulty.toLowerCase()}
            repository={exercise.url}
            duration={exercise.duration}
            videoAvailable={exercise.solution_video_url}
            liveDemoAvailable={exercise.intro_video_url}
          />
        </Box>
      </Box>
    </>
  );
}

function Exercise({ exercise, markdown }) {
  const { t } = useTranslation(['exercises']);
  const markdownData = markdown ? getMarkDownContent(markdown) : '';
  const commonBorderColor = useColorModeValue('gray.250', 'gray.900');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const { colorMode } = useColorMode();
  // const { hexColor } = useStyle();

  const toast = useToast();

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
            isLink
            variant="rounded"
            tags={exercise?.technologies}
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
              size="l"
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
            width="100%"
            height="auto"
            borderWidth="0px"
            overflow="hidden"
          >
            {exercise?.slug ? (
              <>
                <Box>
                  <TabletWithForm
                    toast={toast}
                    exercise={exercise}
                    commonTextColor={commonTextColor}
                    commonBorderColor={commonBorderColor}
                  />
                </Box>
                <DynamicCallToAction
                  assetId={exercise.id}
                  assetTechnologies={exercise.technologies?.map((item) => item?.slug)}
                  assetType="exercise"
                  placement="side"
                  maxWidth="none"
                  marginTop="40px"
                />
              </>
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
              <MarkDownParser assetData={exercise} content={markdownData.content} />
              // <MarkDownParser content={removeTitleAndImage(MDecoded)} />
            ) : (
              <MDSkeleton />
            )}
            <UpcomingWorkshops />
            <MktRecommendedCourses
              technologies={exercise?.technologies}
            />
          </Box>
        </Box>

        <Box
          display={{ base: 'none', md: 'flex' }}
          gridColumn={{ base: '8 / span 4', lg: '9 / span 3' }}
          margin={{ base: '20px 0 0 auto', lg: '-10rem 0 0 auto' }}
          flexDirection="column"
          width={{ base: '300px', lg: '350px', xl: '350px' }}
          minWidth="250px"
          height="fit-content"
          borderWidth="0px"
          overflow="hidden"
        >
          {exercise?.slug ? (
            <>
              <Box>
                <TabletWithForm
                  toast={toast}
                  exercise={exercise}
                  commonTextColor={commonTextColor}
                  commonBorderColor={commonBorderColor}
                />
              </Box>
              <DynamicCallToAction
                assetId={exercise.id}
                assetTechnologies={exercise.technologies?.map((item) => item?.slug)}
                assetType="exercise"
                placement="side"
                marginTop="40px"
              />
            </>
          ) : (
            <Skeleton height="646px" width="100%" borderRadius="17px" />
          )}
        </Box>
        <RelatedContent
          slug={exercise.slug}
          type="EXERCISE"
          extraQuerys={{}}
          technologies={exercise?.technologies}
          gridColumn="2 / span 10"
          maxWidth="1280px"
        />
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
  // eslint-disable-next-line react/forbid-prop-types
  commonTextColor: PropTypes.string.isRequired,
  toast: PropTypes.func.isRequired,
  commonBorderColor: PropTypes.string.isRequired,
  exercise: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default Exercise;
