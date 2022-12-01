/* eslint-disable no-unused-vars */
import { Box } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import styles from '../../styles/Home.module.css';
import FilterBox from '../common/components/FilterBox';
import { H1 } from '../common/styledComponents/Head';

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
    <main className={styles.main}>
      <H1 type="h1" className={styles.title}>
        {t('common:heading')}
      </H1>

      <Box display="flex" mt="40px" width="100%" justifyContent="center">
        <FilterBox />
      </Box>

    </main>
  );
}
