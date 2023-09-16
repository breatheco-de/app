import { unSlugifyCapitalize } from '../../utils';
import bc from '../services/breathecode';

const t = (text) => text;
export const processPlans = (data, {
  monthly = true,
  quarterly = true,
  halfYearly = true,
  yearly = true,
} = {}) => new Promise((resolve) => {
  bc.payment().getPlanProps(data?.slug)
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
          .sort((a, b) => a.monthly_price - b.monthly_price)
        : [];

      const relevantInfo = {
        plan: singlePlan?.slug,
        currency: singlePlan?.currency,
        featured_info: planPropsData || [],
        trial_duration: singlePlan?.trial_duration || 0,
        trial_duration_unit: singlePlan?.trial_duration_unit || '',
      };

      const onePaymentFinancing = financingOptionsOnePaymentExists ? financingOptionsOnePayment.map((item) => ({
        ...relevantInfo,
        title: t('subscription.upgrade-modal.one_payment'),
        price: item?.monthly_price,
        priceText: `$${item?.monthly_price}`,
        period: 'FINANCING',
        plan_id: `f-${item?.monthly_price}-${item?.how_many_months}`,
        how_many_months: item?.how_many_months,
        type: 'PAYMENT',
        show: true,
      })) : [];

      const trialPlan = (!financingOptionsExists && !isNotTrial) ? {
        ...relevantInfo,
        title: singlePlan?.title ? singlePlan?.title : unSlugifyCapitalize(String(singlePlan?.slug)),
        price: 0,
        priceText: isTotallyFree ? 'Free' : t('free-trial'),
        plan_id: `p-${singlePlan?.trial_duration}-trial`,
        period: isTotallyFree ? 'FREE' : singlePlan?.trial_duration_unit,
        type: isTotallyFree ? 'FREE' : 'TRIAL',
        isFree: true,
      } : {};

      const monthPlan = monthly && !financingOptionsOnePaymentExists && existsAmountPerMonth ? {
        ...relevantInfo,
        title: singlePlan?.title ? singlePlan?.title : t('monthly_payment'),
        price: data?.price_per_month,
        priceText: `$${data?.price_per_month}`,
        plan_id: `p-${data?.price_per_month}`,
        period: 'MONTH',
        type: 'PAYMENT',
      } : onePaymentFinancing;

      const quarterPlan = quarterly && existsAmountPerQuarter ? {
        ...relevantInfo,
        title: singlePlan?.title ? singlePlan?.title : t('quarterly_payment'),
        price: data?.price_per_quarter,
        priceText: `$${data?.price_per_quarter}`,
        plan_id: `p-${data?.price_per_quarter}`,
        period: 'QUARTER',
        type: 'PAYMENT',
      } : {};
      const halfPlan = halfYearly && existsAmountPerHalf ? {
        ...relevantInfo,
        title: singlePlan?.title ? singlePlan?.title : t('half_yearly_payment'),
        price: data?.price_per_half,
        priceText: `$${data?.price_per_half}`,
        plan_id: `p-${data?.price_per_half}`,
        period: 'HALF',
        type: 'PAYMENT',
      } : {};

      const yearPlan = yearly && existsAmountPerYear ? {
        ...relevantInfo,
        title: singlePlan?.title ? singlePlan?.title : t('yearly_payment'),
        price: data?.price_per_year,
        priceText: `$${data?.price_per_year}`,
        plan_id: `p-${data?.price_per_year}`,
        period: 'YEAR',
        type: 'PAYMENT',
      } : {};

      const financingOption = financingOptionsExists ? financingOptions.map((item, index) => {
        const financingTitle = item?.how_many_months === 1 ? t('one_payment') : t('many_months_payment', { qty: item?.how_many_months });

        return ({
          ...relevantInfo,
          financingId: index + 1,
          title: singlePlan?.title ? singlePlan?.title : financingTitle,
          price: item?.monthly_price,
          priceText: `$${item?.monthly_price} x ${item?.how_many_months}`,
          plan_id: `f-${item?.monthly_price}-${item?.how_many_months}`,
          period: 'FINANCING',
          how_many_months: item?.how_many_months,
          type: 'PAYMENT',
        });
      }) : [{}];

      const planList = [trialPlan, monthPlan, quarterPlan, halfPlan, yearPlan, ...financingOption].filter((plan) => Object.keys(plan).length > 0);
      const finalData = {
        ...data,
        isTrial: !isNotTrial && !financingOptionsExists,
        plans: planList,
        featured_info: planPropsData || [],
      };

      resolve(finalData);
    });
});

export const getSuggestedPlan = (slug) => bc.payment({
  original_plan: slug,
}).planOffer()
  .then(async (resp) => {
    const data = resp?.data;
    if (data.length === 0) {
      return ({
        status_code: 404,
        detail: 'No suggested plan found',
      });
    }
    const currentOffer = data.find((item) => item?.original_plan?.slug === slug);
    const suggestedPlan = currentOffer?.suggested_plan;
    const originalPlan = currentOffer?.original_plan;

    const dataForSuggestedPlan = suggestedPlan.slug ? await processPlans(suggestedPlan, {
      quarterly: false,
      halfYearly: false,
    }) : {};

    const dataForOriginPlan = originalPlan.slug ? await processPlans(originalPlan, {
      quarterly: false,
      halfYearly: false,
    }) : {};

    return ({
      plans: {
        original_plan: dataForOriginPlan,
        suggested_plan: dataForSuggestedPlan,
      },
      details: currentOffer?.details,
      title: currentOffer?.details?.title,
    });
  })
  .catch((err) => err?.response?.data);
