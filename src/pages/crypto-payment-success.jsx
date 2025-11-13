import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import useStyle from '../hooks/useStyle';
import Icon from '../components/Icon';

export default function CryptoPaymentSuccess() {
  const { hexColor } = useStyle();
  const { t } = useTranslation('signup');
  return (
    <Flex flexDirection="column" alignItems="center" paddingTop="4rem">
      <Flex marginBottom="2rem">
        <Icon icon="4Geeks-avatar" size="290px" background={hexColor.greenLight2} borderRadius="50%" />
      </Flex>
      <Box>
        <Heading>{t('payment-success')}</Heading>
      </Box>
      <Box>
        <Text>{t('wait-a-few-seconds')}</Text>
      </Box>
    </Flex>
  );
}
