import { Box, Link } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../common/components/Heading';
import Text from '../common/components/Text';
import Icon from '../common/components/Icon';

const ThankYou = () => {
  const { t } = useTranslation('thank-you');
  const social = t('share-social', {}, { returnObjects: true });
  return (
    <Box display="flex" justifyContent="center" background="linear-gradient(180deg, #EEF9FE 50%, white 50%)" width="100%" height="90vh" textAlign="center">
      <Box borderRadius="20px" p={{ base: '70px 6%', md: '70px 0 0 0' }} m={{ base: 'auto 10px', md: '80px 0 0 0' }} backgroundColor="white" minWidth={{ base: 'auto', md: '700px' }} minHeight={{ base: 'auto', md: '500px' }}>
        <Heading as="h1" size="xl" color="blue.default">
          {t('title')}
        </Heading>
        <Text fontSize="26px" p="10px 0" fontWeight="500">
          {t('you-are-in-waiting-list')}
        </Text>
        <Text fontSize="20px" p="10px 0" color="gray.600" fontWeight="600">
          {t('get-ready-to-learn')}
        </Text>
        <Text fontSize="16px" p="10px 0" margin="0 auto" textAlign="center" color="gray.600" fontWeight="500">
          {t('share-on-social-media')}
          <br />
          {t('motivation-phrase')}
        </Text>

        <Box display="flex" p="40px 0 0 0" justifyContent="center" gridGap={{ base: '22px', md: '35px' }}>
          {social.map((item) => (
            <Link key={item.icon} href={item.link} target="_blank" rel="noopener noreferrer">
              <Icon icon={item.icon} width="50px" height="50px" />
            </Link>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ThankYou;
