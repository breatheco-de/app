import React, { useState } from 'react';
import {
  Box,
  Flex,
  Skeleton,
  Divider,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import useStyle from '../../hooks/useStyle';
import useRenewal from './useRenewal';
import useCheckout from '../checkout/useCheckout';
import signupAction from '../../store/actions/signupAction';
import useCustomToast from '../../hooks/useCustomToast';
import Text from '../../components/Text';
import Heading from '../../components/Heading';
import Icon from '../../components/Icon';
import AcordionList from '../../components/AcordionList';
import PaymentMethods from '../../components/Checkout/PaymentMethods';
import asPrivate from '../../context/PrivateRouteWrapper';

function Renew() {
  const { t } = useTranslation('signup');
  const router = useRouter();
  const { entity_id: entityId } = router.query;
  const { backgroundColor, hexColor, backgroundColor3 } = useStyle();
  const { state } = signupAction();
  const { selectedPlan } = state;
  const { createToast } = useCustomToast({ toastId: 'renewal' });

  const [, setShowPaymentDetails] = useState(false);

  const onPaymentSuccess = () => {
    createToast({
      position: 'top',
      status: 'success',
      title: t('payment-success'),
      duration: 5000,
      isClosable: true,
    });
    router.push('/choose-program');
  };

  const {
    originalPlan,
    checkInfoLoader,
    currencySymbol,
    allCoupons,
    processedPrice,
    renderPlanDetails,
    getDiscountValue,
    calculateTotalPrice,
    fixedCouponExist,
  } = useCheckout();

  const {
    isLoadingSubscription,
    handleRenewalPayment,
    handleCoinbaseRenewalPayment,
  } = useRenewal();

  if (isLoadingSubscription) {
    return (
      <Box
        p={{ base: '0 0', md: '0' }}
        background={backgroundColor3}
        position="relative"
        minHeight="85vh"
      >
        <Flex
          display="flex"
          flexDirection={{ base: 'column-reverse', md: 'row' }}
          minHeight="85vh"
          maxWidth="1640px"
          margin="0 auto"
        >
          <Box
            flex="1"
            p={{ base: '20px', md: '40px' }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Skeleton height="400px" width="100%" />
          </Box>
          <Box
            flex="1"
            p={{ base: '20px', md: '40px' }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Skeleton height="400px" width="100%" />
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      p={{ base: '0 0', md: '0' }}
      background={backgroundColor3}
      position="relative"
      minHeight="auto"
    >
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
          maxWidth={{ base: '100%', md: '50%' }}
          overflow="auto"
        >
          <Box display="flex" height="100%" flexDirection="column" margin={{ base: '0 1rem', lg: '0 auto' }} gridGap="30px" position="relative">
            <Box display="flex" width={{ base: 'auto', lg: '490px' }} height="auto" flexDirection="column" minWidth={{ base: 'auto', md: '100%' }} background={backgroundColor} p={{ base: '20px 0', md: '30px 0' }} borderRadius="15px">
              <PaymentMethods
                entityId={entityId}
                setShowPaymentDetails={setShowPaymentDetails}
                onPaymentSuccess={onPaymentSuccess}
                handleRenewalPayment={handleRenewalPayment}
                handleCoinbaseRenewalPayment={handleCoinbaseRenewalPayment}
              />
            </Box>
          </Box>
        </Flex>

        <Flex
          flexDirection="column"
          alignItems="center"
          padding={{ base: '0 auto', md: '0 3rem' }}
          position="relative"
          flex={{ base: '1', md: '0.5' }}
          style={{ flexShrink: 0, flexGrow: 1 }}
          overflow="auto"
          overflowX="hidden"
          maxWidth={{ base: '100%', md: '50%' }}
        >
          <Flex
            display="flex"
            flexDirection="column"
            width={{ base: 'auto', md: '100%' }}
            maxWidth="490px"
            margin={{ base: '2rem 10px 2rem 10px', md: '6.2rem 0' }}
            height="100%"
            zIndex={10}
          >
            {checkInfoLoader && (
              <Skeleton height="350px" width="490px" borderRadius="11px" zIndex={10} opacity={1} />
            )}
            {!checkInfoLoader && originalPlan?.title && (
              <Flex
                alignItems="start"
                flexDirection="column"
                gridGap="10px"
                padding="16px"
                borderRadius="22px"
                background={backgroundColor}
              >
                <Text size="18px">
                  {t('you-are-getting')}
                </Text>

                <Flex gridGap="7px" width="full">
                  <Flex flexDirection="column" gridGap="7px" justifyContent="center" width="100%">
                    <Heading fontSize="24px" display="flex" alignItems="center" gap="10px">
                      <Icon icon="4Geeks-avatar" width="35px" height="35px" maxHeight="35px" borderRadius="50%" background="blue.default" />
                      {originalPlan?.title.split(' ').map((word) => {
                        const firstLetter = word.match(/[a-zA-Z]/);
                        if (!firstLetter) return word;
                        const { index } = firstLetter;
                        return word.slice(0, index) + word.charAt(index).toUpperCase() + word.slice(index + 1);
                      }).join(' ')}
                    </Heading>

                    <Flex justifyContent="space-between" width="full" alignItems="center">
                      {renderPlanDetails() && (
                        <Text size="16px" color="green.400">
                          {renderPlanDetails()}
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                </Flex>

                <Divider borderBottomWidth="2px" />

                <Flex flexDirection="column" gridGap="4px" width="100%" mt="1rem">
                  {originalPlan?.accordionList?.length > 0 && (
                    <AcordionList
                      list={originalPlan?.accordionList}
                      leftIcon="checked2"
                      iconColor={hexColor.blueDefault}
                      border="none"
                      containerStyles={{ _hover: 'none' }}
                    />
                  )}
                </Flex>

                  {selectedPlan && (
                    <>
                      <Flex justifyContent="space-between" width="100%" padding="3rem 0px 0">
                        <Text size="18px" color="currentColor" lineHeight="normal">
                          Subtotal:
                        </Text>
                        <Text size="18px" color="currentColor" lineHeight="normal">
                          {selectedPlan?.price <= 0
                            ? selectedPlan?.priceText
                            : `${currencySymbol}${selectedPlan?.price?.toFixed(2)} ${selectedPlan?.currency?.code}`}
                        </Text>
                      </Flex>

                      <Divider margin="6px 0" />
                      {allCoupons?.length > 0 && allCoupons.map((coup) => (
                        <Flex key={coup.slug} direction="row" justifyContent="space-between" w="100%" marginTop="10px">
                          <Text size="lg">{coup?.slug}</Text>
                          <Box borderRadius="4px" padding="5px" background={getDiscountValue(coup) ? hexColor.greenLight2 : ''}>
                            <Text color={hexColor.green} fontWeight="700">
                              {getDiscountValue(coup)}
                            </Text>
                          </Box>
                        </Flex>
                      ))}

                      <Divider margin="6px 0" />

                      <Flex justifyContent="space-between" width="100%">
                        <Text size="18px" color="currentColor" lineHeight="normal">
                          {selectedPlan?.period !== 'ONE_TIME' ? t('total-now') : t('total')}
                        </Text>
                        <Flex gridGap="1rem">
                          {allCoupons?.length > 0 && (
                            <Text size="18px" color="currentColor" textDecoration="line-through" opacity="0.5" lineHeight="normal">
                              {`${currencySymbol}${selectedPlan?.price?.toFixed(2)}`}
                            </Text>
                          )}
                          <Text size="18px" color="currentColor" lineHeight="normal">
                            {selectedPlan?.price <= 0
                              ? selectedPlan?.priceText
                              : `${currencySymbol}${processedPrice?.price?.toFixed(2)} ${selectedPlan?.currency?.code}`}
                          </Text>
                        </Flex>
                      </Flex>
                      {selectedPlan?.period !== 'ONE_TIME' && selectedPlan?.price > 0 && (
                        <Flex justifyContent="space-between" width="100%">
                          <Text size="18px" color="currentColor" lineHeight="normal">
                            {t('after-all-payments')}
                          </Text>
                          <Text size="18px" color="currentColor" lineHeight="normal">
                            {selectedPlan.price <= 0
                              ? selectedPlan.priceText
                              : `${currencySymbol}${calculateTotalPrice()} ${selectedPlan.currency?.code}`}
                          </Text>
                        </Flex>
                      )}
                      {fixedCouponExist && (
                        <Text fontWeight="300" size="xs" marginTop="10px">
                          {t('fixed-price-disclaimer')}
                        </Text>
                      )}
                    </>
                  )}

              </Flex>
            )}
            {!checkInfoLoader && !originalPlan?.title && (
              <Skeleton height="350px" width="490px" borderRadius="11px" zIndex={10} opacity={1} />
            )}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

export default asPrivate(Renew);
