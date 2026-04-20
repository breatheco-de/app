import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import { Box } from '@chakra-ui/react';
import Text from '../../Text';
import { location } from '../../../utils';
import LLM from './LLM';
import VPS from './VPS';

function Resources() {
  const { t } = useTranslation('profile');

  return (
    <>
      {location?.pathname?.includes('resources') && (
        <Head>
          <title>{t('my-resources')}</title>
        </Head>
      )}
      <Box>
        <Text fontSize="15px" fontWeight="700" mb="3px">
          {t('my-resources')}
        </Text>
        <Text fontSize="14px" color="gray.600" pb="18px">
          {t('my-resources-description')}
        </Text>
      </Box>
      <LLM />
      <VPS />
    </>
  );
}

export default Resources;
