import {
  Box,
  useColorModeValue,
  useColorMode,
  Skeleton,
  Flex,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import React, { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
import getT from 'next-translate/getT';
import Heading from '../../../common/components/Heading';
import Link from '../../../common/components/NextChakraLink';
import Text from '../../../common/components/Text';
import TabletWithForm from '../../../js_modules/projects/TabletWithForm';
import SimpleTable from '../../../js_modules/projects/SimpleTable';
import FixedBottomCta from '../../../js_modules/projects/FixedBottomCta';
import TagCapsule from '../../../common/components/TagCapsule';
import MarkDownParser from '../../../common/components/MarkDownParser';
import useAuth from '../../../common/hooks/useAuth';
import { MDSkeleton } from '../../../common/components/Skeleton';
import getMarkDownContent from '../../../common/components/MarkDownParser/markdown';
import MktRecommendedCourses from '../../../common/components/MktRecommendedCourses';
import GridContainer from '../../../common/components/GridContainer';
import { cleanObject, isWindow } from '../../../utils';
import { ORIGIN_HOST } from '../../../utils/variables';
import RelatedContent from '../../../common/components/RelatedContent';
import MktEventCards from '../../../common/components/MktEventCards';
import SupplementaryMaterial from '../../../common/components/SupplementaryMaterial';
import AssetsBreadcrumbs from '../../../common/components/AssetsBreadcrumbs';
import Icon from '../../../common/components/Icon';
import useStyle from '../../../common/hooks/useStyle';
import { getMarkdownFromCache } from '../../../utils/requests';

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
    const assetList = await import('../../../lib/asset-list.json')
      .then((res) => res.default)
      .catch(() => []);

    const result = assetList.excersises.find((l) => l?.slug === slug);
    const langPrefix = locale === 'en' ? '' : `/${result?.lang || locale}`;

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

    const markdown = await getMarkdownFromCache(slug, result);

    if (!result || !markdown) {
      return {
        notFound: true,
      };
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

function Exercise({ exercise, markdown }) {
  const { t } = useTranslation(['exercises']);
  const markdownData = markdown ? getMarkDownContent(markdown) : '';
  const { isAuthenticated } = useAuth();
  const [isCtaVisible, setIsCtaVisible] = useState(true);
  const { colorMode } = useColorMode();
  const tabletWithFormRef = useRef(null);
  const bullets = t('exercises:bullets', {}, { returnObjects: true });
  const { hexColor, fontColor, featuredLight } = useStyle();

  const getElementTopOffset = (elem) => {
    if (elem && isWindow) {
      const rect = elem.getBoundingClientRect();

      const { scrollY } = window;

      return rect.top + scrollY;
    }
    return 0;
  };

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (isWindow) {
      window.addEventListener('scroll', () => {
        if (tabletWithFormRef.current) {
          const { scrollY } = window;
          const top = getElementTopOffset(tabletWithFormRef.current);

          if (top - scrollY > 700) setIsCtaVisible(true);
          else setIsCtaVisible(false);
        }
      });

      return () => window.removeEventListener('scroll', () => {});
    }
  }, []);

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
      <FixedBottomCta
        isCtaVisible={isCtaVisible}
        isAuthenticated={isAuthenticated}
        asset={exercise}
        videoUrl={exercise.intro_video_url}
        onClick={() => tabletWithFormRef.current?.scrollIntoView()}
        width="calc(100vw - 15px)"
        left="7.5px"
      />
      <Box
        background={useColorModeValue('featuredLight', 'featuredDark')}
      >
        <GridContainer
          className="box-heading"
          padding={{ base: '2rem 15px 2rem 15px', md: '2rem 0 2rem 0' }}
          margin="0 auto"
          gridTemplateColumns="repeat(12, 1fr)"
          gridGap="36px"
          childrenStyle={{
            padding: '0 30px 0 0',
          }}
          position="relative"
        >
          <Flex flexDirection="column" gridColumn={{ base: '2 / span 6', lg: '2 / span 7' }}>
            <Box display={{ base: 'block', md: 'flex' }} justifyContent="space-between" alignItems="center">
              <Box>
                <AssetsBreadcrumbs />
                {/* <Link
                  href="/interactive-exercises"
                  color={useColorModeValue('blue.default', 'blue.300')}
                  display="inline-block"
                  letterSpacing="0.05em"
                  fontWeight="700"
                  paddingBottom="10px"
                  width="fit-content"
                >
                  {`← ${t('exercises:backToExercises')}`}
                </Link> */}
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
              </Box>
              {isAuthenticated && exercise?.readme_url && (
                <Box height="fit-content" width="172px" background={featuredLight} borderRadius="4px">
                  <Link display="flex" target="_blank" rel="noopener noreferrer" gridGap="8px" padding={{ base: '8px 12px', md: '8px' }} background="transparent" href={exercise.readme_url} textDecoration="none" _hover={{ opacity: 0.7 }} color={fontColor}>
                    <Icon icon="pencil" color="#A0AEC0" width="20px" height="20px" />
                    {t('common:edit-on-github')}
                  </Link>
                </Box>
              )}
            </Box>
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
            {exercise?.description && (
              <Text size="18px" color="currentColor" textAlign="left" marginBottom="10px" px="0px">
                {exercise.description}
              </Text>
            )}
            <Flex flexDirection="column" gridGap="1rem" mt="2rem">
              {bullets.map((bullet) => (
                <Flex gridGap="10px">
                  <Icon icon={bullet.icon} width="32px" height="32px" color={hexColor.blueDefault} />
                  <Text size="18px" textAlign="left">
                    {bullet.title}
                  </Text>
                </Flex>
              ))}
            </Flex>
            {exercise?.author && (
              <Text size="md" textAlign="left" my="10px" px="0px">
                {`${t('exercises:created')} ${exercise.author.first_name} ${exercise.author.last_name}`}
              </Text>
            )}
          </Flex>
          <Box
            id="right-side-spacing"
            display={{ base: 'none', md: 'flex' }}
            width={{ base: '300px', lg: '350px' }}
            gridColumn={{ base: '8 / span 4', lg: '9 / span 3' }}
            opacity={0}
            minWidth="250px"
          />
          <Box
            position="absolute"
            top="2.3rem"
            right="6rem"
            display={{ base: 'none', md: 'block' }}
            width={{ base: '300px', lg: '350px' }}
            minWidth="250px"
            height="fit-content"
            borderWidth="0px"
          >
            {exercise?.slug ? (
              <>
                <TabletWithForm asset={exercise} href="/interactive-exercises" />
                <SupplementaryMaterial assets={exercise?.assets_related} />
                {/* <DynamicCallToAction
                  assetId={exercise.id}
                  assetTechnologies={exercise.technologies?.map((item) => item?.slug)}
                  assetType="exercise"
                  placement="side"
                  marginTop="40px"
                />
                <PodcastCallToAction
                  placement="side"
                  marginTop="40px"
                /> */}
              </>
            ) : (
              <Skeleton height="646px" width="100%" borderRadius="17px" />
            )}
          </Box>
        </GridContainer>
      </Box>
      <GridContainer
        height="100%"
        minHeight="500px"
        gridTemplateColumns={{ base: 'repeat(12, 1fr)', lg: 'repeat(12, 1fr)' }}
        gridGap="36px"
        padding={{ base: '0 10px', md: '0' }}
      >
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
                <SimpleTable
                  href="/interactive-exercises"
                  difficulty={exercise.difficulty !== null && exercise.difficulty.toLowerCase()}
                  repository={exercise.url}
                  duration={exercise.duration}
                  videoAvailable={exercise.interactive ? exercise.solution_video_url : null}
                  solution={exercise.interactive ? exercise.solution_url : null}
                  liveDemoAvailable={exercise.intro_video_url}
                />
                {/* <DynamicCallToAction
                  assetId={exercise.id}
                  assetTechnologies={exercise.technologies?.map((item) => item?.slug)}
                  assetType="exercise"
                  placement="side"
                  maxWidth="none"
                  marginTop="40px"
                />
                <PodcastCallToAction
                  placement="side"
                  marginTop="40px"
                /> */}
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
          >
            <Box className={`markdown-body ${colorMode === 'light' ? 'light' : 'dark'}`}>
              {markdown ? (
                <MarkDownParser assetData={exercise} content={markdownData.content} />
                // <MarkDownParser content={removeTitleAndImage(MDecoded)} />
              ) : (
                <MDSkeleton />
              )}
            </Box>
            <Box display={{ base: 'block', md: 'none' }}>
              <TabletWithForm showSimpleTable={false} asset={exercise} href="/interactive-exercises" ref={tabletWithFormRef} />
            </Box>
            <RelatedContent
              slug={exercise.slug}
              type="EXERCISE"
              extraQuerys={{}}
              technologies={exercise?.technologies}
              gridColumn="2 / span 10"
              maxWidth="1280px"
            />
            <MktRecommendedCourses
              mt="3rem"
              technologies={exercise?.technologies}
            />
            <MktEventCards isSmall hideDescription title={t('common:upcoming-workshops')} margin="4rem 0 31px 0" />
          </Box>
        </Box>

        <Box
          id="right-side-spacing2"
          display={{ base: 'none', md: 'flex' }}
          width={{ base: '300px', lg: '350px' }}
          gridColumn={{ base: '8 / span 4', lg: '9 / span 3' }}
          minHeight="52rem"
          opacity={0}
          minWidth="250px"
          zIndex={-1}
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

export default Exercise;
