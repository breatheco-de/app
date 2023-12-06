import { slugToTitle, unSlugifyCapitalize } from '../../utils';
import { BASE_PLAN } from '../../utils/variables';
import bc from '../services/breathecode';

export const SUBS_STATUS = {
  ACTIVE: 'ACTIVE',
  FREE_TRIAL: 'FREE_TRIAL',
  FULLY_PAID: 'FULLY_PAID',
  CANCELLED: 'CANCELLED',
  PAYMENT_ISSUE: 'PAYMENT_ISSUE',
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
 * @param {object} translations - Translations for plan content (optional)
 * @returns {Promise<object>} - The processed plans data
 */
export const processPlans = (data, {
  monthly = true,
  quarterly = true,
  halfYearly = true,
  yearly = true,
  planType = '',
} = {}, translations = {}) => bc.payment().getPlanProps(data?.slug)
  .then((resp) => {
    const planPropsData = resp?.data;
    const existsAmountPerHalf = data?.price_per_half > 0;
    const existsAmountPerMonth = data?.price_per_month > 0;
    const existsAmountPerQuarter = data?.price_per_quarter > 0;
    const existsAmountPerYear = data?.price_per_year > 0;
    const isNotTrial = existsAmountPerHalf || existsAmountPerMonth || existsAmountPerQuarter || existsAmountPerYear;
    const financingOptionsExists = data?.financing_options?.length > 0;
    const financingOptionsManyMonthsExists = financingOptionsExists && data?.financing_options?.some((l) => l?.monthly_price > 0 && l?.how_many_months > 1);
    const financingOptionsOnePaymentExists = financingOptionsExists && data?.financing_options?.some((l) => l?.monthly_price > 0 && l?.how_many_months === 1);
    const singlePlan = data?.plans?.length > 0 ? data?.plans[0] : data;
    const isTotallyFree = !isNotTrial && singlePlan?.trial_duration === 0 && !financingOptionsExists;

    const financingOptions = financingOptionsManyMonthsExists
      ? data?.financing_options
        .filter((l) => l?.monthly_price > 0 && l?.how_many_months > 1)
        .sort((a, b) => a.monthly_price - b.monthly_price)
      : [];
    const financingOptionsOnePayment = financingOptionsOnePaymentExists
      ? data?.financing_options
        .filter((l) => l?.monthly_price > 0 && l?.how_many_months === 1)
      : [];

    const relevantInfo = {
      plan_slug: singlePlan?.slug,
      currency: singlePlan?.currency,
      featured_info: planPropsData || [],
      trial_duration: singlePlan?.trial_duration || 0,
      trial_duration_unit: singlePlan?.trial_duration_unit || '',
      planType,
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

    const onePaymentFinancing = financingOptionsOnePaymentExists ? financingOptionsOnePayment.map((item) => ({
      ...relevantInfo,
      title: textInfo.one_payment,
      price: item?.monthly_price,
      priceText: `$${item?.monthly_price}`,
      period: 'FINANCING',
      period_label: textInfo.label.financing,
      plan_id: `f-${item?.monthly_price}-${item?.how_many_months}`,
      how_many_months: item?.how_many_months,
      type: 'PAYMENT',
      show: true,
    })) : [{}];

    const trialPlan = (!financingOptionsExists && !isNotTrial) ? {
      ...relevantInfo,
      title: singlePlan?.title ? singlePlan?.title : unSlugifyCapitalize(String(singlePlan?.slug)),
      price: 0,
      priceText: isTotallyFree ? textInfo.free : textInfo.free_trial,
      plan_id: `p-${singlePlan?.trial_duration}-trial`,
      period: isTotallyFree ? 'FREE' : singlePlan?.trial_duration_unit,
      period_label: isTotallyFree
        ? textInfo.totally_free
        : textInfo.label.free_trial_period(singlePlan?.trial_duration, singlePlan?.trial_duration_unit),
      type: isTotallyFree ? 'FREE' : 'TRIAL',
      isFree: true,
    } : {};

    const monthPlan = monthly && !financingOptionsOnePaymentExists && existsAmountPerMonth ? {
      ...relevantInfo,
      title: singlePlan?.title ? singlePlan?.title : textInfo.monthly_payment,
      price: data?.price_per_month,
      priceText: `$${data?.price_per_month}`,
      plan_id: `p-${data?.price_per_month}`,
      period: 'MONTH',
      period_label: textInfo.label.monthly,
      type: 'PAYMENT',
    } : onePaymentFinancing[0];

    const quarterPlan = quarterly && existsAmountPerQuarter ? {
      ...relevantInfo,
      title: singlePlan?.title ? singlePlan?.title : textInfo.quarterly_payment,
      price: data?.price_per_quarter,
      priceText: `$${data?.price_per_quarter}`,
      plan_id: `p-${data?.price_per_quarter}`,
      period: 'QUARTER',
      period_label: textInfo.label.quarterly,
      type: 'PAYMENT',
    } : {};

    const halfPlan = halfYearly && existsAmountPerHalf ? {
      ...relevantInfo,
      title: singlePlan?.title ? singlePlan?.title : textInfo.half_yearly_payment,
      price: data?.price_per_half,
      priceText: `$${data?.price_per_half}`,
      plan_id: `p-${data?.price_per_half}`,
      period: 'HALF',
      period_label: textInfo.label.half_yearly,
      type: 'PAYMENT',
    } : {};

    const yearPlan = yearly && existsAmountPerYear ? {
      ...relevantInfo,
      title: singlePlan?.title ? singlePlan?.title : textInfo.yearly_payment,
      price: data?.price_per_year,
      priceText: `$${data?.price_per_year}`,
      plan_id: `p-${data?.price_per_year}`,
      period: 'YEAR',
      period_label: textInfo.label.yearly,
      type: 'PAYMENT',
    } : {};

    const financingOption = financingOptionsExists ? financingOptions.map((item, index) => {
      const financingTitle = item?.how_many_months === 1 ? textInfo.one_payment : translations.many_months_payment(item?.how_many_months);
      return ({
        ...relevantInfo,
        financingId: index + 1,
        title: singlePlan?.title ? singlePlan?.title : financingTitle,
        price: item?.monthly_price,
        priceText: `$${item?.monthly_price} x ${item?.how_many_months}`,
        plan_id: `f-${item?.monthly_price}-${item?.how_many_months}`,
        period: 'FINANCING',
        period_label: textInfo.label.financing,
        how_many_months: item?.how_many_months,
        type: 'PAYMENT',
      });
    }) : [{}];

    const planList = [trialPlan, monthPlan, quarterPlan, halfPlan, yearPlan, ...financingOption].filter((plan) => Object.keys(plan).length > 0);

    return ({
      ...data,
      title: data?.title || slugToTitle(data?.slug),
      isTrial: !isNotTrial && !financingOptionsExists,
      plans: planList,
      featured_info: planPropsData || [],
    });
  });

/**
 * @param {String} planSlug // Base plan slug to generate list of prices
 * @param {Object} translationsObj // Object with translations
 * @returns {Promise<object>} // Formated object of data with list of prices
 */
export const generatePlan = (planSlug, translationsObj) => bc.payment().getPlan(planSlug)
  .then(async (resp) => {
    const data = await processPlans(resp?.data, {}, translationsObj);
    return data;
  })
  .catch(() => ({}));

/**
 * Get translations for plan content.
 *
 * @param {Function} t - The translation function
 * @returns {object} - The translations object
 */
export const getTranslations = (t = () => {}) => {
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
    monthly: t('signup:info.monthly'),
    quarterly: t('signup:info.quarterly'),
    half_yearly: t('signup:info.half-yearly'),
    yearly: t('signup:info.yearly'),
    financing: t('signup:info.financing'),
    many_months_payment: (qty) => t('signup:many_months_payment', { qty }),
  };
  return translations;
};

/**
 * Get the suggested plan based on the provided slug.
 *
 * @param {string} slug - Original plan slug
 * @param {object} translations - Translations for plan content (optional)
 * @param {boolean} ignoreProcessPlans - Whether to ignore processing the plans (optional)
 * @returns {Promise<object>} - The suggested with formated data data.
 */
export const getSuggestedPlan = (slug, translations = {}, ignoreProcessPlans = false) => bc.payment({
  original_plan: slug,
}).planOffer()
  .then(async (resp) => {
    const data = resp?.data;
    const planComparison = data[0];

    if (data?.length === 0) {
      return ({
        status_code: 404,
        detail: 'No suggested plan found',
      });
    }
    if (!ignoreProcessPlans) {
      const originalPlan = planComparison?.original_plan;
      const suggestedPlan = planComparison?.suggested_plan;

      const dataForOriginPlan = originalPlan.slug ? await processPlans(originalPlan, {
        quarterly: false,
        halfYearly: false,
        planType: 'original',
      }, translations) : {};
      const dataForSuggestedPlan = suggestedPlan.slug ? await processPlans(suggestedPlan, {
        quarterly: false,
        halfYearly: false,
        planType: 'suggested',
      }, translations) : {};

      return ({
        plans: {
          original_plan: dataForOriginPlan,
          suggested_plan: dataForSuggestedPlan,
        },
        details: planComparison?.details,
        title: planComparison?.details?.title,
      });
    }
    return planComparison;
  })
  .catch((err) => err?.response?.data);

/**
 * @param {String} planSlug Original plan slug
 * @param {Function} t Translation function
 * @returns {Promise<object>} Formated original and suggested plan data
 */
export const fetchSuggestedPlan = async (planSlug, translationsObj = {}) => {
  try {
    const suggestedPlanData = await getSuggestedPlan(planSlug, translationsObj);
    if (suggestedPlanData?.status_code === 404) {
      const plan = await generatePlan(planSlug, translationsObj);
      return {
        plans: {
          original_plan: plan,
          suggested_plan: {},
        },
        details: {},
        title: plan?.title || '',
      };
    }
    return suggestedPlanData;
  } catch (error) {
    console.error(error);
    return {};
  }
};

/**
 * @typedef {Object} PlanExistenceObject
 * @property {object} basePlan - Original plan
 * @property {object} suggestedPlan - Suggested plan
 * @property {boolean} hasBasePlan - Indicates if the base plan is active.
 * @property {boolean} hasASuggestedPlan - Indicates if a suggested plan is active.
 */
/**
 * @param {Array} subscriptions List of subscriptions of user
 * @param {String} plan Base plan slug
 * @returns {Promise<PlanExistenceObject>}
 */
export const validatePlanExistence = (subscriptions, plan = '') => new Promise((resolve, reject) => {
  const plaSlug = plan || BASE_PLAN;
  try {
    getSuggestedPlan(plaSlug, {}, true)
      .then((planComparison) => {
        const { original_plan: basePlan, suggested_plan: suggestedPlan } = planComparison;

        const hasBasePlan = subscriptions.some((s) => s?.plans?.[0]?.slug === basePlan?.slug);
        const hasASuggestedPlan = subscriptions.some((s) => s?.plans?.[0]?.slug === suggestedPlan?.slug);

        resolve({
          basePlan,
          suggestedPlan,
          hasBasePlan,
          hasASuggestedPlan,
          allSubscriptions: subscriptions,
        });
      })
      .catch((error) => {
        reject(error);
      });
  } catch (error) {
    reject(error);
    resolve({
      basePlan: {},
      suggestedPlan: {},
      hasBasePlan: false,
      hasASuggestedPlan: false,
      allSubscriptions: {},
    });
  }
});

/**
 * @returns {Promise<object>} // List of user subscriptions
 */
export const getSubscriptions = () => bc.payment({
  status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE',
}).subscriptions()
  .then(({ data }) => {
    const planFinancing = data.plan_financings.length > 0 ? data.plan_financings : [];
    const planSubscriptions = data.subscriptions.length > 0 ? data.subscriptions : [];

    const allPlans = [...planFinancing, ...planSubscriptions];

    return allPlans;
  });

/**
 * This function requires the user to be logged in.
 *
 * @returns {Promise<object>} // List of subscriptions (Plan financing and subscriptions)
 */
export const getAllMySubscriptions = async () => {
  try {
    const resp = await bc.payment().subscriptions();
    const data = resp?.data;

    const planFinancings = data?.plan_financings?.length > 0 ? data?.plan_financings : [];
    const subscriptions = data?.subscriptions?.length > 0 ? data?.subscriptions : [];
    const allSubscriptions = [...planFinancings, ...subscriptions];

    return allSubscriptions;
  } catch (error) {
    console.error(error);
    return [];
  }
};
