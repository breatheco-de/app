/* eslint-disable no-unused-vars */
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
import { usePersistent } from '../../../../../../../common/hooks/usePersistent';
import asPrivate from '../../../../../../../common/context/PrivateRouteWrapper';
import useStyle from '../../../../../../../common/hooks/useStyle';
import bc from '../../../../../../../common/services/breathecode';
import ReactSelect from '../../../../../../../common/components/ReactSelect';
import KPI from '../../../../../../../common/components/KPI';
import { DottedTimelineSkeleton, SimpleSkeleton } from '../../../../../../../common/components/Skeleton';
import Link from '../../../../../../../common/components/NextChakraLink';
import Heading from '../../../../../../../common/components/Heading';
import Text from '../../../../../../../common/components/Text';
import DottedTimeline from '../../../../../../../common/components/DottedTimeline';
import axiosInstance from '../../../../../../../axios';

function AssignmentReport() {
  const { t } = useTranslation('assignment-report');
  const router = useRouter();
  const { query } = router;
  const { cohortSlug, studentId, assignmentId, academy } = query;
  const [cohortSession] = usePersistent('cohortSession', {});
  const [cohortUser, setCohortUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
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
        task_type: 'PROJECT,LESSON,EXERCISE',
        student: studentId,
      }).getAssignments({ id: foundStudent.cohort.id, academy });

      const sortedTasks = data.results.sort((a, b) => {
        if (a.title < b.title) return -1;
        if (a.title > b.title) return 1;
        return 0;
      });

      console.log('sortedTasks');
      console.log(sortedTasks);
      setTasks(sortedTasks);

      const task = sortedTasks.find((elem) => elem.id === Number(assignmentId));

      setSelectedTask(task);
      setIsFetching(false);
    } catch (e) {
      setIsFetching(false);
      console.log(e);
    }
  };

  useEffect(() => {
    fetchStudentAndTasks();
  }, []);

  useEffect(() => {
    console.log('selectedTask');
    console.log(selectedTask);
  }, [selectedTask]);

  const user = cohortUser?.user;

  return (
    <Container padding="0" maxWidth="none">
      <Box
        padding="0 10px 30px 10px"
        maxWidth={{ base: '90%', md: '90%', lg: '1112px' }}
        margin="2% auto 0 auto"
      >
        <Link
          href={cohortSession?.selectedProgramSlug || '/choose-program'}
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
              {selectedTask?.assignment_telemetry ? (
                <>
                  {/* <KPI
                    label={elem.label}
                    icon={elem.icon}
                    variationColor={elem.variationColor}
                    value={elem.value}
                    style={{ width: '100%', border: `2px solid ${borderColor}` }}
                    {...elem}
                  /> */}
                </>
              ) : (
                <Heading>
                  {t('no-telemetry')}
                </Heading>
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
            <Heading color={hexColor.fontColor2} size="m">{`${t('relevant-activities')}:`}</Heading>
          </>
        )}
      </Box>
    </Container>
  );
}

export default asPrivate(AssignmentReport);
