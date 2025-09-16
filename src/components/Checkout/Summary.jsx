import { Box, Button, Flex, useColorModeValue } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Icon from '../Icon';
import Text from '../Text';
import signupAction from '../../store/actions/signupAction';
import bc from '../../services/breathecode';
import { reportDatalayer } from '../../utils/requests';
import { getQueryString, getStorageItem, getBrowserInfo } from '../../utils';
import axiosInstance from '../../axios';
import useCohortHandler from '../../hooks/useCohortHandler';
import useSubscriptions from '../../hooks/useSubscriptions';
import { getCohort } from '../../lib/admissions';
import useCustomToast from '../../hooks/useCustomToast';
import useAuth from '../../hooks/useAuth';

function Summary() {
  const { t, lang } = useTranslation('signup');
  const { reSetUserAndCohorts } = useAuth();
  const { initializeSubscriptionsData, getSubscriptions } = useSubscriptions();
  const { cohortsAssignments, startDay, getCohortsModules } = useCohortHandler();
  const [readyToRedirect, setReadyToRedirect] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const {
    state, setIsSubmittingPayment,
  } = signupAction();
  const { paymentStatus, checkingData, selectedPlan, isSubmittingPayment, declinedPayment } = state;
  const { createToast } = useCustomToast({ toastId: 'payment-request-data-detail-error' });
  const [readyToRefetch, setReadyToRefetch] = useState(false);
  const [cohortFound, setCohortFound] = useState(undefined);
  const redirect = getStorageItem('redirect');
  const redirectedFrom = getStorageItem('redirected-from');
  const router = useRouter();
  const featuredBackground = useColorModeValue('featuredLight', 'featuredDark');
  const cohortId = Number(getQueryString('cohort'));

  const paymentStatusBgColor = paymentStatus === 'success' ? 'green.light' : '#ffefef';
  const successText = selectedPlan?.isFreeTier ? t('plan-is-ready') : t('payment-success');

  useEffect(() => {
    reportDatalayer({
      dataLayer: {
        event: 'checkout_summary',
        plan: checkingData?.plans[0].plan_slug,
        agent: getBrowserInfo(),
      },
    });
  }, []);

  const openSyllabusAndRedirect = () => {
    const langLink = lang !== 'en' ? `/${lang}` : '';

    const modules = cohortsAssignments[cohortFound.slug]?.modules;

    const firstAssigment = modules[0].content[0];
    const firstAssigmentSlug = firstAssigment.slug;
    const firstAssigmentType = firstAssigment.type.toLowerCase();
    const syllabusRedirectURL = `${langLink}/syllabus/${cohortFound?.slug}/${firstAssigmentType}/${firstAssigmentSlug}`;

    const updatedTasks = (modules[0].content || [])?.map((l) => ({
      ...l,
      title: l.title,
      associated_slug: l?.slug?.slug || l.slug,
      description: '',
      task_type: l.task_type,
      cohort: cohortFound.id,
    }));
    reportDatalayer({
      dataLayer: {
        event: 'open_syllabus_module',
        tasks: updatedTasks,
        cohort_id: cohortFound.id,
        agent: getBrowserInfo(),
      },
    });
    startDay({
      cohort: cohortFound,
      newTasks: updatedTasks,
    });

    router.push(syllabusRedirectURL);
  };

  const startRedirection = async () => {
    setIsRedirecting(true);
    const langLink = lang !== 'en' ? `/${lang}` : '';
    const syllabusVersion = cohortFound?.syllabus_version;
    axiosInstance.defaults.headers.common.Academy = cohortFound.academy.id;
    const cohortDashboardLink = `${langLink}/cohort/${cohortFound?.slug}/${syllabusVersion?.slug}/v${syllabusVersion?.version}`;

    if (cohortFound?.micro_cohorts?.length > 0 || !(cohortFound.slug in cohortsAssignments)) {
      router.push(cohortDashboardLink);
      return;
    }

    openSyllabusAndRedirect();
  };

  useEffect(() => {
    if (!cohortFound || (cohortFound.micro_cohorts.length === 0 && !(cohortFound.slug in cohortsAssignments))) return undefined;

    const timer = setTimeout(() => {
      setReadyToRedirect(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [cohortsAssignments, cohortFound]);

  useEffect(() => {
    if (cohortFound?.micro_cohorts.length === 0) {
      getCohortsModules([cohortFound]);
    }
  }, [cohortFound]);

  useEffect(() => {
    const fetchMyCohorts = async () => {
      try {
        await reSetUserAndCohorts();
      } catch (err) {
        console.error('Error fetching my cohorts:', err);
      }
    };
    fetchMyCohorts();
  }, [cohortFound]);

  const joinCohort = async (cohort) => {
    try {
      reportDatalayer({
        dataLayer: {
          event: 'join_cohort',
          cohort_id: cohort?.id,
          agent: getBrowserInfo(),
        },
      });
      const resp = await bc.admissions().joinCohort(cohort?.id);
      const dataRequested = resp.data;
      if (resp.status >= 400) {
        createToast({
          position: 'top',
          title: dataRequested?.detail,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        setReadyToRefetch(false);
      } else {
        setCohortFound(cohort);
      }
    } catch (error) {
      console.error('Error al unirse a la cohorte:', error);
      setTimeout(() => {
        setReadyToRefetch(false);
      }, 600);
    }
  };

  useEffect(() => {
    let interval;
    if (readyToRefetch && timeElapsed < 10 && paymentStatus === 'success') {
      interval = setInterval(async () => {
        try {
          const data = await getSubscriptions();

          const subscriptions = (data?.subscriptions
            && data?.plan_financings
            && [...data.subscriptions, ...data.plan_financings]) || [];

          const currentSubscription = subscriptions?.find(
            (subscription) => checkingData?.plans[0]?.plan_slug === subscription.plans[0]?.slug,
          );
          const isPurchasedPlanFound = subscriptions?.length > 0 && subscriptions.some(
            (subscription) => checkingData?.plans[0]?.plan_slug === subscription.plans[0]?.slug,
          );
          const cohortsForSubscription = currentSubscription?.selected_cohort_set?.cohorts;
          const foundCohort = cohortsForSubscription?.find(
            (cohort) => cohort?.id === cohortId,
          );

          if (isPurchasedPlanFound) {
            if (foundCohort?.id) {
              const cohort = await getCohort(foundCohort?.id);
              joinCohort(cohort);
              initializeSubscriptionsData();

              clearInterval(interval);
              setReadyToRefetch(false);
            } else {
              clearInterval(interval);
              if ((redirect && redirect?.length > 0) || (redirectedFrom && redirectedFrom.length > 0)) {
                router.push(redirect || redirectedFrom);
                localStorage.removeItem('redirect');
                localStorage.removeItem('redirected-from');
              } else {
                router.push('/choose-program');
              }
            }
          }
        } finally {
          setTimeElapsed((prevTime) => prevTime + 1);
        }
      }, 2000);
    } else {
      clearInterval(interval);
      setReadyToRefetch(false);
      setIsSubmittingPayment(false);
      setTimeElapsed(0);
    }
    return () => clearInterval(interval);
  }, [readyToRefetch, timeElapsed]);

  useEffect(() => {
    if (paymentStatus !== 'success') return;
    setIsSubmittingPayment(true);
    setReadyToRefetch(true);
  }, [paymentStatus]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gridGap={paymentStatus === 'idle' && '30px'}
      mb="1rem"
      width={{ base: 'auto', lg: '490px' }}
      margin={{ base: '0 1rem', lg: '0 auto' }}
      gap="14px"
    >
      <Box
        display="flex"
        flexDirection="column"
        background={paymentStatus === 'idle' ? featuredBackground : paymentStatusBgColor}
        w="100%"
        height="fit-content"
        p="11px 14px"
        gridGap="8px"
        borderRadius="14px"
      >
        {paymentStatus !== 'idle' && (
          <Flex flexDirection="column" gridGap="24px" borderRadius="3px" alignItems="center" padding="16px 8px">
            <Icon icon={paymentStatus === 'success' ? 'feedback-like' : 'feedback-dislike'} width="60px" height="60px" />
            <Flex flexDirection="column" gridGap="8px">
              <Text size="16px" fontWeight={700} textAlign="center" color="black">
                {paymentStatus === 'success' ? successText : (declinedPayment.title || t('payment-failed'))}
              </Text>
              {declinedPayment.description && (
                <Text size="14px" fontWeight={400} textAlign="center" color="black">
                  {declinedPayment.description}
                </Text>
              )}
            </Flex>
          </Flex>
        )}
      </Box>
      {paymentStatus !== 'idle' && (
        <Button
          width="100%"
          height="45px"
          variant="default"
          isDisabled={(paymentStatus === 'success' && !cohortFound) || !readyToRedirect}
          isLoading={isSubmittingPayment || isRedirecting}
          onClick={startRedirection}
        >
          {paymentStatus === 'success' ? t('start-free-course') : t('try-again')}
        </Button>
      )}

    </Box>
  );
}

export default Summary;
