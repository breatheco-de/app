import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from '../../styles/Home.module.css';
import Counter from '../common/components/Counter';
import ToggleColor from '../common/components/ToggleColor';
import { H1 } from '../common/styledComponents/Head';

export default function Home() {
  const { t } = useTranslation(['common']);

  return (
    <div className={styles.container}>
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content="Learn with Breatheco.de" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* <Box h="10" bg="tomato">
        <H1 type="h1" className={styles.title}>
          {t('heading')}
          <a href="/">Learn!</a>
        </H1>
      </Box>
      <Box h="10" bg="papayawhip" /> */}
      <main className={styles.main}>
        <H1 type="h1" className={styles.title}>
          {t('heading')}
          <a href="/">Learn!</a>
        </H1>

        <Counter />
        <ToggleColor />
      </main>
      {/* </Grid> */}
    </div>
  );
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'counter', 'navbar'])),
  },
});
