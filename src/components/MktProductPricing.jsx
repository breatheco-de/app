import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text as ChakraText,
  Button,
  Image,
  Skeleton,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import bc from '../services/breathecode';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import { currenciesSymbols } from '../utils/variables';

function MktProductPricing({ planSlug, mainImage }) {
  const { t } = useTranslation('pricing');
  const router = useRouter();
  const { hexColor, navbarBackground, fontColor } = useStyle();

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        if (!planSlug) return;
        setLoading(true);
        const resp = await bc.payment().getPlan(planSlug);
        console.log(resp?.data || {});
        if (resp?.status < 400) {
          setPlan(resp.data);
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planSlug]);

  const currencySymbol = useMemo(() => currenciesSymbols[plan?.currency?.code] || '$', [plan?.currency?.code]);

  const addOns = Array.isArray(plan?.add_ons) ? plan.add_ons : [];

  const toggleAddOn = (id) => {
    setSelectedAddOns((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const checkoutWithSelections = () => {
    const ids = selectedAddOns.join(',');
    const qs = new URLSearchParams({ plan: plan?.slug || planSlug, add_ons: ids }).toString();
    router.push(`/checkout?${qs}`);
  };

  return (
    <Box id="precios" maxW="1280px" mx="auto" bg={hexColor.lightGreyBackground} borderRadius="16px" overflow="hidden" boxShadow="0 20px 40px rgba(0, 0, 0, 0.03)">
      <Flex direction={{ base: 'column', md: 'row' }} minH={{ base: 'auto', md: '420px' }}>
        <Box
          flex="1"
          position="relative"
          display={{ base: 'none', md: 'flex' }}
          alignItems="center"
          justifyContent="center"
          p="20px 0 20px 20px"
          minH={{ base: '200px', md: 'auto' }}
        >
          {mainImage && (
            <Image src={mainImage} width="100%" height="100%" objectFit="cover" borderRadius="12px" />
          )}
        </Box>

        <Box flex={{ base: '1', md: '1' }} p="20px" w={{ base: '100%', md: 'auto' }}>
          <VStack align="start" spacing={{ base: '12px', md: '16px' }} mb={{ base: '20px', md: '24px' }}>
            <Text size={{ base: '18px', md: '22px' }} color="blue.default" fontWeight="700">
              {plan?.title || t('common:start-your-tech-career')}
            </Text>
            <ChakraText fontSize={{ base: '14px', md: '16px' }} color={fontColor} mt="0 !important">
              {t('common:go-all-in-or-learn-flexibly')}
            </ChakraText>
          </VStack>

          {loading && (
            <Skeleton height="110px" borderRadius="12px" />
          )}

          {!loading && (
            <VStack spacing={{ base: '16px', md: '20px' }} align="stretch">
              <Box p={{ base: '16px', md: '20px' }} borderRadius="12px" bg={navbarBackground}>
                <HStack spacing="12px" mb="10px">
                  <Text size={{ base: '16px', md: '18px' }} fontWeight="600" color={fontColor}>
                    {t('common:choose-what-fits-you-best')}
                  </Text>
                </HStack>
                <VStack spacing="12px" align="stretch">
                  {addOns.map((ao) => (
                    <Flex
                      key={ao?.id}
                      direction={{ base: 'column', md: 'row' }}
                      justify="space-between"
                      align="start"
                      gap="8px"
                      borderRadius="10px"
                      border="2px solid"
                      borderColor={selectedAddOns.includes(ao?.id) ? 'blue.default' : 'gray.50'}
                      p="12px"
                      _hover={{ borderColor: selectedAddOns.includes(ao?.id) ? 'blue.default' : 'blue.50' }}
                    >
                      <Box>
                        <Text size="md" color={fontColor} fontWeight="600">{ao?.service?.title}</Text>
                      </Box>
                      <HStack justify="flex-end" align="center" spacing="12px" w={{ base: '100%', md: 'auto' }}>
                        <Text size="md" color="green.500" fontWeight="700">
                          {`${currencySymbol}${Number(ao?.price_per_unit || 0)}${ao?.currency?.code ? ` ${ao?.currency?.code}` : ''}`}
                        </Text>
                        {selectedAddOns.includes(ao?.id) ? (
                          <Button size="sm" variant="outline" color={fontColor} onClick={() => toggleAddOn(ao?.id)}>
                            {t('common:remove')}
                          </Button>
                        ) : (
                          <Button size="sm" variant="default" color="white" onClick={() => toggleAddOn(ao?.id)}>
                            {t('common:add-product')}
                          </Button>
                        )}
                      </HStack>
                    </Flex>
                  ))}
                  {addOns.length === 0 && (
                    <Text size="sm" color="gray.500">{t('no-addons-available', {}, { fallback: 'No hay complementos disponibles' })}</Text>
                  )}
                </VStack>
                <Button
                  bg="blue.default"
                  color="white"
                  fontWeight="400"
                  size="sm"
                  _hover="none"
                  mt="12px"
                  onClick={checkoutWithSelections}
                  isDisabled={selectedAddOns.length === 0}
                >
                  {t('common:go-to-checkout')}
                </Button>
              </Box>
            </VStack>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

MktProductPricing.propTypes = {
  planSlug: PropTypes.string.isRequired,
  mainImage: PropTypes.string,
};

MktProductPricing.defaultProps = {
  mainImage: null,
};

export default MktProductPricing;
