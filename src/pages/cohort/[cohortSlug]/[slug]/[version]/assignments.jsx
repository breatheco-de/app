/* eslint-disable no-continue */
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useCookies } from 'react-cookie';
import {
  Box, Button, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { LinkIcon } from '@chakra-ui/icons';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import ReactSelect from '../../../../../common/components/ReactSelect';
import Link from '../../../../../common/components/NextChakraLink';
import Heading from '../../../../../common/components/Heading';
import { usePersistent } from '../../../../../common/hooks/usePersistent';
import bc from '../../../../../common/services/breathecode';
import axios from '../../../../../axios';
import Text from '../../../../../common/components/Text';
import TaskLabel from '../../../../../common/components/taskLabel';
import Icon from '../../../../../common/components/Icon';
import { isGithubUrl } from '../../../../../utils/regex';
import ButtonHandler from '../../../../../js_modules/assignmentHandler/index';
import useAssignments from '../../../../../common/store/actions/assignmentsAction';

const Assignments = () => {
  const { t } = useTranslation('assignments');
  const [cookies] = useCookies(['accessToken']);
  const router = useRouter();
  const { accessToken } = cookies;
  const defaultLimiter = 10;
  const toast = useToast();
  const { contextState, setContextState } = useAssignments();
  const [cohortSession] = usePersistent('cohortSession', {});
  const [allCohorts, setAllCohorts] = useState([]);
  const [studentLabel, setStudentLabel] = useState(null);
  const [projectLabel, setProjectLabel] = useState(null);
  const [statusLabel, setStatusLabel] = useState(null);

  const [limitList, setLimitList] = useState(defaultLimiter);
  const [currentStudentList, setCurrentStudentList] = useState([]);
  // const [selectedStatus, setSelectedStatus] = useState();
  const [projects, setProjects] = useState([]);

  const [selectedCohort, setSelectedCohort] = useState({});
  const [selectedCohortValue, setSelectedCohortValue] = useState(null);

  const { cohortSlug } = router.query;
  const linkColor = useColorModeValue('blue.default', 'blue.300');
  const borderColor = useColorModeValue('gray.200', 'gray.500');

  axios.defaults.headers.common.Authorization = `Token ${accessToken}`;

  const lang = {
    es: '/es/',
    en: '/',
  };

  useEffect(() => {
    if (cohortSession?.cohort_role && cohortSession?.cohort_role === 'STUDENT') {
      router.push('/choose-program');
    } else {
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
    }
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
        bc.todo({
          stu_cohort: selectedCohort.slug,
          // limit: 100,
          // type: 'project',
        }).get(),
        bc.todo({ teacher: cohortSession.bc_id }).get(),
      ])
        .then(([tasks, myTasks]) => {
          const projectTasks = tasks.data !== undefined ? tasks.data.filter((l) => l.task_type === 'PROJECT') : [];
          const myProjectTasks = myTasks.data !== undefined ? myTasks.data.filter((l) => l.task_type === 'PROJECT') : [];
          setContextState({
            allTasks: [
              ...projectTasks,
              ...myProjectTasks,
            ],
          });

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

  const filteredTasks = contextState.allTasks.length > 0 && contextState.allTasks.filter(
    (task) => {
      const fullName = `${task.user.first_name}-${task.user.last_name}`.toLowerCase();
      const statusConditional = {
        delivered: task.task_status === 'DONE' && task.revision_status === 'PENDING',
        approved: task.revision_status === 'APPROVED',
        rejected: task.revision_status === 'REJECTED',
        undelivered: task.task_status === 'PENDING' && task.revision_status === 'PENDING',
      };
      if (router.query.status && !statusConditional[router.query.status]) return false;
      if (router.query.project
        && task.associated_slug !== router.query.project
      ) return false;
      if (router.query.student
        && fullName !== router.query.student
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

  const studentDefaultValue = currentStudentList?.filter((l) => {
    const fullName = `${l.user.first_name}-${l.user.last_name}`.toLowerCase();
    return fullName === router.query.student;
  }).map((l) => `${l?.user?.first_name} ${l?.user?.last_name}`)[0];

  const projectDefaultValue = projects.find(
    (l) => l.associated_slug === router.query.project,
  )?.title;

  const statusDefaultValue = statusList.find(
    (l) => l.value === router.query.status,
  )?.label;

  return (
    <>
      <Box display="flex" justifyContent="space-between" margin={{ base: '2% 4% 0 4%', lg: '2% 12% 0 12%' }}>
        {cohortSession?.selectedProgramSlug && (
          <Link
            href={cohortSession?.selectedProgramSlug}
            color={linkColor}
            display="inline-block"
            letterSpacing="0.05em"
            fontWeight="700"
          >
            {`← ${t('back-to')}`}
          </Link>
        )}
      </Box>
      <Box display="flex" borderBottom="1px solid" borderColor={borderColor} flexDirection={{ base: 'column', md: 'row' }} gridGap={{ base: '0', md: '10px' }} p={{ base: '50px 4% 30px 4%', md: '50px 10% 30px 10%', lg: '50px 12% 30px 12%' }} alignItems={{ base: 'start', md: 'center' }}>
        <Heading size="m" style={{ margin: '0' }} padding={{ base: '0', md: '0 0 5px 0 !important' }}>
          {`${t('title')}:`}
        </Heading>
        {selectedCohort.value && allCohorts.length > 0 && (
          <ReactSelect
            unstyled
            color="#0097CD"
            fontWeight="700"
            id="cohort-select"
            fontSize="25px"
            noOptionsMessage={() => t('common:no-options-message')}
            defaultInputValue={selectedCohort.label}
            onChange={({ value }) => {
              setLimitList(defaultLimiter);
              setSelectedCohortValue(parseInt(value, 10));
            }}
            options={allCohorts.map((cohort) => ({
              value: cohort.value,
              label: cohort.label,
            }))}
          />
        )}
      </Box>
      <Box
        gridGap="20px"
        maxWidth="1012px"
        margin={{ base: '3% 4%', md: '3% auto 4% auto', lg: '3% auto 4% auto' }}
        padding={{ base: '0', md: '0 10px', lg: '0' }}
        p="0 0 30px 0"
      >
        <Text size="20px" display="flex" width="auto" fontWeight="400">
          {t('filter.assignments-length', { count: filteredTasks.length || 0 })}
        </Text>
        <Box display="grid" gridTemplateColumns={{ base: 'repeat(auto-fill, minmax(10rem, 1fr))', md: 'repeat(auto-fill, minmax(18rem, 1fr))' }} gridGap="14px" py="20px">
          {projects.length > 0 && (
            <ReactSelect
              id="project-select"
              placeholder={t('filter.project')}
              isClearable
              value={projectLabel || ''}
              defaultInputValue={projectDefaultValue}
              onChange={(selected) => {
                setLimitList(defaultLimiter);
                setProjectLabel(selected !== null ? {
                  value: selected?.value,
                  label: selected?.label,
                } : null);
                router.push({
                  query: {
                    ...router.query,
                    project: selected?.value,
                  },
                });
              }}
              options={projects.map((project) => ({
                value: project.associated_slug,
                label: project.title,
              }))}
            />
          )}

          {currentStudentList.length > 0 && (
            <ReactSelect
              id="student-select"
              placeholder={t('filter.student')}
              isClearable
              value={studentLabel || ''}
              defaultInputValue={studentDefaultValue}
              height="50px"
              fontSize="15px"
              onChange={(selected) => {
                setLimitList(defaultLimiter);
                setStudentLabel(selected !== null ? {
                  value: selected?.value,
                  label: selected?.label,
                } : null);
                router.push({
                  query: {
                    ...router.query,
                    student: selected?.value,
                  },
                });
              }}
              options={currentStudentList.map((student) => ({
                value: `${student.user.first_name}-${student.user.last_name}`.toLowerCase(),
                label: `${student.user.first_name} ${student.user.last_name}`,
              }))}
            />
          )}
          {statusList.length > 0 && (
            <ReactSelect
              id="status-select"
              placeholder={t('filter.status')}
              isClearable
              value={statusLabel}
              height="50px"
              fontSize="15px"
              defaultInputValue={statusDefaultValue}
              onChange={(selected) => {
                setLimitList(defaultLimiter);
                setStatusLabel(selected !== null ? {
                  value: selected?.value,
                  label: selected?.label,
                } : null);
                router.push({
                  query: {
                    ...router.query,
                    status: selected?.value,
                  },
                });
              }}
              options={statusList.map((status) => ({
                value: status.value,
                label: status.label,
              }))}
            />
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
            <Text size="15px" display="flex" width="39.6%" fontWeight="700">
              {t('label.status')}
            </Text>
            <Text size="15px" display="flex" width="100%" fontWeight="700">
              {t('label.student-and-assignments')}
            </Text>
            <Text size="15px" display="flex" width="34%" fontWeight="700">
              {t('label.link')}
            </Text>
            <Text size="15px" display="flex" width="25%" minWidth="115px" fontWeight="700">
              {t('label.actions')}
            </Text>
          </Box>
          <Box display="flex" flexDirection="column" gridGap="18px">

            {filteredTasks.length > 0 ? filteredTasks.slice(0, limitList).map((task) => {
              const githubUrl = task?.github_url;
              const haveGithubDomain = githubUrl && !isGithubUrl.test(githubUrl);
              const fullName = `${task.user.first_name} ${task.user.last_name}`;
              const projectLink = `https://4geeks.com${lang[router.locale]}project/${task.associated_slug}`;

              return (
                <Box key={`${task.slug}-${task.title}-${fullName}`} p="18px 28px" display="flex" gridGap="10px" justifyContent="space-between" flexDirection="row" alignItems="center" border="1px solid" borderColor={borderColor} borderRadius="17px">
                  <Box width="auto" minWidth="calc(110px - 0.5vw)">
                    <TaskLabel currentTask={task} t={t} />
                  </Box>

                  <Box width="40%">
                    <Text size="15px">
                      {fullName}
                    </Text>
                    <Link variant="default" href={projectLink} target="_blank" rel="noopener noreferrer">
                      {task.title}
                    </Link>
                  </Box>

                  <Box width={githubUrl ? 'auto' : '4%'}>
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

                  <Box width="auto" minWidth="160px" textAlign="end">
                    <ButtonHandler
                      currentTask={task}
                      cohortSession={cohortSession}
                      contextState={contextState}
                      setContextState={setContextState}
                    />
                  </Box>
                </Box>
              );
            }) : (
              <Text size="30px">
                Loading...
              </Text>
            )}
            {filteredTasks.length > limitList && (
              <Button variant="link" onClick={() => setLimitList(limitList + 15)} fontSize="16px" _hover={{ textDecoration: 'none' }} width="fit-content" margin="20px auto 0 auto">
                {t('common:show-more')}
                <Icon icon="arrowDown" width="24px" height="24px" />
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default asPrivate(Assignments);
