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
import redirectsFromApi from '../../../../public/redirects-from-api.json';
import GridContainer from '../../../common/components/GridContainer';
import MktSideRecommendedCourses from '../../../common/components/MktSideRecommendedCourses';
import { cleanObject, unSlugifyCapitalize } from '../../../utils/index';
import useStyle from '../../../common/hooks/useStyle';
import { parseQuerys } from '../../../utils/url';

export const getStaticPaths = async ({ locales }) => {
  const querys = parseQuerys({
    asset_type: 'ARTICLE',
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    academy: process.env.WHITE_LABEL_ACADEMY || '4,5,6,47',
    limit: 2000,
  });
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset${querys}`);
  const data = await resp.json();
  const howToData = data.results.filter((l) => l?.category?.slug === 'how-to' || l?.category?.slug === 'como');

  const paths = howToData.flatMap((res) => locales.map((locale) => ({
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
  const staticImage = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });
  const { slug } = params;
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}?asset_type=ARTICLE`);
  const data = await resp.json();
  const engPrefix = {
    us: 'en',
    en: 'en',
  };

  const isCurrenLang = locale === engPrefix[data?.lang] || locale === data?.lang;

  if (resp.status >= 400 || !isCurrenLang) {
    return {
      notFound: true,
    };
  }

  const {
    title, description, translations, preview,
  } = data;

  const markdownResp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.md`);

  if (markdownResp?.status >= 400) {
    return {
      notFound: true,
    };
  }

  const markdown = await markdownResp.text();

  const ogUrl = {
    en: `/how-to/${slug}`,
    us: `/how-to/${slug}`,
  };

  const translationArray = [
    {
      value: 'us',
      lang: 'en',
      slug: translations?.us,
      link: `/how-to/${translations?.us}`,
    },
    {
      value: 'en',
      lang: 'en',
      slug: translations?.en,
      link: `/how-to/${translations?.en}`,
    },
    {
      value: 'es',
      lang: 'es',
      slug: translations?.es,
      link: `/es/how-to/${translations?.es}`,
    },
  ].filter((item) => translations?.[item?.value] !== undefined);

  const eventStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: data?.title,
    description: data?.description,
    url: `https://4geeks.com/${slug}`,
    image: `https://4geeks.com/thumbnail?slug=${slug}`,
    datePublished: data?.published_at,
    dateModified: data?.updated_at,
    author: data?.author ? {
      '@type': 'Person',
      name: `${data?.author?.first_name} ${data?.author?.last_name}`,
    } : null,
    keywords: data?.seo_keywords,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://4geeks.com/${slug}`,
    },
  };
  const cleanedStructuredData = cleanObject(eventStructuredData);

  return {
    props: {
      seo: {
        title,
        description: description || '',
        image: preview || staticImage,
        type: 'article',
        translations,
        pathConnector: '/how-to',
        url: ogUrl.en || `/${locale}/how-to/${slug}`,
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
};

export default function HowToSlug({ data, markdown }) {
  const { t } = useTranslation('how-to');
  // const { title, author, preview } = data;
  const [neverLoaded, setNeverLoaded] = useState(false);
  const title = data?.title || '';
  const author = data?.author || '';
  const { fontColor, featuredLight } = useStyle();
  // const preview = data?.preview || '';

  // const { translations } = data;
  const translations = data?.translations || { es: '', en: '', us: '' };
  // const defaultImage = '/static/images/coding-notebook.png';
  // const getImage = preview || defaultImage;
  const router = useRouter();
  const { slug } = router.query;
  const { locale } = router;
  const markdownData = markdown ? getMarkDownContent(markdown) : '';
  const linkColor = useColorModeValue('blue.default', 'blue.300');

  const isHowTo = data?.category?.slug === 'how-to' || data?.category?.slug === 'como';

  useEffect(() => {
    if (!isHowTo) {
      router.push('/404');
    }
  }, [isHowTo]);

  useEffect(() => {
    const redirect = redirectsFromApi?.find((r) => r?.source === `${locale === 'en' ? '' : `/${locale}`}/how-to/${slug}`);

    if (redirect) {
      router.push(redirect?.destination);
    }
    return () => {};
  }, [router, router.locale, translations]);

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
          <MktSideRecommendedCourses />
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
            href="/how-to"
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
            {data?.technologies.length > 0 && (
              <TagCapsule
                variant="rounded"
                isLink
                href="/how-to"
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
            )}
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

          {/* <Image src={getImage} alt={title} margin="20px 0 30px 0" width="100%" borderRadius="10px" height="100%" style={{ aspectRatio: '12/6' }} /> */}
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
              title={t('common:continue-learning', { technologies: data?.technologies.map((tech) => unSlugifyCapitalize(tech)).slice(0, 4).join(', ') })}
              marginBottom="15px"
              technologies={data?.technologies.join(',')}
              endpoint={`${process.env.BREATHECODE_HOST}/v1/marketing/course`}
            />
          </Box>
        </Box>
        <Box position={{ base: 'fixed', md: 'inherit' }} display={{ base: 'initial', md: 'none' }} width="100%" bottom={0} left={0} height="auto">
          <MktSideRecommendedCourses title={false} padding="0" containerPadding="16px 14px" borderRadius="0px" skeletonHeight="80px" skeletonBorderRadius="0" />
        </Box>
      </GridContainer>
    </>
  );
}

HowToSlug.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  markdown: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};
