import { Box, Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Text from '../../Text';
import useStyle from '../../../hooks/useStyle';
import Icon from '../../Icon';
import { toCapitalize, unSlugify } from '../../../utils';
import SharedResourcesList from './SharedResourcesList';
import SeatRow from './SeatRow';
import AddSeatForm from './AddSeatForm';
import ConsumptionStrategyModal from './ConsumptionStrategyModal';

function TeamPlanCard({
  plan, ownerEmail, onAddSeat, onRemoveSeat, eligibleCohorts,
}) {
  const { t } = useTranslation('profile');
  const { borderColor2 } = useStyle();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [strategyModalMemberEmail, setStrategyModalMemberEmail] = useState(null);

  const planTitle = plan?.plans?.[0]?.title || toCapitalize(unSlugify(plan?.plans?.[0]?.slug || ''));
  const seatsCount = plan?.team?.seats_count ?? 0;
  const seatsLimit = plan?.team?.seats_limit ?? 0;
  const isAtLimit = seatsCount >= seatsLimit;
  const activeSeats = (plan?.seats || []).filter((seat) => seat.is_active);

  const handleAdd = async (email, cohortId) => {
    setIsSubmitting(true);
    try {
      return await onAddSeat(plan, email, cohortId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwnerSeat = (seat) => {
    if (plan?.user?.id && seat.user === plan.user.id) return true;
    return ownerEmail && seat.email?.toLowerCase() === ownerEmail;
  };

  const openStrategyModal = (memberEmail = null) => {
    setStrategyModalMemberEmail(memberEmail);
    setStrategyModalOpen(true);
  };

  const closeStrategyModal = () => {
    setStrategyModalOpen(false);
    setStrategyModalMemberEmail(null);
  };

  return (
    <Box
      width="100%"
      borderRadius="17px"
      border="1px solid"
      borderColor={borderColor2}
      p="20px"
    >
      <Flex alignItems="center" gridGap="12px" mb="16px">
        <Box
          minWidth="48px"
          minHeight="48px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          backgroundColor="blue.default"
          borderRadius="50px"
        >
          <Icon icon="community" width="24px" height="24px" color="white" />
        </Box>
        <Box flex="1">
          <Text fontSize="15px" fontWeight="700">
            {planTitle}
          </Text>
          <Text fontSize="12px" color="gray.500">
            {t('team-seats.seats-usage', { count: seatsCount, limit: seatsLimit })}
          </Text>
        </Box>
      </Flex>

      <Box display="flex" flexDirection="column" gridGap="20px">
        <SharedResourcesList
          serviceItems={plan.sharedServiceItems}
          consumptionStrategy={plan?.team?.consumption_strategy}
          onOpenDetails={() => openStrategyModal()}
        />

        <Box display="flex" flexDirection="column" gridGap="8px">
          <Text fontSize="13px" fontWeight="600">
            {t('team-seats.members-title')}
          </Text>
          {activeSeats.map((seat) => (
            <SeatRow
              key={seat.id}
              seat={seat}
              isOwnerSeat={isOwnerSeat(seat)}
              onRemove={(s) => onRemoveSeat(plan, s.id)}
              onViewShared={(s) => openStrategyModal(s.email)}
            />
          ))}
        </Box>

        <AddSeatForm
          onAdd={handleAdd}
          isDisabled={isAtLimit}
          isSubmitting={isSubmitting}
          eligibleCohorts={eligibleCohorts}
        />
      </Box>

      <ConsumptionStrategyModal
        isOpen={strategyModalOpen}
        onClose={closeStrategyModal}
        consumptionStrategy={plan?.team?.consumption_strategy}
        serviceItems={plan.sharedServiceItems}
        memberEmail={strategyModalMemberEmail}
      />
    </Box>
  );
}

const cohortShape = PropTypes.shape({
  id: PropTypes.number,
  slug: PropTypes.string,
  name: PropTypes.string,
});

const planShape = PropTypes.shape({
  id: PropTypes.number,
  planType: PropTypes.string,
  plans: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    slug: PropTypes.string,
    cohort_set: PropTypes.shape({
      cohorts: PropTypes.arrayOf(cohortShape),
    }),
  })),
  selected_cohort_set: PropTypes.shape({
    cohorts: PropTypes.arrayOf(cohortShape),
  }),
  team: PropTypes.shape({
    seats_count: PropTypes.number,
    seats_limit: PropTypes.number,
    consumption_strategy: PropTypes.string,
  }),
  seats: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    email: PropTypes.string,
    user: PropTypes.number,
    is_active: PropTypes.bool,
  })),
  sharedServiceItems: PropTypes.arrayOf(PropTypes.shape({})),
  user: PropTypes.shape({ id: PropTypes.number }),
});

TeamPlanCard.propTypes = {
  plan: planShape.isRequired,
  ownerEmail: PropTypes.string,
  onAddSeat: PropTypes.func.isRequired,
  onRemoveSeat: PropTypes.func.isRequired,
  eligibleCohorts: PropTypes.arrayOf(cohortShape),
};

TeamPlanCard.defaultProps = {
  ownerEmail: '',
  eligibleCohorts: [],
};

export default TeamPlanCard;
