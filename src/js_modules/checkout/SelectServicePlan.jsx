import { Box, Button } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../../common/components/Heading';
import useStyle from '../../common/hooks/useStyle';
import bc from '../../common/services/breathecode';
import { getQueryString, toCapitalize, unSlugify } from '../../utils';
import LoaderScreen from '../../common/components/LoaderScreen';
import Text from '../../common/components/Text';
import { parseQuerys } from '../../utils/url';

function SelectServicePlan() {
  const { t, lang } = useTranslation('signup');
  const { backgroundColor, hexColor } = useStyle();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedService, setSelectedService] = useState({});

  const queryPlans = getQueryString('plans');
  const queryMentorshipServiceSet = getQueryString('mentorship_service_set');
  const queryEventTypeSet = getQueryString('event_type_set');

  const allQueryPlans = queryPlans.split(',');
  const allQueryMentorshipServiceSet = typeof queryMentorshipServiceSet === 'string' ? queryMentorshipServiceSet.split(',') : [];
  const allQueryEventTypeSet = typeof queryEventTypeSet === 'string' ? queryEventTypeSet.split(',') : [];

  const getServiceSlug = (subscription) => {
    if (allQueryEventTypeSet.length > 0) {
      return {
        event_type_set: subscription?.selected_event_type_set?.slug,
        // TODO: Preguntar si service para los eventos es necesario
        service: subscription?.selected_event_type_set?.event_types[0]?.slug,
      };
    }
    return {
      mentorship_service_set: subscription?.selected_mentorship_service_set?.slug,
      service: subscription?.selected_mentorship_service_set?.mentorship_services[0]?.slug,
    };
  };

  const getSubscriptions = async () => {
    const resp = await bc.payment({
      status: 'ACTIVE,FREE_TRIAL,FULLY_PAID,CANCELLED,PAYMENT_ISSUE',
    }).subscriptions();

    const data = await resp?.data;
    const planFinancing = data.plan_financings.length > 0 ? data.plan_financings : [];
    const planSubscriptions = data.subscriptions.length > 0 ? data.subscriptions : [];

    const allPlans = [...planFinancing, ...planSubscriptions];

    const findedPlanCoincidences = allPlans.filter((plan) => {
      const findedPlan = allQueryPlans.find(
        (queryPlan) => queryPlan === plan?.plans?.[0]?.slug,
      );
      const findedMentorshipServiceSet = allQueryMentorshipServiceSet.find(
        (qServiceSet) => qServiceSet === plan?.selected_mentorship_service_set?.slug,
      );
      const findedEventTypeSet = allQueryEventTypeSet.find(
        (qEventTypeSet) => qEventTypeSet === plan?.selected_event_type_set?.slug,
      );

      if (allQueryEventTypeSet.length > 0) {
        return findedPlan && findedEventTypeSet;
      }

      return findedPlan && findedMentorshipServiceSet;
    });

    if (resp.statusText === 'OK' && findedPlanCoincidences.length > 1) {
      setIsLoading(false);
    }
    setIsLoading(false);

    if (findedPlanCoincidences.length === 1) {
      const qs = parseQuerys({
        ...getServiceSlug(findedPlanCoincidences[0]),
      });
      const pageToRedirect = `/${lang}/checkout${qs}`;
      window.location.href = pageToRedirect;
    }
    setSubscriptions(findedPlanCoincidences);
  };

  useEffect(() => {
    getSubscriptions();
  }, []);

  const handleContinue = () => {
    const qs = parseQuerys({
      ...getServiceSlug(selectedService),
    });
    const pageToRedirect = `/${lang}/checkout${qs}`;
    window.location.href = pageToRedirect;
  };

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
        <Box display="flex" flexDirection="column" gridGap="4rem" width={{ base: 'auto', md: '80%' }}>
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
                p={{ base: '14px', sm: '16px 18px' }}
                gridGap={{ base: '12px', md: '20px' }}
                cursor="pointer"
                border={isSelected ? '2px solid #0097CD' : `2px solid ${hexColor.featuredColor}`}
                borderRadius="13px"
                alignItems="center"
              >
                <Box display="flex" flexDirection="column" gridGap="8px">
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
            width="120px"
            margin="0 auto"
          >
            {t('common:continue')}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default SelectServicePlan;
