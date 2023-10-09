import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import GridContainer from '../common/components/GridContainer';
import Heading from '../common/components/Heading';
import useStyle from '../common/hooks/useStyle';
import bc from '../common/services/breathecode';
import { fetchSuggestedPlan } from '../common/handlers/subscriptions';
import useAuth from '../common/hooks/useAuth';
import axiosInstance from '../axios';
import PricingCard from '../common/components/PricingCard';
import { getQueryString } from '../utils';
import LoaderScreen from '../common/components/LoaderScreen';

const switchTypes = {
  monthly: 'monthly',
  yearly: 'yearly',
};
function PricingPage({ data }) {
  const { t, lang } = useTranslation(['signup', 'common']);
  const [activeType, setActiveType] = useState('monthly');
  const { isAuthenticated } = useAuth();
  const [relatedSubscription, setRelatedSubscription] = useState({});
  const { hexColor } = useStyle();
  const queryPlan = getQueryString('plan');
  const planFormated = (queryPlan && encodeURIComponent(queryPlan)) || '4geeks-standard';
  const [isFetching, setIsFetching] = useState(true);
  const [principalData, setPrincipalData] = useState(data || {});

  axiosInstance.defaults.headers.common['Accept-Language'] = lang;
  const bootcampInfo = t('common:bootcamp', {}, { returnObjects: true });

  useEffect(() => {
    fetchSuggestedPlan(planFormated, t)
      .then((suggestedPlanData) => {
        setPrincipalData(suggestedPlanData);
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, []);

  const originalPlan = principalData?.plans?.original_plan;
  const suggestedPlan = principalData?.plans?.suggested_plan;
  const existsYearlyInOriginalPlan = originalPlan?.plans?.some((p) => p?.price > 0 && p?.period === 'YEAR');
  const existsYearlyInSuggestedPlan = suggestedPlan?.plans?.some((p) => p?.price > 0 && p?.period === 'YEAR');

  const allFeaturedPlans = [
    ...originalPlan?.plans || [],
    ...suggestedPlan?.plans || [],
  ];

  const getYearlyPlans = () => {
    if (!existsYearlyInOriginalPlan && existsYearlyInSuggestedPlan) {
      const yearlyPlan = suggestedPlan?.plans?.filter((p) => p?.period === 'YEAR');
      const freeOrTrialPlan = originalPlan?.plans?.filter((p) => p?.price === 0 || p?.period === 'TRIAL' || p?.period === 'FREE') || [];
      return [...freeOrTrialPlan, ...yearlyPlan];
    }
    return allFeaturedPlans.filter((p) => p?.period === 'YEAR');
  };

  const monthlyPlans = allFeaturedPlans?.length > 0
    ? allFeaturedPlans.filter((p) => p?.period !== 'YEAR')
    : [];
  const yearlyPlans = allFeaturedPlans?.length > 0
    ? getYearlyPlans()
    : [];

  const switcherInfo = [
    {
      type: 'monthly',
      name: t('signup:info.monthly'),
      exists: monthlyPlans.length > 0,
    },
    {
      type: 'yearly',
      name: t('signup:info.yearly'),
      exists: yearlyPlans.length > 0,
    },
  ];

  const existentOptions = switcherInfo.filter((l) => l.exists);

  useEffect(() => {
    if (isAuthenticated) {
      bc.payment({
        status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE',
      }).subscriptions()
        .then((resp) => {
          const subscriptions = resp?.data?.subscriptions || [];
          const planFinancings = resp?.data?.plan_financings || [];
          const allSubscriptions = [...subscriptions, ...planFinancings];
          const findPurchasedPlan = allSubscriptions?.length > 0 && allSubscriptions.find(
            (userPlan) => allFeaturedPlans.some(
              (featuredPlan) => userPlan?.plans[0]?.slug === featuredPlan?.plan_slug
                && userPlan?.invoices?.[0]?.amount === featuredPlan?.price,
            ),
          );
          setRelatedSubscription(findPurchasedPlan);
        });
    }
  }, [isAuthenticated]);

  return (
    <Box>
      {isFetching && (
        <LoaderScreen position="fixed" />
      )}
      <Head>
        {principalData?.title && (
          <title>{`${principalData?.title} | 4Geeks`}</title>
        )}
      </Head>
      <GridContainer
        maxWidth="1180px"
        position="relative"
        margin="0 auto"
        mt="4rem"
        padding="0 10px"
      >
        <Box display="flex" flexDirection="column" alignItems="center" gridGap="32px" gridColumn="1 / span 10">
          <Heading as="h1" textAlign="center">
            {t('signup:our_plans')}
          </Heading>
          {existentOptions.length > 0 && (
            <Box display="flex" border={`1px solid ${hexColor.blueDefault}`} borderRadius="4px">
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

          <Box width="100%" overflowX="auto">
            <Flex width={{ base: 'max-content', md: 'auto' }} justifyContent="center" gridGap="24px" margin="0 auto">
              {monthlyPlans?.length > 0 && monthlyPlans.map((plan) => (
                <PricingCard
                  key={plan?.plan_id}
                  item={plan}
                  relatedSubscription={relatedSubscription}
                  width={{ base: '300px', md: '100%' }}
                  display={activeType === switchTypes.monthly ? 'flex' : 'none'}
                />
              ))}

              {yearlyPlans?.length > 0 && yearlyPlans.map((plan) => (
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
          </Box>
        </Box>
      </GridContainer>
    </Box>
  );
}

PricingPage.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])).isRequired,
};

export default PricingPage;
