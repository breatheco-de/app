/* eslint-disable camelcase */
import {
  Box,
  Flex,
  UnorderedList,
  ListItem,
  Avatar,
  Image,
  Button,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import bc from '../../../services/breathecode';
import useAuth from '../../../hooks/useAuth';
import ServiceSummary from '../../../components/Checkout/ServiceSummary';
import signupAction from '../../../store/actions/signupAction';
import asPrivate from '../../../context/PrivateRouteWrapper';
import LoaderScreen from '../../../components/LoaderScreen';
import Text from '../../../components/Text';
import { toCapitalize, unSlugify } from '../../../utils';
import { BREATHECODE_HOST } from '../../../utils/variables';
import useStyle from '../../../hooks/useStyle';
import useSignup from '../../../hooks/useSignup';
import useSession from '../../../hooks/useSession';
import useSubscriptions from '../../../hooks/useSubscriptions';

function ServiceSlug() {
  const router = useRouter();
  const { t } = useTranslation('signup');
  const { query } = router;
  const { service_type, service_slug } = query;
  const { isAuthenticated, isLoading } = useAuth();
  const { areSubscriptionsFetched, allSubscriptions, isLoading: isSubscriptionsLoading } = useSubscriptions();
  const {
    state, setLoader, restartSignup,
  } = signupAction();
  const { handleServiceToConsume } = useSignup();
  const { service, loader, paymentStatus } = state;
  const { backgroundColor } = useStyle();
  const [serviceError, setServiceError] = useState(null);

  const { location } = useSession();

  const isPaymentSuccess = paymentStatus === 'success';

  const allowedServiceTypes = ['compilation', 'mentorship', 'event'];

  useEffect(() => {
    // Alert before leave the page if the user is in the payment process
    if (!isPaymentSuccess) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
    return () => {};
  }, [isPaymentSuccess]);

  const getServiceData = async () => {
    try {
      setLoader('plan', true);
      setServiceError(null);

      const currentSubscription = allSubscriptions?.find(
        (item) => (
          item?.selected_mentorship_service_set?.slug === service_slug
          || item?.selected_event_type_set?.slug === service_slug
        ),
      );

      const serviceTypesFields = {
        event: 'selected_event_type_set',
        mentorship: 'selected_mentorship_service_set',
      };

      const serviceData = currentSubscription?.[serviceTypesFields[service_type]];

      if (serviceData || allSubscriptions.length > 0) {
        let data;
        let resp;

        if (serviceData) {
          resp = await bc.payment({
            academy: Number(serviceData?.academy?.id),
            event_type_set: service_type === 'event' ? service_slug : undefined,
            mentorship_service_set: service_type === 'mentorship' ? service_slug : undefined,
            country_code: location?.countryShort,
          }).service().getAcademyService();

          [data] = resp.data;
        } else {
          resp = await bc.payment({
            academy: allSubscriptions[0].academy.id,
            country_code: location?.countryShort,
          }).service().getAcademyServiceBySlug(service_slug);
          data = resp.data;
        }

        if (resp.status >= 400) {
          const errorMessage = resp?.data?.detail || t('alert-message:something-went-wrong');
          throw new Error(errorMessage);
        }
        if (resp.data !== undefined && data) {
          handleServiceToConsume({
            ...data,
            serviceInfo: {
              type: service_type,
              ...serviceData,
            },
          });
        }
      }
    } catch (error) {
      const errorMessage = error?.message || t('alert-message:something-went-wrong');
      setServiceError(errorMessage);
    } finally {
      setLoader('plan', false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && areSubscriptionsFetched) {
      getServiceData();
    }
  }, [isAuthenticated, areSubscriptionsFetched, router.locale]);

  useEffect(() => {
    if (!allowedServiceTypes.includes(service_type)) router.push('/404');
    return () => {
      restartSignup();
    };
  }, []);

  if (loader.plan || isLoading || isSubscriptionsLoading) {
    return (
      <Box p={{ base: '0 0', md: '0' }} position="relative" height="100vh">
        <LoaderScreen />
      </Box>
    );
  }

  return (
    <Box p={{ base: '0 0', md: '0' }} minHeight="auto">
      <Flex
        display="flex"
        flexDirection={{
          base: 'column-reverse',
          md: 'row',
        }}
        minHeight={{ base: '320px', md: '85vh' }}
        maxWidth="1640px"
        margin="0 auto"
      >
        <Flex
          display="flex"
          flexDirection="column"
          gridGap="20px"
          background={backgroundColor}
          padding={{ base: '2rem 20px', md: '2rem 0 0 0' }}
          flex={{ base: '1', md: '0.5' }}
          style={{ flexShrink: 0, flexGrow: 1 }}
          overflow="auto"
        >
          {serviceError && (
            <Box display="flex" flexDirection="column" gridGap="24px" width="100%" padding="1rem 1.5rem" alignItems="center" justifyContent="center">
              <Image src="/static/images/avatar-for-transaction-failed.png" width={60} height={60} alt="Error" />
              <Text fontSize="18px" fontWeight="700" textAlign="center">
                {serviceError}
              </Text>

              <Flex gridGap="24px">
                <Button
                  variant="default"
                  onClick={() => {
                    setServiceError(null);
                    getServiceData();
                  }}
                >
                  {t('common:try-again')}
                </Button>
              </Flex>
            </Box>
          )}

          {service && (
            <ServiceSummary service={service} />
          )}

          {allSubscriptions.length === 0 && (
            <Box display="flex" flexDirection="column" gridGap="12px" width="100%">
              <Box display="flex" gridGap="12px" flexDirection="column" alignItems="center">
                <Text size="21px" fontWeight={700}>
                  {t('select-service-of-plan.subscription-not-found')}
                </Text>
                <Avatar src={`${BREATHECODE_HOST}/static/img/avatar-7.png`} border="3px solid" borderColor="blue.default" width="91px" height="91px" borderRadius="50px" />
                <Box display="flex" flexDirection="column" gridGap="10px">
                  <Text size="16px">
                    {t('select-service-of-plan.no-plan-found-for-service')}
                  </Text>
                  <UnorderedList display="flex" mb="14px" flexDirection="column" gridGap="4px" width="100%">
                    <ListItem fontSize="14px">
                      {toCapitalize(unSlugify(service_slug))}
                    </ListItem>
                  </UnorderedList>
                </Box>
              </Box>
            </Box>
          )}

        </Flex>
      </Flex>
    </Box>
  );
}

export default asPrivate(ServiceSlug);
