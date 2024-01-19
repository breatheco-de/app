/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import {
  Box,
} from '@chakra-ui/react';
import { useState } from 'react';
import ShowPrices from '../../common/components/ShowPrices';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';

function Pricing({ data }) {
  const defaultIndex = 0;
  const defaultFinanceIndex = 0;
  const financeSelected = {
    0: 'list',
    1: 'finance',
  };
  const [selectedItem, setSelectedItem] = useState(data?.pricing[financeSelected[defaultFinanceIndex]][defaultIndex]);

  const onSelect = (item) => {
    setSelectedItem(item);
  };

  return (
    <Box maxW="container.xl" display="flex" width="100%" flexDirection="row" id="pricing" alignItems={{ base: 'center', md: 'start' }} gridGap="21px" m="36px auto 20px auto" justifyContent="center" height="100%">
      <Box display="flex" flex={0.5} flexDirection="column" w="100%" gridGap="10px">
        <Heading size="l" mb="32px">
          {data?.pricing?.title}
        </Heading>
        {data?.pricing?.description && (
          <Text
            size="md"
            width="80%"
            fontWeight="500"
            dangerouslySetInnerHTML={{ __html: data?.pricing?.description }}
          />
        )}
        <Box fontSize="13px" textTransform="uppercase" fontWeight="700" color="blue.default" mb="5px">
          {selectedItem?.bullets?.title}
        </Box>
        <Box as="ul" style={{ listStyle: 'none' }} display="flex" flexDirection="column" gridGap="12px">
          {selectedItem?.bullets?.list?.map((bullet) => (
            <Box as="li" key={bullet?.title} display="flex" flexDirection="row" lineHeight="24px" gridGap="8px">
              <Icon icon="checked2" color="#38A56A" width="13px" height="10px" style={{ margin: '8px 0 0 0' }} />
              <Box
                fontSize="14px"
                fontWeight="600"
                letterSpacing="0.05em"
                dangerouslySetInnerHTML={{ __html: bullet?.title }}
              />
            </Box>
          ))}
        </Box>
      </Box>
      <ShowPrices
        data={data}
        title={data?.pricing['choose-plan']}
        onePaymentLabel={data?.pricing['one-payment']}
        financeTextLabel={data?.pricing['finance-text']}
        notReady={data?.pricing['not-ready']}
        list={data?.pricing.list}
        finance={data?.pricing.finance}
        defaultIndex={defaultIndex}
        defaultFinanceIndex={defaultFinanceIndex}
        onSelect={onSelect}
      />
    </Box>
  );
}

Pricing.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default Pricing;
