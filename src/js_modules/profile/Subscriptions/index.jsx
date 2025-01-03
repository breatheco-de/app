/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/jsx-no-useless-fragment */
import {
  Box,
  Flex,
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
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import Head from 'next/head';
import Image from 'next/image';
import Icon from '../../../common/components/Icon';
import Heading from '../../../common/components/Heading';
import Text from '../../../common/components/Text';
import useStyle from '../../../common/hooks/useStyle';
import ModalInfo from '../../moduleMap/modalInfo';
import profileHandlers from './handlers';
import { location, slugToTitle, toCapitalize, unSlugify } from '../../../utils';
import useSubscriptionsHandler from '../../../common/store/actions/subscriptionAction';
import ButtonHandler from './ButtonHandler';
import UpgradeModal from './UpgradeModal';
import { CardSkeleton, SimpleSkeleton } from '../../../common/components/Skeleton';
import bc from '../../../common/services/breathecode';

function Subscriptions({ cohorts }) {
  const { t, lang } = useTranslation('profile');
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const [upgradeModalIsOpen, setUpgradeModalIsOpen] = useState(false);
  const [servicesModal, setServicesModal] = useState(null);
  const [consumables, setConsumables] = useState({
    cohort_sets: [],
    event_type_sets: [],
    mentorship_service_sets: [],
    service_sets: [],
  });
  const [services, setServices] = useState({
    mentorships: [],
    workshops: [],
  });
  const [loadingServices, setLoadingServices] = useState(true);
  const [subscriptionProps, setSubscriptionProps] = useState({});
  const { state, fetchSubscriptions, cancelSubscription } = useSubscriptionsHandler();
  const [offerProps, setOfferProps] = useState({});

  const subscriptionDataState = state?.subscriptions;
  const isLoading = state?.isLoading;

  const onOpenCancelSubscription = () => setCancelModalIsOpen(true);

  const onOpenUpgrade = (data) => {
    setOfferProps(data);
    setUpgradeModalIsOpen(true);
  };

  const getConsumables = async () => {
    try {
      const res = await bc.payment().service().consumable();
      if (res.status === 200) {
        const { data } = res;
        setConsumables(data);
        const promiseMentorship = data.mentorship_service_sets.map(async (elem) => {
          const mentRes = await bc.mentorship().getServiceSet(elem.id);

          return mentRes.data.mentorship_services;
        });

        const promiseEvents = data.event_type_sets.map(async (elem) => {
          const evRes = await bc.payment().getEventTypeSet(elem.id);

          return evRes.data.event_types;
        });
        const resMentorships = await Promise.all(promiseMentorship);
        const resWorkshops = await Promise.all(promiseEvents);
        setServices({
          mentorships: resMentorships.flat(),
          workshops: resWorkshops.flat(),
        });
      }
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

  const {
    statusStyles, statusLabel, getLocaleDate, payUnitString,
  } = profileHandlers();
  const { borderColor2, hexColor, backgroundColor3, fontColor, featuredLight } = useStyle();

  const { blueDefault } = hexColor;

  const subscriptionData = subscriptionDataState;

  const allSubscriptions = subscriptionData?.subscriptions
    && subscriptionData?.plan_financings
    && [...subscriptionData?.subscriptions, ...subscriptionData?.plan_financings]
      .filter((subscription) => subscription?.plans?.[0]?.slug !== undefined);

  const prioritizeStatus = ['fully_paid', 'active', 'payment_issue', 'expired', 'cancelled', 'error'];

  const subscriptionsFilter = allSubscriptions?.length > 0 ? allSubscriptions
    .filter((subscription) => {
      const isFreeTrial = subscription?.status?.toLowerCase() === 'free_trial';
      const suggestedPlan = (subscription?.planOffer?.slug === undefined && subscription?.planOffer?.status)
        || allSubscriptions.find((sub) => sub?.plans?.[0]?.slug === subscription?.planOffer?.slug);

      // Ignore free_trial subscription if plan_offer already exists in list
      if (isFreeTrial && suggestedPlan !== undefined) return false;
      return true;
    }).reduce((acc, subscription) => {
      const planSlug = subscription?.plans?.[0]?.slug;

      if (!planSlug) return acc;

      if (!acc[planSlug]
        || prioritizeStatus.indexOf(subscription?.status?.toLowerCase())
        < prioritizeStatus.indexOf(acc[planSlug]?.status?.toLowerCase())) {
        acc[planSlug] = subscription;
      }

      return acc;
    }, {})
    : [];

  const subscriptionFiltered = Object.values(subscriptionsFilter);

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
  };

  const totalMentorshipsAvailable = consumables.mentorship_service_sets.reduce((acum, service) => acum + service.balance.unit, 0);
  const totalWorkshopsAvailable = consumables.event_type_sets.reduce((acum, service) => acum + service.balance.unit, 0);

  const existsNoAvailableAsSaas = cohorts.some((c) => c?.cohort?.available_as_saas === false);

  return (
    <>
      {location?.pathname?.includes('subscriptions') && (
        <Head>
          <title>{t('my-subscriptions')}</title>
        </Head>
      )}
      {!existsNoAvailableAsSaas && (
        <Box display="flex" flexWrap="wrap" gap="24px">
          {loadingServices ? (
            <>
              <SimpleSkeleton borderRadius="17px" height="108px" width={{ base: '100%', md: '265px' }} />
              <SimpleSkeleton borderRadius="17px" height="108px" width={{ base: '100%', md: '265px' }} />
            </>
          ) : (
            <>
              <Box borderRadius="17px" padding="12px 16px" background={featuredLight} width={{ base: '100%', md: '265px' }}>
                <Text size="sm" mb="10px" fontWeight="700">
                  {t('subscription.mentoring-available')}
                </Text>
                <Box display="flex" justifyContent="space-between" alignItems="end">
                  <Box display="flex" gap="10px" alignItems="center">
                    <Icon icon="teacher1" color={hexColor.blueDefault} width="34px" height="34px" />
                    {totalMentorshipsAvailable >= 0 ? (
                      <Heading color={hexColor.fontColor3} sieze="l" fontWeight="700">
                        {totalMentorshipsAvailable}
                      </Heading>
                    ) : (
                      <Icon icon="infinite" color={hexColor.fontColor3} width="34px" height="34px" />
                    )}
                  </Box>
                  <Button variant="link" onClick={() => setServicesModal('mentorships')}>
                    {t('subscription.see-details')}
                  </Button>
                </Box>
              </Box>
              <Box borderRadius="17px" padding="12px 16px" background={featuredLight} width={{ base: '100%', md: '265px' }}>
                <Text size="sm" mb="10px" fontWeight="700">
                  {t('subscription.workshop-available')}
                </Text>
                <Box display="flex" justifyContent="space-between" alignItems="end">
                  <Box display="flex" gap="10px" alignItems="center">
                    <Icon icon="community" color={hexColor.blueDefault} fill="none" width="34px" height="34px" />
                    {totalWorkshopsAvailable >= 0 ? (
                      <Heading color={hexColor.fontColor3} sieze="l" fontWeight="700">
                        {totalWorkshopsAvailable}
                      </Heading>
                    ) : (
                      <Icon icon="infinite" color={hexColor.fontColor3} width="34px" height="34px" />
                    )}
                  </Box>
                  <Button variant="link" onClick={() => setServicesModal('workshops')}>
                    {t('subscription.see-details')}
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      )}
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
                    <Box mb="10px" background={hexColor.featuredColor} padding="10px" borderRadius="4px">
                      <Box display="flex" gap="10px" alignItems="center" mb="5px">
                        {logo && <Image src={logo} width={28} height={28} alt="Service logo" />}
                        <Heading size="16px">
                          {service.name}
                        </Heading>
                      </Box>
                      <Text size="md" color={hexColor.fontColor3}>
                        {service.description}
                      </Text>
                    </Box>
                  );
                })}
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

      {subscriptionFiltered?.length > 0 ? (
        <Grid
          gridTemplateColumns={{
            base: 'repeat(auto-fill, minmax(15rem, 1fr))',
            md: 'repeat(auto-fill, minmax(20rem, 1fr))',
            lg: 'repeat(3, 1fr)',
          }}
          gridGap="3rem"
        >
          {subscriptionFiltered?.length > 0 && subscriptionFiltered.map((subscription) => {
            const status = subscription?.status?.toLowerCase();
            const invoice = subscription?.invoices[0];
            const isNotCancelled = subscription?.status !== 'CANCELLED' && subscription?.status !== 'PAYMENT_ISSUE';
            const isTotallyFree = subscription?.invoices[0]?.amount === 0 && subscription?.plans[0]?.trial_duration === 0;
            const isFreeTrial = subscription?.status?.toLowerCase() === 'free_trial';
            const isNextPaimentExpired = new Date(subscription?.next_payment_at) < new Date();
            const nextPaymentDate = {
              en: format(new Date(subscription?.next_payment_at), 'MMM do'),
              es: format(new Date(subscription?.next_payment_at), 'MMMM d', { locale: es }),
            };
            const currentFinancingOption = subscription?.plans[0]?.financing_options?.length > 0
              && subscription?.plans[0]?.financing_options[0];

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
                  <Flex flexDirection="column" gridGap="2px">
                    <Text fontSize="16px" fontWeight="700">
                      {subscription?.plans[0]?.name || toCapitalize(unSlugify(subscription?.plans[0]?.slug))}
                    </Text>
                  </Flex>

                  <Flex alignItems="center" gridGap="10px">
                    {!isFreeTrial && (
                      <Text fontSize="18px" fontWeight="700">
                        {(invoice?.amount && `$${invoice?.amount}`) || t('common:free')}
                      </Text>
                    )}
                    {subscription?.status !== 'PAYMENT_ISSUE' && subscription?.status !== 'FREE_TRIAL' && !isTotallyFree && (
                      <Text fontSize="12px" fontWeight="400">
                        {subscription.type !== 'plan_financing' ? (
                          <>
                            {isNotCancelled
                              ? (
                                <>
                                  {isNextPaimentExpired
                                    ? t('subscription.payment-up-to-date')
                                    : t('subscription.next-payment', { date: getLocaleDate(subscription?.next_payment_at) })}
                                </>
                              )
                              : t('subscription.last-payment', { date: getLocaleDate(invoice?.paid_at) })}
                          </>
                        ) : `- ${t('subscription.upgrade-modal.price_remaining_to_pay', { price: currentFinancingOption?.monthly_price * (currentFinancingOption?.how_many_months - subscription?.invoices?.length) })}`}
                      </Text>
                    )}
                  </Flex>

                  <Flex flexDirection="column" gridGap="10px" background={backgroundColor3} borderRadius="4px" padding="8px">
                    <Flex gridGap="4px">
                      <Icon
                        icon="refresh_time"
                        width="16px"
                        height="16px"
                        color={blueDefault}
                        minWidth="18px"
                      />
                      <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
                        {subscription?.type === 'plan_financing' && (
                          <>
                            {(currentFinancingOption?.how_many_months - subscription?.invoices?.length) > 0
                              ? t('subscription.renewal-date', { date: nextPaymentDate[lang] })
                              : t('subscription.renewal-date-unknown')}
                          </>
                        )}
                        {subscription?.type !== 'plan_financing' && (
                          <>
                            {subscription?.status !== 'FREE_TRIAL' ? (
                              <>
                                {isNotCancelled
                                  ? t('subscription.renewal-date', { date: nextPaymentDate[lang] })
                                  : t('subscription.renewal-date-cancelled')}
                              </>
                            ) : t('subscription.renewal-date-unknown')}
                          </>
                        )}

                      </Text>
                    </Flex>
                    <Flex gridGap="4px">
                      <Icon
                        icon="renewal"
                        width="16px"
                        height="16px"
                        color={blueDefault}
                        minWidth="18px"
                      />
                      <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
                        {subscription.type === 'plan_financing'
                          ? t('subscription.not-renewable')
                          : t('subscription.renewable')}
                      </Text>
                    </Flex>
                    <Flex gridGap="4px">
                      <Icon
                        icon="card"
                        width="18px"
                        height="13px"
                        color={blueDefault}
                        minWidth="18px"
                      />
                      <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
                        {/* payment-trial */}
                        {subscription.type === 'plan_financing'
                          ? (
                            <>
                              {(currentFinancingOption?.how_many_months - subscription?.invoices?.length) > 0
                                ? t('subscription.many-payments-left', { qty: currentFinancingOption?.how_many_months - subscription?.invoices?.length })
                                : t('subscription.no-payment-left')}
                            </>
                          )
                          : (
                            <>
                              {subscription?.status !== 'FREE_TRIAL'
                                ? (
                                  <>
                                    {!isTotallyFree
                                      ? t('subscription.payment', { payment: payUnitString(subscription?.pay_every_unit) })
                                      : t('subscription.payment-free')}
                                  </>
                                )
                                : t('subscription.payment-trial')}
                            </>
                          )}
                      </Text>
                    </Flex>
                  </Flex>
                  <ButtonHandler
                    subscription={subscription}
                    allSubscriptions={subscriptionFiltered}
                    onOpenUpgrade={onOpenUpgrade}
                    setSubscriptionProps={setSubscriptionProps}
                    onOpenCancelSubscription={onOpenCancelSubscription}
                  />
                </Flex>
              </Flex>
            );
          })}
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

          <UpgradeModal
            upgradeModalIsOpen={upgradeModalIsOpen}
            setUpgradeModalIsOpen={setUpgradeModalIsOpen}
            subscriptionProps={subscriptionProps}
            offerProps={offerProps}
          />

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
