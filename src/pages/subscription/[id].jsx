import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { Box, Text, useToast } from '@chakra-ui/react';
import useAuth from '../../common/hooks/useAuth';
import bc from '../../common/services/breathecode';
import CardForm from '../../js_modules/checkout/CardForm';
import asPrivate from '../../common/context/PrivateRouteWrapper';
import useSubscriptionsHandler from '../../common/store/actions/subscriptionAction';
import LoaderScreen from '../../common/components/LoaderScreen';

function ChangeCardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const { id } = router.query;
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { state, fetchSubscriptions } = useSubscriptionsHandler();
  const hasCheckedSubscription = useRef(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    if (state.isLoading || !state || hasCheckedSubscription.current) return;
    
    const subscription = checkUserSubscription(state.subscriptions);
    if (!subscription) {
      toast({
        position: 'top',
        title: 'You need to be the owner of this subscription to access this page',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      router.push('/choose-program');
    }

    setIsLoading(false);
    hasCheckedSubscription.current = true;
  }, [id, state]);

  useEffect(() => {
    if (user) return;

    toast({
      position: 'top',
      title: 'You need to be logged in to access this page',
      status: 'error',
      duration: 7000,
      isClosable: true,
    });
    router.push('/login');
  }, [user]);

  const handleCardSubmit = async (values) => {
    try {
      const response = await bc.payment().addCard(values);
      if (response.ok) {
        setIsSuccess(true);
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      toast({ title: 'Failed to update card', status: 'error' });
    }
  };

  const checkUserSubscription = (subscriptions) => {
    if (!subscriptions) return false;

    const subscriptionId = parseInt(id, 10);

    const subscription = subscriptions.subscriptions?.find((s) => s.id === subscriptionId);
    if (subscription) return subscription;

    const planfinancing = subscriptions.plan_financings?.find((s) => s.id === subscriptionId);
    if (planfinancing) return planfinancing;

    return false;
  };

  return (
    isLoading ? <LoaderScreen /> :
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
        <Text fontSize="xl" fontWeight="bold" mb={4}>Change Payment Card Information</Text>
        {!isSuccess ? (
          <CardForm onSubmit={handleCardSubmit} />
        ) : (
          <Box>
            <Text fontSize="lg" fontWeight="bold" color="green.500">Payment method updated successfully!</Text>
            <Text>Your payment will be processed soon.</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default asPrivate(ChangeCardPage);
