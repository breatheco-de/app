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

  const mktInfoResponse = await bc.lesson().techMktInfo(slug);
  const marketingInfo = mktInfoResponse?.data?.marketing_information || {};
  const { title = '', description = '' } = marketingInfo;

  const marketingInfoExist = Object.keys(marketingInfo).length > 0;
  if (!marketingInfoExist) contentPerPage = 20;
  else contentPerPage = 10;

  const allTechnologies = await import('../../lib/asset-list.json');
  const assetList = {
    landingTechnologies: allTechnologies?.landingTechnologies.filter(
      (tech) => tech.lang === locale && tech.slug === slug,
    ) || [],
  };

  const response = await bc.lesson({ sort_priority: 1, visibility: 'PUBLIC', is_deprecated: false }).techsBySort();
  const technologiesFetched = response.data || [];

  const isSortPriorityOne = technologiesFetched.some((tech) => tech.slug === slug);
  if (!isSortPriorityOne) contentPerPage = 20;

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
      technologyData,
      techsBySortPriority,
      marketingInfo,
      coursesForTech,
      assetData,
      workShopsForTech,
      isSortPriorityOne,
      count,
    },
  };
};

function LessonByTechnology({ assetData, technologyData, techsBySortPriority, count, coursesForTech, workShopsForTech, marketingInfo, isSortPriorityOne }) {
  const { t, lang } = useTranslation('technologies');
  const { isAuthenticated } = useAuth();
  const { fontColor } = useStyle();
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const scrollRef = useRef();
  const marketingInfoExist = Object.keys(marketingInfo).length > 0;
  const exercises = assetData?.filter((asset) => asset?.asset_type === 'EXERCISE');
  const lessonMaterials = marketingInfoExist ? assetData?.filter((asset) => asset?.asset_type !== 'EXERCISE') : assetData;
  const coursesAvailable = coursesForTech?.length > 0;
  const techsShown = techsBySortPriority?.sort((a, b) => {
    if (a.slug === technologyData.slug && b.slug !== technologyData.slug) return -1;
    return 0;
  });

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

  useEffect(() => {
    scrollBy(-1000);
  }, [technologyData]);

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

  return technologyData?.slug && assetData?.length > 0 && (
    <Container maxWidth="1280px">
      {isSortPriorityOne ? (
        <>
          <Flex padding="30px 20px" gap={{ base: '10px', md: '80px' }} mt="30px" alignItems="center">
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
                {techsShown.map((tech, index) => (
                  <Box
                    key={tech.title}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    minWidth={index === 0 ? 'auto' : '60px'}
                  >
                    {tech?.icon_url && (
                      <>
                        <Image
                          alt={`${tech.title}`}
                          height="40px"
                          width="40px"
                          maxWidth="100%"
                          cursor="pointer"
                          objectFit="contain"
                          margin="0 auto"
                          src={tech.icon_url}
                          filter={index !== 0 && 'grayscale(100%)'}
                          onMouseDown={handleMouseDown}
                          onMouseUp={() => handleMouseUp(tech)}
                        />
                        {index === 0 && <Text textAlign="center" fontSize="md" marginTop="10px" color="blue.1000">{technologyData.title}</Text>}
                      </>
                    )}
                  </Box>
                ))}
              </Flex>
            </DraggableContainer>
            <Button onClick={() => scrollBy(250)} variant="ghost" p="0" minW="auto" _hover="none" _active="none">
              <Icon icon="arrowRight" color={fontColor} width="20px" height="20px" />
            </Button>
          </Flex>
          {
            marketingInfoExist ? (
              <>
                <Flex
                  height="100%"
                  padding="0 10px"
                  gap="20px"
                  flexDirection={{ base: 'column', md: 'row' }}
                  alignItems="center"
                >
                  <Flex direction="column" pb="15px" flex="1" maxWidth={{ base: '100%', md: '50%' }}>
                    <Heading as="h1" fontSize="50px" display="inline-block" fontWeight="700" paddingBottom="6px">
                      {marketingInfo.title ? languageFix(marketingInfo.title, lang) : t('landing-technology.title', { technology: toCapitalize(technologyData?.title) })}
                    </Heading>
                    <Text size="md">
                      {marketingInfo.description ? languageFix(marketingInfo.description, lang) : t('landing-technology.defaultDescription')}
                    </Text>
                    <Flex gap="10px" marginTop="50px" wrap="wrap">
                      {coursesAvailable
                        && (
                          <Link href={`/${lang}/bootcamp/${coursesForTech[0].slug}`}>
                            <Button background="blue.1000" color="white" alignContent="center" alignItems="center" gap="10px" display="flex" _hover="none" borderRadius="3px">
                              {`${technologyData?.title} roadmap`}
                              <Icon color="white" icon="longArrowRight" />
                            </Button>
                          </Link>
                        )}
                      <Link href={!isAuthenticated ? `/${lang}/pricing?plan=${process.env.BASE_PLAN}` : `/${lang}/mentorship/schedule`}>
                        <Button border={coursesAvailable && '1px'} borderColor={coursesAvailable && 'blue.1000'} color={coursesAvailable ? 'blue.1000' : 'white'} background={coursesAvailable ? 'auto' : 'blue.1000'} _hover="none" borderRadius="3px">
                          {t('request-mentorship')}
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
            )
          }
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
