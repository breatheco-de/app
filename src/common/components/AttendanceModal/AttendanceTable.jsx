import { format, formatDistanceStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import {
  TableContainer, Table, Thead, Tr, Th, Tbody, Td,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Icon from '../Icon';

function AttendanceTable({ attendanceTaken }) {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const attendanceLog = [...attendanceTaken.attendanceStudents, ...attendanceTaken.unattendanceStudents];

  const getAttendanceStatus = (data, attended) => {
    const fullName = `${data.user.first_name} ${data.user.last_name}`;
    const dateElapsed = router.locale === 'es'
      ? formatDistanceStrict(
        new Date(attendanceTaken.updated_at),
        new Date(),
        { addSuffix: true, locale: es },
      ) : formatDistanceStrict(
        new Date(attendanceTaken.updated_at),
        new Date(),
        { addSuffix: true },
      );
    return (
      <Tr key={`${data.id} - ${attendanceTaken.updated_at}`}>
        <Td>{data.id}</Td>
        <Td>{fullName}</Td>
        <Td isNumeric>{attendanceTaken.day}</Td>
        {/* <Td>{data.user_agent}</Td> */}
        <Td textAlign="-webkit-center">
          {attended ? (
            <Icon icon="success" width="16px" height="16px" />
          ) : (
            <Icon icon="error" width="16px" height="16px" />
          )}
        </Td>
        <Td>
          {router.locale === 'es'
            ? format(new Date(attendanceTaken.updated_at), 'dd/MM/yyyy')
            : format(new Date(attendanceTaken.updated_at), 'yyyy/MM/dd')}
        </Td>
        <Td>{dateElapsed}</Td>
      </Tr>
    );
  };

  return (
    <TableContainer>
      {attendanceLog.length > 0 && (
      <Table variant="simple" style={{ margin: '0 1.5rem 0 1.5rem' }}>
        <Thead>
          <Tr>
            <Th>{t('common:user-id')}</Th>
            <Th>{t('common:full-name')}</Th>
            <Th isNumeric>{t('common:day')}</Th>
            {/* <Th>{t('common:taken-by')}</Th> */}
            <Th>{t('common:attended')}</Th>
            <Th>{t('common:modification-date')}</Th>
            <Th>{t('common:time-elapsed')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {attendanceTaken.attendanceStudents.map((l) => getAttendanceStatus(l, true))}
          {attendanceTaken.unattendanceStudents.map((l) => getAttendanceStatus(l, false))}
        </Tbody>
      </Table>
      )}
    </TableContainer>
  );
}

AttendanceTable.propTypes = {
  attendanceTaken: PropTypes.shape({
    attendanceStudents: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      user: PropTypes.shape({
        first_name: PropTypes.string,
        last_name: PropTypes.string,
      }),
      user_agent: PropTypes.string,
    })),
    unattendanceStudents: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      user: PropTypes.shape({
        first_name: PropTypes.string,
        last_name: PropTypes.string,
      }),
      user_agent: PropTypes.string,
    })),
    day: PropTypes.number,
    updated_at: PropTypes.string,
  }),
};
AttendanceTable.defaultProps = {
  attendanceTaken: {
    attendanceStudents: [],
    unattendanceStudents: [],
    updated_at: '',
    day: 0,
  },
};

export default AttendanceTable;
