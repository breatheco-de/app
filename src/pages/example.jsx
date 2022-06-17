// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import Image from 'next/image';
import { Box } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
// import ReactPlayer from 'react-player';
import styles from '../../styles/Home.module.css';
import Counter from '../common/components/Counter';
import KPI from '../common/components/KPI';
import { H1 } from '../common/styledComponents/Head';
// import ReactYTPlayer from '../common/components/ReactPlayer';

export const getStaticProps = () => ({
  props: {
    seo: {
      unlisted: true,
    },
  },
});

export default function Example() {
  const { t } = useTranslation(['common', 'counter']);

  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <H1 type="h1" className={styles.title}>
          {t('common:heading')}
        </H1>

        <Counter title={t('counter:title')} resetText={t('counter:resetButton')} />

        <Box display="flex" gridGap="10px">
          <KPI label="student rating" icon="smile" value={8.5} max={10} />
          <KPI label="Total monthly income" unit="$" value={2000} variation="+3.7" />
          <KPI label="Mentor late arrivals" icon="running" variation="2" value={2} max={10} />
          <KPI label="Overtime" icon="chronometer" value={3} max={10} variation="-4" />
          <KPI label="The student didn't arrive" icon="ghost" value={0} max={10} variation="0" />
        </Box>

      </main>
    </div>
  );
}
