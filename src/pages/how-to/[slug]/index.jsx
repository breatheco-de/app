/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-continue */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box, useColorModeValue, Skeleton,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import getT from 'next-translate/getT';
import Head from 'next/head';
import Link from '../../../common/components/NextChakraLink';
import MarkDownParser from '../../../common/components/MarkDownParser';
import getMarkDownContent from '../../../common/components/MarkDownParser/markdown';
import { MDSkeleton } from '../../../common/components/Skeleton';
import Heading from '../../../common/components/Heading';
import Text from '../../../common/components/Text';
import Icon from '../../../common/components/Icon';
import TagCapsule from '../../../common/components/TagCapsule';
import MktRecommendedCourses from '../../../common/components/MktRecommendedCourses';
import GridContainer from '../../../common/components/GridContainer';
import MktSideRecommendedCourses from '../../../common/components/MktSideRecommendedCourses';
import { cleanObject, unSlugifyCapitalize } from '../../../utils/index';
import { ORIGIN_HOST, categoriesFor } from '../../../utils/variables';
import useStyle from '../../../common/hooks/useStyle';
import { getCacheItem, setCacheItem } from '../../../utils/requests';
import RelatedContent from '../../../common/components/RelatedContent';

export const getStaticPaths = async ({ locales }) => {
  const assetList = await import('../../../lib/asset-list.json');
  const data = assetList.howTos;

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
  const t = await getT(locale, 'how-to');
  const staticImage = t('seo.image', { domain: ORIGIN_HOST });
  const { slug } = params;

  try {
    let data;
    let markdown;
    data = await getCacheItem(slug);
    const langPrefix = locale === 'en' ? '' : `/${locale}`;
    if (!data) {
      console.log(`${slug} not found on cache`);
      const assetList = await import('../../../lib/asset-list.json')
        .then((res) => res.default)
        .catch(() => []);
      data = assetList.howTos.find((l) => l?.slug === slug);

      const engPrefix = {
        us: 'en',
        en: 'en',
      };

      const isCurrenLang = locale === engPrefix[data?.lang] || locale === data?.lang;

      if (!isCurrenLang) {
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
      await setCacheItem(slug, { ...data, markdown });
    } else {
      markdown = data.markdown;
    }

    const {
      title, description, translations, preview,
    } = data;

    const translationInEnglish = translations?.en || translations?.us;
    const translationArray = [
      {
        value: 'en',
        lang: 'en',
        slug: (data?.lang === 'en' || data?.lang === 'us') ? data?.slug : translationInEnglish,
        link: `/how-to/${(data?.lang === 'en' || data?.lang === 'us') ? data?.slug : translationInEnglish}`,
      },
      {
        value: 'es',
        lang: 'es',
        slug: data?.lang === 'es' ? data.slug : translations?.es,
        link: `/es/how-to/${data?.lang === 'es' ? data.slug : translations?.es}`,
      },
    ].filter((item) => item?.slug !== undefined);

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      name: data?.title,
      description: data?.description,
      url: `${ORIGIN_HOST}${langPrefix}/how-to/${slug}`,
      image: preview || staticImage,
      datePublished: data?.published_at,
      dateModified: data?.updated_at,
      author: data?.author ? {
        '@type': 'Person',
        name: `${data?.author?.first_name} ${data?.author?.last_name}`,
      } : null,
      keywords: data?.seo_keywords,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${ORIGIN_HOST}${langPrefix}/how-to/${slug}`,
      },
    };
    const cleanedStructuredData = cleanObject(structuredData);

    return {
      props: {
        seo: {
          title,
          description: description || '',
          image: cleanedStructuredData.image,
          type: 'article',
          translations: translationArray,
          pathConnector: '/how-to',
          url: `/how-to/${slug}`,
          slug,
          keywords: data?.seo_keywords || '',
          card: 'default',
          locales,
          locale,
          publishedTime: data?.created_at || '',
          modifiedTime: data?.updated_at || '',
        },
        translations: translationArray,
        // page props
        fallback: false,
        data: {
          ...data,
          structuredData: cleanedStructuredData,
        },
        markdown: markdown || '',
      },
    };
  } catch (error) {
    console.error(`Error fetching page type HOW-TO for /${locale}/how-to/${slug}`, error);
    return {
      notFound: true,
    };
  }
};

export default function HowToSlug({ data, markdown }) {
  const { t, lang } = useTranslation('how-to');
  const [neverLoaded, setNeverLoaded] = useState(false);
  const title = data?.title || '';
  const author = data?.author || '';
  const { fontColor, featuredLight } = useStyle();
  const router = useRouter();
  const markdownData = markdown ? getMarkDownContent(markdown) : '';
  const linkColor = useColorModeValue('blue.default', 'blue.300');

  const isHowTo = data?.category?.slug === 'how-to' || data?.category?.slug === 'como';
  const langPrefix = lang === 'en' ? '' : `/${lang}`;

  useEffect(() => {
    if (!isHowTo) {
      router.push('/404');
    }
  }, [isHowTo]);

  useEffect(() => {
    setTimeout(() => {
      setNeverLoaded(true);
    }, 1200);
  }, []);

  return (
    <>
      {data?.structuredData?.name && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data.structuredData) }}
          />
        </Head>
      )}
      <GridContainer gridTemplateColumns="4fr repeat(12, 1fr)" margin={{ base: '0 10px', md: '0 auto' }} gridGap="36px" padding={{ base: '', md: '0 10px' }}>
        <Box display={{ base: 'none', md: 'flex' }} position={{ base: 'inherit', md: 'sticky' }} top="20px" height="fit-content" gridColumn="1 / span 1" margin={{ base: '0 0 40px', md: '6.2rem 0 0 0' }}>
          <MktSideRecommendedCourses technologies={data.technologies} />
        </Box>
        <Box
          gridColumn="2 / span 12"
          gridGap="20px"
          maxWidth="854px"
          borderBottom={1}
          borderStyle="solid"
          borderColor={useColorModeValue('gray.200', 'gray.900')}
        >
          <Link
            href={`${langPrefix}/how-to`}
            margin="3rem 0 2.375rem 0"
            gridColumn="2 / span 12"
            color={linkColor}
            display="inline-block"
            letterSpacing="0.05em"
            fontWeight="700"
            width="fit-content"
          >
            {`← ${t('back-to')}`}
          </Link>
          <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="10px" justifyContent="space-between" mb="12px">
            <TagCapsule
              variant="rounded"
              isLink
              tags={data?.technologies}
              marginY="8px"
              fontSize="13px"
              style={{
                padding: '2px 10px',
                margin: '0',
              }}
              gap="10px"
              paddingX="0"
            />
            <Box display={{ base: 'flex', md: 'block' }} margin={{ base: '0 0 1rem 0', md: '0px' }} width={{ base: '100%', md: '172px' }} height="auto" top="0px" right="32px" background={featuredLight} borderRadius="4px" color={fontColor}>
              <Link display="flex" target="_blank" rel="noopener noreferrer" width="100%" gridGap="8px" padding={{ base: '8px 12px', md: '8px' }} background="transparent" href={data?.readme_url} _hover={{ opacity: 0.7 }} style={{ color: fontColor, textDecoration: 'none' }}>
                <Icon icon="pencil" color="#A0AEC0" width="20px" height="20px" />
                {t('common:edit-on-github')}
              </Link>

            </Box>
          </Box>
          {title ? (
            <Heading size="l" as="h1" fontWeight="700">
              {title}
            </Heading>
          ) : (
            <Skeleton height="45px" width="100%" borderRadius="10px" />
          )}
          <Box margin="24px 0 1.5rem 0">
            <Text size="l" fontWeight="900" textTransform="uppercase">
              {t('written-by')}
            </Text>
            {author ? (
              <Text fontSize="l">
                {`${author.first_name} ${author.last_name}`}
              </Text>
            ) : (
              <>
                {neverLoaded ? (
                  <Text fontSize="l">
                    @4GeeksAcademy
                  </Text>
                ) : (
                  <Skeleton height="20px" width="220px" borderRadius="10px" />
                )}
              </>
            )}
          </Box>

          <Box
            borderRadius="3px"
            margin="0 auto"
            flexGrow={1}
            className={`markdown-body ${useColorModeValue('light', 'dark')}`}
          >
            {markdown ? (
              <MarkDownParser content={markdownData.content} />
            ) : (
              <MDSkeleton />
            )}
            <MktRecommendedCourses
              display={{ base: 'none', md: 'grid' }}
              title={t('common:continue-learning', { technologies: data?.technologies.map((tech) => tech?.title || unSlugifyCapitalize(tech)).slice(0, 4).join(', ') })}
              marginBottom="15px"
              technologies={data?.technologies}
              endpoint={`${process.env.BREATHECODE_HOST}/v1/marketing/course`}
            />
          </Box>
        </Box>
        <Box position={{ base: 'fixed', md: 'inherit' }} display={{ base: 'initial', md: 'none' }} width="100%" bottom={0} left={0} height="auto">
          <MktSideRecommendedCourses technologies={data.technologies} title={false} padding="0" containerPadding="16px 14px" borderRadius="0px" skeletonHeight="80px" skeletonBorderRadius="0" />
        </Box>

        <RelatedContent
          slug={data.slug}
          type="LESSON,ARTICLE"
          extraQuerys={{ category: categoriesFor.howTo }}
          technologies={data?.technologies}
          gridColumn="2 / span 10"
          maxWidth="1280px"
        />
      </GridContainer>
    </>
  );
}

HowToSlug.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  markdown: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};
