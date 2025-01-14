/* eslint-disable no-unused-vars */
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
  console.log('externalData');
  console.log(externalData);
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
  const type = externalData?.consumableType;

  const consumablesDictionary = {
    workshops: {
      title: t('consumables.ran-out-of-events'),
      description: t('consumables.ran-out-of-events-text'),
      notAvailable: t('consumables.consumable-event-not-available'),
      purchase: t('consumables.purchase-one-or-more-events'),
    },
    mentorships: {
      title: t('consumables.ran-out-of-mentorships'),
      description: t('consumables.ran-out-of-mentorships-text'),
      notAvailable: t('consumables.consumable-mentorship-not-available'),
      purchase: t('consumables.purchase-one-or-more-sessions'),
    },
  };

  const mentorshipSubscriptionMatch = allSubscriptions.length > 0 ? allSubscriptions?.filter(
    (s) => s?.selected_mentorship_service_set?.mentorship_services.some(
      (service) => service.slug === academyService?.slug,
    ),
  ) : [];

  const suscriptionMentoshipServices = mentorshipSubscriptionMatch.map((subscription) => subscription?.selected_mentorship_service_set.slug).join(',');

  const eventTypeSubscriptionsMatch = allSubscriptions.length > 0 ? allSubscriptions.filter(
    (s) => s.selected_event_type_set?.event_types.some(
      (ev) => ev?.slug === event?.event_type?.slug,
    ),
  ) : [];
  const subscriptionEventsServices = eventTypeSubscriptionsMatch.map((subscription) => subscription?.selected_event_type_set.slug).join(',');

  const alreadySubscribedToAll = hasBasePlan && hasASuggestedPlan;
  const noExistsConsumablesForUserSubscriptions = isEventConsumable ? eventTypeSubscriptionsMatch?.length === 0 : mentorshipSubscriptionMatch.length === 0;

  const handleGetConsumables = () => {
    setIsValidating(true);
    if (selectedIndex === 0 && !alreadySubscribedToAll) {
      router.push({
        pathname: '/checkout',
        query: {
          plan: suggestedPlan?.slug,
        },
      });
    }

    if (selectedIndex === 1) {
      if (isEventConsumable) {
        setStorageItem('redirected-from', router?.asPath);
        router.push({
          pathname: `/checkout/event/${subscriptionEventsServices}`,
        });
      }
      if (!isEventConsumable) {
        setStorageItem('redirected-from', router?.asPath);
        router.push({
          pathname: `/checkout/mentorship/${suscriptionMentoshipServices}`,
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
        {!alreadySubscribedToAll && (basePlan || suggestedPlan) && (
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
