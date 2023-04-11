/* eslint-disable no-continue */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box, useColorModeValue, Skeleton,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import getT from 'next-translate/getT';
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

export const getStaticPaths = async ({ locales }) => {
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?asset_type=ARTICLE&limit=2000`);
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
      data: data || {},
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

  useEffect(async () => {
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
      <Box
        gridGap="20px"
        maxWidth="1020px"
        margin="3rem auto"
        padding="0 15px"
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
      >
        <Link
          href="/how-to"
          gridColumn="2 / span 12"
          color={linkColor}
          display="inline-block"
          letterSpacing="0.05em"
          fontWeight="700"
          marginBottom="1rem"
          width="fit-content"
        >
          {`← ${t('back-to')}`}
        </Link>
        <Box display="flex" gridGap="10px" justifyContent="space-between" mb="12px">
          <TagCapsule
            variant="rounded"
            isLink
            href="/how-to"
            tags={data?.technologies || ['alias', 'redirect']}
            marginY="8px"
            fontSize="13px"
            style={{
              padding: '2px 10px',
              margin: '0',
            }}
            gap="10px"
            paddingX="0"
          />
          <Link href={data?.readme_url || '#'} width="fit-content" color="gray.400" margin="0 0 0 auto" target="_blank" rel="noopener noreferrer" display="flex" justifyContent="right" gridGap="12px" alignItems="center">
            <Icon icon="pencil" color="#A0AEC0" width="20px" height="20px" />
            {t('common:edit-on-github')}
          </Link>
        </Box>
        {title ? (
          <Heading size="l" fontWeight="700">
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
        </Box>

      </Box>
      <Box maxWidth="1020px" margin="auto" padding="0 15px">
        <MktRecommendedCourses
          title={t('common:related-courses')}
          technologies={data?.technologies.join(',')}
        />
      </Box>
    </>
  );
}

HowToSlug.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  markdown: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};
