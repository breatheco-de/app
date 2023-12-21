import { useState } from 'react';
import { Button, Box } from '@chakra-ui/react';
import styles from '../../styles/Home.module.css';
import { isDevMode } from '../utils';
import ModalToGetAccess, { stageType } from '../common/components/ModalToGetAccess';
import { getSubscriptions, validatePlanExistence } from '../common/handlers/subscriptions';
import CodeViewer from '../common/components/CodeViewer';
import useAuth from '../common/hooks/useAuth';
import bc from '../common/services/breathecode';

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
  const { isAuthenticated } = useAuth();
  const [isFetchingEvent, setIsFetchingEvent] = useState(false);
  const [planData, setPlanData] = useState();

  const onClick = (value) => {
    setStage(value);
    setIsModalOpen(true);
  };

  const openEventConsumables = () => {
    if (isAuthenticated) {
      setIsFetchingEvent(true);
      bc.public().singleEvent('crea-una-landing-page-con-html-css-789').then((respEvent) => {
        getSubscriptions().then((subscriptions) => {
          validatePlanExistence(subscriptions).then((data) => {
            setPlanData({
              ...data,
              event: respEvent?.data,
              academyServiceSlug: '',
            });
            setStage(stageType.outOfConsumables);
            setIsModalOpen(true);
          })
            .finally(() => setIsFetchingEvent(false));
        });
      }).catch(() => {
        setIsFetchingEvent(false);
      });
    }
  };

  return (
    <main className={styles.main}>
      <Box width="600px" className="container">
        <CodeViewer languagesData={[{ label: 'JS', language: 'javascript', code: 'console.log(1)' }, { label: 'Python', language: 'python', code: 'print(1)' }]} marginBottom="10px" />
      </Box>
      <Button variant="default" mb="1rem" onClick={() => onClick(stageType.login)}>
        Open modal
      </Button>
      <Button variant="default" mb="1rem" isDisabled={!isAuthenticated} isLoading={isFetchingEvent} onClick={openEventConsumables}>
        Open out of Event consumables
      </Button>

      <ModalToGetAccess
        isOpen={isModalOpen}
        stage={stage}
        externalData={planData}
        message={stage === stageType.login && 'In order to compile the code you need to register for free.'}
        onClose={() => {
          setIsModalOpen(false);
        }}
      />
    </main>
  );
}
