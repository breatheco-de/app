import { useState } from 'react';
import {
  Box, Heading, Button, useColorMode, useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Icon from './Icon';
import Text from './Text';
import AttendanceModal from './AttendanceModal';
import usePersistent from '../hooks/usePersistent';
import { isWindow, getStorageItem } from '../../utils';

const ItemText = ({ text }) => (
  <Text display="flex" whiteSpace="pre-wrap" textAlign="left" textTransform="uppercase" size="12px" color={useColorModeValue('black', 'white')}>
    {text}
  </Text>
);

const ItemButton = ({
  children, actionHandler,
}) => {
  const commonBackground = useColorModeValue('white', 'rgba(255, 255, 255, 0.1)');
  return (
    <Button
      size="lg"
      gridGap="10px"
      width="100%"
      onClick={actionHandler}
      bg={commonBackground}
      _hover={{
        background: `${useColorModeValue('white', 'rgba(255, 255, 255, 0.2)')}`,
      }}
      _active={{
        background: `${useColorModeValue('gray.light', 'rgba(255, 255, 255, 0.22)')}`,
      }}
      borderWidth="0px"
      padding="14px 20px"
      my="8px"
      borderRadius="8px"
      justifyContent="space-between"
    >
      {children}
    </Button>
  );
};

const TeacherSidebar = ({
  title, user, students, width, sortedAssignments,
}) => {
  const { colorMode } = useColorMode();
  const [openAttendance, setOpenAttendance] = useState(false);
  const [cohortSession] = usePersistent('cohortSession', {});
  const accessToken = getStorageItem('accessToken');
  const router = useRouter();

  const { slug, academy } = cohortSession;

  const todayIs = {
    en: format(new Date(), "'Today is' do 'of' MMMM"),
    es: format(new Date(), "'Hoy es' dd 'de' MMMM", { locale: es }),
  };

  const kickoffDate = {
    en: format(new Date(cohortSession.kickoff_date), 'eeee MMMM Mo'),
    es: format(new Date(cohortSession.kickoff_date), "eeee dd 'de' MMMM", { locale: es }),
  };

  const greetings = {
    en: `Hello ${user.first_name}, ${todayIs[router.locale]} and the cohort started taking classes on ${kickoffDate[router.locale]}. Please, select today's module.`,
    es: `Hola ${user.first_name}, ${todayIs[router.locale]} y la cohorte comenzó a tomar clases el ${kickoffDate[router.locale]}. Por favor, selecciona el módulo de hoy.`,
  };

  return (
    <Box
      backgroundColor={colorMode === 'light' ? 'yellow.light' : 'featuredDark'}
      width={width}
      height="auto"
      borderWidth="0px"
      borderRadius="lg"
      overflow="hidden"
      // minWidth="298px"
    >
      <Box p="4" pb="30px" pt="20px">
        <Heading width="100%" fontWeight="900" fontSize="22px" textAlign="left" justify="center" mt="0px" mb="0px">
          {title}
        </Heading>

        <Box pt="3" display="flex" flexDirection="column" alignItems="center">
          {/* Start attendance */}
          <ItemButton actionHandler={() => setOpenAttendance(true)}>
            <ItemText text="Take attendancy" />
            <Box>
              <Icon icon="arrowRight" width="22px" height="22px" />
            </Box>
          </ItemButton>

          {/* Review attendance */}
          <ItemButton
            actionHandler={() => {
              if (cohortSession.bc_id && isWindow) {
                window.open(`https://attendance.breatheco.de/?cohort_slug=${slug}&teacher=${cohortSession.bc_id}&token=${accessToken}&academy=${academy.id}`, '_blank');
              }
            }}
          >
            <ItemText text="Review attendancy" />
            <Box>
              <Icon icon="arrowRight" width="22px" height="22px" />
            </Box>
          </ItemButton>

          {/* Assignments */}
          <ItemButton
            actionHandler={() => {
              if (isWindow) {
                window.open(`https://assignments.breatheco.de/?attempt=1&token=${accessToken}`, '_blank');
              }
            }}
          >
            <ItemText text="Assignments" />
            <Box>
              <Icon icon="arrowRight" width="22px" height="22px" />
            </Box>
          </ItemButton>

          {/* Teacher tutorial */}
          <ItemButton
            actionHandler={() => {
              if (isWindow) {
                window.open('https://www.notion.so/4geeksacademy/Mentor-training-433451eb9dac4dc680b7c5dae1796519', '_blank');
              }
            }}
          >
            <ItemText text="Teacher tutorial" />
            <Box>
              <Icon icon="arrowRight" width="22px" height="22px" />
            </Box>
          </ItemButton>

          {/* Other resources */}
          {/* <ItemButton
            actionHandler={() => {}}
          >
            <ItemText text="Other resources" />
            <Box>
              <Icon icon="arrowRight" width="22px" height="22px" />
            </Box>
          </ItemButton> */}
        </Box>

        <AttendanceModal
          isOpen={openAttendance}
          students={students}
          sortedAssignments={sortedAssignments}
          onClose={() => setOpenAttendance(false)}
          title="Start your today’s class"
          message={greetings[router.locale]}
          width="100%"
        />
      </Box>
    </Box>
  );
};

TeacherSidebar.propTypes = {
  title: PropTypes.string,
  user: PropTypes.objectOf(PropTypes.any),
  students: PropTypes.arrayOf(PropTypes.any),
  width: PropTypes.string,
  sortedAssignments: PropTypes.arrayOf(PropTypes.object),
};

TeacherSidebar.defaultProps = {
  title: 'Actions',
  user: {},
  students: [],
  width: '100%',
  sortedAssignments: [],
};

ItemText.propTypes = {
  text: PropTypes.string,
};
ItemText.defaultProps = {
  text: '',
};

ItemButton.propTypes = {
  children: PropTypes.node,
  actionHandler: PropTypes.func,
};
ItemButton.defaultProps = {
  children: null,
  actionHandler: () => {},
};
export default TeacherSidebar;
