import PropTypes from 'prop-types';
import {
  Box, Button,
} from '@chakra-ui/react';
import { useState, Fragment } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
// import { useFlags } from 'launchdarkly-react-client-sdk';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import useStyle from '../../common/hooks/useStyle';

const Pricing = ({ data }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedFinanceIndex, setSelectedFinanceIndex] = useState(0);
  const { t } = useTranslation('');
  const { fontColor, featuredColor } = useStyle();
  const router = useRouter();
  // const flags = useFlags();

  const financeSelected = {
    0: 'list',
    1: 'finance',
  };
  const financeValue = `${financeSelected[selectedFinanceIndex]}`;
  const selectedItem = data?.pricing[financeValue][selectedIndex];

  const handleSelect = (index) => {
    setSelectedIndex(index);
  };
  const handleSelectFinance = (index) => {
    setSelectedFinanceIndex(index);
    setSelectedIndex(0);
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
      <Box display="flex" flex={0.5} flexDirection="column" gridGap="20px">
        <Box width="100%" display="flex" justifyContent="space-between" alignItems="center" mb="6px">
          <Heading as="h2" size="sm">
            {data?.pricing['choose-plan']}
          </Heading>
          <Box display="flex">
            <Box p="15px 10px" onClick={() => handleSelectFinance(0)} borderBottom="4px solid" borderColor={selectedFinanceIndex === 0 ? 'blue.default' : 'gray.400'} color={selectedFinanceIndex === 0 ? 'blue.default' : fontColor} cursor="pointer" fontWeight={selectedFinanceIndex === 0 ? '700' : '400'}>
              {data?.pricing['one-payment']}
            </Box>
            <Box p="15px 10px" onClick={() => handleSelectFinance(1)} borderBottom="4px solid" borderColor={selectedFinanceIndex === 1 ? 'blue.default' : 'gray.400'} color={selectedFinanceIndex === 1 ? 'blue.default' : fontColor} cursor="pointer" fontWeight={selectedFinanceIndex === 1 ? '700' : '400'}>
              {data?.pricing['finance-text']}
            </Box>
          </Box>
        </Box>
        {data?.pricing[financeValue].filter((l) => l.show === true).map((item, i) => (
          <Fragment key={`${item.title} ${item?.price}`}>
            {data?.pricing[financeValue]?.length - 1 === i && (
              <Box display="flex" alignItems="center">
                <Box as="hr" color="gray.500" width="100%" />
                <Text size="md" textAlign="center" width="100%" margin="0">
                  {data?.pricing['not-ready']}
                </Text>
                <Box as="hr" color="gray.500" width="100%" />
              </Box>
            )}
            <Box key={item.title} display="flex" onClick={() => handleSelect(i)} flexDirection={{ base: 'column', md: 'row' }} width="100%" justifyContent="space-between" p={selectedIndex === i ? '22px 18px' : '26px 22px'} gridGap="24px" cursor="pointer" background={selectedIndex !== i && featuredColor} border={selectedIndex === i && '4px solid #0097CD'} borderRadius="8px">
              <Box display="flex" flex={1} flexDirection="column" gridGap="12px" minWidth={{ base: '100%', md: '288px' }} height="fit-content" fontWeight="400">
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
              <Box display="flex" alignItems="center" gridGap="10px">
                <Heading as="span" size="m" lineHeight="1" textTransform="uppercase" color="blue.default">
                  {item?.price}
                </Heading>
              </Box>
            </Box>
          </Fragment>
        ))}
        <Box mt="38px">
          {process.env.VERCEL_ENV !== 'production' ? (
            <Button
              variant="default"
              onClick={() => {
                router.push(`/signup?syllabus=coding-introduction${selectedItem?.type.includes('trial') ? '&cohort=495' : ''}`);
              }}
            >
              {selectedItem?.button?.title}
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
    </Box>
  );
};

Pricing.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Pricing;
