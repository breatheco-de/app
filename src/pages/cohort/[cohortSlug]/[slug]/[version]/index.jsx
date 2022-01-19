import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Container,
} from '@chakra-ui/react';
import mockData from '../../../../../common/utils/mockData/DashboardView';
import NextChakraLink from '../../../../../common/components/NextChakraLink';
import TagCapsule from '../../../../../common/components/TagCapsule';
import ModuleMap from '../../../../../common/components/ModuleMap';
import CohortSideBar from '../../../../../common/components/CohortSideBar';
import Icon from '../../../../../common/components/Icon';
import SupportSidebar from '../../../../../common/components/SupportSidebar';
import CallToAction from '../../../../../common/components/CallToAction';
import ProgressBar from '../../../../../common/components/ProgressBar';
import Heading from '../../../../../common/components/Heading';
import Text from '../../../../../common/components/Text';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import useAuth from '../../../../../common/hooks/useAuth';
import { ModuleMapSkeleton } from '../../../../../common/components/Skeleton';
import bc from '../../../../../common/services/breathecode';
import useModuleMap from '../../../../../common/store/actions/moduleMapAction';

const dashboard = ({ slug, cohortSlug }) => {
  const { contextState, setContextState } = useModuleMap();
  const [cohort, setNewCohort] = React.useState([]);
  const [taskTodo, setTaskTodo] = React.useState([]);
  const { user, choose } = useAuth();

  const {
    tapCapsule, callToAction, cohortSideBar, supportSideBar, progressBar,
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
        syllabus_name: name,
        academy_id: currentCohort.academy.id,
      });
    });
  }, []);

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

  return (
    <Container maxW="container.xl">
      <Box marginTop="17px" marginBottom="17px">
        <NextChakraLink
          href="/choose-program"
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
          Back to choose progrm
        </NextChakraLink>
      </Box>
      <Grid
        h="100%"
        templateRows="repeat(1, 1fr)"
        templateColumns="repeat(12, 1fr)"
        gap={16}
      >
        <GridItem colSpan={8}>
          <Heading as="h1" size="xl">
            {cohort.name}
            {/* Full Stack Developer
            {' '}
            {slug} */}
          </Heading>
          <TagCapsule tags={tapCapsule.tags} separator={tapCapsule.separator} />
          <Text size="md">
            {JSON.stringify(user, 4, null)}
          </Text>
          <Box>
            <CallToAction
              background={callToAction.background}
              title="What is next!"
              text={callToAction.text}
              width="100%"
            />
          </Box>
          <Box marginTop="36px">
            <ProgressBar
              programs={progressBar.programs}
              progressText={progressBar.progressText}
              width="100%"
            />
          </Box>
          <Box height="1px" bg="gray.dark" marginY="32px" />
          <Box>
            <Heading size="m">MODULE MAP</Heading>
          </Box>
          <Box marginTop="30px">
            {(contextState.cohort.json && taskTodo) ? (
              cohort.json ? cohort.json.days : []
            ).map((assignment) => {
              const {
                // id,                   Read   Practice    Code        Answer
                id, label, description, lessons, replits, assignments, quizzes,
              } = assignment;
              return (
                <ModuleMap
                  key={id}
                  title={label}
                  description={description}
                  taskTodo={contextState.taskTodo}
                  read={lessons}
                  practice={replits}
                  code={assignments}
                  answer={quizzes}
                  width="100%"
                />
              );
            }) : (
              <ModuleMapSkeleton />
            )}
          </Box>
        </GridItem>
        <GridItem colSpan={4}>
          <CohortSideBar
            title={cohortSideBar.title}
            cohortCity={cohortSideBar.cohortCity}
            professor={cohortSideBar.professor}
            assistant={cohortSideBar.assistant}
            classmates={cohortSideBar.classmates}
            width="100%"
          />
          <Box marginTop="30px">
            <SupportSidebar
              title={supportSideBar.title}
              subtitle={supportSideBar.subtitle}
              actionButtons={supportSideBar.actionButtons}
              width="100%"
            />
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
};

export const getServerSideProps = async ({
  params: {
    cohortSlug, slug, version,
  },
}) => ({
  props: {
    cohortSlug,
    slug,
    version,
  },
});

export default asPrivate(dashboard);
