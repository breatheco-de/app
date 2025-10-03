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

const useCheckout = () => {
  const { t } = useTranslation('signup');
  const router = useRouter();
  const { query } = router;
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

  const processedPrice = useMemo(() => {
    let pricingData = { ...selectedPlan };
    const discounts = [];

    allCoupons.forEach((c) => {
      pricingData = getPriceWithDiscount(pricingData.price, c);
      discounts.push(pricingData);
    });
    return pricingData;
  }, [allCoupons, selectedPlan]);

  const saveCouponToBag = async (coupons, bagId = '', specificCoupon = '') => {
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
        setCouponError(false);
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
        setCouponError(false);
      } else {
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
      saveCouponToBag([''], checkingData.id);
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

      const { data: suggestedPlanInfo } = await bc.payment({ original_plan: processedPlan?.slug }).planOffer();

      const { data: allCouponsApplied } = await bc.payment({ coupons: [couponQuery || coupon], plan: suggestedPlanInfo[0]?.suggested_plan.slug || processedPlan?.slug }).verifyCoupon();
      setDiscountValues(allCouponsApplied);

      setSuggestedPlans(suggestedPlanInfo[0]?.suggested_plan);

      setSelectedPlan(defaultPlan);
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

  const getCheckingData = async () => {
    try {
      setLoader('plan', true);

      const checking = await getChecking(planData);

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

    if (planFormated && isAuthenticated && planData) {
      getCheckingData();
    }
    if (!isAuthenticated && !accessToken) {
      setLoader('plan', false);
    }
  }, [isAuthenticated, router.locale, planData]);

  useEffect(() => {
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
  }, [userSelectedPlan]);

  // useEffect for selfAppliedCoupons
  useEffect(() => {
    const coupons = [];

    if (selfAppliedCoupon) {
      coupons.push(selfAppliedCoupon);
    }

    const planToUse = selfAppliedCoupon?.plan || planFormated;

    if (planToUse) {
      bc.payment({ plan: planToUse }).getMyUserCoupons()
        .then(({ data: userCouponsData }) => {
          const autoReferralCoupons = (userCouponsData || [])
            .filter((c) => c?.auto === true && c?.is_valid === true)
            .sort((a, b) => new Date(a.offered_at) - new Date(b.offered_at));

          autoReferralCoupons.forEach((ref) => {
            coupons.push({ ...ref, plan: planToUse, source: 'referral' });
          });

          setAllCoupons((prev) => {
            const manualCoupons = prev.filter((c) => c?.source === 'manual');
            const existingSlugs = new Set(coupons.map((c) => c?.slug));
            const uniqueManualCoupons = manualCoupons.filter((c) => !existingSlugs.has(c?.slug));
            return [...coupons, ...uniqueManualCoupons];
          });
        })
        .catch(() => {
          setAllCoupons((prev) => {
            const manualCoupons = prev.filter((c) => c?.source === 'manual');
            const existingSlugs = new Set(coupons.map((c) => c?.slug));
            const uniqueManualCoupons = manualCoupons.filter((c) => !existingSlugs.has(c?.slug));
            return [...coupons, ...uniqueManualCoupons];
          });
        });
    } else {
      setAllCoupons((prev) => {
        const manualCoupons = prev.filter((c) => c?.source === 'manual');
        return [...coupons, ...manualCoupons];
      });
    }
  }, [selfAppliedCoupon, planFormated]);

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
    const months = selectedPlan.how_many_months || 1;

    if (processedPrice.discountType === 'FIXED_PRICE') {
      const firstMonthPrice = processedPrice.price;
      const remainingMonthsPrice = processedPrice.originalPrice * (months - 1);
      return (firstMonthPrice + remainingMonthsPrice).toFixed(2);
    }

    return (processedPrice.price * (selectedPlan.how_many_months ? selectedPlan.how_many_months : 1)).toFixed(2);
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
  }, [router.locale, isLoadingLocation, callbackUrl]);

  // STEP 1.1: Auto-coupon for plan if available
  // Ensures the discount is applied from the start.
  useEffect(() => {
    getSelfAppliedCoupon(planFormated);
  }, []);

  // STEP 2: PREVIEW (checking) of the current plan
  // Renders Subtotal/Total (now/later) including add‑ons and currency.
  useEffect(() => {
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
  }, [isAuthenticated, router.locale, planData]);

  // STEP 2b: user changes option (monthly/annual/financing)
  // Re-run preview and refresh the right-hand summary.
  useEffect(() => {
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
  }, [userSelectedPlan]);

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
    discountCode,
    setDiscountCode,
    currencySymbol,
    couponValue,
    planFormated,
    planId,
    discountCoupon,
    setDiscountCoupon,
    handleCoupon,
    removeManualCoupons,
  };
};
export default useCheckout;
