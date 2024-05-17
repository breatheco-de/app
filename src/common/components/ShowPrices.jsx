/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import {
  Box, Button,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Heading from './Heading';
import Text from './Text';
import useStyle from '../hooks/useStyle';

function PlanCard({ item, i, handleSelect, selectedIndex }) {
  const { backgroundColor2 } = useStyle();

  return (
    <Box
      key={`${item.title} ${item?.price}`}
      display="flex"
      onClick={() => handleSelect(i, item)}
      width="100%"
      alignItems={item?.isFreeTier && 'center'}
      justifyContent="space-between"
      p="22px 18px"
      gridGap="24px"
      cursor="pointer"
      background={backgroundColor2}
      border="4px solid"
      borderColor={selectedIndex === i ? '#0097CD' : 'transparent'}
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
        <Heading as="span" size={{ base: 'var(--heading-m)', md: 'clamp(0.875rem, 0.3rem + 1.8vw, 2rem)' }} width={item.period === 'FINANCING' && 'max-content'} lineHeight="1" textTransform="uppercase" color="blue.default">
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
  onePaymentLabel,
  financeTextLabel,
  notReady,
  list,
  finance,
  onSelect,
  defaultIndex,
  defaultFinanceIndex,
  externalSelection,
  outOfConsumables,
  stTranslation,
  handleUpgrade,
  isTotallyFree,
}) {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const [selectedFinanceIndex, setSelectedFinanceIndex] = useState(defaultFinanceIndex);
  const { t, lang } = useTranslation('');
  const { fontColor, disabledColor, featuredColor } = useStyle();
  const router = useRouter();

  const financeSelected = {
    0: list || data?.pricing.list,
    1: finance || data?.pricing.finance,
  };

  const dataList = financeSelected?.[selectedFinanceIndex] || [];
  const selectedItem = selectedIndex !== null && financeSelected[selectedFinanceIndex][selectedIndex];

  const handleSelect = (index, item) => {
    setSelectedIndex(index);
    if (onSelect) onSelect(item);
  };

  useEffect(() => {
    if (dataList.length === 1) {
      handleSelect(0, dataList[0]);
    }
  }, []);

  const handleSelectFinance = (index) => {
    setSelectedFinanceIndex(index);
    setSelectedIndex(0);
    onSelect(financeSelected[defaultFinanceIndex][defaultIndex || 0]);
  };

  const getTabColor = (index, tabIsAvailable = true) => {
    if (selectedFinanceIndex === index) {
      return {
        borderBottom: '4px solid',
        borderColor: 'blue.default',
        color: 'blue.default',
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
    const financeFound = tabSelected?.[externalSelection?.selectedIndex] || tabSelected?.[0];
    if (externalSelection?.selectedIndex >= 0 && externalSelection?.selectedFinanceIndex >= 0 && tabSelected?.length > 0) {
      handleSelectFinance(externalSelection.selectedFinanceIndex);
      handleSelect(externalSelection.selectedIndex, financeFound);
    }
  }, [externalSelection]);

  return (
    <Box borderRadius="12px" padding="16px" background={featuredColor} display="flex" flex={0.5} flexDirection="column" gridGap="20px">
      <Box width="100%" display="flex" flexWrap="wrap" gridGap="5px 10px" justifyContent={{ base: 'center', sm: 'space-between' }} alignItems="center" mb="6px">
        <Heading as="h2" size="sm">
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
              {onePaymentLabel || data?.pricing['one-payment']}
            </Box>

            <Box
              p={{ base: '10px 7px', md: '15px 10px', lg: '15px 10px' }}
              disabled={finance?.length > 0}
              onClick={() => {
                if (finance?.length > 0) {
                  handleSelectFinance(1);
                }
              }}
              {...financeTabStyle}
            >
              {financeTextLabel || data?.pricing['finance-text']}
            </Box>
          </Box>
        )}
      </Box>
      {dataList?.length > 0 && dataList.filter((l) => l.show === true).map((item, i) => (!item.isFreeTier) && (
        <PlanCard key={item?.plan_id} item={item} i={i} handleSelect={handleSelect} selectedIndex={selectedIndex} />
      ))}
      {existMoreThanOne && dataList.some((item) => item.isFreeTier) && (
        <Box display="flex" alignItems="center">
          <Box as="hr" color="gray.500" width="100%" />
          <Text size="md" textAlign="center" width="100%" margin="0">
            {notReady || data?.pricing?.['not-ready']}
          </Text>
          <Box as="hr" color="gray.500" width="100%" />
        </Box>
      )}
      {dataList?.length > 0 && dataList.filter((l) => l.show === true && l?.isFreeTier).map((item, i) => (
        <PlanCard key={item?.plan_id} item={item} i={i} handleSelect={handleSelect} selectedIndex={selectedIndex} />
      ))}
      <Box mt="38px">
        {process.env.VERCEL_ENV !== 'production' && outOfConsumables && (
          <Button
            variant="default"
            isDisabled={!selectedItem && true}
          >
            {stTranslation ? stTranslation[lang].common['upgrade-plan'].button : t('common:upgrade-plan.button')}
          </Button>
        )}
        <Button
          display={outOfConsumables && 'none'}
          variant="default"
          isDisabled={!selectedItem && true}
          onClick={() => {
            if (handleUpgrade === false) {
              router.push(`/checkout?syllabus=coding-introduction&plan=${selectedItem?.type?.toLowerCase()?.includes('trial') ? 'coding-introduction-free-trial' : 'coding-introduction-financing-options-one-payment'}`);
            } else {
              handleUpgrade(selectedItem);
            }
          }}
        >
          {stTranslation ? stTranslation[lang].common.enroll : t('common:enroll')}
        </Button>
      </Box>
    </Box>
  );
}

ShowPrices.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  title: PropTypes.string,
  onePaymentLabel: PropTypes.string,
  financeTextLabel: PropTypes.string,
  notReady: PropTypes.string,
  list: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  finance: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  onSelect: PropTypes.func,
  defaultIndex: PropTypes.number,
  defaultFinanceIndex: PropTypes.number,
  outOfConsumables: PropTypes.bool,
  stTranslation: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  handleUpgrade: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  isTotallyFree: PropTypes.bool,
  externalSelection: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

ShowPrices.defaultProps = {
  data: null,
  title: null,
  onePaymentLabel: null,
  financeTextLabel: null,
  notReady: null,
  list: null,
  finance: null,
  onSelect: () => {},
  defaultIndex: null,
  defaultFinanceIndex: 0,
  outOfConsumables: false,
  stTranslation: null,
  handleUpgrade: false,
  isTotallyFree: false,
  externalSelection: {},
};

export default ShowPrices;
