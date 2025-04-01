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
import { useEffect, useState, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Image from 'next/image';
import Icon from '../../../common/components/Icon';
import Heading from '../../../common/components/Heading';
import Text from '../../../common/components/Text';
import useStyle from '../../../common/hooks/useStyle';
import { location, slugToTitle, unSlugify } from '../../../utils';
import useSubscriptionsHandler from '../../../common/store/actions/subscriptionAction';
import { CardSkeleton, SimpleSkeleton } from '../../../common/components/Skeleton';
import bc from '../../../common/services/breathecode';
import SubscriptionCard from './SubscriptionCard';
import ConsumableCard from './ConsumableCard';

const ModalInfo = lazy(() => import('../../../common/components/ModalInfo'));

function Subscriptions({ cohorts }) {
  const { t } = useTranslation('profile');
  const { state, isLoading, fetchSubscriptions, cancelSubscription } = useSubscriptionsHandler();
  const { hexColor, fontColor } = useStyle();
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const [servicesModal, setServicesModal] = useState(null);
  const [consumables, setConsumables] = useState({
    cohort_sets: [],
    event_type_sets: [],
    mentorship_service_sets: [],
    service_sets: [],
    voids: [],
  });
  const [services, setServices] = useState({
    mentorships: [],
    workshops: [],
    voids: [],
  });
  const [loadingServices, setLoadingServices] = useState(true);
  const [subscriptionProps, setSubscriptionProps] = useState({});
  const memberships = state?.subscriptions;

  const onOpenCancelSubscription = () => setCancelModalIsOpen(true);

  const getConsumables = async () => {
    try {
      const nonSaasCohorts = cohorts.filter(({ available_as_saas }) => !available_as_saas);
      const academies = [...new Set(nonSaasCohorts.map(({ academy }) => academy.id))];

      const allServices = {
        mentorships: [],
        workshops: [],
      };

      const cohortsServices = academies.map((academy) => bc.mentorship({ academy }, true).getService());
      const responseServices = await Promise.all(cohortsServices);
      const nonSaasServices = responseServices.flatMap(({ data }) => data).map((elem) => ({ ...elem, nonSaasAcademy: true }));

      const res = await bc.payment().service().consumable();
      if (res.status === 200) {
        const { data } = res;
        setConsumables(data);
        const promiseMentorship = data.mentorship_service_sets.map(async (elem) => {
          const mentRes = await bc.mentorship().getServiceSet(elem.id);

          return mentRes.data.mentorship_services.map((service) => ({ ...service, unit: elem.balance.unit }));
        });
        const promiseEvents = data.event_type_sets.map(async (elem) => {
          const evRes = await bc.payment().getEventTypeSet(elem.id);

          return evRes.data.event_types;
        });

        const promiseVoids = data.voids.map(async (elem) => {
          const voidRes = await bc.payment().getServiceInfo(elem.slug);
          const serviceData = voidRes.data[0];

          return {
            ...serviceData,
            name: serviceData.features[0]?.title || serviceData.service.title || '',
            description: serviceData.features[0]?.description || '',
            one_line_desc: serviceData.features[0]?.one_line_desc || '',
          };
        });

        const resMentorships = await Promise.all(promiseMentorship);
        const resWorkshops = await Promise.all(promiseEvents);
        const resVoids = await Promise.all(promiseVoids);

        allServices.mentorships = [...resMentorships.flat(), ...nonSaasServices];
        allServices.workshops = resWorkshops.flat();
        allServices.voids = resVoids.flat();
      }

      setServices(allServices);
      setLoadingServices(false);
    } catch (e) {
      setLoadingServices(false);
      console.log(e);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    getConsumables();
  }, []);

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
