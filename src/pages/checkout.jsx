/* eslint-disable camelcase */
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import getT from 'next-translate/getT';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { Form, Formik } from 'formik';
import { getDataContentProps } from '../utils/file';
import bc from '../common/services/breathecode';
import useAuth from '../common/hooks/useAuth';
import useSession from '../common/hooks/useSession';
import ContactInformation from '../js_modules/checkout/ContactInformation';
import ChooseYourClass from '../js_modules/checkout/ChooseYourClass';
import { isWindow, getTimeProps, removeURLParameter, getQueryString, getStorageItem, removeStorageItem, slugToTitle, removeSessionStorageItem } from '../utils';
import Summary from '../js_modules/checkout/Summary';
import PaymentInfo from '../js_modules/checkout/PaymentInfo';
import useSignup from '../common/store/actions/signupAction';
import axiosInstance from '../axios';
import LoaderScreen from '../common/components/LoaderScreen';
import ModalInfo from '../js_modules/moduleMap/modalInfo';
import useStyle from '../common/hooks/useStyle';
import Stepper from '../js_modules/checkout/Stepper';
import ServiceSummary from '../js_modules/checkout/ServiceSummary';
import Text from '../common/components/Text';
import SelectServicePlan from '../js_modules/checkout/SelectServicePlan';
import modifyEnv from '../../modifyEnv';
import { BASE_PLAN, ORIGIN_HOST } from '../utils/variables';
import { reportDatalayer } from '../utils/requests';
import { getTranslations, processPlans } from '../common/handlers/subscriptions';
import Icon from '../common/components/Icon';
import AcordionList from '../common/components/AcordionList';
import { usePersistentBySession } from '../common/hooks/usePersistent';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'signup');
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const finance = getDataContentProps(`public/locales/${locale}`, 'finance');
  const image = t('seo.image', {
    domain: ORIGIN_HOST,
  });
  const ogUrl = {
    en: '/checkout',
    us: '/checkout',
  };

  return {
    props: {
      seo: {
        title: t('seo.title'),
        description: t('seo.description'),
        locales,
        locale,
        image,
        url: ogUrl.en || `/${locale}/checkout`,
        pathConnector: '/checkout',
        keywords,
      },
      fallback: false,
      finance,
      hideDivider: true,
    },
  };
};

function Checkout() {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const { t, lang } = useTranslation('signup');
  const router = useRouter();
  const [cohortsData, setCohortsData] = useState({
    loading: true,
  });
  const [serviceToRequest, setServiceToRequest] = useState({});
  const [verifyEmailProps, setVerifyEmailProps] = useState({});
  const [originalPlan, setOriginalPlan] = useState(null);
  const {
    state, toggleIfEnrolled, handleStep, handleChecking, setCohortPlans,
    handleServiceToConsume, isFirstStep, isSecondStep, isThirdStep, isFourthStep, setLoader,
    setSelectedPlanCheckoutData, setCheckoutData,
  } = useSignup();
  const [readyToSelectService, setReadyToSelectService] = useState(false);
  const [showChooseClass, setShowChooseClass] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [discountCoupon, setDiscountCoupon] = useState({
    isError: false,
  });
  const { stepIndex, checkoutData, selectedPlanCheckoutData, alreadyEnrolled, serviceProps, loader } = state;
  const { backgroundColor3, hexColor, backgroundColor } = useStyle();

  const cohorts = cohortsData?.cohorts;

  axiosInstance.defaults.headers.common['Accept-Language'] = router.locale;
  const { user, isAuthenticated, isLoading } = useAuth();
  const { userSession } = useSession();
  const toast = useToast();
  const plan = getQueryString('plan');
  const queryPlans = getQueryString('plans');
  const queryPlanId = getQueryString('plan_id');
  const mentorshipServiceSetSlug = getQueryString('mentorship_service_set');
  const eventTypeSetSlug = getQueryString('event_type_set');
  const planFormated = (plan && encodeURIComponent(plan)) || '';
  const accessToken = getStorageItem('accessToken');
  const tokenExists = accessToken !== null && accessToken !== undefined && accessToken.length > 5;
  const couponQuery = getQueryString('coupon');
  const [coupon] = usePersistentBySession('coupon', '');
  const formatedCouponQuery = couponQuery && couponQuery.replace(/[^a-zA-Z0-9-\s]/g, '');
  const couponString = coupon?.replaceAll('"', '') || '';
  const couponValue = couponString || formatedCouponQuery;

  const { course } = router.query;
  const courseChoosed = course;

  const [formProps, setFormProps] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    confirm_email: '',
  });

  const queryPlanExists = planFormated !== undefined && planFormated?.length > 0;
  const queryMentorshipServiceSlugExists = mentorshipServiceSetSlug && mentorshipServiceSetSlug?.length > 0;
  const queryEventTypeSetSlugExists = eventTypeSetSlug && eventTypeSetSlug?.length > 0;
  const queryPlansExists = queryPlans && queryPlans?.length > 0;
  const showPriceInformation = !readyToSelectService && isFourthStep;
  const isPaymentSuccess = selectedPlanCheckoutData?.payment_success;

  const queryServiceExists = queryMentorshipServiceSlugExists || queryEventTypeSetSlugExists;

  const saveCouponToBag = (coupons, bagId = '') => {
    bc.payment({
      coupons,
      plan: planFormated,
    }).applyCoupon(bagId)
      .then((resp) => {
        const couponsList = resp?.data?.coupons;
        if (couponsList?.length > 0) {
          setDiscountCoupon({
            ...couponsList[0],
            isError: false,
          });
          setCheckoutData({
            ...checkoutData,
            discountCoupon: couponsList[0],
          });
        } else {
          setDiscountCoupon({
            isError: true,
          });
        }
      });
  };

  const handleCoupon = (coupons, actions) => {
    bc.payment({
      coupons: [coupons || discountCode],
      plan: planFormated,
    }).verifyCoupon()
      .then((resp) => {
        if (resp?.data?.length > 0) {
          const couponsToString = resp?.data.map((item) => item?.slug);
          saveCouponToBag(couponsToString, checkoutData?.id);
        } else {
          setDiscountCoupon({
            isError: true,
          });
        }
      })
      .finally(() => {
        if (actions) {
          actions.setSubmitting(false);
        }
      });
  };

  useEffect(() => {
    removeStorageItem('redirect');
    const translations = getTranslations(t);
    const defaultPlan = (plan && encodeURIComponent(plan)) || encodeURIComponent(BASE_PLAN);
    bc.payment().getPlan(defaultPlan).then(async (resp) => {
      const processedPlan = await processPlans(resp?.data, {
        quarterly: false,
        halfYearly: false,
        planType: 'original',
      }, translations);

      const accordionList = processedPlan?.featured_info?.length > 0
        ? processedPlan?.featured_info.map((info) => ({
          title: info?.features[0]?.title || slugToTitle(info?.service?.slug),
          description: info.features[0]?.description,
        }))
        : [];

      const selectedPlan = processedPlan?.plans?.length > 1
        ? processedPlan?.plans?.find((item) => item?.plan_id === queryPlanId)
        : (processedPlan?.plans?.[0] || {});
      setSelectedPlanCheckoutData(selectedPlan);
      setOriginalPlan({ ...processedPlan, selectedPlan, accordionList });
    })
      .catch((err) => {
        if (err) {
          toast({
            position: 'top',
            title: t('alert-message:no-plan-configuration'),
            status: 'info',
            duration: 4000,
            isClosable: true,
          });
          router.push('/pricing');
        }
      });
    reportDatalayer({
      dataLayer: {
        event: 'begin_checkout',
        path: '/checkout',
        conversion_info: userSession,
      },
    });
  }, [router.locale]);

  useEffect(() => {
    // verify if coupon exists
    if (couponValue && checkoutData?.id) {
      handleCoupon(couponValue);
      setDiscountCode(couponValue);
    }
  }, [couponValue, checkoutData?.id]);

  useEffect(() => {
    // Alert before leave the page if the user is in the payment process
    if (isWindow && stepIndex >= 2 && isAuthenticated && !isPaymentSuccess) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
    return () => {};
  }, [stepIndex, isAuthenticated]);

  useEffect(() => {
    const isAvailableToSelectPlan = queryPlansExists && queryPlans?.split(',')?.length > 0;
    if (!isAuthenticated && !tokenExists) {
      setLoader('plan', false);
    }
    if (!queryPlanExists && !queryPlansExists && !queryEventTypeSetSlugExists && !queryMentorshipServiceSlugExists && isAuthenticated) {
      router.push('/pricing');
    }
    if (isAuthenticated && isAvailableToSelectPlan && queryServiceExists) {
      // If exists plan to select show the select service plan view
      setReadyToSelectService(true);
      setShowChooseClass(false);
    }

    // Prepare service data to get consumables
    if (!queryPlanExists && tokenExists && isAuthenticated && !isAvailableToSelectPlan) {
      setShowChooseClass(false);
      setLoader('plan', true);
      bc.payment({
        status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE',
      }).subscriptions()
        .then(({ data }) => {
          const subscriptionRespData = data;
          const items = {
            subscriptions: subscriptionRespData?.subscriptions,
            plan_financings: subscriptionRespData?.plan_financings,
          };
          const subscription = items?.subscriptions?.find(
            (item) => (
              item?.selected_mentorship_service_set?.slug === mentorshipServiceSetSlug
              || item?.selected_event_type_set?.slug === eventTypeSetSlug
            ),
          );
          const planFinanncing = items?.plan_financings?.find(
            (item) => (
              item?.selected_mentorship_service_set?.slug === mentorshipServiceSetSlug
              || item?.selected_event_type_set?.slug === eventTypeSetSlug
            ),
          );

          const currentSubscription = subscription || planFinanncing;
          const isMentorshipType = currentSubscription?.selected_mentorship_service_set?.slug === mentorshipServiceSetSlug;

          const serviceData = isMentorshipType
            ? currentSubscription?.selected_mentorship_service_set
            : currentSubscription?.selected_event_type_set;

          if (serviceData) {
            bc.payment({
              academy: Number(serviceData?.academy?.id),
              event_type_set: !isMentorshipType ? eventTypeSetSlug : undefined,
              mentorship_service_set: isMentorshipType ? mentorshipServiceSetSlug : undefined,
            }).service().getAcademyService()
              .then(async (resp) => {
                const respData = await resp.json();
                if (resp.status > 400) {
                  setShowChooseClass(true);
                  toast({
                    title: respData.detail,
                    status: 'error',
                    duration: 6000,
                    position: 'top',
                  });
                }
                if (resp.status < 400 && respData !== undefined && respData.length > 0) {
                  handleStep(2);
                  handleServiceToConsume({
                    ...respData[0],
                    serviceInfo: {
                      type: isMentorshipType ? 'mentorship' : 'event',
                      ...serviceData,
                    },
                  });
                  setServiceToRequest(respData[0]);
                }
              });
          } else {
            setReadyToSelectService(true);
            setShowChooseClass(false);
          }
        })
        .finally(() => {
          setLoader('plan', false);
        });
    }
    if (!queryServiceExists && queryPlanExists && isAuthenticated && tokenExists && !cohortsData.loading) {
      setLoader('plan', true);
      setShowChooseClass(false);
      bc.payment().getPlan(planFormated)
        .then((resp) => {
          if (!resp) {
            setLoader('plan', false);
            router.push('/pricing');
            toast({
              position: 'top',
              title: t('alert-message:no-plan-configuration'),
              status: 'error',
              duration: 4000,
              isClosable: true,
            });
          } else {
            const data = resp?.data;
            const existsAmountPerHalf = data?.price_per_half > 0;
            const existsAmountPerMonth = data?.price_per_month > 0;
            const existsAmountPerQuarter = data?.price_per_quarter > 0;
            const existsAmountPerYear = data?.price_per_year > 0;
            const isNotTrial = existsAmountPerHalf || existsAmountPerMonth || existsAmountPerQuarter || existsAmountPerYear;

            if ((resp && resp?.status >= 400) || resp?.data.length === 0) {
              setShowChooseClass(true);
              toast({
                position: 'top',
                title: t('alert-message:no-plan-configuration'),
                status: 'info',
                duration: 4000,
                isClosable: true,
              });
            }
            if (data?.has_waiting_list === true) {
              router.push(`/${lang}/thank-you`);
            }
            if (data?.has_waiting_list === false && ((data?.is_renewable === false && !isNotTrial) || data?.is_renewable === true || cohorts?.length === 1)) {
              if (resp.status < 400 && cohorts?.length > 0) {
                const { kickoffDate, weekDays, availableTime } = cohorts?.[0] ? getTimeProps(cohorts[0]) : {};
                const defaultCohortProps = {
                  ...cohorts[0],
                  kickoffDate,
                  weekDays,
                  availableTime,
                };

                setCohortPlans([data]);
                handleChecking({ ...defaultCohortProps, plan: data })
                  .then((checkingData) => {
                    const existsPayablePlan = checkingData?.plans.some((item) => item?.price > 0);
                    const autoSelectedPlan = checkingData?.plans?.length === 1
                      ? checkingData?.plans[0]
                      : checkingData?.plans.find((item) => item?.plan_id === queryPlanId);
                    if (existsPayablePlan && autoSelectedPlan) {
                      setSelectedPlanCheckoutData(autoSelectedPlan);
                      handleStep(3);
                      setLoader('plan', false);
                    } else {
                      if (autoSelectedPlan) {
                        setSelectedPlanCheckoutData(autoSelectedPlan);
                      }
                      handleStep(2);
                    }
                  })
                  .catch(() => {
                    setLoader('plan', false);
                  });
              }
              if (cohorts?.length === 0) {
                setCohortPlans([{
                  plan: data,
                }]);
                handleChecking({ plan: data })
                  .then((checkingData) => {
                    const existsPayablePlan = checkingData?.plans.some((item) => item?.price > 0);
                    const autoSelectedPlan = checkingData?.plans?.length === 1
                      ? checkingData?.plans[0]
                      : checkingData?.plans.find((item) => item?.plan_id === queryPlanId);
                    if (existsPayablePlan && autoSelectedPlan) {
                      setSelectedPlanCheckoutData(autoSelectedPlan);
                      handleStep(3);
                      setLoader('plan', false);
                    } else {
                      if (autoSelectedPlan) {
                        setSelectedPlanCheckoutData(autoSelectedPlan);
                      }
                      handleStep(2);
                    }
                  })
                  .catch(() => {
                    setLoader('plan', false);
                  });
              }
            }

            if (data?.is_renewable === false || data?.is_renewable === undefined) {
              setShowChooseClass(false);
              handleStep(1);
            }
          }
        })
        .catch(() => {
          setLoader('plan', false);
          toast({
            position: 'top',
            title: t('alert-message:no-plan-configuration'),
            status: 'info',
            duration: 4000,
            isClosable: true,
          });
        });
    }
    if (!isAuthenticated && !tokenExists) {
      setLoader('plan', false);
    }
  }, [cohortsData.loading, accessToken, isAuthenticated, router.locale]);

  useEffect(() => {
    if (user?.id && !isLoading) {
      // if queryString token exists clean it from the url
      if (router.query.token) {
        const cleanTokenQuery = isWindow && removeURLParameter(window.location.href, 'token');
        router.push(cleanTokenQuery);
      }

      handleStep(1);
      setFormProps({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: '',
      });
    }
  }, [user?.id]);

  const getPriceWithDiscount = () => {
    const price = selectedPlanCheckoutData?.price;
    const discount = discountCoupon?.discount_value;
    const discountType = discountCoupon?.discount_type;
    if (discount) {
      if (discountType === 'PERCENT_OFF' || discountType === 'HAGGLING') {
        return {
          originalPrice: price,
          price: price - (price * discount),
          discount: `${discount * 100}%`,
        };
      }
      if (discountType === 'FIXED_PRICE') {
        return {
          originalPrice: price,
          price: price - discount,
          discount: `$${discount}`,
        };
      }
    }
    return {
      price,
      discount: '0%',
    };
  };

  return (
    <Box p={{ base: '0 0', md: '0' }} background={backgroundColor3} position="relative" minHeight={loader.plan ? '727px' : 'auto'}>
      {loader.plan && (
        <LoaderScreen />
      )}
      <ModalInfo
        headerStyles={{ textAlign: 'center' }}
        title={t('signup:alert-message.validate-email-title')}
        footerStyle={{ flexDirection: 'row-reverse' }}
        closeButtonVariant="outline"
        closeButtonStyles={{ borderRadius: '3px', color: '#0097CD', borderColor: '#0097CD' }}
        childrenDescription={(
          <Box display="flex" flexDirection="column" alignItems="center" gridGap="17px">
            <Avatar src={`${BREATHECODE_HOST}/static/img/avatar-1.png`} border="3px solid #0097CD" width="91px" height="91px" borderRadius="50px" />
            <Text
              size="14px"
              textAlign="center"
              dangerouslySetInnerHTML={{ __html: t('signup:alert-message.validate-email-description', { email: verifyEmailProps?.data?.email }) }}
            />
          </Box>
        )}
        isOpen={(verifyEmailProps.state) || (queryPlanExists && verifyEmailProps.state)}
        buttonHandlerStyles={{ variant: 'default' }}
        actionHandler={() => {
          const inviteId = verifyEmailProps?.data?.id;
          bc.auth().resendConfirmationEmail(inviteId)
            .then((resp) => {
              const data = resp?.data;
              if (data === undefined) {
                toast({
                  position: 'top',
                  status: 'info',
                  title: t('signup:alert-message.email-already-sent'),
                  isClosable: true,
                  duration: 6000,
                });
              } else {
                toast({
                  position: 'top',
                  status: 'success',
                  title: t('signup:alert-message.email-sent-to', { email: data?.email }),
                  isClosable: true,
                  duration: 6000,
                });
              }
            });
        }}
        handlerText={t('signup:resend')}
        forceHandlerAndClose
        onClose={() => {
          setVerifyEmailProps({
            ...verifyEmailProps,
            state: false,
          });
        }}
      />

      <ModalInfo
        isOpen={alreadyEnrolled}
        forceHandler
        disableCloseButton
        title={t('already-adquired-plan-title')}
        isReadonly
        description={t('already-adquired-plan-description')}
        closeButtonVariant="outline"
        disableInput
        handlerText={t('subscriptions')}
        actionHandler={() => {
          if (window !== undefined) {
            toggleIfEnrolled(false);
            router.push('/profile/subscriptions');
          }
        }}
      />

      <Flex
        display="flex"
        flexDirection={{
          base: 'column-reverse',
          md: 'row',
        }}
        minHeight={{ base: '320px', md: '85vh' }}
        maxWidth="1640px"
        margin="0 auto"
      >
        <Flex
          display="flex"
          flexDirection="column"
          gridGap="20px"
          background={backgroundColor}
          padding={{ base: '2rem 20px', md: '2rem 0 0 0' }}
          flex={{ base: '1', md: '0.5' }}
          style={{ flexShrink: 0, flexGrow: 1 }}
          maxWidth={{ base: '100%', md: '50%' }}
          overflow="auto"
        >
          {/* Stepper */}
          {!readyToSelectService && !serviceToRequest?.id && (
            <Stepper
              hideIndexList={showChooseClass ? [] : [1]}
              stepIndex={stepIndex}
              checkoutData={checkoutData}
              isFreeTier={Boolean(checkoutData?.isTrial || checkoutData?.isTotallyFree || selectedPlanCheckoutData?.isFreeTier)}
              selectedPlanCheckoutData={selectedPlanCheckoutData}
              isFirstStep={isFirstStep}
              isSecondStep={isSecondStep}
              isThirdStep={isThirdStep}
              isFourthStep={isFourthStep}
              // handleGoBack={handleGoBack}
            />
          )}
          {!readyToSelectService && isFirstStep && (
            <ContactInformation
              courseChoosed={courseChoosed}
              formProps={formProps}
              setFormProps={setFormProps}
              setVerifyEmailProps={setVerifyEmailProps}
            />
          )}

          {/* Second step */}
          {((!readyToSelectService && showChooseClass) || isSecondStep) && (
            <ChooseYourClass setCohorts={setCohortsData} />
          )}

          {!readyToSelectService && isThirdStep && !serviceProps?.id && (
            <Summary />
          )}
          {!readyToSelectService && isThirdStep && serviceProps?.id && (
            <ServiceSummary service={serviceProps} />
          )}
          {readyToSelectService && (
            <SelectServicePlan />
          )}
          {/* Fourth step */}
          {!readyToSelectService && isFourthStep && (
            <PaymentInfo />
          )}
        </Flex>
        <Flex
          flexDirection="column"
          alignItems="center"
          // flex={0.5}
          padding={{ base: '0 auto', md: '0 3rem' }}
          position="relative"
          flex={{ base: '1', md: '0.5' }}
          style={{ flexShrink: 0, flexGrow: 1 }}
          overflow="auto"
          maxWidth={{ base: '100%', md: '50%' }}
        >
          <Flex display={{ base: isPaymentSuccess ? 'none' : 'flex', md: 'flex' }} flexDirection="column" width={{ base: 'auto', md: '100%' }} maxWidth="490px" margin={{ base: '2rem 10px 2rem 10px', md: showPriceInformation ? '4rem 0' : '6.2rem 0' }} height="100%" zIndex={10}>
            {originalPlan?.title ? (
              <Flex alignItems="start" flexDirection="column" gridGap="10px" padding="16px" borderRadius="22px" background={showPriceInformation ? 'transparent' : backgroundColor}>
                <Text size="18px">
                  {t('you-are-getting')}
                </Text>
                <Flex gridGap="7px">
                  {!showPriceInformation && <Icon icon="4Geeks-avatar" width="56px" height="57px" borderRadius="50%" background="blue.default" />}
                  <Flex flexDirection="column" gridGap="7px" justifyContent="center">
                    <Heading fontSize={showPriceInformation ? '38px' : '22px'}>
                      {originalPlan?.title}
                    </Heading>
                    {originalPlan?.selectedPlan?.isFreeTier ? (
                      <Text size="16px" color="green.400">
                        {originalPlan?.selectedPlan?.description || 'Free plan'}
                      </Text>
                    ) : originalPlan?.selectedPlan?.price > 0 && (
                      <Text size="16px" color="green.400">
                        {`$${originalPlan?.selectedPlan?.price} / ${originalPlan?.selectedPlan?.title}`}
                      </Text>
                    )}
                  </Flex>
                </Flex>
                <Divider borderBottomWidth="2px" />
                {originalPlan?.accordionList?.length > 0 && (
                  <Flex flexDirection="column" gridGap="4px" width="100%" mt="1rem">
                    <AcordionList
                      width="100%"
                      allowMultiple
                      list={originalPlan.accordionList}
                      titleStyle={{ textTransform: 'normal', fontSize: '18px' }}
                      iconColor={hexColor.blueDefault}
                      paddingButton="10px 17px"
                      unstyled
                      gridGap="0"
                      containerStyles={{ gridGap: '8px' }}
                      descriptionStyle={{ padding: '0 17px 0px' }}
                      leftIcon="checked2"
                    />
                  </Flex>
                )}
                {showPriceInformation && (
                  <>
                    <Flex justifyContent="space-between" width="100%" padding="3rem 0px 0">
                      <Text size="18px" color="currentColor" lineHeight="normal">
                        Subtotal:
                      </Text>
                      <Text size="18px" color="currentColor" lineHeight="normal">
                        {selectedPlanCheckoutData?.price <= 0
                          ? selectedPlanCheckoutData?.priceText
                          : `$${selectedPlanCheckoutData?.price} ${selectedPlanCheckoutData?.currency?.code}`}
                      </Text>
                    </Flex>
                    <Divider margin="6px 0" />
                    <Formik
                      initialValues={{
                        coupons: couponValue || '',
                      }}
                      onSubmit={(_, actions) => {
                        setDiscountCoupon({
                          isError: false,
                        });

                        handleCoupon(discountCode, actions);
                      }}
                    >
                      {({ isSubmitting }) => (
                        <Form style={{ display: isPaymentSuccess ? 'none' : 'block', width: '100%' }}>
                          <Flex gridGap="15px" width="100%">
                            <InputGroup size="md">
                              <Input
                                value={discountCode}
                                borderColor={discountCoupon?.isError ? 'red.light' : 'inherit'}
                                disabled={discountCoupon?.slug || isPaymentSuccess}
                                width="100%"
                                _disabled={{
                                  borderColor: discountCoupon?.slug ? 'success' : 'inherit',
                                  opacity: 1,
                                }}
                                letterSpacing="0.05em"
                                placeholder="Discount code"
                                onChange={(e) => {
                                  const { value } = e.target;
                                  const couponInputValue = value.replace(/[^a-zA-Z0-9-\s]/g, '');
                                  setDiscountCode(couponInputValue.replace(/\s/g, '-'));
                                  if (value === '') {
                                    setDiscountCoupon({
                                      isError: false,
                                    });
                                  }
                                }}
                              />
                              {discountCoupon?.slug && (
                                <InputRightElement width="35px">
                                  <Button
                                    variant="unstyled"
                                    aria-label="Remove coupon"
                                    minWidth="auto"
                                    padding="10px"
                                    height="auto"
                                    onClick={() => {
                                      saveCouponToBag([''], checkoutData?.id);
                                      removeSessionStorageItem('coupon');
                                      setDiscountCode('');
                                      setDiscountCoupon({
                                        isError: false,
                                      });
                                    }}
                                  >
                                    <Icon icon="close" color="currentColor" width="10px" height="10px" />
                                  </Button>
                                </InputRightElement>
                              )}
                            </InputGroup>
                            {!discountCoupon?.slug && !isPaymentSuccess && (
                              <Button
                                width="auto"
                                type="submit"
                                isLoading={isSubmitting}
                                height="auto"
                                variant="outline"
                                fontSize="17px"
                              >
                                {`+ ${t('add')}`}
                              </Button>
                            )}
                          </Flex>
                        </Form>
                      )}
                    </Formik>
                    {(discountCoupon?.slug || isPaymentSuccess) && (
                      <Flex justifyContent="space-between" margin={isPaymentSuccess ? '0' : '10px 0 0 0'} width="100%">
                        <Text size="18px" color="currentColor" lineHeight="normal">
                          {t('discount-applied')}
                        </Text>
                        <Text size="16px" color={discountCoupon?.slug ? 'green.400' : 'currentColor'} padding="0 5px" borderRadius="4px" backgroundColor={discountCoupon?.slug ? 'green.light' : 'transparent'} lineHeight="normal">
                          {discountCoupon?.slug
                            ? t('discount-value-off', { value: getPriceWithDiscount()?.discount })
                            : '--'}
                        </Text>
                      </Flex>
                    )}
                    <Divider margin="6px 0" />
                    <Flex justifyContent="space-between" width="100%">
                      <Text size="18px" color="currentColor" lineHeight="normal">
                        Total
                      </Text>
                      <Flex gridGap="1rem">
                        {getPriceWithDiscount().originalPrice && (
                          <Text size="18px" color="currentColor" textDecoration="line-through" opacity="0.7" lineHeight="normal">
                            {`$${getPriceWithDiscount().originalPrice} ${selectedPlanCheckoutData?.currency?.code}`}
                          </Text>
                        )}
                        <Text size="18px" color="currentColor" lineHeight="normal">
                          {selectedPlanCheckoutData?.price <= 0
                            ? selectedPlanCheckoutData?.priceText
                            : `$${discountCoupon?.slug
                              ? getPriceWithDiscount().price
                              : selectedPlanCheckoutData?.price} ${selectedPlanCheckoutData?.currency?.code}`}
                        </Text>
                      </Flex>
                    </Flex>
                  </>
                )}
              </Flex>
            ) : (
              <Skeleton height="350px" width="490px" borderRadius="11px" zIndex={10} opacity={1} />
            )}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Checkout;
