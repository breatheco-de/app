/* eslint-disable max-len */
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
  const [isLoading, setIsLoading] = useState(false);
  // {
  //   started_after: '2022-05-01',
  //   ended_before: '2022-05-31',
  // }
  useEffect(async () => {
    setIsLoading(true);
    let filter = {};
    if (startDate) {
      filter = {
        started_after: format(startDate, 'yyyy-MM-dd'),
        ended_before: format(endOfMonth(startDate), 'yyyy-MM-dd'),
      };
    }
    const { data } = await bc.mentorship(filter).getMySessions();
    setIsLoading(false);
    setSessions(data);
  }, [startDate]);

  // eslint-disable-next-line react/prop-types
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    // eslint-disable-next-line react/button-has-type
    <Button
      size={['md', 'md', 'lg', 'lg']}
      display="inline-block"
      colorScheme="blue"
      variant="ghost"
      onClick={onClick}
      ref={ref}
      marginLeft={['5px', '5px', '10px', '10px']}
    >
      {value || t('common:select')}
      {' '}
      <ChevronDownIcon />
    </Button>
  ));

  const getExtraTime = (str) => str.substr(0, str.indexOf(', the expected duration')).replace('Extra time of ', '');

  const getExpectedTime = (str) => str.substr(str.indexOf(', the expected duration')).replace(', the expected duration was ', '');

  const tooltipsGenerator = (session) => {
    const tooltips = [];
    if (session.mente_joined !== null) {
      tooltips.push({
        icon: 'ghost',
        label: t('ghostLabel'),
      });
    }
    if (session.mentor_late) {
      tooltips.push({
        icon: 'running',
        label: t('mentorLate'),
      });
    }
    if (session.extra_time) {
      tooltips.push({
        icon: 'chronometer',
        label: `${t('extraTime')} ${getExtraTime(session.extra_time)}${t('expectedTime')}${getExpectedTime(session.extra_time)}`,
      });
    }
    if (session.rating) {
      tooltips.push({
        icon: session.rating > 7 ? 'dolarSign' : 'dolarSignBroke',
        label: `${t('rate')} ${session.rating}`,
      });
    }
    return tooltips;
  };

  return (
    <Container maxW="none" padding="0">
      <Container
        className="kpi-container"
        maxW="none"
        // paddingRight="20%"
        paddingLeft={['5%', '5%', '10%', '10%']}
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
          padding="0"
        >
          <Heading
            as="h2"
            // size="lg"
            size={['lg', 'lg', 'xl', 'xl']}
            fontSize={['16px', '16px', '34px', '34px']}
          >
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
              marginLeft={['5px', '5px', '90px', '90px']}
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
            <th className="icons-row-head">{t('events')}</th>
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
                <Flex wrap="wrap" maxWith="250px" className="icons-row-responsive" alignItems="center" marginTop="15px">
                  {tooltipsGenerator(session).map((tooltip) => (
                    <Tooltip label={tooltip.label} fontSize="md" placement="top">
                      <span>
                        <Icon style={{ marginRight: '15px', marginTop: '5px' }} icon={tooltip.icon} width="25px" height="25px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                      </span>
                    </Tooltip>
                  ))}
                  {/* <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px', marginTop: '5px' }} icon="dolarSign" width="25px" height="25px" />
                    </span>
                  </Tooltip>
                  <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px', marginTop: '5px' }} icon="dolarSignBroke" width="25px" height="25px" />
                    </span>
                  </Tooltip>
                  <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px', marginTop: '5px' }} icon="ghost" width="25px" height="25px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                    </span>
                  </Tooltip>
                  <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px', marginTop: '5px' }} icon="running" width="25px" height="25px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                    </span>
                  </Tooltip>
                  <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px', marginTop: '5px' }} icon="chronometer" width="25px" height="25px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                    </span>
                  </Tooltip> */}
                  <Button style={{ marginRight: '15px' }} colorScheme="blue.default" variant="link">
                    {t('details')}
                  </Button>
                </Flex>
              </td>
              <td
                className="icons-row"
                style={{
                  borderLeft: 'none',
                  borderRight: 'none',
                }}
              >
                <Flex alignItems="center">
                  {tooltipsGenerator(session).map((tooltip) => (
                    <Tooltip label={tooltip.label} fontSize="md" placement="top">
                      <span>
                        <Icon style={{ marginRight: '15px' }} icon={tooltip.icon} width="25px" height="25px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                      </span>
                    </Tooltip>
                  ))}
                  {/* <Tooltip label="Ghost" fontSize="md" placement="top">
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
                  </Tooltip> */}
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
        {!isLoading && sessions.length === 0 && (
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
      .icons-row-responsive{
        display: none;
      }
    }
    td{
      border: 1px solid gray;
      padding: 20px;
    }
  }

  @media screen and (max-width: 975px){
    padding: 20px 5%;
    table{
      .icons-row{
        width: 300px;
      }
    }
  }

  @media screen and (max-width: 910px){
    table{
      .session-date{
        width:30%;
      }
    }
  }

  @media screen and (max-width: 810px){
    table{
      .session-date{
        width:auto;
        .icons-row-responsive{
          display: flex;
        }
      }
      .icons-row, .icons-row-head{
        display: none;
      }
    }
  }
`;

export default asPrivate(Mentorship);
