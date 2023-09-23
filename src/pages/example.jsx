import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import styles from '../../styles/Home.module.css';
import { isDevMode } from '../utils';
import ModalToGetAccess, { stageType } from '../common/components/ModalToGetAccess';

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
  const [stage, setStage] = useState('');

  const onClick = (value) => {
    setStage(value);
    setIsModalOpen(true);
  };

  return (
    <main className={styles.main}>
      <Button variant="default" mb="1rem" onClick={() => onClick(stageType.login)}>
        Open modal
      </Button>
      <Button variant="default" onClick={() => onClick(stageType.outOfConsumables)}>
        Open out of Consumables
      </Button>

      <ModalToGetAccess
        isOpen={isModalOpen}
        stage={stage}
        message={stage === stageType.login && 'In order to compile the code you need to register for free.'}
        onClose={() => {
          setIsModalOpen(false);
        }}
      />
    </main>
  );
}
