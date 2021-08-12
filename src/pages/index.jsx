import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from '../../styles/Home.module.css';
import Counter from '../common/components/Counter';
import ToggleColor from '../common/components/ToggleColor';
import { H1 } from '../common/styledComponents/Head';
import Module from '../common/components/Module';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation(['common', 'counter']);

  return (
    <div className={styles.container}>
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content="Learn with Breatheco.de" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Link href="/" locale={router.locale === 'en' ? 'es' : 'en'}>
          <button type="button">{t('change-locale')}</button>
        </Link>
        <H1 type="h1" className={styles.title}>
          {t('heading')}
          {' '}
          <a href="/">Learn!</a>
        </H1>

        <Counter title={t('counter:title')} resetText={t('counter:resetButton')} />
        <ToggleColor />
      </main>
      <Module
        title="READ"
        moduleNumber={1}
        paragraph="Introduction to the pre-work"
        resetText="RESETEA"
      />
      <footer className={styles.footer}>
        <a href="/">
          Powered by
          {' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'counter'])),
  },
});
