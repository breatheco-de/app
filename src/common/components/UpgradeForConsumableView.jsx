import PropTypes from 'prop-types';
import { Button, Flex, Heading } from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Text from './Text';
import useStyle from '../hooks/useStyle';
import { setStorageItem } from '../../utils';

function UpgradeForConsumableView({ externalData }) {
  const { t } = useTranslation('signup');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const { hexColor } = useStyle();
  const router = useRouter();

  const suggestedPlan = externalData?.suggestedPlan;
  const basePlan = externalData?.basePlan;
  const hasASuggestedPlan = externalData?.hasASuggestedPlan;
  const hasBasePlan = externalData?.hasBasePlan;
  const allSubscriptions = externalData?.allSubscriptions || [];
  const event = externalData?.event || {};
  const academyService = externalData?.academyService || {};
  const isEventConsumable = event?.event_type?.slug;

  const coincidencesOfServiceWithOtherSubscriptions = allSubscriptions.length > 0 ? allSubscriptions?.filter(
    (s) => s?.selected_mentorship_service_set?.mentorship_services.some(
      (service) => service.slug === academyService?.slug,
    ),
  ) : [];
  const mentoryProps = coincidencesOfServiceWithOtherSubscriptions.map(
    (subscription) => ({
      mentorship_service_set_slug: subscription?.selected_mentorship_service_set.slug,
      plan_slug: subscription?.plans?.[0]?.slug,
    }),
  );
  const mentoryPropsToQueryString = {
    mentorship_service_set: mentoryProps.map((p) => p.mentorship_service_set_slug).join(','),
    plans: mentoryProps.map((p) => p.plan_slug).join(','),
    selected_service: mentoryProps?.service?.slug,
  };

  const findedEventTypeOfPlanCoincidences = allSubscriptions.length > 0 ? allSubscriptions.filter(
    (s) => s.selected_event_type_set?.event_types.some(
      (ev) => ev?.slug === event?.event_type?.slug,
    ),
  ) : [];
  const eventRelevantProps = findedEventTypeOfPlanCoincidences.map(
    (subscription) => ({
      event_type_set_slug: subscription?.selected_event_type_set.slug,
      plan_slug: subscription?.plans?.[0]?.slug,
    }),
  );
  const eventPropsToQueryString = {
    event_type_set: eventRelevantProps.map((p) => p.event_type_set_slug).join(','),
    plans: eventRelevantProps.map((p) => p.plan_slug).join(','),
  };

  const handleGetConsumables = () => {
    setIsValidating(true);
    if (selectedIndex === 0 && (!hasBasePlan || !hasASuggestedPlan)) {
      setStorageItem('redirected-from', router?.asPath);
      router.push({
        pathname: '/checkout',
        query: {
          plan: hasBasePlan ? suggestedPlan?.slug : basePlan?.slug,
        },
      });
    }

    if (selectedIndex === 1) {
      if (isEventConsumable && findedEventTypeOfPlanCoincidences?.length > 0) {
        setStorageItem('redirected-from', router?.asPath);
        router.push({
          pathname: '/checkout',
          query: eventPropsToQueryString,
        });
      }
      if (!isEventConsumable && coincidencesOfServiceWithOtherSubscriptions?.length > 0) {
        setStorageItem('redirected-from', router?.asPath);
        router.push({
          pathname: '/checkout',
          query: mentoryPropsToQueryString,
        });
      }
    }
  };

  return (
    <Flex flexDirection="column" gridGap="16px">
      <Heading size="21px">
        {isEventConsumable
          ? t('consumables.ran-out-of-events')
          : t('consumables.ran-out-of-mentorships')}
      </Heading>
      <Text size="14px" fontWeight={700}>
        {isEventConsumable
          ? t('consumables.ran-out-of-events-text')
          : t('consumables.ran-out-of-mentorships-text')}
      </Text>
      <Flex flexDirection="column" gridGap="16px">
        {(!hasBasePlan || !hasASuggestedPlan) && (
          <Flex cursor="pointer" background="yellow.light" onClick={() => setSelectedIndex(0)} border="2px solid" borderColor={selectedIndex === 0 ? hexColor.yellowDefault : 'transparent'} alignItems="start" width="100%" height="auto" flexDirection="column" gridGap="6px" varian="default" padding="8px 14px" borderRadius="13px">
            <Text size="12px" fontWeight={700} padding="4px 10px" background="yellow.default" color="white" borderRadius="18px">
              {hasBasePlan ? t('consumables.base-plan') : t('consumables.full-plan')}
            </Text>
            <Text size="12px" fontWeight={700}>{t('purchase-a-plan')}</Text>
            <Text size="12px" fontWeight={400}>
              {isEventConsumable
                ? t('consumables.and-get-event-access')
                : t('consumables.and-get-mentorship-access')}
            </Text>
          </Flex>
        )}

        {/* findedEventTypeOfPlanCoincidences?.length > 0 && */}
        {findedEventTypeOfPlanCoincidences?.length > 0 && (
          <Flex cursor="pointer" background="blue.light" onClick={() => setSelectedIndex(1)} border="2px solid" borderColor={selectedIndex === 1 ? hexColor.blueDefault : 'transparent'} alignItems="start" width="100%" height="auto" flexDirection="column" gridGap="6px" varian="default" padding="8px 14px" borderRadius="13px">
            <Text size="12px" fontWeight={700} padding="4px 10px" background="blue.default" color="white" borderRadius="18px">
              Bundle
            </Text>
            <Text size="12px" fontWeight={700}>
              {isEventConsumable
                ? t('consumables.purchase-one-or-more-events')
                : t('consumables.purchase-one-or-more-sessions')}
            </Text>
            <Text size="12px" fontWeight={400}>
              {t('consumables.avoid-monthly-commitment')}
            </Text>
          </Flex>
        )}
      </Flex>

      <Button
        variant="default"
        isDisabled={selectedIndex === null}
        mt="2rem"
        padding="0 51px"
        isLoading={isValidating}
        onClick={handleGetConsumables}
      >
        {t('take-me-there')}
      </Button>
    </Flex>
  );
}

UpgradeForConsumableView.propTypes = {
  externalData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
};
UpgradeForConsumableView.defaultProps = {
  externalData: {},
};

export default UpgradeForConsumableView;
