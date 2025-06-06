/* eslint-disable no-param-reassign */
import { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import bc from '../../../services/breathecode';
import { processRelatedAssignments } from '../../../utils/cohorts';
import GridContainer from '../../../components/GridContainer';
import { MDSkeleton } from '../../../components/Skeleton';
import { WHITE_LABEL_ACADEMY } from '../../../utils/variables';
import { isWindow } from '../../../utils';

const redirectLang = {
  es: '/es/',
  en: '/',
};

const langsDict = {
  es: 'es',
  en: 'us',
  us: 'us',
};

const formatSyllabus = (syllabus) => syllabus.json.days.filter((assignment) => {
  const {
    lessons, replits, assignments, quizzes,
  } = assignment;
  if (lessons.length > 0 || replits.length > 0 || assignments.length > 0 || quizzes.length > 0) return true;
  return false;
}).map((assignment) => {
  const {
    id, label,
  } = assignment;
  const nestedAssignments = processRelatedAssignments(assignment);

  const myModule = {
    id,
    label,
    assets: nestedAssignments.content,
  };
  return myModule;
});

export const getStaticPaths = async ({ locales }) => {
  const { data } = await bc.admissions({ is_documentation: 'True', version: 1, academy: WHITE_LABEL_ACADEMY }).getPublicSyllabusVersion();
  const paths = data.flatMap((res) => locales.map((locale) => ({
    params: {
      syllabusSlug: res.slug,
    },
    locale,
  })));

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params, locale }) => {
  const { syllabusSlug } = params;

  try {
    const result = await bc.admissions({ is_documentation: 'True', version: 1, academy: WHITE_LABEL_ACADEMY, slug: syllabusSlug }).getPublicSyllabusVersion();
    const syllabus = result.data.find((syll) => syll.slug === syllabusSlug);
    if (!syllabus) throw new Error('syllabus not found');

    const moduleData = formatSyllabus(syllabus);

    //serialize moduleData removing undefined values
    moduleData.forEach((moduleSyllabus) => {
      moduleSyllabus.assets.forEach((mod) => {
        Object.keys(mod).forEach((key) => {
          if (mod[key] === undefined) mod[key] = null;
        });
      });
    });

    return {
      props: {
        syllabusData: syllabus,
        moduleMap: moduleData,
      },
    };
  } catch (error) {
    console.error(`Error fetching page for /${locale}/docs/${syllabusSlug}`, error);
    return {
      notFound: true,
    };
  }
};

function Docs({ moduleMap }) {
  const { lang } = useTranslation('docs');
  const router = useRouter();
  const { syllabusSlug } = router.query;

  useEffect(() => {
    if (isWindow) {
      const defaultAsset = moduleMap[0]?.assets[0]?.translations[langsDict[lang]].slug || moduleMap[0]?.assets[0]?.slug;
      window.location.href = `${redirectLang[lang]}docs/${syllabusSlug}/${defaultAsset}`;
    }
  }, []);

  return (
    <GridContainer
      maxWidth="1228px"
      margin="28px auto 0 auto"
      height="100%"
      gridTemplateColumns="4fr repeat(12, 1fr)"
      gridGap="36px"
      padding="0 10px"
    >
      <MDSkeleton />
      <Box gridColumn="2 / span 12" maxWidth="854px">
        <MDSkeleton />
      </Box>
    </GridContainer>

  );
}

Docs.propTypes = {
  moduleMap: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default Docs;
