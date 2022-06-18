/* eslint-disable no-continue */
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useCookies } from 'react-cookie';
import {
  Box, Button, Select, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { LinkIcon } from '@chakra-ui/icons';
import Link from '../../../../../common/components/NextChakraLink';
import Heading from '../../../../../common/components/Heading';
import { usePersistent } from '../../../../../common/hooks/usePersistent';
import bc from '../../../../../common/services/breathecode';
import axios from '../../../../../axios';
import Text from '../../../../../common/components/Text';
import TaskLabel from '../../../../../common/components/taskLabel';
import Icon from '../../../../../common/components/Icon';
import { isGithubUrl } from '../../../../../utils/regex';

const Assignments = () => {
  const { t } = useTranslation('assignments');
  const [cookies] = useCookies(['accessToken']);
  const router = useRouter();
  const { accessToken } = cookies;
  const toast = useToast();
  const [cohortSession] = usePersistent('cohortSession', {});
  const [allCohorts, setAllCohorts] = useState([]);
  // const [defaultSelected, setDefaultSelected] = useState([]);
  const [studentTasks, setStudentTasks] = useState([]);
  const [limitList, setLimitList] = useState(20);

  const [currentStudentList, setCurrentStudentList] = useState([]);
  const [selectedStudentValue, setSelectedStudentValue] = useState();

  const [selectedStatus, setSelectedStatus] = useState();

  const [projects, setProjects] = useState([]);
  const [selectedProjectValue, setSelectedProjectValue] = useState();

  const [selectedCohort, setSelectedCohort] = useState({});
  const [selectedCohortValue, setSelectedCohortValue] = useState(null);

  const { cohortSlug } = router.query;
  const linkColor = useColorModeValue('blue.default', 'blue.300');
  const borderColor = useColorModeValue('gray.200', 'gray.900');

  axios.defaults.headers.common.Authorization = `Token ${accessToken}`;

  useEffect(() => {
    bc.admissions({ token: accessToken || null }).cohorts()
      .then(({ data }) => {
        const dataStruct = data.map((l) => ({
          label: l.name,
          slug: l.slug,
          value: l.id,
          academy: l.academy.id,
        }));
        setAllCohorts(dataStruct.sort(
          (a, b) => a.label.localeCompare(b.label),
        ));
      })
      .catch((error) => {
        toast({
          title: t('alert-message:error-fetching-cohorts'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        console.error('There was an error fetching the cohorts', error);
      });
  }, []);

  useEffect(() => {
    const findSelectedCohort = allCohorts.find((l) => l.value === selectedCohortValue);
    const defaultCohort = allCohorts.find((l) => l.slug === cohortSlug);

    if (defaultCohort) {
      setSelectedCohort(findSelectedCohort || defaultCohort);
    }
  }, [allCohorts, cohortSlug, selectedCohortValue]);

  useEffect(() => {
    if (selectedCohort) {
      Promise.all([
        bc.todo({ stu_cohort: selectedCohort.slug }).get(),
        bc.todo({ teacher: cohortSession.bc_id }).get(),
      ])
        .then(([tasks, myTodos]) => {
          console.log('teacher_todos:', myTodos.data);
          setStudentTasks(tasks.data !== undefined ? tasks.data.filter((l) => l.task_type === 'PROJECT') : []);

          const projectsList = [];
          const studentsList = [];

          for (let i = 0; i < tasks.data.length; i += 1) {
            const isProject = tasks.data[i].task_type === 'PROJECT';
            if (projectsList.find(
              (p) => tasks.data[i] !== 'PROJECT' && tasks.data[i].associated_slug === p.associated_slug,
            )) {
              continue;
            }
            if (isProject) projectsList.push(tasks.data[i]);
          }
          for (let i = 0; i < tasks.data.length; i += 1) {
            const firstName = tasks.data[i].user.first_name;
            const lastName = tasks.data[i].user.last_name;
            const isProject = tasks.data[i].task_type === 'PROJECT';
            if (studentsList.find(
              (p) => isProject && `${firstName}-${lastName}` === `${p.user.first_name}-${p.user.last_name}`,
            )) {
              continue;
            }
            if (isProject) studentsList.push(tasks.data[i]);
          }
          const sortedStudents = studentsList.sort(
            (a, b) => a.user.first_name.localeCompare(b.user.first_name),
          );
          if (projectsList.length > 0) setProjects(projectsList);
          if (studentsList.length > 0) setCurrentStudentList(sortedStudents);
        })
        .catch((error) => {
          toast({
            title: t('alert-message:error-fetching-tasks'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
          console.error('There was an error fetching the tasks', error);
        });
    }
  }, [cohortSlug, selectedCohort]);

  const filteredTasks = studentTasks.length > 0 && studentTasks.filter(
    (task) => {
      const fullName = `${task.user.first_name}-${task.user.last_name}`.toLowerCase();
      const statusConditional = {
        delivered: task.task_status === 'DONE' && task.revision_status === 'PENDING',
        approved: task.revision_status === 'APPROVED',
        rejected: task.revision_status === 'REJECTED',
        undelivered: task.task_status === 'PENDING' && task.revision_status === 'PENDING',
      };
      if (selectedStatus && !statusConditional[selectedStatus]) return false;
      if (selectedProjectValue
        && task.associated_slug !== selectedProjectValue
      ) return false;
      if (selectedStudentValue
        && fullName !== selectedStudentValue
      ) return false;
      return true;
    },
  );

  const statusList = [
    {
      label: t('status.delivered'),
      value: 'delivered',
    },
    {
      label: t('status.approved'),
      value: 'approved',
    },
    {
      label: t('status.rejected'),
      value: 'rejected',
    },
    {
      label: t('status.undelivered'),
      value: 'undelivered',
    },
  ];

  return (
    <>
      <Box display="flex" justifyContent="space-between" margin={{ base: '2% 4% 0 4%', lg: '2% 12% 0 12%' }}>
        <Link
          href="/"
          color={linkColor}
          display="inline-block"
          letterSpacing="0.05em"
          fontWeight="700"
        >
          {`← ${t('back-to')}`}
        </Link>
      </Box>
      <Box display="flex" borderBottom="1px solid" borderColor={borderColor} flexDirection={{ base: 'column', md: 'row' }} gridGap={{ base: '0', md: '10px' }} p={{ base: '50px 4% 30px 4%', md: '50px 10% 30px 10%', lg: '50px 12% 30px 12%' }} alignItems={{ base: 'start', md: 'center' }}>
        <Heading size="m" style={{ margin: '0' }} padding={{ base: '0', md: '0 0 5px 0 !important' }}>
          {`${t('title')}:`}
        </Heading>
        {allCohorts.length > 0 && (
          <Select
            id="cohort-select"
            placeholder="Select cohort"
            style={{
              padding: '0 2rem 0 0',
            }}
            fontSize="20px"
            value={selectedCohort.value}
            onChange={(e) => setSelectedCohortValue(parseInt(e.target.value, 10))}
            width="auto"
            color="blue.default"
            border="0"
            cursor="pointer"
          >
            {allCohorts.map((cohort) => (
              <option key={cohort.value} id="cohort-option" value={cohort.value}>
                {`${cohort.academy} - ${cohort.label}`}
              </option>
            ))}
          </Select>
        )}
      </Box>
      <Box
        gridGap="20px"
        maxWidth="1012px"
        margin={{ base: '3% 4%', md: '3% 10% 4% 10%', lg: '3% 12% 4% 12%' }}
        p="0 0 30px 0"
        // borderBottom="1px solid"
        // borderColor={borderColor}
      >
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(16rem, 1fr))" gridGap="14px" py="20px">
          {projects.length > 0 && (
            <Select
              id="cohort-select"
              placeholder="Filter by project"
              height="50px"
              fontSize="15px"
              onChange={(e) => setSelectedProjectValue(e.target.value)}
            >
              {projects.map((project) => (
                <option key={project.associated_slug} id="project-option" value={project.associated_slug}>
                  {project.title}
                </option>
              ))}
            </Select>
          )}
          {currentStudentList.length > 0 && (
            <Select
              id="student-select"
              placeholder="Filter by Student"
              height="50px"
              fontSize="15px"
              onChange={(e) => setSelectedStudentValue(e.target.value)}
            >
              {currentStudentList.map((student) => {
                const fullName = `${student.user.first_name}-${student.user.last_name}`.toLowerCase();
                return (
                  <option key={fullName} id="student-option" value={fullName}>
                    {`${student.user.first_name} ${student.user.last_name}`}
                  </option>
                );
              })}
            </Select>
          )}
          {statusList.length > 0 && (
            <Select
              id="status-select"
              placeholder="Filter by Status"
              height="50px"
              fontSize="15px"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statusList.map((status) => (
                <option key={status.value} id="status-option" value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          )}
        </Box>
        <Box
          borderRadius="3px"
          margin="0 auto"
          maxWidth="1012px"
          flexGrow={1}
        >
          <Box
            display="flex"
            margin="20px 32px"
            gridGap="10px"
            justifyContent="space-between"
            flexDirection="row"
            alignItems="center"
          >
            <Text size="15px" display="flex" width="auto" minWidth="calc(145px - 0.5vw)" fontWeight="700">
              Status
            </Text>
            <Text size="15px" display="flex" width="44%" fontWeight="700">
              Student and Assignments
            </Text>
            <Text size="15px" display="flex" width="90px" fontWeight="700">
              Link
            </Text>
            <Text size="15px" display="flex" width="auto" fontWeight="700">
              Actions
            </Text>
          </Box>
          <Box display="flex" flexDirection="column" gridGap="18px">
            {filteredTasks.length > 0 ? filteredTasks.map((task) => {
              const githubUrl = task?.github_url;
              const haveGithubDomain = githubUrl && !isGithubUrl.test(githubUrl);
              return (
                <Box key={task.slug} p="28px" display="flex" gridGap="10px" justifyContent="space-between" flexDirection="row" alignItems="center" border="1px solid" borderColor="#DADADA" borderRadius="17px">
                  <Box width="auto" minWidth="calc(110px - 0.5vw)">
                    <TaskLabel currentTask={task} />
                  </Box>

                  <Box width="40%">
                    <Text size="15px">
                      {`${task.user.first_name} ${task.user.last_name}`}
                    </Text>
                    <Link variant="default" href="https://github.com/breatheco-de" target="_blank" rel="noopener noreferrer">
                      {task.title}
                    </Link>
                  </Box>

                  <Box width={githubUrl ? 'auto' : '26px'}>
                    {githubUrl && (!haveGithubDomain ? (
                      <Link variant="default" width="26px" href={githubUrl || '#'} target="_blank" rel="noopener noreferrer">
                        <Icon icon="github" width="26px" height="26px" />
                      </Link>
                    ) : (
                      <Link variant="default" width="26px" href={githubUrl || '#'} target="_blank" rel="noopener noreferrer">
                        <LinkIcon width="26px" height="26px" />
                      </Link>
                    ))}
                  </Box>

                  <Box width="auto">
                    <Button variant="default" textTransform="uppercase">
                      Deliver
                    </Button>
                  </Box>
                </Box>
              );
            }) : (
              <Text size="30px">
                Loading...
              </Text>
            )}
            {limitList <= studentTasks.length && (
              <Button onClick={() => setLimitList(limitList + 20)}>
                show more
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Assignments;
