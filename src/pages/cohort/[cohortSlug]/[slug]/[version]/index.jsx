import {
  Fragment, useMemo, useEffect, useState,
} from 'react';
import {
  Box, Flex, Container, useColorModeValue, Skeleton,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import mockData from '../../../../../common/utils/mockData/DashboardView';
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
import { ModuleMapSkeleton } from '../../../../../common/components/Skeleton';
import bc from '../../../../../common/services/breathecode';
import useModuleMap from '../../../../../common/store/actions/moduleMapAction';
import { nestAssignments, startDay } from '../../../../../common/hooks/useModuleHandler';
import axios from '../../../../../axios';
import dashboardTR from '../../../../../common/translations/dashboard';
import TasksRemain from '../../../../../js_modules/moduleMap/tasksRemain';
import usePersistent from '../../../../../common/hooks/usePersistent';
import useSyllabus from '../../../../../common/store/actions/syllabusActions';
import { slugify } from '../../../../../utils/index';

const Dashboard = () => {
  const { contextState, setContextState } = useModuleMap();
  // const [cohortProgram, setNewCohortProgram] = usePersistent('cohortProgram', {});
  // const [taskTodo, setTaskTodo] = usePersistent('taskTodo', []);
  const [cohortSession, setCohortSession] = usePersistent('cohortSession', {});

  const { cohortProgram } = contextState;
  // const [cohortProgram, setNewCohortProgram] = useState({});
  // const [taskTodo, setTaskTodo] = useState([]);

  // const [startedTasks, setStartedTasks] = useState([]);
  const [studentAndTeachers, setSudentAndTeachers] = useState([]);
  const [sortedAssignments, setSortedAssignments] = useState([]);
  const { user, choose } = useAuth();
  const { setSyllabus } = useSyllabus();

  const router = useRouter();
  const { cohortSlug, slug } = router.query;

  const skeletonStartColor = useColorModeValue('gray.300', 'gray.light');
  const skeletonEndColor = useColorModeValue('gray.400', 'gray.400');

  const {
    cohortSideBar, supportSideBar, backToChooseProgram, progressText, callToAction,
  } = dashboardTR[router.locale];

  const {
    tapCapsule, progressBar,
  } = mockData;

  axios.defaults.headers.common.Academy = cohortSession?.academy.id || '';

  // Fetch cohort data with pathName structure
  useEffect(() => {
    bc.admissions().me().then((res) => {
      const { cohorts } = res.data;
      // find cohort with current slug
      const findCohort = cohorts.find((c) => c.cohort.slug === cohortSlug);
      const currentCohort = findCohort?.cohort;
      const { version, name } = currentCohort?.syllabus_version;
      choose({
        cohort_slug: cohortSlug,
        version,
        slug: currentCohort?.syllabus_version.slug,
        cohort_name: currentCohort.name,
        cohort_id: currentCohort.id,
        syllabus_name: name,
        academy_id: currentCohort.academy.id,
      });
    });
  }, []);

  // Students and Teachers data
  useEffect(() => {
    if (user && user.active_cohort) {
      const cohortId = user.active_cohort.cohort_slug;

      bc.cohort().getStudents(cohortId).then((res) => {
        const { data } = res;
        if (data.length > 0) {
          setSudentAndTeachers(data);
        }
      }).catch((err) => {
        console.error('err_studentAndTeachers:', err);
      });

      bc.cohort().get(cohortId).then(({ data }) => {
        setCohortSession({ ...cohortSession, ...data });
      }).catch((err) => {
        console.error('err_cohortSessoin:', err);
      });
    }
  }, [user]);

  // Fetch cohort assignments (lesson, exercise, project, quiz)
  useEffect(() => {
    if (user && user.active_cohort) {
      const academyId = user.active_cohort.academy_id;
      const { version } = user.active_cohort;

      // Fetch cohortProgram and TaskTodo then apply to contextState (useModuleMap - action)
      Promise.all([
        bc.syllabus().get(academyId, slug, version),
        bc.todo().getTaskByStudent(),
      ]).then(([programData, taskTodoData]) => {
        setSyllabus(programData.data.json.days);
        setContextState({
          taskTodo: taskTodoData.data,
          cohortProgram: programData.data,
        });
      }).catch((err) => {
        console.log('err_fetching_cohort-assignemnts:', err);
      });
    }
  }, [user]);

  // Sort all data fetched in order of taskTodo
  useMemo(() => {
    const cohortDays = cohortProgram.json ? cohortProgram.json.days : [];
    if (contextState.cohortProgram.json && contextState.taskTodo) {
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
        const { filteredModules, modules } = nestedAssignments;

        // prevent duplicates when a new module has been started (added to sortedAssignments array)
        const keyIndex = sortedAssignments.findIndex((x) => x.id === id);
        if (keyIndex > -1) {
          sortedAssignments.splice(keyIndex, 1, {
            id, label, description, modules, filteredModules,
          });
        } else {
          sortedAssignments.push({
            id, label, description, modules, filteredModules,
          });
        }
        return setSortedAssignments(sortedAssignments);
      });
    }
  }, [contextState.cohortProgram, contextState.taskTodo]);

  const getDailyModuleData = () => {
    const dailyModule = sortedAssignments[cohortSession.current_module];
    return dailyModule;
  };
  const dailyModuleData = getDailyModuleData() || '';
  return (
    <Container maxW="container.xl">
      <Box marginTop="18px" marginBottom="48px">
        <NextChakraLink
          href="/choose-program"
          display="flex"
          flexDirection="row"
          alignItems="center"
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
          {backToChooseProgram}
        </NextChakraLink>
      </Box>
      <Flex
        justifyContent="space-between"
        flexDirection={{
          base: 'column', sm: 'column', md: 'row', lg: 'row',
        }}
      >
        <Box width="100%" minW={{ base: 'auto', md: '770px' }}>
          {cohortProgram.name ? (
            <Heading as="h1" size="xl">
              {cohortProgram.name}
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
          <TagCapsule containerStyle={{ padding: '6px 18px 6px 18px' }} tags={tapCapsule.tags} separator={tapCapsule.separator} />

          <Box display={{ base: 'block', md: 'none' }}>
            {/* TODO: cambiar user.roles por Cohort Role */}
            {
              user?.roles[0].role === 'teacher' || user?.roles[0].role === 'assistant' ? (
                <Box marginTop="30px">
                  <TeacherSidebar
                    title="Teacher"
                    user={user}
                    students={studentAndTeachers.filter((x) => x.role === 'STUDENT')}
                    subtitle="Actions"
                    sortedAssignments={sortedAssignments}
                    studentAndTeachers={studentAndTeachers}
                    actionButtons={supportSideBar.actionButtons}
                    width="100%"
                  />
                </Box>
              ) : (
                <>
                  <CohortSideBar
                    cohortSideBarTR={cohortSideBar}
                    studentAndTeachers={studentAndTeachers}
                    cohortCity={cohortSession.name}
                    containerStyle={{
                      margin: '30px 0 0 0',
                    }}
                    width="100%"
                  />
                  <Box marginTop="30px">
                    <SupportSidebar
                      title={supportSideBar.title}
                      subtitle={supportSideBar.description}
                      actionButtons={supportSideBar.actionButtons}
                      width="100%"
                    />
                  </Box>
                </>
              )
            }
          </Box>

          <CallToAction
            background="blue.default"
            margin="40px 0 auto 0"
            title={callToAction.title}
            href={`#${dailyModuleData && slugify(dailyModuleData.label)}`}
            text={dailyModuleData.description}
            buttonText={callToAction.buttonText}
            width={{ base: '100%', md: 'fit-content' }}
          />

          <Box marginTop="36px">
            <ProgressBar
              taskTodo={contextState.taskTodo}
              programs={progressBar.programs}
              progressText={progressText}
              width="100%"
            />
          </Box>

          <Box height={useColorModeValue('1px', '2px')} bg={useColorModeValue('gray.200', 'gray.700')} marginY="32px" />

          <Heading as="h2" fontWeight="900" size="16px">MODULE MAP</Heading>
          <Box
            marginTop="30px"
            gridGap="24px"
            display="flex"
            flexDirection="column"
          >
            {sortedAssignments.length >= 1 ? (
              <>
                {sortedAssignments.map((assignment, i) => {
                  const {
                    label, description, filteredModules, modules,
                  } = assignment;
                  const index = i;
                  return (assignment.filteredModules.length > 0 && (
                    <ModuleMap
                      key={index}
                      userId={user.id}
                      contextState={contextState}
                      setContextState={setContextState}
                      index={index}
                      title={label}
                      slug={slugify(label)}
                      description={description}
                      taskTodo={contextState.taskTodo}
                      modules={modules}
                      filteredModules={filteredModules}
                    />
                  ));
                })}
              </>
            ) : <ModuleMapSkeleton />}

          </Box>

          <Box height={useColorModeValue('1px', '2px')} bg={useColorModeValue('gray.200', 'gray.700')} marginY="70px" />

          <Box
            marginTop="30px"
            gridGap="24px"
            display="flex"
            flexDirection="column"
          >
            <TasksRemain
              userId={user.id}
              // contextState={taskTodo}
              // setContextState={setTaskTodo}
              contextState={contextState}
              setContextState={setContextState}
              sortedAssignments={sortedAssignments}
              startDay={startDay}
            />
          </Box>
        </Box>
        <Box width="5rem" />
        <Box
          // position="sticky"
          // top="15px"
          // overflowY="auto"
          // height="95vh"
          display={{ base: 'none', md: 'block' }}
        >
          {
            user?.roles[0].role === 'teacher' || user?.roles[0].role === 'assistant' ? (
              <Box marginTop="30px">
                <TeacherSidebar
                  title="Teacher"
                  user={user}
                  students={studentAndTeachers.filter((x) => x.role === 'STUDENT')}
                  subtitle="Actions"
                  sortedAssignments={sortedAssignments}
                  studentAndTeachers={studentAndTeachers}
                  actionButtons={supportSideBar.actionButtons}
                  width="100%"
                />
              </Box>
            ) : (
              <>
                <CohortSideBar
                  cohortSideBarTR={cohortSideBar}
                  studentAndTeachers={studentAndTeachers}
                  cohortCity={cohortSession.name}
                  width="100%"
                />

                <Box marginTop="30px">
                  <SupportSidebar
                    title={supportSideBar.title}
                    subtitle={supportSideBar.description}
                    actionButtons={supportSideBar.actionButtons}
                    width="100%"
                  />
                </Box>
              </>
            )
          }
        </Box>
      </Flex>
    </Container>
  );
};

export default asPrivate(Dashboard);
