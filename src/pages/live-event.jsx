/* eslint-disable no-unused-vars */
import { Box, Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import styles from '../../styles/Home.module.css';
import LiveEvent from '../common/components/LiveEvent';
import { H1 } from '../common/styledComponents/Head';
import CustomTheme from '../../styles/theme';

export default function Example() {
  const { t } = useTranslation(['common', 'counter']);

  const otherEvents = [{
    title: 'My Wonderful HTML Email Workflow',
    isLive: false,
    isStarting: false,
    time: '40 min',
    icon: 'group',
    fill: CustomTheme.colors.success,
  }, {
    title: 'Coding Jamming',
    isLive: false,
    isStarting: false,
    time: '6 min',
    icon: 'codeBg',
  }];

  const otherEvents2 = [{
    title: 'My Wonderful HTML Email Workflow',
    isLive: true,
    isStarting: false,
    time: '40 min',
    icon: 'group',
    fill: CustomTheme.colors.success,
  }, {
    title: 'Coding Jamming',
    isLive: false,
    isStarting: false,
    time: '6 min',
    icon: 'codeBg',
  }];

  return (
    <main className={styles.main}>
      <H1 type="h1" className={styles.title}>
        {t('common:heading')}
      </H1>

      <Flex direction="column" justifyContent="center">
        <Box marginBottom="20px">
          <LiveEvent isLive otherEvents={otherEvents} time="40 min" />
        </Box>

        <Box marginBottom="20px">
          <LiveEvent otherEvents={otherEvents} time="30 min" />
        </Box>

        <Box marginBottom="20px">
          <LiveEvent isLive otherEvents={otherEvents2} time="10 min" />
        </Box>

        <Box marginBottom="20px">
          <LiveEvent time="20 min" />
        </Box>
      </Flex>

    </main>
  );
}
