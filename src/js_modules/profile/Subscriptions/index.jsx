import { Box, Button, Flex, Grid } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import Icon from '../../../common/components/Icon';
// import Icon from '../../common/components/Icon';
import Text from '../../../common/components/Text';
import useStyle from '../../../common/hooks/useStyle';
import bc from '../../../common/services/breathecode';
import handlers from '../../../common/handlers';
import ModalInfo from '../../moduleMap/modalInfo';
import profileHandlers from './handlers';

const Suscriptions = () => {
  const { t } = useTranslation('profile');
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [cohorts, setCohorts] = useState([]);

  // functions and variables
  const {
    statusStyles, statusLabel, cancelModalIsOpen, onClose, getLocaleDate, durationFormated,
    subscriptionHandler, payUnitString,
  } = profileHandlers();
  const { borderColor2, hexColor } = useStyle();

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

  // const cancelSubscription = (subscriptionId) => {};

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
          // gridGap="1em"
          // padding={containerPadding}
        >
          {subscriptionData.subscriptions.map((subscription) => {
            const currentPlan = subscription?.plans[0];
            const currentCohort = cohorts.find((l) => l?.cohort.slug === currentPlan?.slug)?.cohort;
            const status = currentPlan?.status?.toLowerCase();
            const invoice = subscription?.invoices[0];
            const isRenewable = getLocaleDate(invoice?.paid_at) !== getLocaleDate(subscription?.next_payment_at);
            const cohortDuration = handlers?.formatTimeString(
              new Date(currentCohort?.ending_date),
            );
            const button = subscriptionHandler(isRenewable);
            // console.log('currentCohort:::', currentCohort);
            // console.log('currentPlan:::', currentPlan);
            // console.log('subscription:::', subscription);

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
                      {`${invoice?.amount > 0 ? `$${invoice?.amount}` : 'Free trial'}`}
                    </Text>
                    <Text fontSize="12px" fontWeight="400">
                      {`last payment on ${getLocaleDate(invoice?.paid_at)}`}
                    </Text>
                  </Flex>

                  <Flex flexDirection="column" gridGap="10px" background="gray.light2" borderRadius="4px" padding="8px">
                    <Flex gridGap="8px">
                      <Icon icon="refresh_time" width="16px" height="16px" color={blueDefault} />
                      <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
                        {`Duration: ${durationFormated(cohortDuration)}`}
                      </Text>
                    </Flex>
                    <Flex gridGap="8px">
                      <Icon icon="renewal" width="16px" height="16px" color={blueDefault} />
                      <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
                        {`Renewal: ${isRenewable ? getLocaleDate(subscription?.next_payment_at) : 'Not renewable'}`}
                      </Text>
                    </Flex>
                    <Flex gridGap="8px">
                      <Icon icon="card" width="18px" height="13px" color={blueDefault} />
                      <Text fontSize="12px" fontWeight="700" padding="0 0 0 8px">
                        {`Payment: ${payUnitString(subscription?.pay_every_unit)}`}
                      </Text>
                    </Flex>
                  </Flex>
                  <Button onClick={button.open()} color="blue.default" margin="7px 0 13px 0" {...button.style}>
                    {button.text}
                  </Button>
                  <ModalInfo
                    isOpen={cancelModalIsOpen}
                    title="Cancel Subscription"
                    onClose={onClose}
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
