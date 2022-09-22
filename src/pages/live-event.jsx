/* eslint-disable no-unused-vars */
import { Box, Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import styles from '../../styles/Home.module.css';
import KPI from '../common/components/KPI';
import LiveEvent from '../common/components/LiveEvent';
import { H1 } from '../common/styledComponents/Head';

export default function Example() {
  const { t } = useTranslation(['common', 'counter']);
  const randomLabels = {
    0: 'Tomatoes',
    1: 'Apple',
    2: 'Pears',
    3: 'Avocado',
  };

  const [randomRumber, setRandomRumber] = useState('0');
  const [randomValue, setRandomValue] = useState(0.0001);
  const [randomLabel, setRandomLabel] = useState('Tomatoes');

  const [randomRumber2, setRandomRumber2] = useState('0');
  const [randomValue2, setRandomValue2] = useState(0.0001);
  const [randomLabel2, setRandomLabel2] = useState('Avocado');
  useEffect(() => {
    setTimeout(() => {
      const randomOperator = Math.random() < 0.5 ? '-' : '+';
      setRandomRumber(`${randomOperator}${(Math.random() * 10).toFixed(1)}`);
      setRandomValue(((Math.random() * 13) * 12.2).toFixed(2));
      setRandomLabel(randomLabels[Math.floor(Math.random() * 4)]);
    }, 3500);
    setTimeout(() => {
      const randomOperator = Math.random() < 0.5 ? '-' : '+';
      setRandomRumber2(`${randomOperator}${(Math.random() * 10).toFixed(1)}`);
      setRandomValue2(((Math.random() * 12) * 32.2).toFixed(2));
      setRandomLabel2(randomLabels[Math.floor(Math.random() * 4)]);
    }, 4500);
  }, [randomRumber]);

  return (
    <main className={styles.main}>
      <H1 type="h1" className={styles.title}>
        {t('common:heading')}
      </H1>

      <Flex direction="column" justifyContent="center">
        <LiveEvent />
      </Flex>

      <Box display="grid" mt="40px" width="100%" padding={{ base: '0 4vw', md: '0 8vw' }} gridTemplateColumns="repeat(auto-fill, minmax(15rem, 1fr))" gridGap="10px">
        <LiveEvent />
        {/* <KPI label="Mentor late arrivals" icon="running" variation="2" value={2} max={10} />
        <KPI label={randomLabel2} unit="$" value={randomValue2} variation={randomRumber2} />
        <KPI label="Overtime" icon="chronometer" value={3} max={10} variation="-4" />
        <KPI label="The student didn't arrive" icon="ghost" value={0} max={10} variation="0" /> */}
      </Box>

    </main>
  );
}
