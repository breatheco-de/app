import useTranslation from 'next-translate/useTranslation';

// Exporting handleCoupons so it can be used independently
export const handlePriceTextWithCoupon = (priceText, allDiscounts) => {
  if (!priceText || !allDiscounts || allDiscounts.length === 0) return priceText;

  const priceTextStr = String(priceText);

  const hasInstallments = priceTextStr.includes('x');

  const currencySymbol = priceTextStr.replace(/[\d.,xX]/g, '').trim();

  let basePart = priceTextStr;
  let installmentsSuffix = '';

  if (hasInstallments) {
    const [left, right] = priceTextStr.split(/x/i);
    basePart = left || priceTextStr;

    const months = right ? right.replace(/[^\d]/g, '').trim() : '';
    if (months) {
      installmentsSuffix = ` x ${months}`;
    }
  }

  let discountedPrice = parseFloat(basePart.replace(/[^\d.]/g, ''));

  if (!Number.isFinite(discountedPrice) || discountedPrice <= 0) return priceTextStr;

  allDiscounts.forEach((discount) => {
    const value = discount?.discount_value;
    const type = discount?.discount_type;

    if (!value) return;

    if (type === 'PERCENT_OFF') {
      discountedPrice -= (discountedPrice * value);
    } else {
      discountedPrice -= value;
    }
  });

  discountedPrice = Number(discountedPrice.toFixed(2));

  const formattedPrice = discountedPrice % 1 === 0
    ? discountedPrice.toFixed(0)
    : discountedPrice.toFixed(2);

  return `${currencySymbol}${formattedPrice}${installmentsSuffix}`;
};

const getPlanPrice = (plan, planList, allDiscounts, t) => {
  if (plan?.plan_slug) {
    if (plan.period === 'YEAR') {
      return t('signup:info.enroll-yearly-subscription', {
        price: handlePriceTextWithCoupon(plan.pricePerMonthText, allDiscounts),
      });
    }
    if (plan.period === 'MONTH') {
      return t('signup:info.enroll-monthly-subscription', {
        price: handlePriceTextWithCoupon(plan.priceText, allDiscounts),
      });
    }
    if (plan.period === 'ONE_TIME') {
      return `${t('common:enroll-for-connector')} ${handlePriceTextWithCoupon(plan.priceText, allDiscounts)}, ${t('signup:info.one-time-payment')}`;
    }
    if (plan.period === 'FINANCING') {
      return `${handlePriceTextWithCoupon(plan.priceText, allDiscounts)} ${t('signup:info.installments')}`;
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

export const usePlanPrice = () => {
  const { t } = useTranslation('course');
  return (plan, planList, allDiscounts) => getPlanPrice(plan, planList, allDiscounts, t);
};

export default getPlanPrice;
