import { useState, useEffect } from 'react';
import { Box, Text, Tooltip } from '@chakra-ui/react';
import NextLink from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import bc from '../../services/breathecode';

function LiveWorkshopBadge() {
  const [liveWorkshopData, setLiveWorkshopData] = useState(false);
  const { t } = useTranslation('navbar');

  useEffect(() => {
    const checkLiveWorkshop = async () => {
      try {
        const res = await bc.events().liveWorkshopStatus();
        setLiveWorkshopData(res.data.slug && res.data);
      } catch (e) {
        console.error(e);
      }
    };
    checkLiveWorkshop();
  }, []);

  if (!liveWorkshopData) {
    return null;
  }

  return (
    <Box display="flex" alignItems="center" ml={2}>
      <Tooltip
        label={liveWorkshopData?.title}
        placement="bottom"
        hasArrow
        bg="gray.800"
        color="white"
        borderRadius="md"
        fontSize="sm"
      >
        <NextLink href={`/${liveWorkshopData?.language}/workshops/${liveWorkshopData?.slug}`} passHref>
          <Box
            display="inline-flex"
            alignItems="center"
            bg="#EF4444"
            color="white"
            fontWeight="semibold"
            fontSize="xs"
            px={2}
            py="2px"
            borderRadius="full"
            height="fit-content"
            cursor="pointer"
            _hover={{
              bg: '#DC2626',
              transform: 'scale(1.05)',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Text lineHeight="1" mr="1">{t('live-workshop-badge') || 'Live'}</Text>
            <Box w="6px" h="6px" bg="whiteAlpha.800" borderRadius="full" />
          </Box>
        </NextLink>
      </Tooltip>
    </Box>
  );
}

export default LiveWorkshopBadge;
