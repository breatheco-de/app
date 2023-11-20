import { Box, Flex, Container, Button, Img } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import NextChakraLink from '../common/components/NextChakraLink';
import Heading from '../common/components/Heading';
import Text from '../common/components/Text';
import Faq from '../common/components/Faq';
import useStyle from '../common/hooks/useStyle';
import bc from '../common/services/breathecode';
import { fetchSuggestedPlan, getTranslations } from '../common/handlers/subscriptions';
import useAuth from '../common/hooks/useAuth';
import axiosInstance from '../axios';
import PricingCard from '../common/components/PricingCard';
import { getQueryString } from '../utils';
import LoaderScreen from '../common/components/LoaderScreen';

const switchTypes = {
  monthly: 'monthly',
  yearly: 'yearly',
};
// const getYearlyPlans = (originalPlan, suggestedPlan, allFeaturedPlans) => {
//   const existsYearlyInOriginalPlan = originalPlan?.plans?.some((p) => p?.price > 0 && p?.period === 'YEAR');
//   const existsYearlyInSuggestedPlan = suggestedPlan?.plans?.some((p) => p?.price > 0 && p?.period === 'YEAR');

//   if (!existsYearlyInOriginalPlan && existsYearlyInSuggestedPlan) {
//     const yearlyPlan = suggestedPlan?.plans?.filter((p) => p?.period === 'YEAR');
//     const freeOrTrialPlan = originalPlan?.plans?.filter((p) => p?.price === 0 || p?.period === 'TRIAL' || p?.period === 'FREE') || [];
//     return [...freeOrTrialPlan, ...yearlyPlan];
//   }
//   return allFeaturedPlans.filter((p) => p?.period === 'YEAR');
// };

function PricingView({ data, isForModal }) {
  const { t, lang } = useTranslation('pricing');
  const [activeType, setActiveType] = useState('monthly');
  const { isAuthenticated } = useAuth();
  const [allFeaturedPlans, setAllFeaturedPlans] = useState([]);
  const [relatedSubscription, setRelatedSubscription] = useState({});
  const { hexColor } = useStyle();
  const queryPlan = getQueryString('plan');
  const planFormated = (queryPlan && encodeURIComponent(queryPlan)) || 'basic';
  const [isFetching, setIsFetching] = useState(!data?.title);
  const [principalData, setPrincipalData] = useState(data);
  const [paymentTypePlans, setPaymentTypePlans] = useState({
    monthly: [],
    yearly: [],
  });

  axiosInstance.defaults.headers.common['Accept-Language'] = lang;
  const bootcampInfo = t('common:bootcamp', {}, { returnObjects: true });

  useEffect(() => {
    if (!data?.title) {
      const translations = getTranslations(t);
      fetchSuggestedPlan(planFormated, translations)
        .then((suggestedPlanData) => {
          setPrincipalData(suggestedPlanData);
        });
    }
  }, []);

  useEffect(() => {
    if (principalData?.title) {
      const originalPlan = principalData?.plans?.original_plan;
      const suggestedPlan = principalData?.plans?.suggested_plan;
      const allPlansList = [
        ...originalPlan?.plans || [],
        ...suggestedPlan?.plans || [],
      ];
      // const monthlyPlans = allPlansList?.length > 0
      //   ? allPlansList.filter((p) => p?.period !== 'YEAR')
      //   : [];
      // const yearlyPlans = allPlansList?.length > 0
      //   ? getYearlyPlans(originalPlan, suggestedPlan, allPlansList)
      //   : [];

      setAllFeaturedPlans(allPlansList);
      const monthlyPlans = t('signup:pricing.monthly-plans', {}, { returnObjects: true });
      const yearlyPlans = t('signup:pricing.yearly-plans', {}, { returnObjects: true });
      setPaymentTypePlans({
        monthly: monthlyPlans,
        yearly: yearlyPlans,
      });
      setIsFetching(false);
    }
  }, [principalData?.title]);

  const switcherInfo = [
    {
      type: 'monthly',
      name: t('signup:info.monthly'),
      exists: paymentTypePlans.monthly.length > 0,
    },
    {
      type: 'yearly',
      name: t('signup:info.yearly'),
      exists: paymentTypePlans.yearly.length > 0,
    },
  ];
  const existentOptions = switcherInfo.filter((l) => l.exists);

  useEffect(() => {
    if (isAuthenticated && allFeaturedPlans?.length > 0) {
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
  }, [isAuthenticated, allFeaturedPlans.length]);

  return (
    <>
      {isFetching && (
        <LoaderScreen position={isForModal ? 'absolute' : 'fixed'} />
      )}
      <Head>
        {principalData?.title && (
          <title>{`${principalData?.title} | 4Geeks`}</title>
        )}
      </Head>
      <Container
        maxWidth="1180px"
        position="relative"
        margin="0 auto"
        my={isForModal ? '2rem' : '4rem'}
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
        </Box>
        <Flex flexWrap={{ base: 'wrap', lg: 'nowrap' }} justifyContent="center" gridGap="24px" margin="0 auto">
          {paymentTypePlans.monthly?.length > 0 && paymentTypePlans.monthly.map((plan) => (
            <PricingCard
              key={plan?.plan_id}
              item={plan}
              relatedSubscription={relatedSubscription}
              width={{ base: '300px', md: '100%' }}
              display={activeType === switchTypes.monthly ? 'flex' : 'none'}
            />
          ))}

          {paymentTypePlans.yearly?.length > 0 && paymentTypePlans.yearly.map((plan) => (
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
        <Box marginTop="30px" borderRadius="11px" background={hexColor.featuredColor} padding="24px">
          <Heading marginBottom="10px">{t('learning-code.title')}</Heading>
          <Heading marginBottom="20px" maxWidth="835px" size="sm">{t('learning-code.description')}</Heading>
          <Flex gap="10px" alignItems="center" flexDirection={{ base: 'column', sm: 'row' }}>
            <Button width={{ base: '100%', sm: 'fit-content' }} variant="outline" textTransform="uppercase" color={hexColor.blueDefault} borderColor={hexColor.blueDefault} onClick={() => alert('hi fella')}>
              {t('learning-code.chat')}
            </Button>
            <Text fontWeight="700" textTransform="uppercase">{t('common:word-connector.or')}</Text>
            <Button width={{ base: '100%', sm: 'fit-content' }} variant="outline" textTransform="uppercase" color={hexColor.blueDefault} borderColor={hexColor.blueDefault} onClick={() => alert('hi fella')}>
              {t('learning-code.survey')}
            </Button>
          </Flex>
        </Box>
        <Flex flexDirection={{ base: 'column', sm: 'row' }} marginTop="30px" gap="30px" justifyContent="space-between">
          <Box color="white" maxWidth="700px" background="#00041A" padding="15px" borderRadius="10px">
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
              onClick={() => alert('hi fella')}
              textTransform="uppercase"
              fontSize="13px"
              mt="1rem"
            >
              {t('decided.button')}
            </Button>
          </Box>
          <Img src="/static/images/women-laptop-people.png" />
        </Flex>
        <Faq marginTop="40px" items={t('faq', {}, { returnObjects: true })} />
      </Container>
    </>
  );
}

PricingView.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
  isForModal: PropTypes.bool,
};
PricingView.defaultProps = {
  isForModal: false,
  data: {},
};

export default PricingView;
