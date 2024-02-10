/* eslint-disable no-unsafe-optional-chaining */
import {
  Box,
  useColorModeValue,
  useColorMode,
  Skeleton,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import Script from 'next/script';
import getT from 'next-translate/getT';
import Heading from '../../../common/components/Heading';
import Link from '../../../common/components/NextChakraLink';
import Text from '../../../common/components/Text';
import TabletWithForm from '../../../js_modules/projects/TabletWithForm';
import TagCapsule from '../../../common/components/TagCapsule';
import MarkDownParser from '../../../common/components/MarkDownParser';
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
import { getCacheItem, setCacheItem } from '../../../utils/requests';
import RelatedContent from '../../../common/components/RelatedContent';
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

function Exercise({ exercise, markdown }) {
  const { t } = useTranslation(['exercises']);
  const markdownData = markdown ? getMarkDownContent(markdown) : '';
  const commonBorderColor = useColorModeValue('gray.250', 'gray.900');
  const { colorMode } = useColorMode();
  const { lightColor } = useStyle();

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
            <Text size="md" color={lightColor} textAlign="left" marginBottom="10px" px="0px">
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
                    exercise={exercise}
                    commonTextColor={lightColor}
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
                  exercise={exercise}
                  commonTextColor={lightColor}
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
