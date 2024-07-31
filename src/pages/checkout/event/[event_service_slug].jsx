/* eslint-disable camelcase */
import {
  Box,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import getT from 'next-translate/getT';
import { useRouter } from 'next/router';
import { getDataContentProps } from '../../../utils/file';
import bc from '../../../common/services/breathecode';
import useAuth from '../../../common/hooks/useAuth';
import { isWindow, removeURLParameter, getQueryString, getStorageItem } from '../../../utils';
import PaymentInfo from '../../../js_modules/checkout/PaymentInfo';
import useSignup from '../../../common/store/actions/signupAction';
import axiosInstance from '../../../axios';
import asPrivate from '../../../common/context/PrivateRouteWrapper';
import LoaderScreen from '../../../common/components/LoaderScreen';
import useStyle from '../../../common/hooks/useStyle';
import ServiceSummary from '../../../js_modules/checkout/ServiceSummary';
import SelectServicePlan from '../../../js_modules/checkout/SelectServicePlan';
import { ORIGIN_HOST } from '../../../utils/variables';
import { usePersistentBySession } from '../../../common/hooks/usePersistent';

export const getStaticPaths = async ({ locales }) => {
  const res = await bc.payment().getAllEventTypeSets();

  const data = res?.data || [];

  const paths = data.flatMap((r) => locales.map((locale) => ({
    params: {
      event_service_slug: r.slug,
    },
    locale,
  })));
  return {
    fallback: false,
    paths,
  };
};

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

function ServiceSlug() {
  const router = useRouter();
  const { query } = router;
  const { event_service_slug } = query;
  const {
    state, handleStep, handleServiceToConsume, isThirdStep, isFourthStep, setLoader, setCheckoutData,
  } = useSignup();
  const [readyToSelectService, setReadyToSelectService] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [, setDiscountCoupon] = useState({
    isError: false,
  });
  const { stepIndex, checkoutData, selectedPlanCheckoutData, serviceProps, loader } = state;
  const { backgroundColor3, backgroundColor } = useStyle();

  axiosInstance.defaults.headers.common['Accept-Language'] = router.locale;
  const { user, isAuthenticated, isLoading } = useAuth();
  const toast = useToast();
  const eventTypeSetSlug = event_service_slug;

  const accessToken = getStorageItem('accessToken');
  const tokenExists = accessToken !== null && accessToken !== undefined && accessToken.length > 5;
  const couponQuery = getQueryString('coupon');
  const [coupon] = usePersistentBySession('coupon', '');
  const formatedCouponQuery = couponQuery && couponQuery.replace(/[^a-zA-Z0-9-\s]/g, '');
  const couponString = coupon?.replaceAll('"', '') || '';
  const couponValue = couponString || formatedCouponQuery;

  const isPaymentSuccess = selectedPlanCheckoutData?.payment_success;

  const saveCouponToBag = (coupons, bagId = '') => {
    bc.payment({
      coupons,
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
    if (!isAuthenticated && !tokenExists) {
      setLoader('plan', false);
    }

    // Prepare service data to get consumables
    if (tokenExists && isAuthenticated) {
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
              item?.selected_event_type_set?.slug === eventTypeSetSlug
            ),
          );
          const planFinanncing = items?.plan_financings?.find(
            (item) => (
              item?.selected_event_type_set?.slug === eventTypeSetSlug
            ),
          );

          const currentSubscription = subscription || planFinanncing;

          const serviceData = currentSubscription?.selected_event_type_set;

          if (serviceData) {
            bc.payment({
              academy: Number(serviceData?.academy?.id),
              event_type_set: eventTypeSetSlug,
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
                      type: 'event',
                      ...serviceData,
                    },
                  });
                }
              });
          } else {
            setReadyToSelectService(true);
          }
        })
        .finally(() => {
          setLoader('plan', false);
        });
    }

    if (!isAuthenticated && !tokenExists) {
      setLoader('plan', false);
    }
  }, [accessToken, isAuthenticated, router.locale]);

  useEffect(() => {
    if (user?.id && !isLoading) {
      // if queryString token exists clean it from the url
      if (router.query.token) {
        const cleanTokenQuery = isWindow && removeURLParameter(window.location.href, 'token');
        router.push(cleanTokenQuery);
      }
    }
  }, [user?.id]);

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
