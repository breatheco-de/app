import { memo, useState } from 'react';
import {
  Box, Heading, Button, useColorMode, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Text from './Text';
// import bc from '../services/breathecode';
import AttendanceModal from './AttendanceModal';
// import usePersistent from '../hooks/usePersistent';

// const isWindow = typeof window !== 'undefined';
// const cohortSession = isWindow ? JSON.parse(localStorage.getItem('cohortSession') || '{}') : {};
// const accessToken = isWindow ? localStorage.getItem('accessToken') : '';

// const academySlug = cohortSession && cohortSession.academy?.slug;
const ItemText = ({ text }) => (
  <Text display="flex" whiteSpace="pre-wrap" textAlign="left" textTransform="uppercase" size="12px" color={useColorModeValue('black', 'white')}>
    {text}
  </Text>
);

const ItemButton = ({ children, actionHandler }) => {
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

// const updateCohortDay = (currentCohort, currentDay) => new Promise((resolve, reject) => {
//   bc.cohort()
//     .update(currentCohort.cohort.id, { current_day: currentDay })
//     .then((data) => {
//       resolve(data);
//       console.log('newDay_started', data);
//       return data;
//     })
//     .catch((error) => reject(error));
// });

const TeacherSidebar = ({
  title, subtitle, width,
}) => {
  const { colorMode } = useColorMode();
  const [openAttendance, setOpenAttendance] = useState(false);
  // const [programMentors, setProgramMentors] = usePersistent('programMentors', []);
  // const commonBorderColor = useColorModeValue('gray.200', 'gray.500');

  return (
    <Box
      backgroundColor={colorMode === 'light' ? 'yellow.light' : 'featuredDark'}
      width={width}
      height="auto"
      borderWidth="0px"
      borderRadius="lg"
      overflow="hidden"
    >
      <Box d="flex" justifyContent="center">
        <Icon icon="sideSupport" width="300px" height="70px" />
      </Box>
      <Box p="4" pb="30px" pt="20px">
        <Box d="flex" alignItems="baseline" justifyContent="center">
          <Heading fontSize="22px" textAlign="center" justify="center" mt="0px" mb="0px">
            {title}
          </Heading>
        </Box>

        <Box d="flex" alignItems="baseline" justifyContent="center">
          <Text size="md" textAlign="center" mt="10px" px="0px">
            {subtitle}
          </Text>
        </Box>

        <Box pt="3" display="flex" flexDirection="column" alignItems="center">
          <ItemButton actionHandler={() => setOpenAttendance(true)}>
            <ItemText text="Take attendancy" />
            <Box>
              <Icon icon="arrowRight" width="22px" height="22px" />
            </Box>
          </ItemButton>
          <ItemButton actionHandler={() => {}}>
            <ItemText text="Review attendancy" />
            <Box>
              <Icon icon="arrowRight" width="22px" height="22px" />
            </Box>
          </ItemButton>
        </Box>

        <AttendanceModal
          isOpen={openAttendance}
          onClose={() => setOpenAttendance(false)}
          title="Start your today’s class"
          message="Hello Paolo, today is 27th of July and the cohort started taking classes on Monday Jun 10th. Please, select your today module."
          width="100%"
          onSubmit={(e, checked) => {
            console.log('onSubmit', checked);
          }}
          handleChangeDay={() => {
            console.log('change day');
          }}
        />
      </Box>
    </Box>
  );
};

TeacherSidebar.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  width: PropTypes.string,
};

TeacherSidebar.defaultProps = {
  title: 'Teacher',
  subtitle: 'Actions',
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
export default memo(TeacherSidebar);
