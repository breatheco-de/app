import { useState } from 'react';
import {
  Box, Heading, Button, useColorMode, useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import useTranslation from 'next-translate/useTranslation';
import Icon from './Icon';
import Text from './Text';
import AttendanceModal from './AttendanceModal';
import useCohortHandler from '../hooks/useCohortHandler';
import useAuth from '../hooks/useAuth';
import { isValidDate, isWindow } from '../../utils';

function ItemText({ text }) {
  return (
    <Text display="flex" whiteSpace="pre-wrap" textAlign="left" textTransform="uppercase" size="12px" color={useColorModeValue('black', 'white')}>
      {text}
    </Text>
  );
}

function ItemButton({
  children, actionHandler,
}) {
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
}

function TeacherSidebar({
  title, students, width,
}) {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const { colorMode } = useColorMode();
  const [openAttendance, setOpenAttendance] = useState(false);
  const { state } = useCohortHandler();
  const { cohortSession } = state;

  // const accessToken = getStorageItem('accessToken');
  const router = useRouter();
  const { cohortSlug } = router.query;

  // const { slug, academy } = cohortSession;

  const todayIs = {
    en: format(new Date(), "'Today is' do 'of' MMMM"),
    es: format(new Date(), "'Hoy es' dd 'de' MMMM", { locale: es }),
  };
  const formatKickoffDate = isValidDate(cohortSession?.kickoff_date)
    ? new Date(cohortSession.kickoff_date)
    : new Date();

  const kickoffDate = {
    en: format(formatKickoffDate, 'eeee MMMM Mo'),
    es: format(formatKickoffDate, "eeee dd 'de' MMMM", { locale: es }),
  };

  const greetings = {
    en: `Hello ${user?.first_name}, ${todayIs[router.locale]} and the cohort started taking classes on ${kickoffDate[router.locale]}. Please, select today's module.`,
    es: `Hola ${user?.first_name}, ${todayIs[router.locale]} y la cohorte comenzó a tomar clases el ${kickoffDate[router.locale]}. Por favor, selecciona el módulo de hoy.`,
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
        <Heading width="100%" fontWeight="900" fontSize="xsm" textAlign="left" justify="center" mt="0px" mb="0px">
          {title}
        </Heading>

        <Box pt="3" display="flex" flexDirection="column" alignItems="center">
          {/* Start attendance */}
          {cohortSession?.ending_date && (
            <ItemButton actionHandler={() => setOpenAttendance(true)}>
              <ItemText text={t('teacher-sidebar.take-attendancy')} />
              <Box>
                <Icon icon="arrowRight" width="22px" height="22px" />
              </Box>
            </ItemButton>
          )}

          {/* Review attendance */}
          {cohortSession?.ending_date && (
            <ItemButton
              actionHandler={() => {
                window.open(`/cohort/${cohortSlug}/attendance`, '_blank');
              }}
            >
              <ItemText text={t('teacher-sidebar.review-attendancy')} />
              <Box>
                <Icon icon="arrowRight" width="22px" height="22px" />
              </Box>
            </ItemButton>
          )}

          {/* Assignments */}
          <ItemButton
            actionHandler={() => {
              window.open(`/cohort/${cohortSlug}/assignments?academy=${cohortSession?.academy?.id}`, '_blank');
            }}
          >
            <ItemText text={t('teacher-sidebar.assignments')} />
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
            <ItemText text={t('teacher-sidebar.teacher-tutorial')} />
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

        {openAttendance && (
          <AttendanceModal
            isOpen={openAttendance}
            students={students}
            onClose={() => setOpenAttendance(false)}
            title={t('attendance-modal.start-today-class')}
            // title="Start your today's class"
            message={greetings[router.locale]}
            width="100%"
          />
        )}
      </Box>
    </Box>
  );
}

TeacherSidebar.propTypes = {
  title: PropTypes.string,
  students: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  width: PropTypes.string,
};

TeacherSidebar.defaultProps = {
  title: 'Actions',
  students: [],
  width: '100%',
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
