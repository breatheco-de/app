/* eslint-disable no-continue */
import {
  Box, Button, Flex, useColorModeValue, useDisclosure,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import FilterModal from '../../common/components/FilterModal';

import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import useFilter from '../../common/store/actions/filterAction';
import ProjectList from '../../js_modules/projects/ProjectList';
import Search from '../../js_modules/projects/Search';
import TitleContent from '../../js_modules/projects/TitleContent';

export const getStaticProps = async () => {
  const howTos = []; // filtered howTos after removing repeated
  let arrHowTos = []; // incoming howTos
  const data = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?type=ARTICLE`)
    .then((res) => res.json())
    .catch((err) => console.log(err));

  arrHowTos = Object.values(data);
  if (data.status >= 200 && data.status < 400) {
    console.log(`Original Exercises: ${arrHowTos}`);
  } else {
    console.error(`Error fetching howTos with ${data.status}`);
  }

  let technologyTags = [];
  let difficulties = [];

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

  // Verify if difficulty exist in expected position, else fill void array with 'nullString'
  const verifyDifficultyExists = (difficultiesArray, difficulty) => {
    if (difficultiesArray.some((el) => el === difficulty)) {
      return difficulty;
    }
    return 'nullString';
  };

  // Fill common difficulties in expected position
  const difficultiesSorted = [];
  ['beginner', 'easy', 'intermediate', 'hard'].forEach((difficulty) => {
    difficultiesSorted.push(verifyDifficultyExists(difficulties, difficulty));
  });

  return {
    props: {
      fallback: false,
      data,
      technologyTags,
      difficulties: difficultiesSorted,
    },
  };
};

export default function HowTo({ data, technologyTags, difficulties }) {
  const { t } = useTranslation('how-to');
  const router = useRouter();
  const { filteredBy, setHowToFilters } = useFilter();
  const { technologies, difficulty, videoTutorials } = filteredBy.howToOptions;

  const currentFilters = technologies.length
  + (difficulty === undefined || difficulty.length === 0 ? 0 : 1)
  + videoTutorials;

  let initialSearchValue;
  useEffect(() => {
    initialSearchValue = router.query && router.query.search;
  }, [initialSearchValue]);

  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <TitleContent title={t('title')} icon="document" mobile />
      <Flex
        justifyContent="space-between"
        flex="1"
        gridGap="20px"
        padding={{ base: '3% 4% 4% 4%', md: '1.5% 10% 1.5% 10%' }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
      >
        <TitleContent title={t('title')} icon="document" mobile={false} />
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
      <Box flex="1" margin={{ base: '30px 4% 0', md: '30px 10% 0' }}>
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
          projects={data}
          contextFilter={filteredBy.howToOptions}
          projectPath="how-to"
        />
      </Box>
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
