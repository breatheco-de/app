// import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, Text, useToast } from '@chakra-ui/react';
// import useAuth from '../../common/hooks/useAuth';
import bc from '../../common/services/breathecode';
import CardForm from '../../js_modules/checkout/CardForm';
// import useSubscriptionsHandler from '../../common/store/actions/subscriptionAction';

function ChangeCardPage() {
//   const router = useRouter();
//   const { id } = router.query;
//   const { user } = useAuth();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  //   const { state, fetchSubscriptions } = useSubscriptionsHandler();

  useEffect(() => {
    // fetchSubscriptions();
  }, []);

  const handleCardSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const response = await bc.payment().addCard(values);
      if (response.ok) {
        setIsSuccess(true);
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      toast({ title: 'Failed to update card', status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          <CardForm onSubmit={handleCardSubmit} isSubmitting={isSubmitting} />
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

export default ChangeCardPage;
