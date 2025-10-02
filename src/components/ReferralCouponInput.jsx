import { InputGroup, Input, InputRightElement, Button } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import useCustomToast from '../hooks/useCustomToast';
import useStyle from '../hooks/useStyle';

import Icon from './Icon';

function CouponInput({ coupon, ...rest }) {
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
    <InputGroup size="md" display="flex" justifyContent="space-between" {...rest}>
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

CouponInput.propTypes = {
  coupon: PropTypes.string.isRequired,
};

export default CouponInput;
