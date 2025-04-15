/* eslint-disable camelcase */
/* eslint-disable no-unsafe-optional-chaining */
import { useSelector } from 'react-redux';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import signupAction from '../store/actions/signupAction';
import bc from '../services/breathecode';
import {
  formatPrice,
  getDiscountedPrice,
  getNextDateInMonths,
  getQueryString,
  getStorageItem,
  getTimeProps,
  getBrowserInfo,
  toCapitalize,
  unSlugify,
} from '../utils';
import { BREATHECODE_HOST } from '../utils/variables';
import { reportDatalayer } from '../utils/requests';
import { usePersistent } from './usePersistent';
import useSession from './useSession';
import useAuth from './useAuth';
import useCustomToast from './useCustomToast';
import { generatePlan, getTranslations } from '../handlers/subscriptions';
import axiosInstance from '../axios';

const useSignup = () => {
  const { isAuthenticated } = useAuth();
  const { userSession } = useSession();
  const state = useSelector((sl) => sl.signupReducer);
  const {
    setLoader,
    setDateProps,
    setCheckoutData,
    setPaymentMethods,
    setPlanProps,
    handleStep,
    toggleIfEnrolled,
    setServiceProps,
    setSelfAppliedCoupon,
  } = signupAction();
  const [, setSubscriptionProcess] = usePersistent('subscription-process', null);
  const { t } = useTranslation('signup');
  const { createToast } = useCustomToast({ toastId: 'error-payment-transaction' });
  const router = useRouter();
  const { locale } = router;
  const redirect = getStorageItem('redirect');
  const redirectedFrom = getStorageItem('redirected-from');
  const couponsQuery = getQueryString('coupons');
  const planTranslationsObj = getTranslations(t);
  const defaultPlan = process.env.BASE_PLAN || 'basic';

  const subscriptionStatusDictionary = {
    PREPARING_FOR_COHORT: 'PREPARING_FOR_COHORT',
  };

  const { syllabus, academy } = router.query;
  const nextMonthText = getNextDateInMonths(1).translation[locale];

  const {
    stepIndex,
    checkoutData,
    dateProps,
    cohortPlans,
    selectedPlanCheckoutData,
  } = state;

  const isFirstStep = stepIndex === 0; // Contact
  const isSecondStep = stepIndex === 1; // Choose your class
  const isThirdStep = stepIndex === 2; // Summary
  const isFourthStep = stepIndex === 3; // Payment

  const handlePayment = async (data, disableRedirects = false) => {
    const manyInstallmentsExists = selectedPlanCheckoutData?.how_many_months > 0 || selectedPlanCheckoutData?.period === 'FINANCING';
    const isTtrial = ['FREE', 'TRIAL'].includes(selectedPlanCheckoutData?.type);

    const getRequests = () => {
      if (!isTtrial) {
        return {
          type: data?.type || checkoutData.type,
          token: data?.token || checkoutData.token,
          how_many_installments: data?.installments || selectedPlanCheckoutData?.how_many_months || undefined,
          chosen_period: manyInstallmentsExists ? undefined : (selectedPlanCheckoutData?.period || 'HALF'),
          coupons: checkoutData?.coupons,
        };
      }
      return {
        type: data?.type || checkoutData.type,
        token: data?.token || checkoutData.token,
      };
    };

    try {
      const requests = getRequests();
      const response = await bc.payment().pay({
        ...requests,
        conversion_info: {
          ...userSession,
        },
      });

      const transactionData = await response.json();

      if (transactionData?.status === 'FULFILLED') {
        setSubscriptionProcess({
          status: subscriptionStatusDictionary.PREPARING_FOR_COHORT,
          id: dateProps?.id,
          slug: dateProps?.slug,
          plan_slug: dateProps?.plan?.slug,
          academy_info: dateProps?.academy,
        });

        let currency = 'USD';
        let simplePlans = [];
        if (cohortPlans) {
          currency = cohortPlans[0]?.plan?.currency?.code || 'USD';
          simplePlans = cohortPlans.map((cohortPlan) => {
            const { plan } = cohortPlan;
            const { service_items, ...restOfPlan } = plan;
            return { plan: { ...restOfPlan } };
          });
        }

        console.log('selectedPlanCheckoutData', selectedPlanCheckoutData);
        reportDatalayer({
          dataLayer: {
            event: 'purchase',
            value: selectedPlanCheckoutData?.price || 0,
            currency,
            payment_type: 'Credit card',
            plan: selectedPlanCheckoutData?.plan_slug || transactionData?.plan?.slug || defaultPlan,
            period_label: selectedPlanCheckoutData?.period_label || 'one-time',
            items: simplePlans,
            agent: getBrowserInfo(),
          },
        });

        if (!disableRedirects) {
          if ((redirect && redirect?.length > 0) || (redirectedFrom && redirectedFrom.length > 0)) {
            router.push(redirect || redirectedFrom);
            localStorage.removeItem('redirect');
            localStorage.removeItem('redirected-from');
          } else {
            router.push('/choose-program');
          }
        }

        if (transactionData === undefined || transactionData.status >= 400) {
          createToast({
            position: 'top',
            title: t('alert-message:payment-error'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
        }
      }

      return transactionData;
    } catch (error) {
      console.error('Error handling payment bc.payment().pay', error);
      return error;
    }
  };

  const getChecking = async (cohortData) => {
    const selectedPlan = cohortData?.plan ? cohortData?.plan : undefined;
    const cohortPlan = cohortPlans?.length > 0 ? cohortPlans[cohortData?.index || 0] : selectedPlan;

    const checkingBody = {
      type: 'PREVIEW',
      cohort: cohortData?.id || dateProps?.id,
      academy: cohortData?.academy?.id || dateProps?.academy?.id || (Number(academy) || undefined),
      syllabus,
      plans: [selectedPlan?.slug || (cohortPlans?.length > 0 ? cohortPlan?.slug : undefined)],
      coupons: couponsQuery ? [couponsQuery] : undefined,
    };

    try {
      const accessToken = getStorageItem('accessToken');
      const response = await fetch(`${BREATHECODE_HOST}/v1/payments/checking`, {
        method: 'PUT',
        headers: new Headers({
          'content-type': 'application/json',
          Authorization: `Token ${cohortData?.token || accessToken}`,
        }),
        body: JSON.stringify(checkingBody),
      });

      const data = await response.json();
      const currentPlan = data?.plans?.[0];
      const planSlug = encodeURIComponent(currentPlan?.slug);
      const finalData = await generatePlan(planSlug, planTranslationsObj);
      setPlanProps(finalData?.featured_info);

      if (response.status < 400) {
        const result = {
          ...data,
          ...finalData,
          id: data.id,
        };
        setCheckoutData(result);
        return result;
      }
      return response;
    } catch (error) {
      return error;
    } finally {
      setLoader('date', false);
    }
  };

  const handleServiceToConsume = (data) => {
    const discountRatio = data?.discount_ratio;
    const bundleSize = data?.bundle_size;
    const pricePerUnit = data?.price_per_unit;
    const maxItems = data?.max_items;
    const maxNumItems = Math.floor(maxItems / bundleSize);
    const allItems = [];

    const consumableTypes = {
      mentorship: 'mentorship sessions',
      event: 'events',
      compilation: 'compilations',
    };

    for (let num = 1; num <= maxNumItems; num += 1) {
      const numItems = num * bundleSize;

      if (numItems % bundleSize === 0) {
        const price = getDiscountedPrice({
          numItems, maxItems, discountRatio, bundleSize, pricePerUnit, startDiscountFrom: 1,
        });

        allItems.push({
          id: num,
          slug: `${numItems}-${data?.serviceInfo?.type}`,
          title: `${numItems} ${consumableTypes[data?.serviceInfo?.type]}`,
          qty: numItems,
          pricePerUnit: price.discounted / numItems,
          price: price.original,
          priceText: formatPrice(price.discounted, true),
          priceDiscounted: price.discounted,
          type: 'CONSUMABLE',
        });
      }
    }

    setServiceProps({
      ...data,
      list: allItems,
    });
  };

  const handleChecking = async (cohortData) => {
    try {
      if (cohortData?.id) {
        const { kickoffDate, weekDays, availableTime } = getTimeProps(cohortData);
        setDateProps({
          ...cohortData,
          kickoffDate,
          weekDays,
          availableTime,
        });
      }
      const data = await getChecking(cohortData);

      return data;
    } catch (err) {
      if (err?.status === 400) {
        handleStep(1);
        toggleIfEnrolled(true);
      } else {
        console.err(err);
      }
      return err;
    }
  };

  const getPaymentMethods = async (ownerId) => {
    try {
      if (isAuthenticated) {
        setLoader('paymentMethods', false);
        // const ownerId = selectedPlanCheckoutData.owner.id;
        setLoader('paymentMethods', true);
        const resp = await bc.payment({ academy_id: ownerId, lang: router.locale }).getpaymentMethods();
        if (resp.status < 400) {
          setPaymentMethods(resp.data);
        }
        setLoader('paymentMethods', false);
      }
    } catch (e) {
      console.log(e);
      setLoader('paymentMethods', false);
    }
  };

  const getPaymentText = () => {
    const planIsNotTrial = selectedPlanCheckoutData?.type !== 'TRIAL';
    const period = selectedPlanCheckoutData?.period;
    if (planIsNotTrial) {
      if (period === 'FINANCING') {
        const totalAmount = selectedPlanCheckoutData?.price * selectedPlanCheckoutData?.how_many_months;
        return t('info.will-pay-month', {
          price: selectedPlanCheckoutData?.price,
          qty_months: selectedPlanCheckoutData?.how_many_months,
          total_amount: Math.round(totalAmount * 100) / 100,
        });
      }
      if (
        selectedPlanCheckoutData?.financing_options?.length > 0
        && selectedPlanCheckoutData?.financing_options[0]?.monthly_price > 0
        && selectedPlanCheckoutData?.financing_options[0]?.how_many_months === 1
      ) {
        const totalAmount = selectedPlanCheckoutData?.financing_options[0]?.monthly_price * selectedPlanCheckoutData?.financing_options[0]?.how_many_months;
        return t('info.will-pay-month', {
          price: selectedPlanCheckoutData?.financing_options[0]?.monthly_price,
          qty_months: selectedPlanCheckoutData?.financing_options[0]?.how_many_months,
          total_amount: Math.round(totalAmount * 100) / 100,
        });
      }
      if (
        selectedPlanCheckoutData?.financing_options?.length > 0
        && selectedPlanCheckoutData?.financing_options[0]?.monthly_price > 0
        && selectedPlanCheckoutData?.financing_options[0]?.how_many_months > 0
      ) {
        const totalAmount = selectedPlanCheckoutData?.financing_options[0]?.monthly_price * selectedPlanCheckoutData?.financing_options[0]?.how_many_months;
        return t('info.will-pay-monthly', {
          price: selectedPlanCheckoutData?.financing_options[0]?.monthly_price,
          qty_months: selectedPlanCheckoutData?.financing_options[0]?.how_many_months,
          total_amount: Math.round(totalAmount * 100) / 100,
          next_month: nextMonthText,
        });
      }

      if (
        selectedPlanCheckoutData?.financing_options?.length > 0
        && selectedPlanCheckoutData?.financing_options[0]?.monthly_price > 0
        && selectedPlanCheckoutData?.financing_options[0]?.how_many_months === 0
      ) return t('info.will-pay-now', { price: selectedPlanCheckoutData?.financing_options[0]?.monthly_price });

      const periodPayments = {
        MONTH: t('info.will-pay-per-month', { price: selectedPlanCheckoutData?.price }),
        QUARTER: t('info.will-pay-per-quarter', { price: selectedPlanCheckoutData?.price }),
        HALF: t('info.will-pay-per-half-year', { price: selectedPlanCheckoutData?.price }),
        YEAR: t('info.will-pay-per-year', { price: selectedPlanCheckoutData?.price }),
        ONE_TIME: t('info.one-time-connector', { value: selectedPlanCheckoutData?.price }),
      };

      if (periodPayments[period]) {
        return periodPayments[period];
      }
    }

    return '';
  };

  const getPriceWithDiscount = (price, couponData) => {
    const discount = couponData?.discount_value;
    const discountType = couponData?.discount_type;
    if (discount) {
      if (discountType === 'PERCENT_OFF' || discountType === 'HAGGLING') {
        const roundedPrice = Math.round(((price - (price * discount)) + Number.EPSILON) * 100) / 100;
        return {
          originalPrice: price,
          price: roundedPrice,
          discount: `${discount * 100}%`,
          discountType,
        };
      }
      if (discountType === 'FIXED_PRICE') {
        return {
          originalPrice: price,
          price: price - discount,
          discount: `$${discount}`,
          discountType,
        };
      }
    }
    return {
      price,
      discount: '0%',
    };
  };

  const getSelfAppliedCoupon = async (plan) => {
    try {
      if (plan) {
        const { data } = await bc.payment({ plan }).verifyCoupon();
        const coupon = data[0];
        if (coupon) {
          setSelfAppliedCoupon({
            ...coupon,
            plan,
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const applyDiscountCouponsToPlans = (pricingList, coupon) => {
    if (!coupon) return pricingList;
    return pricingList.map((item) => {
      const { price } = item;
      if (price < 1) return item;
      const discountOperation = getPriceWithDiscount(price, coupon);
      return {
        ...item,
        price: discountOperation.price,
        priceText: item.priceText.replace(item.price, discountOperation.price),
        lastPrice: item.priceText,
      };
    });
  };

  const handleSubscribeToPlan = async ({ slug, accessToken, onSubscribedToPlan = () => {}, disableRedirects = false }) => {
    try {
      if (accessToken) {
        axiosInstance.defaults.headers.common.Authorization = `Token ${accessToken}`;
      }
      const data = await generatePlan(slug);

      onSubscribedToPlan(data);
      setPlanProps({
        ...data,
        title: toCapitalize(unSlugify(data?.slug)),
        bullets: data?.featured_info || [],
      });

      const respData = await handleChecking({ plan: data, token: accessToken });

      const respPayment = await handlePayment({
        ...respData,
        installments: respData?.how_many_months,
      }, disableRedirects);

      return respPayment;
    } catch (error) {
      console.error('Error handling subscribe to plan', error);
      createToast({
        position: 'top',
        title: t('alert-message:payment-error'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      return error;
    }
  };

  return {
    state,
    isFirstStep,
    isSecondStep,
    isThirdStep,
    isFourthStep,
    handlePayment,
    handleChecking,
    getPaymentText,
    handleServiceToConsume,
    getPaymentMethods,
    getPriceWithDiscount,
    getSelfAppliedCoupon,
    applyDiscountCouponsToPlans,
    subscriptionStatusDictionary,
    handleSubscribeToPlan,
  };
};

export default useSignup;
