import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import getT from 'next-translate/getT';
import PropTypes from 'prop-types';
import GridContainer from '../common/components/GridContainer';
import Heading from '../common/components/Heading';
import useStyle from '../common/hooks/useStyle';
import bc from '../common/services/breathecode';
import { getSuggestedPlan } from '../common/handlers/subscriptions';
import useAuth from '../common/hooks/useAuth';
import axiosInstance from '../axios';
import PricingCard from '../common/components/PricingCard';

export async function getServerSideProps({ query, locale }) {
  const t = await getT(locale, 'common');
  axiosInstance.defaults.headers.common['Accept-Language'] = locale;

  const { plan } = query;
  const planFormated = plan && encodeURIComponent(plan);
  const suggestedPlan = planFormated ? await getSuggestedPlan(planFormated) : {};

  if (suggestedPlan?.status_code >= 400) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      seo: {
        title: `${t('upgrade')} ${t('word-connector.for')} ${suggestedPlan?.title}` || '',
      },
      data: suggestedPlan,
    },
  };
}

const switchTypes = {
  monthly: 'monthly',
  yearly: 'yearly',
};
function PricingPage({ data }) {
  const [activeType, setActiveType] = useState('monthly');
  const { isAuthenticated } = useAuth();
  const [adquiredSubscriptions, setAdquiredSubscriptions] = useState([]);
  const { hexColor } = useStyle();

  const basicPlan = data.plans.original_plan;
  const suggestedPlan = data.plans.suggested_plan;

  const allPlans = [
    ...basicPlan?.plans || [],
    ...suggestedPlan?.plans || [],
  ];
  console.log('adquiredSubscriptions:', adquiredSubscriptions);

  const monthlyPlans = allPlans?.length > 0 ? allPlans.filter((p) => p?.period !== 'YEAR') : [];
  const yearlyPlans = allPlans?.length > 0 ? allPlans.filter((p) => p?.period === 'YEAR') : [];

  console.log('monthlyPlans:', monthlyPlans);

  const switcherInfo = [
    {
      type: 'monthly',
      name: 'Monthly',
      exists: monthlyPlans.length > 0,
    },
    {
      type: 'yearly',
      name: 'Yearly',
      exists: yearlyPlans.length > 0,
    },
  ];

  const existentSwitchs = switcherInfo.filter((l) => l.exists);

  useEffect(() => {
    if (isAuthenticated) {
      bc.payment({
        status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE',
      }).subscriptions()
        .then((resp) => {
          const subscriptions = resp?.data?.subscriptions || [];
          const planFinancings = resp?.data?.plan_financings || [];

          const allSubscriptions = [...subscriptions, ...planFinancings];
          setAdquiredSubscriptions(allSubscriptions);
        });
    }
  }, [isAuthenticated]);

  return (
    <Box>
      <GridContainer
        maxWidth="1280px"
        position="relative"
        margin="0 auto"
        gridColumn="1 / span 10"
        mt="4rem"
      >
        <Box display="flex" flexDirection="column" alignItems="center" gridGap="32px" gridColumn="2 / span 8">
          <Heading as="h1" textAlign="center">Our plans</Heading>
          {existentSwitchs.length > 0 && (
            <Box display="flex" border={`1px solid ${hexColor.blueDefault}`} borderRadius="4px">
              {existentSwitchs.map((info) => (
                <Box
                  key={info.type}
                  padding="8px 16px"
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

          <Flex width="100%" justifyContent="center" gridGap="24px">
            {activeType === switchTypes.monthly && monthlyPlans?.length > 0 && monthlyPlans.map((plan) => (
              <PricingCard item={plan} />
            ))}

            {activeType === switchTypes.yearly && monthlyPlans?.length > 0 && yearlyPlans.map((plan) => (
              <PricingCard item={plan} />
            ))}
          </Flex>
        </Box>
      </GridContainer>
    </Box>
  );
}

PricingPage.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])).isRequired,
};

export default PricingPage;
