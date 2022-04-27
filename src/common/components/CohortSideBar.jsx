/* eslint-disable react/no-array-index-key */
import { memo, useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Divider,
  Grid,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Icon from './Icon';
import Text from './Text';
import AvatarUser from '../../js_modules/cohortSidebar/avatarUser';
import { AvatarSkeleton } from './Skeleton';

const ProfilesSection = ({ title, profiles }) => {
  const { t } = useTranslation('dashboard');
  const [showMoreStudents, setShowMoreStudents] = useState(false);

  // limit the student list to 15 and when "showMoreStudents" is true, show all
  const studentsToShow = showMoreStudents ? profiles : profiles.slice(0, 15);
  return (
    <Box display="block">
      <Heading as="h4" padding="0 0 8px 0" fontSize={15} lineHeight="18px" margin={0}>
        {title}
      </Heading>
      <Grid
        gridAutoRows="3.4rem"
        templateColumns="repeat(auto-fill, minmax(3.5rem, 1fr))"
        gap={0}
      >
        {
          studentsToShow.map((c) => {
            const fullName = `${c.user.first_name} ${c.user.last_name}`;
            return (
              <AvatarUser key={fullName} data={c} />
            );
          })
        }
        {profiles.length > 15 && (
          <Text
            display="flex"
            cursor="pointer"
            variantColor="blue"
            color="blue.default"
            alignItems="center"
            width="auto"
            fontWeight="700"
            size="md"
            onClick={() => setShowMoreStudents(!showMoreStudents)}
          >
            {showMoreStudents ? t('cohortSideBar.show-less') : t('cohortSideBar.show-more')}
          </Text>
        )}
      </Grid>
    </Box>
  );
};

const CohortSideBar = ({
  title, teacherVersionActive, cohort, cohortCity, background, width, containerStyle,
  studentAndTeachers,
}) => {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const { colorMode } = useColorMode();
  const [existsProfilesLoading, setExistsProfilesLoading] = useState(true);
  const teacher = studentAndTeachers.filter((st) => st.role === 'TEACHER');
  const students = studentAndTeachers.filter((st) => st.role === 'STUDENT');
  // const students = studentAndTeachers.filter(
  //   (st) => st.role === 'STUDENT' && st.educational_status === 'ACTIVE'
  // );
  const teacherAssistants = studentAndTeachers.filter((st) => st.role === 'ASSISTANT');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');

  const kickoffDate = {
    en: format(new Date(cohort.kickoff_date), 'MMM do'),
    es: format(new Date(cohort.kickoff_date), 'MMM d', { locale: es }),
  };

  const endingDate = {
    en: format(new Date(cohort.ending_date), 'MMM do'),
    es: format(new Date(cohort.ending_date), 'MMM d', { locale: es }),
  };

  useEffect(() => {
    if (students.length === 0 || teacher.length === 0) {
      setTimeout(() => {
        setExistsProfilesLoading(false);
      }, 4000);
    }
  }, [students]);

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
          {t('cohortSideBar.title')}
        </Heading>
        <Box d="flex" alignItems="center" marginBottom={18}>
          <Icon icon="group" width="39px" height="39px" />
          <Box marginLeft={13}>
            <Heading as="h4" color={commonTextColor} fontSize={15} fontWeight="700" lineHeight="18px" margin={0}>
              {(`${t('cohortSideBar.cohort')} ${teacherVersionActive ? ` | ${router.locale === 'en' ? 'Day' : 'Día'} ${cohort.current_day}` : ''}`) || title}
            </Heading>
            <Text size="l" color={commonTextColor} fontWeight="400" lineHeight="18px" margin={0}>
              {cohortCity}
            </Text>
            {cohort.ending_date !== null && (
              <>
                <Text pt="4px" size="sm" color={commonTextColor} fontWeight="700" lineHeight="18px" margin={0}>
                  {t('cohortSideBar.last-date')}
                  {' '}
                  <Text as="span" size="sm" color={commonTextColor} fontWeight="400" lineHeight="18px" margin={0}>
                    {endingDate[router.locale]}
                  </Text>
                </Text>
                <Text size="sm" color={commonTextColor} fontWeight="700" lineHeight="18px" margin={0}>
                  {t('cohortSideBar.start-date')}
                  {' '}
                  <Text as="span" size="sm" color={commonTextColor} fontWeight="400" lineHeight="18px" margin={0}>
                    {kickoffDate[router.locale]}
                  </Text>
                </Text>
              </>
            )}
          </Box>
        </Box>
        {!teacherVersionActive && teacher.map((el) => {
          const { user } = el;
          const fullName = `${user.first_name} ${user.last_name}`;
          return (
            <Box key={fullName} d="flex" alignItems="center">
              <AvatarUser data={el} />
              <Box marginLeft={13}>
                <Heading as="h4" fontSize={15} fontWeight="700" lineHeight="tight" margin={0}>
                  {t('cohortSideBar.mainTeacher')}
                </Heading>
                <Text size="l" fontWeight="400" lineHeight="18px" margin={0}>
                  {fullName}
                </Text>
              </Box>
            </Box>
          );
        })}
        {teacher.length === 0 && t('cohortSideBar.no-teachers')}
      </Box>
      <Divider margin={0} style={{ borderColor: useColorModeValue('#DADADA', 'gray.700') }} />
      <Box display="flex" flexDirection="column" gridGap="20px" padding="18px 26px">
        {teacherAssistants.length > 0 && (
          <ProfilesSection
            title={t('cohortSideBar.assistant')}
            profiles={teacherAssistants}
          />
        )}
        {students.length !== 0
          ? (
            <ProfilesSection
              title={t('cohortSideBar.classmates')}
              profiles={students}
            />
          ) : (
            <>
              {existsProfilesLoading ? (
                <AvatarSkeleton withText quantity={12} />
              ) : t('cohortSideBar.no-students')}
            </>
          )}
      </Box>
    </Box>
  );
};

ProfilesSection.propTypes = {
  title: PropTypes.string.isRequired,
  profiles: PropTypes.arrayOf(PropTypes.object).isRequired,
};

CohortSideBar.propTypes = {
  width: PropTypes.string,
  title: PropTypes.string,
  teacherVersionActive: PropTypes.bool,
  containerStyle: PropTypes.objectOf(PropTypes.any),
  studentAndTeachers: PropTypes.arrayOf(PropTypes.object),
  cohortCity: PropTypes.string,
  cohort: PropTypes.objectOf(PropTypes.any),
  background: PropTypes.string,
  // handleStudySession: PropTypes.func,
};
CohortSideBar.defaultProps = {
  width: '352px',
  title: '',
  teacherVersionActive: false,
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
  cohort: {},
  background: '',
  // handleStudySession: () => {},
};

export default memo(CohortSideBar);
