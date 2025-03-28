/* eslint-disable camelcase */
/* eslint-disable no-restricted-globals */
import { Box, Button, Flex, useColorModeValue, useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { Fragment, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import useStyle from '../../common/hooks/useStyle';
import useSignup from '../../common/store/actions/signupAction';
import bc from '../../common/services/breathecode';
import { reportDatalayer } from '../../utils/requests';
import { getQueryString, getStorageItem, toCapitalize, unSlugify, getBrowserInfo } from '../../utils';
import { getAllMySubscriptions } from '../../common/handlers/subscriptions';
import { SILENT_CODE } from '../../lib/types';
import axiosInstance from '../../axios';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import { getCohort } from '../../common/handlers/cohorts';

function Summary() {
  const { t, lang } = useTranslation('signup');
  const { cohortsAssignments, startDay, setCohortSession, getCohortsModules } = useCohortHandler();
  const [readyToRedirect, setReadyToRedirect] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [updatedUser, setUpdatedUser] = useState(undefined);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const {
    state, nextStep, setSelectedPlanCheckoutData, handlePayment, getPaymentText,
    setLoader,
  } = useSignup();
  const [hasMounted, setHasMounted] = useState(false);
  const { dateProps, checkoutData, selectedPlanCheckoutData, planProps } = state;
  const toast = useToast();
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
  const { query } = router;
  const { mentorship_service_slug, event_service_slug } = query;
  const featuredBackground = useColorModeValue('featuredLight', 'featuredDark');
  const { backgroundColor, borderColor, lightColor, hexColor } = useStyle();
  const planId = getQueryString('plan_id');
  const cohortId = Number(getQueryString('cohort'));
  const findedPlan = checkoutData?.plans?.length === 1
    ? checkoutData?.plans[0]
    : checkoutData?.plans?.find((plan) => plan?.plan_id === planId);
  const isNotTrial = !['FREE', 'TRIAL'].includes(selectedPlanCheckoutData?.type);
  const isPaymentIdle = paymentStatus === 'idle';
  const isPaymentSuccess = paymentStatus === 'success';
  const paymentStatusBgColor = isPaymentSuccess ? 'green.light' : '#ffefef';
  const successText = selectedPlanCheckoutData?.isFreeTier ? t('plan-is-ready') : t('payment-success');
  const periodText = {
    ONE_TIME: '',
    FREE: t('totally_free'),
    WEEK: t('info.trial-week'),
    MONTH: t('info.monthly'),
    QUARTER: t('info.quarterly'),
    HALF: t('info.half-yearly'),
    YEAR: t('info.yearly'),
    FINANCING: t('info.financing'),
  };

  const getPrice = () => {
    if (isNotTrial) {
      if (selectedPlanCheckoutData?.financing_options?.length > 0 && selectedPlanCheckoutData?.financing_options[0]?.monthly_price > 0) return selectedPlanCheckoutData?.financing_options[0]?.monthly_price;
      if (checkoutData?.amount_per_half > 0) return checkoutData?.amount_per_half;
      if (checkoutData?.amount_per_month > 0) return checkoutData?.amount_per_month;
      if (checkoutData?.amount_per_quarter > 0) return checkoutData?.amount_per_quarter;
      if (checkoutData?.amount_per_year > 0) return checkoutData?.amount_per_year;
    }
    return t('free-trial');
  };

  const priceIsNotNumber = Number.isNaN(Number(getPrice()));

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

    setCohortSession({
      ...cohortFound,
      selectedProgramSlug: cohortDashboardLink,
    });

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
    bc.cohort().join(cohort?.id)
      .then(async (resp) => {
        const dataRequested = await resp.json();
        if (resp.status >= 400) {
          toast({
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
        getAllMySubscriptions()
          .then((subscriptions) => {
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
    if ((isNotTrial || !priceIsNotNumber) && !mentorship_service_slug && event_service_slug) {
      nextStep();
      router.push({
        pathname: '/checkout',
        query: {
          ...router.query,
          plan_id: selectedPlanCheckoutData?.plan_id,
        },
      });
    } else {
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
          toast({
            position: 'top',
            title: t('alert-message:payment-error'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
        });
    }
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);
  useEffect(() => {
    if (hasMounted) {
      if (findedPlan?.plan_slug) {
        handleSubmit();
      }
      if (!findedPlan?.plan_slug && checkoutData?.plans?.[selectedIndex]) {
        setLoader('plan', false);
        setSelectedPlanCheckoutData(checkoutData?.plans[selectedIndex]);
      }
    }
  }, [findedPlan?.plan_slug, hasMounted]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gridGap={isPaymentIdle && '30px'}
      mb="1rem"
      width={{ base: 'auto', lg: '490px' }}
      margin={{ base: '0 1rem', lg: '0 auto' }}
    >
      <Box display="flex" flexDirection="column" gridGap="3rem" background={backgroundColor} p={{ base: '20px 0', md: '14px 0' }} height="100%" borderRadius="15px">
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
          {!isPaymentIdle ? (
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
          ) : (
            <>
              <Heading size="15px" color="blue.default" textTransform="uppercase">
                {t('signing-for')}
              </Heading>
              <Box display="flex" gridGap="12px">
                <Box display="flex" flexDirection="column">
                  <Box
                    p="16px"
                    background="blue.default"
                    borderRadius="7px"
                    width="fit-content"
                  >
                    <Icon icon="coding" width="48px" height="48px" color="#fff" />
                  </Box>
                </Box>
                <Box display="flex" flexDirection="column" gridGap="7px">
                  <Box display="flex" flexDirection="column" gridGap="0px" alignItems="center">
                    <Box display="flex" width={{ base: '100%', md: '' }} flexDirection="column" gridGap="7px">
                      <Heading size="18px">
                        {dateProps?.syllabus_version?.name || selectedPlanCheckoutData?.title}
                      </Heading>
                    </Box>
                    <Heading
                      size="xl"
                      color="blue.default"
                      width="100%"
                    >
                      {selectedPlanCheckoutData?.price <= 0
                        ? selectedPlanCheckoutData?.priceText
                        : `$${selectedPlanCheckoutData?.price}`}
                    </Heading>
                  </Box>
                  {getPaymentText()?.length > 0 && (
                    <Text
                      size="14px"
                      color={useColorModeValue('gray.700', 'gray.400')}
                    >
                      {getPaymentText()}
                    </Text>
                  )}
                </Box>
              </Box>
              {planProps?.length > 0 && (
                <>
                  <Box
                    as="hr"
                    width="100%"
                    margin="0"
                    h="1px"
                    borderColor={borderColor}
                  />
                  <Box fontSize="14px" fontWeight="700" color="blue.default">
                    {t('what-you-will-get')}
                  </Box>
                </>
              )}

              {planProps?.length > 0 && (
                <Box
                  as="ul"
                  style={{ listStyle: 'none' }}
                  display="flex"
                  flexDirection="column"
                  gridGap="12px"
                >
                  {planProps?.map((bullet) => bullet?.features[0]?.description && (
                    <Box
                      as="li"
                      key={bullet?.features[0]?.description}
                      display="flex"
                      flexDirection="row"
                      lineHeight="24px"
                      gridGap="8px"
                    >
                      <Icon
                        icon="checked2"
                        color="#38A56A"
                        width="13px"
                        height="10px"
                        style={{ margin: '8px 0 0 0' }}
                      />
                      <Box
                        fontSize="14px"
                        fontWeight="600"
                        letterSpacing="0.05em"
                        dangerouslySetInnerHTML={{ __html: bullet?.description }}
                      />
                      {bullet?.features[0]?.description}
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
      {/* ------------------- */}
      <Box display="flex" flexDirection="column">
        <Box background={backgroundColor} p={{ base: '22px 0', md: '14px 0' }} borderRadius="15px">
          {isPaymentIdle && (
            <>
              <Heading
                fontSize="22px"
                p="0 0 12px 0"
              >
                {t('select-payment-plan')}
              </Heading>
              <Box display="flex" flexDirection="column" gridGap="10px">
                {/* {cohortPlans */}
                {checkoutData?.plans
                  .map((item, i) => {
                    const title = item?.title ? item?.title : toCapitalize(unSlugify(String(item?.slug)));
                    const isSelected = selectedPlanCheckoutData?.period !== 'FINANCING'
                      ? selectedPlanCheckoutData?.plan_id === item?.plan_id
                      : selectedPlanCheckoutData?.plan_id === item?.plan_id;
                    return (
                      <Fragment key={`${item?.slug}-${item?.title}`}>
                        <Box
                          display="flex"
                          onClick={() => {
                            setSelectedIndex(i);
                            setSelectedPlanCheckoutData(item);
                          }}
                          flexDirection="row"
                          width="100%"
                          justifyContent="space-between"
                          // p={selectedIndex === i ? '22px 18px' : '26px 22px'}
                          p={{ base: '25px 14px', md: '22px 18px' }}
                          gridGap={{ base: '0', md: '12px' }}
                          cursor="pointer"
                          // background={selectedIndex !== i && featuredColor}
                          border={isSelected ? '2px solid #0097CD' : `2px solid ${hexColor.featuredColor}`}
                          borderRadius="13px"
                        >
                          <Box
                            display="flex"
                            flexDirection="column"
                            gridGap={{ base: '0', md: '4px' }}
                            minWidth={{ base: 'auto', md: '228px' }}
                            height="fit-content"
                            fontWeight="400"
                          >
                            <Box fontSize={{ base: '12px', md: '18px' }} fontWeight="700">
                              {title}
                            </Box>
                            <Text display={periodText[item?.period] ? 'block' : 'none'} fontSize="14px" color={isSelected ? 'blue.default' : lightColor} fontWeight={isSelected ? 700 : 400}>
                              {periodText[item?.period]}
                            </Text>
                          </Box>
                          <Box display="flex" minWidth="90px" alignItems="center" gridGap="10px">
                            <Heading
                              as="span"
                              size={(item?.period !== 'FINANCING' && !['FREE', 'TRIAL'].includes(item?.type)) ? 'm' : 'm'}
                              lineHeight="1"
                              color="blue.default"
                              width="100%"
                              textAlign="end"
                            >
                              {item?.priceText}
                            </Heading>
                          </Box>
                        </Box>
                      </Fragment>
                    );
                  })}
              </Box>
            </>
          )}
          {!isPaymentIdle ? (
            <Button
              width="100%"
              height="45px"
              variant="default"
              // mt="12px"
              isDisabled={(isPaymentSuccess && !cohortFound) || !readyToRedirect}
              isLoading={isSubmitting || isRedirecting}
              onClick={startRedirection}
            >
              {isPaymentSuccess ? t('start-free-course') : t('try-again')}
            </Button>
          ) : (
            <>
              {(isNotTrial || !priceIsNotNumber) ? (
                <Button
                  variant="default"
                  width="100%"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  isDisabled={!selectedPlanCheckoutData?.featured_info}
                  height="45px"
                  mt="12px"
                >
                  {t('common:proceed-to-payment')}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  width="100%"
                  borderColor="blue.200"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  isDisabled={!selectedPlanCheckoutData?.featured_info}
                  background={featuredBackground}
                  _hover={{ background: featuredBackground, opacity: 0.8 }}
                  _active={{ background: featuredBackground, opacity: 1 }}
                  color="blue.default"
                  height="45px"
                  mt="12px"
                >
                  {selectedPlanCheckoutData?.type === 'FREE' ? t('start-free-course') : t('common:start-free-trial')}
                </Button>
              )}
            </>
          )}

        </Box>
      </Box>
    </Box>
  );
}

export default Summary;
