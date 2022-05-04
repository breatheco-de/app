/* eslint-disable no-continue */
import {
  Flex, useColorModeValue,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import TitleContent from '../../js_modules/projects/TitleContent';

// export const getStaticPaths = async ({ locales }) => {
//   let content = [];
//   // ?type=ARTICLE&category=how-to
//   const data = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?type=ARTICLE`)
//     .then((res) => res.json())
//     .catch((err) => console.log(err));

//   content = Object.values(data);
//   if (data.status >= 200 && data.status < 400) {
//     data.asset_type = 'article';
//     console.log(`Original content: ${content}`);
//   } else {
//     console.error(`Error fetching content with ${data.status}`);
//   }
//   const paths = content.flatMap((res) => locales.map((locale) => {
//     const localeToUsEs = locale === 'en' ? 'us' : 'es';
//     return ({
//       params: {
//         slug: res.translations[localeToUsEs] || res.slug,
//       },
//       locale,
//     });
//   }));

//   return {
//     fallback: false,
//     paths,
//   };
// };

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

export default function HowToSlug({ data }) {
  console.log(`HowToSlug: ${data}`);
  const { t } = useTranslation('how-to');

  return (
    <>
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
        {/* <Search placeholder={t('search')} /> */}

      </Flex>
    </>
  );
}

HowToSlug.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};
