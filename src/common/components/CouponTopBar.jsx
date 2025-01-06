import { Box, Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Text from './Text';
import Timer from './Timer';
import NextChakraLink from './NextChakraLink';
import useStyle from '../hooks/useStyle';
import useSignup from '../store/actions/signupAction';

function CouponTopBar() {
  const { t } = useTranslation('course');
  const { hexColor } = useStyle();
  const { getPriceWithDiscount, setSelfAppliedCoupon, state } = useSignup();
  const { selfAppliedCoupon } = state;

  // Since we are not showing the price after discount, we can give the price as cero
  const { discount } = getPriceWithDiscount(0, selfAppliedCoupon);

  const differenceInWeeks = (date1, date2) => {
    // Convert both dates to milliseconds
    const date1Ms = date1.getTime();
    const date2Ms = date2.getTime();

    // Calculate the difference in milliseconds
    const differenceMs = Math.abs(date1Ms - date2Ms);

    // Convert the difference to weeks
    // const differenceWeeks = Math.floor(differenceMs / (1000 * 60 * 60 * 24 * 7));
    const differenceWeeks = differenceMs / (1000 * 60 * 60 * 24 * 7);

    return differenceWeeks;
  };

  const addWeeks = (date, weeks) => {
    date.setDate(date.getDate() + 7 * weeks);
    return date;
  };

  if (!selfAppliedCoupon) return null;

  const initialReferenceDate = new Date('2024-04-01');
  const now = new Date();
  const referenceDate = addWeeks(
    initialReferenceDate,
    Math.ceil(differenceInWeeks(initialReferenceDate, now) / 2) * 2,
  );

  return (
    <Box
      background={hexColor.green}
      padding="8px 10px"
    >
      <Box maxWidth="1280px" margin="auto" display="flex" justifyContent="space-between" alignItems="center">
        <Flex alignItems="center" gap="10px" flexDirection="row" flexWrap="wrap" grow={1} justifyContent="center">
          <Text color="#FFF" fontSize="18px" fontFamily="inter">
            {t('coupon-bar.headline', { discount })}
          </Text>
          <Flex gap="10px">
            <Text color="#FFF" fontSize="17px" fontFamily="inter" fontWeight="900">
              {t('coupon-bar.ends-in', { time: '' })}
            </Text>
            <Timer
              autoRemove
              variant="text"
              startingAt={referenceDate.toISOString()}
              onFinish={() => setSelfAppliedCoupon(null)}
              color="white"
              background="none"
              fontSize="17px"
              fontFamily="inter"
              fontWeight="900"
            />
          </Flex>
        </Flex>
        <NextChakraLink
          href="#pricing"
          variant="default"
          background="white"
          padding="8px"
          color={hexColor.green}
          borderRadius="3px"
          fontWeight="bold"
        >
          <Text size="auto" style={{ textWrap: 'nowrap' }}>
            {t('coupon-bar.see-prices')}
            {' '}
            →
          </Text>
        </NextChakraLink>
      </Box>
    </Box>
  );
}

export default CouponTopBar;
