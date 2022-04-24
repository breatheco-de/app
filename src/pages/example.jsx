// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';
import styles from '../../styles/Home.module.css';
import Counter from '../common/components/Counter';
import { H1 } from '../common/styledComponents/Head';
import Heading from '../common/components/Heading';
import ReactPlayer from '../common/components/ReactPlayer';
import OnlyFor from '../common/components/OnlyFor';

export default function Example() {
  const { t } = useTranslation(['common', 'counter']);

  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <Heading type="span" color="black" size="m">
          {`
            component behind: 
            <OnlyFor capabilities={['read_member', 'read_tet']}>
          `}
        </Heading>
        <OnlyFor
          capabilities={['read_member', 'read_test']}
        >
          <Heading type="h3" color="green" size="m" className={styles.title}>
            This text is handled with my current cohort capabilities
          </Heading>
        </OnlyFor>

        <H1 type="h1" className={styles.title}>
          {t('common:heading')}
        </H1>

        <Counter title={t('counter:title')} resetText={t('counter:resetButton')} />

        <ReactPlayer
          width="700px"
          id="https://www.youtube.com/watch?v=BDKdUPDez-U"
          playOnThumbnail
          imageSize="sddefault"
          style={{
            width: '700px',
            objectFit: 'cover',
            aspectRatio: '16/9',
          }}
        />
      </main>
    </div>
  );
}
