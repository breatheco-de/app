/* eslint-disable camelcase */
import { Box, Flex, Container, Button } from '@chakra-ui/react';
import { useEffect, useState, useMemo } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Heading from '../components/Heading';
import Text from '../components/Text';
import Faq from '../components/Faq';
import PricingCard from '../components/PricingCard';
import LoaderScreen from '../components/LoaderScreen';
import MktTrustCards from '../components/PrismicComponents/MktTrustCards';
import MktShowPrices from '../components/PrismicComponents/MktShowPrices';
import Icon from '../components/Icon';
import Rating from '../components/Rating';
import CourseCard from '../components/CourseCard';
import { getQueryString, slugToTitle } from '../utils';
import { WHITE_LABEL_ACADEMY } from '../utils/variables';
import useStyle from '../hooks/useStyle';
import useAuth from '../hooks/useAuth';
import useSession from '../hooks/useSession';
import useSignup from '../hooks/useSignup';
import usePlanMktInfo from '../hooks/usePlanMktInfo';
import useCustomToast from '../hooks/useCustomToast';
import bc from '../services/breathecode';

const switchTypes = {
  monthly: 'monthly',
  yearly: 'yearly',
};

const getYearlyPlans = (originalPlans, suggestedPlans, allFeaturedPlans) => {
  const existsYearlyInOriginalPlan = originalPlans?.some((p) => p?.price > 0 && p?.period === 'YEAR');
  const existsYearlyInSuggestedPlan = suggestedPlans?.some((p) => p?.price > 0 && p?.period === 'YEAR');

  if (!existsYearlyInOriginalPlan && existsYearlyInSuggestedPlan) {
    const yearlyPlan = suggestedPlans?.filter((p) => p?.period === 'YEAR');
    const freeOrTrialPlan = originalPlans?.filter((p) => p?.price === 0 || p?.period === 'TRIAL' || p?.period === 'FREE') || [];
    return [...freeOrTrialPlan, ...yearlyPlan];
  }
  return allFeaturedPlans.filter((p) => p?.period === 'YEAR');
};

function PricingView() {
  const [activeType, setActiveType] = useState('monthly');
  const [viewMode, setViewMode] = useState('immersive-bootcamps');
  const [relatedSubscription, setRelatedSubscription] = useState({});
  const [selectedPlanData, setSelectedPlanData] = useState({});
  const [selectedCourseData, setSelectedCourseData] = useState({});
  const [allFeaturedPlansSelected, setAllFeaturedPlansSelected] = useState([]);
  const [isFetching, setIsFetching] = useState({ courses: true, selectedPlan: true });
  const [showBootcamps, setShowBootcamps] = useState(false);
  const [previousViewMode, setPreviousViewMode] = useState('');
  const [premiumPlan, setPremiumPlan] = useState(null);
  const [premiumPlanCourses, setPremiumPlanCourses] = useState([]);
  const [showPremiumPlan, setShowPremiumPlan] = useState(false);
  const [paymentTypePlans, setPaymentTypePlans] = useState({ hasSubscriptionMethod: false, monthly: [], yearly: [] });
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  const { t, lang } = useTranslation('pricing');
  const { getSelfAppliedCoupon, handleSuggestedPlan, generatePlan } = useSignup();
  const { getPlanFeatures } = usePlanMktInfo();
  const { createToast } = useCustomToast({ toastId: 'pricing-plan-error' });
  const { isAuthenticated, cohorts } = useAuth();
  const { location } = useSession();
  const { hexColor, backgroundColor, fontColor } = useStyle();
  const router = useRouter();

  const queryCourse = getQueryString('course');
  const queryPlan = getQueryString('plan');
  const queryView = getQueryString('view');
  const premiumPlanSlug = process.env.PURCHASE_PLAN || '4geeks-plus-subscription';
  const defaultMonthlyPlans = t('signup:pricing.monthly-plans', {}, { returnObjects: true });
  const defaultYearlyPlans = t('signup:pricing.yearly-plans', {}, { returnObjects: true });
  const features = t('course:features', {}, { returnObjects: true }) || {};
  const reviewsData = t('course:reviews', {}, { returnObjects: true });
  const generalreviews = reviewsData?.default;
  const bootcampInfo = t('common:bootcamp', {}, { returnObjects: true });
  const bootcampCourses = t('bootcamp-courses', {}, { returnObjects: true });
  const planFormated = useMemo(() => (queryPlan && encodeURIComponent(queryPlan)) || '', [queryPlan]);
  const allDefaultPlansList = useMemo(() => [...defaultMonthlyPlans || [], ...defaultYearlyPlans || []], [defaultMonthlyPlans, defaultYearlyPlans]);
  const courseFormated = useMemo(() => (queryCourse && encodeURIComponent(queryCourse)) || '', [queryCourse]);
  const selectedPlanListExists = selectedPlanData?.planList?.length > 0;
  const planSlug = selectedCourseData?.plan_slug || planFormated;

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // Update URL with view mode
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        view: mode,
      },
    }, undefined, { shallow: true });
  };

  useEffect(() => {
    if (queryView === 'self-paced') {
      setViewMode('self-paced');
    } else {
      setViewMode('immersive-bootcamps');
      if (!queryView) {
        router.replace({
          pathname: router.pathname,
          query: {
            ...router.query,
            view: 'immersive-bootcamps',
          },
        }, undefined, { shallow: true });
      }
    }
  }, [queryView, router]);

  useEffect(() => {
    if (previousViewMode !== viewMode) {
      setShowPremiumPlan(false);
      setShowBootcamps(false);
    }

    if (viewMode === 'self-paced' && previousViewMode !== 'self-paced' && premiumPlan) {
      setTimeout(() => {
        setShowPremiumPlan(true);
      }, 100);
    }

    if (viewMode === 'immersive-bootcamps' && previousViewMode !== 'immersive-bootcamps') {
      setTimeout(() => {
        setShowBootcamps(true);
      }, 100);
    }

    setPreviousViewMode(viewMode);
  }, [viewMode, previousViewMode, premiumPlan]);

  const formatPlans = (allPlansList, hideYearlyOption = false) => {
    const freeTierList = allPlansList?.filter((p) => p?.isFreeTier);
    const financingList = allPlansList?.filter((p) => p?.period === 'FINANCING');
    const payablePlanList = freeTierList?.length > 0
      ? allPlansList?.filter((p) => p?.price > 0 && (hideYearlyOption && p?.period !== 'YEAR'))
      : allPlansList?.filter((p) => p?.period === 'FINANCING')?.sort((a, b) => (a?.how_many_months || 0) - (b?.how_many_months || 0));

    const initialFinancingOption = payablePlanList[0] || {};
    const financingData = {
      ...initialFinancingOption,
      optionList: payablePlanList,
    };
    if (freeTierList?.length > 0) {
      return freeTierList.concat(financingData);
    }
    if (financingList?.length > 0 && freeTierList?.length === 0) {
      return allPlansList?.filter((p) => p?.period !== 'FINANCING').concat(financingData);
    }
    return allPlansList;
  };

  const handleFetchPlan = async () => {
    const data = await handleSuggestedPlan(planSlug);
    console.log(data);

    const firstPlan = data?.planList?.[0];
    if (firstPlan?.featured_info?.status_code === 404 && firstPlan?.featured_info?.detail === 'Plan not found') {
      createToast({
        position: 'top',
        title: t('plan-not-found', { planSlug }),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      router.push({
        pathname: '/pricing',
        query: {},
      });
      return null;
    }

    const originalPlan = data?.plans?.original_plan || {};
    const suggestedPlan = data?.plans?.suggested_plan || {};
    const allPlanList = [...originalPlan?.plans || [], ...suggestedPlan?.plans || []];
    const existsFreeTier = allPlanList?.some((p) => p?.price === 0);

    await getSelfAppliedCoupon(suggestedPlan.slug || originalPlan.slug);

    const formatedPlanList = allPlanList?.length > 0 ? await getPlanFeatures(formatPlans(allPlanList, true)) : [];

    const originalPlanWithFeaturedInfo = originalPlan?.plans?.length > 0 ? await getPlanFeatures(formatPlans(originalPlan?.plans)) : [];
    const suggestedPlanWithFeaturedInfo = suggestedPlan?.plans?.length > 0 ? await getPlanFeatures(formatPlans(suggestedPlan?.plans)) : [];

    const filteredPlanList = existsFreeTier
      ? formatedPlanList
      : [
        ...originalPlanWithFeaturedInfo || [],
        ...suggestedPlanWithFeaturedInfo || [],
      ];

    const monthlyAndOtherOptionPlans = filteredPlanList?.filter((p) => p?.period !== 'YEAR') || [];
    const yearlyPlans = filteredPlanList?.length > 0
      ? getYearlyPlans(originalPlanWithFeaturedInfo, suggestedPlanWithFeaturedInfo, filteredPlanList)
      : [];

    setAllFeaturedPlansSelected(filteredPlanList);
    setPaymentTypePlans({
      hasSubscriptionMethod: Boolean(originalPlan?.hasSubscriptionMethod || suggestedPlan?.hasSubscriptionMethod),
      monthly: monthlyAndOtherOptionPlans,
      yearly: yearlyPlans,
    });
    return data;
  };

  const { isLoading, status, data: planData, isFetching: isQueryFetching } = useQuery({
    queryKey: ['suggestedPlan', { planSlug }],
    queryFn: handleFetchPlan,
    enabled: !!planSlug,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (planSlug && paymentTypePlans.monthly.length > 0) {
      setIsFetching((prev) => ({ ...prev, selectedPlan: true }));
      const updatePlans = async () => {
        const updatedMonthlyPlans = await getPlanFeatures(paymentTypePlans.monthly);
        const updatedYearlyPlans = await getPlanFeatures(paymentTypePlans.yearly);
        setPaymentTypePlans((prev) => ({
          ...prev,
          monthly: updatedMonthlyPlans,
          yearly: updatedYearlyPlans,
        }));
        setIsFetching((prev) => ({ ...prev, selectedPlan: false }));
      };
      updatePlans();
    }
  }, [lang, paymentTypePlans.monthly.length]);

  useEffect(() => {
    if (isLoading || isQueryFetching) {
      setIsFetching((prev) => ({ ...prev, selectedPlan: true }));
    }
    if (!isLoading && !isQueryFetching && status === 'success' && planData) {
      setSelectedPlanData(planData);
      setIsFetching((prev) => ({ ...prev, selectedPlan: false }));
    }
  }, [status, isLoading, isQueryFetching, planData?.title]);

  const fetchCourses = async () => {
    try {
      const response = await bc.marketing({
        featured: true,
        academy: WHITE_LABEL_ACADEMY,
        country_code: location?.countryShort,
      }).courses();
      const { data } = response;

      const publicCourses = data?.filter((course) => course?.visibility === 'PUBLIC' && course?.plan_slug !== 'basic' && course?.plan_slug !== 'free-trial-deep-dive-into-python');
      const coursesRelatedToPremium = publicCourses?.filter((course) => course?.plan_slug === premiumPlanSlug);
      setPremiumPlanCourses(coursesRelatedToPremium);

      const selectedCourseByQueryString = publicCourses.find((course) => course?.slug === courseFormated);

      if (selectedCourseByQueryString || planFormated) {
        setSelectedCourseData((prev) => ({ ...prev, ...selectedCourseByQueryString }));
      }

      if (planFormated && !selectedCourseByQueryString) {
        router.push({
          pathname: '/pricing',
          query: {},
        });
      }
    } catch (error) {
      console.error('Error fetching marketing courses:', error);
    } finally {
      setIsFetching((prev) => ({ ...prev, courses: false }));
      setIsInitialLoadComplete(true);
    }
  };

  const fetchPremiumPlanWithCoupons = async () => {
    const premiumPlanData = await generatePlan(premiumPlanSlug);
    await getSelfAppliedCoupon(premiumPlanData?.slug || premiumPlanSlug);
    setPremiumPlan(premiumPlanData);
  };

  useEffect(() => {
    fetchCourses();
    fetchPremiumPlanWithCoupons();
  }, [lang]);

  useEffect(() => {
    if (premiumPlan && viewMode === 'self-paced' && !showPremiumPlan) {
      setTimeout(() => {
        setShowPremiumPlan(true);
      }, 50);
    }
  }, [premiumPlan, viewMode, showPremiumPlan]);

  const verifyIfUserAlreadyHaveThisPlan = (userPlan, featuredPlans) => featuredPlans.some(
    (ftPlan) => userPlan?.plans[0]?.slug === ftPlan?.plan_slug,
  );

  const fetchMySubscriptions = async () => {
    try {
      const resp = await bc.payment({
        status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE',
      }).subscriptions();

      const subscriptions = resp?.data?.subscriptions || [];
      const planFinancings = resp?.data?.plan_financings || [];
      const allSubscriptions = [...subscriptions, ...planFinancings];
      const findPurchasedPlan = allSubscriptions?.length > 0 && allSubscriptions.find(
        (userPlan) => {
          if (allFeaturedPlansSelected?.length > 0) {
            return verifyIfUserAlreadyHaveThisPlan(userPlan, allFeaturedPlansSelected);
          }
          return verifyIfUserAlreadyHaveThisPlan(userPlan, allDefaultPlansList);
        },
      );
      setRelatedSubscription(findPurchasedPlan);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const hasActiveBootcamp = cohorts.some((cohort) => !cohort.available_as_saas
      && cohort.ending_date && new Date(cohort.ending_date) > new Date()
      && cohort.cohort_user.educational_status === 'ACTIVE');

    if (hasActiveBootcamp) router.push('/choose-program');
  }, [cohorts, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMySubscriptions();
    }
  }, [isAuthenticated, allFeaturedPlansSelected]);

  useEffect(() => {
    fetchCourses();
  }, [lang]);

  const paymentOptions = useMemo(() => ({
    monthly: selectedPlanListExists ? paymentTypePlans.monthly : defaultMonthlyPlans,
    yearly: selectedPlanListExists ? paymentTypePlans.yearly : defaultYearlyPlans,
  }), [selectedPlanListExists, paymentTypePlans, defaultMonthlyPlans, defaultYearlyPlans]);

  const isAbleToShowPrices = useMemo(() => {
    if (planSlug && !isInitialLoadComplete) {
      return false;
    }
    return (paymentOptions?.monthly?.length > 0 || paymentOptions?.yearly?.length > 0) && (courseFormated || planFormated);
  }, [planSlug, isInitialLoadComplete, paymentOptions, courseFormated, planFormated]);

  const existentOptions = useMemo(() => {
    const switcherInfo = [
      {
        type: 'monthly',
        name: t('signup:info.monthly'),
        exists: paymentOptions.monthly.length > 0,
      },
      {
        type: 'yearly',
        name: t('signup:info.yearly'),
        exists: paymentOptions.yearly.length > 0,
      },
    ];
    return switcherInfo.filter((l) => l.exists);
  }, [paymentOptions, t]);

  const existsSubscriptionMehtod = paymentTypePlans.hasSubscriptionMethod;

  const shouldShowLoader = useMemo(() => {
    if (planSlug) {
      return isFetching.courses || isFetching.selectedPlan || isLoading || isQueryFetching;
    }
    return isFetching.courses;
  }, [planSlug, isFetching.courses, isFetching.selectedPlan, isLoading, isQueryFetching]);

  // Early returns for loading states
  if (shouldShowLoader) {
    return (
      <Container maxWidth="100%" background={hexColor.featuredColor3} paddingY="4rem">
        <LoaderScreen position="fixed" />
      </Container>
    );
  }

  return (
    <Container maxWidth="100%" background={hexColor.featuredColor3} paddingY="4rem">
      <Container
        maxWidth="1280px"
        position="relative"
        margin="0 auto"
        padding="0 10px"
      >
        {!isAbleToShowPrices && (
          <>
            <Box textAlign="center" marginBottom="40px">
              <Text
                size="48px"
                fontWeight="400"
                color="#25BF6C"
                marginBottom="8px"
                lineHeight="1.2"
              >
                {viewMode === 'immersive-bootcamps' ? t('change-your-life-with-bootcamp') : t('learn-at-your-own-pace')}
              </Text>
              <Text
                size="18px"
                margin="0 auto"
                lineHeight="1.5"
              >
                {viewMode === 'immersive-bootcamps'
                  ? t('immersive-bootcamp-description')
                  : t('self-paced-description')}
              </Text>
            </Box>

            <Flex justifyContent="center" marginBottom="40px">
              <Flex
                border={`1px solid ${hexColor.darkBlueDefault}`}
                borderRadius="5px"
                overflow="hidden"
                background={hexColor.background}
              >
                <Button
                  variant="unstyled"
                  padding="0 24px"
                  fontWeight="600"
                  fontSize={{ base: '13px', md: '14px' }}
                  background={viewMode === 'self-paced' ? hexColor.darkBlueDefault : 'transparent'}
                  color={viewMode === 'self-paced' ? 'white' : hexColor.darkBlueDefault}
                  onClick={() => handleViewModeChange('self-paced')}
                  borderRadius="0"
                >
                  {t('self-paced-courses')}
                </Button>
                <Button
                  variant="unstyled"
                  padding="0 24px"
                  fontWeight="600"
                  fontSize={{ base: '13px', md: '14px' }}
                  background={viewMode === 'immersive-bootcamps' ? hexColor.darkBlueDefault : 'transparent'}
                  color={viewMode === 'immersive-bootcamps' ? 'white' : hexColor.darkBlueDefault}
                  onClick={() => handleViewModeChange('immersive-bootcamps')}
                  borderRadius="0"
                >
                  {t('immersive-bootcamp')}
                </Button>
              </Flex>
            </Flex>

            {viewMode === 'self-paced' && (
              <Flex
                opacity={showPremiumPlan ? 1 : 0}
                transform={showPremiumPlan ? 'translateY(0)' : 'translateY(20px)'}
                transition="all 0.5s ease-in-out"
                direction="column"
              >
                <MktShowPrices
                  externalPlanProps={premiumPlan}
                  plan={premiumPlanSlug}
                  paymentSwitchPlacement="inner"
                  title=""
                  description=""
                  padding="0"
                />

                {premiumPlanCourses?.length > 0 && (
                  <Box marginTop="20px">
                    <Heading
                      size="24px"
                      fontWeight="400"
                      marginBottom="40px"
                      textAlign="left"
                    >
                      {t('this-subscription-includes')}
                    </Heading>

                    <Flex gap="20px" flexWrap="wrap">
                      {premiumPlanCourses.map((course) => (
                        <CourseCard
                          key={course.slug}
                          course={course}
                          width="300px"
                          linkType="internal"
                        />
                      ))}
                    </Flex>
                  </Box>
                )}
              </Flex>
            )}

            {viewMode === 'immersive-bootcamps' && (
              <Box
                marginBottom="20px"
                maxWidth="1280px"
                margin="0 auto"
                opacity={showBootcamps ? 1 : 0}
                transform={showBootcamps ? 'translateY(0)' : 'translateY(20px)'}
                transition="all 0.5s ease-in-out"
              >
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(auto-fit, 320px)"
                  gap="24px"
                  justifyItems="start"
                  justifyContent="center"
                >
                  {bootcampCourses?.map((course) => (
                    <CourseCard
                      key={course.slug}
                      course={course}
                      showDescription
                      showIncludedBadge
                      linkType="external"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}
        {isAbleToShowPrices && (
          <Flex gridGap="1rem" flexDirection={{ base: 'column', md: 'row' }} justifyContent="space-between" margin="3.75rem 0 2.5rem 0">
            {!planFormated && (
              <Text size="30px" width="100%" alignItems="center" textAlign={!existsSubscriptionMehtod ? 'center' : 'start'} fontWeight={700}>
                {t('you-are-buying')}
                <Text as="span" size="30px" margin="0 0 0 8px" color="blue.default">
                  {selectedCourseData?.course_translation?.title || slugToTitle(courseFormated) || slugToTitle(planFormated)}
                </Text>
              </Text>
            )}

            {existsSubscriptionMehtod && existentOptions?.length > 0 && ((courseFormated || planFormated) && !isFetching.selectedPlan) && (
              <Flex width="fit-content" margin={planFormated ? '0 0 0 auto' : '0 auto'} border={`1px solid ${hexColor.blueDefault}`} borderRadius="4px">
                {existentOptions.map((info) => (
                  <Box
                    key={info.type}
                    padding="8px 16px"
                    textTransform="uppercase"
                    fontWeight={900}
                    background={activeType === info.type ? 'blue.default' : ''}
                    color={activeType === info.type ? 'white' : 'blue.default'}
                    cursor={activeType === info.type ? 'default' : 'pointer'}
                    onClick={() => setActiveType(info.type)}
                  >
                    {info.name}
                  </Box>
                ))}
              </Flex>
            )}
          </Flex>
        )}
        {isAbleToShowPrices && (
          <Flex flexWrap={{ base: 'wrap', lg: 'nowrap' }} justifyContent="center" gridGap="24px" margin="0 auto">
            {paymentOptions?.monthly?.length > 0 && paymentOptions.monthly.map((plan) => (
              <PricingCard
                key={plan?.plan_id}
                moneyBack
                courseData={selectedCourseData}
                item={plan}
                isFetching={isFetching.selectedPlan}
                relatedSubscription={relatedSubscription}
                width={{ base: '300px', md: '100%' }}
                display={activeType === switchTypes.monthly ? 'flex' : 'none'}
              />
            ))}
            {paymentOptions?.yearly?.length > 0 && paymentOptions.yearly.map((plan) => (
              <PricingCard
                key={plan?.plan_id}
                moneyBack
                courseData={selectedCourseData}
                isFetching={isFetching.selectedPlan}
                item={plan}
                relatedSubscription={relatedSubscription}
                width={{ base: '300px', md: '100%' }}
                display={activeType === switchTypes.yearly ? 'flex' : 'none'}
              />
            ))}
            {bootcampInfo?.type && (
              <PricingCard
                item={bootcampInfo}
                moneyBack={false}
                width={{ base: '300px', md: '100%' }}
                display="flex"
              />
            )}
          </Flex>
        )}
        <MktTrustCards
          title={t('why-trust-us.title')}
          description={t('why-trust-us.description')}
          textStyles={{
            fontWeight: '400',
          }}
          cardStyles={{
            borderColor: 'transparent',
          }}
          margin="60px 0 0 0"
        />
        <Flex flexDirection="column" gridGap="1rem" mt="80px">
          <Heading size={{ base: '24px', md: '34px' }} textAlign="center" fontWeight={400}>
            {t('course:why-learn-4geeks-connector.why-learn-with')}
            {' '}
            <Box as="span" color="blue.default">{t('course:why-learn-4geeks-connector.who')}</Box>
            ?
          </Heading>
          <Text size="18px" margin={{ base: 'auto', md: '0 8vw' }} textAlign="center" style={{ textWrap: 'balance' }} fontWeight={400}>
            {t('course:why-learn-4geeks-connector.benefits-connector')}
          </Text>
        </Flex>
        <Flex gridGap="2rem" flexDirection={{ base: 'column', md: 'row' }} margin="64px 0">
          {features?.list?.length > 0 && features?.list?.map((item) => (
            <Flex key={item.title} flex={{ base: 1, md: 0.33 }} flexDirection="column" gridGap="16px" padding="16px" borderRadius="8px" color={fontColor} background={backgroundColor}>
              <Flex gridGap="8px" alignItems="center">
                <Icon icon={item.icon} color={hexColor.blueDefault} />
                <Heading size="16px" fontWeight={700} color="currentColor" lineHeight="normal">
                  {item?.title}
                </Heading>
              </Flex>
              <Text
                size="14px"
                lineHeight="normal"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            </Flex>
          ))}
        </Flex>
        {generalreviews && (
          <Rating
            totalRatings={generalreviews.total_ratings}
            totalReviews={generalreviews.reviews_numbers}
            rating={generalreviews.rating}
            id="rating-commnets"
            marginTop="40px"
            reviews={generalreviews.reviews}
            cardStyles={{
              border: 'none',
            }}
          />
        )}
        <Faq marginTop="80px" items={t('faq', {}, { returnObjects: true })} />
        <Box>
          <Text fontWeight="300" size="xs" marginTop="20px">
            {t('pricing-disclaimer.title')}
          </Text>
          <Text fontWeight="300" size="xs" marginBottom="20px">
            {t('pricing-disclaimer.description')}
          </Text>
        </Box>
      </Container>
    </Container>
  );
}

export default PricingView;
