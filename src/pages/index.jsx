import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  Image, Box, Grid, Text,
} from '@chakra-ui/react';
import styles from '../../styles/Home.module.css';
import Heading from '../common/components/Heading';
import FormHandlerControl from '../common/components/FormHandlerControl';

export default function Home() {
  const { t } = useTranslation(['home']);
  return (
    <div className={styles.container}>
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content="Learn with Breatheco.de" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Grid gridTemplateColumns={{ base: 'repeat(1,1fr)', md: 'repeat(2,1fr)' }} height="100%">
        <Box flex="1">
          <Heading size="xl">{t('welcome')}</Heading>
          <Text>{t('sub_title')}</Text>

          <FormHandlerControl />
        </Box>
        <Box
          flex="1"
          display="flex"
          flexDirection="row"
          justifyContent="center"
          gridGap="10px"
          pt="6%"
        >
          <Box display="flex" width="35%" flexDirection="column" gridGap="10px">
            <Image src="/static/images/person-smile1.png" />
            <Image src="/static/images/person-smile3.png" borderRadius="15px" />
          </Box>
          <Box display="flex" width="35%" flexDirection="column" gridGap="10px">
            <Image src="/static/images/person-smile2.png" />
            <Image src="/static/images/person-smile4.png" />
          </Box>
        </Box>
      </Grid>
    </div>
  );
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['home', 'counter', 'navbar'])),
  },
});
