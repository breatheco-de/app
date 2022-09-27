/* eslint-disable no-unused-vars */
import { Box, Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { addMinutes, subMinutes } from 'date-fns';
import styles from '../../styles/Home.module.css';
import LiveEvent from '../common/components/LiveEvent';
import { H1 } from '../common/styledComponents/Head';
import CustomTheme from '../../styles/theme';

export default function Example() {
  const { t } = useTranslation(['common', 'counter']);

  const otherEvents = [{
    title: 'My Wonderful HTML Email Workflow',
    starts_at: addMinutes(new Date(), 40),
    icon: 'group',
    fill: CustomTheme.colors.success,
  }, {
    title: 'Coding Jamming',
    starts_at: addMinutes(new Date(), 90),
    icon: 'codeBg',
  }];

  const otherEvents2 = [{
    title: 'My Wonderful HTML Email Workflow',
    starts_at: subMinutes(new Date(), 40),
    icon: 'group',
    fill: CustomTheme.colors.success,
  }, {
    title: 'Coding Jamming',
    starts_at: addMinutes(new Date(), 15),
    icon: 'codeBg',
  }];

  return (
    <main className={styles.main}>
      <H1 type="h1" className={styles.title}>
        {t('common:heading')}
      </H1>

      <Flex direction="column" justifyContent="center">
        <Box marginBottom="20px">
          <LiveEvent startsAt={subMinutes(new Date(), 40)} otherEvents={otherEvents} />
        </Box>

        <Box marginBottom="20px">
          <LiveEvent startsAt={addMinutes(new Date(), 30)} otherEvents={otherEvents} />
        </Box>

        <Box marginBottom="20px">
          <LiveEvent startsAt={subMinutes(new Date(), 10)} otherEvents={otherEvents2} />
        </Box>

        <Box marginBottom="20px">
          <LiveEvent startsAt={addMinutes(new Date(), 20)} />
        </Box>
      </Flex>

    </main>
  );
}
