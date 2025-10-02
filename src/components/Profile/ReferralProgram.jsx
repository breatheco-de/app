import { Box, Button, Heading, Switch, Flex, useDisclosure } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Text from '../Text';
import useStyle from '../../hooks/useStyle';
import bc from '../../services/breathecode';
import Icon from '../Icon';
import useCustomToast from '../../hooks/useCustomToast';
import ShareReferralModal from '../ShareReferralModal';
import CouponInput from '../ReferralCouponInput';

function Coupon({ coupon, getDiscountText, handleAutoToggle }) {
  const { borderColor2, hexColor } = useStyle();
  const [checked, setChecked] = useState(coupon?.auto || false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation('profile');

  const handleSwitchChange = async () => {
    setIsLoading(true);
    const previousValue = checked;
    try {
      const newAutoValue = await handleAutoToggle();
      setChecked(newAutoValue);
    } catch (error) {
      console.error('Error updating coupon auto setting:', error);
      setChecked(previousValue);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box width="100%" height="auto" borderRadius="17px" border="1px solid" borderColor={borderColor2} p="20px">
      <Box display="flex" flexDirection="column" gridGap="20px">
        <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems="center">
          <Box display="flex" width="100%" alignItems="center" pb="8px">
            <Box minWidth="48px" minHeight="48px" display="flex" justifyContent="center" alignItems="center" backgroundColor="blue.default" borderRadius="50px" marginRight="10px">
              <Text fontSize="21px" color="white">
                $
              </Text>
            </Box>
            <Box>
              <Text size="sm">
                {
                  coupon?.discount_type === 'FIXED_PRICE' ? t('discount-type-fixed-amount') : t('discount-type-percentage')
                }
              </Text>
              <Text fontWeight="600" size="md">
                {getDiscountText}
              </Text>
            </Box>
          </Box>
          <Box width={{ base: '100%', md: 'fit-content' }}>
            <CouponInput coupon={coupon?.slug} width={{ md: '270px', lg: '425px' }} />
            <Box display="flex" mt="12px">
              {coupon?.is_valid ? (
                <>
                  <Box position="relative" display="flex" alignItems="center" width="fit-content">
                    <Switch
                      padding="1px"
                      isChecked={checked}
                      isDisabled={isLoading}
                      onChange={handleSwitchChange}
                      sx={{
                        '.chakra-switch__thumb': {
                          width: '14px',
                          height: '14px',
                          margin: '1px',
                          zIndex: '5',
                        },
                        '.chakra-switch__thumb[data-checked]': {
                          transform: 'translateX(24px)',
                        },
                        '.chakra-switch__thumb:not([data-checked])': {
                          bg: 'gray.default',
                        },
                        '.chakra-switch__track': {
                          width: '39px',
                          padding: '1px',
                          border: '1px solid',
                          borderColor: 'transparent',
                        },
                        '.chakra-switch__track[data-checked]': {
                          bg: 'blue.default',
                        },
                        '.chakra-switch__track:not([data-checked])': {
                          bg: 'none',
                          border: '1px solid',
                          borderColor: 'gray.default',
                        },
                        '.chakra-switch__input:focus + .chakra-switch__track': {
                          boxShadow: 'none',
                        },
                      }}
                    />
                    {checked ? (
                      <Box position="absolute" ms="3.5px" cursor="pointer" display="flex" alignItems="center" justifyContent="center" pointerEvents="none">
                        <Icon icon="circle-check" size="15px" color="white" />
                      </Box>
                    ) : (
                      <Box position="absolute" right="0" me="4px" cursor="pointer" display="flex" alignItems="center" justifyContent="center" pointerEvents="none">
                        <Icon icon="closeRounded" size="15px" color="#FFBEBE" />
                      </Box>
                    )}
                  </Box>
                  <Box display="flex" alignItems="center" ms="8px">
                    {checked ? (
                      <Text color="blue.default" fontSize="15px" fontWeight="500">{t('coupon-auto-apply-next-renewal')}</Text>
                    ) : (
                      <Text color="gray.500" fontSize="15px" fontWeight="500">{t('coupon-click-to-auto-apply')}</Text>
                    )}
                  </Box>
                </>
              ) : (
                <Box display="flex" alignItems="center" ms="8px">
                  <Box cursor="pointer" display="flex" backgroundColor={hexColor.greenLight} padding="3px" borderRadius="50px" alignItems="center" justifyContent="center" pointerEvents="none">
                    <Icon icon="checked2" size="8px" color="white" />
                  </Box>
                  <Text color={hexColor.greenLight} fontSize="15px" fontWeight="500" ms="8px">{t('coupon-already-used')}</Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
Coupon.propTypes = {
  coupon: PropTypes.shape({
    slug: PropTypes.string,
    auto: PropTypes.bool,
    is_valid: PropTypes.bool,
    discount_type: PropTypes.string,
    discount_value: PropTypes.number,
  }),
  getDiscountText: PropTypes.string.isRequired,
  handleAutoToggle: PropTypes.func.isRequired,
};

Coupon.defaultProps = {
  coupon: null,
};

function ReferralProgram() {
  const { t } = useTranslation('profile');
  const { hexColor, borderColor2 } = useStyle();
  const [couponData, setCouponData] = useState(null);
  const [userCouponsData, setUserCouponsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { createToast } = useCustomToast();

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const [couponResponse, userCouponResponse] = await Promise.all([
          bc.payment().getMyCoupon(),
          bc.payment().getMyUserCoupons(),
        ]);
        const couponInfo = couponResponse?.data?.[0];
        const userCouponsInfo = userCouponResponse.data;
        if (couponResponse?.data?.length > 0) {
          setCouponData(couponInfo);
        }
        if (userCouponResponse?.data?.length > 0) {
          setUserCouponsData(userCouponsInfo);
        }
      } catch (error) {
        console.error('Error fetching referral coupon:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupon();
  }, []);

  const handleAutoToggle = async (couponSlug) => {
    try {
      const response = await bc.payment().updateCoupon(couponSlug);
      if (response.status < 400) {
        const data = await response.data;
        return data.auto;
      }
      throw new Error('Error updating coupon');
    } catch (error) {
      console.error('Error updating coupon:', error);
      createToast({
        position: 'top',
        title: 'Error updating coupon',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Box width="100%" height="auto" borderRadius="17px" border="1px solid" borderColor={borderColor2} p="30px">
        <Text fontSize="15px" fontWeight="700" pb="18px">
          {t('referral-program')}
        </Text>
        <Text fontSize="14px" color="gray.500">
          {t('coupon-loading')}
        </Text>
      </Box>
    );
  }

  const getDiscountText = (userCoupon) => {
    if (!userCoupon?.discount_value || !userCoupon?.discount_type) return '';
    if (userCoupon.discount_type === 'PERCENT_OFF') {
      const percentage = Math.round(userCoupon.discount_value * 100);
      return `${percentage}${t('coupon-percent-of-payment')}`;
    }

    if (userCoupon.discount_type === 'FIXED_PRICE') {
      const fixedPrice = Math.round(userCoupon.discount_value);
      return `US$${fixedPrice} ${t('coupon-of-any-payment')}`;
    }

    return '';
  };

  const calculateMoneyEarned = () => {
    if (!userCouponsData || userCouponsData.length === 0) return 0;
    let totalEarned = 0;

    userCouponsData.forEach((userCoupon) => {
      const wasUsed = userCoupon.is_valid === false;
      if (wasUsed) {
        if (userCoupon.discount_type === 'FIXED_PRICE') {
          const discountAmount = userCoupon.discount_value || 0;
          totalEarned += discountAmount;
        } else if (userCoupon.discount_type === 'FIXED') {
          const discountAmount = userCoupon.discount_value || 0;
          totalEarned += discountAmount;
        }
      }
    });

    return Math.round(totalEarned);
  };

  return (
    <>
      <Flex justify="space-between" alignItems="center" flexDirection={{ base: 'column', sm: 'row' }} gap="20px">
        <Box width="224px" border="1px solid" borderColor={borderColor2} borderRadius="8px" padding={{ base: '7px', md: '12px' }}>
          <Text fontSize="17px" color={hexColor.blue2}>{t('referral-money-earned')}</Text>
          <Flex ms="8px" alignItems="center">
            <Text fontSize="28px" height="x" fontWeight="700" color={hexColor.blueDefault}>$</Text>
            <Text fontSize="24px" color={hexColor.blue2} fontWeight="700" ms="8px">{calculateMoneyEarned()}</Text>
          </Flex>
        </Box>
        <Flex justify="c">
          <Box>
            <Button
              bg="blue.default"
              color="white"
              fontSize="15px"
              paddingX="8px"
              paddingY="24px"
              aria-label="Referir a un amigo y ganar dinero"
              onClick={onOpen}
              _active={{
                backgroundColor: 'blue.default',
              }}
              _hover={{
                backgroundColor: 'blue.default',
              }}
            >
              <Icon icon="share" size="32px" me="8px" />
              {t('referral-refer-friend-button')}
            </Button>
            <Text maxWidth="270px" wordWrap="break-word" lineHeight="1.4" fontSize="12px">
              {t('referral-share-description')}
            </Text>
          </Box>
        </Flex>
      </Flex>
      <Heading as="h1" fontWeight="500" mt="10px">
        {t('referral-rewards-activity')}
      </Heading>
      <Box display="flex" flexDirection="column" gridGap="20px">
        {
          userCouponsData?.length > 0 ? (
            userCouponsData?.map((rewardCoupon) => (
              <Coupon
                key={rewardCoupon.id}
                coupon={rewardCoupon}
                getDiscountText={getDiscountText(rewardCoupon)}
                handleAutoToggle={() => handleAutoToggle(rewardCoupon.slug)}
              />
            ))
          ) : (
            <Text fontSize="15px" fontWeight="400" pb="6px">
              {t('no-reward-coupons')}
            </Text>
          )
        }
      </Box>
      <ShareReferralModal
        couponData={couponData}
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
      />
    </>
  );
}

export default ReferralProgram;
