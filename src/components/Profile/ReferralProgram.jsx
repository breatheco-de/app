import { Box, Button, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import Text from '../Text';
import useStyle from '../../hooks/useStyle';
import bc from '../../services/breathecode';
import Icon from '../Icon';
import useCustomToast from '../../hooks/useCustomToast';

function ReferralProgram() {
  const { t } = useTranslation('profile');
  const { borderColor2, hexColor, lightColor } = useStyle();
  const { createToast } = useCustomToast({ toastId: 'referral-coupon' });
  const [coupon, setCoupon] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const response = await bc.payment().getMyCoupon();
        if (response?.data?.length > 0) {
          const couponInfo = response.data[0];
          setCoupon(couponInfo?.slug || '');
          setCouponData(couponInfo);
        }
      } catch (error) {
        console.error('Error fetching referral coupon:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupon();
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(coupon);
      createToast({
        position: 'top',
        title: t('coupon-copied'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to copy coupon:', error);
    }
  };

  if (isLoading) {
    return (
      <Box width="100%" height="auto" borderRadius="17px" border="1px solid" borderColor={borderColor2} p="30px">
        <Text fontSize="15px" fontWeight="700" pb="18px">
          {t('referral-program')}
        </Text>
        <Text fontSize="14px" color="gray.500">
          Loading...
        </Text>
      </Box>
    );
  }

  if (!coupon) {
    return null;
  }

  const getDiscountText = () => {
    if (!couponData?.discount_value || !couponData?.discount_type) return '';

    if (couponData.discount_type === 'PERCENT_OFF') {
      const percentage = Math.round(couponData.discount_value * 100);
      return `${percentage}% OFF for friends and family`;
    }

    if (couponData.discount_type === 'FIXED_PRICE') {
      return `$${couponData.discount_value} OFF for friends and family`;
    }

    return '';
  };

  return (
    <>
      <Text fontSize="15px" fontWeight="700" pb="18px">
        {t('referral-program')}
      </Text>
      <Box width="100%" height="auto" borderRadius="17px" border="1px solid" borderColor={borderColor2} p="30px">
        <Box display="flex" flexDirection="column" gridGap="20px">
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" pb="8px">
              <Text fontSize="14px" fontWeight="600">
                {t('referral-coupon')}
              </Text>
              {getDiscountText() && (
                <Box borderRadius="4px" padding="5px 8px" background="green.50">
                  <Text color="green.500" fontWeight="700" fontSize="12px">
                    {getDiscountText()}
                  </Text>
                </Box>
              )}
            </Box>
            <InputGroup size="md" width="fit-content" maxWidth="300px">
              <Input
                value={coupon}
                isReadOnly
                color={lightColor}
                borderColor="gray.default"
                borderRadius="3px"
                height="50px"
                width="fit-content"
                minWidth="200px"
                pr="50px"
                cursor="pointer"
                onClick={copyToClipboard}
                _focus={{
                  borderColor: hexColor.blueDefault,
                  boxShadow: `0 0 0 1px ${hexColor.blueDefault}`,
                }}
                _hover={{
                  borderColor: hexColor.blueDefault,
                }}
              />
              <InputRightElement width="40px" height="50px" display="flex" alignItems="center" justifyContent="center">
                <Button
                  size="sm"
                  variant="solid"
                  background="gray.300"
                  color="gray.800"
                  _hover={{
                    background: 'gray.400',
                    color: 'gray.900',
                  }}
                  _dark={{
                    background: 'gray.500',
                    color: 'gray.100',
                    _hover: {
                      background: 'gray.400',
                      color: 'white',
                    },
                  }}
                  onClick={copyToClipboard}
                  minWidth="auto"
                  padding="6px"
                  height="32px"
                >
                  <Icon icon="copy" width="16px" height="16px" />
                </Button>
              </InputRightElement>
            </InputGroup>
          </Box>

          <Box>
            <Text fontSize="14px" fontWeight="600" pb="12px">
              {t('how-it-works')}
            </Text>
            <Box display="flex" flexDirection="column" gridGap="8px">
              <Text fontSize="12px" color="gray.600" lineHeight="1.5">
                {t('referral-step-1')}
              </Text>
              <Text fontSize="12px" color="gray.600" lineHeight="1.5">
                {t('referral-step-2')}
              </Text>
              <Text fontSize="12px" color="gray.600" lineHeight="1.5">
                {t('referral-step-3')}
              </Text>
              <Text fontSize="12px" color="gray.600" lineHeight="1.5">
                {t('referral-step-4')}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default ReferralProgram;
