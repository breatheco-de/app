import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import styles from '../../styles/Home.module.css';
import { isDevMode } from '../utils';
import ModalToGetAccess, { stage } from '../common/components/ModalToGetAccess';

export const getStaticProps = () => {
  if (!isDevMode) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      seo: {
        unlisted: true,
      },
    },
  };
};

export default function Example() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, setState] = useState('');

  const onClick = (value) => {
    setIsModalOpen(true);
    setState(value);
  };

  return (
    <main className={styles.main}>
      <Button onClick={() => onClick(stage.login)}>
        Open Login
      </Button>
      <Button onClick={() => onClick(stage.signup)}>
        Open Signup
      </Button>

      <ModalToGetAccess
        isOpen={isModalOpen}
        state={state}
        message={state === stage.login && 'In order to compile the code you need to register for free.'}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
