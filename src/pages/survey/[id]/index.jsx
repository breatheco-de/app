// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '../../../../styles/Home.module.css';

const Survey = () => {
  const router = useRouter();
  const { id, attempt, token } = router.query;

  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <h2>{id}</h2>
        <h2>{attempt}</h2>
        <h2>{token}</h2>
      </main>
    </div>
  );
};

export default Survey;
