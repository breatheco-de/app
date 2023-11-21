import { Box, Flex, Container, Button, Img } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import NextChakraLink from '../common/components/NextChakraLink';
import Heading from '../common/components/Heading';
import Text from '../common/components/Text';
import Faq from '../common/components/Faq';
import useStyle from '../common/hooks/useStyle';
import bc from '../common/services/breathecode';
import useAuth from '../common/hooks/useAuth';
import PricingCard from '../common/components/PricingCard';
import LoaderScreen from '../common/components/LoaderScreen';

const switchTypes = {
  monthly: 'monthly',
  yearly: 'yearly',
};

function PricingView() {
  const { t } = useTranslation('pricing');
  const [activeType, setActiveType] = useState('monthly');
  const { isAuthenticated } = useAuth();
  const [relatedSubscription, setRelatedSubscription] = useState({});
  const { hexColor } = useStyle();
  const [isFetching, setIsFetching] = useState(false);
  const monthlyPlans = t('signup:pricing.monthly-plans', {}, { returnObjects: true });
  const yearlyPlans = t('signup:pricing.yearly-plans', {}, { returnObjects: true });
  const allPlansList = [
    ...monthlyPlans || [],
    ...yearlyPlans || [],
  ];

  const bootcampInfo = t('common:bootcamp', {}, { returnObjects: true });

  const fetchMySubscriptions = async () => {
    try {
      setIsFetching(true);
      const resp = await bc.payment({
        status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE',
      }).subscriptions();

      const subscriptions = resp?.data?.subscriptions || [];
      const planFinancings = resp?.data?.plan_financings || [];
      const allSubscriptions = [...subscriptions, ...planFinancings];
      const findPurchasedPlan = allSubscriptions?.length > 0 && allSubscriptions.find(
        (userPlan) => allPlansList.some(
          (featuredPlan) => userPlan?.plans[0]?.slug === featuredPlan?.slug
              && userPlan?.invoices?.[0]?.amount === featuredPlan?.price,
        ),
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
    }
  }, [isAuthenticated]);

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

  //

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

export default PricingView;
