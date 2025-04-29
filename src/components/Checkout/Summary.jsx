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
import { SILENT_CODE } from '../../utils/variables';
import axiosInstance from '../../axios';
import useCohortHandler from '../../hooks/useCohortHandler';
import useSubscriptions from '../../hooks/useSubscriptions';
import { getCohort } from '../../lib/admissions';
import useCustomToast from '../../hooks/useCustomToast';
import useSignup from '../../hooks/useSignup';

function Summary() {
  const { t, lang } = useTranslation('signup');
  const { getSubscriptions } = useSubscriptions();
  const { cohortsAssignments, startDay, getCohortsModules } = useCohortHandler();
  const [readyToRedirect, setReadyToRedirect] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [updatedUser, setUpdatedUser] = useState(undefined);
  const [hasMounted, setHasMounted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const {
    state, setSelectedPlanCheckoutData, setLoader,
  } = signupAction();
  const { handlePayment } = useSignup();
  const { checkoutData, selectedPlanCheckoutData } = state;
  const { createToast } = useCustomToast({ toastId: 'payment-request-data-detail-error' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readyToRefetch, setReadyToRefetch] = useState(false);
  const [declinedPaymentProps, setDeclinedPaymentProps] = useState({
    title: '',
    description: '',
  });
  const [cohortFound, setCohortFound] = useState(undefined);
  const redirect = getStorageItem('redirect');
  const redirectedFrom = getStorageItem('redirected-from');
  const router = useRouter();
  const featuredBackground = useColorModeValue('featuredLight', 'featuredDark');
  const planId = getQueryString('plan_id');
  const cohortId = Number(getQueryString('cohort'));

  const isPaymentIdle = paymentStatus === 'idle';
  const isPaymentSuccess = paymentStatus === 'success';
  const paymentStatusBgColor = isPaymentSuccess ? 'green.light' : '#ffefef';
  const successText = selectedPlanCheckoutData?.isFreeTier ? t('plan-is-ready') : t('payment-success');

  useEffect(() => {
    reportDatalayer({
      dataLayer: {
        event: 'checkout_summary',
        plan: checkoutData?.plans[0].plan_slug,
        agent: getBrowserInfo(),
      },
    });
  }, []);

  const openSyllabusAndRedirect = () => {
    const langLink = lang !== 'en' ? `/${lang}` : '';

    const modules = cohortsAssignments[cohortFound.slug]?.modules;

    const firstAssigmentSlug = modules[0].content[0].slug;
    const firstAssigmentType = modules[0].content[0].type.toLowerCase();
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
  }, [updatedUser]);

  useEffect(() => {
    const fetchMyCohorts = async () => {
      try {
        const resp = await bc.admissions().me();
        const data = resp?.data;

        setUpdatedUser(data);
      } catch (err) {
        console.error('Error fetching my cohorts:', err);
      }
    };
    fetchMyCohorts();
  }, [cohortFound]);

  const joinCohort = (cohort) => {
    reportDatalayer({
      dataLayer: {
        event: 'join_cohort',
        cohort_id: cohort?.id,
        agent: getBrowserInfo(),
      },
    });
    bc.admissions().joinCohort(cohort?.id)
      .then(async (resp) => {
        const dataRequested = await resp.json();
        if (resp.status >= 400) {
          createToast({
            position: 'top',
            title: dataRequested?.detail,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          setReadyToRefetch(false);
        }
        if (dataRequested?.id) {
          setCohortFound(cohort);
        }
      })
      .catch((error) => {
        console.log(error);
        setTimeout(() => {
          setReadyToRefetch(false);
        }, 600);
      });
  };

  useEffect(() => {
    let interval;
    if (readyToRefetch && timeElapsed < 10) {
      interval = setInterval(() => {
        getSubscriptions()
          .then((data) => {
            const subscriptions = (data?.subscriptions
              && data?.plan_financings
              && [...data.subscriptions, ...data.plan_financings]) || [];

            const currentSubscription = subscriptions?.find(
              (subscription) => checkoutData?.plans[0].plan_slug === subscription.plans[0]?.slug,
            );
            const isPurchasedPlanFound = subscriptions?.length > 0 && subscriptions.some(
              (subscription) => checkoutData?.plans[0].plan_slug === subscription.plans[0]?.slug,
            );
            const cohortsForSubscription = currentSubscription?.selected_cohort_set.cohorts;
            const findedCohort = cohortsForSubscription?.length > 0 ? cohortsForSubscription.find(
              (cohort) => cohort?.id === cohortId,
            ) : {};

            if (isPurchasedPlanFound) {
              if (findedCohort?.id) {
                getCohort(findedCohort?.id)
                  .then((cohort) => {
                    joinCohort(cohort);
                  })
                  .finally(() => {
                    clearInterval(interval);
                    setReadyToRefetch(false);
                  });
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
          })
          .finally(() => {
            setTimeElapsed((prevTime) => prevTime + 1);
          });
      }, 2000);
    } else {
      clearInterval(interval);
      setReadyToRefetch(false);
      setIsSubmitting(false);
      setTimeElapsed(0);
    }
    return () => clearInterval(interval);
  }, [readyToRefetch, timeElapsed]);

  useEffect(() => {
    if (!isPaymentSuccess) return;
    setIsSubmitting(true);
    setReadyToRefetch(true);
  }, [isPaymentSuccess]);

  const handleSubmit = () => {
    if (!isPaymentIdle || isSubmitting || !selectedPlanCheckoutData?.plan_id) return;
    setIsSubmitting(true);

    handlePayment({
      ...checkoutData,
      installments: selectedPlanCheckoutData?.how_many_months,
    }, true)
      .then((respPayment) => {
        setIsSubmitting(false);
        setTimeout(() => {
          setLoader('plan', false);
        }, 1000);
        if (respPayment?.status_code >= 400) {
          setPaymentStatus('error');
          setDeclinedPaymentProps({
            title: t('transaction-denied'),
            description: t('payment-not-processed'),
          });
        }
        const silentCode = respPayment?.silent_code;
        if (silentCode) {
          setReadyToRefetch(false);

          if (silentCode === SILENT_CODE.CARD_ERROR) {
            setPaymentStatus('error');
            setDeclinedPaymentProps({
              title: t('transaction-denied'),
              description: t('card-declined'),
            });
          }
          if (SILENT_CODE.LIST_PROCESSING_ERRORS.includes(silentCode)) {
            setPaymentStatus('error');
            setDeclinedPaymentProps({
              title: t('transaction-denied'),
              description: t('payment-not-processed'),
            });
          }
          if (silentCode === SILENT_CODE.UNEXPECTED_EXCEPTION) {
            setPaymentStatus('error');
            setDeclinedPaymentProps({
              title: t('transaction-denied'),
              description: t('payment-error'),
            });
          }
        }
        if (respPayment.status === 'FULFILLED') {
          setPaymentStatus('success');
          setSelectedPlanCheckoutData({
            ...selectedPlanCheckoutData,
            payment_success: true,
          });
        }
      })
      .catch(() => {
        setLoader('plan', false);
        createToast({
          position: 'top',
          title: t('alert-message:payment-error'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (checkoutData && hasMounted) {
      console.log('acaaaaaa');
      const planFound = checkoutData?.plans?.find((plan) => plan?.plan_id === planId) || checkoutData?.plans?.[0];
      if (planFound) {
        handleSubmit();
      }
    }
  }, [hasMounted]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gridGap={isPaymentIdle && '30px'}
      mb="1rem"
      width={{ base: 'auto', lg: '490px' }}
      margin={{ base: '0 1rem', lg: '0 auto' }}
      gap="14px"
    >
      <Box
        display="flex"
        flexDirection="column"
        background={!isPaymentIdle ? paymentStatusBgColor : featuredBackground}
        w="100%"
        height="fit-content"
        p="11px 14px"
        gridGap="8px"
        borderRadius="14px"
      >
        {!isPaymentIdle && (
          <Flex flexDirection="column" gridGap="24px" borderRadius="3px" alignItems="center" padding="16px 8px">
            <Icon icon={isPaymentSuccess ? 'feedback-like' : 'feedback-dislike'} width="60px" height="60px" />
            <Flex flexDirection="column" gridGap="8px">
              <Text size="16px" fontWeight={700} textAlign="center" color="black">
                {isPaymentSuccess ? successText : (declinedPaymentProps.title || t('payment-failed'))}
              </Text>
              {declinedPaymentProps.description && (
                <Text size="14px" fontWeight={400} textAlign="center" color="black">
                  {declinedPaymentProps.description}
                </Text>
              )}
            </Flex>
          </Flex>
        )}
      </Box>
      {!isPaymentIdle && (
        <Button
          width="100%"
          height="45px"
          variant="default"
          isDisabled={(isPaymentSuccess && !cohortFound) || !readyToRedirect}
          isLoading={isSubmitting || isRedirecting}
          onClick={startRedirection}
        >
          {isPaymentSuccess ? t('start-free-course') : t('try-again')}
        </Button>
      )}

    </Box>
  );
}

export default Summary;
