/* eslint-disable no-param-reassign */
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Box, useColorModeValue, Modal, Button, Tooltip,
  ModalOverlay, ModalContent, ModalCloseButton, Skeleton,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import getT from 'next-translate/getT';
import Icon from '../../common/components/Icon';
import { getExtensionName, unSlugify } from '../../utils';
import Heading from '../../common/components/Heading';
import Link from '../../common/components/NextChakraLink';
import MarkDownParser from '../../common/components/MarkDownParser';
import TagCapsule from '../../common/components/TagCapsule';
import getMarkDownContent from '../../common/components/MarkDownParser/markdown';
import { MDSkeleton } from '../../common/components/Skeleton';
import GridContainer from '../../common/components/GridContainer';
import MktRecommendedCourses from '../../common/components/MktRecommendedCourses';
import redirectsFromApi from '../../../public/redirects-from-api.json';
import MktSideRecommendedCourses from '../../common/components/MktSideRecommendedCourses';

export const getStaticPaths = async ({ locales }) => {
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?asset_type=lesson&limit=2000`);
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

  const response = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}?asset_type=LESSON`);
  const lesson = await response.json();

  const engPrefix = {
    us: 'en',
    en: 'en',
  };
  const isCurrenLang = locale === engPrefix[lesson?.lang] || locale === lesson?.lang;

  if (response.status >= 400 || response.status_code >= 400 || lesson.asset_type !== 'LESSON' || !isCurrenLang) {
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
  let ipynbHtmlUrl = '';

  if (exensionName !== 'ipynb') {
    const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.md`);
    markdown = await resp.text();
  } else {
    ipynbHtmlUrl = `${process.env.BREATHECODE_HOST}/v1/registry/asset/preview/${slug}`;
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
      lesson,
      translations: translationArray,
      markdown,
      ipynbHtmlUrl,
    },
  };
};

const LessonSlug = ({ lesson, markdown, ipynbHtmlUrl }) => {
  const { t } = useTranslation('lesson');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const markdownData = markdown ? getMarkDownContent(markdown) : '';

  const translations = lesson?.translations || { es: '', en: '', us: '' };

  const router = useRouter();
  const currentTheme = useColorModeValue('light', 'dark');
  const iconColorTheme = useColorModeValue('#000000', '#ffffff');
  const { slug } = router.query;
  const { locale } = router;

  useEffect(async () => {
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
        // maxWidth="1280px"
        margin="28px auto 0 auto"
        height="100%"
        // gridTemplateColumns="3fr repeat(12, 1fr) 3fr"
        gridTemplateColumns="4fr repeat(12, 1fr)"
        gridGap="36px"
        // padding={{ base: '0 10px', lg: '0' }}
        padding="0 10px"
      >
        <Box display={{ base: 'none', md: 'flex' }} height="fit-content" gridColumn="1 / span 1" margin={{ base: '0 0 40px', md: '0' }}>
          <MktSideRecommendedCourses />
        </Box>
        <Box gridColumn="2 / span 12" maxWidth="854px">
          <Box display="grid" gridColumn="2 / span 12">
            <Box display="flex" gridGap="10px" justifyContent="space-between">
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
              <Link href={lesson?.readme_url || '#aliasRedirection'} width="fit-content" color="gray.400" target="_blank" rel="noopener noreferrer" display="flex" justifyContent="right" gridGap="12px" alignItems="center">
                <Icon icon="pencil" color="#A0AEC0" width="20px" height="20px" />
                {t('common:edit-on-github')}
              </Link>
            </Box>
            {lesson?.title ? (
              <Heading
                as="h1"
                size="30px"
                fontWeight="700"
                margin="22px 0 20px 0"
                transition="color 0.2s ease-in-out"
                color={useColorModeValue('black', 'white')}
                textTransform="uppercase"
              >
                {lesson.title}
              </Heading>
            ) : (
              <Skeleton height="45px" width="100%" m="22px 0 35px 0" borderRadius="10px" />
            )}
          </Box>

          {markdown && ipynbHtmlUrl === '' ? (
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
                title={t('common:continue-learning', { technologies: lesson?.technologies.map((tech) => unSlugify(tech)).slice(0, 4).join(', ') })}
                technologies={lesson?.technologies.join(',')}
              />
              {/* {(markdown && ipynbHtmlUrl === '')
                ? <MarkDownParser content={markdownData.content} />
                : <MDSkeleton />} */}

            </Box>

          ) : (
            <>
              {ipynbHtmlUrl === '' && (
                <MDSkeleton />
              )}
            </>
          )}
          <Box
            height="100%"
            gridColumn="2 / span 12"
            borderRadius="3px"
            maxWidth="1280px"
            width={{ base: '100%', md: 'auto' }}
          >
            {ipynbHtmlUrl && markdown === '' && (
              <Box width="100%" height="100%">
                <Button
                  background={currentTheme}
                  position="absolute"
                  margin="1rem 0 0 2rem"
                  padding="5px"
                  height="auto"
                  onClick={() => setIsFullScreen(true)}
                >
                  <Tooltip label={t('common:full-screen')} placement="top">
                    <Box>
                      <Icon icon="screen" color={iconColorTheme} width="22px" height="22px" />
                    </Box>
                  </Tooltip>
                </Button>
                <iframe
                  id="iframe"
                  src={`${ipynbHtmlUrl}?theme=${currentTheme}&plain=true`}
                  seamless
                  style={{
                    width: '100%',
                    height: '80vh',
                    maxHeight: '100%',
                  }}
                  title={`${lesson.title} IPython Notebook`}
                />

                <Modal isOpen={isFullScreen} closeOnOverlayClick onClose={() => setIsFullScreen(false)} isCentered size="5xl" borderRadius="0">
                  <ModalOverlay />
                  <ModalContent>
                    <ModalCloseButton
                      style={{
                        top: '9px',
                        right: '18px',
                        zIndex: '99',
                      }}
                    />
                    <iframe
                      id="iframe"
                      src={`${ipynbHtmlUrl}?theme=${currentTheme}&plain=true`}
                      seamless
                      style={{
                        width: '100%',
                        height: '100vh',
                        maxHeight: '100%',
                      }}
                      title={`${lesson.title} IPython Notebook`}
                    />
                  </ModalContent>
                </Modal>
              </Box>
            )}
          </Box>
        </Box>
      </GridContainer>
    </>
  );
};

LessonSlug.propTypes = {
  lesson: PropTypes.objectOf(PropTypes.any).isRequired,
  markdown: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  ipynbHtmlUrl: PropTypes.string.isRequired,
};

export default LessonSlug;
