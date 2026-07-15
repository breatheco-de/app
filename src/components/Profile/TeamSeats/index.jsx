import { Box } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import { lazy, Suspense, useState } from 'react';
import Text from '../../Text';
import useTeamSeats from '../../../hooks/useTeamSeats';
import { location } from '../../../utils';
import { CardSkeleton } from '../../Skeleton';
import TeamPlanCard from './TeamPlanCard';

const ModalInfo = lazy(() => import('../../ModalInfo'));

function TeamSeats() {
  const { t } = useTranslation('profile');
  const {
    manageablePlans,
    isLoading,
    addSeat,
    removeSeat,
    ownerEmail,
    getEligibleCohortsForPlan,
  } = useTeamSeats();
  const [seatToRemove, setSeatToRemove] = useState(null);
  const [planForRemoval, setPlanForRemoval] = useState(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const openRemoveModal = (plan, seatId) => {
    const seat = plan.seats?.find((s) => s.id === seatId);
    setPlanForRemoval(plan);
    setSeatToRemove(seat);
    setIsRemoveModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (planForRemoval && seatToRemove) {
      await removeSeat(planForRemoval, seatToRemove.id);
    }
    setIsRemoveModalOpen(false);
    setSeatToRemove(null);
    setPlanForRemoval(null);
  };

  const renderPlansContent = () => {
    if (isLoading) {
      return <CardSkeleton quantity={2} borderRadius="17px" height="280px" width="100%" />;
    }
    if (manageablePlans.length === 0) {
      return (
        <Box
          borderRadius="17px"
          border="1px solid"
          borderColor="gray.200"
          p="30px"
          textAlign="center"
        >
          <Text fontSize="14px">{t('team-seats.empty-state')}</Text>
        </Box>
      );
    }
    return (
      <Box display="flex" flexDirection="column" gridGap="24px">
        {manageablePlans.map((plan) => (
          <TeamPlanCard
            key={`${plan.planType}-${plan.id}`}
            plan={plan}
            ownerEmail={ownerEmail}
            onAddSeat={addSeat}
            onRemoveSeat={openRemoveModal}
            eligibleCohorts={getEligibleCohortsForPlan(plan)}
          />
        ))}
      </Box>
    );
  };

  return (
    <>
      {location?.pathname?.includes('team-seats') && (
        <Head>
          <title>{t('team-seats.seo-title')}</title>
        </Head>
      )}
      <Text fontSize="15px" fontWeight="700" mb="18px">
        {t('team-seats.title')}
      </Text>
      <Text fontSize="14px" mb="24px" color="gray.500">
        {t('team-seats.description')}
      </Text>

      {renderPlansContent()}

      <Suspense fallback={null}>
        <ModalInfo
          isOpen={isRemoveModalOpen}
          title={t('team-seats.remove-modal.title')}
          description={t('team-seats.remove-modal.description', { email: seatToRemove?.email || '' })}
          closeText={t('team-seats.remove-modal.cancel')}
          handlerText={t('team-seats.remove-modal.confirm')}
          headerStyles={{ textAlign: 'center' }}
          descriptionStyle={{ fontSize: '14px', textAlign: 'center' }}
          footerStyle={{ flexDirection: 'row-reverse' }}
          closeButtonStyles={{ variant: 'outline', color: 'blue.default', borderColor: 'currentColor' }}
          buttonHandlerStyles={{ variant: 'default' }}
          actionHandler={handleConfirmRemove}
          onClose={() => setIsRemoveModalOpen(false)}
        />
      </Suspense>
    </>
  );
}

export default TeamSeats;
