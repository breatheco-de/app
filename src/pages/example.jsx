import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import styles from '../../styles/Home.module.css';
import { isDevMode } from '../utils';
import ModalToGetAccess, { stageType } from '../common/components/ModalToGetAccess';
import MktInfoCards from '../common/components/MktInfoCards';
import { getSubscriptions, validatePlanExistence } from '../common/handlers/subscriptions';
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

  const description = `The current traditional teaching methods focus on theoretical aspects, neglecting hands-on experience and student engagement, leading to high dropout rates and slow skill acquisition. Bootcamps and similar platforms offer faster, more interactive learning but lack a scientific approach. 

  <br><br>We propose a holistic framework based on four key metrics to create highly effective learning environments. Our solution leverages cutting-edge tech for cost-effective, scalable education, addressing motivation, efficiency, and accessibility.
  `;

  const cardDescription = 'Hundreds of interactive exercises, projects, and lessons are available thanks to LearnPack, our interactive engine.';
  return (
    <main className={styles.main}>
      <MktInfoCards
        subTitle="Learn the science behind 4Geeks"
        title="Mastering Technical Knowledge"
        description={description}
        cardOneIcon="brain"
        cardOneColor="#A4FFBD"
        cardOneTitle="Memory retention"
        cardOneDescription={cardDescription}
        cardTwoIcon="message"
        cardTwoColor="yellow"
        cardTwoTitle="Feedback quality"
        cardTwoDescription={cardDescription}
        cardThreeIcon="code"
        cardThreeColor="#B2E7FF"
        cardThreeTitle="Feedback quality"
        cardThreeDescription={cardDescription}
        cardFourIcon="people"
        cardFourColor="#FFBEBE"
        cardFourTitle="Motivation"
        cardFourDescription={cardDescription}
      />
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
