import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import Text from '../../Text';
import { location } from '../../../utils';
import LLM from './LLM';

function Resources() {
  const { t } = useTranslation('profile');

  return (
    <>
      {location?.pathname?.includes('resources') && (
        <Head>
          <title>{t('my-resources')}</title>
        </Head>
      )}
      <Text fontSize="15px" fontWeight="700" pb="6px">
        {t('my-resources')}
      </Text>
      <LLM />
    </>
  );
}

export default Resources;
