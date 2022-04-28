import {
  useMemo, useEffect, useState,
} from 'react';
import {
  Box, Flex, Container, useColorModeValue, Skeleton, useToast,
  Checkbox,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import NextChakraLink from '../../../../../common/components/NextChakraLink';
import TagCapsule from '../../../../../common/components/TagCapsule';
import ModuleMap from '../../../../../js_modules/moduleMap/index';
import CohortSideBar from '../../../../../common/components/CohortSideBar';
import Icon from '../../../../../common/components/Icon';
import SupportSidebar from '../../../../../common/components/SupportSidebar';
import TeacherSidebar from '../../../../../common/components/TeacherSidebar';
import CallToAction from '../../../../../common/components/CallToAction';
import ProgressBar from '../../../../../common/components/ProgressBar';
import Heading from '../../../../../common/components/Heading';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import useAuth from '../../../../../common/hooks/useAuth';
import { ModuleMapSkeleton, SimpleSkeleton } from '../../../../../common/components/Skeleton';
import bc from '../../../../../common/services/breathecode';
import useModuleMap from '../../../../../common/store/actions/moduleMapAction';
import { nestAssignments } from '../../../../../common/hooks/useModuleHandler';
import axios from '../../../../../axios';
import dashboardTR from '../../../../../common/translations/dashboard';
import { usePersistent } from '../../../../../common/hooks/usePersistent';
import { slugify, devLogTable } from '../../../../../utils/index';
import ModalInfo from '../../../../../js_modules/moduleMap/modalInfo';

const Dashboard = () => {
  const { t } = useTranslation('dashboard');
  const { contextState, setContextState } = useModuleMap();
  const [cohortSession, setCohortSession] = usePersistent('cohortSession', {});
  const { cohortProgram } = contextState;
  const [studentAndTeachers, setSudentAndTeachers] = useState([]);
  const [taskCohortNull, setTaskCohortNull] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [sortedAssignments, setSortedAssignments] = usePersistent('sortedAssignments', []);
  const [showPendingTasks, setShowPendingTasks] = useState(false);
  const [taskTodo, setTaskTodo] = usePersistent('taskTodo', []);
  const { user, choose } = useAuth();
  const [, setSyllabus] = usePersistent('syllabus', []);

  const toast = useToast();
  const router = useRouter();
  const locale = router.locale === 'default' ? 'en' : router.locale;
  const { cohortSlug, slug } = router.query;

  const skeletonStartColor = useColorModeValue('gray.300', 'gray.light');
  const skeletonEndColor = useColorModeValue('gray.400', 'gray.400');

  const { supportSideBar } = dashboardTR[locale];

  const profesionalRoles = ['TEACHER', 'ASSISTANT', 'REVIEWER'];

  if (cohortSession?.academy?.id) {
    axios.defaults.headers.common.Academy = cohortSession.academy.id;
  } else {
    router.push('/choose-program');
  }

  const syncTaskWithCohort = async () => {
    const tasksToUpdate = ((taskCohortNull !== undefined) && taskCohortNull).map((task) => ({
      // ...task,
      id: task.id,
      cohort: cohortSession.id,
    }));
    await bc.todo({}).updateBulk(tasksToUpdate)
      .then(({ data }) => {
        setContextState({
          ...contextState,
          taskTodo: [
            ...contextState.taskTodo,
            ...data,
          ],
        });
        setModalIsOpen(false);
      })
      .catch(() => {
        setModalIsOpen(false);
        toast({
          title: t('alert-message:task-cant-sync-with-cohort'),
          // title: 'Some Tasks cannot synced with current cohort',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const removeUnsyncedTasks = async () => {
    const idsParsed = ((taskCohortNull !== undefined) && taskCohortNull).map((task) => task.id).join(','); // 23,2,45,45
    await bc.todo({
      id: idsParsed,
    }).deleteBulk()
      .then(() => {
        toast({
          title: t('alert-message:unsynced-tasks-removed'),
          // title: 'Unsynced tasks successfully removed!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setModalIsOpen(false);
      })
      .catch(() => {
        toast({
          title: t('alert-message:unsynced-tasks-cant-be-removed'),
          // title: 'Some Tasks cannot be removed',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };

  // Fetch cohort data with pathName structure
  useEffect(() => {
    bc.admissions().me().then(({ data }) => {
      const { cohorts } = data;
      // find cohort with current slug
      const findCohort = cohorts.find((c) => c.cohort.slug === cohortSlug);
      const currentCohort = findCohort.cohort;
      const { version, name } = currentCohort.syllabus_version;
      if (!cohortSession.academy.id) {
        router.push('/choose-program');
      }

      setCohortSession({
        ...cohortSession,
        date_joined: data.date_joined,
        cohort_role: findCohort.role,
      });
      choose({
        cohort_slug: cohortSlug,
        date_joined: data.date_joined,
        cohort_role: findCohort.role,
        version,
        slug: currentCohort?.syllabus_version.slug,
        cohort_name: currentCohort.name,
        cohort_id: currentCohort.id,
        syllabus_name: name,
        academy_id: currentCohort.academy.id,
      });
    }).catch(() => {
      router.push('/choose-program');
      toast({
        title: t('alert-message:invalid-cohort-slug'),
        // title: 'Invalid cohort slug',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      setTimeout(() => {
        localStorage.removeItem('cohortSession');
      }, 4000);
    });
  }, [cohortSlug]);

  // Students and Teachers data
  useEffect(() => {
    bc.cohort().getStudents(cohortSlug).then((res) => {
      const { data } = res;
      if (data.length > 0) {
        setSudentAndTeachers(data);
      }
    }).catch((err) => {
      console.error('err_studentAndTeachers:', err);
      toast({
        title: t('alert-message:error-fetching-students-and-teachers'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    });
  }, [cohortSlug]);

  // Fetch cohort assignments (lesson, exercise, project, quiz)
  useEffect(() => {
    if (user && user.active_cohort) {
      const academyId = user.active_cohort.academy_id;
      const { version } = user.active_cohort;
      // setCohortSession({
      //   ...cohortSession,
      //   bc_id: user.id,
      // });

      // Fetch cohortProgram and TaskTodo then apply to contextState (useModuleMap - action)
      Promise.all([
        bc.todo({ cohort: cohortSession.id }).getTaskByStudent(), // Tasks with cohort id
        bc.syllabus().get(academyId, slug, version), // cohortProgram
      ]).then((
        [taskTodoData, programData],
      ) => {
        const technologiesArray = programData.data.main_technologies
          ? programData.data.main_technologies.split(',').map((el) => el.trim())
          : [];

        setCohortSession({
          ...cohortSession,
          main_technologies: technologiesArray,
          bc_id: user.id,
        });
        setSyllabus(programData.data.json.days);
        setContextState({
          taskTodo: taskTodoData.data,
          cohortProgram: programData.data,
        });
      }).catch((err) => {
        console.log('err_fetching_cohort-assignemnts:', err);
        router.push('/choose-program');
      });
    }
  }, [user]);

  useEffect(() => {
    // Tasks with cohort null
    if (router.asPath === cohortSession.selectedProgramSlug) {
      bc.todo({ cohort: null }).getTaskByStudent()
        .then(({ data }) => {
          devLogTable('(Response Fetched) All Tasks With Cohort null:', data);
          const filteredUnsyncedCohortTasks = sortedAssignments.flatMap(
            (assignment) => data.filter(
              (task) => assignment.modules.some(
                (module) => task.associated_slug === module.slug,
              ),
            ),
          );

          setModalIsOpen(filteredUnsyncedCohortTasks.length !== 0);
          setTaskCohortNull(filteredUnsyncedCohortTasks);
        });
    }
  }, [sortedAssignments]);

  // Sort all data fetched in order of taskTodo
  useMemo(() => {
    const cohortDays = cohortProgram.json ? cohortProgram.json.days : [];
    const assignmentsRecopilated = [];
    if (contextState.cohortProgram.json && contextState.taskTodo) {
      setTaskTodo(contextState.taskTodo);
      cohortDays.map((assignment) => {
        const {
          id, label, description, lessons, replits, assignments, quizzes,
        } = assignment;
        const nestedAssignments = nestAssignments({
          id,
          read: lessons,
          practice: replits,
          code: assignments,
          answer: quizzes,
          taskTodo: contextState.taskTodo,
        });
        const { modules, filteredModules, filteredModulesByPending } = nestedAssignments;

        // Data to be sent to [sortedAssignments] = state
        const assignmentsStruct = {
          id,
          label,
          description,
          modules,
          filteredModules,
          filteredModulesByPending,
          teacherInstructions: assignment.teacher_instructions,
          extendedInstructions: assignment.extended_instructions,
          keyConcepts: assignment['key-concepts'],
        };

        // prevent duplicates when a new module has been started (added to sortedAssignments array)
        const keyIndex = assignmentsRecopilated.findIndex((x) => x.id === id);
        if (keyIndex > -1) {
          assignmentsRecopilated.splice(keyIndex, 1, {
            ...assignmentsStruct,
          });
        } else {
          assignmentsRecopilated.push({
            ...assignmentsStruct,
          });
        }

        const filterEmptyModules = assignmentsRecopilated.filter(
          (l) => l.modules.length > 0,
        );
        return setSortedAssignments(filterEmptyModules);
      });
    }
  }, [contextState.cohortProgram, contextState.taskTodo, router]);

  const getDailyModuleData = () => {
    const dailyModule = sortedAssignments.find(
      (assignment) => assignment.id === cohortSession?.current_module,
    );
    return dailyModule;
  };
  const dailyModuleData = getDailyModuleData() || '';

  const onlyStudentsActive = studentAndTeachers.filter(
    (x) => x.role === 'STUDENT' && x.educational_status === 'ACTIVE',
  );

  const modulesExists = sortedAssignments.some(
    (assignment) => assignment.filteredModules.length !== 0,
  );

  return (
    <Container maxW="container.xl">
      <Box width="fit-content" marginTop="18px" marginBottom="48px">
        <NextChakraLink
          href="/choose-program"
          display="flex"
          flexDirection="row"
          alignItems="center"
          onClick={() => {
            setSortedAssignments([]);
            setSyllabus([]);
          }}
          fontWeight="700"
          gridGap="12px"
          color="#0097CF"
          _focus={{ boxShadow: 'none', color: '#0097CF' }}
        >
          <Icon
            icon="arrowLeft"
            width="20px"
            height="20px"
            style={{ marginBottom: '-4px', marginRight: '7px' }}
            color="#0097CF"
          />
          {t('backToChooseProgram')}
        </NextChakraLink>
      </Box>

      <ModalInfo
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        title={t('unsynced.title', { taskLength: taskCohortNull.length })}
        description={t('unsynced.description')}
        handlerColorButton="blue"
        rejectHandler={() => removeUnsyncedTasks()}
        forceHandler
        rejectData={{
          title: t('unsynced.reject-unsync-title'),
          closeText: t('unsynced.cancel'),
          handlerText: t('unsynced.confirm'),
        }}
        closeText={t('unsynced.unsync')}
        actionHandler={() => syncTaskWithCohort()}
        handlerText={t('unsynced.sync')}
      />
      <Flex
        justifyContent="space-between"
        flexDirection={{
          base: 'column', sm: 'column', md: 'row', lg: 'row',
        }}
      >
        <Box width="100%" minW={{ base: 'auto', md: 'clamp(300px, 60vw, 770px)' }}>
          {(cohortSession?.syllabus_version?.name || cohortProgram.name) ? (
            <Heading as="h1" size="xl">
              {cohortSession.syllabus_version.name || cohortProgram.name}
            </Heading>
          ) : (
            <Skeleton
              startColor={skeletonStartColor}
              endColor={skeletonEndColor}
              height="60px"
              width="100%"
              borderRadius="10px"
            />
          )}

          {cohortSession?.main_technologies ? (
            <TagCapsule containerStyle={{ padding: '6px 18px 6px 18px' }} tags={cohortSession.main_technologies} separator="/" />
          ) : (
            <SimpleSkeleton
              height="34px"
              width="290px"
              padding="6px 18px 6px 18px"
              margin="18px 0"
              borderRadius="30px"
            />
          )}
          <Box
            display={{ base: 'flex', md: 'none' }}
            flexDirection="column"
            gridGap="30px"
            // minWidth={{ base: 'auto', md: 'clamp(250px, 30vw, 380px)' }}
          >
            {profesionalRoles.includes(cohortSession?.cohort_role) && (
              <TeacherSidebar
                title={t('teacher-sidebar.actions')}
                user={user}
                students={onlyStudentsActive}
                sortedAssignments={sortedAssignments}
                width="100%"
              />
            )}
            <CohortSideBar
              teacherVersionActive={profesionalRoles.includes(cohortSession?.cohort_role)}
              cohort={cohortSession}
              studentAndTeachers={studentAndTeachers}
              cohortCity={cohortSession?.name}
              width="100%"
            />
            {!profesionalRoles.includes(cohortSession?.cohort_role) && (
              <SupportSidebar
                title={supportSideBar.title}
                subtitle={supportSideBar.description}
                actionButtons={supportSideBar.actionButtons}
                width="100%"
              />
            )}
          </Box>
          {
            cohortSession.current_module && dailyModuleData && (
              <CallToAction
                background="blue.default"
                margin="40px 0 auto 0"
                title={t('callToAction.title')}
                href={`#${dailyModuleData && slugify(dailyModuleData.label)}`}
                text={dailyModuleData.description}
                buttonText={t('callToAction.buttonText')}
                width={{ base: '100%', md: 'fit-content' }}
              />
            )
          }

          <Box marginTop="36px">
            <ProgressBar
              taskTodo={taskTodo}
              progressText={t('progressText')}
              width="100%"
            />
          </Box>

          <Box height={useColorModeValue('1px', '2px')} bg={useColorModeValue('gray.200', 'gray.700')} marginY="32px" />

          <Box display="flex" justifyContent="space-between" gridGap="18px">
            <Heading as="h2" fontWeight="900" size="15px" textTransform="uppercase">{t('moduleMap')}</Heading>
            {modulesExists && (
              <Checkbox textAlign="right" gridGap="10px" display="flex" flexDirection="row-reverse" onChange={(e) => setShowPendingTasks(e.target.checked)} color="gray.600">
                {t('modules.show-pending-tasks')}
              </Checkbox>
            )}
          </Box>
          <Box
            id="module-map"
            marginTop="30px"
            gridGap="24px"
            display="flex"
            flexDirection="column"
          >
            {sortedAssignments.length >= 1 ? (
              <>
                {sortedAssignments.map((assignment, i) => {
                  const {
                    label, description, filteredModules, modules, filteredModulesByPending,
                  } = assignment;
                  const index = i;
                  return (
                    <ModuleMap
                      key={index}
                      userId={user.id}
                      cohortSession={cohortSession}
                      taskCohortNull={taskCohortNull}
                      contextState={contextState}
                      setContextState={setContextState}
                      index={index}
                      title={label}
                      slug={slugify(label)}
                      description={description}
                      taskTodo={taskTodo}
                      modules={modules}
                      filteredModules={filteredModules}
                      showPendingTasks={showPendingTasks}
                      filteredModulesByPending={filteredModulesByPending}
                    />
                  );
                })}
              </>
            ) : <ModuleMapSkeleton />}

          </Box>

        </Box>
        <Box width="5rem" />
        <Box
          display={{ base: 'none', md: 'flex' }}
          flexDirection="column"
          gridGap="30px"
          minWidth={{ base: 'auto', md: 'clamp(250px, 32vw, 380px)' }}
        >
          {profesionalRoles.includes(cohortSession?.cohort_role) && (
            <TeacherSidebar
              title={t('teacher-sidebar.actions')}
              user={user}
              students={onlyStudentsActive}
              sortedAssignments={sortedAssignments}
              width="100%"
            />
          )}
          <CohortSideBar
            teacherVersionActive={profesionalRoles.includes(cohortSession?.cohort_role)}
            studentAndTeachers={studentAndTeachers}
            cohort={cohortSession}
            cohortCity={cohortSession?.name}
            width="100%"
          />
          {!profesionalRoles.includes(cohortSession?.cohort_role) && (
            <SupportSidebar
              title={supportSideBar.title}
              subtitle={supportSideBar.description}
              actionButtons={supportSideBar.actionButtons}
              width="100%"
            />
          )}
        </Box>
      </Flex>
    </Container>
  );
};

export default asPrivate(Dashboard);
