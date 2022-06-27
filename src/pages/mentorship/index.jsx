/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Container,
  Heading,
  Divider,
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
    setSessions(data);
    // console.log(res);
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
      <TableContainer>
        <Table variant="simple">
          <TableCaption>Imperial to metric conversion factors</TableCaption>
          <Thead>
            <Tr>
              <Th>Mentorship Session</Th>
              <Th>Events</Th>
              <Th>Billed Time</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>inches</Td>
              <Td>millimetres (mm)</Td>
              <Td>25.4</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Container>

  );
};

export default asPrivate(Mentorship);
