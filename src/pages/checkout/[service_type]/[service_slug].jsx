/* eslint-disable camelcase */
import {
  Box,
  Flex,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import bc from '../../../common/services/breathecode';
import useAuth from '../../../common/hooks/useAuth';
import { isWindow } from '../../../utils';
import PaymentInfo from '../../../common/components/Checkout/PaymentInfo';
import ServiceSummary from '../../../common/components/Checkout/ServiceSummary';
import SelectServicePlan from '../../../common/components/Checkout/SelectServicePlan';
import useSignup from '../../../common/store/actions/signupAction';
import axiosInstance from '../../../axios';
import asPrivate from '../../../context/PrivateRouteWrapper';
import LoaderScreen from '../../../common/components/LoaderScreen';
import useStyle from '../../../common/hooks/useStyle';
import useCustomToast from '../../../common/hooks/useCustomToast';

function ServiceSlug() {
  const router = useRouter();
  const { query } = router;
  const { service_type, service_slug } = query;
  const {
    state, handleStep, handleServiceToConsume, isThirdStep, isFourthStep, setLoader, restartSignup,
  } = useSignup();
  const [readyToSelectService, setReadyToSelectService] = useState(false);
  const { stepIndex, selectedPlanCheckoutData, serviceProps, loader } = state;
  const { backgroundColor3, backgroundColor } = useStyle();

  axiosInstance.defaults.headers.common['Accept-Language'] = router.locale;
  const { isAuthenticated } = useAuth();
  const { createToast } = useCustomToast({ toastId: 'checkout-error-string' });

  const isPaymentSuccess = selectedPlanCheckoutData?.payment_success;

  const voidServices = ['ai-compilation'];
  const allowedServiceTypes = ['compilation', 'mentorship', 'event'];

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

  const getServiceData = async () => {
    // Prepare service data to get consumables
    try {
      setLoader('plan', true);
      const { data } = await bc.payment({
        status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE',
      }).subscriptions();

      const { subscriptions, plan_financings } = data;

      const subscription = subscriptions?.find(
        (item) => (
          item?.selected_mentorship_service_set?.slug === service_slug
          || item?.selected_event_type_set?.slug === service_slug
        ),
      );
      const planFinanncing = plan_financings?.find(
        (item) => (
          item?.selected_mentorship_service_set?.slug === service_slug
          || item?.selected_event_type_set?.slug === service_slug
        ),
      );

      const currentSubscription = subscription || planFinanncing;

      const serviceTypesFields = {
        event: 'selected_event_type_set',
        mentorship: 'selected_mentorship_service_set',
      };

      const serviceData = currentSubscription?.[serviceTypesFields[service_type]];

      const allSubscriptions = [...subscriptions, ...plan_financings];

      if (serviceData || (voidServices.includes(service_slug) && allSubscriptions.length > 0)) {
        let service;
        let resp;
        let respData;

        if (serviceData) {
          resp = await bc.payment({
            academy: Number(serviceData?.academy?.id),
            event_type_set: service_type === 'event' ? service_slug : undefined,
            mentorship_service_set: service_type === 'mentorship' ? service_slug : undefined,
          }).service().getAcademyService();
          respData = await resp.json();
          // eslint-disable-next-line prefer-destructuring
          [service] = respData;
        } else {
          resp = await bc.payment({
            academy: allSubscriptions[0].academy.id,
          }).service().getAcademyServiceBySlug(service_slug);
          respData = await resp.json();
          service = respData;
        }

        if (resp.status > 400) {
          createToast({
            title: respData.detail,
            status: 'error',
            duration: 6000,
            position: 'top',
          });
        }
        if (resp.status < 400 && respData !== undefined && service) {
          handleStep(2);
          handleServiceToConsume({
            ...service,
            serviceInfo: {
              type: service_type,
              ...serviceData,
            },
          });
        }
      } else {
        setReadyToSelectService(true);
      }
    } finally {
      setLoader('plan', false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getServiceData();
    }
  }, [isAuthenticated, router.locale]);

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    if (!allowedServiceTypes.includes(service_type)) router.push('/404');
    return () => {
      restartSignup();
    };
  }, []);

  return (
    <Box p={{ base: '0 0', md: '0' }} background={backgroundColor3} position="relative" minHeight={loader.plan ? '727px' : 'auto'}>
      {loader.plan && (
        <LoaderScreen />
      )}
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
          overflow="auto"
        >
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
      </Flex>
    </Box>
  );
}

export default asPrivate(ServiceSlug);
