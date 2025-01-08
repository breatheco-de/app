import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { Box, Flex, Container, Image, Button, useToast, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import getT from 'next-translate/getT';
import bc from '../../common/services/breathecode';
import useStyle from '../../common/hooks/useStyle';
import useAuth from '../../common/hooks/useAuth';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import { toCapitalize, languageFix } from '../../utils';
import Heading from '../../common/components/Heading';
import ProjectList from '../../js_modules/projects/ProjectList';
import DraggableContainer from '../../common/components/DraggableContainer';
import GridContainer from '../../common/components/GridContainer';
import MktEventCards from '../../common/components/MktEventCards';
import ProjectsLoader from '../../common/components/ProjectsLoader';
import { parseQuerys } from '../../utils/url';

let contentPerPage = 10;

function DefaultTechnologySection({ technologyData, lessonMaterials, contentPerEachPage, count, lang, fetchData }) {
  const { t } = useTranslation('technologies');
  return (
    <Flex marginTop="20px" flexDirection="column" gap="15px">
      <Box mb="10px">
        <Text
          as="h1"
          fontSize="15px"
          color={useColorModeValue('blue.default', 'blue.300')}
          display="inline-block"
          fontWeight="700"
          paddingBottom="6px"
        >
          {t('landing-technology.title', { technology: toCapitalize(technologyData?.title) })}
        </Text>
        <Heading as="h2" fontSize="38px" fontWeight="700" mb="10px">
          {t('landing-technology.subTitle', { technology: technologyData?.title })}
        </Heading>
        <Text>
          {technologyData?.description || t('description', { technology: technologyData?.title })}
        </Text>
      </Box>

      <GridContainer withContainer gridColumn="1 / span 10" maxWidth="100%" padding="0" justifyContent="flex-start" margin="0">
        <ProjectsLoader
          articles={lessonMaterials}
          itemsPerPage={contentPerEachPage}
          count={count}
          lang={lang}
          techSlug={technologyData.slug}
          fetchData={fetchData}
        />
      </GridContainer>
    </Flex>
  );
}

const fetchOtherAssets = async (lang, page, tech, mktInfoExist) => {
  const querys = parseQuerys({
    status: 'PUBLISHED',
    language: lang,
    technologies: tech,
    limit: contentPerPage,
    offset: (page - 1) * contentPerPage,
    asset_type: mktInfoExist ? 'LESSON,PROJECT' : 'LESSON,PROJECT,EXERCISE',
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
  const response = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/technology?visibility=PUBLIC`);
  const publicTechs = await response.json();

  if (!publicTechs || publicTechs.length === 0) {
    return {
      fallback: true,
      paths: [],
    };
  }
  const relevantSlugs = publicTechs.map((tech) => tech.slug);

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

  const langMap = {
    en: 'us',
    us: 'us',
    es: 'es',
  };
  const normalizedLocale = langMap[locale] || locale;

  const currentTechResp = await bc.lesson().techMktInfo(slug);
  const currentTech = currentTechResp?.data || {};
  const marketingInfo = currentTech?.marketing_information || {};
  const featuredCourse = currentTech?.featured_course || {};
  const { title = '', description = '' } = marketingInfo;
  const { slug: featuredCourseSlug = '' } = featuredCourse;

  const marketingInfoExist = Object.keys(marketingInfo).length > 0;
  if (!marketingInfoExist) contentPerPage = 20;
  else contentPerPage = 10;

  const response = await bc.lesson({ sort_priority: 1, visibility: 'PUBLIC', is_deprecated: false }).techsBySort();
  const technologiesFetched = response.data || [];

  const isSortPriorityOne = technologiesFetched.some((tech) => tech.slug === slug);
  if (!isSortPriorityOne) contentPerPage = 20;

  const allTechnologies = await import('../../lib/asset-list.json');
  const assetList = {
    landingTechnologies: allTechnologies?.landingTechnologies.filter(
      (tech) => tech.lang === locale && tech.slug === slug,
    ) || [],
  };

  const techsBySortPriority = technologiesFetched.filter((tech) => {
    if (!tech.icon_url) return false;
    if (!tech.lang) return true;
    if (tech.lang === normalizedLocale) return true;
    return tech.lang === locale;
  });

  const workshopResp = await bc.public({ technologies: slug }).events();
  const workShopsForTech = workshopResp.data || [];

  const coursesForTechResponse = await bc.marketing({ technologies: slug }).courses();
  const coursesForTech = coursesForTechResponse?.data || [];

  const rawTechnologyData = assetList.landingTechnologies.find(
    (tech) => tech.lang === locale && tech.slug === slug,
  ) || {};

  const { assets, assetTypesInTechnology, ...technologyData } = rawTechnologyData;

  const exercises = assets?.filter(
    (l) => l?.asset_type?.toUpperCase() === 'EXERCISE',
  ).slice(0, 3) || [];

  const { results: otherAssets = [], count } = (await fetchOtherAssets(locale, 1, slug, marketingInfoExist)).data;

  const assetData = marketingInfoExist ? [...exercises, ...otherAssets] : [...otherAssets];

  const ogUrl = {
    en: `/technology/${slug}`,
    us: `/technology/${slug}`,
  };

  return {
    props: {
      seo: {
        title: title[normalizedLocale] || title || technologyData?.title || '',
        description: description[normalizedLocale] || description || t('seo.description', { technology: technologyData?.title }),
        image: technologyData?.icon_url || '',
        pathConnector: `/technology/${slug}`,
        url: ogUrl.en,
        type: 'website',
        card: 'default',
        locales,
        locale,
      },
      assetData,
      technologyData,
      techsBySortPriority,
      count,
      coursesForTech,
      workShopsForTech,
      marketingInfo,
      isSortPriorityOne,
      featuredCourseSlug,
    },
  };
};

function LessonByTechnology({ assetData, technologyData, techsBySortPriority, count, coursesForTech, workShopsForTech, marketingInfo, isSortPriorityOne, featuredCourseSlug }) {
  const { t, lang } = useTranslation('technologies');
  const { isAuthenticated } = useAuth();
  const { fontColor, colorMode } = useStyle();
  const [isDragging, setIsDragging] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const router = useRouter();
  const toast = useToast();
  const scrollRef = useRef();
  const marketingInfoExist = Object.keys(marketingInfo).length > 0;
  const exercises = assetData?.filter((asset) => asset?.asset_type === 'EXERCISE');
  const lessonMaterials = marketingInfoExist ? assetData?.filter((asset) => asset?.asset_type !== 'EXERCISE') : assetData;
  const coursesAvailable = coursesForTech?.length > 0 || featuredCourseSlug;

  const fetchData = async (currentLang, page, tech) => {
    const { data } = await fetchOtherAssets(currentLang, page, tech.slug, marketingInfoExist);
    return { data: data || { results: [] } };
  };

  const handleTechChange = (technology) => {
    if (!technology?.slug) return;
    router.push(`/${lang}/technology/${technology.slug}`);
  };

  const scrollBy = (amount) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollLeft + amount,
        behavior: 'smooth',
      });
    }
  };

  const handleMouseDown = () => setIsDragging(false);
  const handleMouseMove = () => setIsDragging(true);
  const handleMouseUp = (tech) => {
    if (!isDragging) {
      handleTechChange(tech);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setIsAtStart(scrollLeft < 5);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 5);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef?.current?.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => scrollRef?.current?.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, [scrollRef]);

  useEffect(() => {
    if (scrollRef.current && technologyData) {
      const selectedTechnologyIndex = techsBySortPriority?.findIndex((tech) => tech.slug === technologyData.slug);

      if (selectedTechnologyIndex === -1) return;
      const scrollAmount = selectedTechnologyIndex * 90;

      scrollRef.current.scrollTo({
        left: scrollAmount,
      });
    }
  }, []);

  useEffect(() => {
    if (techsBySortPriority) {
      const selectedTechnologyIndex = techsBySortPriority?.findIndex((tech) => tech.slug === technologyData.slug);
      if (selectedTechnologyIndex !== techsBySortPriority.length - 1) return;
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollLeft + 40,
      });
    }
  }, [scrollRef?.current?.clientWidth]);

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

  const showFirstButton = coursesAvailable || assetData.length > 0;

  const getAssetUrl = (asset) => {
    const langConnector = asset.lang === 'us' ? '' : `/${asset.lang}`;

    const assetType = asset.category.slug === 'how-to' || asset.category.slug === 'como' ? 'how-to' : asset.asset_type;

    const assetsDict = {
      'how-to': 'how-to',
      LESSON: 'lesson',
      EXERCISE: 'interactive-exercise',
      PROJECT: 'interactive-coding-tutorial',
    };

    return `${langConnector}/${assetsDict[assetType]}/${asset.slug}`;
  };

  return technologyData?.slug && assetData?.length > 0 && (
    <Container maxWidth="1280px">
      {isSortPriorityOne ? (
        <>
          <Flex padding={{ base: '30px 0px', md: '30px 20px' }} gap="10px" mt="30px" alignItems="center" position="relative">
            <Button onClick={() => scrollBy(-250)} display={{ base: 'none', md: 'block' }} variant="ghost" p="0" minW="auto" _hover="none" _active="none" paddingBottom="10px">
              <Icon icon="arrowLeft3" color={fontColor} width="15px" height="15px" />
            </Button>

            {!isAtStart && (
              <Box
                position="absolute"
                display={{ base: 'none', md: 'block' }}
                top="0"
                left="40px"
                bottom="0"
                width="100px"
                pointerEvents="none"
                background={`linear-gradient(to right, ${colorMode}, rgba(255, 255, 255, 0))`}
                zIndex="2"
              />
            )}

            <DraggableContainer ref={scrollRef}>
              <Flex
                flexGrow="1"
                w="100%"
                h="100%"
                alignItems="center"
                gap={{ base: '40px', md: '80px' }}
                whiteSpace="nowrap"
                onMouseMove={handleMouseMove}
              >
                {techsBySortPriority.map((tech) => (
                  <Box
                    boxSizing="border-box"
                    key={tech.title}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap="5px"
                    onMouseDown={handleMouseDown}
                    onMouseUp={() => handleMouseUp(tech)}
                    cursor="pointer"
                    borderBottom="2px solid"
                    borderColor={tech.slug === technologyData.slug ? 'blue.1000' : 'transparent'}
                    _hover={tech.slug !== technologyData.slug && { borderColor: 'gray.200' }}
                  >
                    {tech?.icon_url && (
                      <>
                        <Image
                          alt={`${tech.title}`}
                          height="40px"
                          minWidth="40px"
                          maxWidth="100%"
                          objectFit="contain"
                          margin="0 auto"
                          src={tech.icon_url}
                          filter={tech.slug !== technologyData.slug && 'grayscale(100%)'}
                        />
                        <Box position="relative" paddingBottom="3px">
                          <Text userSelect="none" textAlign="center" fontSize="12px" color={tech.slug === technologyData.slug ? 'blue.1000' : 'gray'}>
                            {tech.title}
                          </Text>
                        </Box>
                      </>
                    )}
                  </Box>
                ))}
              </Flex>
            </DraggableContainer>

            <Button onClick={() => scrollBy(250)} display={{ base: 'none', md: 'block' }} variant="ghost" p="0" minW="auto" _hover="none" _active="none" paddingBottom="10px">
              <Icon icon="arrowRight" color={fontColor} width="15px" height="15px" />
            </Button>

            {!isAtEnd && (
              <Box
                position="absolute"
                display={{ base: 'none', md: 'block' }}
                top="0"
                right="40px"
                bottom="0"
                width="100px"
                pointerEvents="none"
                background={`linear-gradient(to left, ${colorMode}, rgba(255, 255, 255, 0))`}
                zIndex="2"
              />
            )}
          </Flex>

          {marketingInfoExist ? (
            <>
              <Flex
                height="100%"
                padding="0 10px"
                gap="20px"
                flexDirection={{ base: 'column', md: 'row' }}
                alignItems="center"
              >
                <Flex direction="column" pb="15px" flex="1" maxWidth={{ base: '100%', md: '50%' }}>
                  <Heading as="h1" fontSize={{ base: '40px', md: '50px' }} display="inline-block" fontWeight="700" paddingBottom="6px">
                    {marketingInfo.title ? languageFix(marketingInfo.title, lang) : t('landing-technology.title', { technology: toCapitalize(technologyData?.title) })}
                  </Heading>
                  <Text size="md">
                    {marketingInfo.description ? languageFix(marketingInfo.description, lang) : t('landing-technology.defaultDescription')}
                  </Text>
                  <Flex gap="10px" marginTop="50px" wrap="wrap">
                    {showFirstButton
                      && (
                        <Link href={coursesAvailable ? `/${lang}/bootcamp/${featuredCourseSlug || coursesForTech[0].slug}` : getAssetUrl(assetData[0])}>
                          <Button background="blue.1000" color="white" alignContent="center" alignItems="center" gap="10px" display="flex" _hover="none" borderRadius="3px">
                            {t('start-learning', { technology: technologyData?.title })}
                            <Icon color="white" icon="longArrowRight" />
                          </Button>
                        </Link>
                      )}
                    <Link href={!isAuthenticated ? `/${lang}/pricing?plan=${process.env.BASE_PLAN}` : 'https://calendly.com/tgonzalez-o0o/30min-1'}>
                      <Button border={showFirstButton && '1px'} borderColor={showFirstButton && 'blue.1000'} color={showFirstButton ? 'blue.1000' : 'white'} background={showFirstButton ? 'auto' : 'blue.1000'} _hover="none" borderRadius="3px">
                        {t('request-mentorship', { tech: technologyData?.title })}
                      </Button>
                    </Link>
                  </Flex>
                </Flex>

                <Box flex="1" maxWidth={{ base: '100%', md: '50%' }} width="100%">
                  {marketingInfo?.video ? (
                    <ReactPlayerV2
                      url={languageFix(marketingInfo.video, lang)}
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
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Image
                        borderRadius="8px"
                        alt="python image related"
                        src={marketingInfo?.image ? marketingInfo?.image : '/static/images/happy-male-with-laptop.png'}
                        objectFit="cover"
                      />
                    </Box>
                  )}
                </Box>
              </Flex>
              {exercises.length > 0 && (
                <Flex marginTop="20px" flexDirection="column" gap="15px">
                  <Heading as="h2" fontSize="38px" fontWeight="700" mb="20px">
                    {t('popular-exercises')}
                  </Heading>
                  <GridContainer withContainer gridColumn="1 / span 10" maxWidth="100%" padding="0" justifyContent="flex-start" margin="0">
                    <ProjectList
                      projects={exercises}
                      withoutImage
                      notFoundMessage={t('common:asset-not-found-in-current-language')}
                    />
                  </GridContainer>
                </Flex>
              )}
              {workShopsForTech?.length > 0 && (
                <Flex marginTop="50px" flexDirection="column" gap="15px">
                  <Box width="100%">
                    <MktEventCards
                      externalEvents={workShopsForTech}
                      title={t('tech-workshops', { tech: technologyData?.title })}
                    />
                  </Box>
                </Flex>
              )}
              {lessonMaterials?.length > 0 && (
                <Flex marginTop="50px" flexDirection="column" gap="15px">
                  <Heading as="h2" fontSize="38px" fontWeight="700" mb="20px">
                    {t('tech-materials', { tech: technologyData?.title })}
                  </Heading>
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
                </Flex>
              )}
            </>
          ) : (
            <DefaultTechnologySection
              technologyData={technologyData}
              lessonMaterials={lessonMaterials}
              contentPerPage={contentPerPage}
              count={count}
              lang={lang}
              fetchData={fetchData}
            />
          )}
        </>
      ) : (
        <DefaultTechnologySection
          technologyData={technologyData}
          lessonMaterials={lessonMaterials}
          contentPerPage={contentPerPage}
          count={count}
          lang={lang}
          fetchData={fetchData}
        />
      )}
    </Container>
  );
}

LessonByTechnology.propTypes = {
  assetData: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  technologyData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  techsBySortPriority: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))).isRequired,
  isSortPriorityOne: PropTypes.bool,
  featuredCourseSlug: PropTypes.string,
  count: PropTypes.number.isRequired,
  coursesForTech: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  workShopsForTech: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  marketingInfo: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

LessonByTechnology.defaultProps = {
  assetData: [],
  coursesForTech: [],
  workShopsForTech: [],
  marketingInfo: {},
  featuredCourseSlug: '',
  isSortPriorityOne: false,
};

DefaultTechnologySection.propTypes = {
  technologyData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  lessonMaterials: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  contentPerEachPage: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  lang: PropTypes.string.isRequired,
  fetchData: PropTypes.func.isRequired,
};

DefaultTechnologySection.defaultProps = {
  lessonMaterials: [],
};

export default LessonByTechnology;
