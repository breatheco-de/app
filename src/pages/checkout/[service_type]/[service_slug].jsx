/* eslint-disable camelcase */
import {
  Box,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import bc from '../../../common/services/breathecode';
import useAuth from '../../../common/hooks/useAuth';
import { isWindow, getQueryString } from '../../../utils';
import PaymentInfo from '../../../js_modules/checkout/PaymentInfo';
import useSignup from '../../../common/store/actions/signupAction';
import axiosInstance from '../../../axios';
import asPrivate from '../../../common/context/PrivateRouteWrapper';
import LoaderScreen from '../../../common/components/LoaderScreen';
import useStyle from '../../../common/hooks/useStyle';
import ServiceSummary from '../../../js_modules/checkout/ServiceSummary';
import SelectServicePlan from '../../../js_modules/checkout/SelectServicePlan';
import { usePersistentBySession } from '../../../common/hooks/usePersistent';

function ServiceSlug() {
  const router = useRouter();
  const { query } = router;
  const { service_type, service_slug } = query;
  const {
    state, handleStep, handleServiceToConsume, isThirdStep, isFourthStep, setLoader, setCheckoutData, restartSignup,
  } = useSignup();
  const [readyToSelectService, setReadyToSelectService] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [, setDiscountCoupon] = useState({
    isError: false,
  });
  const { stepIndex, checkoutData, selectedPlanCheckoutData, serviceProps, loader } = state;
  const { backgroundColor3, backgroundColor } = useStyle();

  axiosInstance.defaults.headers.common['Accept-Language'] = router.locale;
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const couponQuery = getQueryString('coupon');
  const [coupon] = usePersistentBySession('coupon', '');
  const formatedCouponQuery = couponQuery && couponQuery.replace(/[^a-zA-Z0-9-\s]/g, '');
  const couponString = coupon?.replaceAll('"', '') || '';
  const couponValue = couponString || formatedCouponQuery;

  const isPaymentSuccess = selectedPlanCheckoutData?.payment_success;

  const saveCouponToBag = async (coupons, bagId = '') => {
    const resp = await bc.payment({
      coupons,
    }).applyCoupon(bagId);
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
  };

  const handleCoupon = async (coupons, actions) => {
    try {
      const resp = await bc.payment({
        coupons: [coupons || discountCode],
      }).verifyCoupon();
      if (resp?.data?.length > 0) {
        const couponsToString = resp?.data.map((item) => item?.slug);
        saveCouponToBag(couponsToString, checkoutData?.id);
      } else {
        setDiscountCoupon({
          isError: true,
        });
      }
    } finally {
      if (actions) {
        actions.setSubmitting(false);
      }
    }
  };

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

  const getServiceData = async () => {
    // Prepare service data to get consumables
    try {
      setLoader('plan', true);
      const { data } = await bc.payment({
        status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE',
      }).subscriptions();

      const subscriptionRespData = data;
      const items = {
        subscriptions: subscriptionRespData?.subscriptions,
        plan_financings: subscriptionRespData?.plan_financings,
      };
      const subscription = items?.subscriptions?.find(
        (item) => (
          item?.selected_mentorship_service_set?.slug === service_slug
          || item?.selected_event_type_set?.slug === service_slug
        ),
      );
      const planFinanncing = items?.plan_financings?.find(
        (item) => (
          item?.selected_mentorship_service_set?.slug === service_slug
          || item?.selected_event_type_set?.slug === service_slug
        ),
      );

      const currentSubscription = subscription || planFinanncing;

      const serviceData = currentSubscription?.selected_mentorship_service_set;

      if (serviceData) {
        const resp = await bc.payment({
          academy: Number(serviceData?.academy?.id),
          event_type_set: service_type === 'event' ? service_slug : undefined,
          mentorship_service_set: service_type === 'mentorship' ? service_slug : undefined,
        }).service().getAcademyService();
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
