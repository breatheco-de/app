import { Box, Button, Flex, Grid } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import Icon from '../../../common/components/Icon';
import Text from '../../../common/components/Text';
import useStyle from '../../../common/hooks/useStyle';
import bc from '../../../common/services/breathecode';
import handlers from '../../../common/handlers';
import ModalInfo from '../../moduleMap/modalInfo';
import profileHandlers from './handlers';
import UpgradeAccessModal from '../../../common/components/UpgradeAccessModal';

const Suscriptions = () => {
  const { t } = useTranslation('profile');
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [cohorts, setCohorts] = useState([]);

  const {
    statusStyles, statusLabel, cancelModalIsOpen, upgradeModalIsOpen, getLocaleDate,
    durationFormated, subscriptionHandler, payUnitString,
  } = profileHandlers();
  const { borderColor2, hexColor, backgroundColor3, fontColor } = useStyle();

  const { blueDefault } = hexColor;

  useEffect(() => {
    bc.admissions().me()
      .then(({ data }) => {
        setCohorts(data?.cohorts);
      });
    bc.payment().subscriptions()
      .then(({ data }) => {
        setSubscriptionData(data);
      });
  }, []);

  const cohortsExist = cohorts?.length > 0;
  const subscriptionsExist = subscriptionData?.subscriptions?.length > 0;

  return (
    <>
      <Text fontSize="15px" fontWeight="700" pb="18px">
        {t('my-subscriptions')}
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
            const currentPlan = subscription?.plans[0];
            const currentCohort = cohorts.find((l) => l?.cohort.slug === currentPlan?.slug)?.cohort;
            const status = subscription?.status?.toLowerCase();
            const invoice = subscription?.invoices[0];
            const isRenewable = getLocaleDate(invoice?.paid_at) !== getLocaleDate(subscription?.next_payment_at);
            const validUntil = handlers?.formatTimeString(
              new Date(subscription?.valid_until),
            );
            const isFullyPaid = subscription?.status.toLowerCase() === 'fully_paid';
            const button = subscriptionHandler(isRenewable);

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
                  <Text fontSize="16px" fontWeight="700">
                    {currentCohort?.name}
                  </Text>
                  <Flex alignItems="center" gridGap="10px">
                    <Text fontSize="18px" fontWeight="700">
                      {`$${invoice?.amount}`}
                    </Text>
                    <Text fontSize="12px" fontWeight="400">
                      {isRenewable
                        ? t('subscription.next-payment', { date: getLocaleDate(subscription?.next_payment_at) })
                        : t('subscription.last-payment', { date: getLocaleDate(invoice?.paid_at) })}
                    </Text>
                  </Flex>

                  <Flex flexDirection="column" gridGap="10px" background={backgroundColor3} borderRadius="4px" padding="8px">
                    <Flex gridGap="8px">
                      <Icon icon="refresh_time" width="16px" height="16px" color={blueDefault} />
                      <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
                        {t('subscription.duration', { duration: durationFormated(validUntil) })}
                      </Text>
                    </Flex>
                    <Flex gridGap="8px">
                      <Icon icon="renewal" width="16px" height="16px" color={blueDefault} />
                      <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
                        {isRenewable
                          ? t('subscription.renewal', { renewal: getLocaleDate(subscription?.next_payment_at) })
                          : t('subscription.not-renewable')}
                      </Text>
                    </Flex>
                    <Flex gridGap="8px">
                      <Icon icon="card" width="18px" height="13px" color={blueDefault} />
                      <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
                        {t('subscription.payment', { payment: payUnitString(subscription?.pay_every_unit) })}
                      </Text>
                    </Flex>
                  </Flex>
                  {!isFullyPaid ? (
                    <Button onClick={button.open} color="blue.default" margin="7px 0 13px 0" {...button.style}>
                      {button.text}
                    </Button>
                  ) : (
                    <Box padding="6px 0 0 0" />
                  )}
                  <ModalInfo
                    isOpen={cancelModalIsOpen}
                    title={t('subscription.cancel-modal.title')}
                    description={t('subscription.cancel-modal.description', { cohort: currentCohort?.name })}
                    closeText={t('subscription.cancel-modal.closeText')}
                    handlerText={t('subscription.cancel-modal.handlerText')}
                    headerStyles={{ textAlign: 'center' }}
                    descriptionStyle={{ color: fontColor, fontSize: '14px', textAlign: 'center' }}
                    footerStyle={{ flexDirection: 'row-reverse' }}
                    closeButtonStyles={{ variant: 'outline', color: 'blue.default', borderColor: 'currentColor' }}
                    buttonHandlerStyles={{ variant: 'default' }}
                    actionHandler={() => {
                      console.log('Cancel subscription triggered!');
                    }}
                    onClose={button.close}
                  />
                  <UpgradeAccessModal
                    isOpen={upgradeModalIsOpen}
                    onClose={button.close}
                  />
                </Flex>
              </Flex>
            );
          })}

        </Grid>
      ) : (
        <Text fontSize="15px" fontWeight="400" pb="18px">
          {t('no-subscriptions')}
        </Text>
      )}

    </>
  );
};

export default Suscriptions;
