import React, { Fragment, useEffect } from 'react';
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
import CallToAction from '../../../../../common/components/CallToAction';
import ProgressBar from '../../../../../common/components/ProgressBar';
import Heading from '../../../../../common/components/Heading';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import useAuth from '../../../../../common/hooks/useAuth';
import { ModuleMapSkeleton } from '../../../../../common/components/Skeleton';
import bc from '../../../../../common/services/breathecode';
import useModuleMap from '../../../../../common/store/actions/moduleMapAction';
import { nestAssignments } from '../../../../../common/hooks/useModuleHandler';
import axios from '../../../../../axios';
import dashboardTR from '../../../../../common/translations/dashboard';

const dashboard = () => {
  const { contextState, setContextState } = useModuleMap();
  const [cohort, setNewCohort] = React.useState([]);
  const [taskTodo, setTaskTodo] = React.useState([]);
  const [startedTasks, setStartedTasks] = React.useState([]);
  const { user, choose } = useAuth();

  const router = useRouter();
  const { cohortSlug, slug } = router.query;

  const {
    cohortSideBar, supportSideBar, backToChooseProgram, progressText, callToAction,
  } = dashboardTR[router.locale];

  const {
    tapCapsule, progressBar,
  } = mockData;

  useEffect(() => {
    bc.admissions().me().then((res) => {
      const { cohorts } = res.data;
      // find cohort with current slug
      const findCohort = cohorts.find((c) => c.cohort.slug === cohortSlug);
      const currentCohort = findCohort?.cohort;
      const { version, name } = currentCohort?.syllabus_version;
      choose({
        version,
        slug: currentCohort?.syllabus_version.slug,
        cohort_name: currentCohort.name,
        cohort_id: currentCohort.id,
        syllabus_name: name,
        academy_id: currentCohort.academy.id,
      });
      axios.defaults.headers.common.Academy = currentCohort.academy.id;
    });
  }, []);

  useEffect(() => {
    if (user && user.active_cohort) {
      const cohortId = user.active_cohort.slug;

      // NOTE: returns response with object data with empty array :/
      bc.cohort().getStudents(cohortId).then((res) => {
        console.log('res_STUDENTS', res);
      }).catch((err) => {
        console.log('err_STUDENTS', err);
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && user.active_cohort) {
      const academyId = user.active_cohort.academy_id;
      const { version } = user.active_cohort;
      bc.syllabus().get(academyId, slug, version).then((res) => {
        const studentLessons = res.data;
        setNewCohort(studentLessons);
      });

      bc.todo().getTaskByStudent().then((res) => {
        const tasks = res.data;
        setTaskTodo(tasks);
      });
    }
  }, [user]);
  useEffect(() => {
    setContextState({
      taskTodo,
      cohort,
    });
  }, [cohort, taskTodo]);
  const cohortDays = cohort.json ? cohort.json.days : [];

  useEffect(() => {
    if (contextState.cohort.json && contextState.taskTodo) {
      cohortDays.map((assignment) => {
        const {
          id, label, lessons, replits, assignments, quizzes,
        } = assignment;

        const nestedAssignmentsByTask = nestAssignments({
          id,
          label,
          read: lessons,
          practice: replits,
          code: assignments,
          answer: quizzes,
          taskTodo: contextState.taskTodo,
        }).filteredModules;
        // const cleanedTasks = [...new Set(nestedAssignmentsByTask)];
        if (nestedAssignmentsByTask.length > 0) {
          startedTasks.push(...nestedAssignmentsByTask);
        }
        return setStartedTasks([...startedTasks, ...nestedAssignmentsByTask]);
      });
      // return latest day id for button 'Start today's module'
      // NOTE Next step: implement startDay function with endpoint
      const latestDay = Math.max(...startedTasks.map((day) => day.id));

      console.log('latestDay:::', latestDay);
    }
  }, [contextState.cohort.json, contextState.taskTodo]);

  // Gets last day started in current cohort
  // const latestDay = Math.max.apply(Math, arrEx.map(el => el))
  // const { apply } = Math.max;
  // const latestDay = Math.max.apply(Math, startedTasks.map((day) => day.id));

  return (
    <Container maxW="container.xl" padding={{ base: '0 2%', md: '0 4%' }}>
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
            style={{ marginBottom: '-4px', marginRight: '4px' }}
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
          {cohort.name ? (
            <Heading as="h1" size="xl">
              {cohort.name}
            </Heading>
          ) : (
            <Skeleton
              startColor={useColorModeValue('gray.300', 'gray.light')}
              endColor={useColorModeValue('gray.400', 'gray.400')}
              height="60px"
              width="100%"
              borderRadius="10px"
            />
          )}
          <TagCapsule containerStyle={{ padding: '6px 18px 6px 18px' }} tags={tapCapsule.tags} separator={tapCapsule.separator} />
          <CallToAction
            background="blue.default"
            title={callToAction.title}
            text={`${callToAction.description} Internet Architecture in First Time Website Module.`}
            buttonText={callToAction.buttonText}
            width="100%"
          />
          <Box marginTop="36px">
            <ProgressBar
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
            {(contextState.cohort.json && contextState.taskTodo) ? (
              cohortDays
            ).map((assignment, i) => {
              const index = i;
              const {
                label, description, lessons, replits, assignments, quizzes,
              } = assignment;

              const nestedAssignments = nestAssignments({
                read: lessons,
                practice: replits,
                code: assignments,
                answer: quizzes,
                taskTodo: contextState.taskTodo,
              });
              const { filteredModules, modules } = nestedAssignments;
              return (
                <Fragment key={`${label}-${index}`}>
                  {filteredModules !== [] && filteredModules.length !== 0 && (
                    <ModuleMap
                      index={index}
                      title={label}
                      description={description}
                      taskTodo={contextState.taskTodo}
                      modules={modules}
                      filteredModules={filteredModules}
                    />
                  )}
                </Fragment>
              );
            }) : (
              <ModuleMapSkeleton />
            )}
          </Box>
        </Box>
        <Box width="10rem" />
        <Box>
          <CohortSideBar
            cohortSideBarTR={cohortSideBar}
            // title={cohortSideBar.title}
            // cohortCity={cohortSideBar.cohortCity}
            // professor={cohortSideBar.professor}
            // assistant={cohortSideBar.assistant}
            // classmates={cohortSideBar.classmates}
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
        </Box>
      </Flex>
    </Container>
  );
};

export default asPrivate(dashboard);
