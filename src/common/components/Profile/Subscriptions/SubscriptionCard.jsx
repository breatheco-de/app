import React from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Box, Flex, Text } from '@chakra-ui/react';
import Icon from '../../Icon';
import useStyle from '../../../hooks/useStyle';
import profileHandlers from './handlers';
import { toCapitalize, unSlugify } from '../../../../utils';
import ButtonHandler from './ButtonHandler';

function SubscriptionInfo({ subscription }) {
  const { lang } = useTranslation('profile');
  const { backgroundColor3, hexColor } = useStyle();
  const { blueDefault } = hexColor;
  const { getSubscriptionDetails } = profileHandlers();
  const { renewalDate, renewability, paymentInfo, nextPayment, errorMessage } = getSubscriptionDetails(subscription, lang);

  return (
    <Flex flexDirection="column" gridGap="10px" background={backgroundColor3} borderRadius="4px" padding="8px">

      {errorMessage && (
        <Flex gridGap="4px" alignItems="center">
          <Icon width="18px" height="13px" color={blueDefault} minWidth="18px" />
          <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
            {errorMessage}
          </Text>
        </Flex>
      )}

      {nextPayment && (
        <Flex gridGap="4px" alignItems="center">
          <Icon icon="card" width="18px" height="13px" color={blueDefault} minWidth="18px" />
          <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
            {nextPayment}
          </Text>
        </Flex>
      )}

      {paymentInfo && (
        <Flex gridGap="4px" alignItems="center">
          <Icon icon="card" width="18px" height="13px" color={blueDefault} minWidth="18px" />
          <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
            {paymentInfo}
          </Text>
        </Flex>
      )}

      {renewalDate && (
        <Flex gridGap="4px" alignItems="center">
          <Icon icon="refresh_time" width="16px" height="16px" color={blueDefault} minWidth="18px" />
          <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
            {renewalDate}
          </Text>
        </Flex>
      )}

      {renewability && (
        <Flex gridGap="4px" alignItems="center">
          <Icon icon="renewal" width="16px" height="16px" color={blueDefault} minWidth="18px" />
          <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
            {renewability}
          </Text>
        </Flex>
      )}
    </Flex>
  );
}

function SubscriptionCard({ subscription, allSubscriptions, onOpenUpgrade, setSubscriptionProps, onOpenCancelSubscription }) {
  const { borderColor2 } = useStyle();
  const { statusStyles, statusLabel } = profileHandlers();
  const status = subscription?.status?.toLowerCase();

  return (
    <Flex key={subscription?.id} height="fit-content" position="relative" margin="10px 0 0 0" flexDirection="column" justifyContent="space-between" alignItems="center" border="1px solid" borderColor={borderColor2} p="14px 16px 14px 14px" borderRadius="9px">
      <Box borderRadius="50%" bg="green.400" padding="12px" position="absolute" top={-7} left={4}>
        <Icon icon="data-science" width="30px" height="30px" />
      </Box>
      <Box padding="0 0 14px 0" width="100%">
        <Text fontSize="12px" fontWeight="700" padding="4px 10px" borderRadius="18px" width="fit-content" margin="0 0 0 auto" {...statusStyles[status] || ''}>
          {statusLabel[status] || 'unknown'}
        </Text>
      </Box>
      <Flex flexDirection="column" gridGap="8px" height="100%" width="100%">
        <Flex flexDirection="column" gridGap="10px">
          <Text fontSize="16px" fontWeight="700">
            {subscription?.plans[0]?.name || toCapitalize(unSlugify(subscription?.plans[0]?.slug))}
          </Text>
        </Flex>
        <SubscriptionInfo subscription={subscription} />
        <ButtonHandler
          subscription={subscription}
          allSubscriptions={allSubscriptions}
          onOpenUpgrade={onOpenUpgrade}
          setSubscriptionProps={setSubscriptionProps}
          onOpenCancelSubscription={onOpenCancelSubscription}
        />
      </Flex>
    </Flex>
  );
}

SubscriptionInfo.propTypes = {
  subscription: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    status_message: PropTypes.string,
    user: PropTypes.shape({
      first_name: PropTypes.string,
      last_name: PropTypes.string,
      email: PropTypes.string,
    }),
    academy: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      slug: PropTypes.string,
    }),
    how_many_installments: PropTypes.number,
    invoices: PropTypes.arrayOf(PropTypes.shape({})),
    monthly_price: PropTypes.number,
    next_payment_at: PropTypes.string,
    planOffer: PropTypes.shape({
      status: PropTypes.string,
    }),
    plan_expires_at: PropTypes.string,
    plans: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      slug: PropTypes.string,
    })),
    selected_cohort_set: PropTypes.shape({
      id: PropTypes.number,
      slug: PropTypes.string,
      academy: PropTypes.shape({}),
      cohorts: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    selected_event_type_set: PropTypes.shape({
      id: PropTypes.number,
      slug: PropTypes.string,
      academy: PropTypes.shape({}),
      event_types: PropTypes.arrayOf(PropTypes.shape({})),
      academy_services: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    selected_mentorship_service_set: PropTypes.shape({
      id: PropTypes.number,
      slug: PropTypes.string,
      academy: PropTypes.shape({}),
      mentorship_services: PropTypes.arrayOf(PropTypes.shape({})),
      academy_services: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    type: PropTypes.string,
    valid_until: PropTypes.string,
  }).isRequired,
};

SubscriptionCard.propTypes = {
  subscription: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    status_message: PropTypes.string,
    user: PropTypes.shape({
      first_name: PropTypes.string,
      last_name: PropTypes.string,
      email: PropTypes.string,
    }),
    academy: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      slug: PropTypes.string,
    }),
    how_many_installments: PropTypes.number,
    invoices: PropTypes.arrayOf(PropTypes.shape({})),
    monthly_price: PropTypes.number,
    next_payment_at: PropTypes.string,
    planOffer: PropTypes.shape({
      status: PropTypes.string,
    }),
    plan_expires_at: PropTypes.string,
    plans: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      slug: PropTypes.string,
    })),
    selected_cohort_set: PropTypes.shape({
      id: PropTypes.number,
      slug: PropTypes.string,
      academy: PropTypes.shape({}),
      cohorts: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    selected_event_type_set: PropTypes.shape({
      id: PropTypes.number,
      slug: PropTypes.string,
      academy: PropTypes.shape({}),
      event_types: PropTypes.arrayOf(PropTypes.shape({})),
      academy_services: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    selected_mentorship_service_set: PropTypes.shape({
      id: PropTypes.number,
      slug: PropTypes.string,
      academy: PropTypes.shape({}),
      mentorship_services: PropTypes.arrayOf(PropTypes.shape({})),
      academy_services: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    type: PropTypes.string,
    valid_until: PropTypes.string,
  }).isRequired,
  allSubscriptions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onOpenUpgrade: PropTypes.func.isRequired,
  setSubscriptionProps: PropTypes.func.isRequired,
  onOpenCancelSubscription: PropTypes.func.isRequired,
};

export default SubscriptionCard;
