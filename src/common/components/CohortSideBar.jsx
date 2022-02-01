/* eslint-disable react/no-array-index-key */
import {
  Box,
  Heading,
  Divider,
  Grid,
  Link,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Text from './Text';
import AvatarUser from '../../js_modules/cohortSidebar/avatarUser';

const CohortSideBar = ({
  title,
  cohortCity,
  background,
  width,
  handleStudySession,
  containerStyle,
  cohortSideBarTR,
  studentAndTeachers,
}) => {
  const { colorMode } = useColorMode();
  const teacher = studentAndTeachers.filter((st) => st.role === 'TEACHER');
  const students = studentAndTeachers.filter((st) => st.role === 'STUDENT');
  const teacherAssistants = studentAndTeachers.filter((st) => st.role === 'ASSISTANT');

  return (
    <Box
      transition="background 0.2s ease-in-out"
      width={width}
      style={containerStyle}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={colorMode === 'light' ? background || 'blue.light' : 'featuredDark'}
    >
      <Box padding={26}>
        <Heading
          as="h4"
          fontSize={15}
          fontWeight="900"
          margin={0}
          lineHeight="18px"
          letterSpacing="0.05em"
          marginBottom={18}
          textTransform="uppercase"
        >
          {cohortSideBarTR.title || 'ABOUT YOUR COHORT'}
        </Heading>
        <Box d="flex" alignItems="center" marginBottom={18}>
          <Icon icon="group" width="39px" height="39px" />
          <Box marginLeft={13}>
            <Heading as="h4" fontSize={15} fontWeight="700" lineHeight="18px" margin={0}>
              {cohortSideBarTR.cohort || title}
            </Heading>
            <Text size="l" fontWeight="400" lineHeight="18px" margin={0}>
              {cohortCity}
            </Text>
          </Box>
        </Box>
        {teacher && teacher.map((el) => {
          const { user } = el;
          const fullName = `${user.first_name} ${user.last_name}`;
          return (
            <Box key={fullName} d="flex" alignItems="center">
              <AvatarUser data={el} />
              <Box marginLeft={13}>
                <Heading as="h4" fontSize={15} fontWeight="700" lineHeight="tight" margin={0}>
                  {cohortSideBarTR.mainTeacher || 'Main Teacher'}
                </Heading>
                <Text size="l" fontWeight="400" lineHeight="18px" margin={0}>
                  {fullName}
                </Text>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Divider margin={0} style={{ borderColor: useColorModeValue('#DADADA', 'gray.700') }} />
      <Box padding="0 26px">
        <Heading as="h4" padding="25px 0 8px 0" fontSize={15} lineHeight="18px" margin={0}>
          {cohortSideBarTR.assistant || 'Assistant Professors'}
        </Heading>
        {teacherAssistants && (
          <>
            <Grid
              gridAutoRows="3.4rem"
              templateColumns="repeat(auto-fill, minmax(3.5rem, 1fr))"
              gap={0}
            >
              {teacherAssistants.map((a) => {
                const fullName = `${a.user.first_name} ${a.user.last_name}`;
                return (
                  <AvatarUser key={fullName} data={a} />
                );
              })}
            </Grid>
          </>
        )}
        <Heading as="h4" padding="25px 0 8px 0" fontSize={15} lineHeight="18px" margin={0}>
          {cohortSideBarTR.classmates || 'Your Classmates'}
        </Heading>
        <Grid
          gridAutoRows="3.4rem"
          templateColumns="repeat(auto-fill, minmax(3.5rem, 1fr))"
          gap={0}
        >
          {students.map((c) => {
            const fullName = `${c.user.first_name} ${c.user.last_name}`;
            return (
              <AvatarUser key={fullName} data={c} />
            );
          })}
        </Grid>
      </Box>
      <Box textAlign="center" padding="30px 0">
        <Link
          href="/"
          color="blue.default"
          fontWeight="700"
          fontSize={15}
          lineHeight="22px"
          letterSpacing="0.05em"
          onClick={handleStudySession}
        >
          Create a study session
        </Link>
      </Box>
    </Box>
  );
};

CohortSideBar.propTypes = {
  width: PropTypes.string,
  title: PropTypes.string,
  containerStyle: PropTypes.objectOf(PropTypes.any),
  studentAndTeachers: PropTypes.arrayOf(PropTypes.object),
  cohortCity: PropTypes.string,
  assistant: PropTypes.arrayOf(PropTypes.object),
  classmates: PropTypes.arrayOf(PropTypes.object),
  background: PropTypes.string,
  handleStudySession: PropTypes.func,
  cohortSideBarTR: PropTypes.objectOf(PropTypes.any),
};
CohortSideBar.defaultProps = {
  width: '352px',
  title: '',
  containerStyle: {},
  studentAndTeachers: [
    {
      id: 688,
      user: {
        id: 545,
        first_name: 'Fake',
        last_name: 'Student',
        email: 'fake_mail+1@gmail.com',
      },
      role: 'STUDENT',
      finantial_status: null,
      educational_status: 'GRADUATED',
      created_at: '2020-11-09T17:02:18.273000Z',
    },
    {
      id: 753,
      user: {
        id: 584,
        first_name: 'Carlos',
        last_name: 'Maldonado',
        email: 'carlos234213ddewcdzxc@gmail.com',
      },
      role: 'STUDENT',
      finantial_status: null,
      educational_status: 'GRADUATED',
      created_at: '2020-11-09T17:02:18.600000Z',
    },
    {
      id: 2164,
      user: {
        id: 1563,
        first_name: 'Felipe',
        last_name: 'Valenzuela',
        email: 'felipe_+43@gmail.com',
      },
      role: 'TEACHER',
      finantial_status: null,
      educational_status: null,
      created_at: '2020-11-09T17:02:33.773000Z',
    },
    {
      id: 2308,
      user: {
        id: 1593,
        first_name: 'Hernan',
        last_name: 'Garcia',
        email: 'hernan.jkd@gmail.com',
      },
      role: 'ASSISTANT',
      finantial_status: null,
      educational_status: null,
      created_at: '2020-11-09T17:02:34.279000Z',
    },
  ],
  cohortCity: 'Miami Downtown',
  assistant: [
    {
      active: false,
      image: '',
      name: 'Jhon dude',
    },
  ],
  classmates: [
    {
      active: true,
      image: '',
      name: 'jhon',
    },
  ],
  background: '',
  handleStudySession: () => {
  },
  cohortSideBarTR: {},
};

export default CohortSideBar;
