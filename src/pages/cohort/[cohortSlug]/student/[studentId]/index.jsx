/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-unused-vars */
import { useState, useEffect, forwardRef } from 'react';
import {
  Box,
  Button,
  Divider,
  useColorModeValue,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { format } from 'date-fns';
import { Form, Formik } from 'formik';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import { ReviewModal, NoInfoModal, DeliverModal, DetailsModal } from '../../../../../js_modules/assignmentHandler/index';
import useStyle from '../../../../../common/hooks/useStyle';
import { usePersistent } from '../../../../../common/hooks/usePersistent';
import DatePickerField from '../../../../../common/components/Forms/DateField';
import bc from '../../../../../common/services/breathecode';
import ReactSelect, { AsyncSelect } from '../../../../../common/components/ReactSelect';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import Heading from '../../../../../common/components/Heading';
import Icon from '../../../../../common/components/Icon';
import Text from '../../../../../common/components/Text';
import DottedTimeline from '../../../../../common/components/DottedTimeline';
import KPI from '../../../../../common/components/KPI';
import Link from '../../../../../common/components/NextChakraLink';

const activitiesTemplate = {
  invite_created: {
    icon: 'registration',
    label: 'invite_created',
  },
  invite_status_updated: {
    icon: 'change-status',
    label: 'invite_status_updated',
  },
  nps_answered: {
    icon: 'survey',
    label: 'survey',
  },
  login: {
    icon: 'login',
    label: 'login',
  },
  open_syllabus_module: {
    icon: 'open',
    label: 'open_syllabus_module',
  },
  read_assignment: {
    icon: 'book',
    label: 'read_assignment',
  },
  assignment_review_status_updated: {
    icon: 'note',
    label: 'assignment_review_status_updated',
  },
  assignment_status_updated: {
    icon: 'assignments',
    label: 'assignment_status_updated',
  },
  event_checkin_created: {
    icon: 'onlinePeople',
    label: 'event_checkin_created',
  },
  event_checkin_assisted: {
    icon: 'attendance',
    label: 'event_checkin_assisted',
  },
  bag_created: {
    icon: 'underlinedPencil',
    label: 'bag_created',
  },
  checkout_completed: {
    icon: 'platform-registration',
    label: 'checkout_completed',
  },
  mentoring_session_scheduled: {
    icon: 'calendar',
    label: 'mentoring_session_scheduled',
  },
  mentorship_session_checkin: {
    icon: 'chronometer',
    label: 'mentorship_session_checkin',
  },
  mentorship_session_checkout: {
    icon: 'success',
    label: 'mentorship_session_checkout',
  },
};

function StudentReport() {
  const { t } = useTranslation('student');
  const router = useRouter();
  const toast = useToast();
  const { query } = router;
  const { cohortSlug, studentId, academy } = query;
  const [selectedCohortUser, setSelectedCohortUser] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  const [activityLabel, setActivityLabel] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [currentProject, setCurrentProject] = useState(null);
  const [cohortUsers, setCohortUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [activities, setActivities] = useState([]);
  const [report, setReport] = useState([]);
  const [studentAssignments, setStudentAssignments] = useState({
    lessons: [],
    projects: [],
    exercises: [],
  });
  const [cohortAssignments, setCohortAssignments] = useState({
    lessons: [],
    projects: [],
    exercises: [],
  });
  const [cohortSession] = usePersistent('cohortSession', {});
  const user = cohortUsers[0]?.user;

  const { hexColor } = useStyle();
  const linkColor = useColorModeValue('blue.default', 'blue.300');
  const borderColor = useColorModeValue('gray.200', 'gray.500');
  const activityLabelPrexif = 'activities-section.activities.';
  const lang = {
    es: '/es/',
    en: '/',
  };

  const activitiesLabels = t('activities-section.activities', {}, { returnObjects: true });
  const activitiesOptions = Object.keys(activitiesLabels).map((act) => ({ label: activitiesLabels[act], value: act }));

  const processActivities = (data) => {
    const sortedActivities = {};

    data.forEach((activity) => {
      const { kind } = activity;
      if (!sortedActivities[kind]) sortedActivities[kind] = activity;
      else if (sortedActivities[kind].timestamp < activity.timestamp) sortedActivities[kind] = activity;
    });

    return Object.values(sortedActivities);
  };

  const attendanceStyles = {
    ATTENDED: hexColor.green,
    ABSENT: hexColor.danger,
    'NO-INFO': hexColor.yellowDefault,
    'NOT-TAKEN': hexColor.fontColor3,
  };

  const getAttendanceStatus = (day) => {
    if (!day) return 'NOT-TAKEN';
    if (day.attendance_ids.includes(Number(studentId))) return 'ATTENDED';
    if (day.unattendance_ids.includes(Number(studentId))) return 'ABSENT';
    return 'NO-INFO';
  };

  useEffect(() => {
    bc.admissions({ users: studentId }).cohortUsers(academy)
      .then((res) => {
        setCohortUsers(res.data);
        setSelectedCohortUser(res.data.find((cohortUser) => cohortUser.cohort.slug === cohortSlug));
      }).catch((e) => {
        console.log(e);
      });
    bc.activity({ user_id: studentId }).getActivity(academy)
      .then((res) => {
        const data = processActivities(res?.data);
        setActivities(data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  useEffect(() => {
    if (selectedCohortUser) {
      const mentorshipQueryObject = { filter: { user_id: selectedCohortUser.user.id, 'meta.cohort': selectedCohortUser.cohort.id }, grouping_function: { count: ['kind'] } };
      const projectsQueryObject = {
        filter: {
          'meta.task_type': 'PROJECT',
          'meta.revision_status': 'APPROVED',
          'meta.user_email': selectedCohortUser.user.email,
          kind: 'assignment_review_status_updated',
          'meta.cohort': selectedCohortUser.cohort.id,
        },
        grouping_function: { count: ['kind'] },
      };
      Promise.all([
        bc
          .cohort({ academy })
          .getAttendance(selectedCohortUser.cohort.slug),
        bc
          .todo({
            academy,
            limit: 1000,
            task_type: 'PROJECT,LESSON,EXERCISE',
            student: studentId,
          })
          .getAssignments({ id: selectedCohortUser.cohort.id, academy }),
        bc.admissions().cohort(selectedCohortUser.cohort.slug, academy),
        bc.activity({ query: JSON.stringify(mentorshipQueryObject), by: 'kind', fields: 'kind' }).getActivityReport(academy),
        bc.activity({ query: JSON.stringify(projectsQueryObject), by: 'kind', fields: 'kind' }).getActivityReport(academy),
      ])
        .then(async (res) => {
          const currentDaysLog = res[0].data;
          const durationInDays = res[2].data?.syllabus_version?.duration_in_days;
          const days = Array.from(Array(durationInDays).keys()).map((i) => {
            const day = i + 1;
            const dayData = currentDaysLog[day];
            return dayData;
          });
          setAttendance(days);
          setStudentAssignments({
            lessons: res[1].data.results.filter((elem) => elem.task_type === 'LESSON'),
            projects: res[1].data.results.filter((elem) => elem.task_type === 'PROJECT'),
            exercises: res[1].data.results.filter((elem) => elem.task_type === 'EXERCISE'),
          });
          const syllabusInfo = await bc.admissions().syllabus(res[2].data.syllabus_version.slug, res[2].data.syllabus_version.version, academy);

          let projects;
          if (syllabusInfo?.data) {
            projects = syllabusInfo.data.json.days.filter((obj) => obj.assignments && Array.isArray(obj.assignments) && obj.assignments.length > 0 && typeof obj.assignments[0] === 'object').map((obj) => obj.assignments);
            projects = [].concat(...projects);
            let lessons = syllabusInfo.data.json.days.filter((obj) => obj.lessons && Array.isArray(obj.lessons) && obj.lessons.length > 0 && typeof obj.lessons[0] === 'object').map((obj) => obj.lessons);
            lessons = [].concat(...lessons);
            let exercises = syllabusInfo.data.json.days.filter((obj) => obj.replits && Array.isArray(obj.replits) && obj.replits.length > 0 && typeof obj.replits[0] === 'object').map((obj) => obj.replits);
            exercises = [].concat(...exercises);
            setCohortAssignments({
              projects,
              lessons,
              exercises,
            });
          }
          const [,,, resMentorships, resProjects] = res;

          const attendanceTaken = days.filter((day) => getAttendanceStatus(day) !== 'NOT-TAKEN');
          const attendancePresent = days.filter((day) => getAttendanceStatus(day) === 'ATTENDED');
          setReport([{
            label: t('analitics.total-mentorships'),
            icon: 'book',
            variationColor: hexColor.blueDefault,
            value: resMentorships.data?.find((obj) => obj.kind === 'mentoring_session_scheduled')?.count__kind,
          }, {
            label: t('analitics.projects-completed'),
            icon: 'bookClosed',
            variationColor: hexColor.blueDefault,
            value: resProjects.data?.find((obj) => obj.kind === 'assignment_review_status_updated')?.count__kind,
            max: projects?.length,
          }, {
            label: t('analitics.percentage-attendance'),
            icon: 'list',
            variationColor: hexColor.blueDefault,
            value: `${(attendancePresent.length * 100) / attendanceTaken.length}%`,
          }]);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [selectedCohortUser]);

  const lessonStyles = {
    COMPLETED: hexColor.green,
    UNREAD: hexColor.danger,
    STARTED: hexColor.yellowDefault,
    'NOT-OPENED': hexColor.fontColor3,
  };

  const getLessonStatus = (lesson) => {
    if (lesson) {
      if (lesson.task_status === 'DONE') return 'COMPLETED';
      if (!lesson.opened_at) return 'UNREAD';
      return 'STARTED';
    }
    return 'NOT-OPENED';
  };

  const projectStyles = {
    APPROVED: { color: hexColor.green },
    REJECTED: { color: hexColor.danger },
    DELIVERED: { color: hexColor.yellowDefault },
    'NOT-OPENED': { borderColor: hexColor.fontColor3 },
    UNDELIVERED: { color: hexColor.fontColor3 },
  };

  const getProjectStatus = (project) => {
    if (!project) return 'NOT-OPENED';
    if (project.revision_status === 'APPROVED') return 'APPROVED';
    if (project.revision_status === 'REJECTED') return 'REJECTED';
    if (project.task_status === 'DONE' && project.revision_status === 'PENDING') return 'DELIVERED';
    return 'UNDELIVERED';
  };

  const exerciseStyles = {
    COMPLETED: { color: hexColor.green },
    'NOT-STARTED': { color: hexColor.fontColor3 },
    'NOT-OPENED': { borderColor: hexColor.fontColor3 },
  };

  const getExerciseStatus = (exercise) => {
    if (exercise) {
      if (exercise.task_status === 'DONE') return 'COMPLETED';
      if (!exercise.opened_at) return 'NOT-STARTED';
    }
    return 'NOT-OPENED';
  };

  const projectStatusLabel = t('project-status', {}, { returnObjects: true });
  const lessonStatusLabel = t('lesson-status', {}, { returnObjects: true });
  const attendanceStatusLabel = t('attendance-status', {}, { returnObjects: true });
  const exerciseStatusLabel = t('exercise-status', {}, { returnObjects: true });

  const attendanceDots = attendance.map((day, i) => {
    const status = getAttendanceStatus(day);
    const label = (
      <>
        <Text textAlign="center">{attendanceStatusLabel[status.toLowerCase()]}</Text>
        <Text textAlign="center">{`${t('common:day')} ${1 + i}`}</Text>
        {day?.updated_at && <Text textAlign="center">{format(new Date(day.updated_at), 'M/dd/yyyy')}</Text>}
      </>
    );
    return { label, color: attendanceStyles[status] };
  });

  const lessonsDots = cohortAssignments.lessons.map((lesson) => {
    const studentLesson = studentAssignments.lessons.find((elem) => elem.associated_slug === lesson.slug);
    const status = getLessonStatus(studentLesson);
    const label = studentLesson ? (
      <>
        <Text textAlign="center">{lessonStatusLabel[status.toLowerCase()]}</Text>
        <Text textAlign="center">{lesson.title}</Text>
        {studentLesson.updated_at && <Text textAlign="center">{format(new Date(studentLesson.updated_at), 'M/dd/yyyy')}</Text>}
      </>
    ) : (
      <>
        <Text textAlign="center">{t('lesson-status.pending')}</Text>
        <Text textAlign="center">{lesson.title}</Text>
      </>
    );
    return { ...lesson, label, color: lessonStyles[status] };
  });

  const projectDots = cohortAssignments.projects.map((project) => {
    const studentProject = studentAssignments.projects.find((elem) => elem.associated_slug === project.slug);
    const status = getProjectStatus(studentProject);
    const label = studentProject ? (
      <>
        <Text textAlign="center">{projectStatusLabel[studentProject.revision_status.toLowerCase()]}</Text>
        <Text textAlign="center">{project.title}</Text>
        {studentProject.updated_at && <Text textAlign="center">{format(new Date(studentProject.updated_at), 'M/dd/yyyy')}</Text>}
      </>
    ) : (
      <Text>{project.title}</Text>
    );

    return {
      ...project,
      label,
      ...studentProject,
      status,
      ...projectStyles[status],
    };
  });

  const exerciseDots = cohortAssignments.exercises.map((exercise) => {
    const studentExercise = studentAssignments.exercises.find((elem) => elem.associated_slug === exercise.slug);
    const status = getExerciseStatus(studentExercise);
    const label = studentExercise ? (
      <>
        <Text textAlign="center">{exerciseStatusLabel[status.toLowerCase()]}</Text>
        <Text textAlign="center">{exercise.title}</Text>
      </>
    ) : (
      <Text>{exercise.title}</Text>
    );

    return {
      ...exercise,
      label,
      ...studentExercise,
      ...exerciseStyles[status],
    };
  });

  const showSingleTask = async (task) => {
    try {
      const { status } = task;
      let file;
      if (status === 'UNDELIVERED' || status === 'REJECTED') {
        const { data } = await bc.todo().deliver({
          id: task.id,
          academy,
        });
        setDeliveryUrl(data.delivery_url);
      } else if (status === 'APPROVED' || status === 'DELIVERED') {
        const assetResp = await bc.lesson().getAsset(task.slug);
        if (assetResp && assetResp.status < 400) {
          const dataAsset = assetResp.data;
          if (!dataAsset?.delivery_formats.includes('url')) {
            const fileResp = await bc.todo().getFile({ id: task.id, academyId: cohortSession?.academy?.id });
            if (fileResp && fileResp.status < 400) {
              file = await fileResp.data;
            }
          }
        }
      }
      setCurrentProject({ ...task, status, file });
    } catch (e) {
      toast({
        position: 'top',
        title: t('alert-message:review-url-error'),
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  const onCloseProject = () => setCurrentProject(null);

  const clearFilters = () => {
    setActivityLabel(null);
    setStartDate(null);
  };

  const filteredActivities = activities.filter((act) => {
    if (!activityLabel && !startDate) return true;

    const filterKind = activityLabel ? act.kind === activityLabel.value : true;
    const filterDate = startDate ? act.timestamp > startDate.toISOString() : true;

    return filterKind && filterDate;
  });

  return (
    <Box>
      <Box
        padding="0 10px 30px 10px"
        maxWidth={{ base: '90%', md: '90%', lg: '1112px' }}
        margin="2% auto 0 auto"
      >
        <Box display="flex" justifyContent="space-between">
          <Link
            href={cohortSession?.selectedProgramSlug || '/choose-program'}
            color={linkColor}
            display="inline-block"
            letterSpacing="0.05em"
            fontWeight="700"
          >
            {`← ${t('back-to')}`}
          </Link>
        </Box>
        {user && (
          <Box
            display="flex"
            flexDirection={{ base: 'column', md: 'row' }}
            gridGap={{ base: '0', md: '10px' }}
            paddingTop="50px"
            alignItems={{ base: 'start', md: 'center' }}
          >
            <Heading
              size="m"
              style={{ margin: '0' }}
              padding={{ base: '0', md: '0 0 5px 0 !important' }}
            >
              {`${user && user.first_name} ${user && user.last_name}`}
            </Heading>
            {selectedCohortUser && (
              <ReactSelect
                unstyled
                color={hexColor.blueDefault}
                fontWeight="700"
                id="cohort-select"
                fontSize="25px"
                placeholder={t('common:select-cohort')}
                noOptionsMessage={() => t('common:no-options-message')}
                value={
                  selectedCohortUser
                    ? {
                      value: selectedCohortUser.cohort.slug,
                      slug: selectedCohortUser.cohort.slug,
                      label: `${selectedCohortUser.cohort.name} (${selectedCohortUser.educational_status})`,
                    }
                    : ''
                }
                onChange={(selected) => {
                  setSelectedCohortUser(
                    cohortUsers.find((opt) => opt.cohort.slug === selected.slug),
                  );
                }}
                options={cohortUsers.map((cohortUser) => ({
                  value: cohortUser.cohort.slug,
                  slug: cohortUser.cohort.slug,
                  label: `${cohortUser.cohort.name} (${cohortUser.educational_status})`,
                }))}
              />
            )}
          </Box>
        )}
        <Flex marginTop="20px" justify="space-between" gap="20px" wrap={{ base: 'wrap', md: 'nowrap' }}>
          {report.map((elem) => (
            <KPI
              label={elem.label}
              icon={elem.icon}
              variationColor={elem.variationColor}
              value={elem.value}
              {...elem}
            />
          ))}
        </Flex>
      </Box>
      <Divider borderBottom="1px solid" color={borderColor} />
      <Flex
        maxWidth={{ base: '90%', md: '90%', lg: '1112px' }}
        margin="auto"
        wrap={{ base: 'wrap', md: 'nowrap' }}
        padding="0 10px"
      >
        <Box width="100%" maxWidth="695px" marginTop="2%">
          <Box marginBottom="20px" width="100%">
            <Heading color={hexColor.fontColor2} size="m">{`${t('relevant-activities')}:`}</Heading>
            <Box marginTop="20px">
              <DottedTimeline
                label={(
                  <Flex gridGap="10px" alignItems="center">
                    <Icon
                      icon="list"
                      color={hexColor.blueDefault}
                      width="20px"
                      height="20px"
                    />
                    <p>{t('attendance')}</p>
                  </Flex>
                )}
                dots={attendanceDots}
              />
            </Box>
          </Box>
          <Box width="100%">
            <Heading color={hexColor.fontColor2} size="m">{`${t('deliverables')}:`}</Heading>
            <Box marginTop="20px">
              <DottedTimeline
                label={(
                  <Flex gridGap="10px" alignItems="center">
                    <Icon
                      icon="book"
                      color={hexColor.blueDefault}
                      width="20px"
                      height="20px"
                    />
                    <p>{t('deliverables-section.lessons')}</p>
                  </Flex>
                )}
                dots={lessonsDots}
              />
            </Box>
            <Box marginTop="20px">
              <DottedTimeline
                onClickDots={showSingleTask}
                label={(
                  <Flex gridGap="10px" alignItems="center">
                    <Icon
                      icon="laptop-code"
                      color={hexColor.blueDefault}
                      width="20px"
                      height="20px"
                    />
                    <p>{t('deliverables-section.projects')}</p>
                  </Flex>
                )}
                dots={projectDots}
              />
            </Box>
            <Box marginTop="20px">
              <DottedTimeline
                label={(
                  <Flex gridGap="10px" alignItems="center">
                    <Icon
                      icon="learnpack"
                      color={hexColor.blueDefault}
                      width="20px"
                      height="20px"
                    />
                    <p>{t('deliverables-section.exercises')}</p>
                  </Flex>
                )}
                dots={exerciseDots}
              />
            </Box>
          </Box>
          <ReviewModal
            currentTask={currentProject}
            projectLink={`https://4geeks.com${
              lang[router.locale]
            }project/${currentProject?.slug}`}
            isOpen={currentProject && currentProject.status === 'DELIVERED'}
            onClose={onCloseProject}
            readOnly
          />
          <NoInfoModal
            isOpen={currentProject && currentProject.status === 'NOT-OPENED'}
            onClose={onCloseProject}
          />
          <DeliverModal
            currentTask={currentProject}
            projectLink={`https://4geeks.com${
              lang[router.locale]
            }project/${currentProject?.slug}`}
            isOpen={currentProject && (currentProject.status === 'UNDELIVERED' || currentProject.status === 'REJECTED')}
            onClose={onCloseProject}
            deliveryUrl={deliveryUrl}
            readOnly
          />
          <DetailsModal
            currentTask={currentProject}
            projectLink={`https://4geeks.com${
              lang[router.locale]
            }project/${currentProject?.slug}`}
            isOpen={currentProject && currentProject.status === 'APPROVED'}
            onClose={onCloseProject}
            readOnly
          />
        </Box>
        <Box
          padding="20px"
          width="100%"
          marginLeft={{ base: 'none', md: '20px' }}
          borderLeftWidth={{ base: 'none', md: '1px' }}
          borderLeftStyle="solid"
          borderLeftColor={borderColor}
          maxWidth={{ base: 'none', md: '300px', lg: '390px' }}
        >
          <Flex justifyContent="space-between">
            <Heading color={hexColor.fontColor2} size="m">{t('activities-section.title')}</Heading>
            <Button
              variant="ghost"
              color={hexColor.blueDefault}
              leftIcon={<Icon icon="filter" width="20px" height="20px" />}
              onClick={() => setOpenFilter(true)}
            >
              {t('common:filters')}
            </Button>
          </Flex>
          {filteredActivities.length === 0 && (
            <Box width="100%" mt="20px">
              <Heading size="xsm" color={hexColor.fontColor2} fontWeight="700">
                {t('activities-section.no-activities')}
              </Heading>
            </Box>
          )}
          <Box padding="0 10px">
            {filteredActivities.map((activity) => {
              const { kind } = activity;
              const template = activitiesTemplate[kind];
              return (
                <Flex my="20px" alignItems="center">
                  <Box padding="10px">
                    <Icon icon={template?.icon} width="18px" height="18px" color={hexColor.blueDefault} />
                  </Box>
                  <Box>
                    <Text textTransform="uppercase" color={hexColor.fontColor2} fontWeight="700">
                      {template?.label ? t(`${activityLabelPrexif}${template.label}`) : kind}
                    </Text>
                    <Text color={hexColor.fontColor2}>
                      {format(new Date(activity.timestamp), 'MM/dd/yyyy')}
                    </Text>
                  </Box>
                </Flex>
              );
            })}
          </Box>
        </Box>
      </Flex>
      <Modal isOpen={openFilter} onClose={() => setOpenFilter(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('common:filters')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Formik>
              <Form>
                <Box marginBottom="10px">
                  <ReactSelect
                    id="activity-select"
                    placeholder={t('filter.activity')}
                    isClearable
                    value={activityLabel || ''}
                    onChange={(selected) => {
                      setActivityLabel(selected || []);
                    }}
                    options={activitiesOptions}
                  />
                </Box>
                <Box position="relative" zIndex="0" marginBottom="10px">
                  <Text fontSize="l" fontWeight="400" marginBottom="10px">
                    {t('filter.date')}
                  </Text>
                  <DatePicker
                    calendarClassName="centerMonth"
                    selected={startDate}
                    onChange={(date) => {
                      setStartDate(date);
                    }}
                    inline
                  />
                </Box>
              </Form>
            </Formik>

          </ModalBody>

          <ModalFooter justifyContent="space-between">
            <Button
              color={hexColor.blueDefault}
              variant="ghost"
              mr={3}
              onClick={clearFilters}
            >
              {t('common:clear-all')}
            </Button>
            {/* <Button colorScheme="blue">
              {t('common:apply-filters')}
            </Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default asPrivate(StudentReport);
