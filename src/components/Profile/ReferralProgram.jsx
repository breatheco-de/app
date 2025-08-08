import {
  Box,
  Button,
  Input,
  Flex,
  VStack,
  useDisclosure,
  Switch,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import Text from '../Text';
import Heading from '../Heading';
import useStyle from '../../hooks/useStyle';
import bc from '../../services/breathecode';
import Icon from '../Icon';
import useCustomToast from '../../hooks/useCustomToast';
import SimpleModal from '../SimpleModal';

function ReferralProgram() {
  const { t } = useTranslation('profile');
  const { borderColor2, hexColor, backgroundColor } = useStyle();
  const { createToast } = useCustomToast({ toastId: 'referral-coupon' });
  const [coupon, setCoupon] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [moneyEarned] = useState(40);
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      createToast({
        position: 'top',
        title: t('coupon-copied'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getDiscountValue = (couponInfo) => {
    if (!couponInfo?.discount_value || !couponInfo?.discount_type) return '';

    if (couponInfo.discount_type === 'PERCENT_OFF') {
      const percentage = Math.round(couponInfo.discount_value * 100);
      return `${percentage}%`;
    }

    if (couponInfo.discount_type === 'FIXED_PRICE') {
      return `$${couponInfo.discount_value}`;
    }

    return '';
  };

  const getCouponStatus = (couponInfo) => {
    if (couponInfo?.used) {
      return {
        text: 'This coupon was already used, learn more.',
        color: 'green.500',
        icon: 'checked2',
      };
    }
    if (couponInfo?.auto_apply) {
      return {
        text: 'Auto-apply on the next renewal, learn more.',
        color: 'blue.500',
        icon: 'radio-selected',
      };
    }
    return {
      text: 'Click to auto-apply, learn more.',
      color: 'gray.500',
      icon: 'radio',
    };
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

  const signupLink = `https://4geeks.com/checkout?plan=c&coupon=${coupon}`;
  const shareUrl = encodeURIComponent(signupLink);
  const shareText = encodeURIComponent('Join me at 4Geeks!');

  return (
    <>
      <VStack spacing={6} align="stretch">
        {/* Money Earned Section with Button */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'stretch', md: 'flex-start' }}
          gap={4}
        >
          {/* Money Earned Card */}
          <Box
            bg={backgroundColor}
            borderRadius="12px"
            p={6}
            border="1px solid"
            borderColor={borderColor2}
            boxShadow="sm"
            width={{ base: '100%', md: 'auto' }}
            minWidth="200px"
          >
            <Text fontSize="14px" fontWeight="600" color="gray.600" mb={2}>
              Money Earned
            </Text>
            <Flex align="baseline" gap={1}>
              <Text fontSize="32px" fontWeight="700" color={hexColor.blueDefault}>
                $
              </Text>
              <Text fontSize="32px" fontWeight="700" color={hexColor.blackDefault}>
                {moneyEarned}
              </Text>
            </Flex>
          </Box>

          {/* Refer a friend button */}
          <VStack align="stretch" spacing={2} width={{ base: '100%', md: 'auto' }}>
            <Button
              bg={hexColor.blueDefault}
              color="white"
              borderRadius="12px"
              p={6}
              height="auto"
              minHeight="60px"
              onClick={onOpen}
              _hover={{
                bg: 'blue.600',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out',
              }}
              leftIcon={<Icon icon="share" width="20px" height="20px" />}
            >
              <Text fontSize="16px" fontWeight="600">
                Refer a friend and make money
              </Text>
            </Button>
            <Text fontSize="12px" color="gray.600" lineHeight="1.4" textAlign={{ base: 'center', md: 'left' }}>
              Share your coupon code with friends and family and make money while you learn.
              {' '}
              <Text as="span" textDecoration="underline" cursor="pointer" color={hexColor.blueDefault}>
                learn more
              </Text>
            </Text>
          </VStack>
        </Flex>

        {/* Rewards and coupon activity */}
        <Box>
          <Heading size="lg" mb={4}>
            Rewards and coupon activity
          </Heading>

          <VStack spacing={4} align="stretch">
            {/* Coupon Card */}
            <Box
              bg="white"
              borderRadius="12px"
              p={4}
              border="1px solid"
              borderColor={borderColor2}
              boxShadow="sm"
            >
              <Flex
                direction={{ base: 'column', md: 'row' }}
                justify="space-between"
                align={{ base: 'flex-start', md: 'flex-start' }}
                gap={4}
              >
                {/* Left side - Info */}
                <Flex alignItems="center" minHeight="64px" gap={3}>
                  <Box
                    bg={hexColor.blueDefault}
                    borderRadius="full"
                    width="32px"
                    height="32px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="16px" fontWeight="700" color="white">$</Text>
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="14px" fontWeight="400">
                      Fixed Amount
                    </Text>
                    <Text fontSize="12px" fontWeight="700" color="gray.600">
                      US$3 of any payment
                    </Text>
                  </VStack>
                </Flex>

                {/* Right side - Input and status */}
                <VStack align="stretch" spacing={2} width={{ base: '100%', md: '300px' }}>
                  <Flex border="2px solid" borderColor={hexColor.blueDefault} borderRadius="8px">
                    <Input
                      value={coupon}
                      isReadOnly
                      bg="gray.50"
                      borderColor="transparent"
                      borderRadius="6px 0 0 6px"
                      height="40px"
                      fontSize="12px"
                      border="none"
                      _focus={{
                        borderColor: 'transparent',
                        boxShadow: 'none',
                      }}
                    />
                    <Button
                      bg={hexColor.blueDefault}
                      color="white"
                      borderRadius="0 6px 6px 0"
                      height="40px"
                      minWidth="40px"
                      width="40px"
                      _hover={{
                        bg: 'blue.600',
                      }}
                      onClick={() => copyToClipboard(coupon)}
                    >
                      <Icon icon="copy" width="14px" height="14px" />
                    </Button>
                  </Flex>

                  <Flex align="center" gap={2}>
                    {couponData?.used ? (
                      <Icon icon="checked2" width="18px" height="18px" color="green.500" />
                    ) : (
                      <Switch
                        isChecked={!!couponData?.auto_apply}
                        colorScheme="blue"
                        size="md"
                        isReadOnly
                        sx={{
                          '.chakra-switch__track': {
                            bg: couponData?.auto_apply ? hexColor.blueDefault : 'gray.300',
                          },
                        }}
                      />
                    )}
                    <Text fontSize="11px" color={getCouponStatus(couponData).color}>
                      {getCouponStatus(couponData).text}
                    </Text>
                  </Flex>
                </VStack>
              </Flex>
            </Box>
          </VStack>
        </Box>
      </VStack>

      {/* Share Modal */}
      <SimpleModal
        isOpen={isOpen}
        onClose={onClose}
        title="SHARE AND MAKE MONEY"
        size="3xl" // o prueba con "2xl"
        headerStyles={{ textAlign: 'center' }}
      >
        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
          <Box width={{ base: '100%', md: '60%' }}>
            {/* Share coupon section */}
            <Box mb={4}>
              <Text fontSize="14px" fontWeight="600" mb={2}>
                Share this coupon with your friends
              </Text>
              <Flex border="2px solid" borderColor={hexColor.blueDefault} borderRadius="8px">
                <Input
                  value={coupon}
                  isReadOnly
                  bg="gray.50"
                  borderColor="transparent"
                  borderRadius="6px 0 0 6px"
                  height="40px"
                  fontSize="12px"
                  border="none"
                  width="100%"
                  _focus={{
                    borderColor: 'transparent',
                    boxShadow: 'none',
                  }}
                />
                <Button
                  bg={hexColor.blueDefault}
                  color="white"
                  borderRadius="0 6px 6px 0"
                  height="40px"
                  minWidth="40px"
                  width="40px"
                  _hover={{
                    bg: 'blue.600',
                  }}
                  onClick={() => copyToClipboard(coupon)}
                >
                  <Icon icon="copy" width="14px" height="14px" />
                </Button>
              </Flex>
            </Box>

            {/* Share signup link section */}
            <Box mb={4}>
              <Text fontSize="14px" fontWeight="600" mb={2}>
                Or share this signup link
              </Text>
              <Flex border="2px solid" borderColor={hexColor.blueDefault} borderRadius="8px">
                <Input
                  value={signupLink}
                  isReadOnly
                  bg="gray.50"
                  borderColor="transparent"
                  borderRadius="6px 0 0 6px"
                  height="40px"
                  fontSize="12px"
                  border="none"
                  width="100%"
                  _focus={{
                    borderColor: 'transparent',
                    boxShadow: 'none',
                  }}
                />
                <Button
                  bg={hexColor.blueDefault}
                  color="white"
                  borderRadius="0 6px 6px 0"
                  height="40px"
                  minWidth="40px"
                  width="40px"
                  _hover={{
                    bg: 'blue.600',
                  }}
                  onClick={() => copyToClipboard(signupLink)}
                >
                  <Icon icon="copy" width="14px" height="14px" />
                </Button>
              </Flex>
            </Box>

            {/* Social media icons */}
            <Flex justify="center" gap={4} my={4}>
              <Button
                borderRadius="full"
                p={3}
                bg="transparent"
                boxShadow="none"
                border="none"
                as="a"
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                _hover={{
                  bg: 'blue.50',
                  boxShadow: 'none',
                  border: 'none',
                }}
              >
                <Icon icon="twitter" width="24px" height="24px" color="#1DA1F2" />
              </Button>
              <Button
                borderRadius="full"
                p={3}
                bg="transparent"
                boxShadow="none"
                border="none"
                as="a"
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                _hover={{
                  bg: 'blue.50',
                  boxShadow: 'none',
                  border: 'none',
                }}
              >
                <Icon icon="facebook" width="24px" height="24px" color="#1877F3" />
              </Button>
              <Button
                borderRadius="full"
                p={3}
                bg="transparent"
                boxShadow="none"
                border="none"
                as="a"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                _hover={{
                  bg: 'blue.50',
                  boxShadow: 'none',
                  border: 'none',
                }}
              >
                <Icon icon="linkedin" width="24px" height="24px" color="#0A66C2" />
              </Button>
            </Flex>
          </Box>
          <Box width={{ base: '100%', md: '40%' }}>
            {/* How it works */}
            <Box bg="blue.50" borderRadius="12px" p={4}>
              <Text fontSize="14px" fontWeight="600" mb={3}>
                How it works
              </Text>
              <VStack align="start" spacing={2}>
                <Text fontSize="12px" color="gray.700">
                  1. Share your coupon code with friends and family
                </Text>
                <Text fontSize="12px" color="gray.700">
                  2. When someone buys the any subscription or self-paced program from 4Geeks.com, you can
                  {' '}
                  <Text as="span" fontWeight="700">
                    both get
                    {' '}
                    {getDiscountValue(couponData)}
                    {' '}
                    discount
                  </Text>
                  {' '}
                  on their 4Geeks.com purchase.
                </Text>
                <Text fontSize="12px" color="gray.700">
                  3. You can review your accumulated credits below this message.
                </Text>
                <Text fontSize="12px" color="gray.700">
                  4. The more people, the more credits you will receive!
                </Text>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </SimpleModal>
    </>
  );
}

export default ReferralProgram;
