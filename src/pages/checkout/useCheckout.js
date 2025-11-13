/* eslint-disable camelcase */
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
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

const useCheckout = () => {
  const { t } = useTranslation('signup');
  const router = useRouter();
  const { query, pathname } = router;
  const currentLocale = router.locale || 'en';

  const resolveLocalizedValue = useCallback((value) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      const normalized = currentLocale?.toLowerCase();
      if (normalized && value[normalized]) return value[normalized];
      const short = normalized?.split('-')?.[0];
      if (short && value[short]) return value[short];
      if (value.en) return value.en;
      const firstString = Object.values(value).find((val) => typeof val === 'string');
      if (firstString) return firstString;
    }
    return undefined;
  }, [currentLocale]);

  const formatTemplate = (template, variables = {}) => {
    if (typeof template !== 'string') return template;
    return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => (variables[key] !== undefined ? variables[key] : ''));
  };

  const translateCopy = useCallback((raw, variables = {}) => {
    if (typeof raw !== 'string') return raw;
    const trimmed = raw.trim();
    if (trimmed.startsWith('signup:')) {
      const key = trimmed.replace('signup:', '');
      return t(key, variables);
    }
    if (trimmed.startsWith('live-classes.')) {
      return t(trimmed, variables);
    }
    return formatTemplate(trimmed, variables);
  }, [t]);
  const [allCoupons, setAllCoupons] = useState([]);
  const [originalPlan, setOriginalPlan] = useState(null);
  const {
    state, handleStep, setLoader,
    setSelectedPlan, setCheckingData, setPlanData, setPaymentStatus, setDeclinedPayment, restartSignup,
  } = signupAction();
  const {
    stepsEnum, getSelfAppliedCoupon,
    getChecking, getPriceWithDiscount, processPlans, subscribeFreePlan,
  } = useSignup();
  const { stepIndex, checkingData, paymentStatus, selectedPlan, selfAppliedCoupon, planData } = state;
  const [discountCode, setDiscountCode] = useState('');
  const [discountCoupon, setDiscountCoupon] = useState(null);
  const [couponError, setCouponError] = useState(false);
  const [suggestedPlans, setSuggestedPlans] = useState(undefined);
  const [discountValues, setDiscountValues] = useState(undefined);
  const [checkInfoLoader, setCheckInfoLoader] = useState(false);
  const [userSelectedPlan, setUserSelectedPlan] = useState(undefined);
  const [planOffer, setPlanOffer] = useState(null);
  const [liveClassCohorts, setLiveClassCohorts] = useState([]);
  const [isLiveClassSelected, setIsLiveClassSelected] = useState(false);
  const [liveClassServiceItem, setLiveClassServiceItem] = useState(null);
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

  const addOnIdsFromQS = useMemo(() => {
    const queryValue = router.query?.add_ons;
    if (Array.isArray(queryValue)) {
      return parseAddOnIdsFromQuery(queryValue.join(','));
    }
    if (typeof queryValue === 'string') {
      return parseAddOnIdsFromQuery(queryValue);
    }
    return parseAddOnIdsFromQuery(addOnsQS);
  }, [router.query?.add_ons, addOnsQS]);

  const updateAddOnsQuery = useCallback((ids) => {
    const sortedIds = [...ids].sort((a, b) => a - b);
    const currentSorted = [...addOnIdsFromQS].sort((a, b) => a - b);
    const isSame = sortedIds.length === currentSorted.length
      && sortedIds.every((id, index) => id === currentSorted[index]);
    if (isSame) return;

    const nextQuery = { ...router.query };
    if (sortedIds.length > 0) {
      nextQuery.add_ons = sortedIds.join(',');
    } else {
      delete nextQuery.add_ons;
    }
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  }, [addOnIdsFromQS, router]);

  const basePlanPrice = useMemo(() => {
    const planMatch = planData?.plans?.find((planOption) => planOption?.plan_id === selectedPlan?.plan_id);
    const planPrice = Number(planMatch?.price);
    if (Number.isFinite(planPrice) && planPrice > 0) return planPrice;
    const selectedPrice = Number(selectedPlan?.price);
    return Number.isFinite(selectedPrice) ? selectedPrice : 0;
  }, [planData?.plans, selectedPlan?.plan_id, selectedPlan?.price]);

  const liveClassUnitPrice = useMemo(() => {
    if (!liveClassServiceItem) return 0;
    const value = Number(liveClassServiceItem?.price_per_unit ?? liveClassServiceItem?.price ?? 0);
    return Number.isFinite(value) ? value : 0;
  }, [liveClassServiceItem]);

  const liveClassBasePrice = useMemo(() => {
    if (liveClassUnitPrice > 0) return liveClassUnitPrice;
    const selectedPrice = Number(selectedPlan?.price) || 0;
    const diff = selectedPrice - basePlanPrice;
    return diff > 0 ? diff : 0;
  }, [liveClassUnitPrice, selectedPlan?.price, basePlanPrice]);

  const discountedLiveClassUnitPrice = useMemo(() => {
    if (liveClassBasePrice <= 0) return 0;
    let price = liveClassBasePrice;
    allCoupons.forEach((appliedCoupon) => {
      const result = getPriceWithDiscount(price, appliedCoupon);
      if (result?.price !== undefined && Number.isFinite(result.price)) {
        price = result.price;
      }
    });
    return price;
  }, [liveClassBasePrice, allCoupons, getPriceWithDiscount]);

  const liveClassPrice = useMemo(() => (
    isLiveClassSelected ? discountedLiveClassUnitPrice : 0
  ), [discountedLiveClassUnitPrice, isLiveClassSelected]);

  const liveClassOriginalPrice = useMemo(() => (
    isLiveClassSelected ? liveClassBasePrice : 0
  ), [isLiveClassSelected, liveClassBasePrice]);

  const liveClassPeriod = useMemo(() => (
    liveClassServiceItem?.periodicity
    || liveClassServiceItem?.period
    || 'month'
  ), [liveClassServiceItem]);

  const liveClassPeriodLabel = useMemo(() => {
    const map = {
      month: t('live-classes.period.month'),
      monthly: t('live-classes.period.month'),
      year: t('live-classes.period.year'),
      yearly: t('live-classes.period.year'),
    };
    const normalized = String(liveClassPeriod || '').toLowerCase();
    return map[normalized] || liveClassPeriod;
  }, [liveClassPeriod, t]);

  const liveClassPlan = liveClassServiceItem?.plan || liveClassServiceItem?.plan_financing;
  const isOneTimeLiveClass = Boolean(liveClassPlan);

  const formattedLiveClassUnitPrice = useMemo(() => (
    discountedLiveClassUnitPrice > 0
      ? `${currencySymbol}${discountedLiveClassUnitPrice.toFixed(2)}`
      : ''
  ), [currencySymbol, discountedLiveClassUnitPrice]);

  const programName = useMemo(() => {
    const offerName = resolveLocalizedValue(
      planOffer?.original_plan?.title
      || planOffer?.original_plan?.name,
    );
    const fallback = resolveLocalizedValue(originalPlan?.title) || originalPlan?.title;
    return offerName || fallback || '';
  }, [planOffer, originalPlan]);

  const liveClassOfferDetails = useMemo(() => (
    planOffer?.details?.live_class_addon
    || planOffer?.details?.live_class
    || planOffer?.details?.live_classes
    || {}
  ), [planOffer]);

  const liveClassesCopy = useMemo(() => {
    const getValue = (keys, variables = {}) => {
      const list = Array.isArray(keys) ? keys : [keys];
      for (let index = 0; index < list.length; index += 1) {
        const path = list[index];
        if (typeof path === 'string' && path.length > 0) {
          const raw = path.split('.').reduce((acc, key) => (
            acc && acc[key] !== undefined ? acc[key] : undefined
          ), liveClassOfferDetails);
          const localized = resolveLocalizedValue(raw);
          if (localized !== undefined && localized !== null && localized !== '') {
            return translateCopy(localized, variables);
          }
        }
      }
      return undefined;
    };

    const priceText = getValue(['price_label', 'banner.price'], {
      price: formattedLiveClassUnitPrice,
      period: liveClassPeriodLabel,
    });

    const defaultPrice = (() => {
      if (!discountedLiveClassUnitPrice) return t('live-classes.price-included');
      if (isOneTimeLiveClass) {
        return t('live-classes.price-one-time', {
          price: formattedLiveClassUnitPrice,
        });
      }
      return t('live-classes.price-label', {
        price: formattedLiveClassUnitPrice,
        period: liveClassPeriodLabel,
      });
    })();

    const defaultTitle = resolveLocalizedValue(planOffer?.details?.title) || t('live-classes.title');
    const defaultDescription = resolveLocalizedValue(planOffer?.details?.description) || t('live-classes.description');
    const programText = programName
      ? getValue(['program_label', 'program'], { name: programName, program: programName })
        || t('live-classes.program-label', { name: programName })
      : '';

    return {
      title: getValue(['title', 'banner.title', 'heading']) || defaultTitle,
      description: getValue(['description', 'banner.description', 'body']) || defaultDescription,
      shortDescription: getValue(['short_description', 'banner.short_description']) || '',
      toggleOn: getValue(['toggle_on', 'toggle.on']) || t('live-classes.toggle-on'),
      toggleOff: getValue(['toggle_off', 'toggle.off']) || t('live-classes.toggle-off'),
      toggleAria: getValue(['toggle_aria', 'toggle.aria']) || t('live-classes.toggle-aria'),
      price: priceText || defaultPrice,
      planLabel: '',
      program: programText,
      summaryLabel: getValue(['summary_label', 'summary']) || t('live-classes.addon-summary'),
      programsLabel: getValue(['programs_label', 'programs.title']) || t('live-classes.programs-label'),
      timezoneTemplate: getValue(['timezone_label', 'timezone'], { timezone: '{{timezone}}' })
        || t('live-classes.timezone', { timezone: '{{timezone}}' }),
      classRangeTemplate: getValue(['class_range', 'classRange'], { start: '{{start}}', end: '{{end}}' })
        || t('live-classes.class-range', { start: '{{start}}', end: '{{end}}' }),
      noSchedule: getValue(['no_schedule', 'empty_label']) || t('live-classes.no-schedule'),
    };
  }, [
    discountedLiveClassUnitPrice,
    formattedLiveClassUnitPrice,
    liveClassOfferDetails,
    liveClassPeriod,
    liveClassPeriodLabel,
    liveClassPlan,
    programName,
    resolveLocalizedValue,
    t,
    translateCopy,
  ]);

  const processedPrice = useMemo(() => {
    let pricingData = { ...selectedPlan };
    const discounts = [];

    allCoupons.forEach((c) => {
      pricingData = getPriceWithDiscount(pricingData.price, c);
      discounts.push(pricingData);
    });
    return pricingData;
  }, [allCoupons, selectedPlan]);

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
    } catch (e) {
      console.log(e);
    }
  };

  const removeManualCoupons = () => {
    setAllCoupons((prev) => {
      const filtered = prev.filter((c) => c?.source !== 'manual');
      return filtered;
    });
    if (checkingData?.id) {
      saveCouponToBag([''], checkingData.id, '', true);
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

  const findAutoSelectedPlan = (checking) => {
    const plans = checking?.plans || [];
    const sortedPlans = plans.sort((a, b) => (a.how_many_months || 0) - (b.how_many_months || 0));
    const defaultAutoSelectedPlan = sortedPlans[0];
    const autoSelectedPlanByQueryString = checking?.plans?.find(
      (item) => item?.plan_id === (planId || userSelectedPlan?.plan_id),
    );

    return autoSelectedPlanByQueryString || defaultAutoSelectedPlan;
  };

  const initializePlanData = async () => {
    try {
      const resp = await bc.payment({ country_code: location?.countryShort }).getPlan(planFormated);
      const { data } = resp;
      setPlanData(data);
      const processedPlan = await processPlans(data, {
        quarterly: false,
        halfYearly: false,
        planType: 'original',
        selectedAddOns: addOnIdsFromQS.map((id) => ({ addOnId: id, qty: 1 })),
      });

      const accordionList = processedPlan?.featured_info?.map((info) => ({
        title: info.features[0]?.title || slugToTitle(info.service?.slug),
        description: info.features[0]?.description,
      })) || [];

      let accordionListWithAddOns = accordionList;
      if (addOnIdsFromQS.length > 0) {
        const selectedAddOns = (data?.add_ons || []).filter((ao) => addOnIdsFromQS.includes(ao?.id));
        const addOnsAccordion = selectedAddOns.map((ao) => ({
          title: ao?.service?.title || slugToTitle(ao?.service?.slug),
          description: '',
        }));
        accordionListWithAddOns = [...accordionList, ...addOnsAccordion];
      }

      const liveClassAddOn = (data?.add_ons || []).find((addOn) => addOn?.service?.consumer === 'LIVE_CLASS_JOIN');
      if (liveClassAddOn) {
        setLiveClassServiceItem(liveClassAddOn);
        const liveAddOnId = Number(liveClassAddOn?.id);
        const selectedByQuery = addOnIdsFromQS.includes(liveAddOnId);
        const shouldSelect = Boolean(liveClassAddOn?.is_default) || selectedByQuery;
        setIsLiveClassSelected(shouldSelect);
        if (Number.isFinite(liveAddOnId)) {
          if (shouldSelect && !selectedByQuery) {
            updateAddOnsQuery([...addOnIdsFromQS, liveAddOnId]);
          }
          if (!shouldSelect && selectedByQuery) {
            updateAddOnsQuery(addOnIdsFromQS.filter((id) => id !== liveAddOnId));
          }
        }
      } else {
        setLiveClassServiceItem(null);
        setIsLiveClassSelected(false);
      }

      const defaultPlan = processedPlan?.plans?.find((item) => item?.plan_id === planId)
        || processedPlan?.plans?.[0] || {};

      const { data: planOfferResponse } = await bc.payment({ original_plan: processedPlan?.slug }).planOffer();
      const primaryOffer = Array.isArray(planOfferResponse) ? planOfferResponse[0] : null;

      const { data: allCouponsApplied } = await bc.payment({ coupons: [couponQuery || coupon], plan: primaryOffer?.suggested_plan?.slug || processedPlan?.slug }).verifyCoupon();
      setDiscountValues(allCouponsApplied);

      setSuggestedPlans(primaryOffer?.suggested_plan);
      setPlanOffer(primaryOffer);
      setLiveClassCohorts(Array.isArray(primaryOffer?.live_cohorts) ? primaryOffer.live_cohorts : []);

      if (pathname !== '/renew') {
        setSelectedPlan(defaultPlan);
      }
      setOriginalPlan({ ...processedPlan, accordionList: accordionListWithAddOns });
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

  const getCheckingData = async (options = {}) => {
    try {
      setLoader('plan', true);

      const effectiveAddOnIds = Array.isArray(options.overrideAddOnIds)
        ? options.overrideAddOnIds
        : addOnIdsFromQS;
      const checking = await getChecking(planData, { overrideAddOnIds: effectiveAddOnIds });

      // Check if getChecking returned an error response
      if (checking?.status >= 400) {
        setPaymentStatus('error');
        setDeclinedPayment({
          title: t('transaction-denied'),
          description: checking?.data?.detail || checking?.detail || t('payment-not-processed'),
        });
        handleStep(stepsEnum.SUMMARY);
        setLoader('plan', false);
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
    } catch (error) {
      setLoader('plan', false);
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
    const accessToken = getStorageItem('accessToken');
    if (!planFormated && isAuthenticated) {
      router.push('/pricing');
    }

    if (planFormated && isAuthenticated && planData && pathname !== '/renew') {
      getCheckingData({ overrideAddOnIds: addOnIdsFromQS });
    }
    if (!isAuthenticated && !accessToken) {
      setLoader('plan', false);
    }
  }, [isAuthenticated, router.locale, planData, pathname, addOnIdsFromQS]);

  useEffect(() => {
    if (!userSelectedPlan || !planData) return;
    setCheckInfoLoader(true);
    getChecking(planData, { overrideAddOnIds: addOnIdsFromQS })
      .then((checking) => {
        const autoSelectedPlan = findAutoSelectedPlan(checking);

        setSelectedPlan(autoSelectedPlan);
        if (stepIndex >= stepsEnum.PAYMENT) {
          handleStep(stepsEnum.PAYMENT);
        }
        setCheckInfoLoader(false);
      })
      .catch(() => {
        setCheckInfoLoader(false);
      });
  }, [userSelectedPlan, addOnIdsFromQS]);

  useEffect(() => {
    if (!liveClassServiceItem) return;
    const liveId = Number(liveClassServiceItem?.id);
    if (!Number.isFinite(liveId)) return;
    setIsLiveClassSelected(addOnIdsFromQS.includes(liveId));
  }, [addOnIdsFromQS, liveClassServiceItem?.id]);

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
    const months = Number(selectedPlan?.how_many_months) || 1;
    const discountedRecurring = Number.isFinite(Number(processedPrice?.price))
      ? Number(processedPrice?.price)
      : basePlanPrice;
    const originalRecurring = Number.isFinite(Number(processedPrice?.originalPrice))
      ? Number(processedPrice?.originalPrice)
      : basePlanPrice;
    const addonCharge = isOneTimeLiveClass ? liveClassPrice : 0;

    if (processedPrice?.discountType === 'FIXED_PRICE') {
      const firstMonthPrice = discountedRecurring + addonCharge;
      const remainingMonthsPrice = originalRecurring * Math.max(0, months - 1);
      return (firstMonthPrice + remainingMonthsPrice).toFixed(2);
    }

    const periods = months > 0 ? months : 1;
    const recurringTotal = discountedRecurring * periods;
    return (recurringTotal + addonCharge).toFixed(2);
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

    if (selectedPlan?.price > 0 || basePlanPrice > 0) {
      const recurringPrice = Number.isFinite(basePlanPrice) && basePlanPrice > 0
        ? basePlanPrice
        : Number(selectedPlan?.price) || 0;

      const discountedPrice = applyDiscounts(recurringPrice, discountValues);

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
  // Re-run preview and refresh the right-hand summary.
  useEffect(() => {
    if (pathname === '/renew') return;

    if (!userSelectedPlan || !planData) return;
    setCheckInfoLoader(true);
    getChecking(planData)
      .then((checking) => {
        const autoSelectedPlan = findAutoSelectedPlan(checking);

        setSelectedPlan(autoSelectedPlan);
        if (stepIndex >= stepsEnum.PAYMENT) {
          handleStep(stepsEnum.PAYMENT);
        }
        setCheckInfoLoader(false);
      })
      .catch(() => {
        setCheckInfoLoader(false);
      });
  }, [userSelectedPlan, pathname]);

  // STEP 3: Apply coupon once checking/bag exists
  // Updates Subtotal/Total in the right-hand summary.
  useEffect(() => {
    if (checkingData?.id && !checkingData?.isTrial) {
      if (couponValue) setDiscountCode(couponValue);
      handleCoupon(couponValue);
    }
  }, [couponValue, checkingData?.id]);

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

  const toggleLiveClassSelection = async () => {
    if (!liveClassServiceItem) return;
    const liveAddOnId = Number(liveClassServiceItem?.id);
    if (!Number.isFinite(liveAddOnId)) return;

    const nextSelected = !isLiveClassSelected;
    const nextIdsSet = new Set(addOnIdsFromQS);
    if (nextSelected) nextIdsSet.add(liveAddOnId);
    else nextIdsSet.delete(liveAddOnId);
    const nextIds = Array.from(nextIdsSet);

    setIsLiveClassSelected(nextSelected);
    updateAddOnsQuery(nextIds);

    if (planData && pathname !== '/renew') {
      setCheckInfoLoader(true);
      try {
        const checking = await getChecking(planData, { overrideAddOnIds: nextIds });
        const autoSelectedPlan = findAutoSelectedPlan(checking);
        if (autoSelectedPlan) setSelectedPlan(autoSelectedPlan);
        setOriginalPlan((prev) => ({
          ...prev,
          plans: checking?.plans || prev?.plans,
          financingOptions: checking?.financingOptions || prev?.financingOptions,
          paymentOptions: checking?.paymentOptions || prev?.paymentOptions,
        }));
      } finally {
        setCheckInfoLoader(false);
      }
    }
  };

  return {
    couponError,
    setCouponError,
    checkInfoLoader,
    userSelectedPlan,
    renderPlanDetails,
    calculateTotalPrice,
    getDiscountValue,
    fixedCouponExist,
    setUserSelectedPlan,
    saveCouponToBag,
    allCoupons,
    processedPrice,
    originalPlan,
    planOffer,
    programName,
    discountCode,
    setDiscountCode,
    currencySymbol,
    couponValue,
    planFormated,
    planId,
    discountCoupon,
    setDiscountCoupon,
    liveClassCohorts,
    liveClassServiceItem,
    isLiveClassSelected,
    toggleLiveClassSelection,
    basePlanPrice,
    liveClassPrice,
    liveClassOriginalPrice,
    isOneTimeLiveClass,
    liveClassesCopy,
    handleCoupon,
    removeManualCoupons,
  };
};
export default useCheckout;
