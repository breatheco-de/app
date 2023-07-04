/* eslint-disable camelcase */
import {
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

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'signup');
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const finance = getDataContentProps(`public/locales/${locale}`, 'finance');
  const image = t('seo.image', {
    domain: process.env.WEBSITE_URL || 'https://4geeks.com',
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

const Checkout = () => {
  const { t } = useTranslation('signup');
  const router = useRouter();
  const [cohortsData, setCohortsData] = useState({
    loading: true,
  });
  const [isPreselectedCohort, setIsPreselectedCohort] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [serviceToRequest, setServiceToRequest] = useState({});
  const {
    state, toggleIfEnrolled, nextStep, prevStep, handleStep, handleChecking, setCohortPlans,
    handleServiceToConsume, isFirstStep, isSecondStep, isThirdStep, isFourthStep,
  } = useSignup();
  const { stepIndex, dateProps, checkoutData, alreadyEnrolled, serviceProps } = state;
  const { backgroundColor3 } = useStyle();

  const cohorts = cohortsData?.cohorts;

  axiosInstance.defaults.headers.common['Accept-Language'] = router.locale;
  const { user, isAuthenticated, isLoading } = useAuth();
  const toast = useToast();
  const plan = getQueryString('plan');
  const service = getQueryString('service');
  const academy = getQueryString('academy');
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
  const queryServiceExists = service && service?.length > 0;
  const filteredCohorts = Array.isArray(cohorts) && cohorts.filter((item) => item?.never_ends === false);

  useEffect(() => {
    if (queryServiceExists && academy && tokenExists && isAuthenticated) {
      bc.payment({
        academy: Number(academy),
      }).service().getAcademyService(service)
        .then((resp) => {
          if (resp !== undefined) {
            handleStep(2);
            handleServiceToConsume(resp?.data);
            setServiceToRequest(resp?.data);
          }
        })
        .catch(() => {});
    }
    if (queryPlanExists && tokenExists && !cohortsData.loading) {
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
          if ((data?.is_renewable === false && !isNotTrial) || data?.is_renewable === true || cohorts?.length === 1) {
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
      {!serviceToRequest?.id && (
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
        {isFirstStep && (
          <ContactInformation
            courseChoosed={courseChoosed}
            formProps={formProps}
            setFormProps={setFormProps}
          />
        )}

        {/* Second step */}
        <ChooseYourClass setCohorts={setCohortsData} />

        {isThirdStep && !serviceProps?.id && (
          <Summary />
        )}
        {isThirdStep && serviceProps?.id && (
          <ServiceSummary service={serviceProps} />
        )}
        {/* Fourth step */}
        {isFourthStep && (
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
                  disabled={handleGoBack().isNotAvailable}
                  onClick={() => handleGoBack().func()}
                >
                  {t('go-back')}
                </Button>
              )}
              {stepIndex !== 0 && !isSecondStep && !isThirdStep && !isFourthStep && (
                <Button
                  variant="default"
                  disabled={dateProps === null}
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
};

export default Checkout;
