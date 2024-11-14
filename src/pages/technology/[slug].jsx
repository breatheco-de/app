import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { Box, Flex, Container, Image, Button } from '@chakra-ui/react';
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

  const response = await bc.lesson({ sort_priority: 1 }).techsBySort();
  const techsBySortPriority = response.data;

  const workshopResp = await bc.public().events();
  const workshops = workshopResp.data;

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
      techsBySortPriority,
      workshops,
      data: dataByCurrentLanguage.map(
        (l) => ({ ...l, difficulty: l?.difficulty?.toLowerCase() || null }),
      ),
    },
  };
};

function LessonByTechnology({ data, technologyData, technologiesAvailable, techsBySortPriority, workshops }) {
  const { t, lang } = useTranslation('technologies');
  const { fontColor } = useStyle();
  const router = useRouter();
  const scrollRef = useRef();
  const [currentTech, setCurrentTech] = useState(technologyData);
  const contentPerPage = 10;
  const techsShown = technologiesAvailable?.filter((tech) => techsBySortPriority.some((sortTech) => sortTech.slug === tech.slug) && tech?.slug !== currentTech?.slug);
  const exercises = data.filter((asset) => asset?.asset_type === 'EXERCISE' && asset.technologies.some((tech) => tech.slug === currentTech?.slug)).slice(0, 3);
  const lessonMaterials = data.filter((asset) => asset?.asset_type !== 'EXERCISE' && asset.technologies.some((tech) => tech.slug === currentTech?.slug));
  const [visibleItems, setVisibleItems] = useState(undefined);

  const scrollRight = () => {
    scrollRef.current.scrollTo({
      left: scrollRef.current.scrollLeft + 90,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    setVisibleItems(lessonMaterials.slice(0, contentPerPage));
  }, [lessonMaterials]);

  const loadMoreItems = async () => {
    const start = visibleItems.length;
    const end = start + contentPerPage;
    const newItems = lessonMaterials.slice(start, end);

    if (newItems.length > 0) {
      setVisibleItems((prevItems) => [...prevItems, ...newItems]);
    }

    return {
      data: {
        results: newItems,
      },
    };
  };

  useEffect(() => {
    if (!technologyData?.slug || data?.length === 0) {
      router.push('/');
    }
  }, [data]);

  // console.log(data);
  // console.log(exercises);
  // console.log(workshops);
  // console.log(technologyData);
  // console.log('ASDASDASDASD', currentTech);
  // console.log('asdasdasdasa', lessonMaterials);
  // console.log(visibleItems);
  // console.log(technologiesAvailable);
  // console.log(techsBySortPriority);

  return technologyData?.slug && data?.length > 0 && currentTech && (
    <Container maxWidth="1280px">
      <Flex padding="30px 20px" gap={{ base: '30px', md: '80px' }} mt="60px">
        <Flex textAlign="center" flexDirection="column">
          <Image width="60px" height="60px" src={currentTech.icon_url} objectFit="contain" />
          <Text fontSize="md" marginTop="10px" color="blue.1000">{currentTech.title}</Text>
        </Flex>
        <DraggableContainer ref={scrollRef}>
          <Flex flexGrow="1" w="100%" h="100%" alignItems="center" gap={{ base: '20px', md: '80px' }} whiteSpace="nowrap">
            {techsShown.map((tech) => (
              <Box key={tech.title} minWidth="60px">
                {tech?.icon_url && (
                  <Image
                    alt={`${tech.title}`}
                    height="40px"
                    width="40px"
                    cursor="pointer"
                    objectFit="contain"
                    onClick={() => setCurrentTech(tech)}
                    src={tech.icon_url}
                    filter="grayscale(100%)"
                  />
                )}
              </Box>
            ))}
          </Flex>
        </DraggableContainer>
        <Icon as="button" onClick={scrollRight} cursor="pointer" icon="arrowRight" color={fontColor} width="20px" height="20px" />
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
            {t('landing-technology.title', { technology: toCapitalize(currentTech?.title) })}
          </Heading>
          <Text size="md">
            {currentTech?.description ? currentTech?.description : t('landing-technology.defaultDescription')}
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
            url={technologyData?.videoUrl || 'https://example.com/video.mp4'}
            thumbnail={technologyData?.thumbnail}
            controls
            withThumbnail
            withModal
            title={currentTech?.title || 'Technology Video'}
            iframeStyle={{
              borderRadius: '8px',
              width: '100%',
              maxHeight: '344px',
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
      <Flex marginTop="50px" flexDirection="column" gap="15px">
        {workshops?.length > 0 ? (
          <Box width="100%">
            <MktEventCards
              type="carousel"
              externalEvents={workshops}
              title={t('tech-workshops', { tech: currentTech?.title })}
            />
          </Box>
        )
          : <Text>THERE ARE NOT WORKSHIPS CURRENTLY</Text>}
      </Flex>
      <Flex marginTop="50px" flexDirection="column" gap="15px">
        <Heading as="h2" fontSize="38px" fontWeight="700" mb="20px">
          {t('tech-materials', { tech: currentTech?.title })}
        </Heading>
        {visibleItems?.length > 0 ? (
          <GridContainer withContainer gridColumn="1 / span 10" maxWidth="100%" padding="0" justifyContent="flex-start" margin="0">
            <ProjectsLoader
              articles={visibleItems}
              itemsPerPage={contentPerPage}
              count={lessonMaterials.length}
              lang={lang}
              fetchData={loadMoreItems}
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
  data: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  technologyData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  technologiesAvailable: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  techsBySortPriority: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))).isRequired,
  workshops: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))).isRequired,
};

LessonByTechnology.defaultProps = {
  data: [],
};

export default LessonByTechnology;
