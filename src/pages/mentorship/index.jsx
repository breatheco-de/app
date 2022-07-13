/* eslint-disable no-unused-vars */
import { useState, useEffect, forwardRef } from 'react';
import {
  Container,
  Flex,
  Heading,
  Divider,
  Text,
  useColorMode,
  Button,
  Tooltip,
  Box,
  IconButton,
} from '@chakra-ui/react';
import { ArrowUpIcon, ChevronDownIcon, CloseIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';
import { format, endOfMonth } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  const [startDate, setStartDate] = useState(null);
  // {
  //   started_after: '2022-05-01',
  //   ended_before: '2022-05-31',
  // }
  useEffect(async () => {
    let filter = {};
    if (startDate) {
      filter = {
        started_after: format(startDate, 'yyyy-MM-dd'),
        ended_before: format(endOfMonth(startDate), 'yyyy-MM-dd'),
      };
    }
    const { data } = await bc.mentorship(filter).getMySessions();
    console.log(data);
    setSessions(data);
  }, [startDate]);

  // eslint-disable-next-line react/prop-types
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    // eslint-disable-next-line react/button-has-type
    <Button
      size="lg"
      display="inline-block"
      colorScheme="blue"
      variant="ghost"
      onClick={onClick}
      ref={ref}
    >
      {value || t('common:select')}
      {' '}
      <ChevronDownIcon />
    </Button>
  ));

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
            <Box
              display="inline-block"
              maxW="100px"
            >
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                customInput={<ExampleCustomInput />}
                dateFormat="MM/yyyy"
                showMonthYearPicker
              />
            </Box>
            {startDate && (
            <IconButton
              marginLeft="30px"
              // variant="outline"
              colorScheme="blue"
              aria-label="Clear"
              // fontSize="20px"
              size="xs"
              icon={<CloseIcon />}
              onClick={() => setStartDate(null)}
            />
            )}
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
                  <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px' }} icon="dolarSign" width="25px" height="25px" />
                    </span>
                  </Tooltip>
                  <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px' }} icon="dolarSignBroke" width="25px" height="25px" />
                    </span>
                  </Tooltip>
                  <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px' }} icon="ghost" width="25px" height="25px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                    </span>
                  </Tooltip>
                  <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px' }} icon="running" width="25px" height="25px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                    </span>
                  </Tooltip>
                  <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px' }} icon="chronometer" width="25px" height="25px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                    </span>
                  </Tooltip>
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
        {sessions.length === 0 && (
          <Container
            maxW="none"
            border="1px solid"
            borderRadius="10px"
            textAlign="center"
            padding="10px"
          >
            <Text>{t('common:no-elements')}</Text>
          </Container>
        )}
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
