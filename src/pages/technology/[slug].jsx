import { useRouter } from 'next/router';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import {
  Box, Flex, Container, Image, Button,
} from '@chakra-ui/react';

import getT from 'next-translate/getT';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import { toCapitalize } from '../../utils';
import Heading from '../../common/components/Heading';
import ProjectList from '../../js_modules/projects/ProjectList';

export const getStaticPaths = async ({ locales }) => {
  const assetList = await import('../../lib/asset-list.json')
    .then((res) => res.default)
    .catch(() => []);

  const data = assetList.landingTechnologies;

  const paths = data?.length > 0 ? data.flatMap((res) => locales.map((locale) => ({
    params: {
      slug: res.slug,
    },
    locale,
  }))) : [];

  return {
    fallback: true,
    paths,
  };
};

export const getStaticProps = async ({ params, locale, locales }) => {
  const t = await getT(locale, 'technologies');
  const { slug } = params;
  const langList = {
    en: 'us',
    es: 'es',
  };

  const assetList = await import('../../lib/asset-list.json')
    .then((res) => res.default)
    .catch(() => []);

  const allTechnologiesList = assetList.landingTechnologies;
  const technologiesAvailable = allTechnologiesList.filter((tech) => tech?.lang === locale);
  const technologyData = allTechnologiesList.find((tech) => tech?.slug === slug && tech?.lang === locale) || {};
  const data = technologyData?.assets?.length > 0 ? technologyData.assets.filter((l) => {
    const assetType = l?.asset_type.toUpperCase();

    if (assetType === 'LESSON') return true;
    if (assetType === 'PROJECT') return true;
    if (assetType === 'EXERCISE') return true;
    if (l?.category) {
      return l?.category?.slug === 'how-to' || l?.category?.slug === 'como';
    }
    return false;
  }) : [];

  const ogUrl = {
    en: `/technology/${slug}`,
    us: `/technology/${slug}`,
  };
  const dataByCurrentLanguage = data.filter((l) => l?.lang === langList?.[locale] || l.lang === locale);

  return {
    props: {
      seo: {
        title: technologyData?.title || '',
        description: t('seo.description', { technology: technologyData?.title }),
        image: technologyData?.icon_url || '',
        pathConnector: `/technology/${slug}`,
        url: ogUrl.en,
        type: 'website',
        card: 'default',
        locales,
        locale,
      },
      technologiesAvailable,
      technologyData,
      data: dataByCurrentLanguage.map(
        (l) => ({ ...l, difficulty: l?.difficulty?.toLowerCase() || null }),
      ),
    },
  };
};

function LessonByTechnology({ data, technologyData, technologiesAvailable }) {
  const { t } = useTranslation('technologies');
  const router = useRouter();

  useEffect(() => {
    if (!technologyData?.slug || data?.length === 0) {
      router.push('/');
    }
  }, [data]);

  // console.log(data);
  console.log(technologyData);
  // console.log(technologiesAvailable);

  return technologyData?.slug && data?.length > 0 && (
    <Container maxWidth="1280px">
      {/*TOP BAR*/}
      <Box padding="30px 20px">
        {technologiesAvailable.map((tech) => (
          <>
            {tech?.icon_url
              && (
                <Image width="41px" src={tech.icon_url} />
              )}
          </>
        ))}
      </Box>
      <Flex
        height="100%"
        padding="0 10px"
        gap="10px"
      >
        <Flex direction="column" pb="15px" flexGrow="1">
          <Heading
            as="h1"
            display="inline-block"
            fontWeight="700"
            paddingBottom="6px"
          >
            {t('landing-technology.title', { technology: toCapitalize(technologyData?.title) })}
          </Heading>
          <Text size="md">
            {technologyData?.description ? technologyData?.description : t('landing-technology.defaultDescription')}
          </Text>
          <Flex gap="10px" marginTop="10px">
            <Button background="blue.1000" color="white" alignContent="center" alignItems="center" gap="10px" display="flex" _hover="none">
              {`${technologyData?.title} roadmaps`}
              <Icon color="white" icon="longArrowRight" />
            </Button>
            <Button border="1px" borderColor="blue.1000" color="blue.1000" _hover="none">
              {t('request-mentorship')}
            </Button>
          </Flex>
        </Flex>
        <Box flexGrow="1" width="624px" height="344px">
          <ReactPlayerV2
            url={technologyData?.videoUrl || 'https://example.com/video.mp4'}
            thumbnail={technologyData?.thumbnail}
            controls
            withThumbnail
            withModal
            title={technologyData?.title || 'Technology Video'}
            iframeStyle={{ borderRadius: '8px' }}
          />
        </Box>
      </Flex>
      <Flex flexDirection="column" gridGap="3rem">
        <Box display="flex" flexDirection="column" gridGap="18px">
          <ProjectList
            projects={data}
            withoutImage
            isDynamic
            notFoundMessage={t('common:asset-not-found-in-current-language')}
          />
        </Box>
      </Flex>
    </Container>
  );
}

LessonByTechnology.propTypes = {
  data: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  technologyData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  technologiesAvailable: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  // projects: PropTypes.arrayOf(PropTypes.object),
  // exercises: PropTypes.arrayOf(PropTypes.object),
  // howTos: PropTypes.arrayOf(PropTypes.object),
};

LessonByTechnology.defaultProps = {
  data: [],
  // projects: [],
  // exercises: [],
  // howTos: [],
};

export default LessonByTechnology;
