/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import { useState, useEffect, forwardRef } from 'react';
import {
  Container,
  Flex,
  // Heading,
  Divider,
  // Text,
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
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
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
  const staticData = [{
    id: 1248,
    status: 'STARTED',
    status_message: null,
    mentor: {
      id: 6,
      slug: 'alesanchezr',
      user: {
        id: 1,
        first_name: 'Alejandro',
        last_name: 'Sanchez',
        email: 'aalejo@gmail.com',
        profile: {
          avatar_url: 'https://breathecode.herokuapp.com/static/img/avatar.png',
          github_username: null,
        },
      },
      service: {
        id: 1,
        slug: 'geekpal',
        name: 'GeekPal 1-1 Mentoring',
        status: 'ACTIVE',
        academy: {
          id: 4,
          slug: 'downtown-miami',
          name: '4Geeks Academy Miami',
          logo_url: 'https://storage.googleapis.com/admissions-breathecode/location-downtown-miami',
          icon_url: 'https://breathecode.herokuapp.com/v1/media/file/4geeks-icon-gray-png?',
        },
        logo_url: null,
        duration: '2700.0',
        language: 'en',
        allow_mentee_to_extend: true,
        allow_mentors_to_extend: true,
        max_duration: '7200.0',
        missed_meeting_duration: '600.0',
        created_at: '2021-11-23T16:05:09.848002Z',
        updated_at: '2022-02-28T06:39:26.970344Z',
      },
      status: 'ACTIVE',
      price_per_hour: 0,
      booking_url: 'https://calendly.com/4geeks/30min',
      online_meeting_url: 'https://whereby.com/alesanchezr',
      timezone: 'America/New_York',
      email: null,
      created_at: '2021-11-23T16:59:26.006764Z',
      updated_at: '2022-02-10T18:22:46.302729Z',
    },
    mentee: {
      id: 4082,
      first_name: 'Angelo',
      last_name: 'Maiele',
      email: 'angelomaiele@gmail.com',
      profile: {
        avatar_url: 'https://avatars.githubusercontent.com/u/94421492?v=4',
        github_username: null,
      },
    },
    started_at: '2022-06-16T14:00:23.326725Z',
    ended_at: null,
    mentor_joined_at: null,
    mentor_left_at: null,
    mentee_left_at: null,
    summary: null,
    accounted_duration: null,
    suggested_accounted_duration: null,
    tooltip: 'This mentorship should last no longer than 45 min. <br />Started on 06/16/2022 at 14:00:23. <br />The mentor never joinedThe mentorship has not ended yet. <br />But it was supposed to end after 44 min <br />',
    duration_string: 'Never ended',
    billed_str: '1hr',
    extra_time: null,
    mentor_late: null,
    mente_joined: null,
    rating: null,
  },
  {
    id: 1092,
    status: 'STARTED',
    status_message: null,
    mentor: {
      id: 6,
      slug: 'alesanchezr',
      user: {
        id: 1,
        first_name: 'Alejandro',
        last_name: 'Sanchez',
        email: 'aalejo@gmail.com',
        profile: {
          avatar_url: 'https://breathecode.herokuapp.com/static/img/avatar.png',
          github_username: null,
        },
      },
      service: {
        id: 1,
        slug: 'geekpal',
        name: 'GeekPal 1-1 Mentoring',
        status: 'ACTIVE',
        academy: {
          id: 4,
          slug: 'downtown-miami',
          name: '4Geeks Academy Miami',
          logo_url: 'https://storage.googleapis.com/admissions-breathecode/location-downtown-miami',
          icon_url: 'https://breathecode.herokuapp.com/v1/media/file/4geeks-icon-gray-png?',
        },
        logo_url: null,
        duration: '2700.0',
        language: 'en',
        allow_mentee_to_extend: true,
        allow_mentors_to_extend: true,
        max_duration: '7200.0',
        missed_meeting_duration: '600.0',
        created_at: '2021-11-23T16:05:09.848002Z',
        updated_at: '2022-02-28T06:39:26.970344Z',
      },
      status: 'ACTIVE',
      price_per_hour: 0,
      booking_url: 'https://calendly.com/4geeks/30min',
      online_meeting_url: 'https://whereby.com/alesanchezr',
      timezone: 'America/New_York',
      email: null,
      created_at: '2021-11-23T16:59:26.006764Z',
      updated_at: '2022-02-10T18:22:46.302729Z',
    },
    mentee: {
      id: 4817,
      first_name: 'Karla',
      last_name: 'Cuevas',
      email: 'karlacuevasdesigns@gmail.com',
      profile: {
        avatar_url: 'https://avatars.githubusercontent.com/u/80592328?v=4',
        github_username: null,
      },
    },
    started_at: '2022-06-08T01:58:45.785151Z',
    ended_at: null,
    mentor_joined_at: null,
    mentor_left_at: null,
    mentee_left_at: null,
    summary: null,
    accounted_duration: null,
    suggested_accounted_duration: null,
    tooltip: 'This mentorship should last no longer than 45 min. <br />Started on 06/08/2022 at 01:58:45. <br />The mentor never joinedThe mentorship has not ended yet. <br />But it was supposed to end after 44 min <br />',
    duration_string: 'Never ended',
    billed_str: 'none',
    extra_time: '1hr',
    mentor_late: null,
    mente_joined: null,
    rating: null,
  }];
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
    try {
      const { data } = await bc.mentorship(filter).getMySessions();
      setIsLoading(false);
      setSessions(data);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
      setSessions(staticData);
    }
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
            size="m"
            // size={['lg', 'lg', 'xl', 'xl']}
            // fontSize={['16px', '16px', '34px', '34px']}
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
            <th className="session-date-head">{t('mentorshipSession')}</th>
            <th className="icons-row-head">{t('events')}</th>
            <th className="session-time-head">{t('billed')}</th>
          </tr>
          {sessions.map((session) => (
            <tr className="table-rows">
              <td className="session-date">
                <Text fontSize="md">
                  {`${format(new Date(session.started_at?.slice(0, -1)), 'MMMM dd, y, h:mm aaa')}`}
                </Text>
                <Text fontSize="md">
                  {t('with')}
                  {' '}
                  <span style={{ fontWeight: 'bold' }}>{`${session.mentee?.first_name} ${session.mentee?.last_name}`}</span>
                </Text>
              </td>
              <td className="icons-row">
                <Flex alignItems="center">
                  {/* {tooltipsGenerator(session).map((tooltip) => (
                    <Tooltip label={tooltip.label} fontSize="md" placement="top">
                      <span>
                        <Icon style={{ marginRight: '15px' }} icon={tooltip.icon} width="25px" height="25px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                      </span>
                    </Tooltip>
                  ))} */}
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
              <td className="session-time">
                <Text marginBottom={['10px', '0', '0', '0']} fontSize="md" color={session.extra_time ? CustomTheme.colors.danger : ''}>
                  {session.extra_time && <ArrowUpIcon />}
                  {session.billed_str}
                </Text>
                <Flex wrap="wrap" maxWith="250px" className="icons-row-responsive" alignItems="center">
                  {/* {tooltipsGenerator(session).map((tooltip) => (
                    <Tooltip label={tooltip.label} fontSize="md" placement="top">
                      <span>
                        <Icon style={{ marginRight: '15px', marginTop: '5px' }} icon={tooltip.icon} width="20px" height="20px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                      </span>
                    </Tooltip>
                  ))}
                  <Button style={{ marginRight: '15px' }} colorScheme="blue.default" variant="link">
                    {t('details')}
                  </Button> */}
                  <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px' }} icon="dolarSign" width="20px" height="20px" />
                    </span>
                  </Tooltip>
                  <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px' }} icon="dolarSignBroke" width="20px" height="20px" />
                    </span>
                  </Tooltip>
                  <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px' }} icon="ghost" width="20px" height="20px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                    </span>
                  </Tooltip>
                  <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px' }} icon="running" width="20px" height="20px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                    </span>
                  </Tooltip>
                  <Tooltip label="Ghost" fontSize="md" placement="top">
                    <span>
                      <Icon style={{ marginRight: '15px' }} icon="chronometer" width="20px" height="20px" color={colorMode === 'light' ? '#3A3A3A' : '#FFFFFF'} />
                    </span>
                  </Tooltip>
                  <Button style={{ marginRight: '15px' }} colorScheme="blue.default" variant="link">
                    {t('details')}
                  </Button>
                </Flex>
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
            borderColor="#DADADA"
          >
            <Text fontSize="md">{t('common:no-elements')}</Text>
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
    border-radius: 17px 0 0 17px;
  }

  // Set border-radius on the top-right and bottom-right of the last table data on the table row
  td:last-child,
  th:last-child {
    border-radius: 0 17px 17px 0;
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
      border-right: none;
    }
    .icons-row{
      border-right: none;
      border-left: none;
    }
    .session-time{
      border-left: none;
      .icons-row-responsive{
        display: none;
      }
    }
    td{
      border: 1px solid #DADADA;
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
      }
      .icons-row, .icons-row-head{
        display: none;
      }
      .session-time{
        .icons-row-responsive{
          display: flex;
        }
      }
    }
  }
`;

export default asPrivate(Mentorship);
