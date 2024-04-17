import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Flex,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { intervalToDuration } from 'date-fns';
import asPrivate from '../../../../../../../common/context/PrivateRouteWrapper';
import useStyle from '../../../../../../../common/hooks/useStyle';
import bc from '../../../../../../../common/services/breathecode';
import ReactSelect from '../../../../../../../common/components/ReactSelect';
import KPI from '../../../../../../../common/components/KPI';
import { DottedTimelineSkeleton, SimpleSkeleton } from '../../../../../../../common/components/Skeleton';
import Link from '../../../../../../../common/components/NextChakraLink';
import Heading from '../../../../../../../common/components/Heading';
import Text from '../../../../../../../common/components/Text';
import Icon from '../../../../../../../common/components/Icon';
import DottedTimeline from '../../../../../../../common/components/DottedTimeline';
import axiosInstance from '../../../../../../../axios';

function AssignmentReport() {
  const { t } = useTranslation('assignment-report');
  const router = useRouter();
  const { query } = router;
  const { cohortSlug, studentId, assignmentId, academy } = query;
  const [cohortUser, setCohortUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [report, setReport] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [tasks, setTasks] = useState([]);
  const { hexColor } = useStyle();
  const linkColor = useColorModeValue('blue.default', 'blue.300');
  const borderColor = useColorModeValue('gray.200', 'gray.500');

  const fetchStudentAndTasks = async () => {
    try {
      axiosInstance.defaults.headers.common.academy = academy;
      const res = await bc.admissions({ users: studentId }).cohortUsers(academy);
      const foundStudent = res.data.find((user) => user.cohort.slug === cohortSlug);
      setCohortUser(foundStudent);

      const { data } = await bc.todo({
        academy,
        limit: 1000,
        task_type: 'EXERCISE',
        student: studentId,
      }).getAssignments({ id: foundStudent.cohort.id, academy });

      const sortedTasks = data.results.sort((a, b) => {
        if (a.title < b.title) return -1;
        if (a.title > b.title) return 1;
        return 0;
      });

      setTasks(sortedTasks);

      const task = sortedTasks.find((elem) => elem.id === Number(assignmentId));

      setSelectedTask(task);
      setIsFetching(false);
    } catch (e) {
      setIsFetching(false);
      console.log(e);
    }
  };

  const intervalToHours = (duration) => {
    const hours = duration.years * 24 * 365 // Hours from years (assuming 365 days per year)
             + duration.months * 24 * 30 // Hours from months (assuming 30 days per month)
             + duration.days * 24 // Hours from days
             + duration.hours
             + duration.minutes / 60 // Convert minutes to hours
             + duration.seconds / 3600;
    return hours;
  };

  useEffect(() => {
    fetchStudentAndTasks();
  }, []);

  useEffect(() => {
    if (selectedTask && selectedTask.assignment_telemetry) {
      const { steps, workout_session: workoutSession, last_interaction_at: lastInteractionAt } = selectedTask.assignment_telemetry;
      const completedSteps = steps.reduce((acum, elem) => {
        if (elem.completed_at) return acum + 1;
        return acum;
      }, 0);

      const completionPercentage = (completedSteps * 100) / steps.length;
      const roundedPercentage = Math.round((completionPercentage + Number.EPSILON) * 100) / 100;

      const totalHours = workoutSession.reduce((acum, elem) => {
        const startedAt = elem.started_at;
        const endedAt = elem.ended_at || lastInteractionAt;

        const duration = intervalToDuration({
          start: new Date(startedAt),
          end: new Date(endedAt),
        });

        const hours = intervalToHours(duration);

        return acum + hours;
      }, 0);

      const roundedHours = Math.round((totalHours + Number.EPSILON) * 100) / 100;
      setReport([{
        label: t('completion-percentage'),
        icon: 'success',
        variationColor: hexColor.blueDefault,
        value: `${roundedPercentage}%`,
      }, {
        label: t('total-steps-completed'),
        icon: 'list',
        variationColor: hexColor.blueDefault,
        value: `${completedSteps}/${steps.length}`,
      }, {
        label: t('total-time'),
        icon: 'clock',
        variationColor: hexColor.blueDefault,
        value: `${roundedHours} hs`,
      }]);
    }
  }, [selectedTask]);

  const user = cohortUser?.user;

  const stepsDots = selectedTask?.assignment_telemetry ? selectedTask.assignment_telemetry.steps.map((step) => {
    const {
      opened_at: openedAt,
      completed_at: completedAt,
      ai_interactions: aiInteractions,
      tests,
      compilations,
    } = step;

    const failedTests = tests?.reduce((acum, elem) => {
      if (elem.exit_code >= 1) return acum + 1;
      return acum;
    }, 0);

    const failedCompilations = compilations?.reduce((acum, elem) => {
      if (elem.exit_code >= 1) return acum + 1;
      return acum;
    }, 0);

    let hours;
    const isOpened = openedAt !== undefined && openedAt !== null;
    const isCompleted = isOpened && completedAt !== undefined;

    if (isCompleted) {
      const duration = intervalToDuration({
        start: new Date(openedAt),
        end: new Date(completedAt),
      });

      hours = Math.round((intervalToHours(duration) + Number.EPSILON) * 100) / 100;
    }

    const label = (
      <>
        <Text textAlign="center">{step.slug}</Text>
        {isCompleted && <Text textAlign="center">{`${t('time-to-complete')} ${hours} hs`}</Text>}
        <Text textAlign="center">{`${t('rigobot-uses')}: ${aiInteractions.length}`}</Text>
        <Text textAlign="center">{`${t('tests-run')}: ${tests.length}`}</Text>
        <Text textAlign="center">{`${t('tests-failed')}: ${failedTests}`}</Text>
        <Text textAlign="center">{`${t('compiled-errors')}: ${failedCompilations}`}</Text>
      </>
    );

    let color;
    if (isCompleted) color = hexColor.green;
    else if (isOpened) color = hexColor.yellowDefault;
    else color = 'gray.default';

    return {
      ...step,
      label,
      color,
    };
  }) : [];

  return (
    <Container padding="0" maxWidth="none">
      <Box
        padding="0 10px 30px 10px"
        maxWidth={{ base: '90%', md: '90%', lg: '1112px' }}
        margin="2% auto 0 auto"
      >
        <Link
          href={`/cohort/${cohortSlug}/student/${studentId}?academy=${academy}`}
          color={linkColor}
          display="inline-block"
          letterSpacing="0.05em"
          fontWeight="700"
        >
          {`← ${t('back-to')}`}
        </Link>
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
            <ReactSelect
              unstyled
              color={hexColor.blueDefault}
              fontWeight="700"
              id="cohort-select"
              fontSize="25px"
              placeholder={t('select-task')}
              noOptionsMessage={() => t('common:no-options-message')}
              value={
                selectedTask
                  ? {
                    value: selectedTask.id,
                    slug: selectedTask.associated_slug,
                    label: selectedTask.title,
                  }
                  : ''
              }
              onChange={(selected) => {
                setSelectedTask(
                  tasks.find((opt) => opt.associated_slug === selected.slug),
                );
                router.push({
                  query: {
                    ...router.query,
                    assignmentId: selected.value,
                  },
                });
              }}
              options={tasks.map((task) => ({
                value: task.id,
                slug: task.associated_slug,
                label: task.title,
              }))}
            />
          </Box>
        )}
        <Flex marginTop="20px" justify="space-between" gap="20px" wrap={{ base: 'wrap', md: 'nowrap' }}>
          {isFetching ? [...Array(3).keys()].map((e, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <SimpleSkeleton key={`skeleton-${i}`} borderRadius="10px" height="108px" width="100%" />
          )) : (
            <>
              {selectedTask?.assignment_telemetry && (
                <>
                  {report.map((elem) => (
                    <KPI
                      label={elem.label}
                      icon={elem.icon}
                      variationColor={elem.variationColor}
                      value={elem.value}
                      style={{ width: '100%', border: `2px solid ${borderColor}` }}
                      {...elem}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </Flex>
      </Box>
      <Divider borderBottom="1px solid" color={borderColor} mb="20px" />
      <Box
        maxWidth={{ base: '90%', md: '90%', lg: '1112px' }}
        margin="auto"
        padding="0 10px"
      >
        {isFetching ? (
          <DottedTimelineSkeleton />
        ) : (
          <>
            {selectedTask?.assignment_telemetry ? (
              <>
                <Heading mb="20px" color={hexColor.fontColor2} size="m">{`${t('relevant-activities')}:`}</Heading>
                <DottedTimeline
                  label={(
                    <Flex gridGap="10px" alignItems="center">
                      <Icon
                        icon="list"
                        color={hexColor.blueDefault}
                        width="20px"
                        height="20px"
                      />
                      <p>{t('steps-status')}</p>
                    </Flex>
                  )}
                  dots={stepsDots}
                />
              </>
            ) : (
              <Heading>
                {t('no-telemetry')}
              </Heading>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}

export default asPrivate(AssignmentReport);
