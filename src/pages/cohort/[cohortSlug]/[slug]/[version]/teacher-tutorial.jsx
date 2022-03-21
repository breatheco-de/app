import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import styles from '../../../../../../styles/Home.module.css';
import { H1 } from '../../../../../common/styledComponents/Head';

export default function Example() {
  const { t } = useTranslation(['common', 'counter']);

  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <H1 type="h1" className={styles.title}>
          {t('common:heading')}
          {' '}
          <Link href="#1">Teacher Tutorial!</Link>
        </H1>
      </main>
    </div>
  );
}
