/* eslint-disable no-continue */
import {
  Box, Button, Flex, useColorModeValue, useDisclosure,
} from '@chakra-ui/react';
import getT from 'next-translate/getT';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import FilterModal from '../../common/components/FilterModal';
import GridContainer from '../../common/components/GridContainer';

import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import useFilter from '../../common/store/actions/filterAction';
import ProjectList from '../../js_modules/projects/ProjectList';
import Search from '../../js_modules/projects/Search';
import TitleContent from '../../js_modules/projects/TitleContent';
import { isWindow } from '../../utils';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'how-to');
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const image = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });
  const howTos = []; // filtered howTos after removing repeated
  let arrHowTos = []; // incoming howTos
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?asset_type=ARTICLE&limit=1000`);
  const data = await resp.json();
  // .then((res) => res.json())
  // .catch((err) => console.log(err));
  const currentLang = {
    en: 'us',
    es: 'es',
  };

  arrHowTos = Object.values(data.results);
  if (resp.status >= 200 && resp.status < 400) {
    console.log(`SUCCESS: ${arrHowTos.length} How To's fetched`);
  } else {
    console.error(`Error ${resp.status}: fetching How To's list for /how-to`);
  }

  let technologyTags = [];
  let difficulties = [];

  // const technologiesResponse = await fetch(
  //   `${process.env.BREATHECODE_HOST}/v1/registry/technology?asset_type=ARTICLE&limit=1000`,
  //   {
  //     Accept: 'application/json, text/plain, */*',
  //   },
  // );
  const technologiesResponse = await fetch(
    `${process.env.BREATHECODE_HOST}/v1/registry/technology?type=ARTICLE&limit=1000`,
    {
      Accept: 'application/json, text/plain, */*',
    },
  );

  if (technologiesResponse.status >= 200 && technologiesResponse.status < 400) {
    console.log(`SUCCESS: ${technologiesResponse.length} Technologies fetched for /how-to`);
  } else {
    console.error(`Error ${technologiesResponse.status}: fetching Exercises list for /how-to`);
  }

  const technologies = await technologiesResponse.json();

  for (let i = 0; i < arrHowTos.length; i += 1) {
    // skip repeated howTos
    if (howTos.find((p) => arrHowTos[i].slug === p.slug)) {
      continue;
    }
    howTos.push(arrHowTos[i]);

    if (typeof arrHowTos[i].technology === 'string') technologyTags.push(arrHowTos[i].technology);
    if (Array.isArray(arrHowTos[i].technologies)) {
      technologyTags = technologyTags.concat(arrHowTos[i].technologies);
    }

    if (typeof arrHowTos[i].difficulty === 'string') {
      if (arrHowTos[i].difficulty === 'BEGINNER') arrHowTos[i].difficulty = 'beginner';
      difficulties.push(arrHowTos[i].difficulty);
    }
  }

  technologyTags = [...new Set(technologyTags)];
  difficulties = [...new Set(difficulties)];

  technologyTags = technologies.filter((technology) => technologyTags.includes(technology.slug.toLowerCase()));

  // Verify if difficulty exist in expected position, else fill void array with 'nullString'
  const verifyDifficultyExists = (difficultiesArray, difficulty) => {
    if (difficultiesArray.some((el) => el.toLowerCase() === difficulty)) {
      return difficulty;
    }
    return 'nullString';
  };

  // Fill common difficulties in expected position
  const difficultiesSorted = [];
  ['beginner', 'easy', 'intermediate', 'hard'].forEach((difficulty) => {
    difficultiesSorted.push(verifyDifficultyExists(difficulties, difficulty));
  });

  const ogUrl = {
    en: '/how-to',
    us: '/how-to',
  };

  return {
    props: {
      // meta tags props
      seo: {
        title: t('seo.title'),
        description: t('seo.description'),
        keywords,
        image,
        locales,
        locale,
        url: ogUrl.en || `/${locale}/how-to`,
        pathConnector: '/how-to',
      },

      // page props
      fallback: false,
      data: arrHowTos.filter((l) => l.lang === currentLang[locale] && (l?.category?.slug === 'how-to' || l?.category?.slug === 'como')).map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
      technologyTags,
      difficulties: difficultiesSorted,
    },
  };
};

export default function HowTo({ data, technologyTags, difficulties }) {
  const { t } = useTranslation('how-to');
  const router = useRouter();
  const { filteredBy, setHowToFilters } = useFilter();
  const iconColor = useColorModeValue('#FFF', '#283340');
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(10);
  const queryExists = Object.keys(router.query).length > 0;

  const howTosFiltered = data.slice(0, offset);
  const howTosSearched = data.filter(
    (howTo) => howTo.title.toLowerCase()
      .includes(router?.query?.search?.toLocaleLowerCase() || false),
  );

  const { technologies, difficulty, videoTutorials } = filteredBy.howToOptions;

  const techsQuery = router.query.techs;
  const difficultyQuery = router.query.difficulty;

  const technologiesActived = technologies.length || techsQuery?.split(',')?.length || 0;
  const difficultyIsActive = () => {
    if (difficultyQuery?.length > 0) return 1;
    if (difficulty !== undefined && difficulty?.length > 0) return 1;
    return 0;
  };

  const currentFilters = technologiesActived
    + difficultyIsActive()
    + videoTutorials;

  let initialSearchValue;
  useEffect(() => {
    initialSearchValue = router.query && router.query.search;
  }, [initialSearchValue]);

  const { isOpen, onClose, onOpen } = useDisclosure();

  const handleScroll = () => {
    const scrollTop = isWindow && document.documentElement.scrollTop;
    const offsetHeight = isWindow && document.documentElement.offsetHeight;
    const innerHeight = isWindow && window.innerHeight;
    if ((innerHeight + scrollTop) <= offsetHeight) return;
    setIsLoading(true);
  };

  useEffect(() => {
    if (!queryExists) {
      if (howTosSearched.length > 0) return () => { };
      if (offset <= data.length) {
        console.log('loading how to\'s...');
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      }
      console.log('All how to\'s loaded');
    }
    return () => { };
  }, [offset, queryExists]);

  useEffect(() => {
    if (!isLoading) return;
    if (offset >= data.length) setIsLoading(false);
    setTimeout(() => {
      setOffset(offset + 10);
      setIsLoading(false);
    }, 200);
  }, [isLoading]);

  const getHowToList = () => {
    if (queryExists) {
      return data;
    }
    if (howTosSearched.length > 0) {
      return howTosSearched;
    }
    return howTosFiltered;
  };

  return (
    <>
      <TitleContent title={t('title')} icon="document" color={iconColor} mobile />
      <Box
        display="grid"
        gridTemplateColumns={{
          base: '.5fr repeat(12, 1fr) .5fr',
          md: '1.5fr repeat(12, 1fr) 1.5fr',
        }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Flex
          gridColumn="2 / span 12"
          justifyContent="space-between"
          flex="1"
          gridGap="20px"
          padding={{ base: '3% 0 4% 0', md: '1.5% 0 1.5% 0' }}
        >
          <TitleContent title={t('title')} icon="document" color={iconColor} mobile={false} />
          <Search placeholder={t('search')} />
          <Button
            variant="outline"
            backgroundColor={useColorModeValue('', 'gray.800')}
            _hover={{ backgroundColor: useColorModeValue('', 'gray.700') }}
            border={currentFilters >= 1 ? 2 : 1}
            onClick={onOpen}
            borderStyle="solid"
            minWidth="125px"
            borderColor={useColorModeValue(
              `${currentFilters >= 1 ? 'blue.default' : '#DADADA'}`,
              'gray.800',
            )}
          >
            <Icon icon="setting" width="20px" height="20px" style={{ minWidth: '20px' }} />
            <Text textTransform="uppercase" pl="10px">
              {currentFilters >= 2 ? t('common:filters') : t('common:filter')}
            </Text>
            {currentFilters >= 1 && (
              <Text
                as="span"
                margin="0 10px"
                textTransform="uppercase"
                display="flex"
                justifyContent="center"
                alignItems="center"
                backgroundColor="blue.default"
                color="white"
                borderRadius="30px"
                minWidth="20px"
                height="20px"
              >
                {currentFilters}
              </Text>
            )}
          </Button>

          <FilterModal
            isModalOpen={isOpen}
            onClose={onClose}
            contextFilter={filteredBy.exercisesOptions}
            setFilter={setHowToFilters}
            technologyTags={technologyTags}
            difficulties={difficulties}
          />
        </Flex>
      </Box>
      <GridContainer margin="30px auto 0 auto">
        {t('description') && (
          <Text
            size="md"
            display="flex"
            margin={{ base: '30px 8%', md: '30px 28%' }}
            textAlign="center"
          >
            {t('description')}
          </Text>
        )}
        <ProjectList
          projects={getHowToList()}
          contextFilter={filteredBy.howToOptions}
          isLoading={isLoading}
          projectPath="how-to"
          exampleImage="/static/images/coding-notebook.png"
        />
      </GridContainer>
    </>
  );
}

HowTo.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
  technologyTags: PropTypes.arrayOf(PropTypes.string),
  difficulties: PropTypes.arrayOf(PropTypes.string),
};

HowTo.defaultProps = {
  data: [],
  technologyTags: [],
  difficulties: [],
};
