import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, Text, useToast, Flex, Button } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import useAuth from '../common/hooks/useAuth';
import bc from '../common/services/breathecode';
import CardForm from '../js_modules/checkout/CardForm';
import asPrivate from '../common/context/PrivateRouteWrapper';
import Icon from '../common/components/Icon';

function ChangeCardPage() {
  const router = useRouter();
  const toast = useToast();

  const { t } = useTranslation('payment');
  const { user } = useAuth();

  const [isSuccess, setIsSuccess] = useState(false);

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
        <Text fontSize="xl" fontWeight="bold" mb={4}>{t('change-card-info')}</Text>
        {!isSuccess ? (
          <CardForm onSubmit={handleCardSubmit} buttonText={t('change-card-info-action')} />
        ) : (
          <>
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
            <Button
              width="100%"
              variant="default"
              height="40px"
              mt="10px"
              onClick={() => router.push('/profile/subscriptions')}
            >
              {t('go-to-user-subs')}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}

export default asPrivate(ChangeCardPage);
