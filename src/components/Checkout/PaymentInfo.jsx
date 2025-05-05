import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Box, Button, Flex,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import bc from '../../services/breathecode';
import signupAction from '../../store/actions/signupAction';
import 'react-datepicker/dist/react-datepicker.css';
import useStyle from '../../hooks/useStyle';
import useAuth from '../../hooks/useAuth';
import { reportDatalayer } from '../../utils/requests';
import { getQueryString, getStorageItem, getBrowserInfo } from '../../utils';
import useCohortHandler from '../../hooks/useCohortHandler';
import useSubscriptions from '../../hooks/useSubscriptions';
import { getCohort } from '../../lib/admissions';
import PaymentMethods from './PaymentMethods';
import Icon from '../Icon';
import Text from '../Text';
import useCustomToast from '../../hooks/useCustomToast';

function PaymentInfo({ setShowPaymentDetails }) {
  const { lang } = useTranslation('signup');
  const { reSetUserAndCohorts } = useAuth();
  const { initializeSubscriptionsData, getSubscriptions } = useSubscriptions();

  const {
    state, setIsSubmittingPayment, setPaymentStatus,
  } = signupAction();
  const {
    checkoutData, isSubmittingPayment, paymentStatus,
  } = state;
  const { cohortsAssignments, getCohortsModules, startDay } = useCohortHandler();
  const [readyToRedirect, setReadyToRedirect] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [updatedUser, setUpdatedUser] = useState(undefined);
  const cohortId = Number(getQueryString('cohort'));
  const [readyToRefetch, setReadyToRefetch] = useState(false);
  const [cohortFound, setCohortFound] = useState(undefined);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { createToast } = useCustomToast({ toastId: 'payment-info-data-detail' });
  const redirect = getStorageItem('redirect');
  const redirectedFrom = getStorageItem('redirected-from');
  const router = useRouter();
  const { backgroundColor } = useStyle();

  const isPaymentSuccess = paymentStatus === 'success';
  const isPaymentIdle = paymentStatus === 'idle';
  const paymentStatusBgColor = isPaymentSuccess ? 'green.light' : '#ffefef';

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
    if (!isPaymentSuccess) {
      setPaymentStatus('idle');
      setShowPaymentDetails(true);
      return;
    }
    setIsRedirecting(true);
    const syllabusVersion = cohortFound?.syllabus_version;
    const cohortDashboardLink = `/cohort/${cohortFound?.slug}/${syllabusVersion?.slug}/v${syllabusVersion?.version}`;

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
    }, 1000);

    return () => clearTimeout(timer);
  }, [cohortsAssignments, cohortFound]);

  useEffect(() => {
    if (cohortFound?.micro_cohorts.length === 0) {
      getCohortsModules([cohortFound]);
    }
  }, [updatedUser]);

  useEffect(() => {
    const fetchMyCohorts = async () => {
      try {
        const { userData } = await reSetUserAndCohorts();

        setUpdatedUser(userData);
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
      const dataRequested = await resp.json();
      if (resp.status >= 400) {
        createToast({
          position: 'top',
          title: dataRequested?.detail,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        setReadyToRefetch(false);
      }
      if (dataRequested?.status === 'ACTIVE') {
        setCohortFound(cohort);
      }
    } catch (error) {
      console.error('Error al unirse a la cohorte:', error);
      setIsSubmittingPayment(false);
      setTimeout(() => {
        setReadyToRefetch(false);
      }, 600);
    }
  };

  useEffect(() => {
    reportDatalayer({
      dataLayer: {
        event: 'checkout_payment_info_rendered',
        value: state?.selectedPlanCheckoutData?.price,
        agent: getBrowserInfo(),
      },
    });
  }, []);

  useEffect(() => {
    let interval;
    if (readyToRefetch && timeElapsed < 10 && isPaymentSuccess) {
      interval = setInterval(async () => {
        try {
          const data = await getSubscriptions();

          const subscriptions = (data?.subscriptions
            && data?.plan_financings
            && [...data.subscriptions, ...data.plan_financings]) || [];

          const currentSubscription = subscriptions?.find(
            (subscription) => checkoutData?.plans[0]?.plan_slug === subscription.plans[0]?.slug,
          );
          const isPurchasedPlanFound = subscriptions?.length > 0 && subscriptions.some(
            (subscription) => checkoutData?.plans[0]?.plan_slug === subscription.plans[0]?.slug,
          );
          const cohortsForSubscription = currentSubscription?.selected_cohort_set.cohorts;
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
    if (!isPaymentSuccess) return;
    setIsSubmittingPayment(true);
    setReadyToRefetch(true);
  }, [isPaymentSuccess]);

  return (
    <Box display="flex" height="100%" flexDirection="column" gridGap="30px" margin={{ base: isPaymentSuccess ? '' : '0 1rem', lg: '0 auto' }} position="relative">
      <Box display="flex" width={{ base: 'auto', lg: '490px' }} height="auto" flexDirection="column" minWidth={{ base: 'auto', md: '100%' }} background={!isPaymentIdle ? paymentStatusBgColor : backgroundColor} p={{ base: '20px 0', md: '30px 0' }} borderRadius="15px">
        {!isPaymentIdle ? (
          <Flex flexDirection="column" gridGap="24px" borderRadius="3px" alignItems="center" padding="16px 8px">
            <Icon icon={isPaymentSuccess ? 'feedback-like' : 'feedback-dislike'} width="60px" height="60px" />
            <Text size="14px" fontWeight={700} textAlign="center" color="black">
              {isPaymentSuccess ? 'Payment successful' : 'Payment failed'}
            </Text>
          </Flex>
        ) : (
          <PaymentMethods setShowPaymentDetails={setShowPaymentDetails} />
        )}
      </Box>
      {!isPaymentIdle && (
        <Button
          width="100%"
          height="45px"
          variant="default"
          // mt="12px"
          isDisabled={isPaymentSuccess && (!cohortFound || !readyToRedirect)}
          isLoading={isSubmittingPayment || isRedirecting}
          onClick={startRedirection}
        >
          {isPaymentSuccess ? 'Start learning' : 'Try again'}
        </Button>
      )}
    </Box>
  );
}

PaymentInfo.propTypes = {
  setShowPaymentDetails: PropTypes.func,
};

PaymentInfo.defaultProps = {
  setShowPaymentDetails: () => { },
};

export default PaymentInfo;
