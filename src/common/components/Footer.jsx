import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';

const Footer = () => {
  const { t } = useTranslation(['footer']);
  return (
    <Box height="70px" mt="64px" px="4%" alignItems="center" justifyContent="center" display="flex">
      <Text textAlign="center" py="12px" fontSize="10px">
        {t('copyright')}
      </Text>
    </Box>
  );
};

export default Footer;
