/* eslint-disable camelcase */
/* eslint-disable no-unsafe-optional-chaining */
import {
  Box,
  Grid,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useState, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Image from 'next/image';
import Icon from '../../Icon';
import Heading from '../../Heading';
import Text from '../../Text';
import useStyle from '../../../hooks/useStyle';
import useSubscriptions from '../../../hooks/useSubscriptions';
import { location, slugToTitle, unSlugify } from '../../../utils';
import { CardSkeleton, SimpleSkeleton } from '../../Skeleton';
import SubscriptionCard from './SubscriptionCard';
import ConsumableCard from './ConsumableCard';
import useConsumables from '../../../hooks/useConsumables';

const ModalInfo = lazy(() => import('../../ModalInfo'));

function Subscriptions({ cohorts }) {
  const { t } = useTranslation('profile');
  const { state, isLoading, cancelSubscription } = useSubscriptions();
  const { hexColor, fontColor } = useStyle();
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const [servicesModal, setServicesModal] = useState(null);
  const { consumables, services, isLoading: loadingServices } = useConsumables(cohorts);
  const [subscriptionProps, setSubscriptionProps] = useState({});
  const memberships = state?.subscriptions;

  const onOpenCancelSubscription = () => setCancelModalIsOpen(true);

  const membershipsArray = memberships?.subscriptions
    && memberships?.plan_financings
    && [...memberships?.subscriptions, ...memberships?.plan_financings].filter((membership) => membership?.plans?.[0]?.slug !== undefined);

  const prioritizeStatus = ['fully_paid', 'active', 'payment_issue', 'expired', 'cancelled', 'error'];

  const membershipsFilter = membershipsArray?.length > 0 ? membershipsArray
    .filter((membership) => {
      const isFreeTrial = membership?.status?.toLowerCase() === 'free_trial';
      const membershipAlreadyInList = membershipsArray.find((mem) => mem?.plans?.[0]?.slug === membership?.planOffer?.slug);
      const suggestedPlan = (!membership?.planOffer?.slug && membership?.planOffer?.status) || membershipAlreadyInList;

      if (isFreeTrial && suggestedPlan) return false;
      return true;
    }).reduce((acc, membership) => {
      const planSlug = membership?.plans?.[0]?.slug;

      if (!planSlug) return acc;

      if (!acc[planSlug]
        || prioritizeStatus.indexOf(membership?.status?.toLowerCase())
        < prioritizeStatus.indexOf(acc[planSlug]?.status?.toLowerCase())) {
        acc[planSlug] = membership;
      }

      return acc;
    }, {}) : [];

  const membershipsFiltered = Object.values(membershipsFilter);

  const closeMentorshipsModal = () => setServicesModal(null);

  const detailsConsumableData = {
    mentorships: {
      icon: 'teacher1',
      title: t('subscription.your-mentoring-available'),
    },
    workshops: {
      icon: 'community',
      title: t('subscription.your-workshop-available'),
    },
    voids: {
      icon: 'rigobot-avatar-tiny',
      title: t('subscription.rigo-available'),
    },
  };

  const totalMentorshipsAvailable = consumables.mentorship_service_sets.some((service) => service.balance.unit === -1) ? -1 : consumables.mentorship_service_sets.reduce((acum, service) => acum + service.balance.unit, 0);
  const totalWorkshopsAvailable = consumables.event_type_sets.some((service) => service.balance.unit === -1) ? -1 : consumables.event_type_sets.reduce((acum, service) => acum + service.balance.unit, 0);
  const totalRigoConsumablesAvailable = consumables.voids.some((service) => service.balance.unit === -1) ? -1 : consumables.voids.reduce((acum, service) => acum + service.balance.unit, 0);

  const existsNoAvailableAsSaas = cohorts.some((c) => c.available_as_saas === false);

  return (
    <>
      {location?.pathname?.includes('subscriptions') && (
        <Head>
          <title>{t('my-subscriptions')}</title>
        </Head>
      )}
      <Box display="flex" flexWrap="wrap" gap="24px">
        {loadingServices ? (
          <>
            <SimpleSkeleton borderRadius="17px" height="108px" width={{ base: '100%', md: '265px' }} />
            <SimpleSkeleton borderRadius="17px" height="108px" width={{ base: '100%', md: '265px' }} />
            <SimpleSkeleton borderRadius="17px" height="108px" width={{ base: '100%', md: '265px' }} />
          </>
        ) : (
          <>
            <ConsumableCard
              title={t('subscription.mentoring-available')}
              icon="teacher1"
              totalAvailable={totalMentorshipsAvailable}
              onClick={() => setServicesModal('mentorships')}
            />
            <ConsumableCard
              title={t('subscription.workshop-available')}
              icon="community"
              totalAvailable={totalWorkshopsAvailable}
              onClick={() => setServicesModal('workshops')}
            />
            <ConsumableCard
              title={t('subscription.rigo-available')}
              icon="rigobot-avatar-tiny"
              totalAvailable={totalRigoConsumablesAvailable}
              onClick={() => setServicesModal('voids')}
            />
          </>
        )}
      </Box>
      <Modal isOpen={servicesModal !== null} onClose={closeMentorshipsModal}>
        <ModalOverlay />
        <ModalContent>
          {servicesModal && (
            <>
              <ModalHeader fontSize="26px" lineHeight="31px" display="flex" alignItems="center" gap="18px">
                <Icon icon={detailsConsumableData[servicesModal].icon} color={hexColor.blueDefault} width="32px" height="32px" />
                {detailsConsumableData[servicesModal].title}
              </ModalHeader>
              <ModalBody>
                {services[servicesModal].map((service) => {
                  const logo = service.logo_url || service.icon_url;
                  return (
                    <Box key={service.slug} mb="10px" background={hexColor.featuredColor} padding="10px" borderRadius="4px">
                      <Box justifyContent="space-between" display="flex" gap="10px" alignItems="center" mb="5px" width="100%">
                        <Box display="flex" gap="10px" alignItems="center">
                          {logo && <Image src={logo} width={28} height={28} alt="Service logo" />}
                          <Heading size="16px">
                            {service.name || unSlugify(service.slug)}
                          </Heading>
                        </Box>
                        {servicesModal === 'mentorships' && (
                          <>
                            {service.nonSaasAcademy ? (
                              <Icon icon="infinite" color={hexColor.fontColor3} />
                            ) : (
                              <Box width="30px" height="30px" background={hexColor.featuredColor3} padding="5px" borderRadius="full">
                                <Text textAlign="center" size="l" fontWeight="700">
                                  {service.unit}
                                </Text>
                              </Box>
                            )}
                          </>
                        )}
                        {servicesModal === 'voids' && (
                          <>
                            <Box width="30px" height="30px" background={hexColor.featuredColor3} padding="5px" borderRadius="full">
                              {service?.how_many >= 0 && service?.how_many < 100 ? (
                                <Text textAlign="center" size="l" fontWeight="700">
                                  {service?.how_many}
                                </Text>
                              ) : (
                                <Icon icon="infinite" color={hexColor.fontColor3} />
                              )}
                            </Box>
                          </>
                        )}
                      </Box>
                      <Text size="md" color={hexColor.fontColor3}>
                        {service?.description}
                      </Text>
                    </Box>
                  );
                })}
                {servicesModal === 'mentorships' && existsNoAvailableAsSaas && (
                  <Text>
                    {t('subscription.bootcamp-mentorships')}
                  </Text>
                )}
              </ModalBody>
            </>
          )}

          <ModalFooter borderTop={`1px solid ${hexColor.borderColor}`}>
            <Button
              background={hexColor.blueDefault}
              onClick={closeMentorshipsModal}
              color="white"
              _hover={{
                background: hexColor.blueDefault,
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Text fontSize="15px" fontWeight="700" pb="18px">
        {t('my-subscriptions')}
      </Text>

      {membershipsFiltered?.length > 0 ? (
        <Grid
          gridTemplateColumns={{
            base: 'repeat(auto-fill, minmax(15rem, 1fr))',
            md: 'repeat(auto-fill, minmax(20rem, 1fr))',
            lg: 'repeat(3, 1fr)',
          }}
          gridGap="3rem"
        >
          {membershipsFiltered?.length > 0 && membershipsFiltered.map((subscription) => (
            <SubscriptionCard
              key={subscription?.id}
              subscription={subscription}
              allSubscriptions={membershipsFiltered}
              setSubscriptionProps={setSubscriptionProps}
              onOpenCancelSubscription={onOpenCancelSubscription}
            />
          ))}
          <Suspense fallback={<SimpleSkeleton borderRadius="17px" height="108px" width={{ base: '100%', md: '265px' }} />}>
            <ModalInfo
              isOpen={cancelModalIsOpen}
              title={t('subscription.cancel-modal.title')}
              description={t('subscription.cancel-modal.description', { cohort: slugToTitle(subscriptionProps?.slug) })}
              closeText={t('subscription.cancel-modal.closeText')}
              handlerText={t('subscription.cancel-modal.handlerText')}
              headerStyles={{ textAlign: 'center' }}
              descriptionStyle={{ color: fontColor, fontSize: '14px', textAlign: 'center' }}
              footerStyle={{ flexDirection: 'row-reverse' }}
              closeButtonStyles={{ variant: 'outline', color: 'blue.default', borderColor: 'currentColor' }}
              buttonHandlerStyles={{ variant: 'default' }}
              actionHandler={() => {
                cancelSubscription(subscriptionProps?.id)
                  .finally(() => {
                    setCancelModalIsOpen(false);
                  });
              }}
              onClose={() => setCancelModalIsOpen(false)}
            />
          </Suspense>
        </Grid>
      ) : (
        <>
          {isLoading ? (
            <CardSkeleton
              gridTemplateColumns={{
                base: 'repeat(auto-fill, minmax(15rem, 1fr))',
                md: 'repeat(auto-fill, minmax(20rem, 1fr))',
                lg: 'repeat(3, 1fr)',
              }}
              gridGap="3rem"
              quantity={6}
              cardHeight="316px"
            />
          ) : (
            <Text fontSize="15px" fontWeight="400" pb="18px">
              {t('no-subscriptions')}
            </Text>
          )}
        </>
      )}
    </>
  );
}

Subscriptions.propTypes = {
  cohorts: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};
Subscriptions.defaultProps = {
  cohorts: [],
};

export default Subscriptions;
