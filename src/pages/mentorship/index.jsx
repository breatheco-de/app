/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Container,
  Flex,
  Heading,
  Divider,
  Text,
  useColorMode,
  Button,
} from '@chakra-ui/react';
import { ArrowUpIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';
import { format } from 'date-fns';
import bc from '../../common/services/breathecode';
import Link from '../../common/components/NextChakraLink';
import Icon from '../../common/components/Icon';
import asPrivate from '../../common/context/PrivateRouteWrapper';
import CustomTheme from '../../../styles/theme';
// import KPI from '../../common/components/KPI';

const Mentorship = () => {
  const { t } = useTranslation('mentorship');
  const { colorMode } = useColorMode();
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  // {
  //   started_after: '2022-05-01',
  //   ended_before: '2022-05-31',
  // }
  useEffect(async () => {
    const { data } = await bc.mentorship().getMySessions();
    console.log(data);
    setSessions(data);
  }, []);

  return (
    <Container maxW="none" padding="0">
      <Container
        key="kpi-container"
        maxW="none"
        paddingRight="20%"
        paddingLeft="10%"
        paddingTop="20px"
        paddingBottom="20px"
      >
        <Link
          href="/"
          display="inline-block"
          padding={{ base: '0px 10px 15px 10px', md: '0' }}
          w="auto"
          borderRadius="15px"
          color="blue.default"
          onClick={(e) => {
            e.preventDefault();
            router.back();
          }}
        >
          {`← ${t('common:goBack')}`}
        </Link>
        <Container
          maxW="none"
          padding="none"
        >
          <Heading as="h2" size="xl">
            {`${t('log')}:`}
          </Heading>
        </Container>
      </Container>
      <Divider borderBottomWidth="2px" />
      <StyledContainer>
        <table>
          <tr className="table-head">
            <th>{t('mentorshipSession')}</th>
            <th>{t('events')}</th>
            <th>{t('billed')}</th>
          </tr>
          {sessions.map((session) => (
            <tr className="table-rows">
              <td
                style={{
                  borderRight: 'none',
                }}
                className="session-date"
              >
                <Text fontSize="md">
                  {`${format(new Date(session.started_at.slice(0, -1)), 'MMMM dd, y, h:mm aaa')}`}
                </Text>
                <Text fontSize="md">
                  {t('with')}
                  {' '}
                  <span style={{ fontWeight: 'bold' }}>{`${session.mentee.first_name} ${session.mentee.last_name}`}</span>
                </Text>
              </td>
              <td
                style={{
                  borderLeft: 'none',
                  borderRight: 'none',
                }}
              >
                <Flex alignItems="center">
                  <Icon style={{ marginRight: '15px' }} icon="dolarSign" width="25px" height="25px" />
                  <Icon style={{ marginRight: '15px' }} icon="dolarSignBroke" width="25px" height="25px" />
                  <Icon style={{ marginRight: '15px' }} icon="ghost" width="25px" height="25px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                  <Icon style={{ marginRight: '15px' }} icon="running" width="25px" height="25px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                  <Icon style={{ marginRight: '15px' }} icon="chronometer" width="25px" height="25px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                  <Button style={{ marginRight: '15px' }} colorScheme="blue.default" variant="link">
                    {t('details')}
                  </Button>
                </Flex>
              </td>
              <td
                style={{
                  borderLeft: 'none',
                }}
              >
                <Text color={session.extra_time ? CustomTheme.colors.danger : ''}>
                  {session.extra_time && <ArrowUpIcon />}
                  {session.billed_str}
                </Text>
              </td>
            </tr>
          ))}
        </table>
      </StyledContainer>
    </Container>

  );
};

const StyledContainer = styled.div`
  width: 100%;
  padding: 20px 10%;

  td:first-child,
  th:first-child {
    border-radius: 25px 0 0 25px;
  }

  // Set border-radius on the top-right and bottom-right of the last table data on the table row
  td:last-child,
  th:last-child {
    border-radius: 0 25px 25px 0;
  }
  table{
    width:100%;
    border-collapse: separate;
    border-spacing: 0 15px;
    .table-head{
      text-align: left;
      th{
        padding-left: 20px;
      }
    }
    .session-date{
      width:35%;
    }
    td{
      border: 1px solid gray;
      padding: 20px;
    }
  }
`;

export default asPrivate(Mentorship);
