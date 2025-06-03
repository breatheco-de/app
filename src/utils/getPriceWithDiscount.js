import useTranslation from 'next-translate/useTranslation';

// Exporting handleCoupons so it can be used independently
export const handlePriceTextWithCoupon = (priceText, allDiscounts, plan) => {
  if (!allDiscounts || allDiscounts.length === 0 || plan.price === 0) return priceText;

  const currencySymbol = priceText.replace(/[\d.,]/g, '');
  let discountedPrice = parseFloat(priceText.replace(/[^\d.]/g, ''));

  allDiscounts.forEach((discount) => {
    if (discount.discount_type === 'PERCENT_OFF') {
      discountedPrice -= (discountedPrice * discount.discount_value);
    } else {
      discountedPrice -= discount.discount_value;
    }
  });

  discountedPrice = parseFloat(discountedPrice.toFixed(2));

  // Only show decimals if they're not .00
  const formattedPrice = discountedPrice % 1 === 0 ? discountedPrice.toFixed(0) : discountedPrice.toFixed(2);
  return currencySymbol + formattedPrice;
};

const getPlanPrice = (plan, planList, allDiscounts, t) => {
  if (plan?.plan_slug) {
    if (plan.period === 'YEAR') {
      return t('signup:info.enroll-yearly-subscription', {
        price: handlePriceTextWithCoupon(plan.pricePerMonthText, allDiscounts, plan),
      });
    }
    if (plan.period === 'MONTH') {
      return t('signup:info.enroll-monthly-subscription', {
        price: handlePriceTextWithCoupon(plan.priceText, allDiscounts, plan),
      });
    }
    if (plan.period === 'ONE_TIME') {
      return `${handlePriceTextWithCoupon(plan.priceText, allDiscounts, plan)}, ${t('signup:info.one-time-payment')}`;
    }
    if (plan.period === 'FINANCING') {
      return `${handlePriceTextWithCoupon(plan.priceText, allDiscounts, plan)} ${t('signup:info.installments')}`;
    }
    if (plan?.type === 'TRIAL') {
      return t('common:start-free-trial');
    }
    if (plan?.type === 'FREE') {
      return t('common:enroll-totally-free');
    }
  }
  if (!plan?.plan_slug && planList[0]?.isFreeTier) {
    if (planList[0]?.type === 'FREE') {
      return t('common:enroll-totally-free');
    }
    if (planList[0]?.type === 'TRIAL') {
      return t('common:start-free-trial');
    }
  }
  return t('common:enroll');
};

// Create a React hook wrapper to use in components
export const usePlanPrice = () => {
  const { t } = useTranslation('course');
  return (plan, planList, allDiscounts) => getPlanPrice(plan, planList, allDiscounts, t);
};

// Export the raw function for special cases that provide their own translation function
export default getPlanPrice;
