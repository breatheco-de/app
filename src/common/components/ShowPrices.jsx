/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import {
  Box, Button, Flex, Grid,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Heading from './Heading';
import Text from './Text';
import useSignup from '../../store/actions/signupAction';
import useStyle from '../hooks/useStyle';
import Icon from './Icon';
import MktTechnologies from './MktTechnologies';

function PlanButton({
  plan,
  isSelected,
  isFirst,
  isLast,
  onClick,
  getPlanLabel,
}) {
  return (
    <Button
      key={plan.plan_id}
      variant="unstyled"
      bg={isSelected ? 'blue.default2' : 'transparent'}
      color={isSelected ? 'white' : 'blue.default2'}
      size="sm"
      px={4}
      border="1px solid"
      borderRadius="0"
      borderLeft={isFirst ? '1px solid' : 'none'}
      borderRight={isLast ? '1px solid' : 'none'}
      borderColor="blue.default2"
      _first={{ borderLeftRadius: '4px' }}
      _last={{ borderRightRadius: '4px' }}
      _hover="none"
      onClick={onClick}
    >
      {getPlanLabel(plan)}
    </Button>
  );
}

function ShowPrices({
  data,
  title,
  subtitle,
  list,
  finance,
  onSelect,
  handleUpgrade,
  bullets,
}) {
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const { t } = useTranslation('profile');
  const { backgroundColor, lightColor } = useStyle();
  const router = useRouter();
  const { applyDiscountCouponsToPlans, state } = useSignup();
  const { selfAppliedCoupon } = state;

  const tiersTypes = {
    subscriptions: applyDiscountCouponsToPlans(list, selfAppliedCoupon) || data?.pricing.list || [],
    finance: applyDiscountCouponsToPlans(finance, selfAppliedCoupon) || data?.pricing.finance || [],
  };

  const allTiers = [...tiersTypes.subscriptions, ...tiersTypes.finance];
  const availablePlans = allTiers.filter((plan) => plan.show && !plan.isFreeTier);
  const selectedPlan = availablePlans.find((plan) => plan.plan_id === selectedPlanId) || availablePlans[0];
  const hasValidPrice = selectedPlan?.price !== undefined;

  const monthlyPlan = availablePlans.find((plan) => plan.period === 'MONTH');
  const yearlyPlan = availablePlans.find((plan) => plan.period === 'YEAR');
  const hasMonthlyAndYearly = monthlyPlan && yearlyPlan;
  const monthsSaved = hasMonthlyAndYearly ? Math.floor((monthlyPlan.price * 12 - yearlyPlan.price) / monthlyPlan.price) : 0;
  const shouldShowSavingsPill = selectedPlan?.period === 'YEAR' && hasMonthlyAndYearly && monthsSaved > 0;

  const getPlanLabel = (plan) => {
    switch (plan.period) {
      case 'YEAR':
        return t('subscription.payment_unit.anual');
      case 'MONTH':
        return t('subscription.payment_unit.month');
      case 'ONE_TIME':
        return t('subscription.upgrade-modal.one_payment');
      case 'FINANCING':
        return `${plan.how_many_months} ${t('common:word-connector.months')}`;
      default:
        return plan.title;
    }
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlanId(planId);
    const newPlan = availablePlans.find((plan) => plan.plan_id === planId);
    if (newPlan && onSelect) {
      onSelect(newPlan);
    }
  };

  const handlePlanUpgrade = () => {
    if (!selectedPlan) return;

    if (handleUpgrade === false) {
      const planType = selectedPlan?.type?.toLowerCase() || '';
      const planParam = planType.includes('trial')
        ? 'coding-introduction-free-trial'
        : 'coding-introduction-financing-options-one-payment';
      router.push(`/checkout?syllabus=coding-introduction&plan=${planParam}`);
    } else {
      handleUpgrade(selectedPlan);
    }
  };

  useEffect(() => {
    if (availablePlans.length > 0 && !selectedPlanId) {
      handlePlanSelect(availablePlans[0].plan_id);
    }
  }, []);

  return (
    <Flex flexDirection="column" mx="auto">
      <Box display="flex" flexDirection="column">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Heading as="h2" size="24px" color="blue.default2" flexGrow={1}>
            {title || data?.pricing['choose-plan']}
          </Heading>
          <Box display={{ base: 'none', md: 'flex' }} alignItems="center" bg="transparent" border="none">
            {availablePlans.map((plan, index) => (
              <PlanButton
                key={plan.plan_id}
                plan={plan}
                isSelected={selectedPlanId === plan.plan_id}
                isFirst={index === 0}
                isLast={index === availablePlans.length - 1}
                onClick={() => handlePlanSelect(plan.plan_id)}
                getPlanLabel={getPlanLabel}
              />
            ))}
          </Box>
        </Box>
        <Text fontSize="18px" color={lightColor}>
          {subtitle || data?.pricing?.subtitle}
        </Text>
        <Box display={{ base: 'flex', md: 'none' }} alignItems="center" bg="transparent" mt={4} justifyContent="center">
          {availablePlans.map((plan, index) => (
            <PlanButton
              key={plan.plan_id}
              plan={plan}
              isSelected={selectedPlanId === plan.plan_id}
              isFirst={index === 0}
              isLast={index === availablePlans.length - 1}
              onClick={() => handlePlanSelect(plan.plan_id)}
              getPlanLabel={getPlanLabel}
            />
          ))}
        </Box>
      </Box>

      {hasValidPrice && (
        <Box position="relative" mt={6}>
          {shouldShowSavingsPill && (
            <Box
              position="absolute"
              top="-14px"
              left="50%"
              transform="translateX(-50%)"
              bg="black"
              color="white"
              px={4}
              py={1}
              borderRadius="full"
              fontSize="13px"
              fontWeight="500"
              whiteSpace="nowrap"
              zIndex={1}
              textAlign="center"
              minWidth="max-content"
            >
              <Text fontSize="inherit" fontWeight="inherit" color="inherit">
                {monthsSaved === 1
                  ? t('subscription.yearly-savings-singular', { months: monthsSaved })
                  : t('subscription.yearly-savings', { months: monthsSaved })}
              </Text>
            </Box>
          )}
          {selfAppliedCoupon && (
            <Box
              position="absolute"
              top="-30px"
              left="-25px"
              fontSize="50px"
              zIndex={1}
            >
              🔥
            </Box>
          )}
          <Box
            position="relative"
            borderRadius="20px"
            display="flex"
            flexDirection={{ base: 'column', md: 'row' }}
            border="1px"
            borderColor={selectedPlan.period === 'YEAR' ? 'black' : backgroundColor}
          >
            <Box
              bg={selfAppliedCoupon ? 'green.500' : 'blue.default2'}
              p={6}
              color="white"
              width={{ base: '100%', md: '250px' }}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="space-between"
              borderTopLeftRadius="20px"
              borderTopRightRadius={{ base: '20px', md: '0' }}
              borderBottomLeftRadius={{ base: '0', md: '20px' }}
            >
              <Flex alignItems="center" mb={3} gap={2}>
                <Text fontSize="sm">
                  {t('learn-at-your-pace')}
                </Text>
                {selectedPlan.period !== 'FINANCING' && selectedPlan.period !== 'ONE_TIME' && (
                  <Box bg={selfAppliedCoupon ? 'green.700' : '#0062BD'} px={2} py={0.5} borderRadius="md" border="1px solid" borderColor="white">
                    <Text fontSize="xs" textWrap="nowrap" flexGrow={1} textAlign="center">
                      {getPlanLabel(selectedPlan)}
                    </Text>
                  </Box>
                )}
              </Flex>
              <Flex flexDirection="column" alignItems="center" mb={{ base: 4, md: 0 }}>
                <Text
                  fontSize={{ base: '4xl', md: selectedPlan.period !== 'FINANCING' ? '55px' : '40px' }}
                  fontWeight="bold"
                  fontFamily="Space Grotesk Variable"
                >
                  {selectedPlan.priceText}
                </Text>
                <Flex gap="10px" alignItems="center" direction="column">
                  <Text as="span" fontSize="md" color="#01455E" textDecoration="line-through">
                    {selectedPlan.lastPrice}
                  </Text>
                  {selfAppliedCoupon && (
                    <Text as="span" fontSize="xs" color="#01455E">
                      {t('signup:discount-applied')}
                    </Text>
                  )}
                </Flex>
              </Flex>
              <Button
                width="full"
                bg="white"
                size="lg"
                color="black"
                _hover="none"
                onClick={handlePlanUpgrade}
              >
                <Icon icon="graduationCap" color="black" width="20px" height="20px" mr="10px" />
                {t('common:enroll')}
              </Button>
            </Box>

            <Box
              flex="1"
              p={{ base: 4, md: 6 }}
              bg={backgroundColor}
              borderBottomLeftRadius={{ base: '20px', md: '0' }}
              borderBottomRightRadius="20px"
              borderTopRightRadius={{ base: '0', md: '20px' }}
            >
              <Text fontSize="18px" mb={4}>
                {selectedPlan?.description || data?.pricing?.description}
              </Text>

              <Box mb={6} mt={7}>
                <MktTechnologies
                  padding="0"
                  imageSize={{ base: '22px', md: '22px' }}
                  gridColumn="1 / -1"
                  gridSpacing={{ base: '12px', md: '40px' }}
                  justifyContent={{ base: 'center', md: 'flex-start' }}
                  alignItems="center"
                  gridStart="1"
                  gridEnd="-1"
                  containerPadding="0"
                />
              </Box>

              <hr />

              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
                templateRows={{ base: 'auto', md: 'auto auto' }}
                gap={0}
                mt={2}
              >
                {bullets?.map((bullet) => (
                  <Flex
                    key={bullet.id}
                    alignItems="start"
                    py={4}
                    borderRadius="md"
                  >
                    <Icon
                      icon={bullet.icon}
                      width="30px"
                      color={bullet.color}
                      mr={2}
                      mt={1}
                    />
                    <Text fontSize="sm">{bullet.text}</Text>
                  </Flex>
                ))}
              </Grid>
            </Box>
          </Box>
        </Box>
      )}
    </Flex>
  );
}

ShowPrices.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  list: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  finance: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  onSelect: PropTypes.func,
  handleUpgrade: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  bullets: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    icon: PropTypes.string,
    color: PropTypes.string,
    text: PropTypes.string,
  })),
};

ShowPrices.defaultProps = {
  data: null,
  title: null,
  subtitle: null,
  list: null,
  finance: null,
  onSelect: () => { },
  handleUpgrade: false,
  bullets: [],
};

PlanButton.propTypes = {
  plan: PropTypes.shape({
    plan_id: PropTypes.string,
    period: PropTypes.string,
    type: PropTypes.string,
    how_many_months: PropTypes.number,
  }).isRequired,
  isSelected: PropTypes.bool,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  onClick: PropTypes.func,
  getPlanLabel: PropTypes.func,
};

PlanButton.defaultProps = {
  isSelected: false,
  isFirst: false,
  isLast: false,
  onClick: () => { },
  getPlanLabel: (plan) => plan.title,
};

export default ShowPrices;
