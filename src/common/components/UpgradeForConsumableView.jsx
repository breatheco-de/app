import PropTypes from 'prop-types';
import { Button, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Text from './Text';
import useStyle from '../hooks/useStyle';
import { setStorageItem, slugToTitle } from '../../utils';
import Heading from './Heading';

function UpgradeForConsumableView({ externalData }) {
  const { t } = useTranslation('signup');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const { fontColor, featuredColor, hexColor } = useStyle();
  const router = useRouter();

  const hasASuggestedPlan = externalData?.hasASuggestedPlan;
  const suggestedPlan = externalData?.suggestedPlan;
  const hasBasePlan = externalData?.hasBasePlan;
  const basePlan = externalData?.basePlan;
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

  const alreadySubscribedToAll = hasBasePlan && hasASuggestedPlan;
  const noExistsConsumablesForUserSubscriptions = isEventConsumable ? findedEventTypeOfPlanCoincidences?.length === 0 : coincidencesOfServiceWithOtherSubscriptions?.length === 0;

  const handleGetConsumables = () => {
    setIsValidating(true);
    if (selectedIndex === 0 && !alreadySubscribedToAll) {
      router.push({
        pathname: '/pricing',
        query: {
          plan: basePlan?.slug,
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
    <Flex flexDirection="column" gridGap="16px" padding="15px">
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
        {!alreadySubscribedToAll && (
          <Button variant="unstyled" isDisabled={alreadySubscribedToAll} _hover={{ background: 'yellow.light' }} display="flex" cursor="pointer" background="yellow.light" onClick={() => setSelectedIndex(0)} border="2px solid" borderColor={selectedIndex === 0 ? hexColor.yellowDefault : 'transparent'} alignItems="start" width="100%" height="auto" flexDirection="column" gridGap="6px" varian="default" padding="8px 14px" borderRadius="13px">
            <Flex gridGap="10px" alignItems="center">
              <Text size="12px" fontWeight={700} padding="4px 10px" background="yellow.default" color="white" borderRadius="18px">
                {hasBasePlan
                  ? (suggestedPlan?.title || slugToTitle(suggestedPlan?.slug))
                  : (basePlan?.title || slugToTitle(basePlan?.slug))}
              </Text>
              {alreadySubscribedToAll && (
                <Text size="11px">
                  {`(${t('consumables.already-have-it')})`}
                </Text>
              )}
            </Flex>
            <Text size="12px" fontWeight={700} textTransform="uppercase" color="black">
              {t('upgrade-a-plan')}
            </Text>
            <Text size="12px" fontWeight={400} color="black">
              {isEventConsumable
                ? t('consumables.and-get-event-access')
                : t('consumables.and-get-mentorship-access')}
            </Text>
          </Button>
        )}

        <Button variant="unstyled" isDisabled={noExistsConsumablesForUserSubscriptions} _hover={{ background: featuredColor }} display="flex" cursor="pointer" background={featuredColor} onClick={() => setSelectedIndex(1)} border="2px solid" borderColor={selectedIndex === 1 ? hexColor.blueDefault : 'transparent'} alignItems="start" width="100%" height="auto" flexDirection="column" gridGap="6px" varian="default" padding="8px 14px" borderRadius="13px">
          <Flex gridGap="10px" alignItems="center">
            <Text size="12px" fontWeight={700} padding="4px 10px" background="blue.default" color="white" borderRadius="18px">
              Bundle
            </Text>
            {noExistsConsumablesForUserSubscriptions && (
              <>
                {isEventConsumable ? (
                  <Text size="11px">
                    {`(${t('consumables.consumable-event-not-available')})`}
                  </Text>
                ) : (
                  <Text size="11px">
                    {`(${t('consumables.consumable-mentorship-not-available')})`}
                  </Text>
                )}
              </>
            )}
          </Flex>
          <Text size="12px" fontWeight={700} textTransform="uppercase" color={fontColor}>
            {isEventConsumable
              ? t('consumables.purchase-one-or-more-events')
              : t('consumables.purchase-one-or-more-sessions')}
          </Text>
          <Text size="12px" fontWeight={400} color={fontColor}>
            {t('consumables.avoid-monthly-commitment')}
          </Text>
        </Button>
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
