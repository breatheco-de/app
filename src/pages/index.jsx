// import React from 'react';
import { Box } from '@chakra-ui/react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../../styles/Home.module.css';
import Counter from '../common/components/counter';
import { H1 } from '../common/styledComponents/Head';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Learn</title>
        <meta name="description" content="Learn with Breatheco.de" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <H1 type="h1" className={styles.title}>
          Welcome to
          {' '}
          <a href="/">Learn!</a>
        </H1>

        <Counter />
        {/* <div className={styles.grid}> */}
        <Box mt="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
          <a href="/" className={styles.card}>
            <h2>Hola mundo</h2>
          </a>
        </Box>
        {/* </div> */}
      </main>

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
