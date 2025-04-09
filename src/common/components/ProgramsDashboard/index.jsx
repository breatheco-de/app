import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import axiosInstance from '../../../axios';
import Icon from '../Icon';
import { isPlural } from '../../../utils';
import { WHITE_LABEL_ACADEMY } from '../../../utils/variables';
import Text from '../Text';
import bc from '../../../services/breathecode';
import handlers from '../../../handlers';
import Program from './Program';
import UpgradeAccessModal from '../UpgradeAccessModal';
import ProgramCard from '../ProgramCard';
import Heading from '../Heading';
import useStyle from '../../hooks/useStyle';

function ProgramsDashboard({ cohorts, setLateModalProps }) {
  const { t } = useTranslation('choose-program');
  const [marketingCursesList, setMarketingCursesList] = useState([]);
  const [showFinished, setShowFinished] = useState(false);
  const [upgradeModalIsOpen, setUpgradeModalIsOpen] = useState(false);
  const { featuredColor } = useStyle();
  const router = useRouter();
  const cardColumnSize = 'repeat(auto-fill, minmax(17rem, 1fr))';

  const finishedCohorts = handlers.getCohortsFinished(cohorts);
  const activeCohorts = handlers.getActiveCohorts(cohorts);

  const hasNonSaasCourse = cohorts.some((cohort) => !cohort.available_as_saas || cohort.cohort_user.role === 'TEACHER');

  const marketingCourses = marketingCursesList.filter(
    (item) => !activeCohorts.some(
      (cohort) => cohort.slug === item?.cohort?.slug,
    ) && item?.course_translation?.title,
  );

  useEffect(() => {
    axiosInstance.defaults.headers.common['Accept-Language'] = router.locale;
  }, [router.locale]);

  useEffect(() => {
    bc.marketing({ academy: WHITE_LABEL_ACADEMY }).courses()
      .then(({ data }) => {
        setMarketingCursesList(data);
      });
  }, [router?.locale]);

  const filterForNonSaasStudents = (course) => {
    if (!hasNonSaasCourse) return true;

    return course.plan_slug === process.env.BASE_PLAN;
  };

  return (
    <>
      {activeCohorts.length > 0 && (
        <>
          <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} margin="5rem  0 3rem 0" alignItems="center" gridGap={{ base: '4px', md: '1rem' }}>
            <Heading size="sm" width="fit-content" whiteSpace="nowrap">
              {t('your-active-programs')}
            </Heading>
            <Box as="hr" width="100%" margin="0.5rem 0 0 0" />
          </Box>
          <Box
            display="grid"
            gridTemplateColumns={{ base: activeCohorts.length > 1 ? cardColumnSize : '', md: cardColumnSize }}
            height="auto"
            gridGap="4rem"
          >
            {activeCohorts.map((cohort) => (
              <Program
                key={cohort?.slug}
                cohort={cohort}
                onOpenModal={() => setUpgradeModalIsOpen(true)}
                setLateModalProps={setLateModalProps}
              />
            ))}
          </Box>
        </>
      )}
      <UpgradeAccessModal
        isOpen={upgradeModalIsOpen}
        onClose={() => setUpgradeModalIsOpen(false)}
      />
      {finishedCohorts.length > 0 && (
        <>
          <Box
            display="flex"
            margin="2rem auto"
            flexDirection={{ base: 'column', md: 'row' }}
            gridGap={{ base: '0', md: '6px' }}
            justifyContent="center"
          >
            <Text
              size="md"
            >
              {isPlural(finishedCohorts)
                ? t('finished.plural', { finishedCohorts: finishedCohorts.length })
                : t('finished.singular', { finishedCohorts: finishedCohorts.length })}
            </Text>
            <Text
              as="button"
              alignSelf="center"
              size="md"
              fontWeight="bold"
              textAlign="left"
              gridGap="10px"
              _focus={{
                boxShadow: '0 0 0 3px rgb(66 153 225 / 60%)',
              }}
              color="blue.default"
              display="flex"
              alignItems="center"
              onClick={() => setShowFinished(!showFinished)}
            >
              {showFinished ? t('finished.hide') : t('finished.show')}
              <Icon
                icon="arrowDown"
                width="20px"
                height="20px"
                style={{ transform: showFinished ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </Text>
          </Box>
          <Box
            display="grid"
            mt="1rem"
            gridTemplateColumns={cardColumnSize}
            gridColumnGap="5rem"
            gridRowGap="3rem"
            height="auto"
          >
            {showFinished && finishedCohorts.map((cohort) => (
              <Program
                key={cohort?.slug}
                cohort={cohort}
                onOpenModal={() => setUpgradeModalIsOpen(true)}
              />
            ))}
          </Box>
        </>
      )}
      {marketingCourses?.length > 0 && (
        <>
          <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} margin="5rem  0 3rem 0" alignItems="center" gridGap={{ base: '4px', md: '1rem' }}>
            <Heading size="sm" width="fit-content" whiteSpace="nowrap">
              {t('available-programs')}
            </Heading>
            <Box as="hr" width="100%" margin="0.5rem 0 0 0" />
          </Box>
          <Box
            display="grid"
            gridTemplateColumns={cardColumnSize}
            height="auto"
            gridGap="4rem"
          >
            {marketingCourses.filter(filterForNonSaasStudents).map((item) => (
              <ProgramCard
                isMarketingCourse
                icon="coding"
                iconLink={item?.icon_url}
                iconBackground="blue.default"
                handleChoose={() => router.push(item?.course_translation?.landing_url)}
                programName={item?.course_translation.title}
                programDescription={item?.course_translation?.description}
                bullets={item?.course_translation?.course_modules}
                width="100%"
                background={featuredColor}
              />
            ))}
          </Box>
        </>
      )}
    </>
  );
}

ProgramsDashboard.propTypes = {
  cohorts: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  setLateModalProps: PropTypes.func,
};
ProgramsDashboard.defaultProps = {
  cohorts: [],
  setLateModalProps: () => {},
};

export default ProgramsDashboard;
