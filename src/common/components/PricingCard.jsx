/* eslint-disable react/destructuring-assignment */
import { Box, Button, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import Icon from './Icon';
import { parseQuerys } from '../../utils/url';

export default function PricingCard({ item }) {
  const router = useRouter();
  const { hexColor } = useStyle();
  const planColors = {
    basic: {
      border: `1px solid ${hexColor.blueDefault}`,
      background: 'blue.default',
      featured: 'transparent',
    },
    pro: {
      border: `1px solid ${hexColor.yellowDefault}`,
      background: 'yellow.default',
      featured: 'yellow.light',
    },
  };
  const currentPropsColors = item.price > 0 ? planColors.pro : planColors.basic;
  const isFree = item.price === 0;
  const border = currentPropsColors?.border;
  const background = currentPropsColors?.background;
  const featured = currentPropsColors?.featured;

  const handlePlan = (plan) => {
    const qs = parseQuerys({
      plan: item?.plan,
      plan_id: plan?.plan_id,
    });
    console.log('clicked:plan:::', `/checkout${qs}`);
    // TOOD: Remove this after finished
    if (plan === 'a') {
      router.push(`/checkout${qs}`);
    }
  };

  return (
    <Flex
      maxWidth="410px"
      flexDirection="column"
      borderRadius="11px"
      border={border}
      width="100%"
      background="white"
      color="black"
    >
      <Flex padding="8px" flexDirection="column" gridGap="24px" background={featured}>
        {/* ------------- label ------------- */}
        <Box as="span" color="white" width="fit-content" padding="4px 1rem" fontSize="18px" fontWeight={700} background={background} borderRadius="22px">
          {item.price === 0 ? 'Basic' : 'Pro'}
        </Box>

        <Text fontSize="18px" fontWeight={700} color={isFree ? '' : 'yellow.default'} textAlign="center" style={{ textWrap: 'balance' }}>
          {item.price === 0
            ? 'Get ready to meet our academy'
            : 'Improve your skills with extra challenges and benefits.'}
        </Text>

        <Box>
          <Box fontSize="var(--heading-xl)" color="black" fontWeight={700} textAlign="center">
            {`$${item.price}`}
          </Box>
          <Text fontSize="14px" fontWeight={700} textAlign="center" pb="16px">
            {item.price === 0 ? 'Free forever' : 'Monthly '}
          </Text>

          <Button variant={isFree ? 'link' : 'default'} onClick={() => handlePlan(item)} display="flex" gridGap="10px" background={isFree ? '' : 'yellow.default'} fontSize="17px" width="100%" textAlign="center" padding="12px 24px">
            <Icon icon="rocket" width="16px" height="24px" style={{ transform: 'rotate(35deg)' }} />
            {isFree ? 'You already have it' : 'Get Pro'}
          </Button>
        </Box>
      </Flex>
    </Flex>
  );
}

PricingCard.propTypes = {
  item: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object])).isRequired,
};
