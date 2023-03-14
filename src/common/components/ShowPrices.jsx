/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import {
  Box, Button,
} from '@chakra-ui/react';
import { useState, Fragment } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Heading from './Heading';
import Text from './Text';
import useStyle from '../hooks/useStyle';

const ShowPrices = ({
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
  outOfConsumables,
  stTranslation,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const [selectedFinanceIndex, setSelectedFinanceIndex] = useState(defaultFinanceIndex);
  const { t, lang } = useTranslation('');
  const { fontColor, featuredColor, backgroundColor2 } = useStyle();
  const router = useRouter();

  const financeSelected = {
    0: list || data?.pricing.list,
    1: finance || data?.pricing.finance,
  };

  const selectedItem = selectedIndex !== null && financeSelected[selectedFinanceIndex][selectedIndex];

  const handleSelect = (index, item) => {
    setSelectedIndex(index);
    if (onSelect) onSelect(item);
  };
  const handleSelectFinance = (index) => {
    setSelectedFinanceIndex(index);
    setSelectedIndex(0);
    onSelect(financeSelected[defaultFinanceIndex][defaultIndex]);
  };

  const PlanCard = ({ item, i }) => (
    <Fragment key={`${item.title} ${item?.price}`}>
      <Box
        key={item.title}
        display="flex"
        onClick={() => handleSelect(i, item)}
        width="100%"
        justifyContent="space-between"
        p={selectedIndex === i ? '18px 14px' : '22px 18px'}
        gridGap="24px"
        cursor="pointer"
        background={backgroundColor2}
        border={selectedIndex === i && '4px solid #0097CD'}
        borderRadius="8px"
      >
        <Box display="flex" flexDirection="column" gridGap="12px" minWidth={{ base: 'none', md: '288px' }} height="fit-content" fontWeight="400">
          <Box fontSize="18px" fontWeight="700">
            {item?.title}
          </Box>
          <Text
            size="md"
            fontWeight="500"
            mb="6px"
            dangerouslySetInnerHTML={{ __html: item?.description }}
          />
        </Box>
        <Box textAlign="right" display="flex" flexDirection="column" gridGap="10px">
          <Heading as="span" size="m" lineHeight="1" textTransform="uppercase" color="blue.default">
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
    </Fragment>
  );

  return (
    <Box borderRadius="12px" padding="10px" background={featuredColor} display="flex" flex={0.5} flexDirection="column" gridGap="20px">
      <Box width="100%" display="flex" flexWrap="wrap" gridGap="5px 10px" justifyContent="space-between" alignItems="center" mb="6px">
        <Heading as="h2" size="sm">
          {title || data?.pricing['choose-plan']}
        </Heading>
        {!outOfConsumables && (
          <Box display="flex">
            {list.length > 0 && (
              <Box
                p={{ base: '10px 7px', md: '15px 10px', lg: '15px 10px' }}
                onClick={() => handleSelectFinance(0)}
                borderBottom="4px solid"
                borderColor={selectedFinanceIndex === 0 ? 'blue.default' : 'gray.400'}
                color={selectedFinanceIndex === 0 ? 'blue.default' : fontColor}
                cursor="pointer"
                fontWeight={selectedFinanceIndex === 0 ? '700' : '400'}
              >
                {onePaymentLabel || data?.pricing['one-payment']}
              </Box>
            )}
            {finance.length > 0 && (
              <Box
                p={{ base: '10px 7px', md: '15px 10px', lg: '15px 10px' }}
                onClick={() => handleSelectFinance(1)}
                borderBottom="4px solid"
                borderColor={selectedFinanceIndex === 1 ? 'blue.default' : 'gray.400'}
                color={selectedFinanceIndex === 1 ? 'blue.default' : fontColor}
                cursor="pointer"
                fontWeight={selectedFinanceIndex === 1 ? '700' : '400'}
              >
                {financeTextLabel || data?.pricing['finance-text']}
              </Box>
            )}
          </Box>
        )}
      </Box>
      {financeSelected[selectedFinanceIndex].filter((l) => l.show === true).map((item, i) => (!item.isFree) && (
        <PlanCard item={item} i={i} />
      ))}
      {financeSelected[selectedFinanceIndex].some((item) => item.isFree) && (
        <Box display="flex" alignItems="center">
          <Box as="hr" color="gray.500" width="100%" />
          <Text size="md" textAlign="center" width="100%" margin="0">
            {notReady || data?.pricing['not-ready']}
          </Text>
          <Box as="hr" color="gray.500" width="100%" />
        </Box>
      )}
      {financeSelected[selectedFinanceIndex].filter((l) => l.show === true).map((item, i) => (item.isFree) && (
        <PlanCard item={item} i={i} />
      ))}
      <Box mt="38px">
        {process.env.VERCEL_ENV !== 'production' && outOfConsumables && (
          <Button
            variant="default"
            disabled={!selectedItem && true}
          >
            {stTranslation ? stTranslation[lang].common['upgrade-plan'].button : t('common:upgrade-plan.button')}
          </Button>
        )}
        {process.env.VERCEL_ENV !== 'production' ? (
          <Button
            display={outOfConsumables && 'none'}
            variant="default"
            disabled={!selectedItem && true}
            onClick={() => {
              router.push(`/signup?syllabus=coding-introduction&plan=${selectedItem?.type.includes('trial') ? 'coding-introduction-free-trial' : 'coding-introduction-financing-options-one-payment'}`);
            }}
          >
            {stTranslation ? stTranslation[lang].common.enroll : t('common:enroll')}
          </Button>
        ) : (
          <Button
            variant="default"
            disabled
          >
            {t('common:coming-soon')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

ShowPrices.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  title: PropTypes.string,
  onePaymentLabel: PropTypes.string,
  financeTextLabel: PropTypes.string,
  notReady: PropTypes.string,
  list: PropTypes.arrayOf(PropTypes.any),
  finance: PropTypes.arrayOf(PropTypes.any),
  onSelect: PropTypes.func,
  defaultIndex: PropTypes.number,
  defaultFinanceIndex: PropTypes.number,
  outOfConsumables: PropTypes.bool,
  stTranslation: PropTypes.objectOf(PropTypes.any),
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
};

export default ShowPrices;
