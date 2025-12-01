/* eslint-disable camelcase */
import { useState, useEffect, useMemo } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import bc from '../../services/breathecode';
import useAuth from '../../hooks/useAuth';
import useSession from '../../hooks/useSession';
import { isWindow, getQueryString, getStorageItem, removeStorageItem, setStorageItem, slugToTitle, getBrowserInfo, parseAddOnIdsFromQuery } from '../../utils';
import signupAction from '../../store/actions/signupAction';
import useSignup from '../../hooks/useSignup';
import { BASE_PLAN, currenciesSymbols } from '../../utils/variables';
import { reportDatalayer } from '../../utils/requests';
import { usePersistentBySession } from '../../hooks/usePersistent';
import useCustomToast from '../../hooks/useCustomToast';

// ___________ HELPERS (pure functions, no hooks) ___________ //

const getBagTotalsForSelectedPlan = (checkingData, selectedPlan, processedPrice) => {
  if (!selectedPlan) return null;

  const {
    amount_per_month: amountPerMonth = 0,
    amount_per_quarter: amountPerQuarter = 0,
    amount_per_half: amountPerHalf = 0,
    amount_per_year: amountPerYear = 0,
    discounted_amount_per_month: discountedAmountPerMonth,
    discounted_amount_per_quarter: discountedAmountPerQuarter,
    discounted_amount_per_half: discountedAmountPerHalf,
    discounted_amount_per_year: discountedAmountPerYear,
    plan_addons_amount: planAddonsAmount = 0,
    discounted_plan_addons_amount: discountedPlanAddonsAmount,
    discounted_monthly_price: discountedMonthlyFromChecking,
  } = checkingData || {};

  const { period, price } = selectedPlan;
  let baseOriginal = 0;
  let baseDiscounted = 0;

  // Financing plans: backend `amount_per_*` are not populated.
  // We use the plan monthly price as original and the discounted
  // monthly price (from backend if available, otherwise from
  // processedPrice) as the discounted value.
  if (period === 'FINANCING') {
    const originalMonthly = typeof price === 'number' ? price : 0;

    const discountedMonthlyFromProcessed = typeof processedPrice?.price === 'number'
      ? processedPrice.price
      : undefined;

    const discountedMonthly = [
      discountedMonthlyFromChecking,
      selectedPlan?.discounted_monthly_price,
      discountedMonthlyFromProcessed,
      originalMonthly,
    ].find((val) => typeof val === 'number');

    const originalTotal = originalMonthly + (planAddonsAmount || 0);
    const discountedAddons = typeof discountedPlanAddonsAmount === 'number'
      ? discountedPlanAddonsAmount
      : planAddonsAmount;
    const discountedTotal = discountedMonthly + (discountedAddons || 0);

    return { originalTotal, discountedTotal };
  }

  if (period === 'MONTH') {
    baseOriginal = amountPerMonth || 0;
    baseDiscounted = (discountedAmountPerMonth ?? amountPerMonth) || 0;
  } else if (period === 'QUARTER') {
    baseOriginal = amountPerQuarter || 0;
    baseDiscounted = (discountedAmountPerQuarter ?? amountPerQuarter) || 0;
  } else if (period === 'HALF') {
    baseOriginal = amountPerHalf || 0;
    baseDiscounted = (discountedAmountPerHalf ?? amountPerHalf) || 0;
  } else if (period === 'YEAR') {
    baseOriginal = amountPerYear || 0;
    baseDiscounted = (discountedAmountPerYear ?? amountPerYear) || 0;
  } else {
    baseOriginal = price || 0;
    baseDiscounted = typeof processedPrice?.price === 'number' ? processedPrice.price : (price || 0);
  }

  const originalTotal = baseOriginal + (planAddonsAmount || 0);
  const discountedAddons = typeof discountedPlanAddonsAmount === 'number'
    ? discountedPlanAddonsAmount
    : planAddonsAmount;
  const discountedTotal = baseDiscounted + (discountedAddons || 0);

  return { originalTotal, discountedTotal };
};

const getPlanAddonsDisplayData = ({
  planAddon,
  originalPlan,
  lang,
  selectedPlanAddons,
}) => {
  const translationsArray = Array.isArray(planAddon?.translations) ? planAddon.translations : [];
  const translationMatch = translationsArray.find((tr) => (
    typeof tr?.lang === 'string' && tr.lang.toLowerCase().startsWith(lang.toLowerCase())
  ));

  const planAddonTitle = translationMatch?.title || planAddon?.title;
  const planAddonDescription = translationMatch?.description || planAddon?.description;

  const rawPlanAddon = originalPlan?.planAddons?.find((cfg) => cfg?.slug === planAddon.slug);
  const isSelected = Array.isArray(selectedPlanAddons)
    ? selectedPlanAddons.includes(planAddon.slug)
    : false;

  const baseOneShot = typeof rawPlanAddon?.one_shot_price === 'number'
    ? rawPlanAddon.one_shot_price
    : null;

  const originalPlanAddonPrice = typeof planAddon.price_before_coupon === 'number'
    ? planAddon.price_before_coupon
    : baseOneShot;

  const discountedPlanAddonRaw = typeof planAddon.price_after_coupon === 'number'
    ? planAddon.price_after_coupon
    : originalPlanAddonPrice;
  const discountedPlanAddonPrice = typeof discountedPlanAddonRaw === 'number' ? discountedPlanAddonRaw : null;

  const hasDiscount = originalPlanAddonPrice !== null
    && discountedPlanAddonPrice !== null
    && discountedPlanAddonPrice < originalPlanAddonPrice;

  return {
    slug: planAddon.slug,
    addonTitle: planAddonTitle,
    addonDescription: planAddonDescription,
    isSelected,
    originalAddon: originalPlanAddonPrice,
    discountedAddon: discountedPlanAddonPrice,
    hasDiscount,
  };
};

const applyCouponToPrice = (price, coupon) => {
  const discount = coupon?.discount_value;
  const type = coupon?.discount_type;
  if (!price || !discount || !type) return price;

  if (type === 'PERCENT_OFF' || type === 'HAGGLING') {
    return price * (1 - discount);
  }
  if (type === 'FIXED_PRICE') {
    return price - discount;
  }
  return price;
};

// ___________ CHECKOUT MAIN HOOK ___________ //

const useCheckout = () => {
  const { t, lang } = useTranslation('signup');
  const router = useRouter();
  const { query, pathname } = router;
  const [allCoupons, setAllCoupons] = useState([]);
  const [originalPlan, setOriginalPlan] = useState(null);
  const {
    state, handleStep, setLoader,
    setSelectedPlan, setCheckingData, setPlanData, setPaymentStatus, setDeclinedPayment,
    setSelectedPlanAddons, restartSignup,
  } = signupAction();
  const {
    stepsEnum, getSelfAppliedCoupon,
    getChecking, getPriceWithDiscount, processPlans, subscribeFreePlan,
  } = useSignup();
  const {
    stepIndex,
    checkingData,
    paymentStatus,
    selectedPlan,
    selfAppliedCoupon,
    planData,
    selectedPlanAddons,
  } = state;
  const [discountCode, setDiscountCode] = useState('');
  const [discountCoupon, setDiscountCoupon] = useState(null);
  const [couponError, setCouponError] = useState(false);
  const [suggestedPlans, setSuggestedPlans] = useState(undefined);
  const [discountValues, setDiscountValues] = useState(undefined);
  const [userSelectedPlan, setUserSelectedPlan] = useState(undefined);
  const currencySymbol = currenciesSymbols[originalPlan?.currency?.code] || '$';

  const { isAuthenticated } = useAuth();
  const { userSession, location, isLoadingLocation } = useSession();
  const { createToast } = useCustomToast({ toastId: 'coupon-plan-email-detail' });
  const { coupon: couponQuery } = query;
  const plan = getQueryString('plan');
  const planId = getQueryString('plan_id');
  const callbackUrl = getQueryString('callback');
  const addOnsQS = getQueryString('add_ons');
  const planFormated = plan || BASE_PLAN;

  const [couponFromSession] = usePersistentBySession('coupon', '');
  const coupon = couponFromSession || userSession?.ref || '';

  const couponValue = useMemo(() => {
    const formatedCouponQuery = couponQuery && couponQuery.replace(/[^a-zA-Z0-9-\s]/g, '');
    const couponString = coupon?.replaceAll('"', '') || '';
    return couponString || formatedCouponQuery;
  }, [coupon, couponQuery]);

  const isPaymentSuccess = paymentStatus === 'success';
  const fixedCouponExist = allCoupons.some((coup) => coup.discount_type === 'FIXED_PRICE');

  const findAutoSelectedPlan = (checking) => {
    const plans = checking?.plans || [];
    const sortedPlans = [...plans].sort(
      (a, b) => (a.how_many_months || 0) - (b.how_many_months || 0),
    );
    const defaultAutoSelectedPlan = sortedPlans[0];
    const autoSelectedPlanByQueryString = checking?.plans?.find(
      (item) => item?.plan_id === (planId || userSelectedPlan?.plan_id),
    );

    return autoSelectedPlanByQueryString || defaultAutoSelectedPlan;
  };

  const processedPrice = useMemo(() => {
    let pricingData = { ...selectedPlan };
    const discounts = [];

    allCoupons.forEach((c) => {
      pricingData = getPriceWithDiscount(pricingData.price, c);
      discounts.push(pricingData);
    });
    return pricingData;
  }, [allCoupons, selectedPlan]);

  // Totals for the current selection (plan + add-ons)
  const bagTotals = useMemo(
    () => getBagTotalsForSelectedPlan(checkingData, selectedPlan, processedPrice),
    [checkingData, selectedPlan, processedPrice],
  );

  // Display data for plan add-ons (titles, discounts, switch state)
  const planAddonsDisplay = useMemo(() => {
    if (!checkingData?.plan_addons || !originalPlan) return [];

    // Get plan_addons from querystring
    const planAddonsQuery = getQueryString('plan_addons');

    if (!planAddonsQuery) {
      return [];
    }

    // Parse allowed slugs from querystring
    const allowedSlugs = planAddonsQuery
      .split(',')
      .map((slug) => slug.trim())
      .filter((slug) => slug.length > 0);

    // If querystring exists but no valid slugs, show nothing
    if (allowedSlugs.length === 0) {
      return [];
    }

    // Filter plan addons by allowed slugs
    const filteredPlanAddons = checkingData.plan_addons.filter((planAddon) => allowedSlugs.includes(planAddon?.slug));

    return filteredPlanAddons.map((planAddon) => getPlanAddonsDisplayData({
      planAddon,
      originalPlan,
      lang,
      selectedPlanAddons,
    }));
  }, [checkingData?.plan_addons, originalPlan, lang, selectedPlanAddons]);

  // Coupon breakdown per plan / planAddon (for UI explanation)
  const couponBreakdown = useMemo(() => {
    const couponsDetail = Array.isArray(checkingData?.coupons_detail) ? checkingData.coupons_detail : [];
    if (!selectedPlan || !checkingData || !Array.isArray(allCoupons) || allCoupons.length === 0) return [];

    const detailBySlug = couponsDetail.reduce((acc, item) => {
      if (item?.slug) acc[item.slug] = item;
      return acc;
    }, {});

    const period = selectedPlan?.period;
    let originalPlanPrice = 0;

    if (period === 'FINANCING' || period === 'ONE_TIME') originalPlanPrice = selectedPlan?.price || 0;
    else if (period === 'MONTH') originalPlanPrice = checkingData.amount_per_month || 0;
    else if (period === 'QUARTER') originalPlanPrice = checkingData.amount_per_quarter || 0;
    else if (period === 'HALF') originalPlanPrice = checkingData.amount_per_half || 0;
    else if (period === 'YEAR') originalPlanPrice = checkingData.amount_per_year || 0;

    const checkingPlan = Array.isArray(checkingData?.plans) ? checkingData.plans[0] : null;
    const planSlug = checkingPlan?.slug || selectedPlan?.plan_slug || originalPlan?.plan_slug;
    const planName = originalPlan?.title || selectedPlan?.title || planSlug;

    const breakdown = [];

    const buildTargetBreakdown = ({
      targetType,
      slug,
      name,
      basePrice,
    }) => {
      if (!slug || typeof basePrice !== 'number' || basePrice <= 0) return;

      let current = basePrice;

      allCoupons.forEach((couponItem) => {
        const couponSlug = couponItem?.slug;
        if (!couponSlug) return;
        const detail = detailBySlug[couponSlug];
        if (!detail) return;

        const appliesToPlan = targetType === 'plan'
          && Array.isArray(detail.applied_plans)
          && detail.applied_plans.includes(slug);

        const appliesToPlanAddon = targetType === 'planAddon'
          && Array.isArray(detail.applied_plan_addons)
          && detail.applied_plan_addons.includes(slug);

        if (!appliesToPlan && !appliesToPlanAddon) return;

        const before = current;
        const after = applyCouponToPrice(before, detail);

        breakdown.push({
          couponSlug,
          targetType,
          targetSlug: slug,
          targetName: name,
          before,
          after,
        });

        current = after;
      });
    };

    if (planSlug && originalPlanPrice > 0) {
      buildTargetBreakdown({
        targetType: 'plan',
        slug: planSlug,
        name: planName,
        basePrice: originalPlanPrice,
      });
    }

    if (Array.isArray(planAddonsDisplay) && planAddonsDisplay.length > 0) {
      planAddonsDisplay.forEach((planAddonDisplay) => {
        const { slug, addonTitle, originalAddon } = planAddonDisplay;
        buildTargetBreakdown({
          targetType: 'planAddon',
          slug,
          name: addonTitle || slug,
          basePrice: originalAddon,
        });
      });
    }

    return breakdown;
  }, [checkingData, selectedPlan, originalPlan, planAddonsDisplay, allCoupons]);

  const saveCouponToBag = async (coupons, bagId = '', specificCoupon = '', manualCoupon = false) => {
    try {
      const resp = await bc.payment({
        coupons,
        plan: planFormated,
      }).applyCoupon(bagId);

      const couponsList = resp?.data?.coupons;

      if (coupons[0] === '') {
        setDiscountCoupon(null);
        setCheckingData({
          ...checkingData,
          coupons: [],
        });
        if (manualCoupon) setCouponError(false);
        return;
      }

      if (couponsList?.length > 0) {
        const couponToFind = specificCoupon || discountCode;
        const couponData = couponsList.find(({ slug }) => slug === couponToFind);

        if (couponData) {
          setDiscountCoupon({
            ...couponData,
          });
          setCheckingData({
            ...checkingData,
            coupons,
          });
        }

        if (manualCoupon) setCouponError(false);
      } else if (manualCoupon) {
        setCouponError(true);
      }

      // Después de aplicar/limpiar cupones, refrescamos el checking (preview)
      if (planData) {
        try {
          setLoader('summary', true);
          const checking = await getChecking(planData, selectedPlanAddons);
          const autoSelectedPlan = findAutoSelectedPlan(checking);

          if (autoSelectedPlan) {
            setSelectedPlan(autoSelectedPlan);
          }
        } catch (error) {
          console.error('Error refreshing checking after coupon change:', error);
        } finally {
          setLoader('summary', false);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const removeManualCoupons = async () => {
    setAllCoupons((prev) => {
      const filtered = prev.filter((c) => c?.source !== 'manual');
      return filtered;
    });
    if (checkingData?.id) {
      try {
        setLoader('summary', true);
        await saveCouponToBag([''], checkingData.id, '', true);
        if (planData) {
          const checking = await getChecking(planData, selectedPlanAddons);
          const autoSelectedPlan = findAutoSelectedPlan(checking);
          if (autoSelectedPlan) {
            setSelectedPlan(autoSelectedPlan);
          }
        }
      } catch (error) {
        console.error('Error removing manual coupons:', error);
      } finally {
        setLoader('summary', false);
      }
    }
  };

  const handleCoupon = async (coup, actions) => {
    const couponToApply = coup || discountCode;

    if (!coup && !discountCode) {
      if (actions) {
        actions.setSubmitting(false);
      }
      return;
    }

    const isCouponAlreadyApplied = allCoupons.some((existingCoupon) => existingCoupon?.slug === couponToApply);

    if (isCouponAlreadyApplied) {
      createToast({
        position: 'top',
        title: t('signup:alert-message.coupon-already-applied'),
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
      if (actions) {
        actions.setSubmitting(false);
      }
      return;
    }

    try {
      setLoader('summary', true);

      const resp = await bc.payment({
        coupons: [couponToApply],
        plan: planFormated,
      }).verifyCoupon();

      const correctCoupon = resp.data.find((c) => c.slug === couponToApply);
      if (correctCoupon) {
        const manualCoupon = {
          ...correctCoupon,
          source: 'manual',
        };
        setDiscountCoupon(manualCoupon);

        setAllCoupons((prev) => {
          const nonManualCoupons = prev.filter((c) => c?.source !== 'manual');
          const newCoupons = [...nonManualCoupons, manualCoupon];
          return newCoupons;
        });

        setCouponError(false);
      } else {
        setDiscountCoupon(null);
        setCouponError(true);
        setLoader('summary', false);
        createToast({
          position: 'top',
          title: t('signup:coupon-error'),
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(error);
      setLoader('summary', false);
      createToast({
        position: 'top',
        title: t('signup:coupon-error'),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      if (actions) {
        actions.setSubmitting(false);
      }
    }
  };

  const initializePlanData = async () => {
    try {
      const resp = await bc.payment({ country_code: location?.countryShort }).getPlan(planFormated);
      console.log('resp', resp);
      const { data } = resp;
      setPlanData(data);
      const processedPlan = await processPlans(data, {
        quarterly: false,
        halfYearly: false,
        planType: 'original',
      });

      const accordionList = processedPlan?.featured_info?.map((info) => ({
        title: info.features[0]?.title || slugToTitle(info.service?.slug),
        description: info.features[0]?.description,
      })) || [];

      let accordionListWithAddOns = accordionList;
      if (addOnsQS) {
        const addOnIds = parseAddOnIdsFromQuery(addOnsQS);
        const selectedAddOns = (data?.add_ons || []).filter((ao) => addOnIds.includes(ao?.id));
        const addOnsAccordion = selectedAddOns.map((ao) => ({
          title: ao?.service?.title || slugToTitle(ao?.service?.slug),
          description: '',
        }));
        accordionListWithAddOns = [...accordionList, ...addOnsAccordion];
      }

      const defaultPlan = processedPlan?.plans?.find((item) => item?.plan_id === planId)
        || processedPlan?.plans?.[0] || {};

      if (selectedPlanAddons === null) {
        setSelectedPlanAddons([]);
      }

      const { data: suggestedPlanInfo } = await bc.payment({ original_plan: processedPlan?.slug }).planOffer();

      const { data: allCouponsApplied } = await bc.payment({ coupons: [couponQuery || coupon], plan: suggestedPlanInfo[0]?.suggested_plan.slug || processedPlan?.slug }).verifyCoupon();
      setDiscountValues(allCouponsApplied);

      setSuggestedPlans(suggestedPlanInfo[0]?.suggested_plan);

      if (pathname !== '/renew') {
        setSelectedPlan(defaultPlan);
      }
      setOriginalPlan({
        ...processedPlan,
        accordionList: accordionListWithAddOns,
        planAddons: Array.isArray(data?.plan_addons) ? data.plan_addons : [],
      });
    } catch (err) {
      createToast({
        position: 'top',
        title: t('alert-message:no-plan-configuration'),
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
      router.push('/pricing');
    }
  };

  const getCheckingData = async () => {
    try {
      setLoader('plan', true);
      setLoader('summary', true);

      const checking = await getChecking(planData, selectedPlanAddons);

      // Check if getChecking returned an error response
      if (checking?.status >= 400) {
        setPaymentStatus('error');
        setDeclinedPayment({
          title: t('transaction-denied'),
          description: checking?.data?.detail || checking?.detail || t('payment-not-processed'),
        });
        handleStep(stepsEnum.SUMMARY);
        setLoader('plan', false);
        setLoader('summary', false);
        return;
      }

      const plans = checking?.plans || [];
      const existsPayablePlan = plans.some((item) => item.price > 0);
      const autoSelectedPlan = findAutoSelectedPlan(checking);

      if (autoSelectedPlan) {
        setSelectedPlan(autoSelectedPlan);
      }

      if (existsPayablePlan) {
        handleStep(stepsEnum.PAYMENT);
      } else {
        await subscribeFreePlan(checking);
        handleStep(stepsEnum.SUMMARY);
      }
      setLoader('plan', false);
      setLoader('summary', false);
    } catch (error) {
      setLoader('plan', false);
      setLoader('summary', false);
      createToast({
        position: 'top',
        title: t('alert-message:no-plan-configuration'),
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (!checkingData?.plan_addons || selectedPlanAddons !== null) return;

    const slugs = checkingData.plan_addons
      .map((planAddon) => planAddon?.slug)
      .filter((slug) => typeof slug === 'string' && slug.length > 0);

    setSelectedPlanAddons(slugs);
  }, [checkingData?.plan_addons, selectedPlanAddons, setSelectedPlanAddons]);

  const togglePlanAddon = async (slug) => {
    if (!planData || !slug) return;

    const current = Array.isArray(selectedPlanAddons) ? selectedPlanAddons : [];
    const exists = current.includes(slug);
    const next = exists ? current.filter((item) => item !== slug) : [...current, slug];

    setSelectedPlanAddons(next);

    try {
      setLoader('summary', true);
      const checking = await getChecking(planData, next);
      const autoSelectedPlan = findAutoSelectedPlan(checking);

      if (autoSelectedPlan) {
        setSelectedPlan(autoSelectedPlan);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoader('summary', false);
    }
  };

  useEffect(() => {
    if (!userSelectedPlan || !planData) return;

    setLoader('summary', true);
    getChecking(planData, selectedPlanAddons)
      .then((checking) => {
        const autoSelectedPlan = findAutoSelectedPlan(checking);

        setSelectedPlan(autoSelectedPlan);
        if (stepIndex >= stepsEnum.PAYMENT) {
          handleStep(stepsEnum.PAYMENT);
        }
      })
      .catch(() => {
      })
      .finally(() => {
        setLoader('summary', false);
      });
  }, [userSelectedPlan]);

  // useEffect for selfAppliedCoupons
  useEffect(() => {
    const updateAllCoupons = (coupons) => {
      setAllCoupons((prev) => {
        const manualCoupons = prev.filter((c) => c?.source === 'manual');
        const existingSlugs = new Set(coupons.map((c) => c?.slug));
        const uniqueManualCoupons = manualCoupons.filter((c) => !existingSlugs.has(c?.slug));
        return [...coupons, ...uniqueManualCoupons];
      });
    };

    const loadAutoAppliedCoupons = async () => {
      const coupons = [];

      if (selfAppliedCoupon) {
        coupons.push(selfAppliedCoupon);
      }

      const planToUse = selfAppliedCoupon?.plan || planFormated;

      if (planToUse) {
        try {
          const { data: userCouponsData } = await bc.payment({ plan: planToUse }).getMyUserCoupons();
          const autoRewardCoupons = (userCouponsData || [])
            .filter((c) => c?.auto === true && c?.is_valid === true)
            .sort((a, b) => new Date(a.offered_at) - new Date(b.offered_at));

          autoRewardCoupons.forEach((ref) => {
            coupons.push({ ...ref, plan: planToUse, source: 'reward' });
          });
        } catch (error) {
          console.error('Error fetching user coupons:', error);
        }
      }

      updateAllCoupons(coupons);
    };

    loadAutoAppliedCoupons();
  }, [selfAppliedCoupon, planFormated, checkingData?.id]);

  // useEffect for syncing coupons with bag
  useEffect(() => {
    if (!checkingData?.id) return;

    const allCouponSlugs = allCoupons
      .map((c) => c?.slug)
      .filter((s) => typeof s === 'string' && s.length > 0);

    const already = Array.isArray(checkingData?.coupons) ? checkingData.coupons : [];
    const sameSet = already.length === allCouponSlugs.length
      && allCouponSlugs.every((slug) => already.includes(slug));

    if (sameSet) return;

    if (allCouponSlugs.length > 0) {
      saveCouponToBag(allCouponSlugs, checkingData.id);
    } else {
      saveCouponToBag([''], checkingData.id);
    }
  }, [allCoupons, checkingData?.id, checkingData?.coupons]);

  const getDiscountValue = (coup) => {
    if (!coup?.discount_value || !coup?.discount_type) return '';
    if (coup.discount_type === 'PERCENT_OFF') {
      return t('discount-value-off', { value: `${coup.discount_value * 100}%` });
    }
    if (coup.discount_type === 'FIXED_PRICE') {
      return t('discount-value-off', { value: `$${Math.round(coup.discount_value)}` });
    }
    return '';
  };

  const calculateTotalPrice = () => {
    if (!selectedPlan) return '0.00';

    const months = selectedPlan.how_many_months || 1;
    const addonsTotal = (checkingData?.discounted_plan_addons_amount
      ?? checkingData?.plan_addons_amount
      ?? 0);

    let mainTotal;

    if (processedPrice.discountType === 'FIXED_PRICE') {
      const firstMonthPrice = processedPrice.price;
      const remainingMonthsPrice = processedPrice.originalPrice * (months - 1);
      mainTotal = firstMonthPrice + remainingMonthsPrice;
    } else {
      const effectiveMonths = selectedPlan.how_many_months ? selectedPlan.how_many_months : 1;
      mainTotal = processedPrice.price * effectiveMonths;
    }

    return (mainTotal + addonsTotal).toFixed(2);
  };

  const renderPlanDetails = () => {
    const applyDiscounts = (price, discountList) => {
      let finalPrice = price;
      discountList?.forEach(({ discount_value, discount_type }) => {
        if (discount_value > 0) {
          finalPrice = discount_type === 'PERCENT_OFF'
            ? finalPrice * (1 - discount_value)
            : finalPrice - discount_value;
        }
      });
      return finalPrice;
    };

    if (selectedPlan?.isFreeTier) {
      const financingOptions = suggestedPlans?.financing_options || [];
      const monthlyPayment = suggestedPlans?.price_per_month;
      const yearlyPayment = suggestedPlans?.price_per_year;

      let financingText = '';

      if (financingOptions.length > 0) {
        financingOptions.sort((a, b) => a.months - b.months);

        if (financingOptions.length === 1) {
          const finalPrice = applyDiscounts(financingOptions[0].monthly_price, discountValues);
          financingText = t('free_trial_one_payment', {
            price: finalPrice.toFixed(2),
            description: selectedPlan.description,
            currency: currencySymbol,
          });
        }

        if (financingOptions.length > 1) {
          const firstPrice = applyDiscounts(financingOptions[financingOptions.length - 1].monthly_price, discountValues);
          const lastPrice = applyDiscounts(financingOptions[0].monthly_price, discountValues);

          financingText = t('free_trial_multiple_payments', {
            description: selectedPlan.description,
            numPayments: financingOptions[financingOptions.length - 1].how_many_months,
            firstPrice: firstPrice.toFixed(2),
            oneTimePrice: lastPrice.toFixed(2),
            currency: currencySymbol,
          });
        }
      }

      if (selectedPlan?.type === 'FREE') {
        return t('free_plan');
      }

      if (financingOptions.length === 0) {
        if (monthlyPayment) {
          const finalMonthlyPrice = applyDiscounts(monthlyPayment, discountValues);
          financingText = t('free_trial_monthly_payment', {
            description: selectedPlan.description,
            monthlyPrice: finalMonthlyPrice.toFixed(2),
            currency: currencySymbol,
          });
        }

        if (yearlyPayment && !monthlyPayment) {
          const finalYearlyPrice = applyDiscounts(yearlyPayment, discountValues);
          financingText = t('free_trial_yearly_payment', {
            description: selectedPlan.description,
            yearlyPrice: finalYearlyPrice.toFixed(2),
            currency: currencySymbol,
          });
        }
      }

      if (financingOptions.length === 0 && !monthlyPayment && !yearlyPayment) {
        financingText = selectedPlan?.description;
      }

      if (discountValues.length > 0) {
        financingText += ` ${t('limited_time_offer')}`;
      }

      return financingText;
    }

    if (selectedPlan?.price > 0 || selectedPlan?.price > 0) {
      const originalPrice = selectedPlan?.price || selectedPlan?.price;
      const discountedPrice = applyDiscounts(originalPrice, discountValues);

      return (
        `${currencySymbol}${discountedPrice.toFixed(2)} / ${selectedPlan?.title || selectedPlan?.title}`
      );
    }

    if (userSelectedPlan && !isAuthenticated) {
      const discountedPrice = applyDiscounts(userSelectedPlan?.price, discountValues);

      return (
        `${currencySymbol}${discountedPrice.toFixed(2)} / ${userSelectedPlan?.title}`
      );
    }

    return null;
  };

  /**
 * Checkout flow overview
 *
 * This hook (`useCheckout`) orquestrates the end-to-end checkout logic:
 *  - Plan bootstrap (STEP 1)
 *  - Auto-applied coupons (STEP 1.1)
 *  - Checking / preview of current plan (STEP 2)
 *  - User changing pricing option (STEP 2b)
 *  - Applying/syncing coupons once the bag/checking exists (STEP 3)
 *  - Protection against reload while payment is in progress
 *  - Cleanup of Redux signup state on unmount
 *
 * Overview:
 *  1) initializePlanData()
 *     - Fetches the base plan from Breathecode with country_code.
 *     - Normalizes it with useSignup.processPlans (plans, paymentOptions, financingOptions, featured_info).
 *     - Builds the accordion list (plan benefits + optional add_ons).
 *     - Picks a default plan and stores it in Redux as selectedPlan / originalPlan.
 *
 *  2) Auto coupon (useEffect -> getSelfAppliedCoupon)
 *     - If there's an auto-applied coupon for the plan, store it in Redux (selfAppliedCoupon).
 *
 *  3) Checking preview (getCheckingData + useSignup.getChecking)
 *     - When the user is authenticated and planData is ready, create a PREVIEW "bag":
 *       - Breathecode returns plans, type, token, coupons, add_ons and totals.
 *       - We merge that with a normalized plan (generatePlan) and store it in checkingData.
 *     - From checkingData, we auto-select the best plan (findAutoSelectedPlan) into selectedPlan.
 *     - If there is at least one payable plan, move to PAYMENT.
 *       Otherwise, subscribeFreePlan and go directly to SUMMARY.
 *
 *  4) User changes pricing option (userSelectedPlan)
 *     - When the pricing option (monthly / yearly / financing) changes, rerun getChecking(planData)
 *       to refresh checkingData and selectedPlan, keeping the right-hand summary in sync.
 *
 *  5) Coupons lifecycle
 *     - Once checkingData.id exists, we:
 *       - Apply the main coupon (couponValue) with handleCoupon.
 *       - Keep allCoupons in sync with the backend bag using saveCouponToBag.
 *
 *  6) Payments (handled in useSignup, consumed by PaymentInfo)
 *     - Card payments (Stripe): handlePayment(...)
 *       - Uses selectedPlan + checkingData to build the pay() body, sends it to Breathecode,
 *         reports 'purchase' to the dataLayer and redirects the user.
 *     - Crypto payments (Coinbase): handleCoinbasePayment()
 *       - For non-free/non-trial plans, builds a pay() request with payment_method: 'coinbase'
 *         and a return_url to /crypto-payment-success.
 *
 *  7) Renew flow (pathname === '/renew')
 *     - Some effects early-return when the path is '/renew' (e.g. STEP 2 and STEP 2b),
 *       so the renew page can reuse the hook while controlling its own flow.
 */

  // STEP 1: GET THE PLAN DATA (first request the user perceives)
  // Renders: plan title, options list (monthly/annual/financing), and benefits accordion.
  useEffect(() => {
    // If callback URL is provided, set it as the redirect destination
    if (callbackUrl) {
      setStorageItem('redirect', callbackUrl);
    } else {
      removeStorageItem('redirect');
    }

    if (!isLoadingLocation) {
      initializePlanData();
    }

    reportDatalayer({
      dataLayer: {
        event: 'begin_checkout',
        plan: planFormated,
        path: '/checkout',
        conversion_info: userSession,
        agent: getBrowserInfo(),
      },
    });
  }, [router.locale, isLoadingLocation, callbackUrl, pathname]);

  // STEP 1.1: Auto-coupon for plan if available
  // Ensures the discount is applied from the start.
  useEffect(() => {
    getSelfAppliedCoupon(planFormated);
  }, []);

  // STEP 2: PREVIEW (checking) of the current plan
  // Renders Subtotal/Total (now/later) including add‑ons and currency.
  useEffect(() => {
    if (pathname === '/renew') return;

    const accessToken = getStorageItem('accessToken');
    if (!planFormated && isAuthenticated) {
      router.push('/pricing');
    }

    if (planFormated && isAuthenticated && planData) {
      getCheckingData();
    }
    if (!isAuthenticated && !accessToken) {
      setLoader('plan', false);
    }
  }, [isAuthenticated, router.locale, planData, pathname]);

  // STEP 2b: user changes option (monthly/annual/financing)
  // Re-run preview and refresh the right-hand summary without showing a full loader.
  useEffect(() => {
    if (pathname === '/renew') return;
    if (!userSelectedPlan || !planData) return;

    setLoader('summary', true);
    getChecking(planData)
      .then((checking) => {
        const autoSelectedPlan = findAutoSelectedPlan(checking);

        setSelectedPlan(autoSelectedPlan);
        if (stepIndex >= stepsEnum.PAYMENT) {
          handleStep(stepsEnum.PAYMENT);
        }
      })
      .catch(() => {
      })
      .finally(() => {
        setLoader('summary', false);
      });
  }, [userSelectedPlan, pathname]);

  // STEP 3: Apply coupon once checking/bag exists
  // Updates Subtotal/Total in the right-hand summary.
  useEffect(() => {
    if (!checkingData?.id || checkingData?.isTrial) return;
    if (!couponValue) return;

    // Si el cupón viene por querystring y ya está aplicado en el bag,
    // evitamos re-aplicarlo para no disparar loaders extra.
    const qsCoupon = couponQuery && couponQuery.replace(/[^a-zA-Z0-9-\s]/g, '');
    const normalizedCoupons = Array.isArray(checkingData?.coupons) ? checkingData.coupons : [];
    const queryCouponAlreadyApplied = qsCoupon && normalizedCoupons.includes(qsCoupon);

    if (queryCouponAlreadyApplied) {
      // Si el cupón de la URL ya está aplicado, mostrarlo en el input (sin permitir eliminarlo)
      if (!discountCoupon?.slug || discountCoupon.slug !== qsCoupon) {
        const couponsDetail = Array.isArray(checkingData?.coupons_detail) ? checkingData.coupons_detail : [];
        const couponDetail = couponsDetail.find((c) => c?.slug === qsCoupon);
        if (couponDetail) {
          setDiscountCode(qsCoupon);
          setDiscountCoupon(couponDetail);
        }
      }
      return;
    }

    setDiscountCode(couponValue);
    handleCoupon(couponValue);
  }, [couponValue, checkingData?.id, checkingData?.isTrial, checkingData?.coupons, checkingData?.coupons_detail, couponQuery]);

  // Protection: prevent reload/close while payment is in progress
  useEffect(() => {
    if (isWindow && stepIndex >= stepsEnum.SUMMARY && isAuthenticated && !isPaymentSuccess) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
    return () => { };
  }, [stepIndex, isAuthenticated]);

  // STEP 4: clean up state on unmount
  useEffect(() => () => restartSignup(), []);

  return {
    // Coupons
    couponError,
    setCouponError,
    discountCode,
    setDiscountCode,
    discountCoupon,
    setDiscountCoupon,
    allCoupons,
    fixedCouponExist,
    couponValue,
    getDiscountValue,
    handleCoupon,
    saveCouponToBag,
    removeManualCoupons,

    // Plans / totals
    userSelectedPlan,
    setUserSelectedPlan,
    renderPlanDetails,
    calculateTotalPrice,
    processedPrice,
    originalPlan,
    currencySymbol,
    planFormated,
    planId,
    bagTotals,
    planAddonsDisplay,
    couponBreakdown,

    // Add-ons
    selectedPlanAddons,
    togglePlanAddon,
  };
};
export default useCheckout;
