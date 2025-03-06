/* eslint-disable camelcase */
/* eslint-disable no-unsafe-optional-chaining */
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
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
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
import { currenciesSymbols } from '../../../utils/variables';

function SubscriptionInfo({ subscription }) {
  const { t, lang } = useTranslation('profile');
  const { backgroundColor3, hexColor } = useStyle();
  const { blueDefault } = hexColor;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const parsedDate = new Date(date);
    return format(parsedDate, 'dd MMM yy', { locale: lang === 'en' || lang === 'us' ? enUS : es });
  };

  const getSubscriptionDetails = (sub) => {
    const status = sub?.status?.toLowerCase();
    const isPlanFinancing = sub?.type === 'plan_financing';
    const fullFilledInvoicesAmount = sub?.invoices?.filter((invo) => invo.status === 'FULFILLED').length;
    const isPlanFinancingFullyPaid = fullFilledInvoicesAmount === sub?.how_many_installments;
    const nextPaymentDate = formatDate(sub?.next_payment_at);
    const expirationDate = formatDate(sub?.plan_expires_at || sub?.next_payment_at);
    const subCurrency = currenciesSymbols[sub?.currency?.code] || '$';

    const baseDetails = {
      renewalDate: '',
      paymentInfo: '',
      nextPayment: '',
      errorMessage: '',
      renewability: '',
    };

    const paymentText = (amount, date) => t('subscription.next-payment-with-price', { amount, date, currencySymbol: subCurrency });

    const statusConfig = {
      active: () => {
        if (isPlanFinancing) {
          return {
            renewalDate: t('subscription.expiration-date', { date: expirationDate }),
            paymentInfo: isPlanFinancingFullyPaid
              ? t('subscription.totally-paid', { amount: fullFilledInvoicesAmount * sub.monthly_price, currencySymbol: subCurrency })
              : t('subscription.total-paid', { paidAmount: fullFilledInvoicesAmount * sub.monthly_price, pendingAmount: sub.how_many_installments * sub.monthly_price, currencySymbol: subCurrency }),
            nextPayment: isPlanFinancingFullyPaid ? t('subscription.no-payment-left') : paymentText(sub?.monthly_price, nextPaymentDate),
          };
        }
        return {
          renewalDate: t('subscription.renewal-date', { date: nextPaymentDate }),
          renewability: sub.created_at ? t('subscription.active-since', { date: sub.created_at }) : false,
          paymentInfo: t('subscription.payment', { payment: sub.invoices[0].amount === 0 ? t('common:free') : `${subCurrency}${sub.invoices[0].amount}/${t(`subscription.payment_unit.${sub?.pay_every_unit?.toLowerCase()}`)}` }),
        };
      },
      expired: () => ({
        renewalDate: t('subscription.expired-on', { date: expirationDate }),
        paymentInfo: isPlanFinancing
          ? t('subscription.totally-paid', { amount: fullFilledInvoicesAmount * sub.monthly_price, currencySymbol: subCurrency })
          : t('subscription.payment', { payment: `${sub.invoices[0].amount}$/${t(`subscription.payment_unit.${sub?.pay_every_unit.toLowerCase()}`)}` }),
      }),
      error: () => ({
        errorMessage: t('subscription.error-message', { error: sub?.status_message || 'Something went wrong' }),
        paymentInfo: t('subscription.payment', { payment: `${subCurrency}${sub.invoices[0].amount}/${t(`subscription.payment_unit.${sub?.pay_every_unit?.toLowerCase()}`)}` }),
      }),
      payment_issue: () => {
        if (isPlanFinancing) {
          return {
            renewalDate: t('subscription.expiration-date', { date: expirationDate }),
            nextPayment: isPlanFinancingFullyPaid ? t('subscription.no-payment-left') : paymentText(sub?.monthly_price, nextPaymentDate),
            paymentInfo: isPlanFinancingFullyPaid
              ? t('subscription.totally-paid', { amount: sub.monthly_price, currencySymbol: subCurrency })
              : t('subscription.total-paid', { paidAmount: fullFilledInvoicesAmount * sub.monthly_price, pendingAmount: sub.how_many_installments * sub.monthly_price, currencySymbol: subCurrency }),
          };
        }
        return {
          errorMessage: t('subscription.error-message', { error: sub?.status_message || 'Something went wrong' }),
          paymentInfo: t('subscription.payment', { payment: `${subCurrency}${sub.invoices[0].amount}/${t(`subscription.payment_unit.${sub?.pay_every_unit?.toLowerCase()}`)}` }),
        };
      },
      cancelled: () => {
        if (isPlanFinancing) {
          return {
            renewalDate: t('subscription.expiration-date', { date: expirationDate }),
            nextPayment: isPlanFinancingFullyPaid ? t('subscription.no-payment-left') : paymentText(sub?.monthly_price, nextPaymentDate),
            paymentInfo: isPlanFinancingFullyPaid
              ? t('subscription.totally-paid', { amount: sub.monthly_price })
              : t('subscription.total-paid', { paidAmount: fullFilledInvoicesAmount * sub.monthly_price, pendingAmount: sub.how_many_installments * sub.monthly_price, currencySymbol: subCurrency }),
          };
        }
        return {
          errorMessage: false,
          paymentInfo: t('subscription.payment', { payment: `${sub.invoices[0].amount}$/${t(`subscription.payment_unit.${sub?.pay_every_unit?.toLowerCase()}`)}` }),
        };
      },
      free_trial: () => ({
        renewalDate: t('subscription.renewal-date', { date: nextPaymentDate }),
        renewability: sub.created_at ? t('subscription.active-since', { date: sub.created_at }) : false,
        paymentInfo: t('subscription.payment', { payment: t('common:free') }),
      }),
    };

    return statusConfig[status] ? statusConfig[status]() : baseDetails;
  };

  console.log(subscription);

  const { renewalDate, renewability, paymentInfo, nextPayment, errorMessage } = getSubscriptionDetails(subscription);

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

function Subscriptions({ cohorts }) {
  const { t } = useTranslation('profile');
  const { state, isLoading, fetchSubscriptions, cancelSubscription } = useSubscriptionsHandler();
  const { statusStyles, statusLabel } = profileHandlers();
  const { borderColor2, hexColor, fontColor, featuredLight } = useStyle();
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const [upgradeModalIsOpen, setUpgradeModalIsOpen] = useState(false);
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
  const [offerProps, setOfferProps] = useState({});
  const memberships = state?.subscriptions;

  const onOpenCancelSubscription = () => setCancelModalIsOpen(true);

  const onOpenUpgrade = (data) => {
    setOfferProps(data);
    setUpgradeModalIsOpen(true);
  };

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

        const resMentorships = await Promise.all(promiseMentorship);
        const resWorkshops = await Promise.all(promiseEvents);

        allServices.mentorships = [...resMentorships.flat(), ...nonSaasServices];
        allServices.workshops = resWorkshops.flat();
        allServices.voids = [...data.voids];
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

  const totalMentorshipsAvailable = consumables.mentorship_service_sets.reduce((acum, service) => acum + service.balance.unit, 0);
  const totalWorkshopsAvailable = consumables.event_type_sets.reduce((acum, service) => acum + service.balance.unit, 0);
  const totalRigoConsumablesAvailable = consumables.voids.reduce((acum, service) => acum + service.balance.unit, 0);

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
            <Box borderRadius="17px" padding="12px 16px" background={featuredLight} width={{ base: '100%', md: '265px' }}>
              <Text size="sm" mb="10px" fontWeight="700">
                {t('subscription.mentoring-available')}
              </Text>
              <Box display="flex" justifyContent="space-between" alignItems="end">
                <Box display="flex" gap="10px" alignItems="center">
                  <Icon icon="teacher1" color={hexColor.blueDefault} width="34px" height="34px" />
                  {(totalMentorshipsAvailable < 0 || existsNoAvailableAsSaas) ? (
                    <Icon icon="infinite" color={hexColor.fontColor3} width="34px" height="34px" />
                  ) : (
                    <Heading color={hexColor.fontColor3} sieze="l" fontWeight="700">
                      {totalMentorshipsAvailable}
                    </Heading>
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
            <Box borderRadius="17px" padding="12px 16px" background={featuredLight} width={{ base: '100%', md: '265px' }}>
              <Text size="sm" mb="10px" fontWeight="700">
                {t('subscription.rigo-available')}
              </Text>
              <Box display="flex" justifyContent="space-between" alignItems="end">
                <Box display="flex" gap="10px" alignItems="center">
                  <Icon icon="rigobot-avatar-tiny" color={hexColor.blueDefault} fill="none" width="34px" height="34px" />
                  {totalRigoConsumablesAvailable >= 0 ? (
                    <Heading color={hexColor.fontColor3} sieze="l" fontWeight="700">
                      {totalRigoConsumablesAvailable}
                    </Heading>
                  ) : (
                    <Icon icon="infinite" color={hexColor.fontColor3} width="34px" height="34px" />
                  )}
                </Box>
                <Button variant="link" onClick={() => setServicesModal('voids')}>
                  {t('subscription.see-details')}
                </Button>
              </Box>
            </Box>
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
                            {service.name || t(`slug-translations.${service.slug}.title`)}
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
                              <Text textAlign="center" size="l" fontWeight="700">
                                {service?.balance?.unit}
                              </Text>
                            </Box>
                          </>
                        )}
                      </Box>
                      <Text size="md" color={hexColor.fontColor3}>
                        {service.description || t(`slug-translations.${service.slug}.description`)}
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
          {membershipsFiltered?.length > 0 && membershipsFiltered.map((subscription) => {
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
                    allSubscriptions={membershipsFiltered}
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
SubscriptionInfo.propTypes = {
  subscription: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};
Subscriptions.defaultProps = {
  cohorts: [],
};

export default Subscriptions;
