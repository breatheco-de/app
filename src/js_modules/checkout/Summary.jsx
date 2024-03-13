/* eslint-disable no-restricted-globals */
import { Box, Button, Flex, useColorModeValue, useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { Fragment, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import useStyle from '../../common/hooks/useStyle';
import useSignup from '../../common/store/actions/signupAction';
import bc from '../../common/services/breathecode';
import { reportDatalayer } from '../../utils/requests';
import { getQueryString, getStorageItem, toCapitalize, unSlugify } from '../../utils';
import { getAllMySubscriptions } from '../../common/handlers/subscriptions';
import { SILENT_CODE } from '../../lib/types';
import SimpleModal from '../../common/components/SimpleModal';
import axiosInstance from '../../axios';
import { usePersistent } from '../../common/hooks/usePersistent';
import useAuth from '../../common/hooks/useAuth';
import { getCohort } from '../../common/handlers/cohorts';

function Summary() {
  const { t, lang } = useTranslation('signup');
  const { choose } = useAuth();
  const [, setCohortSession] = usePersistent('cohortSession', {});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [disableHandler, setDisableHandler] = useState(false);

  const {
    state, nextStep, setSelectedPlanCheckoutData, setPlanProps, handlePayment, getPaymentText,
    setLoader,
  } = useSignup();
  const { dateProps, checkoutData, selectedPlanCheckoutData, planProps } = state;
  const toast = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readyToRefetch, setReadyToRefetch] = useState(false);
  const [openDeclinedModal, setOpenDeclinedModal] = useState(false);
  const [declinedModalProps, setDeclinedModalProps] = useState({
    title: '',
    description: '',
  });
  const redirect = getStorageItem('redirect');
  const redirectedFrom = getStorageItem('redirected-from');
  const router = useRouter();

  const featuredBackground = useColorModeValue('featuredLight', 'featuredDark');
  const { backgroundColor, borderColor, lightColor, hexColor } = useStyle();
  const planId = getQueryString('plan');

  const isNotTrial = !['FREE', 'TRIAL'].includes(selectedPlanCheckoutData?.type);

  const periodText = {
    FREE: t('totally_free'),
    WEEK: t('info.trial-week'),
    MONTH: t('info.monthly'),
    QUARTER: t('info.quarterly'),
    HALF: t('info.half-yearly'),
    YEAR: t('info.yearly'),
    FINANCING: t('info.financing'),
  };

  const getPlanProps = (selectedPlan) => {
    bc.payment().getPlanProps(encodeURIComponent(selectedPlan?.slug))
      .then((resp) => {
        if (!resp) {
          setDisableHandler(true);
        } else {
          setDisableHandler(false);
          setPlanProps(resp.data);
        }
      })
      .catch(() => {
        setDisableHandler(true);
      });
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
        plan: checkoutData?.plans[0].slug,
      },
    });
  }, []);

  const redirectTocohort = (cohort) => {
    const langLink = lang !== 'en' ? `/${lang}` : '';
    const syllabusVersion = cohort?.syllabus_version;
    choose({
      version: syllabusVersion?.version,
      slug: syllabusVersion?.slug,
      cohort_name: cohort.name,
      cohort_slug: cohort?.slug,
      syllabus_name: syllabusVersion,
      academy_id: cohort.academy.id,
    });
    axiosInstance.defaults.headers.common.Academy = cohort.academy.id;
    const cohortDashboardLink = `${langLink}/cohort/${cohort?.slug}/${syllabusVersion?.slug}/v${syllabusVersion?.version}`;
    setCohortSession({
      ...cohort,
      selectedProgramSlug: cohortDashboardLink,
    });
    router.push(cohortDashboardLink);
  };
  const joinCohort = (cohort) => {
    reportDatalayer({
      dataLayer: {
        event: 'join_cohort',
        cohort_id: cohort?.id,
      },
    });
    bc.cohort().join(cohort?.id)
      .then(async (resp) => {
        const dataRequested = await resp.json();
        if (dataRequested?.status === 'ACTIVE') {
          redirectTocohort(cohort);
        }
        if (dataRequested?.status_code >= 400) {
          toast({
            position: 'top',
            title: dataRequested?.detail,
            status: 'info',
            duration: 5000,
            isClosable: true,
          });
          setReadyToRefetch(false);
        }
      })
      .catch(() => {
        setTimeout(() => {
          setReadyToRefetch(false);
        }, 600);
      });
  };

  useEffect(() => {
    let interval;
    if (readyToRefetch && timeElapsed < 10) {
      interval = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
        getAllMySubscriptions()
          .then((subscriptions) => {
            const currentSubscription = subscriptions?.find(
              (subscription) => checkoutData?.plans[0].slug === subscription.plans[0]?.slug,
            );
            const isPurchasedPlanFound = subscriptions?.length > 0 && subscriptions.some(
              (subscription) => checkoutData?.plans[0].slug === subscription.plans[0]?.slug,
            );

            if (isPurchasedPlanFound) {
              if (currentSubscription.selected_cohort_set.cohorts[0]) {
                getCohort(currentSubscription.selected_cohort_set.cohorts[0].id)
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
          });
      }, 1500);
    }
    if (readyToRefetch === false) {
      setTimeElapsed(0);
      clearInterval(interval);
    }
  }, [readyToRefetch]);

  useEffect(() => {
    const findedPlan = checkoutData?.plans?.find((plan) => plan?.plan_id === planId);
    if (findedPlan) {
      setLoader('plan', false);

      setSelectedPlanCheckoutData(findedPlan);
      getPlanProps(findedPlan);
    }

    if (!findedPlan && checkoutData?.plans?.[selectedIndex]) {
      setLoader('plan', false);
      setSelectedPlanCheckoutData(checkoutData?.plans[selectedIndex]);
      getPlanProps(checkoutData?.plans[selectedIndex]);
    }
  }, [checkoutData?.plans]);

  const handleSubmit = () => {
    setIsSubmitting(true);
    if (isNotTrial || !priceIsNotNumber) {
      nextStep();
    } else {
      handlePayment({
        ...checkoutData,
        installments: selectedPlanCheckoutData?.how_many_months,
      }, true)
        .then((respPayment) => {
          const silentCode = respPayment?.silent_code;
          if (silentCode) {
            setReadyToRefetch(false);

            if (silentCode === SILENT_CODE.CARD_ERROR) {
              setOpenDeclinedModal(true);
              setDeclinedModalProps({
                title: t('transaction-denied'),
                description: t('card-declined'),
              });
            }
            if (SILENT_CODE.LIST_PROCESSING_ERRORS.includes(silentCode)) {
              setOpenDeclinedModal(true);
              setDeclinedModalProps({
                title: t('transaction-denied'),
                description: t('payment-not-processed'),
              });
            }
            if (silentCode === SILENT_CODE.UNEXPECTED_EXCEPTION) {
              setOpenDeclinedModal(true);
              setDeclinedModalProps({
                title: t('transaction-denied'),
                description: t('payment-error'),
              });
            }
          }
          if (respPayment.status === 'FULFILLED') {
            setReadyToRefetch(true);
          }
        })
        .catch(() => {
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

  return (
    <Box
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      gridGap="30px"
      mb="1rem"
    >
      <SimpleModal
        isOpen={openDeclinedModal}
        headerStyles={{
          padding: '0 0 16px 0',
          textAlign: 'center',
        }}
        maxWidth="510px"
        onClose={() => setOpenDeclinedModal(false)}
        title={declinedModalProps.title}
        padding="16px 0"
        gridGap="24px"
        bodyStyles={{
          display: 'flex',
          gridGap: '24px',
          padding: '0',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image src="/static/images/avatar-for-transaction-failed.png" width={80} height={80} />

        <Text fontSize="18px" fontWeight="700" textAlign="center">
          {declinedModalProps.description}
        </Text>

        <Flex gridGap="24px">
          <Button variant="outline" onClick={() => setOpenDeclinedModal(false)} borderColor="blue.default" color="blue.default">
            {t('common:close')}
          </Button>
          <Button
            isLoading={isSubmitting}
            variant="default"
            onClick={() => {
              setIsSubmitting(true);
              handleSubmit();
            }}
          >
            {t('common:try-again')}
          </Button>
        </Flex>
      </SimpleModal>
      <Box display="flex" flexDirection="column" flex={0.5} gridGap="3rem" background={backgroundColor} p={{ base: '20px 22px', md: '14px 23px' }} height="100%" borderRadius="15px">
        <Box
          display="flex"
          flexDirection="column"
          background={featuredBackground}
          w="100%"
          height="fit-content"
          p="11px 14px"
          gridGap="8px"
          borderRadius="14px"
        >
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
                    fontSize={{ base: '12px', md: '13px' }}
                    fontWeight="600"
                    letterSpacing="0.05em"
                    dangerouslySetInnerHTML={{ __html: bullet?.features[0]?.description }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" flex={0.5}>
        <Box background={backgroundColor} p={{ base: '22px', md: '14px 23px' }} borderRadius="15px">
          <Heading
            fontSize="22px"
            p="0 0 12px 0"
          >
            {t('select-payment-plan')}
          </Heading>
          <Box display="flex" flexDirection="column" gridGap="10px">
            {/* {cohortPlans */}
            {checkoutData?.plans
              .filter((l) => l.status === 'ACTIVE')
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
                        // setPlanData(item);
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
                        <Text fontSize="14px" color={isSelected ? 'blue.default' : lightColor} fontWeight={isSelected ? 700 : 400}>
                          {periodText[item?.period] || t('info.trial')}
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
          {(isNotTrial || !priceIsNotNumber) ? (
            <Button
              variant="default"
              width="100%"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={disableHandler}
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
              isDisabled={disableHandler}
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
        </Box>
      </Box>
    </Box>
  );
}

export default Summary;
