import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { Box, Text, useToast, Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import useAuth from '../../../common/hooks/useAuth';
import bc from '../../../common/services/breathecode';
import CardForm from '../../../js_modules/checkout/CardForm';
import asPrivate from '../../../common/context/PrivateRouteWrapper';
import useSubscriptionsHandler from '../../../common/store/actions/subscriptionAction';
import LoaderScreen from '../../../common/components/LoaderScreen';
import Icon from '../../../common/components/Icon';

function ChangeCardPage() {
  const router = useRouter();
  const toast = useToast();
  const hasCheckedSubscription = useRef(false);

  const { t } = useTranslation('subscription');
  const { user } = useAuth();
  const { subId } = router.query;
  const { state, fetchSubscriptions } = useSubscriptionsHandler();

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleCardSubmit = async (values, actions, stateCard = {}) => {
    try {
      const response = await bc.payment().addCard(stateCard);
      const data = await response.json();
      if (response.ok) {
        setIsSuccess(true);
      } else {
        const errorMessage = data?.detail || 'Payment failed';
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Error updating card:', err);

      toast({
        position: 'top',
        title: t('card decline'),
        description: err.message,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  const checkUserSubscription = (subscriptions) => {
    if (!subscriptions) return false;

    const subscriptionId = parseInt(subId, 10);

    const subscription = subscriptions.subscriptions?.find((sub) => sub.id === subscriptionId);
    if (subscription) return subscription;

    const planfinancing = subscriptions.plan_financings?.find((sub) => sub.id === subscriptionId);
    if (planfinancing) return planfinancing;

    return false;
  };

  const redirect = (redirectMessage) => {
    toast({
      position: 'top',
      title: redirectMessage,
      status: 'error',
      duration: 7000,
      isClosable: true,
    });
    router.push('/choose-program');
  };

  const getSubs = async () => {
    if (state.subscriptions.length > 0) return;
    await fetchSubscriptions();
    hasCheckedSubscription.current = true;
  };

  useEffect(() => {
    if (!hasCheckedSubscription.current) return;

    if (state.subscriptions.length === 0) {
      redirect(t('no-sub-owner'));
      return;
    }

    const subscription = checkUserSubscription(state.subscriptions);
    if (!subscription) {
      redirect(t('no-sub-owner'));
      return;
    }

    setIsLoading(false);
  }, [state.subscriptions]);

  useEffect(() => {
    if (user) {
      getSubs();
      return;
    }

    toast({
      position: 'top',
      title: 'You need to be logged in to access this page',
      status: 'error',
      duration: 7000,
      isClosable: true,
    });
    router.push('/login');
  }, [user]);

  return (
    isLoading ? <LoaderScreen top="100px" />
      : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            maxWidth="600px"
            width="100%"
            p={6}
            borderRadius="md"
            textAlign="center"
          >
            <Text fontSize="xl" fontWeight="bold" mb={4}>{t('change-card-info')}</Text>
            {!isSuccess ? (
              <CardForm onSubmit={handleCardSubmit} buttonText={t('change-card-info-action')} />
            ) : (
              <Box
                display="flex"
                width={{ base: 'auto', lg: '490px' }}
                height="auto"
                flexDirection="column"
                minWidth={{ base: 'auto', md: '100%' }}
                background="green.light"
                p={{ base: '20px 0', md: '30px 0' }}
                borderRadius="15px"
              >
                <Flex flexDirection="column" gridGap="24px" borderRadius="3px" alignItems="center" padding="16px 8px">
                  <Icon icon="feedback-like" width="60px" height="60px" />
                  <Text size="14px" fontWeight={700} textAlign="center" color="black">
                    {t('payment-success')}
                  </Text>
                </Flex>
              </Box>
            )}
          </Box>
        </Box>
      )
  );
}

export default asPrivate(ChangeCardPage);
