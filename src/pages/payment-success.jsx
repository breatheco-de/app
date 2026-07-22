import { useEffect, useState, useRef } from 'react';
import { Box, Button, Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import Icon from '../components/Icon';
import Text from '../components/Text';
import Heading from '../components/Heading';
import useStyle from '../hooks/useStyle';
import useAuth from '../hooks/useAuth';
import useSubscriptions from '../hooks/useSubscriptions';
import useCohortHandler from '../hooks/useCohortHandler';
import useCustomToast from '../hooks/useCustomToast';
import bc from '../services/breathecode';
import { getCohort } from '../lib/admissions';
import { getBrowserInfo, getStorageItem, setStorageItem } from '../utils';
import { reportDatalayer } from '../utils/requests';
import axiosInstance from '../axios';
import asPrivate from '../context/PrivateRouteWrapper';

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 10;

function PaymentSuccess() {
  const { t, lang } = useTranslation('signup');
  const router = useRouter();
  const { hexColor } = useStyle();
  const { reSetUserAndCohorts } = useAuth();
  const { initializeSubscriptionsData, getSubscriptions } = useSubscriptions();
  const { cohortsAssignments, startDay, getCohortsModules } = useCohortHandler();
  const { createToast } = useCustomToast({ toastId: 'payment-success' });

  const { plan, cohort, subscription_id: subscriptionIdQuery, plan_financing_id: planFinancingIdQuery } = router.query;
  const planSlug = typeof plan === 'string' ? plan : undefined;
  const subscriptionId = typeof subscriptionIdQuery === 'string' ? subscriptionIdQuery : undefined;
  const planFinancingId = typeof planFinancingIdQuery === 'string' ? planFinancingIdQuery : undefined;
  const cohortId = typeof cohort === 'string' ? Number(cohort) : null;

  const [isPolling, setIsPolling] = useState(true);
  const [purchaseFound, setPurchaseFound] = useState(false);
  const [cohortFound, setCohortFound] = useState(undefined);
  const [readyToRedirect, setReadyToRedirect] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const pollAttemptsRef = useRef(0);

  // Mark verify-email as ready so AuthContext can show it after this redirect landing.
  useEffect(() => {
    try {
      const raw = getStorageItem('pendingEmailVerification');
      if (!raw) return;
      const pending = JSON.parse(raw);
      if (!pending?.email || pending.showAfterPayment) return;
      setStorageItem('pendingEmailVerification', JSON.stringify({
        ...pending,
        showAfterPayment: true,
      }));
    } catch (error) {
      // ignore malformed storage
    }
  }, []);

  const redirectToPrograms = () => {
    // After plan checkout, always land on choose-program so the user can enter
    // their cohort. External callback redirects must not interrupt that flow.
    localStorage.removeItem('redirect');
    localStorage.removeItem('redirected-from');
    router.push('/choose-program');
  };

  const findPurchasedItem = (subscriptions, planFinancings) => {
    const allItems = [...(subscriptions || []), ...(planFinancings || [])];
    if (subscriptionId) {
      return allItems.find((item) => String(item.id) === String(subscriptionId));
    }
    if (planFinancingId) {
      return allItems.find((item) => String(item.id) === String(planFinancingId));
    }
    if (planSlug) {
      return allItems.find((item) => item.plans?.[0]?.slug === planSlug);
    }
    return null;
  };

  const joinCohort = async (cohortToJoin) => {
    try {
      reportDatalayer({
        dataLayer: {
          event: 'join_cohort',
          cohort_id: cohortToJoin?.id,
          agent: getBrowserInfo(),
        },
      });
      const resp = await bc.admissions().joinCohort(cohortToJoin?.id);
      if (resp.status >= 400) {
        createToast({
          position: 'top',
          title: resp.data?.detail,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        return false;
      }
      setCohortFound(cohortToJoin);
      return true;
    } catch (error) {
      console.error('Error joining cohort:', error);
      return false;
    }
  };

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
    if (!cohortFound) {
      redirectToPrograms();
      return;
    }
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
    if (!cohortFound || (cohortFound.micro_cohorts?.length === 0 && !(cohortFound.slug in cohortsAssignments))) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setReadyToRedirect(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [cohortsAssignments, cohortFound]);

  useEffect(() => {
    if (cohortFound?.micro_cohorts?.length === 0) {
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
    if (cohortFound) fetchMyCohorts();
  }, [cohortFound]);

  useEffect(() => {
    if (!router.isReady || planSlug) return;
    router.replace('/choose-program');
  }, [router.isReady, planSlug]);

  useEffect(() => {
    if (!router.isReady || !planSlug || purchaseFound || timedOut) return undefined;

    const interval = setInterval(async () => {
      try {
        const data = await getSubscriptions();
        const subscriptions = data?.subscriptions || [];
        const planFinancings = data?.plan_financings || [];
        const purchasedItem = findPurchasedItem(subscriptions, planFinancings);

        if (purchasedItem) {
          setPurchaseFound(true);
          setIsPolling(false);
          await initializeSubscriptionsData();

          if (cohortId) {
            const cohortsForSubscription = purchasedItem?.selected_cohort_set?.cohorts;
            const foundCohort = cohortsForSubscription?.find((c) => c?.id === cohortId);
            if (foundCohort?.id) {
              const fullCohort = await getCohort(foundCohort.id);
              await joinCohort(fullCohort);
            } else {
              redirectToPrograms();
            }
          } else {
            redirectToPrograms();
          }
          clearInterval(interval);
          return;
        }
      } catch (error) {
        console.error('Error polling subscriptions:', error);
      }

      pollAttemptsRef.current += 1;
      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        setIsPolling(false);
        setTimedOut(true);
        clearInterval(interval);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [router.isReady, planSlug, purchaseFound, timedOut, cohortId, subscriptionId, planFinancingId]);

  if (!router.isReady || !planSlug) {
    return null;
  }

  const hasCohortInUrl = Boolean(cohortId);
  const isButtonDisabled = hasCohortInUrl
    ? (!cohortFound || !readyToRedirect)
    : false;
  const isButtonLoading = isPolling || isRedirecting;

  return (
    <Flex flexDirection="column" alignItems="center" paddingTop="4rem" px="1rem" pb="4rem">
      <Flex marginBottom="2rem">
        <Icon icon="4Geeks-avatar" size="290px" background={hexColor.greenLight2} borderRadius="50%" />
      </Flex>
      <Box textAlign="center" mb="2rem" maxW="490px">
        <Heading size="24px" mb="0.5rem">{t('payment-success')}</Heading>
        {isPolling && !purchaseFound && (
          <Text>{t('wait-a-few-seconds')}</Text>
        )}
      </Box>
      <Button
        width="100%"
        maxW="490px"
        height="45px"
        variant="default"
        isDisabled={isButtonDisabled}
        isLoading={isButtonLoading}
        onClick={startRedirection}
      >
        {t('start-free-course')}
      </Button>
    </Flex>
  );
}

export default asPrivate(PaymentSuccess);
