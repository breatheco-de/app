/* eslint-disable camelcase */
import {
  Avatar,
  Box,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import getT from 'next-translate/getT';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { getDataContentProps } from '../utils/file';
import bc from '../common/services/breathecode';
import useAuth from '../common/hooks/useAuth';
import ContactInformation from '../js_modules/checkout/ContactInformation';
import ChooseYourClass from '../js_modules/checkout/ChooseYourClass';
import { isWindow, getTimeProps, removeURLParameter, getQueryString, getStorageItem } from '../utils';
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
import { ORIGIN_HOST } from '../utils/variables';

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
  const [isPreselectedCohort, setIsPreselectedCohort] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [serviceToRequest, setServiceToRequest] = useState({});
  const [verifyEmailProps, setVerifyEmailProps] = useState({});
  const {
    state, toggleIfEnrolled, nextStep, prevStep, handleStep, handleChecking, setCohortPlans,
    handleServiceToConsume, isFirstStep, isSecondStep, isThirdStep, isFourthStep,
  } = useSignup();
  const [readyToSelectService, setReadyToSelectService] = useState(false);
  const { stepIndex, dateProps, checkoutData, alreadyEnrolled, serviceProps } = state;
  const { backgroundColor3 } = useStyle();

  const cohorts = cohortsData?.cohorts;

  axiosInstance.defaults.headers.common['Accept-Language'] = router.locale;
  const { user, isAuthenticated, isLoading } = useAuth();
  const toast = useToast();
  const plan = getQueryString('plan');
  const queryPlans = getQueryString('plans');
  const mentorshipServiceSetSlug = getQueryString('mentorship_service_set');
  const eventTypeSetSlug = getQueryString('event_type_set');
  const planFormated = plan && encodeURIComponent(plan);
  const accessToken = getStorageItem('accessToken');
  const tokenExists = accessToken !== null && accessToken !== undefined && accessToken.length > 5;

  const {
    course, cohort,
  } = router.query;
  const courseChoosed = course;

  const [formProps, setFormProps] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    confirm_email: '',
  });

  const queryPlanExists = planFormated && planFormated?.length > 0;
  const queryMentorshipServiceSlugExists = mentorshipServiceSetSlug && mentorshipServiceSetSlug?.length > 0;
  const queryEventTypeSetSlugExists = eventTypeSetSlug && eventTypeSetSlug?.length > 0;
  const queryPlansExists = queryPlans && queryPlans?.length > 0;
  const filteredCohorts = Array.isArray(cohorts) && cohorts.filter((item) => item?.never_ends === false);

  const queryServiceExists = queryMentorshipServiceSlugExists || queryEventTypeSetSlugExists;

  useEffect(() => {
    const isAvailableToSelectPlan = queryPlansExists && queryPlans?.split(',')?.length > 0;
    if (isAuthenticated && isAvailableToSelectPlan && queryServiceExists) {
      setReadyToSelectService(true);
    }
    if (!queryPlanExists && tokenExists && isAuthenticated && !isAvailableToSelectPlan) {
      setIsPreloading(true);
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
          }
        });
      setTimeout(() => {
        setIsPreloading(false);
      }, 2600);
    }
    if (!queryServiceExists && queryPlanExists && tokenExists && !cohortsData.loading) {
      setIsPreloading(true);

      bc.payment().getPlan(planFormated)
        .then((resp) => {
          const data = resp?.data;
          const existsAmountPerHalf = data?.price_per_half > 0;
          const existsAmountPerMonth = data?.price_per_month > 0;
          const existsAmountPerQuarter = data?.price_per_quarter > 0;
          const existsAmountPerYear = data?.price_per_year > 0;
          const fiancioptionsExists = data?.financing_options?.length > 0 && data?.financing_options?.[0]?.monthly_price > 0;

          const isNotTrial = existsAmountPerHalf || existsAmountPerMonth || existsAmountPerQuarter || existsAmountPerYear || fiancioptionsExists;

          if ((resp && resp?.status >= 400) || resp?.data.length === 0) {
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
              setIsPreselectedCohort(true);
              const { kickoffDate, weekDays, availableTime } = cohorts?.[0] ? getTimeProps(cohorts[0]) : {};
              const defaultCohortProps = {
                ...cohorts[0],
                kickoffDate,
                weekDays,
                availableTime,
              };

              setCohortPlans([data]);
              handleChecking({ ...defaultCohortProps, plan: data })
                .then(() => {
                  handleStep(2);
                });
            }
            if (cohorts.length === 0) {
              setCohortPlans([{
                plan: data,
              }]);
              handleChecking({ plan: data })
                .then(() => {
                  handleStep(2);
                });
            }
          }

          if (data?.is_renewable === false || data?.is_renewable === undefined) {
            handleStep(1);
          }
        })
        .catch(() => {
          toast({
            position: 'top',
            title: t('alert-message:no-plan-configuration'),
            status: 'info',
            duration: 4000,
            isClosable: true,
          });
        });
      setTimeout(() => {
        setIsPreloading(false);
      }, 2600);
    }
  }, [cohortsData.loading, accessToken, isAuthenticated]);

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
  }, [user?.id, cohort]);

  const handleGoBack = () => {
    const handler = () => {
      if (stepIndex > 0) {
        prevStep();
      }
    };
    return {
      isNotAvailable: (queryPlanExists && !isFourthStep && !dateProps?.id) || isSecondStep || (isThirdStep && filteredCohorts?.length === 1),
      must_hidde: isPreselectedCohort && isThirdStep,
      func: handler,
    };
  };

  return (
    <Box p={{ base: '2.5rem 0', md: '2.5rem 2rem' }} background={backgroundColor3} position="relative" minHeight={isPreloading ? '727px' : 'auto'}>
      {isPreloading && (
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
        isOpen={verifyEmailProps.state}
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
      {/* Stepper */}
      {!readyToSelectService && !serviceToRequest?.id && (
        <Stepper
          stepIndex={stepIndex}
          checkoutData={checkoutData}
          isFirstStep={isFirstStep}
          isSecondStep={isSecondStep}
          isThirdStep={isThirdStep}
          isFourthStep={isFourthStep}
          handleGoBack={handleGoBack}
        />
      )}

      <Box
        display="flex"
        flexDirection="column"
        gridGap={{ base: '20px', md: '20px' }}
        minHeight="320px"
        maxWidth={{ base: '100%', md: '900px' }}
        margin={{ base: '1.5rem auto 0 auto', md: serviceToRequest?.id ? '3.5rem auto' : '3.5rem auto 0 auto' }}
        padding={{ base: '0px 20px', md: '0' }}
        // borderRadius={{ base: '22px', md: '0' }}
      >
        {!readyToSelectService && isFirstStep && (
          <ContactInformation
            courseChoosed={courseChoosed}
            formProps={formProps}
            setFormProps={setFormProps}
            setVerifyEmailProps={setVerifyEmailProps}
          />
        )}

        {/* Second step */}
        {!readyToSelectService && (
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
        {!queryServiceExists && ((stepIndex !== 0 && !isSecondStep) || (stepIndex !== 0 && !isSecondStep && !isThirdStep && !isFourthStep)) && (
          <>
            <Box as="hr" width="100%" margin="10px 0" />
            <Box display="flex" justifyContent="space-between" mt="auto">
              {!handleGoBack().must_hidde && handleGoBack().isNotAvailable === false && (
                <Button
                  variant="outline"
                  borderColor="currentColor"
                  color="blue.default"
                  isDisabled={handleGoBack().isNotAvailable}
                  onClick={() => handleGoBack().func()}
                >
                  {t('go-back')}
                </Button>
              )}
              {stepIndex !== 0 && !isSecondStep && !isThirdStep && !isFourthStep && (
                <Button
                  variant="default"
                  isDisabled={dateProps === null}
                  onClick={() => {
                    nextStep();
                  }}
                >
                  {t('next-step')}
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default Checkout;
