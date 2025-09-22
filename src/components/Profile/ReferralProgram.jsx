import { Box, Button, Input, InputGroup, InputRightElement, Heading, Switch, Flex, Grid, Stack, useDisclosure } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Text from '../Text';
import useStyle from '../../hooks/useStyle';
import bc from '../../services/breathecode';
import Icon from '../Icon';
import useCustomToast from '../../hooks/useCustomToast';
import { parseQuerys } from '../../utils/url';
import SimpleModal from '../SimpleModal';
import useSocialShare from '../../hooks/useSocialShare';

function CouponInput({ coupon, width }) {
  const { createToast } = useCustomToast({ toastId: 'referral-coupon' });
  const { t } = useTranslation('profile');
  const { lightColor } = useStyle();
  const copyToClipboard = async (couponSlug) => {
    try {
      await navigator.clipboard.writeText(couponSlug);
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
  return (
    <InputGroup size="md" width={width} display="flex" justifyContent="space-between">
      <Input
        value={coupon}
        isReadOnly
        color={lightColor}
        borderColor="blue.default"
        borderRadius="3px"
        height="50px"
        cursor="pointer"
        textOverflow="ellipsis"
        overflow="hidden"
        whiteSpace="nowrap"
        marginRight="20px"
        onClick={() => copyToClipboard(coupon)}
      />
      <InputRightElement width="50px" height="50px" display="flex" alignItems="center" justifyContent="center" borderRightRadius="3px" backgroundColor="blue.default">
        <Button
          size="sm"
          variant="solid"
          background="blue.default"
          color="gray.800"
          onClick={() => copyToClipboard(coupon)}
          minWidth="auto"
          padding="6px"
          height="32px"
          _hover={{ color: 'none' }}
        >
          <Icon icon="copy" size="25px" />
        </Button>
      </InputRightElement>
    </InputGroup>
  );
}

function Coupon({ coupon, getDiscountText, handleAutoToggle }) {
  const { borderColor2, hexColor } = useStyle();
  const [checked, setChecked] = useState(coupon?.auto || false);
  const { t } = useTranslation('profile');

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
                      defaultChecked={checked}
                      onChange={() => {
                        setChecked(!checked);
                        handleAutoToggle();
                      }}
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

CouponInput.propTypes = {
  coupon: PropTypes.string.isRequired,
  width: PropTypes.string,
};

CouponInput.defaultProps = {
  width: '100%',
};

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
  const { hexColor, borderColor2, lightColor, modal } = useStyle();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [couponData, setCouponData] = useState(null);
  const [userCouponData, setUserCouponData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLink, setCheckoutLink] = useState('null');
  const createToast = useCustomToast();

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const [couponResponse, userCouponResponse] = await Promise.all([
          bc.payment().getMyCoupon(),
          bc.payment().getMyUserCoupons(),
        ]);
        if (couponResponse?.data?.length > 0) {
          const couponInfo = couponResponse.data[0];
          setCouponData(couponInfo);
        }
        if (userCouponResponse?.data?.length > 0) {
          const userCouponInfo = userCouponResponse.data;
          setUserCouponData(userCouponInfo);
        }
        const baseUrl = process.env.DOMAIN_NAME || '';
        const queryParams = parseQuerys({ plan: couponData?.plans[0]?.slug || '4geeks-plus-subscription', coupon: couponData?.slug });
        setCheckoutLink(`${baseUrl}/checkout${queryParams}`);
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
      await bc.payment().updateCoupon(couponSlug);
    } catch (error) {
      console.error('Error updating coupon:', error);
      createToast({
        position: 'top',
        title: 'Error updating coupon',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Hook para compartir en redes sociales
  const { socials } = useSocialShare({
    type: 'referral',
    shareMessage: t('referral-share-message', { coupon: couponData?.slug }),
  });

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

  if (!couponData) {
    return (
      <Text fontSize="15px" fontWeight="700" pb="18px">{t('no-referral-coupon')}</Text>
    );
  }

  const getDiscountText = (userCoupon) => {
    if (!userCoupon?.discount_value || !userCoupon?.discount_type) return '';
    if (userCoupon.discount_type === 'PERCENT_OFF') {
      const percentage = Math.round(userCoupon.discount_value * 100);
      return `${percentage}${t('coupon-percent-of-payment')}`;
    }

    if (userCoupon.discount_type === 'FIXED_PRICE') {
      return `US$${userCoupon.discount_value} ${t('coupon-of-any-payment')}`;
    }

    return '';
  };

  const calculateMoneyEarned = () => {
    if (!userCouponData || userCouponData.length === 0) return 0;

    let totalEarned = 0;

    userCouponData.forEach((userCoupon) => {
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
          userCouponData?.length > 0 ? (
            userCouponData?.map((rewardCoupon) => (
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
      <SimpleModal
        isOpen={isOpen}
        onClose={onClose}
        size={{ sm: 'xl', md: '3xl' }}
        isCentered
        title={t('referral-modal-title')}
        backgroundColor={modal.background}
        headerStyles={{
          fontSize: '15px',
          color: lightColor,
          textAlign: 'center',
          letterSpacing: '0.05em',
          fontWeight: '900',
          textTransform: 'uppercase',
        }}
        bodyStyles={{ pb: 6 }}
      >
        <Grid templateColumns={{ base: '1fr', md: '57% 43%' }} gridGap="13px" mt="20px">
          <Box display="flex" flexDirection="column" gridGap="20px">
            <Text fontSize="16px">
              {t('referral-share-coupon-text')}
            </Text>
            <CouponInput coupon={couponData?.slug} />
            <Text fontSize="16px">
              {t('referral-share-link-text')}
            </Text>
            <CouponInput coupon={checkoutLink} />
            <Stack
              display={socials.length <= 2 ? 'flex' : 'grid'}
              gridTemplateColumns={`repeat(${socials.length}, minmax(min(5rem, 100%), 1fr))`}
              justifyItems="center"
              justifyContent={socials.length <= 2 && 'center'}
              flexDirection={socials.length <= 2 && 'row'}
              gridGap={socials.length <= 2 && '3rem'}
              width="100%"
            >
              {socials.map((social) => (
                <Box key={social.name} style={{ margin: '0px' }} textAlign="center" display="flex" flexDirection="column" gridGap="6px">
                  <Button
                    onClick={() => {
                      if (social.target === 'popup') {
                        window.open(social.href, 'popup', 'width=600,height=600,scrollbars=no,resizable=no');
                      } else {
                        window.open(social.href, '_blank');
                      }
                    }}
                    minWidth={{ base: '60px', md: '68px' }}
                    minHeight={{ base: '60px', md: '68px' }}
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="35px"
                    backgroundColor={modal.featuredBackground}
                    _hover={{
                      backgroundColor: 'gray.100',
                    }}
                    _active={{
                      backgroundColor: 'gray.100',
                    }}
                    style={{ margin: '0px' }}
                    padding="0"
                  >
                    <Icon icon={social.name} color={social.color} width="36px" height="36px" />
                  </Button>
                  <Text fontSize="12px" marginBottom="5px">
                    {social.label}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Box>
          <Box backgroundColor={modal.featuredBackground} borderRadius="17px" padding="16px">
            <Text fontSize="15px" fontWeight="700" pb="12px">
              {t('how-it-works')}
            </Text>
            <Box display="flex" flexDirection="column" gridGap="12px">
              <Text fontSize="13px" lineHeight="1.5">
                {t('referral-step-1')}
              </Text>
              <Text fontSize="13px" lineHeight="1.5">
                {t('referral-step-2')}
              </Text>
              <Text fontSize="13px" lineHeight="1.5">
                {t('referral-step-3')}
              </Text>
              <Text fontSize="13px" lineHeight="1.5">
                {t('referral-step-4')}
              </Text>
            </Box>
          </Box>
        </Grid>
      </SimpleModal>
    </>
  );
}

export default ReferralProgram;
