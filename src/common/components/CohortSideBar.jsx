/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-nested-ternary */
/* eslint-disable brace-style */
import { memo, useState, useEffect } from 'react';
// import { w3cwebsocket as W3CWebSocket } from 'websocket';
import {
  Box, Heading, Divider, Grid, Tabs,
  TabList, Tab, TabPanels, TabPanel, useToast, AvatarGroup, useMediaQuery, Flex,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { format, differenceInWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import bc from '../services/breathecode';
import axios from '../../axios';
import Icon from './Icon';
import Text from './Text';
import AvatarUser from '../../js_modules/cohortSidebar/avatarUser';
import { AvatarSkeleton } from './Skeleton';
import useOnline from '../hooks/useOnline';
import useStyle from '../hooks/useStyle';
import useCohortHandler from '../hooks/useCohortHandler';
import useProgramList from '../store/actions/programListAction';
import { isWindow } from '../../utils';

function ProfilesSection({
  title, paginationProps, isTeacherVersion, setAlumniGeeksList, profiles, wrapped, teacher, withoutPopover, showButton,
}) {
  const { t } = useTranslation('dashboard');
  const [showMoreStudents, setShowMoreStudents] = useState(false);
  const { usersConnected } = useOnline();
  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');
  const { hexColor } = useStyle();

  const assistantMaxLimit = isBelowTablet ? 3 : 4;

  const studentsToShow = showMoreStudents ? profiles : profiles?.slice(0, 15);
  const teacherData = teacher[0];
  const teacherfullName = `${teacherData?.user?.first_name} ${teacherData?.user.last_name}`;

  const alumniGeeksContainer = isWindow && document.querySelector('.alumni-geeks-container');

  return (
    <Box display="block">
      {title && (
        <Heading as="h4" padding="0 0 8px 0" fontSize={15} lineHeight="18px" margin={0}>
          {title}
        </Heading>
      )}
      {wrapped ? (
        <Box display="flex" justifyContent="space-between">
          {!!teacherData && (
            <AvatarUser
              width="48px"
              height="48px"
              key={`${teacherData.id} - ${teacherData.user.first_name}`}
              fullName={teacherfullName}
              data={teacherData}
              isOnline={usersConnected?.includes(teacherData.user.id)}
              badge
              customBadge={(
                <Box position="absolute" bottom="-6px" right="-8px" background="blue.default" borderRadius="50px" p="5px" border="2px solid white">
                  <Icon icon="teacher1" width="12px" height="12px" color="#FFFFFF" />
                </Box>
              )}
            />
          )}
          <AvatarGroup max={assistantMaxLimit}>
            {
              studentsToShow?.map((c, i) => {
                const fullName = `${c.user.first_name} ${c.user.last_name}`;
                const isOnline = usersConnected?.includes(c.user.id);
                return (
                  <AvatarUser
                    width="48px"
                    height="48px"
                    index={i}
                    key={`${c.id} - ${c.user.first_name}`}
                    isWrapped
                    fullName={fullName}
                    data={c}
                    isOnline={isOnline}
                    badge
                  />
                );
              })
            }
          </AvatarGroup>
        </Box>
      ) : (
        <Grid
          className={paginationProps && 'alumni-geeks-container'}
          gridAutoRows="3.4rem"
          templateColumns="repeat(auto-fill, minmax(3.5rem, 1fr))"
          gap={0}
          maxH={showMoreStudents ? '270px' : 'auto'}
          height={showMoreStudents ? '100%' : 'auto'}
          overflowY="auto"
        >
          {
            studentsToShow?.map((c) => {
              const fullName = `${c.user.first_name} ${c.user.last_name}`;
              const isOnline = usersConnected?.includes(c.user.id);
              return (
                <AvatarUser
                  key={`${c.id} - ${c.user.first_name}`}
                  fullName={fullName}
                  data={c}
                  isTeacherVersion={isTeacherVersion}
                  isOnline={isOnline}
                  badge
                  withoutPopover={withoutPopover}
                />
              );
            })
          }
        </Grid>
      )}

      {paginationProps && (
        <Box display={profiles.length <= 15 && 'none'} justifyContent="center" gridGap="10px">
          <Box
            color="blue.default"
            cursor="pointer"
            opacity={1}
            fontSize="15px"
            display="flex"
            alignItems="center"
            gridGap="10px"
            letterSpacing="0.05em"
            justifyContent="center"
            padding="14px 0 0 0"
            fontWeight="700"
            onClick={() => {
              if (paginationProps.next) {
                setShowMoreStudents(true);
                axios.get(paginationProps.next)
                  .then(({ data }) => {
                    const cleanedData = [...profiles, ...data.results];
                    setAlumniGeeksList({
                      ...data,
                      results: cleanedData.sort(
                        (a, b) => a.user.first_name.localeCompare(b.user.first_name),
                      ),
                    });
                    setTimeout(() => {
                      alumniGeeksContainer?.scrollTo({
                        top: alumniGeeksContainer?.scrollHeight,
                        behavior: 'smooth',
                      });
                    }, [600]);
                  });
              } else {
                setShowMoreStudents(!showMoreStudents);
              }
            }}
          >
            {paginationProps.next ? t('common:load-more') : showMoreStudents ? t('cohortSideBar.show-less') : t('cohortSideBar.show-more')}
            <Box
              as="span"
              display="block"
              transform={paginationProps.next ? 'rotate(-90deg)' : (showMoreStudents ? 'rotate(90deg)' : 'rotate(-90deg)')}
            >
              <Icon icon="arrowLeft2" width="18px" height="10px" />
            </Box>
          </Box>
        </Box>
      )}

      {showButton && profiles?.length > 15 && (
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
          trigger={showMoreStudents ? 'click' : 'hover'}
        >
          {showMoreStudents ? t('cohortSideBar.show-less') : t('cohortSideBar.show-more')}
          <Box
            as="span"
            display="flex"
            onClick={(e) => e.preventDefault()}
            transition="all .25s ease-in-out"
            transform={showMoreStudents ? 'rotate(-90deg)' : 'rotate(90deg)'}
          >
            <Icon icon="arrowRight" color={hexColor.blueDefault} width="12px" height="12px" />
          </Box>
        </Text>
      )}
    </Box>
  );
}

function CohortSideBar({
  title, teacherVersionActive, width, containerStyle,
  studentAndTeachers, isDisabled,
}) {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const toast = useToast();
  const { slug } = router.query;
  const [alumniGeeksList, setAlumniGeeksList] = useState({});
  const [activeStudentsLoading, setActiveStudentsLoading] = useState(true);
  const [graduatedStudentsLoading, setGraduatedStudentsLoading] = useState(true);
  const { addTeacherProgramList } = useProgramList();
  const { state } = useCohortHandler();
  const { cohortSession: cohort } = state;
  const cohortCity = cohort?.name;
  const teacher = studentAndTeachers.filter((st) => st?.role === 'TEACHER');
  const activeStudents = studentAndTeachers.filter(
    (st) => st?.role === 'STUDENT' && ['ACTIVE', 'GRADUATED'].includes(st?.educational_status),
  );
  const studentsJoined = alumniGeeksList.results?.filter(
    (st) => st.role === 'STUDENT',
  );

  const teacherAssistants = studentAndTeachers.filter((st) => st.role === 'ASSISTANT');
  const { featuredColor, hexColor, lightColor, borderColor } = useStyle();

  const kickoffDate = {
    en: format(new Date(cohort.kickoff_date), 'MMM do'),
    es: format(new Date(cohort.kickoff_date), 'MMM d', { locale: es }),
  };

  const endingDate = {
    en: format(new Date(cohort.ending_date), 'MMM do'),
    es: format(new Date(cohort.ending_date), 'MMM d', { locale: es }),
  };

  // Alumni Geeks data
  useEffect(() => {
    if (slug) {
      bc.cohort({
        limit: 60,
        roles: 'STUDENT',
        syllabus: slug,
        distinct: true,
      }).getFilterStudents()
        .then(({ data }) => {
          setAlumniGeeksList({
            ...data,
            results: data.results.sort(
              (a, b) => a.user.first_name.localeCompare(b.user.first_name),
            ),
          });
        }).catch(() => {
          toast({
            position: 'top',
            title: t('alert-message:error-fetching-alumni-geeks'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
        });
    }
  }, [slug]);

  useEffect(() => {
    if (studentsJoined?.length === 0) {
      setTimeout(() => {
        setGraduatedStudentsLoading(false);
      }, 2500);
    }
    if (activeStudents?.length === 0) {
      setTimeout(() => {
        setActiveStudentsLoading(false);
      }, 4000);
    }
  }, [studentsJoined]);

  useEffect(() => {
    if (studentAndTeachers?.length > 0) {
      addTeacherProgramList({ teacher, assistant: teacherAssistants });
    }
  }, [router?.query?.cohortSlug, studentAndTeachers?.length]);

  const isBeforeOneWeek = (date) => {
    // Calculate the difference in weeks between the given date and today
    const weeksDifference = differenceInWeeks(new Date(), date);

    // Check if the difference is greater than 1
    return weeksDifference <= 1;
  };

  const recentlyLogedStudents = activeStudents.filter((elem) => elem.user?.last_login && elem?.user?.last_login && isBeforeOneWeek(new Date(elem?.user?.last_login)));
  const activeAndRecent = cohort?.ending_date ? activeStudents : recentlyLogedStudents;

  return (
    <Box
      transition="background 0.2s ease-in-out"
      width={width}
      style={containerStyle}
      borderRadius="16px"
      overflow="hidden"
      border={`1.5px solid ${hexColor.blueDefault}`}
    >
      <Heading
        as="h4"
        width="100%"
        padding="16px 21px"
        background={featuredColor}
        fontSize="16px"
        fontWeight="900"
        margin={0}
        letterSpacing="0.05em"
        textAlign="center"
        display="flex"
        justifyContent="center"
        alignItems="center"
        gridGap="10px"
      >
        <Icon icon="group2" width="26px" height="26px" color="#000" />
        <Box as="p">
          {isDisabled ? t('cohortSideBar.about-cohort') : t('cohortSideBar.title')}
        </Box>
      </Heading>
      <Flex padding="24px 26px" alignItems="center">
        <Icon icon="group" width="41px" height="41px" />
        <Box id="cohort-dates" marginLeft={13}>
          <Heading as="h4" color={lightColor} fontSize={15} fontWeight="700" lineHeight="18px" margin={0}>
            {isDisabled
              ? t('cohortSideBar.about-cohort')
              : (`${t('cohortSideBar.cohort')} ${teacherVersionActive ? ` | ${router.locale === 'en' ? 'Day' : 'Día'} ${cohort.current_day}` : ''}`) || title}
          </Heading>
          <Text size="l" color={lightColor} fontWeight="400" lineHeight="18px" margin={0}>
            {cohortCity}
          </Text>
          {cohort.ending_date !== null && (
            <>
              <Text pt="4px" size="sm" color={lightColor} fontWeight="700" lineHeight="18px" margin={0}>
                {t('cohortSideBar.last-date')}
                {' '}
                <Text as="span" size="sm" color={lightColor} fontWeight="400" lineHeight="18px" margin={0}>
                  {endingDate[router.locale]}
                </Text>
              </Text>
              <Text size="sm" color={lightColor} fontWeight="700" lineHeight="18px" margin={0}>
                {t('cohortSideBar.start-date')}
                {' '}
                <Text as="span" size="sm" color={lightColor} fontWeight="400" lineHeight="18px" margin={0}>
                  {kickoffDate[router.locale]}
                </Text>
              </Text>
            </>
          )}
        </Box>
      </Flex>
      <Divider margin={0} style={{ borderColor }} />
      <Box id="cohort-students" display="flex" flexDirection="column" gridGap="20px" padding="18px 26px">
        {teacherAssistants.length > 0 && (
          <ProfilesSection
            wrapped
            title={t('common:teachers')}
            teacher={teacher}
            profiles={teacherAssistants}
          />
        )}
        <Tabs display="flex" flexDirection="column" variant="unstyled" gridGap="16px">
          <TabList display="flex" width="100%">
            {activeAndRecent.length >= 1 && (
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
                borderBottom="4px solid"
                borderColor="gray.350"
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
                {cohort.ending_date
                  ? t('cohortSideBar.classmates', { studentsLength: activeStudents?.length || 0 })
                  : t('cohortSideBar.active-geeks', { studentsLength: activeAndRecent.length || 0 })}
              </Tab>
            )}
            {alumniGeeksList?.count && (
              <Tab
                p="0 14px 14px 14px"
                display="block"
                textAlign="center"
                isDisabled={alumniGeeksList.count === 0}
                textTransform="uppercase"
                fontWeight="900"
                fontSize="13px"
                letterSpacing="0.05em"
                width="100%"
                borderBottom="4px solid"
                borderColor="gray.350"
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
                {t('cohortSideBar.alumni-geeks', { studentsLength: alumniGeeksList.count || 0 })}
              </Tab>
            )}
          </TabList>
          <TabPanels p="0">
            {(activeAndRecent.length >= 1 || activeStudentsLoading) && (
              <TabPanel p="0">
                {activeAndRecent.length !== 0
                  ? (
                    <ProfilesSection
                      showButton
                      isTeacherVersion={teacherVersionActive}
                      profiles={activeAndRecent}
                    />
                  ) : (
                    <>
                      {activeStudentsLoading ? (
                        <AvatarSkeleton pt="0" quantity={15} />
                      ) : t('cohortSideBar.no-active-students')}
                    </>
                  )}
              </TabPanel>
            )}
            <TabPanel p="0">
              {studentsJoined?.length !== 0
                ? (
                  <ProfilesSection
                    profiles={studentsJoined}
                    isTeacherVersion={teacherVersionActive}
                    setAlumniGeeksList={setAlumniGeeksList}
                    paginationProps={alumniGeeksList}
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
      </Box>
    </Box>
  );
}

ProfilesSection.propTypes = {
  title: PropTypes.string,
  paginationProps: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  setAlumniGeeksList: PropTypes.oneOfType([PropTypes.func, PropTypes.any]),
  profiles: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  wrapped: PropTypes.bool,
  teacher: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  withoutPopover: PropTypes.bool,
  showButton: PropTypes.bool,
  isTeacherVersion: PropTypes.bool,
};

ProfilesSection.defaultProps = {
  title: '',
  paginationProps: null,
  setAlumniGeeksList: () => {},
  profiles: [],
  wrapped: false,
  teacher: [],
  withoutPopover: false,
  showButton: false,
  isTeacherVersion: false,
};

CohortSideBar.propTypes = {
  width: PropTypes.string,
  title: PropTypes.string,
  teacherVersionActive: PropTypes.bool,
  containerStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  studentAndTeachers: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  isDisabled: PropTypes.bool,
  // handleStudySession: PropTypes.func,
};
CohortSideBar.defaultProps = {
  width: '352px',
  title: '',
  teacherVersionActive: false,
  containerStyle: {},
  studentAndTeachers: [],
  isDisabled: false,
  // handleStudySession: () => {},
};

export default memo(CohortSideBar);
