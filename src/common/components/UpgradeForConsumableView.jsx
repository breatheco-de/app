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
  const type = externalData?.consumableType;

  const consumablesDictionary = {
    event: {
      title: t('consumables.ran-out-of-events'),
      description: t('consumables.ran-out-of-events-text'),
      access: t('consumables.and-get-event-access'),
      notAvailable: t('consumables.consumable-event-not-available'),
      purchase: t('consumables.purchase-one-or-more-events'),
      subscriptionMatch: allSubscriptions.filter(
        (s) => s.selected_event_type_set?.event_types.some(
          (ev) => ev?.slug === event?.event_type?.slug,
        ),
      ),
      getPath: (suscriptions) => `/checkout/event/${suscriptions.map((subscription) => subscription?.selected_event_type_set.slug).join(',')}`,
    },
    mentorship: {
      title: t('consumables.ran-out-of-mentorships'),
      description: t('consumables.ran-out-of-mentorships-text'),
      access: t('consumables.and-get-mentorship-access'),
      notAvailable: t('consumables.consumable-mentorship-not-available'),
      purchase: t('consumables.purchase-one-or-more-sessions'),
      subscriptionMatch: allSubscriptions?.filter(
        (s) => s?.selected_mentorship_service_set?.mentorship_services.some(
          (service) => service.slug === academyService?.slug,
        ),
      ),
      getPath: (suscriptions) => `/checkout/mentorship/${suscriptions.map((subscription) => subscription?.selected_mentorship_service_set.slug).join(',')}`,
    },
    aiCompilation: {
      title: t('consumables.ran-out-of-compilations'),
      description: t('consumables.ran-out-of-compilations-text'),
      access: t('consumables.and-get-compilations-access'),
      notAvailable: t('consumables.consumable-compilations-not-available'),
      purchase: t('consumables.purchase-one-or-more-compilations'),
      subscriptionMatch: allSubscriptions,
      getPath: () => '/checkout/compilation/ai-compilation',
    },
  };

  const alreadySubscribedToAll = hasBasePlan && hasASuggestedPlan;
  const noExistsConsumablesForUserSubscriptions = consumablesDictionary[type]?.subscriptionMatch?.length === 0;

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
      setStorageItem('redirected-from', router?.asPath);
      const subscriptions = consumablesDictionary[type].subscriptionMatch;
      const pathname = consumablesDictionary[type].getPath(subscriptions);
      router.push({
        pathname,
      });
    }
  };

  return (
    <Flex flexDirection="column" gridGap="16px" padding="15px">
      <Heading size="21px">
        {consumablesDictionary[type].title}
      </Heading>
      <Text size="14px" fontWeight={700}>
        {consumablesDictionary[type].description}
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
              {consumablesDictionary[type].access}
            </Text>
          </Button>
        )}

        <Button variant="unstyled" isDisabled={noExistsConsumablesForUserSubscriptions} _hover={{ background: featuredColor }} display="flex" cursor="pointer" background={featuredColor} onClick={() => setSelectedIndex(1)} border="2px solid" borderColor={selectedIndex === 1 ? hexColor.blueDefault : 'transparent'} alignItems="start" width="100%" height="auto" flexDirection="column" gridGap="6px" varian="default" padding="8px 14px" borderRadius="13px">
          <Flex gridGap="10px" alignItems="center">
            <Text size="12px" fontWeight={700} padding="4px 10px" background="blue.default" color="white" borderRadius="18px">
              Bundle
            </Text>
            {noExistsConsumablesForUserSubscriptions && (
              <Text size="11px">
                {`(${consumablesDictionary[type].notAvailable})`}
              </Text>
            )}
          </Flex>
          <Text size="12px" fontWeight={700} textTransform="uppercase" color={fontColor}>
            {consumablesDictionary[type].purchase}
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
