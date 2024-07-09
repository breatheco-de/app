/* eslint-disable camelcase */
import { Avatar, Box, Button, ListItem, UnorderedList, useColorModeValue } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import Heading from '../../common/components/Heading';
import useStyle from '../../common/hooks/useStyle';
import bc from '../../common/services/breathecode';
import { getQueryString, toCapitalize, unSlugify } from '../../utils';
import LoaderScreen from '../../common/components/LoaderScreen';
import Text from '../../common/components/Text';
import { parseQuerys } from '../../utils/url';
import Icon from '../../common/components/Icon';
import modifyEnv from '../../../modifyEnv';

function SelectServicePlan() {
  const { t, lang } = useTranslation('signup');
  const router = useRouter();
  const { query } = router;
  const { mentorship_service_slug, event_service_slug } = query;
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const { backgroundColor, hexColor, modal } = useStyle();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedService, setSelectedService] = useState({});

  // const queryPlans = getQueryString('plans');
  const queryMentorshipServiceSet = mentorship_service_slug || getQueryString('mentorship_service_set');
  const queryEventTypeSet = event_service_slug || getQueryString('event_type_set');
  const backgroundItem = useColorModeValue('#F9F9F9', 'gray.800');

  // const allQueryPlans = queryPlans.split(',');
  const allQueryMentorshipServiceSet = typeof queryMentorshipServiceSet === 'string' ? queryMentorshipServiceSet.split(',') : [];
  const allQueryEventTypeSet = typeof queryEventTypeSet === 'string' ? queryEventTypeSet.split(',') : [];
  const allServices = [...allQueryMentorshipServiceSet, ...allQueryEventTypeSet];

  const getServiceSlug = (subscription) => {
    if (allQueryEventTypeSet.length > 0) {
      return {
        event_type_set: subscription?.selected_event_type_set?.slug,
        // service: subscription?.selected_event_type_set?.slug,
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
      // const findedPlan = allQueryPlans.find(
      //   (queryPlan) => queryPlan === plan?.plans?.[0]?.slug,
      // );
      const findedMentorshipServiceSet = allQueryMentorshipServiceSet.find(
        (qServiceSet) => qServiceSet === plan?.selected_mentorship_service_set?.slug,
      );
      const findedEventTypeSet = allQueryEventTypeSet.find(
        (qEventTypeSet) => qEventTypeSet === plan?.selected_event_type_set?.slug,
      );

      if (allQueryEventTypeSet.length > 0) {
        return findedEventTypeSet;
        // return findedPlan && findedEventTypeSet;
      }

      return findedMentorshipServiceSet;
      // return findedPlan && findedMentorshipServiceSet;
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

  const isEventTypeSet = allQueryEventTypeSet.length > 0;
  const isMentorshipServiceSet = allQueryMentorshipServiceSet.length > 0;

  const handleContinue = () => {
    const qs = parseQuerys({
      ...getServiceSlug(selectedService),
    });
    const pageToRedirect = `/${lang}/checkout${qs}`;
    window.location.href = pageToRedirect;
  };

  return (
    <Box maxWidth="552px" display="flex" margin="0 auto" flexDirection="column" gridGap="24px">
      <Box display="flex" flexDirection="column" gridGap="12px" padding="25px 37px" bg={backgroundColor} width="100%" margin="0 auto" borderRadius="15px">
        <Heading size="16px" color="yellow.default" textTransform="uppercase">
          {isEventTypeSet && t('event-bundle-title')}
          {isMentorshipServiceSet && t('mentorship-bundle-title')}
        </Heading>
        <Box display="flex" gridGap="12px" alignItems="center">
          <Icon icon="rocket" width="25px" height="38px" color="#ffffff" backgroundColor="yellow.default" padding="10px 15px" borderRadius="full" flexShrink={0} />
          <Text size="21px" lineHeight="normal" fontWeight={700} maxWidth="70%">
            {t('select-service-of-plan.title')}
          </Text>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" flexDirection="column" padding="14px 23px" bg={backgroundColor} width="100%" margin="0 auto" borderRadius="15px">
        {isLoading ? (
          <LoaderScreen width="240px" height="240px" position="relative" />
        ) : (
          <Box display="flex" flexDirection="column" gridGap="12px" width="100%">
            <Box display="flex" gridGap="12px" flexDirection="column" alignItems={subscriptions.length <= 0 && 'center'}>
              <Text size="21px" fontWeight={700}>
                {subscriptions.length > 0
                  ? t('select-service-of-plan.select-text')
                  : t('select-service-of-plan.subscription-not-found')}
              </Text>
              {subscriptions.length <= 0 && (
                <Avatar src={`${BREATHECODE_HOST}/static/img/avatar-7.png`} border="3px solid #0097CD" width="91px" height="91px" borderRadius="50px" />
              )}
            </Box>

            {subscriptions.length <= 0 && (
              <Box display="flex" flexDirection="column" gridGap="10px">
                <Text size="16px">
                  {t('select-service-of-plan.no-plan-found-for-service')}
                </Text>
                <UnorderedList display="flex" mb="14px" flexDirection="column" gridGap="4px" width="100%">
                  {allServices.map((service) => (
                    <ListItem key={service} fontSize="14px">
                      {toCapitalize(unSlugify(service))}
                    </ListItem>
                  ))}
                </UnorderedList>
              </Box>
            )}
            {subscriptions.length > 0 && subscriptions.map((s) => {
              const plan = s?.plans?.[0];
              const title = unSlugify(plan?.slug);
              const isSelected = selectedService?.plans?.[0]?.slug === plan?.slug;
              const eventTypeSetSlug = s?.selected_event_type_set?.slug;
              const mentorshipServiceSetSlug = s?.selected_mentorship_service_set?.slug;

              const isEvent = allQueryEventTypeSet.includes(eventTypeSetSlug);
              const isMentorship = allQueryMentorshipServiceSet.includes(mentorshipServiceSetSlug);

              return plan?.slug && (
                <Box
                  key={`${s?.slug}-${s?.title}`}
                  display="flex"
                  onClick={() => {
                    setSelectedService(s);
                  }}
                  flexDirection="row"
                  width="100%"
                  background={isSelected ? modal.hoverBackground : backgroundItem}
                  justifyContent="space-between"
                  p={{ base: '14px', sm: '16px 18px' }}
                  gridGap={{ base: '12px', md: '20px' }}
                  cursor="pointer"
                  border={isSelected ? '2px solid #0097CD' : `2px solid ${hexColor.featuredColor}`}
                  borderRadius="13px"
                  alignItems="center"
                >
                  <Box display="flex" flexDirection="column" gridGap="0px">
                    <Heading size="14px" fontWeight={700} lineHeight="24px" textTransform="uppercase">
                      {toCapitalize(title)}
                    </Heading>
                    <Text size="14px">
                      {isEvent && toCapitalize(unSlugify(eventTypeSetSlug))}
                      {isMentorship && toCapitalize(unSlugify(mentorshipServiceSetSlug))}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
      <Button
        variant="default"
        isDisabled={!selectedService?.plans?.[0]?.slug}
        onClick={handleContinue}
        width="100%"
        margin="0 auto"
      >
        {t('common:continue')}
      </Button>
    </Box>
  );
}

export default SelectServicePlan;
