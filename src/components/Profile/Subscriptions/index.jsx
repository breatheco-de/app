/* eslint-disable camelcase */
/* eslint-disable no-unsafe-optional-chaining */
import {
  Box,
  Grid,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Text from '../../Text';
import useStyle from '../../../hooks/useStyle';
import useSubscriptions from '../../../hooks/useSubscriptions';
import { location, slugToTitle } from '../../../utils';
import { CardSkeleton, SimpleSkeleton } from '../../Skeleton';
import bc from '../../../services/breathecode';
import SubscriptionCard from './SubscriptionCard';
import ConsumableCard from './ConsumableCard';
import ConsumableMoreInfoModal from './ConsumableMoreInfoModal';
import Icon from '../../Icon';
import { ProfilesSection } from '../../SupportSidebar/MentoringConsumables';
import { defaultProfiles } from '../../../utils/variables';

const ModalInfo = lazy(() => import('../../ModalInfo'));

function Subscriptions({ cohorts }) {
  const { t } = useTranslation('profile');
  const { state, isLoading, cancelSubscription } = useSubscriptions();
  const { fontColor } = useStyle();
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
          const mentRes = await bc.payment().getServiceSet(elem.id);

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
              icon={<ProfilesSection profiles={defaultProfiles} size="34px" />}
              totalAvailable={totalMentorshipsAvailable}
              onClick={() => setServicesModal('mentorships')}
            />
            <ConsumableCard
              title={t('subscription.workshop-available')}
              icon={<Icon icon="live-event-opaque" width="40px" height="40px" />}
              totalAvailable={totalWorkshopsAvailable}
              onClick={() => setServicesModal('workshops')}
            />
            <ConsumableCard
              title={t('subscription.rigo-available')}
              icon={<Icon icon="rigobot-avatar-tiny" width="34px" height="34px" />}
              totalAvailable={totalRigoConsumablesAvailable}
              onClick={() => setServicesModal('voids')}
            />
          </>
        )}
      </Box>
      <ConsumableMoreInfoModal
        serviceModal={servicesModal}
        services={services}
        closeMentorshipsModal={closeMentorshipsModal}
        existsNoAvailableAsSaas={existsNoAvailableAsSaas}
        t={t}
      />
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
