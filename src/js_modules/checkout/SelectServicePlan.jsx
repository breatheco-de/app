import { Box, Button } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../../common/components/Heading';
import useStyle from '../../common/hooks/useStyle';
import bc from '../../common/services/breathecode';
import { getQueryString, toCapitalize, unSlugify } from '../../utils';
import LoaderScreen from '../../common/components/LoaderScreen';
import Text from '../../common/components/Text';

const SelectServicePlan = () => {
  const { t, lang } = useTranslation('signup');
  const { backgroundColor, hexColor } = useStyle();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedService, setSelectedService] = useState({});

  const queryPlans = getQueryString('plans');
  const queryServiceSet = getQueryString('service_set');

  const getSubscriptions = async () => {
    const resp = await bc.payment({
      status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE',
    }).subscriptions();

    const data = await resp?.data;
    const planFinancing = data.plan_financings.length > 0 ? data.plan_financings : [];
    const planSubscriptions = data.subscriptions.length > 0 ? data.subscriptions : [];

    const allQueryPlans = queryPlans.split(',');
    const allQueryServiceSet = queryServiceSet.split(',');
    const allPlans = [...planFinancing, ...planSubscriptions];

    const findedPlanCoincidences = allPlans.filter((plan) => {
      const findedPlan = allQueryPlans.find(
        (queryPlan) => queryPlan === plan?.plans?.[0]?.slug,
      );
      const findedServiceSet = allQueryServiceSet.find(
        (qServiceSet) => qServiceSet === plan?.selected_mentorship_service_set?.slug,
      );
      return findedPlan && findedServiceSet;
    });

    if (resp.statusText === 'OK' && findedPlanCoincidences.length > 1) {
      setIsLoading(false);
    }

    if (findedPlanCoincidences.length === 1) {
      const pageToRedirect = `/${lang}/checkout?mentorship_service_set=${findedPlanCoincidences[0]?.selected_mentorship_service_set?.slug}&service=${findedPlanCoincidences[0]?.selected_mentorship_service_set.mentorship_services[0]?.slug}`;
      window.location.href = pageToRedirect;
    }
    setSubscriptions(findedPlanCoincidences);
  };

  useEffect(() => {
    getSubscriptions();
  }, []);

  const handleContinue = () => {
    const pageToRedirect = `/${lang}/checkout?mentorship_service_set=${selectedService?.selected_mentorship_service_set?.slug}&service=${selectedService?.selected_mentorship_service_set.mentorship_services[0]?.slug}`;
    window.location.href = pageToRedirect;
  };

  console.log('subscriptions:::', subscriptions);

  return (
    <Box maxWidth="1280px" display="flex" alignItems="center" flexDirection="column" gridGap="2rem" padding="24px" bg={backgroundColor} width="100%" margin="0 auto" borderRadius="17px">
      <Box display="flex" flexDirection="column" gridGap="14px">
        <Heading size="m" m="0 auto">
          {t('select-mentorship-plan.title')}
        </Heading>
        <Text size="14px" width="60%" textAlign="center" margin="0 auto">
          {t('select-mentorship-plan.description')}
        </Text>
      </Box>
      {isLoading ? (
        <LoaderScreen width="240px" height="240px" position="relative" />
      ) : (
        <Box display="flex" flexDirection="column" gridGap="20px" width={{ base: 'auto', md: '80%' }}>
          {subscriptions.length > 0 && subscriptions.map((s) => {
            const title = unSlugify(s?.plans?.[0]?.slug);
            const cohortData = s?.selected_cohort;
            const isSelected = selectedService?.plans?.[0]?.slug === s?.plans?.[0]?.slug;

            return s?.plans?.[0]?.slug && (
              <Box
                key={`${s?.slug}-${s?.title}`}
                display="flex"
                onClick={() => {
                  setSelectedService(s);
                }}
                flexDirection="row"
                width="100%"
                justifyContent="space-between"
                p={{ base: '14px', sm: '22px 18px' }}
                gridGap={{ base: '12px', md: '20px' }}
                cursor="pointer"
                border={isSelected ? '2px solid #0097CD' : `2px solid ${hexColor.featuredColor}`}
                borderRadius="13px"
                alignItems="center"
              >
                <Box display="flex" flexDirection="column" gridGap="12px">
                  <Heading size="16px">
                    {toCapitalize(title)}
                  </Heading>
                  <Text size="14px">
                    {t('select-mentorship-plan.cohort-connector', { name: cohortData?.name })}
                  </Text>
                </Box>
              </Box>
            );
          })}
          <Button
            variant="default"
            disabled={!selectedService?.plans?.[0]?.slug}
            onClick={handleContinue}
            width="100%"
          >
            {t('common:continue')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SelectServicePlan;
