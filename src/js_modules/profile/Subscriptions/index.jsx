import { Box, Button, Flex, Grid } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import Icon from '../../../common/components/Icon';
import Text from '../../../common/components/Text';
import useStyle from '../../../common/hooks/useStyle';
import bc from '../../../common/services/breathecode';
import ModalInfo from '../../moduleMap/modalInfo';
import profileHandlers from './handlers';
import UpgradeAccessModal from '../../../common/components/UpgradeAccessModal';
import { toCapitalize, unSlugify } from '../../../utils';
import useSubscriptionsHandler from '../../../common/store/actions/subscriptionAction';

const Subscriptions = ({ storybookConfig }) => {
  const { t, lang } = useTranslation('profile');
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const [upgradeModalIsOpen, setUpgradeModalIsOpen] = useState(false);
  const [subscriptionProps, setSubscriptionProps] = useState({});
  const { state, fetchSubscriptions, cancelSubscription } = useSubscriptionsHandler();
  const [cohortsState, setCohortsState] = useState([]);

  const subscriptionDataState = state?.subscriptions;

  const cohortProps = subscriptionProps.selected_cohort;
  const profileTranslations = storybookConfig?.translations?.profile;
  const subscriptionTranslations = storybookConfig?.translations?.profile?.subscription;

  const onOpenCancelSubscription = () => setCancelModalIsOpen(true);
  const onCloseCancelSubscription = () => setCancelModalIsOpen(false);

  const onOpenUpgrade = () => setUpgradeModalIsOpen(true);
  const onCloseUpgrade = () => setUpgradeModalIsOpen(false);

  const {
    statusStyles, statusLabel, getLocaleDate, subscriptionHandler, payUnitString,
  } = profileHandlers({
    translations: profileTranslations,
    onCloseCancelSubscription,
    onOpenCancelSubscription,
    onOpenUpgrade,
    onCloseUpgrade,
  });
  const { borderColor2, hexColor, backgroundColor3, fontColor } = useStyle();

  const { blueDefault } = hexColor;

  useEffect(() => {
    bc.admissions().me()
      .then(({ data }) => {
        setCohortsState(data?.cohorts);
      });
    fetchSubscriptions();
  }, []);

  const cohorts = storybookConfig?.cohorts || cohortsState;
  const subscriptionData = storybookConfig?.subscriptionData || subscriptionDataState;

  const cohortsExist = cohorts?.length > 0;
  const subscriptionsExist = subscriptionData?.subscriptions?.length > 0
    && subscriptionData.subscriptions.some((subscription) => {
      const exists = cohorts.some((l) => l?.cohort.slug === subscription?.selected_cohort?.slug);
      return exists;
    });

  return (
    <>
      <Text fontSize="15px" fontWeight="700" pb="18px">
        {profileTranslations?.['my-subscriptions'] || t('my-subscriptions')}
      </Text>

      {(subscriptionsExist && cohortsExist) ? (
        <Grid
          gridTemplateColumns={{
            base: 'repeat(auto-fill, minmax(15rem, 1fr))',
            md: 'repeat(auto-fill, minmax(20rem, 1fr))',
            lg: 'repeat(3, 1fr)',
          }}
          gridGap="3rem"
        >
          {subscriptionData.subscriptions.map((subscription) => {
            // const currentCohort = cohorts.find((l) => l?.cohort.slug === subscription?.selected_cohort?.slug)?.cohort;
            const status = subscription?.status?.toLowerCase();
            const invoice = subscription?.invoices[0];
            // const isNotCancelled = (getLocaleDate(subscription?.paid_at) !== getLocaleDate(subscription?.next_payment_at) && subscription?.status.toLowerCase() !== 'canceled');
            const isNotCancelled = (subscription?.status !== 'CANCELLED' && subscription?.status !== 'PAYMENT_ISSUE');
            const isFreeTrial = subscription?.status.toLowerCase() === 'free_trial';
            const isFullyPaid = subscription?.status.toLowerCase() === 'fully_paid';
            // const button = subscriptionHandler(isNotCancelled);
            const button = subscriptionHandler(subscription?.status);
            const isNextPaimentExpired = new Date(subscription?.next_payment_at) < new Date();

            const nextPaymentDate = {
              en: format(new Date(subscription?.next_payment_at), 'MMM do'),
              es: format(new Date(subscription?.next_payment_at), 'MMM d', { locale: es }),
            };

            return (
              <Flex key={subscription?.id} position="relative" margin="10px 0 0 0" flexDirection="column" justifyContent="space-between" alignItems="center" border="1px solid" borderColor={borderColor2} p="0 16px 0 16px" borderRadius="9px">
                <Box borderRadius="50%" bg="green.400" padding="12px" position="absolute" top={-7} left={4}>
                  <Icon icon="data-science" width="30px" height="30px" />
                </Box>
                <Box padding="14px 0" width="100%">
                  <Text fontSize="12px" fontWeight="700" padding="4px 10px" borderRadius="18px" width="fit-content" margin="0 0 0 auto" {...statusStyles[status] || ''}>
                    {statusLabel[status] || 'unknown'}
                  </Text>
                </Box>
                <Flex flexDirection="column" gridGap="8px" height="100%" width="100%">
                  <Flex flexDirection="column" gridGap="2px">
                    <Text fontSize="16px" fontWeight="700">
                      {subscription?.plans[0]?.name || toCapitalize(unSlugify(subscription?.plans[0]?.slug))}
                    </Text>
                    <Text fontSize="11px" fontWeight="700">
                      {subscription?.selected_cohort?.name}
                    </Text>
                  </Flex>

                  <Flex alignItems="center" gridGap="10px">
                    {!isFreeTrial && (
                      <Text fontSize="18px" fontWeight="700">
                        {`$${invoice?.amount}`}
                      </Text>
                    )}
                    <Text fontSize="12px" fontWeight="400">
                      {isNotCancelled
                        ? (
                          <>
                            {isNextPaimentExpired
                              ? subscriptionTranslations?.['payment-up-to-date'] || t('subscription.payment-up-to-date')
                              : subscriptionTranslations?.['next-payment']?.replace('{{date}}', getLocaleDate(subscription?.next_payment_at))
                              || t('subscription.next-payment', { date: getLocaleDate(subscription?.next_payment_at) })}
                          </>
                        )
                        : (subscriptionTranslations?.['last-payment']?.replace('{{date}}', getLocaleDate(invoice?.paid_at)) || t('subscription.last-payment', { date: getLocaleDate(invoice?.paid_at) }))}
                    </Text>
                  </Flex>

                  <Flex flexDirection="column" gridGap="10px" background={backgroundColor3} borderRadius="4px" padding="8px">
                    <Flex gridGap="8px">
                      <Icon icon="refresh_time" width="16px" height="16px" color={blueDefault} />
                      <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">

                        {isNotCancelled
                          ? subscriptionTranslations?.['renewal-date'] || t('subscription.renewal-date', { date: nextPaymentDate[lang] })
                          : subscriptionTranslations?.['renewal-date-cancelled'] || t('subscription.renewal-date-cancelled')}
                      </Text>
                    </Flex>
                    <Flex gridGap="8px">
                      <Icon icon="renewal" width="16px" height="16px" color={blueDefault} />
                      <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
                        {subscriptionTranslations?.renewable || t('subscription.renewable')}
                      </Text>
                    </Flex>
                    <Flex gridGap="8px">
                      <Icon icon="card" width="18px" height="13px" color={blueDefault} />
                      <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
                        {subscriptionTranslations?.payment?.replace('{{payment}}', payUnitString(subscription?.pay_every_unit)) || t('subscription.payment', { payment: payUnitString(subscription?.pay_every_unit) })}
                      </Text>
                    </Flex>
                  </Flex>
                  {!isFullyPaid ? (
                    <Button
                      onClick={() => {
                        button.open();
                        setSubscriptionProps(subscription);
                      }}
                      color="blue.default"
                      margin="7px 0 13px 0"
                      {...button.style}
                    >
                      {button.text}
                    </Button>
                  ) : (
                    <Box padding="6px 0 0 0" />
                  )}
                </Flex>
              </Flex>
            );
          })}
          <ModalInfo
            isOpen={cancelModalIsOpen}
            title={subscriptionTranslations?.['cancel-modal']?.title || t('subscription.cancel-modal.title')}
            description={subscriptionTranslations?.['cancel-modal']?.description.replace('{{cohort}}', cohortProps?.name) || t('subscription.cancel-modal.description', { cohort: cohortProps?.name })}
            closeText={subscriptionTranslations?.['cancel-modal']?.closeText || t('subscription.cancel-modal.closeText')}
            handlerText={subscriptionTranslations?.['cancel-modal']?.handlerText || t('subscription.cancel-modal.handlerText')}
            headerStyles={{ textAlign: 'center' }}
            descriptionStyle={{ color: fontColor, fontSize: '14px', textAlign: 'center' }}
            footerStyle={{ flexDirection: 'row-reverse' }}
            closeButtonStyles={{ variant: 'outline', color: 'blue.default', borderColor: 'currentColor' }}
            buttonHandlerStyles={{ variant: 'default' }}
            actionHandler={() => {
              cancelSubscription(subscriptionProps?.id);
              console.log('Cancel subscription triggered!');
            }}
            onClose={() => setCancelModalIsOpen(false)}
          />
          <UpgradeAccessModal
            isOpen={upgradeModalIsOpen}
            onClose={() => setUpgradeModalIsOpen(false)}
          />

        </Grid>
      ) : (
        <Text fontSize="15px" fontWeight="400" pb="18px">
          {subscriptionTranslations?.['no-subscriptions'] || t('no-subscriptions')}
        </Text>
      )}

    </>
  );
};

Subscriptions.propTypes = {
  storybookConfig: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
};
Subscriptions.defaultProps = {
  storybookConfig: {},
};

export default Subscriptions;
