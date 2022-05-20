/* eslint-disable react/no-array-index-key */
import { memo, useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Divider,
  Grid,
  useColorMode,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
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
      {title && (
        <Heading as="h4" padding="0 0 8px 0" fontSize={15} lineHeight="18px" margin={0}>
          {title}
        </Heading>
      )}
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
      </Grid>
      {profiles.length > 15 && (
        <Text
          display="flex"
          cursor="pointer"
          color="blue.default"
          alignItems="center"
          width="auto"
          fontWeight="700"
          padding="14px 0 0 0"
          justifyContent="center"
          gridGap="10px"
          size="md"
          onClick={() => setShowMoreStudents(!showMoreStudents)}
        >
          {showMoreStudents ? t('cohortSideBar.show-less') : t('cohortSideBar.show-more')}
          <Box
            as="span"
            display="flex"
            onClick={(e) => e.preventDefault()}
            transition="all .25s ease-in-out"
            transform={showMoreStudents ? 'rotate(-90deg)' : 'rotate(90deg)'}
          >
            <Icon icon="arrowRight" color="#0097CD" width="12px" height="12px" />
          </Box>
        </Text>
      )}
    </Box>
  );
};

const CohortSideBar = ({
  title, teacherVersionActive, cohort, cohortCity, background, width, containerStyle,
  studentAndTeachers,
}) => {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  console.log('cohort:::', cohort);
  const { colorMode } = useColorMode();
  const [activeStudentsLoading, setActiveStudentsLoading] = useState(true);
  const [graduatedStudentsLoading, setGraduatedStudentsLoading] = useState(true);
  const teacher = studentAndTeachers.filter((st) => st.role === 'TEACHER');
  const activeStudents = studentAndTeachers.filter(
    (st) => st.role === 'STUDENT' && st.educational_status === 'ACTIVE',
  );
  const graduatedStudents = studentAndTeachers.filter(
    (st) => st.role === 'STUDENT' && st.educational_status === 'GRADUATED',
  );

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
    if (graduatedStudents.length === 0) {
      setTimeout(() => {
        setGraduatedStudentsLoading(false);
      }, 4000);
    }
    if (activeStudents.length === 0) {
      setTimeout(() => {
        setActiveStudentsLoading(false);
      }, 4000);
    }
  }, []);

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
          <Box id="cohort-dates" marginLeft={13}>
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
            <Box id="cohort-teachers" key={fullName} d="flex" alignItems="center">
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
      <Box id="cohort-students" display="flex" flexDirection="column" gridGap="20px" padding="18px 26px">
        {teacherAssistants.length > 0 && (
          <ProfilesSection
            title={t('cohortSideBar.assistant')}
            profiles={teacherAssistants}
          />
        )}

        {cohort.ending_date === null ? (
          <Tabs display="flex" flexDirection="column" variant="unstyled" gridGap="16px">
            <TabList display="flex" width="100%">
              <Tab
                p="0 14px 14px 14px"
                display="block"
                textAlign="center"
                isDisabled={false}
                textTransform="uppercase"
                fontWeight="900"
                fontSize="13px"
                letterSpacing="0.05em"
                width="100%"
                // height="100%"
                _selected={{
                  color: 'blue.default',
                  borderBottom: '4px solid',
                  borderColor: 'blue.default',
                }}
                _disabled={{
                  opacity: 0.5,
                  cursor: 'not-allowed',
                }}
              >
                {t('cohortSideBar.active-geeks', { studentsLength: activeStudents.length })}
              </Tab>
              <Tab
                p="0 14px 14px 14px"
                display="block"
                textAlign="center"
                isDisabled={false}
                textTransform="uppercase"
                fontWeight="900"
                fontSize="13px"
                letterSpacing="0.05em"
                width="100%"
                // height="100%"
                _selected={{
                  color: 'blue.default',
                  borderBottom: '4px solid',
                  borderColor: 'blue.default',
                }}
                _disabled={{
                  opacity: 0.5,
                  cursor: 'not-allowed',
                }}
              >
                {t('cohortSideBar.graduated-geeks', { studentsLength: graduatedStudents.length })}
              </Tab>
            </TabList>
            <TabPanels p="0">
              <TabPanel p="0">
                {activeStudents.length !== 0
                  ? (
                    <ProfilesSection
                      profiles={activeStudents}
                    />
                  ) : (
                    <>
                      {activeStudentsLoading ? (
                        <AvatarSkeleton pt="0" quantity={15} />
                      ) : t('cohortSideBar.no-active-students')}
                    </>
                  )}
              </TabPanel>
              <TabPanel p="0">
                {graduatedStudents.length !== 0
                  ? (
                    <ProfilesSection
                      profiles={graduatedStudents}
                    />
                  ) : (
                    <>
                      {graduatedStudentsLoading ? (
                        <AvatarSkeleton pt="0" quantity={15} />
                      ) : t('cohortSideBar.no-graduated-students')}
                    </>
                  )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          <>
            {activeStudents.length !== 0
              ? (
                <ProfilesSection
                  title={t('cohortSideBar.classmates')}
                  profiles={activeStudents}
                />
              ) : (
                <>
                  {activeStudentsLoading ? (
                    <AvatarSkeleton withText pt="0" quantity={15} />
                  ) : t('cohortSideBar.no-active-students')}
                </>
              )}
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
