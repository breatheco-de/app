import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import axiosInstance from '../../axios';
import Icon from '../Icon';
import { isPlural, getBrowserInfo } from '../../utils';
import { WHITE_LABEL_ACADEMY } from '../../utils/variables';
import { getActiveCohorts, getCohortsFinished } from '../../utils/cohorts';
import { reportDatalayer } from '../../utils/requests';
import Text from '../Text';
import bc from '../../services/breathecode';
import Program from './Program';
import UpgradeAccessModal from '../UpgradeAccessModal';
import ProgramCard from '../ProgramCard';
import Heading from '../Heading';
import { SimpleSkeleton } from '../Skeleton';
import useStyle from '../../hooks/useStyle';
import useAuth from '../../hooks/useAuth';
import useSubscriptions from '../../hooks/useSubscriptions';
import useCohortHandler from '../../hooks/useCohortHandler';
import useCustomToast from '../../hooks/useCustomToast';

const INVALID_SUBSCRIPTION_STATUSES = ['EXPIRED', 'ERROR', 'PAYMENT_ISSUE'];
const JOIN_REFETCH_ATTEMPTS = 10;
const JOIN_REFETCH_DELAY_MS = 1500;

const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

const isSubscriptionValid = (subscription, now) => {
  const status = subscription?.status;
  if (!status || INVALID_SUBSCRIPTION_STATUSES.includes(status)) return false;

  const expiresAt = subscription.plan_expires_at || subscription.valid_until;
  if (expiresAt && new Date(expiresAt) <= now) return false;
  if (status !== 'CANCELLED') return true;

  const validUntil = subscription.valid_until || subscription.next_payment_at || subscription.plan_expires_at;
  return Boolean(validUntil) && new Date(validUntil) > now;
};

function ProgramsDashboard({
  cohorts, setLateModalProps, onLoadFinished,
}) {
  const { t } = useTranslation('choose-program');
  const [planCoursesList, setPlanCoursesList] = useState([]);
  const [joiningCohortId, setJoiningCohortId] = useState(null);
  const [showFinished, setShowFinished] = useState(false);
  const [finishedReady, setFinishedReady] = useState(false);
  const [upgradeModalIsOpen, setUpgradeModalIsOpen] = useState(false);
  const { featuredColor, backgroundColor } = useStyle();
  const { cohorts: allUserCohorts, reSetUserAndCohorts } = useAuth();
  const { state: subscriptionsState } = useSubscriptions();
  const { setCohortSession } = useCohortHandler();
  const { createToast } = useCustomToast({ toastId: 'join-plan-cohort' });
  const router = useRouter();
  const cardColumnSize = 'repeat(auto-fill, minmax(17rem, 1fr))';

  const finishedCohorts = getCohortsFinished(cohorts);
  const activeCohorts = getActiveCohorts(cohorts);

  const { isLoading: subscriptionsLoading, subscriptions } = subscriptionsState;

  const pendingPlanCohortIds = useMemo(() => {
    const now = new Date();
    const userCohortIds = new Set((allUserCohorts || []).map((cohort) => cohort?.id));
    const ids = new Set();

    [
      ...(subscriptions?.subscriptions || []),
      ...(subscriptions?.plan_financings || []),
    ]
      .filter((subscription) => isSubscriptionValid(subscription, now))
      .forEach((subscription) => {
        subscription?.selected_cohort_set?.cohorts?.forEach((cohort) => {
          if (cohort?.id && !userCohortIds.has(cohort.id)) ids.add(cohort.id);
        });
      });

    return ids;
  }, [subscriptions, allUserCohorts]);

  const planCourses = useMemo(() => planCoursesList.filter(
    (item) => item?.cohort?.id
      && pendingPlanCohortIds.has(item.cohort.id)
      && item?.course_translation?.title,
  ), [planCoursesList, pendingPlanCohortIds]);

  useEffect(() => {
    axiosInstance.defaults.headers.common['Accept-Language'] = router.locale;
  }, [router.locale]);

  const hasPendingPlanCohorts = subscriptionsLoading === false && pendingPlanCohortIds.size > 0;

  const loadPlanCourses = async () => {
    try {
      const { data } = await bc.marketing({ academy: WHITE_LABEL_ACADEMY }).courses();
      setPlanCoursesList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[choose-program] loadPlanCourses error', error);
      setPlanCoursesList([]);
    }
  };

  useEffect(() => {
    if (hasPendingPlanCohorts) loadPlanCourses();
  }, [hasPendingPlanCohorts, router?.locale]);

  const waitForJoinedCohort = async (cohortId, attempts = JOIN_REFETCH_ATTEMPTS) => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      // eslint-disable-next-line no-await-in-loop
      const { cohorts: userCohorts } = await reSetUserAndCohorts();
      const joined = userCohorts?.find((cohort) => cohort?.id === cohortId);
      if (joined) return joined;
      // eslint-disable-next-line no-await-in-loop
      if (attempt < attempts - 1) await wait(JOIN_REFETCH_DELAY_MS);
    }
    return null;
  };

  const enterCohort = (cohort) => {
    axiosInstance.defaults.headers.common.Academy = cohort.academy.id;
    setCohortSession(cohort);
    router.push(cohort.selectedProgramSlug);
  };

  const showJoinError = (data) => {
    createToast({
      position: 'top',
      title: data?.detail || t('join-program-error'),
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const joinPlanCohort = async (course) => {
    const cohortId = course?.cohort?.id;
    if (!cohortId || joiningCohortId) return;

    setJoiningCohortId(cohortId);
    try {
      reportDatalayer({
        dataLayer: {
          event: 'join_cohort',
          cohort_id: cohortId,
          agent: getBrowserInfo(),
        },
      });

      let joinFailedData = null;
      try {
        const resp = await bc.admissions().joinCohort(cohortId);
        if (resp?.status >= 400) joinFailedData = resp?.data || {};
      } catch (error) {
        joinFailedData = error?.response?.data || {};
      }

      if (joinFailedData) {
        const existingCohort = await waitForJoinedCohort(cohortId, 1);
        if (existingCohort) {
          enterCohort(existingCohort);
          return;
        }
        showJoinError(joinFailedData);
        setJoiningCohortId(null);
        return;
      }

      const joinedCohort = await waitForJoinedCohort(cohortId);
      if (!joinedCohort) {
        createToast({
          position: 'top',
          title: t('join-program-pending'),
          status: 'info',
          duration: 8000,
          isClosable: true,
        });
        setJoiningCohortId(null);
        return;
      }

      enterCohort(joinedCohort);
    } catch (error) {
      console.error('[choose-program] joinPlanCohort error', error);
      showJoinError(error?.response?.data);
      setJoiningCohortId(null);
    }
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
              onClick={() => {
                const nextShowFinished = !showFinished;
                setShowFinished(nextShowFinished);
                if (nextShowFinished && !finishedReady) {
                  Promise.resolve(onLoadFinished())
                    .then(() => setFinishedReady(true))
                    .catch(() => {});
                }
              }}
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
            {showFinished && (!finishedReady
              ? finishedCohorts.map((cohort) => (
                <SimpleSkeleton
                  key={`finished-skeleton-${cohort?.slug}`}
                  width="100%"
                  height="286px"
                  borderRadius="17px"
                />
              ))
              : finishedCohorts.map((cohort) => (
                <Program
                  key={cohort?.slug}
                  cohort={cohort}
                  onOpenModal={() => setUpgradeModalIsOpen(true)}
                />
              )))}
          </Box>
        </>
      )}
      {hasPendingPlanCohorts && planCourses.length > 0 && (
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
            {planCourses.map((item) => (
              <ProgramCard
                key={item?.slug}
                isMarketingCourse
                icon="coding"
                iconLink={item?.icon_url}
                iconBackground="blue.default"
                handleChoose={() => joinPlanCohort(item)}
                isLoadingPageContent={joiningCohortId === item?.cohort?.id}
                marketingButtonText={t('join-program')}
                programName={item?.course_translation.title}
                programDescription={item?.course_translation?.description}
                bullets={item?.course_translation?.course_modules}
                width="100%"
                background={featuredColor}
                bulletsBackground={backgroundColor}
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
  onLoadFinished: PropTypes.func,
};
ProgramsDashboard.defaultProps = {
  cohorts: [],
  setLateModalProps: () => {},
  onLoadFinished: () => {},
};

export default ProgramsDashboard;
