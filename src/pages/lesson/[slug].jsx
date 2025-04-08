import useTranslation from 'next-translate/useTranslation';
import {
  Box, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Icon from '../../common/components/Icon';
import { cleanObject, getExtensionName } from '../../utils';
import Link from '../../common/components/NextChakraLink';
import ArticleMarkdown from '../../common/components/MarkDownParser/ArticleMarkdown';
import TagCapsule from '../../common/components/TagCapsule';
import getMarkDownContent from '../../common/components/MarkDownParser/markdown';
import { MDSkeleton } from '../../common/components/Skeleton';
import GridContainer from '../../common/components/GridContainer';
import MktRecommendedCourses from '../../common/components/MktRecommendedCourses';
import MktSideRecommendations from '../../common/components/MktSideRecommendations';
import IpynbHtmlParser from '../../common/components/IpynbHtmlParser';
import useAuth from '../../common/hooks/useAuth';
import useStyle from '../../common/hooks/useStyle';
import Heading from '../../common/components/Heading';
import { ORIGIN_HOST, excludeCagetoriesFor } from '../../utils/variables';
import RelatedContent from '../../common/components/RelatedContent';
import MktEventCards from '../../common/components/MktEventCards';
import AssetsBreadcrumbs from '../../common/components/AssetsBreadcrumbs';
import { getMarkdownFromCache } from '../../utils/requests';

export const getStaticPaths = async () => {
  const assetList = await import('../../lib/asset-list.json');
  const data = assetList.lessons;

  const paths = data.flatMap((res) => {
    const lang = res?.lang === 'us' ? 'en' : res?.lang;
    return ({
      params: {
        slug: res.slug,
      },
      locale: lang,
    });
  });

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params, locale, locales }) => {
  const { slug } = params;

  try {
    const langPrefix = locale === 'en' ? '' : `/${locale}`;
    const assetList = await import('../../lib/asset-list.json')
      .then((res) => res.default)
      .catch(() => []);

    const lesson = assetList.lessons.find((l) => l?.slug === slug);
    const engPrefix = {
      us: 'en',
      en: 'en',
    };

    const markdown = await getMarkdownFromCache(slug, lesson);

    const isCurrenLang = locale === engPrefix[lesson?.lang] || locale === lesson?.lang;
    if (!['ARTICLE', 'LESSON'].includes(lesson?.asset_type) || !isCurrenLang) {
      return {
        notFound: true,
      };
    }

    if (!lesson || !markdown) {
      return {
        notFound: true,
      };
    }

    const urlPathname = lesson?.readme_url ? lesson?.readme_url.split('https://github.com')[1] : null;
    const pathnameWithoutExtension = urlPathname ? urlPathname.split('.ipynb')[0] : null;
    const extension = urlPathname ? urlPathname.split('.').pop() : null;
    const translatedExtension = (lesson?.lang === 'us' || lesson?.lang === null) ? '' : `.${lesson?.lang}`;
    const finalPathname = `https://colab.research.google.com/github${pathnameWithoutExtension}${translatedExtension}.${extension}`;

    const { title, description, translations } = lesson;
    const translationInEnglish = translations?.en || translations?.us;

    // if exists translation object but not includes the origin language include it
    const translationArray = [
      {
        value: 'en',
        lang: 'en',
        slug: (lesson?.lang === 'en' || lesson?.lang === 'us') ? lesson?.slug : translationInEnglish,
        link: `/lesson/${(lesson?.lang === 'en' || lesson?.lang === 'us') ? lesson?.slug : translationInEnglish}`,
      },
      {
        value: 'es',
        lang: 'es',
        slug: lesson?.lang === 'es' ? lesson.slug : translations?.es,
        link: `/es/lesson/${lesson?.lang === 'es' ? lesson.slug : translations?.es}`,
      },
    ].filter((item) => item?.slug !== undefined);

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      name: lesson?.title,
      description: lesson?.description,
      url: `${ORIGIN_HOST}${langPrefix}/lesson/${slug}`,
      image: lesson?.preview || `${ORIGIN_HOST}/static/images/4geeks.png`,
      datePublished: lesson?.published_at,
      dateModified: lesson?.updated_at,
      author: lesson?.author ? {
        '@type': 'Person',
        name: `${lesson?.author?.first_name} ${lesson?.author?.last_name}`,
      } : null,
      keywords: lesson?.seo_keywords,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${ORIGIN_HOST}${langPrefix}/lesson/${slug}`,
      },
    };

    const cleanedStructuredData = cleanObject(structuredData);

    return {
      props: {
        seo: {
          title,
          description: description || '',
          image: cleanedStructuredData.image,
          pathConnector: '/lesson',
          url: `/lesson/${slug}`,
          slug,
          type: 'article',
          card: 'large',
          translations: translationArray,
          locales,
          locale,
          keywords: lesson?.seo_keywords || '',
          publishedTime: lesson?.created_at || '',
          modifiedTime: lesson?.updated_at || '',
        },
        lesson: {
          ...lesson,
          collab_url: finalPathname,
          structuredData: cleanedStructuredData,
        },
        translations: translationArray,
        markdown,
      },
    };
  } catch (error) {
    console.error(`Error fetching page type LESSON for /${locale}/lesson/${slug}`, error);
    return {
      notFound: true,
    };
  }
};

function LessonSlug({ lesson, markdown }) {
  const { t } = useTranslation('lesson');
  const markdownData = markdown ? getMarkDownContent(markdown) : '';
  const { fontColor, borderColor, featuredLight } = useStyle();
  const { isAuthenticated } = useAuth();

  const exensionName = getExtensionName(lesson.readme_url);
  const isIpynb = exensionName === 'ipynb';

  return (
    <>
      {lesson?.structuredData?.name && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(lesson.structuredData) }}
          />
        </Head>
      )}
      <Box
        maxWidth="854px"
        height="100%"
        margin="3rem auto 0 auto"
        padding="0 10px"
      >
        <AssetsBreadcrumbs />
      </Box>
      <GridContainer
        maxWidth="1440px"
        margin="28px auto 0 auto"
        height="100%"
        gridTemplateColumns="4fr repeat(12, 1fr)"
        gridGap="36px"
        padding="0 10px"
      >
        <Box display={{ base: 'none', md: 'block' }} position={{ base: 'inherit', md: 'sticky' }} top="20px" height="fit-content" gridColumn="1 / span 1" margin={{ base: '0 0 40px', md: '0' }}>
          <MktSideRecommendations technologies={lesson?.technologies} />
        </Box>
        <Box gridColumn="2 / span 12" maxWidth="854px">
          <Box display="grid" gridColumn="2 / span 12">
            <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} margin="0 0 1rem 0" gridGap="10px" justifyContent="space-between" position="relative">
              <Box>
                <TagCapsule
                  isLink
                  variant="rounded"
                  tags={lesson?.technologies || ['']}
                  marginY="8px"
                  fontSize="13px"
                  style={{
                    padding: '2px 10px',
                    margin: '0',
                  }}
                  gap="10px"
                  paddingX="0"
                />
              </Box>
              <Box display={isIpynb || (isAuthenticated && lesson?.readme_url) ? { base: 'flex', md: 'block' } : 'none'} margin={{ base: '0 0 1rem 0', md: '0px' }} width={{ base: '100%', md: '172px' }} height="auto" background={featuredLight} borderRadius="4px" color={fontColor}>
                {isAuthenticated && lesson?.readme_url && (
                  <Link display="flex" target="_blank" rel="noopener noreferrer" width="100%" gridGap="8px" padding={{ base: '8px 12px', md: '8px' }} background="transparent" href={`${lesson?.readme_url}`} _hover={{ opacity: 0.7 }} style={{ color: fontColor, textDecoration: 'none' }}>
                    <Icon icon="pencil" color="#A0AEC0" width="20px" height="20px" />
                    {t('common:edit-on-github')}
                  </Link>
                )}

                {isAuthenticated && isIpynb && lesson?.collab_url && lesson?.readme_url && (
                  <Box width={{ base: '1px', md: '100%' }} height={{ base: 'auto', md: '1px' }} background={borderColor} />
                )}

                {isIpynb && lesson?.collab_url && lesson?.readme_url && (
                  <Link display="flex" target="_blank" rel="noopener noreferrer" width="100%" gridGap="8px" padding={{ base: '8px 12px', md: '8px' }} background="transparent" color="white" href={lesson?.collab_url} _hover={{ opacity: 0.7 }} style={{ color: fontColor, textDecoration: 'none' }}>
                    <Icon icon="collab" color="#A0AEC0" width="28px" height="28px" />
                    {t('common:open-google-collab')}
                  </Link>
                )}
              </Box>

            </Box>
          </Box>
          {lesson?.title && (
            <Heading size="l" as="h1" fontWeight="700" margin="0rem 0 2rem 0">
              {lesson.title}
            </Heading>
          )}

          {markdown && !isIpynb ? (
            <Box
              gridColumn="2 / span 12"
              margin="0 rem auto 0 auto"
              height="100%"
            >
              <Box
                transition="background 0.2s ease-in-out"
                background={useColorModeValue('white', 'dark')}
                borderRadius="3px"
                maxWidth="1280px"
                width={{ base: '100%', md: 'auto' }}
                className={`markdown-body ${useColorModeValue('light', 'dark')}`}
              >
                <ArticleMarkdown assetData={lesson} content={markdownData.content} withToc isPublic />
              </Box>
              {lesson?.slug && (
                <RelatedContent
                  slug={lesson?.slug}
                  type="LESSON,ARTICLE"
                  extraQuerys={{ exclude_category: excludeCagetoriesFor.lessons }}
                  technologies={lesson?.technologies}
                  margin="4rem 0 0 0"
                  maxWidth="1280px"
                />
              )}
              <MktRecommendedCourses
                mt="3rem"
                mx="0"
                display={{ base: 'none', md: 'flex' }}
                technologies={lesson?.technologies}
              />
              <MktEventCards isSmall hideDescription title={t('common:upcoming-workshops')} margin="3rem 0 31px 0" />
            </Box>
          ) : (
            <>
              {!isIpynb && (
                <MDSkeleton />
              )}
            </>
          )}
          <Box display={{ base: 'initial', md: 'none' }}>
            <MktSideRecommendations technologies={lesson?.technologies} title={false} padding="0" containerPadding="16px 14px" borderRadius="0px" skeletonHeight="80px" skeletonBorderRadius="0" />
          </Box>

          {isIpynb && (
            <Box
              height="100%"
              gridColumn="2 / span 12"
              borderRadius="3px"
              maxWidth="1280px"
              width={{ base: '100%', md: 'auto' }}
            >
              <Box width="100%" height="100%">
                <IpynbHtmlParser
                  html={markdown}
                />
                {lesson?.slug && (
                  <RelatedContent
                    slug={lesson?.slug}
                    type="LESSON,ARTICLE"
                    extraQuerys={{ exclude_category: excludeCagetoriesFor.lessons }}
                    technologies={lesson?.technologies}
                    maxWidth="1280px"
                  />
                )}
                <MktRecommendedCourses
                  display={{ base: 'none', md: 'flex' }}
                  technologies={lesson?.technologies}
                />
                <MktEventCards isSmall hideDescription title={t('common:upcoming-workshops')} margin="20px 0 31px 0" />
              </Box>
            </Box>
          )}
        </Box>
      </GridContainer>
    </>
  );
}

LessonSlug.propTypes = {
  lesson: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  markdown: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

export default LessonSlug;
