import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import axiosInstance from '../../axios';
import Icon from '../../common/components/Icon';
import { isPlural } from '../../utils';
import Text from '../../common/components/Text';
import bc from '../../common/services/breathecode';
import useOnline from '../../common/hooks/useOnline';
import handlers from '../../common/handlers';
import Programs from './Programs';
import UpgradeAccessModal from '../../common/components/UpgradeAccessModal';
import useProgramList from '../../common/store/actions/programListAction';
import ProgramCard from '../../common/components/ProgramCard';
import Heading from '../../common/components/Heading';

function ChooseProgram({ chooseList, handleChoose }) {
  const { t } = useTranslation('choose-program');
  const { usersConnected } = useOnline();
  const { programsList } = useProgramList();
  const [marketingCursesList, setMarketingCursesList] = useState([]);
  const [showFinished, setShowFinished] = useState(false);
  const [upgradeModalIsOpen, setUpgradeModalIsOpen] = useState(false);
  const activeCohorts = handlers.getActiveCohorts(chooseList);
  const finishedCohorts = handlers.getCohortsFinished(chooseList);
  const router = useRouter();

  useEffect(() => {
    axiosInstance.defaults.headers.common['Accept-Language'] = router.locale;
  }, [router.locale]);

  useEffect(() => {
    bc.payment().courses()
      .then(({ data }) => {
        setMarketingCursesList(data);
      });
  }, [router?.locale]);

  const activeSubscriptionCohorts = activeCohorts.filter((item) => {
    const cohort = item?.cohort;
    const currentCohortProps = programsList[cohort.slug];
    const subscriptionExists = currentCohortProps?.subscription !== null || currentCohortProps?.plan_financing !== null;

    return ((cohort?.available_as_saas && subscriptionExists) || cohort?.available_as_saas === false);
  });

  const marketingCouses = marketingCursesList && activeSubscriptionCohorts.length > 0 && marketingCursesList.filter(
    (item) => !activeSubscriptionCohorts.some(
      (activeCohort) => activeCohort?.cohort?.syllabus_version?.slug === item?.slug,
    ),
  );

  return (
    <>
      <UpgradeAccessModal
        isOpen={upgradeModalIsOpen}
        onClose={() => setUpgradeModalIsOpen(false)}
      />
      {activeSubscriptionCohorts.length > 0 && (
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(15rem, 1fr))"
          height="auto"
          gridGap="4rem"
        >
          {activeSubscriptionCohorts.map((item) => (
            <Programs
              key={item?.cohort?.slug}
              item={item}
              handleChoose={handleChoose}
              usersConnected={usersConnected}
              onOpenModal={() => setUpgradeModalIsOpen(true)}
            />
          ))}
        </Box>
      )}

      {marketingCouses.length > 0 && marketingCouses.some((l) => l?.course_translation?.title) && (
        <>
          <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} margin="5rem  0 3rem 0" alignItems="center" gridGap={{ base: '4px', md: '1rem' }}>
            <Heading size="sm" width="fit-content" whiteSpace="nowrap">
              {t('more-courses')}
            </Heading>
            <Box as="hr" width="100%" margin="0.5rem 0 0 0" />
          </Box>
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(15rem, 1fr))"
            height="auto"
            gridGap="4rem"
          >
            {marketingCouses.map((item) => item?.course_translation?.title && (
              <Box>
                <ProgramCard
                  isMarketingCourse
                  icon="coding"
                  iconLink={item?.icon_url}
                  iconBackground="blue.default"
                  handleChoose={() => router.push(`/signup?plan=${item?.slug}`)}
                  programName={item?.course_translation.title}
                  programDescription={item?.course_translation?.description}
                  width="100%"
                />
              </Box>
            ))}
          </Box>
        </>
      )}

      {
        finishedCohorts.length > 0 && (
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
              gridTemplateColumns="repeat(auto-fill, minmax(14rem, 1fr))"
              gridColumnGap="5rem"
              gridRowGap="3rem"
              height="auto"
            >
              {showFinished && finishedCohorts.map((item) => (
                <Programs
                  key={item?.cohort?.slug}
                  item={item}
                  handleChoose={handleChoose}
                  usersConnected={usersConnected}
                  onOpenModal={() => setUpgradeModalIsOpen(true)}
                />
              ))}
            </Box>
          </>
        )
      }
    </>
  );
}

ChooseProgram.propTypes = {
  chooseList: PropTypes.arrayOf(PropTypes.object),
  handleChoose: PropTypes.func,
};
ChooseProgram.defaultProps = {
  chooseList: [],
  handleChoose: () => {},
};

export default ChooseProgram;
