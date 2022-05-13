// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';
import ReactPlayer from 'react-player';
import styles from '../../styles/Home.module.css';
import Counter from '../common/components/Counter';
import { H1 } from '../common/styledComponents/Head';
// import ReactYTPlayer from '../common/components/ReactPlayer';

export default function Example() {
  const { t } = useTranslation(['common', 'counter']);

  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <H1 type="h1" className={styles.title}>
          {t('common:heading')}
        </H1>

        <Counter title={t('counter:title')} resetText={t('counter:resetButton')} />

        {/* <ReactYTPlayer
          width="700px"
          id="https://www.youtube.com/watch?v=BDKdUPDez-U"
          playOnThumbnail
          imageSize="sddefault"
          style={{
            width: '700px',
            objectFit: 'cover',
            aspectRatio: '16/9',
          }}
        /> */}
        <div style={{ width: '700px', height: 'auto' }}>
          <ReactPlayer
            className="react-player"
            url={[
              'https://github.com/4GeeksAcademy/calculus-and-algebra-with-python/blob/main/lessons/assets/01-plotting-functions-with-python.mp4?raw=true',
            ]}
            controls
            width="100%"
            height="100%"
          />
        </div>
      </main>
    </div>
  );
}
