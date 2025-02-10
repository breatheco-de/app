import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import axiosInstance from '../../axios';
import Icon from '../../common/components/Icon';
import { isPlural } from '../../utils';
import { WHITE_LABEL_ACADEMY } from '../../utils/variables';
import Text from '../../common/components/Text';
import bc from '../../common/services/breathecode';
import handlers from '../../common/handlers';
import Programs from './Programs';
import UpgradeAccessModal from '../../common/components/UpgradeAccessModal';
import useProgramList from '../../common/store/actions/programListAction';
import ProgramCard from '../../common/components/ProgramCard';
import Heading from '../../common/components/Heading';
import useStyle from '../../common/hooks/useStyle';

function ChooseProgram({ chooseList, handleChoose, setLateModalProps }) {
  const { t } = useTranslation('choose-program');
  const { programsList } = useProgramList();
  const [marketingCursesList, setMarketingCursesList] = useState([]);
  const [showFinished, setShowFinished] = useState(false);
  const [upgradeModalIsOpen, setUpgradeModalIsOpen] = useState(false);
  const { featuredColor } = useStyle();
  const router = useRouter();
  const cardColumnSize = 'repeat(auto-fill, minmax(17rem, 1fr))';

  const finishedCohorts = handlers.getCohortsFinished(chooseList);
  const activeCohorts = handlers.getActiveCohorts(chooseList).map((cohort) => {
    const { cohort_user: cohortUser } = cohort;
    const currentCohortProps = programsList[cohort.slug];
    return ({
      ...cohort,
      available_as_saas: cohortUser?.role === 'TEACHER' ? false : cohort.available_as_saas,
      cohort_user: { ...cohortUser },
      subscription: currentCohortProps?.subscription,
      plan_financing: currentCohortProps?.plan_financing,
      all_subscriptions: currentCohortProps?.all_subscriptions,
      subscription_exists: currentCohortProps?.subscription !== null || currentCohortProps?.plan_financing !== null,
    });
  });

  const hasNonSaasCourse = chooseList.some((cohort) => !cohort.available_as_saas);

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
            {activeCohorts.map((item) => (
              <Programs
                key={item?.cohort?.slug}
                item={item}
                handleChoose={handleChoose}
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
            {showFinished && finishedCohorts.map((item) => (
              <Programs
                key={item?.cohort?.slug}
                item={item}
                handleChoose={handleChoose}
                onOpenModal={() => setUpgradeModalIsOpen(true)}
              />
            ))}
          </Box>
        </>
      )}
    </>
  );
}

ChooseProgram.propTypes = {
  chooseList: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  handleChoose: PropTypes.func,
  setLateModalProps: PropTypes.func,
};
ChooseProgram.defaultProps = {
  chooseList: [],
  handleChoose: () => {},
  setLateModalProps: () => {},
};

export default ChooseProgram;
