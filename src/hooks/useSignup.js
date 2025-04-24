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
  formatCohortSchedule,
  getBrowserInfo,
  toCapitalize,
  unSlugify,
  slugToTitle,
  unSlugifyCapitalize,
} from '../utils';
import { BREATHECODE_HOST, currenciesSymbols, BASE_PLAN } from '../utils/variables';
import { reportDatalayer } from '../utils/requests';
import { usePersistent } from './usePersistent';
import useSession from './useSession';
import useAuth from './useAuth';
import useCustomToast from './useCustomToast';
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

  const stepsEnum = {
    CONTACT: 0,
    CHOOSE_CLASS: 1,
    SUMMARY: 2,
    PAYMENT: 3,
  };

  const isFirstStep = stepIndex === stepsEnum.CONTACT; // Contact
  const isSecondStep = stepIndex === stepsEnum.CHOOSE_CLASS; // Choose your class
  const isThirdStep = stepIndex === stepsEnum.SUMMARY; // Summary
  const isFourthStep = stepIndex === stepsEnum.PAYMENT; // Payment

  const translations = {
    one_payment: t('signup:one_payment'),
    free_trial: t('signup:free_trial'),
    monthly_payment: t('signup:monthly_payment'),
    quarterly_payment: t('signup:quarterly_payment'),
    half_yearly_payment: t('signup:half_yearly_payment'),
    yearly_payment: t('signup:yearly_payment'),
    free: t('signup:free'),
    totally_free: t('signup:totally_free'),
    free_trial_period: (qty, period) => {
      const periodValue = period?.toLowerCase();
      const singularTranslation = {
        day: t('common:word-connector.day'),
        week: t('common:word-connector.week'),
        month: t('common:word-connector.month'),
        year: t('common:word-connector.year'),
      };
      const pluralTranslation = {
        day: t('common:word-connector.days'),
        week: t('common:word-connector.weeks'),
        month: t('common:word-connector.months'),
        year: t('common:word-connector.years'),
      };
      const periodText = qty > 1 ? pluralTranslation[periodValue] : singularTranslation[periodValue];
      return t('signup:info.free-trial-period', { qty, period: periodText });
    },
    one_payment_description: t('signup:one_payment_description'),
    monthly_payment_description: t('signup:monthly_payment_description'),
    quarterly_payment_description: t('signup:quarterly_payment_description'),
    half_yearly_payment_description: t('signup:half_yearly_payment_description'),
    yearly_payment_description: t('signup:yearly_payment_description'),
    checkout_featured_info: (planSlug) => t(`signup:custom-plans-pricing.${planSlug}.checkout_features`, {}, { returnObjects: true }),
    financing_description: (price, months, currency) => t('signup:financing_many_months_description', { monthly_price: price, many_months: months, currency }),
    monthly: t('signup:info.monthly'),
    quarterly: t('signup:info.quarterly'),
    half_yearly: t('signup:info.half-yearly'),
    yearly: t('signup:info.yearly'),
    financing: t('signup:info.financing'),
    many_months_payment: (qty) => t('signup:many_months_payment', { qty }),
  };

  /**
 * Process the plans data and return the formatted data.
 *
 * @param {object} data - The plans data
 * @param {object} options - Options for processing the plans (optional)
 * @param {boolean} options.monthly - Whether to include monthly plans (default: true)
 * @param {boolean} options.quarterly - Whether to include quarterly plans (default: true)
 * @param {boolean} options.halfYearly - Whether to include half-yearly plans (default: true)
 * @param {boolean} options.yearly - Whether to include yearly plans (default: true)
 * @param {string} options.planType - Tag to be added to the plan data (optional)
 * @returns {Promise<object>} - The processed plans data
 */
  const processPlans = async (data, {
    monthly = true,
    quarterly = true,
    halfYearly = true,
    yearly = true,
    planType = '',
  } = {}) => {
    try {
      const slug = encodeURIComponent(data?.slug);
      const resp = await bc.payment().getServiceItemsByPlan(slug);
      if (!resp) {
        throw new Error('The plan does not exist');
      }
      const planData = Array.isArray(translations.checkout_featured_info(data?.slug)) ? translations.checkout_featured_info(data?.slug) : resp?.data;
      const owner = data?.owner;

      const existsAmountPerHalf = data?.price_per_half > 0;
      const existsAmountPerMonth = data?.price_per_month > 0;
      const existsAmountPerQuarter = data?.price_per_quarter > 0;
      const existsAmountPerYear = data?.price_per_year > 0;

      const hasPayaBleSuscription = existsAmountPerHalf || existsAmountPerMonth || existsAmountPerQuarter || existsAmountPerYear;
      const financingOptionsExists = data?.financing_options?.length > 0;

      const singlePlan = data?.plans?.length > 0 ? data?.plans?.[0] : data;
      const isTotallyFree = !hasPayaBleSuscription && singlePlan?.trial_duration === 0 && !financingOptionsExists;
      const hasSubscriptionMethod = hasPayaBleSuscription || isTotallyFree || singlePlan?.trial_duration_unit > 0;

      const financingOptions = data?.financing_options
        .filter((l) => l.monthly_price > 0 && l.how_many_months > 1)
        .sort((a, b) => a.monthly_price - b.monthly_price) || [];
      const financingOptionsOnePayment = data?.financing_options?.filter((l) => l?.monthly_price > 0 && l?.how_many_months === 1) || [];

      const relevantInfo = {
        plan_slug: singlePlan?.slug,
        currency: singlePlan?.currency,
        featured_info: planData,
        trial_duration: singlePlan?.trial_duration || 0,
        trial_duration_unit: singlePlan?.trial_duration_unit || '',
        planType,
        show: true,
        isFreeTier: false,
        owner,
      };

      const textInfo = {
        free: translations?.free || 'Free',
        totally_free: translations?.totally_free || 'Totally free',
        free_trial: translations?.free_trial || 'Free trial',
        one_payment: translations?.one_payment || 'One payment',
        monthly_payment: translations?.monthly_payment || 'Monthly payment',
        quarterly_payment: translations?.quarterly_payment || 'Quarterly payment',
        half_yearly_payment: translations?.half_yearly_payment || 'Half yearly payment',
        yearly_payment: translations?.yearly_payment || 'Yearly payment',
        many_months_payment: (qty) => translations?.many_months_payment(qty) || `Payment for ${qty} months`,
        label: {
          free_trial_period: (qty, period) => {
            const periodToLowerCase = period?.toLowerCase();
            return translations?.free_trial_period(qty, periodToLowerCase) || `Free trial for ${qty} ${periodToLowerCase}`;
          },
          free: translations?.free || 'Free',
          monthly: translations?.monthly || 'Monthly',
          quarterly: translations?.quarterly || 'Quarterly',
          half_yearly: translations?.half_yearly || 'Half yearly',
          yearly: translations?.yearly || 'Yearly',
          financing: translations?.financing || 'Financing',
        },
      };
      const trialPlanDescription = isTotallyFree
        ? textInfo.totally_free
        : textInfo.label.free_trial_period(singlePlan?.trial_duration, singlePlan?.trial_duration_unit);

      // plan_id seems to be a manually designed pattern none related to the database id
      const onePaymentFinancing = financingOptionsOnePayment.map((item) => ({
        ...relevantInfo,
        title: textInfo.one_payment,
        price: item?.monthly_price,
        priceText: `${currenciesSymbols[item?.currency?.code] || '$'}${item?.monthly_price}`,
        period: 'ONE_TIME',
        period_label: textInfo.one_payment,
        plan_id: `f-${item?.monthly_price}-${item?.how_many_months}`,
        description: translations?.one_payment_description || '',
        how_many_months: item?.how_many_months,
        type: 'PAYMENT',
      }));

      const trialPlan = (!financingOptionsExists && !hasPayaBleSuscription) ? {
        ...relevantInfo,
        title: singlePlan?.title ? singlePlan?.title : unSlugifyCapitalize(String(singlePlan?.slug)),
        price: 0,
        priceText: isTotallyFree ? textInfo.free : textInfo.free_trial,
        plan_id: `p-${singlePlan?.trial_duration}-trial`,
        description: trialPlanDescription,
        period: isTotallyFree ? 'FREE' : singlePlan?.trial_duration_unit,
        period_label: trialPlanDescription,
        type: isTotallyFree ? 'FREE' : 'TRIAL',
        isFreeTier: true,
      } : {};

      const monthPlan = monthly && existsAmountPerMonth ? {
        ...relevantInfo,
        title: singlePlan?.title ? singlePlan?.title : textInfo.monthly_payment,
        price: data?.price_per_month,
        pricePerMonth: data?.price_per_month,
        priceText: `${currenciesSymbols[singlePlan?.currency?.code] || '$'}${data?.price_per_month}`,
        plan_id: `p-${data?.price_per_month}`,
        description: translations?.yearly_payment_description || '',
        period: 'MONTH',
        period_label: textInfo.label.monthly,
        type: 'PAYMENT',
      } : {};

      const quarterPlan = quarterly && existsAmountPerQuarter ? {
        ...relevantInfo,
        title: singlePlan?.title ? singlePlan?.title : textInfo.quarterly_payment,
        price: data?.price_per_quarter,
        pricePerMonth: data?.price_per_quarter ? (data.price_per_quarter / 4).toFixed(2) : 0,
        pricePerMonthText: `${currenciesSymbols[data?.currency?.code] || '$'}${data?.price_per_quarter ? (data.price_per_quarter / 4).toFixed(2) : 0}`,
        priceText: `${currenciesSymbols[data?.currency?.code] || '$'}${data?.price_per_quarter || 0}`,
        plan_id: `p-${data?.price_per_quarter || 0}`,
        description: translations?.quarterly_payment_description || '',
        period: 'QUARTER',
        period_label: textInfo.label.quarterly,
        type: 'PAYMENT',
        show: false,
      } : {};

      const halfPlan = halfYearly && existsAmountPerHalf ? {
        ...relevantInfo,
        title: singlePlan?.title ? singlePlan?.title : textInfo.half_yearly_payment,
        price: data?.price_per_half,
        pricePerMonth: data?.price_per_half ? (data.price_per_half / 6).toFixed(2) : 0,
        pricePerMonthText: `${currenciesSymbols[data?.currency?.code] || '$'}${data?.price_per_half ? (data.price_per_half / 6).toFixed(2) : 0}`,
        priceText: `${currenciesSymbols[data?.currency?.code] || '$'}${data?.price_per_half || 0}`,
        plan_id: `p-${data?.price_per_half || 0}`,
        description: translations?.half_yearly_payment_description || '',
        period: 'HALF',
        period_label: textInfo.label.half_yearly,
        type: 'PAYMENT',
        show: false,
      } : {};

      const yearPlan = yearly && existsAmountPerYear ? {
        ...relevantInfo,
        title: singlePlan?.title ? singlePlan?.title : textInfo.yearly_payment,
        price: data?.price_per_year,
        pricePerMonth: data?.price_per_year ? (data.price_per_year / 12).toFixed(2) : 0,
        pricePerMonthText: `${currenciesSymbols[data?.currency?.code] || '$'}${data?.price_per_year ? (data.price_per_year / 12).toFixed(2) : 0}`,
        priceText: `${currenciesSymbols[data?.currency?.code] || '$'}${data?.price_per_year || 0}`,
        plan_id: `p-${data?.price_per_year || 0}`,
        description: translations?.yearly_payment_description || '',
        period: 'YEAR',
        period_label: textInfo.label.yearly,
        type: 'PAYMENT',
      } : {};

      const financingOption = financingOptions.map((item, index) => {
        const financingTitle = translations.many_months_payment(item?.how_many_months);
        const financingOptionsDescription = translations?.financing_description(item?.monthly_price, item?.how_many_months, currenciesSymbols[item?.currency?.code] || '$');
        return ({
          ...relevantInfo,
          financingId: index + 1,
          title: singlePlan?.title ? singlePlan?.title : financingTitle,
          price: item?.monthly_price,
          priceText: `${currenciesSymbols[item?.currency?.code] || '$'}${item?.monthly_price} x ${item?.how_many_months}`,
          plan_id: `f-${item?.monthly_price}-${item?.how_many_months}`,
          description: financingOptionsDescription || '',
          period: 'FINANCING',
          period_label: textInfo.label.financing,
          how_many_months: item?.how_many_months,
          type: 'PAYMENT',
        });
      });

      const planList = [trialPlan, onePaymentFinancing[0], yearPlan, halfPlan, quarterPlan, monthPlan, ...financingOption].filter((plan) => Object.keys(plan).length > 0 && plan.show);
      const paymentList = [onePaymentFinancing[0], yearPlan, monthPlan, trialPlan].filter((plan) => Object.keys(plan).length > 0);
      const financingList = financingOption?.filter((plan) => Object.keys(plan).length > 0);

      return {
        ...data,
        title: data?.title || slugToTitle(data?.slug),
        isTotallyFree,
        isTrial: !hasPayaBleSuscription && !financingOptionsExists,
        plans: planList,
        featured_info: planData || [],
        paymentOptions: paymentList,
        financingOptions: financingList,
        hasSubscriptionMethod,
      };
    } catch (error) {
      console.error('Error processing plans:', error);
      return error;
    }
  };

  /**
 * @param {String} planSlug // Base plan slug to generate list of prices
 * @returns {Promise<object>} // Formated object of data with list of prices
 */
  const generatePlan = async (planSlug) => {
    try {
      const resp = await bc.payment().getPlan(planSlug);
      const data = await processPlans(resp?.data);
      return data;
    } catch (error) {
      console.error('Error generating plan:', error);
      return {};
    }
  };

  /**
 * Get the suggested plan based on the provided slug.
 *
 * @param {string} slug - Original plan slug
 * @param {boolean} ignoreProcessPlans - Whether to ignore processing the plans (optional)
 * @returns {Promise<object>} - The suggested with formated data data.
 */
  const getSuggestedPlan = async (slug, ignoreProcessPlans = false) => {
    try {
      const { data } = await bc.payment({
        original_plan: slug,
      }).planOffer();

      if (data?.length === 0) {
        return null;
      }

      const planComparison = data[0];

      if (!ignoreProcessPlans) {
        const originalPlan = planComparison?.original_plan;
        const suggestedPlan = planComparison?.suggested_plan;

        const dataForOriginPlan = originalPlan.slug ? await processPlans(originalPlan, {
          quarterly: false,
          halfYearly: false,
          planType: 'original',
        }) : {};

        const dataForSuggestedPlan = suggestedPlan.slug ? await processPlans(suggestedPlan, {
          quarterly: false,
          halfYearly: false,
          planType: 'suggested',
        }, translations) : {};

        return ({
          plans: {
            original_plan: {
              ...dataForOriginPlan,
              originData: originalPlan,
            },
            suggested_plan: {
              ...dataForSuggestedPlan,
              originData: suggestedPlan,
            },
          },
          details: planComparison?.details,
          title: planComparison?.details?.title,
        });
      }
      return planComparison;
    } catch (err) {
      return err?.response?.data;
    }
  };

  /**
 * @param {String} planSlug Original plan slug
 * @param {String} version Version of the component
 * @returns {Promise<object>} Formated original and suggested plan data
 */
  const handleSuggestedPlan = async (planSlug, version = 'default') => {
    try {
      const suggestedPlanData = await getSuggestedPlan(planSlug);
      if (version === 'default') {
        if (!suggestedPlanData || suggestedPlanData.length === 0) {
          const originalPlanData = await generatePlan(planSlug);
          return {
            plans: {
              original_plan: originalPlanData,
              suggested_plan: {},
            },
            details: {},
            title: originalPlanData?.title || '',
            planList: [...originalPlanData?.plans || []],
          };
        }
        return {
          ...suggestedPlanData,
          planList: [
            ...suggestedPlanData?.plans?.original_plan?.plans || [],
            ...suggestedPlanData?.plans?.suggested_plan?.plans || [],
          ],
        };
      }
      if (version === 'mkt_plans') {
        if (!suggestedPlanData || suggestedPlanData.length === 0) {
          const originalPlanData = await generatePlan(planSlug);
          return {
            ...originalPlanData,
            planList: originalPlanData?.plans || [],
            plans: {
              original_plan: originalPlanData,
              suggested_plan: {},
            },
            details: {},
            title: originalPlanData?.title || '',
          };
        }
        const originalPlanProps = suggestedPlanData.plans?.original_plan || {};
        const suggestedPlanProps = suggestedPlanData.plans?.suggested_plan || {};
        const originalPlan = originalPlanProps?.plans || [];
        const suggestedPlan = suggestedPlanProps?.plans || [];
        const formatedPlanData = {
          planList: [...originalPlan, ...suggestedPlan],
          plans: {
            original_plan: originalPlanProps,
            suggested_plan: suggestedPlanProps,
          },
          slug: suggestedPlanProps?.slug || originalPlanProps.slug || '',
          financingOptions: [
            ...originalPlanProps?.financingOptions || [],
            ...suggestedPlanProps?.financingOptions || []],
          paymentOptions: [
            ...originalPlanProps?.paymentOptions || [],
            ...suggestedPlanProps?.paymentOptions || []],
        };

        return formatedPlanData;
      }
      return {
        ...suggestedPlanData,
        planList: [
          ...suggestedPlanData?.plans?.original_plan?.plans || [],
          ...suggestedPlanData?.plans?.suggested_plan?.plans || [],
        ],
      };
    } catch (error) {
      console.error(error);
      return {};
    }
  };

  /**
 * @param {Array} subscriptions List of subscriptions of user
 * @param {String} plan Base plan slug
 * @returns {Promise<PlanExistenceObject>}
 */
  const validatePlanExistence = async (subscriptions, plan = '') => {
    const planSlug = plan || BASE_PLAN;
    try {
      const planComparison = await getSuggestedPlan(planSlug, true);
      const basePlan = planComparison?.original_plan;
      const suggestedPlan = planComparison?.suggested_plan;

      const hasBasePlan = subscriptions.some((s) => s?.plans?.[0]?.slug === basePlan?.slug);
      const hasASuggestedPlan = subscriptions.some((s) => s?.plans?.[0]?.slug === suggestedPlan?.slug);

      return {
        basePlan,
        suggestedPlan,
        hasBasePlan,
        hasASuggestedPlan,
        allSubscriptions: subscriptions,
      };
    } catch (error) {
      return {
        basePlan: {},
        suggestedPlan: {},
        hasBasePlan: false,
        hasASuggestedPlan: false,
        allSubscriptions: subscriptions,
      };
    }
  };

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
          if (cohortPlans[0]?.plan?.currency?.code) currency = cohortPlans[0].plan.currency.code;
          simplePlans = cohortPlans.map((cohortPlan) => {
            const { plan } = cohortPlan;
            const { service_items, ...restOfPlan } = plan;
            return { plan: { ...restOfPlan } };
          });
        }

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
    const selectedPlan = cohortData?.plan;
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
      const finalData = await generatePlan(planSlug, translations);
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
        const { kickoffDate, weekDays, availableTime } = formatCohortSchedule(cohortData);
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
    stepsEnum,
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
    processPlans,
    handleSuggestedPlan,
    validatePlanExistence,
  };
};

export default useSignup;
