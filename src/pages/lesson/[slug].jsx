/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-param-reassign */
import { useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Box, useColorModeValue, Skeleton,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import getT from 'next-translate/getT';
import Icon from '../../common/components/Icon';
import { getExtensionName, unSlugifyCapitalize } from '../../utils';
import Link from '../../common/components/NextChakraLink';
import MarkDownParser from '../../common/components/MarkDownParser';
import TagCapsule from '../../common/components/TagCapsule';
import getMarkDownContent from '../../common/components/MarkDownParser/markdown';
import { MDSkeleton } from '../../common/components/Skeleton';
import GridContainer from '../../common/components/GridContainer';
import MktRecommendedCourses from '../../common/components/MktRecommendedCourses';
import redirectsFromApi from '../../../public/redirects-from-api.json';
import MktSideRecommendedCourses from '../../common/components/MktSideRecommendedCourses';
import IpynbHtmlParser from '../../common/components/IpynbHtmlParser';
import useStyle from '../../common/hooks/useStyle';
import { parseQuerys } from '../../utils/url';

export const getStaticPaths = async ({ locales }) => {
  const querys = parseQuerys({
    asset_type: 'LESSON,ARTICLE',
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    exclude_category: 'how-to,como',
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
  const t = await getT(locale, 'lesson');
  const { slug } = params;
  const staticImage = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });

  const response = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}`);
  const lesson = await response.json();

  const engPrefix = {
    us: 'en',
    en: 'en',
  };

  const urlPathname = lesson?.readme_url ? lesson?.readme_url.split('https://github.com')[1] : null;
  const pathnameWithoutExtension = urlPathname ? urlPathname.split('.ipynb')[0] : null;
  const extension = urlPathname ? urlPathname.split('.').pop() : null;
  const translatedExtension = (lesson?.lang === 'us' || lesson?.lang === null) ? '' : `.${lesson?.lang}`;
  const finalPathname = `https://colab.research.google.com/github${pathnameWithoutExtension}${translatedExtension}.${extension}`;

  const isCurrenLang = locale === engPrefix[lesson?.lang] || locale === lesson?.lang;

  if (response?.status >= 400 || response?.status_code >= 400 || !['ARTICLE', 'LESSON'].includes(lesson?.asset_type) || !isCurrenLang) {
    return {
      notFound: true,
    };
  }

  const ogUrl = {
    en: `/lesson/${slug}`,
    us: `/lesson/${slug}`,
  };

  const { title, description, translations } = lesson;
  const translationsExists = Object.keys(translations).length > 0;

  const exensionName = getExtensionName(lesson.readme_url);
  let markdown = '';
  let ipynbHtml = '';

  if (exensionName !== 'ipynb') {
    const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.md`);
    if (resp.status >= 400) {
      return {
        notFound: true,
      };
    }
    markdown = await resp.text();
  } else {
    // ipynbHtmlUrl = `${process.env.BREATHECODE_HOST}/v1/registry/asset/preview/${slug}`;
    const ipynbHtmlUrl = `${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.html`;
    const resp = await fetch(ipynbHtmlUrl);
    if (resp.status >= 400) {
      return {
        notFound: true,
      };
    }
    ipynbHtml = {
      html: await resp.text(),
      statusText: resp.statusText,
    };
  }
  const translationArray = [
    {
      value: 'us',
      lang: 'en',
      slug: translations?.us,
      link: `/lesson/${translations?.us}`,
    },
    {
      value: 'en',
      lang: 'en',
      slug: translations?.en,
      link: `/lesson/${translations?.en}`,
    },
    {
      value: 'es',
      lang: 'es',
      slug: translations?.es,
      link: `/es/lesson/${translations?.es}`,
    },
  ].filter((item) => translations?.[item?.value] !== undefined);

  return {
    props: {
      seo: {
        title,
        description: description || '',
        image: lesson.preview || staticImage,
        pathConnector: translationsExists ? '/lesson' : `/lesson/${slug}`,
        url: ogUrl.en || `/${locale}/lesson/${slug}`,
        slug,
        type: 'article',
        card: 'large',
        translations,
        locales,
        locale,
        keywords: lesson?.seo_keywords || '',
        publishedTime: lesson?.created_at || '',
        modifiedTime: lesson?.updated_at || '',
      },
      fallback: false,
      lesson: {
        ...lesson,
        collab_url: finalPathname,
      },
      translations: translationArray,
      markdown,
      ipynbHtml,
    },
  };
};

function LessonSlug({ lesson, markdown, ipynbHtml }) {
  const { t } = useTranslation('lesson');
  const markdownData = markdown ? getMarkDownContent(markdown) : '';
  const { fontColor, borderColor, featuredLight } = useStyle();
  const translations = lesson?.translations || { es: '', en: '', us: '' };

  const router = useRouter();
  const { slug } = router.query;
  const { locale } = router;

  const isIpynb = ipynbHtml.statusText === 'OK';

  useEffect(() => {
    const redirect = redirectsFromApi?.find((r) => r?.source === `${locale === 'en' ? '' : `/${locale}`}/lesson/${slug}`);

    if (redirect) {
      router.push(redirect?.destination);
    }

    return () => {};
  }, [router, router.locale, translations]);

  return (
    <>
      <GridContainer
        withContainer
        // gridColumn="1 / span 10"
        maxWidth="1280px"
        height="100%"
        gridTemplateColumns={{ base: 'repeat(1, 1fr)', md: '0.5fr repeat(12, 1fr) 0.5fr' }}
        margin="3rem auto 0 auto"
        gridGap="0"
      >
        <Link
          href="/lessons"
          color={useColorModeValue('blue.default', 'blue.300')}
          display="inline-block"
          letterSpacing="0.05em"
          fontWeight="700"
          paddingBottom="10px"
          width="fit-content"
        >
          {`← ${t('backToLessons')}`}
        </Link>
      </GridContainer>
      <GridContainer
        maxWidth="1440px"
        margin="28px auto 0 auto"
        height="100%"
        gridTemplateColumns="4fr repeat(12, 1fr)"
        gridGap="36px"
        padding="0 10px"
      >
        <Box display={{ base: 'none', md: 'flex' }} position={{ base: 'inherit', md: 'sticky' }} top="20px" height="fit-content" gridColumn="1 / span 1" margin={{ base: '0 0 40px', md: '0' }}>
          <MktSideRecommendedCourses />
        </Box>
        <Box gridColumn="2 / span 12" maxWidth="854px">
          <Box display="grid" gridColumn="2 / span 12">
            <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} margin="0 0 1rem 0" gridGap="10px" justifyContent="space-between" position="relative">
              <Box>
                {lesson?.technologies ? (
                  <TagCapsule
                    isLink
                    href="/lessons"
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
                ) : (
                  <Skeleton width="130px" height="26px" borderRadius="10px" />
                )}
              </Box>
              <Box display={{ base: 'flex', md: 'block' }} margin={{ base: '0 0 1rem 0', md: '0px' }} position={{ base: '', md: 'absolute' }} width={{ base: '100%', md: '172px' }} height="auto" top="0px" right="32px" background={featuredLight} borderRadius="4px" color={fontColor}>
                {lesson?.readme_url && (
                  <Link display="flex" target="_blank" rel="noopener noreferrer" width="100%" gridGap="8px" padding={{ base: '8px 12px', md: '8px' }} background="transparent" href={`${lesson?.readme_url}`} _hover={{ opacity: 0.7 }} style={{ color: fontColor, textDecoration: 'none' }}>
                    <Icon icon="pencil" color="#A0AEC0" width="20px" height="20px" />
                    {t('common:edit-on-github')}
                  </Link>
                )}

                {isIpynb && lesson?.collab_url && lesson?.readme_url && (
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
          {markdown && !isIpynb ? (
            <Box
              height="100%"
              margin="0 rem auto 0 auto"
              // display="grid"
              gridColumn="2 / span 12"
              transition="background 0.2s ease-in-out"
              borderRadius="3px"
              maxWidth="1280px"
              background={useColorModeValue('white', 'dark')}
              width={{ base: '100%', md: 'auto' }}
              className={`markdown-body ${useColorModeValue('light', 'dark')}`}
            >
              <MarkDownParser content={markdownData.content} withToc isPublic />
              <MktRecommendedCourses
                display={{ base: 'none', md: 'grid' }}
                title={t('common:continue-learning', { technologies: lesson?.technologies.map((tech) => unSlugifyCapitalize(tech)).slice(0, 4).join(', ') })}
                technologies={lesson?.technologies.join(',')}
              />

            </Box>

          ) : (
            <>
              {!isIpynb && (
                <MDSkeleton />
              )}
            </>
          )}
          <Box position={{ base: 'fixed', md: 'inherit' }} display={{ base: 'initial', md: 'none' }} width="100%" bottom={0} left={0} height="auto">
            <MktSideRecommendedCourses title={false} padding="0" containerPadding="16px 14px" borderRadius="0px" skeletonHeight="80px" skeletonBorderRadius="0" />
          </Box>

          {isIpynb && markdown === '' && ipynbHtml?.html && (
            <Box
              height="100%"
              gridColumn="2 / span 12"
              borderRadius="3px"
              maxWidth="1280px"
              width={{ base: '100%', md: 'auto' }}
            >
              <Box width="100%" height="100%">
                <IpynbHtmlParser
                  html={ipynbHtml.html}
                />
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
  ipynbHtml: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])).isRequired,
};

export default LessonSlug;
