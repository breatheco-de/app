/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Container,
  Heading,
  Divider,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';
import { format } from 'date-fns';
import bc from '../../common/services/breathecode';
import Link from '../../common/components/NextChakraLink';
import asPrivate from '../../common/context/PrivateRouteWrapper';
// import KPI from '../../common/components/KPI';

const Mentorship = () => {
  const { t } = useTranslation('mentorship');
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
            <th>Mentorship Session</th>
            <th>Events</th>
            <th>Billed Time</th>
          </tr>
          {sessions.map((session) => (
            <tr className="table-rows">
              <td
                style={{
                  borderRight: 'none',
                }}
              >
                <Text fontSize="md">{format(new Date(session.started_at.slice(0, -1)), 'MMMM dd, y, h:mm aaa')}</Text>
              </td>
              <td
                style={{
                  borderLeft: 'none',
                  borderRight: 'none',
                }}
              >
                millimetres (mm)
              </td>
              <td
                style={{
                  borderLeft: 'none',
                }}
              >
                25.4
              </td>
            </tr>
          ))}
        </table>
      </StyledContainer>
      {/* <TableContainer
        padding="20px 10%"
      >
        <Table
          variant="unstyled"
          // border="none"
          // cellspacing="0"
          // cellpadding="0"
        >
          <Thead>
            <Tr>
              <Th>Mentorship Session</Th>
              <Th>Events</Th>
              <Th>Billed Time</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sessions.map((session) => (
              <Tr
                // marginTop="20px"
                borderRadius="25px"
                border="1px gray solid"
                style={{
                  borderSpacing: '10px',
                }}
              >
                <Td>inches</Td>
                <Td>millimetres (mm)</Td>
                <Td>25.4</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer> */}
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
    }
    td{
      border: 1px solid gray;
      padding: 20px;
    }
  }
`;

export default asPrivate(Mentorship);
