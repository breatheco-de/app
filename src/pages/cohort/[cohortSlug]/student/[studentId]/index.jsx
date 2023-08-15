/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Box,
  Divider,
  useColorModeValue,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { format } from 'date-fns';
import { ReviewModal, NoInfoModal, DeliverModal, DetailsModal } from '../../../../../js_modules/assignmentHandler/index';
import useStyle from '../../../../../common/hooks/useStyle';
import { usePersistent } from '../../../../../common/hooks/usePersistent';
import bc from '../../../../../common/services/breathecode';
import ReactSelect, { AsyncSelect } from '../../../../../common/components/ReactSelect';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import Heading from '../../../../../common/components/Heading';
import Icon from '../../../../../common/components/Icon';
import Text from '../../../../../common/components/Text';
import DottedTimeline from '../../../../../common/components/DottedTimeline';
import Link from '../../../../../common/components/NextChakraLink';

function StudentReport() {
  const { t } = useTranslation('student');
  const router = useRouter();
  const toast = useToast();
  const { query } = router;
  const { cohortSlug, studentId, academy } = query;
  const [selectedCohortUser, setSelectedCohortUser] = useState(null);
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [currentProject, setCurrentProject] = useState(null);
  const [cohortUsers, setCohortUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
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
  const lang = {
    es: '/es/',
    en: '/',
  };

  useEffect(() => {
    bc.admissions({ users: studentId }).cohortUsers(academy)
      .then((res) => {
        setCohortUsers(res.data);
        setSelectedCohortUser(res.data.find((cohortUser) => cohortUser.cohort.slug === cohortSlug));
      }).catch((e) => {
        console.log(e);
      });
  }, []);

  useEffect(() => {
    if (selectedCohortUser) {
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

          if (syllabusInfo?.data) {
            let projects = syllabusInfo.data.json.days.filter((obj) => obj.assignments && Array.isArray(obj.assignments) && obj.assignments.length > 0 && typeof obj.assignments[0] === 'object').map((obj) => obj.assignments);
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

  return (
    <Box>
      <Box
        paddingBottom="30px"
        maxWidth={{ base: '90%', md: '90%', lg: '1012px' }}
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
                color="#0097CD"
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
        <Flex marginTop="20px" justify="space-between" gap="20px">
          <Box
            borderRadius="17px"
            width="265px"
            padding="12px 16px"
            border="3px solid"
            borderColor={hexColor.featuredColor}
          >
            <Text color={hexColor.fontColor2} fontWeight="700">
              {t('analitics.total-mentorships')}
            </Text>
            <Box display="flex" gap="10px" alignItems="center">
              <Icon
                icon="book"
                color={hexColor.blueDefault}
                width="24px"
                height="24px"
              />
              <Text color={hexColor.fontColor3} size="30px" fontWeight="700">
                100
              </Text>
            </Box>
          </Box>
          <Box
            borderRadius="17px"
            width="265px"
            padding="12px 16px"
            border="3px solid"
            borderColor={hexColor.featuredColor}
          >
            <Text color={hexColor.fontColor2} fontWeight="700">
              {t('analitics.projects-completed')}
            </Text>
            <Box display="flex" gap="10px" alignItems="center">
              <Icon
                icon="bookClosed"
                color={hexColor.blueDefault}
                width="24px"
                height="24px"
              />
              <Text color={hexColor.fontColor3} size="30px" fontWeight="700">
                100
              </Text>
            </Box>
          </Box>
          <Box
            borderRadius="17px"
            width="265px"
            padding="12px 16px"
            border="3px solid"
            borderColor={hexColor.featuredColor}
          >
            <Text color={hexColor.fontColor2} fontWeight="700">
              {t('analitics.percentage-attendance')}
            </Text>
            <Box display="flex" gap="10px" alignItems="center">
              <Icon
                icon="list"
                color={hexColor.blueDefault}
                width="24px"
                height="24px"
              />
              <Text color={hexColor.fontColor3} size="30px" fontWeight="700">
                100
              </Text>
            </Box>
          </Box>
          <Box
            borderRadius="17px"
            width="265px"
            padding="12px 16px"
            border="3px solid"
            borderColor={hexColor.featuredColor}
          >
            <Text color={hexColor.fontColor2} fontWeight="700">
              {t('analitics.completed-learnpack')}
            </Text>
            <Box display="flex" gap="10px" alignItems="center">
              <Icon
                icon="smile"
                color={hexColor.green}
                width="24px"
                height="24px"
              />
              <Text color={hexColor.fontColor3} size="30px" fontWeight="700">
                100
              </Text>
            </Box>
          </Box>
        </Flex>
      </Box>
      <Divider borderBottom="1px solid" color={borderColor} />
      <Flex
        maxWidth={{ base: '90%', md: '90%', lg: '1012px' }}
        margin="2% auto 0 auto"
      >
        <Box width="100%" maxWidth="695px">
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
      </Flex>
    </Box>
  );
}

export default asPrivate(StudentReport);
