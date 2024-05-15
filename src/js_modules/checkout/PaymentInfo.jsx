/* eslint-disable no-unsafe-optional-chaining */
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import useTranslation from 'next-translate/useTranslation';
import {
  Box, Button, Flex, Image, Input, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { forwardRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Heading from '../../common/components/Heading';
import bc from '../../common/services/breathecode';
import FieldForm from '../../common/components/Forms/FieldForm';
import useSignup from '../../common/store/actions/signupAction';
import 'react-datepicker/dist/react-datepicker.css';
import useStyle from '../../common/hooks/useStyle';
import { reportDatalayer } from '../../utils/requests';
import { getQueryString, getStorageItem } from '../../utils';
import { usePersistent } from '../../common/hooks/usePersistent';
import { getCohort } from '../../common/handlers/cohorts';
import useAuth from '../../common/hooks/useAuth';
import axiosInstance from '../../axios';
import { getAllMySubscriptions } from '../../common/handlers/subscriptions';
import { SILENT_CODE } from '../../lib/types';
import ModalCardError from './ModalCardError';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';

const CustomDateInput = forwardRef(({ value, onClick, ...rest }, ref) => {
  const { t } = useTranslation('signup');
  const { input } = useStyle();
  const inputBorderColor = input.borderColor;

  return (
    <Input
      {...rest}
      placeholder={t('expiration-date')}
      onClick={onClick}
      height="50px"
      borderRadius="3px"
      borderColor={inputBorderColor}
      ref={ref}
      value={value}
    />
  );
});

function PaymentInfo() {
  const { t, lang } = useTranslation('signup');

  const {
    state, setPaymentInfo, handlePayment, setSelectedPlanCheckoutData,
  } = useSignup();
  const { choose } = useAuth();
  const { paymentInfo, checkoutData, selectedPlanCheckoutData, cohortPlans } = state;
  const cohortId = Number(getQueryString('cohort'));
  const [, setCohortSession] = usePersistent('cohortSession', {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDeclinedModal, setOpenDeclinedModal] = useState(false);
  const [declinedModalProps, setDeclinedModalProps] = useState({
    title: '',
    description: '',
  });
  const [readyToRefetch, setReadyToRefetch] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  // const [isReadyToJoinCohort, setIsReadyToJoinCohort] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [stateCard, setStateCard] = useState({
    card_number: 0,
    exp_month: 0,
    exp_year: 0,
    cvc: 0,
  });
  const toast = useToast();
  const redirect = getStorageItem('redirect');
  const redirectedFrom = getStorageItem('redirected-from');
  const router = useRouter();

  const isPaymentSuccess = paymentStatus === 'success';
  const isPaymentIdle = paymentStatus === 'idle';
  const paymentStatusBgColor = isPaymentSuccess ? 'green.light' : '#ffefef';
  const isNotTrial = selectedPlanCheckoutData?.type !== 'TRIAL';

  const getPrice = (planProp) => {
    if (isNotTrial) {
      if (planProp?.financing_options?.length > 0 && planProp?.financing_options[0]?.monthly_price > 0) return planProp?.financing_options[0]?.monthly_price;
      if (checkoutData?.amount_per_half > 0) return checkoutData?.amount_per_half;
      if (checkoutData?.amount_per_month > 0) return checkoutData?.amount_per_month;
      if (checkoutData?.amount_per_quarter > 0) return checkoutData?.amount_per_quarter;
      if (checkoutData?.amount_per_year > 0) return checkoutData?.amount_per_year;
    }
    return t('free-trial');
  };

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
        setIsSubmitting(false);
        setTimeout(() => {
          setReadyToRefetch(false);
        }, 600);
      });
  };

  const priceIsNotNumber = Number.isNaN(Number(getPrice(selectedPlanCheckoutData)));

  const { backgroundColor, fontColor } = useStyle();
  const featuredBackground = useColorModeValue('featuredLight', 'featuredDark');

  const infoValidation = Yup.object().shape({
    owner_name: Yup.string()
      .min(6, t('validators.owner_name-min'))
      .required(t('validators.owner_name-required')),
    card_number: Yup.string()
      .min(16)
      .max(20)
      .required(t('validators.card_number-required')),
    exp: Yup.string()
      .min(5, t('validators.exp-min'))
      .required(t('validators.exp-required')),
    cvc: Yup.string()
      .min(3)
      .max(4)
      .required(t('validators.cvc-required')),
  });

  useEffect(() => {
    reportDatalayer({
      dataLayer: {
        event: 'checkout_complete_purchase',
        value: state?.selectedPlanCheckoutData?.price,
      },
    });
  }, []);

  useEffect(() => {
    let interval;
    if (readyToRefetch && timeElapsed < 10) {
      interval = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
        getAllMySubscriptions()
          .then((subscriptions) => {
            const currentSubscription = subscriptions?.find(
              (subscription) => checkoutData?.plans[0]?.plan_slug === subscription.plans[0]?.slug,
            );
            const isPurchasedPlanFound = subscriptions?.length > 0 && subscriptions.some(
              (subscription) => checkoutData?.plans[0]?.plan_slug === subscription.plans[0]?.slug,
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
          });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [readyToRefetch, timeElapsed]);

  const handlePaymentErrors = (data, actions = {}, callback = () => {}) => {
    const silentCode = data?.silent_code;
    setIsSubmitting(false);
    actions?.setSubmitting(false);
    callback();
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
  };

  const handleSubmit = async (actions, values) => {
    const resp = await bc.payment().addCard(values);
    const data = await resp.json();

    if (resp.ok) {
      const currency = cohortPlans[0]?.plan?.currency?.code;
      reportDatalayer({
        dataLayer: {
          event: 'add_payment_info',
          path: '/checkout',
          value: state?.selectedPlanCheckoutData?.price,
          currency,
          payment_type: 'Credit card',
          plan: state?.selectedPlanCheckoutData?.plan_slug,
          period_label: state?.selectedPlanCheckoutData?.period_label,
        },
      });
      await handlePayment({}, true)
        .then((respPayment) => {
          if (respPayment.status === 'FULFILLED') {
            setPaymentStatus('success');
            setSelectedPlanCheckoutData({
              ...selectedPlanCheckoutData,
              payment_success: true,
            });
            setIsSubmitting(false);
          } else {
            setPaymentStatus('error');
          }
        })
        .finally(() => {
          actions.setSubmitting(false);
        });
    } else {
      setPaymentStatus('error');
      handlePaymentErrors(data, actions);
    }
  };

  return (
    <Box display="flex" height="100%" flexDirection="column" gridGap="30px" margin={{ base: isPaymentSuccess ? '' : '0 auto', md: '0 auto' }} position="relative">
      <ModalCardError
        openDeclinedModal={openDeclinedModal}
        isSubmitting={isSubmitting}
        setOpenDeclinedModal={setOpenDeclinedModal}
        declinedModalProps={declinedModalProps}
        handleTryAgain={() => {
          setIsSubmitting(true);
          handlePayment({}, true)
            .then((data) => {
              if (data.status === 'FULFILLED') {
                setReadyToRefetch(true);
              }
              handlePaymentErrors(data, {}, () => setIsSubmitting(false));
            })
            .catch(() => {
              toast({
                position: 'top',
                title: t('alert-message:card-error'),
                description: t('alert-message:card-error-description'),
                status: 'error',
                duration: 6000,
                isClosable: true,
              });
              setIsSubmitting(false);
            });
        }}
      />
      <Box display="flex" width={{ base: '100%', md: '490px' }} height="auto" flexDirection="column" minWidth={{ base: 'auto', md: '100%' }} background={!isPaymentIdle ? paymentStatusBgColor : backgroundColor} p={{ base: '20px 0', md: '30px 0' }} borderRadius="15px">
        {!isPaymentIdle ? (
          <Flex flexDirection="column" gridGap="24px" borderRadius="3px" alignItems="center" padding="16px 8px">
            <Icon icon={isPaymentSuccess ? 'feedback-like' : 'feedback-dislike'} width="60px" height="60px" />
            <Text size="14px" fontWeight={700} textAlign="center" color="black">
              {isPaymentSuccess ? 'Payment successful' : 'Payment failed'}
            </Text>
          </Flex>
        ) : (
          <>
            <Heading size="18px">{t('payment-info')}</Heading>
            <Box
              as="hr"
              width="20%"
              margin="12px 0 18px 0"
              border="0px"
              h="1px"
              background={fontColor}
            />

            <Formik
              initialValues={{
                owner_name: '',
                card_number: '',
                exp: '',
                cvc: '',
              }}
              onSubmit={(values, actions) => {
                setIsSubmitting(true);
                const monthAndYear = values.exp?.split('/');
                const expMonth = monthAndYear[0];
                const expYear = monthAndYear[1];

                const allValues = {
                  card_number: stateCard.card_number,
                  exp_month: expMonth,
                  exp_year: expYear,
                  cvc: values.cvc,
                };
                handleSubmit(actions, allValues);
              }}
              validationSchema={infoValidation}
            >
              {() => (
                <Form
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gridGap: '22px',
                  }}
                >
                  <Box display="flex" gridGap="18px">
                    <FieldForm
                      type="text"
                      name="owner_name"
                      externValue={paymentInfo.owner_name}
                      handleOnChange={(e) => {
                        setPaymentInfo('owner_name', e.target.value);
                        setStateCard({ ...stateCard, owner_name: e.target.value });
                      }}
                      pattern="[A-Za-z ]*"
                      label={t('owner-name')}
                    />
                  </Box>
                  <Box display="flex" gridGap="18px">
                    <FieldForm
                      type="text"
                      name="card_number"
                      externValue={paymentInfo.card_number}
                      handleOnChange={(e) => {
                        const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                        const newValue = value.replace(/(.{4})/g, '$1 ').trim();
                        e.target.value = newValue.slice(0, 19);
                        setPaymentInfo('card_number', e.target.value);
                        setStateCard({ ...stateCard, card_number: newValue.replaceAll(' ', '').slice(0, 16) });
                      }}
                      pattern="[0-9]*"
                      label={t('card-number')}
                    />
                  </Box>
                  <Box display="flex" gridGap="18px">
                    <Box display="flex" gridGap="18px" flex={1}>
                      <Box display="flex" flexDirection="column" flex={0.5}>
                        <FieldForm
                          style={{ flex: 0.5 }}
                          type="text"
                          name="exp"
                          externValue={paymentInfo.exp}
                          maxLength={3}
                          handleOnChange={(e) => {
                            let { value } = e.target;
                            if ((value.length === 2 && paymentInfo.exp?.length === 1)) {
                              value += '/';
                            } else if (value.length === 2 && paymentInfo.exp?.length === 3) {
                              value = value.slice(0, 1);
                            }
                            value = value.substring(0, 5);

                            setPaymentInfo('exp', value);
                          }}
                          pattern="[0-9]*"
                          label={t('expiration-date')}
                        />
                      </Box>
                      <FieldForm
                        style={{ flex: 0.5 }}
                        type="text"
                        name="cvc"
                        externValue={paymentInfo.cvc}
                        maxLength={3}
                        handleOnChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                          const newValue = value.replace(/(.{4})/g, '$1 ').trim();
                          e.target.value = newValue.slice(0, 4);

                          setPaymentInfo('cvc', e.target.value);
                        }}
                        pattern="[0-9]*"
                        label={t('cvc')}
                      />
                    </Box>
                  </Box>
                  {(isNotTrial || !priceIsNotNumber) ? (
                    <Button
                      type="submit"
                      width="100%"
                      variant="default"
                      isLoading={isSubmitting}
                      height="40px"
                      mt="0"
                    >
                      {t('common:proceed-to-payment')}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      width="100%"
                      variant="outline"
                      borderColor="blue.200"
                      isLoading={isSubmitting}
                      background={featuredBackground}
                      _hover={{ background: featuredBackground, opacity: 0.8 }}
                      _active={{ background: featuredBackground, opacity: 1 }}
                      color="blue.default"
                      height="40px"
                      mt="0"
                    >
                      {t('common:start-free-trial')}
                    </Button>
                  )}
                </Form>
              )}
            </Formik>
          </>
        )}
        {!isPaymentSuccess && (
          <Image draggable={false} userSelect="none" src="/static/images/powered-by-stripe.png" width="100%" height="auto" objectFit="contain" margin="10rem 0 0 0" />
        )}
      </Box>
      {!isPaymentIdle && (
        <Button
          width="100%"
          height="45px"
          variant="default"
          // mt="12px"
          isLoading={isSubmitting}
          onClick={() => {
            if (isPaymentSuccess) {
              setIsSubmitting(true);
              setReadyToRefetch(true);
            } else {
              setPaymentStatus('idle');
            }
          }}
        >
          {isPaymentSuccess ? 'Start learning' : 'Try again'}
        </Button>
      )}
    </Box>
  );
}

CustomDateInput.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func,
};
CustomDateInput.defaultProps = {
  value: '',
  onClick: () => {},
};

export default PaymentInfo;
