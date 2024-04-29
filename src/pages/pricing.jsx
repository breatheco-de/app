import { Box, Flex, Container, Button, Img } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import NextChakraLink from '../common/components/NextChakraLink';
import Heading from '../common/components/Heading';
import Text from '../common/components/Text';
import Faq from '../common/components/Faq';
import useStyle from '../common/hooks/useStyle';
import bc from '../common/services/breathecode';
import useAuth from '../common/hooks/useAuth';
import PricingCard from '../common/components/PricingCard';
import LoaderScreen from '../common/components/LoaderScreen';
import ReactSelect from '../common/components/ReactSelect';
import { getQueryString, isWindow } from '../utils';
import { fetchSuggestedPlan, getTranslations } from '../common/handlers/subscriptions';
import modifyEnv from '../../modifyEnv';
import { parseQuerys } from '../utils/url';
import { WHITE_LABEL_ACADEMY } from '../utils/variables';

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
  const [activeType, setActiveType] = useState('monthly');
  const { isAuthenticated } = useAuth();
  const [relatedSubscription, setRelatedSubscription] = useState({});
  const { hexColor } = useStyle();
  const [isFetching, setIsFetching] = useState(true);
  const queryCourse = getQueryString('course');
  const courseFormated = (queryCourse && encodeURIComponent(queryCourse)) || '';
  const [selectedPlanData, setSelectedPlanData] = useState({});
  const [selectedCourseData, setSelectedCourseData] = useState({
    dropdown_open: false,
  });
  const [allFeaturedPlansSelected, setAllFeaturedPlansSelected] = useState([]);
  const [publicMktCourses, setPublicMktCourses] = useState([]);
  const [paymentTypePlans, setPaymentTypePlans] = useState({
    monthly: [],
    yearly: [],
  });
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const defaultMonthlyPlans = t('signup:pricing.monthly-plans', {}, { returnObjects: true });
  const defaultYearlyPlans = t('signup:pricing.yearly-plans', {}, { returnObjects: true });

  const allDefaultPlansList = [
    ...defaultMonthlyPlans || [],
    ...defaultYearlyPlans || [],
  ];
  const freeFeatures = t('signup:pricing.basic-plan.featured_info', {}, { returnObjects: true });
  const paymentFeatures = t('signup:pricing.premium-plan.featured_info', {}, { returnObjects: true });

  const bootcampInfo = t('common:bootcamp', {}, { returnObjects: true });

  const planTranslations = getTranslations(t);
  const planSlug = selectedCourseData?.plan_slug;

  const insertFeaturedInfo = (plans) => {
    if (plans?.length > 0) {
      return plans?.map((plan) => {
        if (plan.price > 0) {
          return {
            ...plan,
            featured_info: paymentFeatures,
          };
        }
        return {
          ...plan,
          featured_info: freeFeatures,
        };
      });
    }
    return [];
  };
  const formatPlans = (allPlansList) => {
    const financingList = allPlansList?.filter((p) => p?.period === 'FINANCING');
    const initialFinancingOption = financingList?.sort((a, b) => (a?.how_many_months || 0) - (b?.how_many_months || 0))[0] || {};
    const financingData = {
      ...initialFinancingOption,
      optionList: financingList,
    };
    const newPlanlist = allPlansList?.filter((p) => p?.period !== 'FINANCING').concat(financingData);
    return newPlanlist;
  };
  const handleFetchPlan = async () => {
    const data = await fetchSuggestedPlan(planSlug, planTranslations);
    const originalPlan = data?.plans?.original_plan || {};
    const suggestedPlan = data?.plans?.suggested_plan;
    const originalPlanWithFeaturedInfo = insertFeaturedInfo(formatPlans(originalPlan?.plans));
    const suggestedPlanWithFeaturedInfo = insertFeaturedInfo(formatPlans(suggestedPlan?.plans));
    const allPlansList = [
      ...originalPlanWithFeaturedInfo || [],
      ...suggestedPlanWithFeaturedInfo || [],
    ];

    const monthlyAndOtherOptionPlans = allPlansList?.length > 0
      ? allPlansList.filter((p) => p?.period !== 'YEAR')
      : [];
    const yearlyPlans = allPlansList?.length > 0
      ? getYearlyPlans(originalPlanWithFeaturedInfo, suggestedPlanWithFeaturedInfo, allPlansList)
      : [];

    setAllFeaturedPlansSelected(allPlansList);
    setPaymentTypePlans({
      monthly: monthlyAndOtherOptionPlans,
      yearly: yearlyPlans,
    });
    setIsFetching(false);
    return data;
  };
  const { isLoading, status, data: planData } = useQuery({
    queryKey: ['suggestedPlan', { planSlug }],
    queryFn: handleFetchPlan,
    enabled: !!planSlug,
    staleTime: Infinity,
  });

  useEffect(() => {
    const mktQueryString = parseQuerys({
      featured: true,
      academy: WHITE_LABEL_ACADEMY,
    });
    axios.get(`${BREATHECODE_HOST}/v1/marketing/course${mktQueryString}&lang=${lang}`)
      .then(({ data }) => {
        const publicCourses = data?.filter((course) => course?.visibility === 'PUBLIC');
        setPublicMktCourses([
          {
            slug: '',
            title: 'Basic',
          },
          ...publicCourses,
        ]);
        const selectedCourseByQueryString = publicCourses.find((course) => course?.slug === courseFormated);
        if (selectedCourseByQueryString) {
          setSelectedCourseData((prev) => ({ ...prev, ...selectedCourseByQueryString }));
        }
      });
  }, []);

  useEffect(() => {
    setIsFetching(isLoading);
    if (status === 'success' && planData) {
      setSelectedPlanData(planData);
    }
  }, [status, isLoading, planData?.title]);

  const onChangeCourse = (data) => {
    const selectedCourse = publicMktCourses.find((course) => course.slug === data?.value);
    if (selectedCourse?.plan_slug) {
      setSelectedCourseData(selectedCourse);
    } else {
      setSelectedCourseData({});
      setSelectedPlanData({});
    }
  };

  const verifyIfUserAlreadyHaveThisPlan = (userPlan, featuredPlans) => {
    featuredPlans.some(
      (ftPlan) => userPlan?.plans[0]?.slug === ftPlan?.plan_slug
          && userPlan?.invoices?.[0]?.amount === ftPlan?.price,
    );
  };

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
          if (allFeaturedPlansSelected) {
            return verifyIfUserAlreadyHaveThisPlan(userPlan, allFeaturedPlansSelected);
          }
          return verifyIfUserAlreadyHaveThisPlan(userPlan, allDefaultPlansList);
        },
      );
      setRelatedSubscription(findPurchasedPlan);
      setIsFetching(false);
    } catch (e) {
      console.log(e);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMySubscriptions();
    } else setIsFetching(false);
  }, [isAuthenticated]);

  const paymentOptions = {
    monthly: selectedPlanData?.title ? paymentTypePlans.monthly : defaultMonthlyPlans,
    yearly: selectedPlanData?.title ? paymentTypePlans.yearly : defaultYearlyPlans,
  };
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
  const existentOptions = switcherInfo.filter((l) => l.exists);

  return (
    <>
      {isFetching && (
        <LoaderScreen position="fixed" />
      )}
      <Container
        maxWidth="1180px"
        position="relative"
        margin="0 auto"
        my="4rem"
        padding="0 10px"
      >
        <Box marginBottom="20px">
          <Heading marginBottom="20px" as="h2">
            {t('heading')}
          </Heading>
          <Text maxWidth="900px" marginBottom="15px" fontSize="26px">
            {t('sub-heading')}
            {' '}
            <NextChakraLink textDecoration="underline" href={t('read-more-link')} target="_blank">
              {t('read-more')}
            </NextChakraLink>
          </Text>

          {/* Dropdown for courses */}
          <Flex gridGap="1rem" justifyContent="space-between" margin="3.75rem 0 2.5rem 0">
            {publicMktCourses?.length > 0 && (
              <Flex width="100%" alignItems="center" gridGap="8px">
                <Text size="30px" fontWeight={700}>
                  Showing prices for:
                </Text>
                <ReactSelect
                  unstyled
                  id="select-course"
                  placeholder="Select a course"
                  color={hexColor.blueDefault}
                  itemBackgroundColorHovered={hexColor.featuredColor}
                  fontSize="30px"
                  value={{
                    label: selectedCourseData?.course_translation?.title
                      || selectedCourseData?.title
                      || 'Basic',
                  }}
                  onChange={(selected) => {
                    onChangeCourse(selected);
                  }}
                  options={publicMktCourses.map((course) => ({
                    value: course.slug,
                    label: course?.course_translation?.title || course?.title,
                  }))}
                  size="18px"
                />
              </Flex>
            )}

            {existentOptions.length > 0 && (
              <Box width="fit-content" display="flex" border={`1px solid ${hexColor.blueDefault}`} borderRadius="4px">
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
              </Box>
            )}
          </Flex>
        </Box>
        <Flex flexWrap={{ base: 'wrap', lg: 'nowrap' }} justifyContent="center" gridGap="24px" margin="0 auto">
          {paymentOptions?.monthly?.length > 0 && paymentOptions.monthly.map((plan) => (
            <PricingCard
              key={plan?.plan_id}
              item={plan}
              relatedSubscription={relatedSubscription}
              width={{ base: '300px', md: '100%' }}
              display={activeType === switchTypes.monthly ? 'flex' : 'none'}
            />
          ))}

          {paymentOptions?.yearly?.length > 0 && paymentOptions.yearly.map((plan) => (
            <PricingCard
              key={plan?.plan_id}
              item={plan}
              relatedSubscription={relatedSubscription}
              width={{ base: '300px', md: '100%' }}
              display={activeType === switchTypes.yearly ? 'flex' : 'none'}
            />
          ))}
          {bootcampInfo?.type && (
            <PricingCard
              item={bootcampInfo}
              width={{ base: '300px', md: '100%' }}
              display="flex"
            />
          )}
        </Flex>
        {/*
          <Box marginTop="30px" borderRadius="11px" background={hexColor.featuredColor} padding="24px">
            <Heading marginBottom="10px">{t('learning-code.title')}</Heading>
            <Heading marginBottom="20px" maxWidth="835px" size="sm">{t('learning-code.description')}</Heading>
            <Flex gap="10px" alignItems="center" flexDirection={{ base: 'column', sm: 'row' }}>
              <Button
                width={{ base: '100%', sm: 'fit-content' }}
                variant="outline"
                textTransform="uppercase"
                color={hexColor.blueDefault}
                borderColor={hexColor.blueDefault}
                onClick={() => reportDatalayer({
                  dataLayer: {
                    event: 'open_pricing_chat',
                  } })}
              >
                {t('learning-code.chat')}
              </Button>
            </Flex>
          </Box>
        */}
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
    </>
  );
}

export default PricingView;
