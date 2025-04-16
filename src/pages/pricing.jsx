/* eslint-disable camelcase */
import { Box, Flex, Container, Button, Img, Link, Image } from '@chakra-ui/react';
import { useEffect, useState, useMemo } from 'react';
import useTranslation from 'next-translate/useTranslation';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Heading from '../components/Heading';
import Text from '../components/Text';
import Faq from '../components/Faq';
import PricingCard from '../components/PricingCard';
import LoaderScreen from '../components/LoaderScreen';
import useSignup from '../hooks/useSignup';
import MktTrustCards from '../components/MktTrustCards';
import DraggableContainer from '../components/DraggableContainer';
import Icon from '../components/Icon';
import { handleSuggestedPlan, getTranslations } from '../handlers/subscriptions';
import { getQueryString, isWindow, slugToTitle } from '../utils';
import { parseQuerys } from '../utils/url';
import { WHITE_LABEL_ACADEMY, BREATHECODE_HOST } from '../utils/variables';
import useStyle from '../hooks/useStyle';
import useAuth from '../hooks/useAuth';
import usePlanMktInfo from '../hooks/usePlanMktInfo';
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
  const { t, lang } = useTranslation('pricing');
  const { getSelfAppliedCoupon } = useSignup();
  const { getPlanFeatures } = usePlanMktInfo();
  const [activeType, setActiveType] = useState('monthly');
  const { isAuthenticated, cohorts } = useAuth();
  const { hexColor, modal } = useStyle();
  const [relatedSubscription, setRelatedSubscription] = useState({});
  const [selectedPlanData, setSelectedPlanData] = useState({});
  const [selectedCourseData, setSelectedCourseData] = useState({});
  const [allFeaturedPlansSelected, setAllFeaturedPlansSelected] = useState([]);
  const [publicMktCourses, setPublicMktCourses] = useState([]);
  const [isFetching, setIsFetching] = useState({ courses: true, selectedPlan: true });
  const [paymentTypePlans, setPaymentTypePlans] = useState({ hasSubscriptionMethod: false, monthly: [], yearly: [] });
  const router = useRouter();
  const queryCourse = getQueryString('course');
  const queryPlan = getQueryString('plan');
  const planTranslations = getTranslations(t);
  const defaultMonthlyPlans = t('signup:pricing.monthly-plans', {}, { returnObjects: true });
  const defaultYearlyPlans = t('signup:pricing.yearly-plans', {}, { returnObjects: true });
  const bootcampInfo = t('common:bootcamp', {}, { returnObjects: true });
  const planFormated = useMemo(() => (queryPlan && encodeURIComponent(queryPlan)) || '', [queryPlan]);
  const allDefaultPlansList = useMemo(() => [...defaultMonthlyPlans || [], ...defaultYearlyPlans || []], [defaultMonthlyPlans, defaultYearlyPlans]);
  const courseFormated = useMemo(() => (queryCourse && encodeURIComponent(queryCourse)) || '', [queryCourse]);
  const selectedPlanListExists = selectedPlanData?.planList?.length > 0;
  const planSlug = selectedCourseData?.plan_slug || planFormated;

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
    const data = await handleSuggestedPlan(planSlug, planTranslations);
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
    if (planSlug) {
      setIsFetching((prev) => ({ ...prev, selectedPlan: true }));
      setTimeout(async () => {
        const updatedMonthlyPlans = await getPlanFeatures(paymentTypePlans.monthly);
        const updatedYearlyPlans = await getPlanFeatures(paymentTypePlans.yearly);
        setPaymentTypePlans((prev) => ({
          ...prev,
          monthly: updatedMonthlyPlans,
          yearly: updatedYearlyPlans,
        }));
        setIsFetching((prev) => ({ ...prev, selectedPlan: false }));
      }, 500);
    }
  }, [lang]);

  useEffect(() => {
    if (isLoading || isQueryFetching) {
      setIsFetching((prev) => ({ ...prev, selectedPlan: true }));
    }
    if (!isLoading && !isQueryFetching && status === 'success' && planData) {
      setSelectedPlanData(planData);
      setIsFetching((prev) => ({ ...prev, selectedPlan: false }));
    }
  }, [status, isLoading, isQueryFetching, planData?.title]);

  useEffect(() => {
    const hasActiveBootcamp = cohorts.some((cohort) => !cohort.available_as_saas
      && cohort.ending_date && new Date(cohort.ending_date) > new Date()
      && cohort.cohort_user.educational_status === 'ACTIVE');

    if (hasActiveBootcamp) router.push('/choose-program');
  }, [cohorts]);

  useEffect(() => {
    const mktQueryString = parseQuerys({
      featured: true,
      academy: WHITE_LABEL_ACADEMY,
    });
    axios.get(`${BREATHECODE_HOST}/v1/marketing/course${mktQueryString}&lang=${lang}`)
      .then(({ data }) => {
        const publicCourses = data?.filter((course) => course?.visibility === 'PUBLIC' && course?.plan_slug !== 'basic' && course?.plan_slug !== 'free-trial-deep-dive-into-python');
        setPublicMktCourses(publicCourses);

        const selectedCourseByQueryString = publicCourses.find((course) => course?.slug === courseFormated);

        if (selectedCourseByQueryString || planFormated) {
          setSelectedCourseData((prev) => ({ ...prev, ...selectedCourseByQueryString }));
        } else {
          router.push({
            pathname: '/pricing',
            query: {},
          });
        }
      })
      .finally(() => {
        setIsFetching((prev) => ({ ...prev, courses: false }));
      });
  }, [lang]);

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
    if (isAuthenticated) {
      fetchMySubscriptions();
    }
  }, [isAuthenticated, allFeaturedPlansSelected]);

  const paymentOptions = useMemo(() => ({
    monthly: selectedPlanListExists ? paymentTypePlans.monthly : defaultMonthlyPlans,
    yearly: selectedPlanListExists ? paymentTypePlans.yearly : defaultYearlyPlans,
  }), [selectedPlanListExists, paymentTypePlans, defaultMonthlyPlans, defaultYearlyPlans]);

  const isAbleToShowPrices = (paymentOptions?.monthly?.length > 0 || paymentOptions?.yearly?.length > 0) && (courseFormated || planFormated);

  const switcherInfo = useMemo(() => [
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
  ], [paymentOptions, t]);

  const existentOptions = switcherInfo.filter((l) => l.exists);
  const existsSubscriptionMehtod = paymentTypePlans.hasSubscriptionMethod;

  return (
    <Container maxWidth="100%" background={hexColor.featuredColor3} paddingY="4rem">
      {isFetching.courses && (
        <LoaderScreen position="fixed" />
      )}
      <Container
        maxWidth="1280px"
        position="relative"
        margin="0 auto"
        padding="0 10px"
      >
        <Box marginBottom="20px">

          {!isAbleToShowPrices && (
            <Flex
              direction={['column', 'column', 'row', 'row']}
            >
              <Box maxWidth="350px">
                <Text size="xl" as="h2" textAlign="start" color={hexColor.blueDefault}>
                  {t('heading')}
                </Text>
                <Text
                  size="30px"
                  flexShrink={[0, 0, 1, 1]}
                  fontWeight="700"
                  width={['100%', '100%', '100%', '100%']}
                >
                  {t('choose-your-career-path')}
                </Text>
                <Text marginBottom="26px" size="xl" as="h2" textAlign="start">
                  {t('sub-heading')}
                </Text>
              </Box>
              <DraggableContainer>
                <Flex gridGap="24px">
                  {publicMktCourses?.length > 0 && publicMktCourses.slice(0, 2).map((course) => (
                    <Flex key={course.slug} borderRadius="8px" background={modal.background3} padding="24px 8px 8px" margin="43px 0 0 0" justifyContent="space-between" minHeight="200px" width={['23rem', '23rem', '27rem', '27rem']} minWidth={['23rem', '23rem', '27rem', '27rem']} flexDirection="column" gridGap="16px" position="relative">
                      <Box position="absolute" borderRadius="full" top="-30px">
                        <Img src={course.icon_url} width="44px" height="44px" />
                      </Box>
                      <Flex flexDirection="column" gridGap="8px">
                        <Heading
                          size="21px"
                          as="h3"
                          lineHeight="normal"
                          fontWeight="700"
                          color={course.color}
                        >
                          {course?.course_translation?.title}
                        </Heading>
                        <Text
                          size="14px"
                          fontWeight="500"
                        >
                          {course?.course_translation?.description}
                        </Text>
                      </Flex>
                      <Link
                        variant="buttonDefault"
                        borderRadius="3px"
                        href={`/${lang}/bootcamp/${course?.slug}`}
                        textAlign="center"
                        width="100%"
                        opacity="0.9"
                        _hover={{ opacity: 1 }}
                        _active={{ opacity: 1 }}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        gap="10px"
                      >
                        <Text fontSize="auto">{t('see-plans-and-prices')}</Text>
                        <Icon icon="longArrowRight" width="18px" height="18px" color="white" />
                      </Link>
                      {course?.course_translation?.landing_variables?.card?.length > 0 && (
                        <Flex flexDirection="column" gridGap="10px" borderRadius="4px" padding="12px">
                          {course?.course_translation?.landing_variables?.card?.map((content) => {
                            const isUrlImage = content?.icon?.includes('http');
                            return (
                              <Flex key={content.title} gridGap="10px">
                                {isUrlImage ? (
                                  <Image src={course?.icon} width="18px" height="18px" borderRadius="8px" background={course?.color || 'green.400'} />
                                ) : (
                                  <Icon icon={content?.icon} width="18px" height="18px" color={hexColor.blueDefault} />
                                )}
                                <Text size="14px" fontWeight="500" letterSpacing="normal">
                                  {content.title}
                                  {' '}
                                  <Text as="span" size="14px" fontWeight="700">
                                    {content.value}
                                  </Text>
                                </Text>
                              </Flex>
                            );
                          })}
                        </Flex>
                      )}
                    </Flex>
                  ))}
                </Flex>
              </DraggableContainer>
            </Flex>
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
        </Box>
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
          margin="60px 0 0 0"
        />
        <Flex flexDirection={{ base: 'column', sm: 'row' }} marginTop="30px" gap="30px" justifyContent="space-between">
          <Box color="white" width="100%" background="#00041A" padding="15px" borderRadius="10px">
            <Heading margin="20px 0" size="sm">
              {t('decided.heading')}
            </Heading>
            <Heading margin="20px 0" size="sm">
              {t('decided.sub_heading')}
            </Heading>
            <Text fontWeight="400" size="md" marginBottom="20px">
              {t('decided.description')}
            </Text>
            <Button
              variant="default"
              onClick={() => {
                if (isWindow) {
                  const langPath = lang === 'en' ? '' : `/${lang}`;
                  window.location.href = `${langPath}/checkout?plan=basic&plan_id=p-0-trial`;
                }
              }}
              textTransform="uppercase"
              fontSize="13px"
              mt="1rem"
            >
              {t('decided.button')}
            </Button>
          </Box>
          <Img margin="auto" width="235px" src="/static/images/women-laptop-people.png" />
        </Flex>
        <Faq marginTop="40px" items={t('faq', {}, { returnObjects: true })} />
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
