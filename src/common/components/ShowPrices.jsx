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
import useSignup from '../store/actions/signupAction';
import useStyle from '../hooks/useStyle';
import Icon from './Icon';
import MktTechnologies from './MktTechnologies';

function PlanCard({ item, handleSelect, selectedId, isCouponAvailable }) {
  const { hexColor, backgroundColor2 } = useStyle();
  const selectedColor = isCouponAvailable ? '#256c45' : hexColor.blueDefault;
  const isSelected = selectedId === item.plan_id;

  return (
    <Box
      key={`${item.title} ${item?.price}`}
      display="flex"
      onClick={() => handleSelect(item)}
      width="100%"
      alignItems={item?.isFreeTier && 'center'}
      justifyContent="space-between"
      p="22px 18px"
      gridGap="24px"
      cursor="pointer"
      background={backgroundColor2}
      border="4px solid"
      borderColor={isSelected ? selectedColor : 'transparent'}
      borderRadius="8px"
    >
      <Box display="flex" flexDirection="column" width="100%" gridGap="12px" minWidth={{ base: 'none', md: 'auto' }} height="fit-content" fontWeight="400">
        {!item?.isFreeTier && (
          <Box fontSize="18px" fontWeight="700">
            {item?.title}
          </Box>
        )}
        <Text
          size="md"
          fontWeight="500"
          mb="6px"
          dangerouslySetInnerHTML={{ __html: item?.description }}
        />
      </Box>

      <Box textAlign="right" display="flex" minWidth={item.period !== 'FINANCING' && 'auto'} justifyContent="center" flexDirection="column" gridGap="10px">
        <Heading as="span" size={{ base: 'var(--heading-m)', md: 'clamp(0.875rem, 0.3rem + 1.8vw, 2rem)' }} width={item.period === 'FINANCING' && 'max-content'} lineHeight="1" textTransform="uppercase" color={isCouponAvailable ? hexColor.green : 'blue.default2'}>
          {item?.priceText || item?.price}
        </Heading>
        {item?.lastPrice && (
          <Text lineHeight="21px" fontSize="21px" fontWeight="500" color="#A9A9A9">
            <s>
              {item?.lastPrice}
            </s>
          </Text>
        )}
      </Box>
    </Box>
  );
}

function ShowPrices({
  data,
  title,
  secondSectionTitle,
  notReady,
  list,
  finance,
  onSelect,
  defaultIndex,
  defaultFinanceIndex,
  externalSelection,
  outOfConsumables,
  handleUpgrade,
  isTotallyFree,
  version,
  subtitle,
  bullets,
}) {
  const [selectedId, setSelectedId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedFinanceIndex, setSelectedFinanceIndex] = useState(defaultFinanceIndex);
  const { t } = useTranslation('profile');
  const { hexColor, fontColor, disabledColor, featuredColor, backgroundColor, lightColor } = useStyle();
  const router = useRouter();
  const { getPriceWithDiscount, state, applyDiscountCouponsToPlans } = useSignup();
  const { selfAppliedCoupon } = state;

  const tiersTypes = {
    subscriptions: applyDiscountCouponsToPlans(list, selfAppliedCoupon) || data?.pricing.list || [],
    finance: applyDiscountCouponsToPlans(finance, selfAppliedCoupon) || data?.pricing.finance || [],
  };

  const allTiers = [...tiersTypes.subscriptions, ...tiersTypes.finance];

  const financeSelected = {
    0: tiersTypes.subscriptions.filter((l) => l.show && !l.isFreeTier),
    1: tiersTypes.finance.filter((l) => l.show && !l.isFreeTier),
  };

  const freeTiers = allTiers.filter((l) => l.show && l.isFreeTier);

  const dataList = financeSelected?.[selectedFinanceIndex] || [];
  const selectedItem = selectedId && allTiers.find((item) => item.plan_id === selectedId);

  const handleSelect = (item) => {
    setSelectedId(item.plan_id);
    if (onSelect) onSelect(item);
  };

  useEffect(() => {
    if (dataList.length === 1) {
      handleSelect(dataList[0]);
    }
  }, []);

  const handleSelectFinance = (index) => {
    setSelectedFinanceIndex(index);
    const item = financeSelected[index][0];
    if (item) setSelectedId(item.plan_id);
    onSelect(financeSelected[index][defaultIndex || 0]);
  };

  const getTabColor = (index, tabIsAvailable = true) => {
    if (selectedFinanceIndex === index) {
      return {
        borderBottom: '4px solid',
        borderColor: selfAppliedCoupon ? 'white' : 'blue.default',
        color: selfAppliedCoupon ? 'white' : 'blue.default',
        cursor: 'pointer',
        fontWeight: '700',
      };
    }
    return {
      borderBottom: '4px solid',
      borderColor: 'gray.400',
      color: tabIsAvailable ? fontColor : disabledColor,
      cursor: tabIsAvailable ? 'pointer' : 'not-allowed',
      fontWeight: '400',
    };
  };

  const paymentTabStyle = getTabColor(0, list?.length > 0);
  const financeTabStyle = getTabColor(1, finance?.length > 0);
  const existMoreThanOne = dataList.length > 1;
  const isOnlyOneItem = [...finance, ...list].length === 1;

  useEffect(() => {
    const tabSelected = financeSelected?.[externalSelection?.selectedFinanceIndex];
    const elementFound = tabSelected?.[externalSelection?.selectedIndex] || tabSelected?.[0];
    if (externalSelection?.selectedIndex >= 0 && externalSelection?.selectedFinanceIndex >= 0 && tabSelected?.length > 0) {
      handleSelectFinance(externalSelection.selectedFinanceIndex);
      handleSelect(elementFound);
    }
  }, [externalSelection]);

  const discountOperation = getPriceWithDiscount(0, selfAppliedCoupon);

  if (version === 'v2') {
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
          return t('subscription.payment_unit.year');
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
        setSelectedId(newPlan.plan_id);
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
                <Button
                  key={plan.plan_id}
                  variant="unstyled"
                  bg={selectedPlanId === plan.plan_id ? 'blue.default2' : 'transparent'}
                  color={selectedPlanId === plan.plan_id ? 'white' : 'blue.default2'}
                  size="sm"
                  px={4}
                  border="1px solid"
                  borderRadius="0"
                  borderLeft={index === 0 ? '1px solid' : 'none'}
                  borderRight={index === availablePlans.length - 1 ? '1px solid' : 'none'}
                  borderColor="blue.default2"
                  _first={{ borderLeftRadius: '4px' }}
                  _last={{ borderRightRadius: '4px' }}
                  _hover="none"
                  onClick={() => handlePlanSelect(plan.plan_id)}
                >
                  {getPlanLabel(plan)}
                </Button>
              ))}
            </Box>
          </Box>
          <Text fontSize="18px" color={lightColor}>
            {subtitle || data?.pricing?.subtitle}
          </Text>
          <Box display={{ base: 'flex', md: 'none' }} alignItems="center" bg="transparent" mt={4} justifyContent="center">
            {availablePlans.map((plan, index) => (
              <Button
                key={plan.plan_id}
                variant="unstyled"
                bg={selectedPlanId === plan.plan_id ? 'blue.default2' : 'transparent'}
                color={selectedPlanId === plan.plan_id ? 'white' : 'blue.default2'}
                size="sm"
                px={4}
                border="1px solid"
                borderColor="blue.default2"
                borderRadius="0"
                borderLeft={index === 0 ? '1px solid' : 'none'}
                borderRight={index === availablePlans.length - 1 ? '1px solid' : 'none'}
                _first={{ borderLeftRadius: '4px' }}
                _last={{ borderRightRadius: '4px' }}
                _hover="none"
                onClick={() => handlePlanSelect(plan.plan_id)}
              >
                {getPlanLabel(plan)}
              </Button>
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
                  {t('subscription.yearly-savings', { months: monthsSaved })}
                </Text>
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
                bg="blue.default2"
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
                <Flex alignItems="center" mb={3}>
                  <Text fontSize="sm" mr={2}>{t('learn-at-your-pace')}</Text>
                  <Box bg="#0062BD" px={2} py={0.5} borderRadius="md" border="1px solid" borderColor="white">
                    <Text fontSize="xs" textWrap="nowrap" flexGrow={1} textAlign="center">{getPlanLabel(selectedPlan)}</Text>
                  </Box>
                </Flex>
                <Flex flexDirection="column" alignItems="center" mb={{ base: 4, md: 0 }}>
                  <Text
                    fontSize={{ base: '4xl', md: selectedPlan.period !== 'FINANCING' ? '55px' : '40px' }}
                    fontWeight="bold"
                    fontFamily="Space Grotesk Variable"
                  >
                    {selectedPlan.priceText}
                  </Text>
                  <Text as="span" fontSize="md" color="#01455E" textDecoration="line-through">
                    {selectedPlan.lastPrice}
                  </Text>
                </Flex>
                <Button
                  width="full"
                  bg="white"
                  size="lg"
                  color="black"
                  _hover="none"
                  onClick={() => {
                    if (handleUpgrade === false) {
                      router.push(`/checkout?syllabus=coding-introduction&plan=${selectedPlan?.type?.toLowerCase()?.includes('trial') ? 'coding-introduction-free-trial' : 'coding-introduction-financing-options-one-payment'}`);
                    } else {
                      handleUpgrade(selectedPlan);
                    }
                  }}
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
                    imageSize={{ base: '16px', md: '20px' }}
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

  return (
    <>
      <Box position="relative" borderRadius="12px" padding="16px" background={selfAppliedCoupon ? hexColor.green : featuredColor} display="flex" flex={0.5} flexDirection="column" gridGap="20px">
        {selfAppliedCoupon && (
          <Box position="absolute" right="20px" top="-20px">
            <Box
              borderRadius="55px"
              background={hexColor.greenLight2}
              padding="2px 8px"
              position="relative"
            >
              <Box
                top="-9px"
                left="-37px"
                display="flex"
                justifyContent="center"
                flexDirection="column"
                alignItems="center"
                textAlign="center"
                width="44px"
                height="44px"
                fontSize="24px"
                position="absolute"
                borderRadius="41px"
                padding="10px"
                border="2px solid"
                borderColor={hexColor.greenLight2}
                background={hexColor.green}
              >
                🔥
              </Box>
              <Text fontSize="15px" color={hexColor.green}>
                {t('subscription.discount', { discount: discountOperation?.discount })}
              </Text>
            </Box>
          </Box>
        )}
        <Box width="100%" display="flex" flexWrap="wrap" gridGap="5px 10px" justifyContent={{ base: 'center', sm: 'space-between' }} alignItems="center" mb="6px">
          <Heading color={selfAppliedCoupon && 'white'} as="h2" size="sm">
            {title || data?.pricing['choose-plan']}
          </Heading>
          {!isTotallyFree && financeSelected[1] && !isOnlyOneItem && (
            <Box display="flex">
              <Box
                p={{ base: '10px 7px', md: '15px 10px', lg: '15px 10px' }}
                onClick={() => {
                  if (list?.length > 0) {
                    handleSelectFinance(0);
                  }
                }}
                {...paymentTabStyle}
              >
                {finance?.length > 0
                  ? t('subscription.upgrade-modal.one_payment')
                  : t('subscription.upgrade-modal.subscription')}
              </Box>

              <Box
                display={finance?.length > 0 ? 'block' : 'none'}
                p={{ base: '10px 7px', md: '15px 10px', lg: '15px 10px' }}
                disabled={finance?.length > 0}
                onClick={() => {
                  if (finance?.length > 0) {
                    handleSelectFinance(1);
                  }
                }}
                {...financeTabStyle}
              >
                {secondSectionTitle || data?.pricing['finance-text']}
              </Box>
            </Box>
          )}
        </Box>
        {dataList?.length > 0 && dataList.map((item) => (
          <PlanCard key={item?.plan_id} isCouponAvailable={!!selfAppliedCoupon} item={item} handleSelect={handleSelect} selectedId={selectedId} />
        ))}
      </Box>
      <Box mt="20px" display="flex" flex={0.5} flexDirection="column" gridGap="20px">
        {existMoreThanOne && freeTiers?.length > 0 && (
          <Box display="flex" alignItems="center">
            <Box as="hr" color="gray.500" width="100%" />
            <Text size="md" textAlign="center" width="100%" margin="0">
              {notReady || data?.pricing?.['not-ready']}
            </Text>
            <Box as="hr" color="gray.500" width="100%" />
          </Box>
        )}
        {freeTiers?.length > 0 && (
          <Box borderRadius="12px" padding="16px" background={featuredColor}>
            {freeTiers.map((item) => (
              <PlanCard key={item?.plan_id} item={item} handleSelect={handleSelect} selectedId={selectedId} />
            ))}
          </Box>
        )}
        <Box mt="38px">
          <Button
            display={outOfConsumables && 'none'}
            variant="default"
            isDisabled={!selectedId}
            onClick={() => {
              if (handleUpgrade === false) {
                router.push(`/checkout?syllabus=coding-introduction&plan=${selectedItem?.type?.toLowerCase()?.includes('trial') ? 'coding-introduction-free-trial' : 'coding-introduction-financing-options-one-payment'}`);
              } else {
                handleUpgrade(selectedItem);
              }
            }}
          >
            {t('common:enroll')}
          </Button>
          {!selectedItem?.isFreeTier && (
            <Flex marginTop="5px" gap="5px" alignItems="center">
              <Icon icon="shield" width="23px" />
              <Text fontSize="13px" fontWeight="bold" color="green.400">
                {t('common:money-back-guarantee-short')}
              </Text>
            </Flex>
          )}
        </Box>
      </Box>
    </>
  );
}

ShowPrices.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  title: PropTypes.string,
  secondSectionTitle: PropTypes.string,
  notReady: PropTypes.string,
  list: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  finance: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  onSelect: PropTypes.func,
  defaultIndex: PropTypes.number,
  defaultFinanceIndex: PropTypes.number,
  outOfConsumables: PropTypes.bool,
  handleUpgrade: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  isTotallyFree: PropTypes.bool,
  externalSelection: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

ShowPrices.defaultProps = {
  data: null,
  title: null,
  secondSectionTitle: null,
  notReady: null,
  list: null,
  finance: null,
  onSelect: () => { },
  defaultIndex: null,
  defaultFinanceIndex: 0,
  outOfConsumables: false,
  handleUpgrade: false,
  isTotallyFree: false,
  externalSelection: {},
};

export default ShowPrices;
