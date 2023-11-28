/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/jsx-no-useless-fragment */
import { Box, Flex, Grid } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import Head from 'next/head';
import Icon from '../../../common/components/Icon';
import Text from '../../../common/components/Text';
import useStyle from '../../../common/hooks/useStyle';
import ModalInfo from '../../moduleMap/modalInfo';
import profileHandlers from './handlers';
import { location, slugToTitle, toCapitalize, unSlugify } from '../../../utils';
import useSubscriptionsHandler from '../../../common/store/actions/subscriptionAction';
import ButtonHandler from './ButtonHandler';
import UpgradeModal from './UpgradeModal';
import { CardSkeleton } from '../../../common/components/Skeleton';

function Subscriptions({ storybookConfig }) {
  const { t, lang } = useTranslation('profile');
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const [upgradeModalIsOpen, setUpgradeModalIsOpen] = useState(false);
  const [subscriptionProps, setSubscriptionProps] = useState({});
  const { state, cancelSubscription } = useSubscriptionsHandler();
  const [offerProps, setOfferProps] = useState({});

  const subscriptionDataState = state?.subscriptions;
  const isLoading = state?.isLoading;

  const profileTranslations = storybookConfig?.translations?.profile;
  const subscriptionTranslations = storybookConfig?.translations?.profile?.subscription;

  const onOpenCancelSubscription = () => setCancelModalIsOpen(true);

  const onOpenUpgrade = (data) => {
    setOfferProps(data);
    setUpgradeModalIsOpen(true);
  };

  const {
    statusStyles, statusLabel, getLocaleDate, payUnitString,
  } = profileHandlers({
    translations: profileTranslations,
  });
  const { borderColor2, hexColor, backgroundColor3, fontColor } = useStyle();

  const { blueDefault } = hexColor;

  const subscriptionData = storybookConfig?.subscriptionData || subscriptionDataState;

  const allSubscriptions = subscriptionData?.subscriptions
    && subscriptionData?.plan_financings
    && [...subscriptionData?.subscriptions, ...subscriptionData?.plan_financings]
      .filter((subscription) => subscription?.plans?.[0]?.slug !== undefined);

  const subscriptionFiltered = allSubscriptions?.length > 0 ? allSubscriptions.filter((subscription) => {
    const isFreeTrial = subscription?.status?.toLowerCase() === 'free_trial';
    const suggestedPlan = (subscription?.planOffer?.slug === undefined && subscription?.planOffer?.status) || allSubscriptions.find((sub) => sub?.plans?.[0]?.slug === subscription?.planOffer?.slug);

    // Ignore free_trial subscription if plan_offer already exists in list
    if (isFreeTrial && suggestedPlan !== undefined) return false;
    return true;
  }) : [];

  return (
    <>
      {location?.pathname?.includes('subscriptions') && (
        <Head>
          <title>{t('my-subscriptions')}</title>
        </Head>
      )}
      <Text fontSize="15px" fontWeight="700" pb="18px">
        {profileTranslations?.['my-subscriptions'] || t('my-subscriptions')}
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
                                    ? subscriptionTranslations?.['payment-up-to-date'] || t('subscription.payment-up-to-date')
                                    : subscriptionTranslations?.['next-payment']?.replace('{{date}}', getLocaleDate(subscription?.next_payment_at))
                                    || t('subscription.next-payment', { date: getLocaleDate(subscription?.next_payment_at) })}
                                </>
                              )
                              : (subscriptionTranslations?.['last-payment']?.replace('{{date}}', getLocaleDate(invoice?.paid_at)) || t('subscription.last-payment', { date: getLocaleDate(invoice?.paid_at) }))}
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
                              ? subscriptionTranslations?.['renewal-date']?.replace('{{date}}', nextPaymentDate[lang]) || t('subscription.renewal-date', { date: nextPaymentDate[lang] })
                              : (subscriptionTranslations?.['renewal-date-unknown'] || t('subscription.renewal-date-unknown'))}
                          </>
                        )}
                        {subscription?.type !== 'plan_financing' && (
                          <>
                            {subscription?.status !== 'FREE_TRIAL' ? (
                              <>
                                {isNotCancelled
                                  ? subscriptionTranslations?.['renewal-date']?.replace('{{date}}', nextPaymentDate[lang]) || t('subscription.renewal-date', { date: nextPaymentDate[lang] })
                                  : subscriptionTranslations?.['renewal-date-cancelled'] || t('subscription.renewal-date-cancelled')}
                              </>
                            ) : subscriptionTranslations?.['renewal-date-unknown'] || t('subscription.renewal-date-unknown')}
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
                          ? subscriptionTranslations?.['not-renewable'] || t('subscription.not-renewable')
                          : subscriptionTranslations?.renewable || t('subscription.renewable')}
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
                                ? subscriptionTranslations?.['many-payments-left']?.replace('{{qty}}', currentFinancingOption?.how_many_months - subscription?.invoices?.length) || t('subscription.many-payments-left', { qty: currentFinancingOption?.how_many_months - subscription?.invoices?.length })
                                : subscriptionTranslations?.['no-payment-left'] || t('subscription.no-payment-left')}
                            </>
                          )
                          : (
                            <>
                              {subscription?.status !== 'FREE_TRIAL'
                                ? (
                                  <>
                                    {!isTotallyFree
                                      ? subscriptionTranslations?.payment?.replace('{{payment}}', payUnitString(subscription?.pay_every_unit)) || t('subscription.payment', { payment: payUnitString(subscription?.pay_every_unit) })
                                      : subscriptionTranslations?.['payment-free'] || t('subscription.payment-free')}
                                  </>
                                )
                                : subscriptionTranslations?.['payment-trial'] || t('subscription.payment-trial')}
                            </>
                          )}
                      </Text>
                    </Flex>
                  </Flex>
                  {!isTotallyFree && (
                    <ButtonHandler
                      translations={profileTranslations}
                      subscription={subscription}
                      onOpenUpgrade={onOpenUpgrade}
                      setSubscriptionProps={setSubscriptionProps}
                      onOpenCancelSubscription={onOpenCancelSubscription}
                    />
                  )}
                </Flex>
              </Flex>
            );
          })}
          <ModalInfo
            isOpen={cancelModalIsOpen}
            title={subscriptionTranslations?.['cancel-modal']?.title || t('subscription.cancel-modal.title')}
            description={subscriptionTranslations?.['cancel-modal']?.description.replace('{{cohort}}', slugToTitle(subscriptionProps?.slug)) || t('subscription.cancel-modal.description', { cohort: slugToTitle(subscriptionProps?.slug) })}
            closeText={subscriptionTranslations?.['cancel-modal']?.closeText || t('subscription.cancel-modal.closeText')}
            handlerText={subscriptionTranslations?.['cancel-modal']?.handlerText || t('subscription.cancel-modal.handlerText')}
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
              {subscriptionTranslations?.['no-subscriptions'] || t('no-subscriptions')}
            </Text>
          )}
        </>
      )}
    </>
  );
}

Subscriptions.propTypes = {
  storybookConfig: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
};
Subscriptions.defaultProps = {
  storybookConfig: {},
};

export default Subscriptions;
