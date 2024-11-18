import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { Box, Flex, Container, Image, Button, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import getT from 'next-translate/getT';
import bc from '../../common/services/breathecode';
import useStyle from '../../common/hooks/useStyle';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import { toCapitalize } from '../../utils';
import Heading from '../../common/components/Heading';
import ProjectList from '../../js_modules/projects/ProjectList';
import DraggableContainer from '../../common/components/DraggableContainer';
import GridContainer from '../../common/components/GridContainer';
import MktEventCards from '../../common/components/MktEventCards';
import ProjectsLoader from '../../common/components/ProjectsLoader';
import { parseQuerys } from '../../utils/url';

const contentPerPage = 10;

const fetchOtherAssets = async (lang, page, tech) => {
  const querys = parseQuerys({
    status: 'PUBLISHED',
    language: lang,
    technologies: tech,
    limit: contentPerPage,
    offset: (page - 1) * contentPerPage,
    asset_type: 'LESSON,PROJECT',
    expand: 'technologies',
  });

  const url = `${process.env.BREATHECODE_HOST}/v1/registry/asset${querys}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Error en la respuesta del servidor: ${resp.status}`);
    const data = await resp.json();
    return { resp, data };
  } catch (error) {
    console.error('Error en fetchOtherAssets:', error);
    return { resp: null, data: null };
  }
};

export const getStaticPaths = async ({ locales }) => {
  const response = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/technology?sort_priority=1`);
  const techsWithSortPriority = await response.json();

  if (!techsWithSortPriority || techsWithSortPriority.length === 0) {
    return {
      fallback: true,
      paths: [],
    };
  }

  const relevantSlugs = techsWithSortPriority.map((tech) => tech.slug);

  const assetList = await import('../../lib/asset-list.json').then((res) => res.default);
  const filteredTechnologies = assetList.landingTechnologies.filter((tech) => relevantSlugs.includes(tech.slug));

  const paths = filteredTechnologies.flatMap((tech) => locales.map((locale) => ({
    params: { slug: tech.slug },
    locale,
  })));

  return {
    fallback: true,
    paths,
  };
};

export const getStaticProps = async ({ params, locale, locales }) => {
  const t = await getT(locale, 'technologies');
  const { slug } = params;

  const response = await bc.lesson({ sort_priority: 1 }).techsBySort();
  const techsBySortPriority = response.data;

  let marketingInfo = {};
  try {
    const mktInfoResponse = await bc.lesson(slug).techMktInfo();
    marketingInfo = mktInfoResponse?.data?.marketing_information || {};
  } catch (err) {
    console.log(`Error fetching marketing info for ${slug}:`, err);
  }
  const { title = '', description = '', video = '' } = marketingInfo;

  let assetList;
  try {
    const { default: allTechnologies } = await import('../../lib/asset-list.json');
    assetList = {
      landingTechnologies: allTechnologies.landingTechnologies.filter(
        (tech) => tech.lang === locale && tech.slug === slug,
      ),
    };
  } catch (error) {
    console.error('Error loading asset-list.json:', error);
    assetList = { landingTechnologies: [] };
  }

  const landingTechnology = assetList.landingTechnologies[0] || [];

  const rawTechnologyData = assetList.landingTechnologies.find(
    (tech) => tech.lang === locale && tech.slug === slug,
  ) || {};

  const { assets, assetTypesInTechnology, ...technologyData } = rawTechnologyData;

  const exercises = landingTechnology?.assets?.filter(
    (l) => l?.asset_type?.toUpperCase() === 'EXERCISE',
  ).slice(0, 3) || [];

  const { results: otherAssets, count } = (await fetchOtherAssets(locale, 1, slug)).data;

  const assetData = [...exercises, ...otherAssets];

  const ogUrl = {
    en: `/technology/${slug}`,
    us: `/technology/${slug}`,
  };

  return {
    props: {
      seo: {
        title: title[locale] || title || technologyData?.title || '',
        description: description[locale] || description || t('seo.description', { technology: technologyData?.title }),
        image: technologyData?.icon_url || '',
        pathConnector: `/technology/${slug}`,
        url: ogUrl.en,
        type: 'website',
        card: 'default',
        locales,
        locale,
      },
      technologyData,
      techsBySortPriority,
      assetData,
      video,
      count,
    },
  };
};

function LessonByTechnology({ assetData, technologyData, techsBySortPriority, count, video }) {
  const { t, lang } = useTranslation('technologies');
  const { fontColor } = useStyle();
  const router = useRouter();
  const toast = useToast();
  const scrollRef = useRef();
  const [workshops, setWorkshops] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const techsShown = techsBySortPriority?.filter((sortTech) => sortTech.slug !== technologyData.slug && sortTech.icon_url);
  const exercises = assetData?.filter((asset) => asset?.asset_type === 'EXERCISE');
  const lessonMaterials = assetData?.filter((asset) => asset?.asset_type !== 'EXERCISE');

  const fetchData = async (currentLang, page, tech) => {
    const { data } = await fetchOtherAssets(currentLang, page, tech.slug);
    return { data: data || { results: [] } };
  };

  const handleTechChange = (technology) => {
    if (!technology?.slug) return;
    router.push(`/${lang}/technology/${technology.slug}`);
  };

  const getWorkshops = async () => {
    try {
      const workshopResp = await bc.public().events();
      const currentWorkshops = workshopResp.data;
      setWorkshops(currentWorkshops);
    } catch (err) {
      toast({
        position: 'top',
        title: t('errors.loading-workshops'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (assetData?.length > 0) getWorkshops();
  }, []);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollLeft + 250,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if ((!technologyData?.slug || assetData?.length === 0)) {
      toast({
        position: 'top',
        title: t('errors.no-data'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      router.replace('/');
    }
  }, [technologyData?.slug, assetData]);

  const handleMouseDown = () => setIsDragging(false);
  const handleMouseMove = () => setIsDragging(true);
  const handleMouseUp = (tech) => {
    if (!isDragging) {
      handleTechChange(tech);
    }
  };

  return technologyData?.slug && assetData?.length > 0 && technologyData && (
    <Container maxWidth="1280px">
      <Flex padding="30px 20px" gap={{ base: '10px', md: '80px' }} mt="60px" alignItems="center">
        <Flex textAlign="center" alignItems="center" flexDirection="column">
          <Image width="60px" height="60px" src={technologyData.icon_url} objectFit="contain" />
          <Text fontSize="md" marginTop="10px" color="blue.1000">{technologyData.title}</Text>
        </Flex>
        <DraggableContainer ref={scrollRef}>
          <Flex
            flexGrow="1"
            w="100%"
            h="100%"
            alignItems="center"
            gap={{ base: '20px', md: '80px' }}
            whiteSpace="nowrap"
            onMouseMove={handleMouseMove}
          >
            {techsShown.map((tech) => (
              <Box key={tech.title} minWidth="60px">
                {tech?.icon_url && (
                  <Image
                    alt={`${tech.title}`}
                    height="40px"
                    width="40px"
                    cursor="pointer"
                    objectFit="contain"
                    src={tech.icon_url}
                    filter="grayscale(100%)"
                    onMouseDown={handleMouseDown}
                    onMouseUp={() => handleMouseUp(tech)}
                  />
                )}
              </Box>
            ))}
          </Flex>
        </DraggableContainer>
        <Button onClick={scrollRight} variant="ghost" p="0" minW="auto" _hover="none" _active="none">
          <Icon icon="arrowRight" color={fontColor} width="20px" height="20px" />
        </Button>
      </Flex>
      <Flex
        height="100%"
        padding="0 10px"
        gap="20px"
        flexDirection={{ base: 'column', md: 'row' }}
        alignItems="flex-start"
      >
        <Flex direction="column" pb="15px" flex="1" maxWidth={{ base: '100%', md: '50%' }}>
          <Heading as="h1" fontSize="50px" display="inline-block" fontWeight="700" paddingBottom="6px">
            {t('landing-technology.title', { technology: toCapitalize(technologyData?.title) })}
          </Heading>
          <Text size="md">
            {technologyData?.description ? technologyData?.description : t('landing-technology.defaultDescription')}
          </Text>
          <Flex gap="10px" marginTop="50px" wrap="wrap">
            <Button background="blue.1000" color="white" alignContent="center" alignItems="center" gap="10px" display="flex" _hover="none">
              {`${technologyData?.title} roadmaps`}
              <Icon color="white" icon="longArrowRight" />
            </Button>
            <Button border="1px" borderColor="blue.1000" color="blue.1000" _hover="none" background="auto">
              {t('request-mentorship')}
            </Button>
          </Flex>
        </Flex>

        <Box flex="1" maxWidth={{ base: '100%', md: '50%' }} width="100%">
          <ReactPlayerV2
            url={video[lang] || video || ''}
            controls
            withThumbnail
            withModal
            title={technologyData?.title || 'Technology Video'}
            iframeStyle={{
              borderRadius: '8px',
              width: '100%',
              maxHeight: '100%',
              aspectRatio: '16/9',
            }}
          />
        </Box>
      </Flex>
      <Flex marginTop="20px" flexDirection="column" gap="15px">
        <Heading as="h2" fontSize="38px" fontWeight="700" mb="20px">
          {t('popular-exercises')}
        </Heading>
        <GridContainer withContainer gridColumn="1 / span 10" maxWidth="100%" padding="0" justifyContent="flex-start" margin="0">
          {exercises.length > 0 ? (
            <ProjectList
              projects={exercises}
              withoutImage
              notFoundMessage={t('common:asset-not-found-in-current-language')}
            />
          ) : (
            <Text fontSize="18px">{t('common:asset-not-found-in-current-language')}</Text>
          )}
        </GridContainer>
      </Flex>
      {workshops?.length > 0 && (
        <Flex marginTop="50px" flexDirection="column" gap="15px">
          <Box width="100%">
            <MktEventCards
              type="carousel"
              externalEvents={workshops}
              title={t('tech-workshops', { tech: technologyData?.title })}
            />
          </Box>
        </Flex>
      )}
      <Flex marginTop="50px" flexDirection="column" gap="15px">
        <Heading as="h2" fontSize="38px" fontWeight="700" mb="20px">
          {t('tech-materials', { tech: technologyData?.title })}
        </Heading>
        {lessonMaterials?.length > 0 ? (
          <GridContainer withContainer gridColumn="1 / span 10" maxWidth="100%" padding="0" justifyContent="flex-start" margin="0">
            <ProjectsLoader
              articles={lessonMaterials}
              itemsPerPage={contentPerPage}
              count={count}
              lang={lang}
              techSlug={technologyData.slug}
              fetchData={fetchData}
            />
          </GridContainer>
        ) : (
          <Text fontSize="18px">{t('common:asset-not-found-in-current-language')}</Text>
        )}
      </Flex>
    </Container>
  );
}

LessonByTechnology.propTypes = {
  assetData: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  technologyData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  techsBySortPriority: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))).isRequired,
  count: PropTypes.number.isRequired,
  video: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
};

LessonByTechnology.defaultProps = {
  video: '',
  assetData: [],
};

export default LessonByTechnology;
