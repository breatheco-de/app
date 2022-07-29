/* eslint-disable no-continue */
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Box, Skeleton, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { LinkIcon } from '@chakra-ui/icons';
import asPrivate from '../../../../../common/context/PrivateRouteWrapper';
import ReactSelect from '../../../../../common/components/ReactSelect';
import Link from '../../../../../common/components/NextChakraLink';
import Heading from '../../../../../common/components/Heading';
import { usePersistent } from '../../../../../common/hooks/usePersistent';
import bc from '../../../../../common/services/breathecode';
import Text from '../../../../../common/components/Text';
import TaskLabel from '../../../../../common/components/taskLabel';
import Icon from '../../../../../common/components/Icon';
import { isGithubUrl } from '../../../../../utils/regex';
import ButtonHandler from '../../../../../js_modules/assignmentHandler/index';
import useAssignments from '../../../../../common/store/actions/assignmentsAction';
import { isWindow } from '../../../../../utils';

const Assignments = () => {
  const { t } = useTranslation('assignments');
  const router = useRouter();
  const toast = useToast();
  const { contextState, setContextState } = useAssignments();
  const [cohortSession] = usePersistent('cohortSession', {});
  const [allCohorts, setAllCohorts] = useState([]);
  const [paginationProps, setPaginationProps] = useState({});
  const [tasksLoading, setTasksLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [studentLabel, setStudentLabel] = useState(null);
  const [projectLabel, setProjectLabel] = useState(null);
  const [statusLabel, setStatusLabel] = useState(null);

  const [currentStudentList, setCurrentStudentList] = useState([]);
  const [projects, setProjects] = useState([]);

  const [selectedCohort, setSelectedCohort] = useState({});
  const [selectedCohortSlug, setSelectedCohortSlug] = useState(null);

  const { cohortSlug } = router.query;
  const linkColor = useColorModeValue('blue.default', 'blue.300');
  const borderColor = useColorModeValue('gray.200', 'gray.500');

  const lang = {
    es: '/es/',
    en: '/',
  };

  const getStudents = (slug, academyId) => {
    bc.cohort().getStudents(slug, academyId)
      .then(({ data }) => {
        const activeStudents = data.filter((l) => l.educational_status === 'ACTIVE' && l.role === 'STUDENT');
        const sortedStudents = activeStudents.sort(
          (a, b) => a.user.first_name.localeCompare(b.user.first_name),
        );
        setCurrentStudentList(sortedStudents);
      }).catch(() => {
        toast({
          title: t('alert-message:error-fetching-students-and-teachers'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
  };

  const getAssignments = (cohortId, academyId, offsetValue) => {
    Promise.all([
      bc.todo({
        limit: 20,
        academy: academyId,
        offset: offsetValue,
        task_type: 'PROJECT',
      }).getAssignments({ id: cohortId }),
      // bc.todo({ teacher: cohortSession.bc_id }).get(),
    ])
      .then(([tasks]) => {
        setIsFetching(false);
        setPaginationProps(tasks.data);
        const taskResults = tasks.data?.results;
        const projectTasks = taskResults !== undefined ? taskResults.filter((l) => l.task_type === 'PROJECT') : [];
        // const myProjectTasks = myTasks.data !== undefined ? myTasks.data.filter(
        //   (l) => l.task_type === 'PROJECT',
        // ) : [];

        const allTasks = [...projectTasks];

        // Clean repeated task.id in stored contextState.allTasks
        const cleanedTeacherTask = allTasks !== undefined ? allTasks.filter(
          (l) => !contextState.allTasks.some((j) => j.id === l.id),
        ) : [];

        const arrOfProjects = [...contextState.allTasks, ...cleanedTeacherTask];
        setContextState({
          allTasks: arrOfProjects,
        });
        const projectsList = [];

        for (let i = 0; i < allTasks.length; i += 1) {
          const isProject = allTasks[i].task_type === 'PROJECT';
          if (projectsList.find(
            (p) => allTasks[i] !== 'PROJECT' && allTasks[i].associated_slug === p.associated_slug,
          )) {
            continue;
          }
          if (isProject) projectsList.push(allTasks[i]);
        }
        if (projectsList.length > 0) setProjects(projectsList);
      })
      .catch((error) => {
        setIsFetching(false);
        toast({
          title: t('alert-message:error-fetching-tasks'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        console.error('There was an error fetching the tasks', error);
      });
  };

  useEffect(() => {
    if (cohortSession?.cohort_role && cohortSession?.cohort_role === 'STUDENT') {
      router.push('/choose-program');
    } else {
      bc.admissions().me()
        .then(({ data }) => {
          const cohortFiltered = data.cohorts.filter((cohort) => cohort.role !== 'STUDENT');
          const dataStruct = cohortFiltered.map((l) => ({
            label: l.cohort.name,
            slug: l.cohort.slug,
            value: l.cohort.id,
            academy: l.cohort.academy.id,
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
    const findSelectedCohort = allCohorts.find((l) => l.slug === selectedCohortSlug);
    const defaultCohort = allCohorts.find((l) => l.slug === cohortSlug);

    const academyId = findSelectedCohort?.academy || defaultCohort?.academy;
    const slug = findSelectedCohort?.slug || defaultCohort?.slug;
    const cohortId = findSelectedCohort?.value || defaultCohort?.value;

    if (defaultCohort && cohortId) {
      setSelectedCohort(findSelectedCohort || defaultCohort);
      getStudents(slug, academyId);
      getAssignments(cohortId, academyId, offset);
      // if (offset) {
      // }
    }
  }, [allCohorts, selectedCohortSlug, offset]);

  const filteredTasks = contextState.allTasks.length > 0 ? contextState.allTasks.filter(
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
  ) : [];

  useEffect(() => {
    if (filteredTasks?.length === 0) {
      setTimeout(() => {
        setTasksLoading(false);
      }, 500);
    }
  }, [filteredTasks]);

  const handleScroll = () => {
    const scrollTop = isWindow && document.documentElement.scrollTop;
    const offsetHeight = isWindow && document.documentElement.offsetHeight + 15;
    const innerHeight = isWindow && window.innerHeight;
    if ((innerHeight + scrollTop) <= offsetHeight) return;
    setIsFetching(true);
  };

  useEffect(() => {
    if (paginationProps.next !== null) {
      console.log('loading assignments...');
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
    console.log('All assignments loaded');
    return () => {};
  }, [paginationProps]);

  useEffect(() => {
    if (!isFetching) return;
    if (filteredTasks && paginationProps.next !== null) {
      setOffset(offset + 20);
    }
  }, [isFetching]);

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
            onChange={({ slug }) => {
              if (slug !== selectedCohort.slug) {
                setCurrentStudentList([]);
                setContextState({
                  allTasks: [],
                });
              }
              setSelectedCohortSlug(slug);
            }}
            options={allCohorts.map((cohort) => ({
              value: cohort.value,
              slug: cohort.slug,
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
          {t('filter.assignments-length', { count: filteredTasks.length || 0, total: contextState.allTasks.length || 0 })}
        </Text>
        <Box display="grid" gridTemplateColumns={{ base: 'repeat(auto-fill, minmax(11rem, 1fr))', md: 'repeat(auto-fill, minmax(18rem, 1fr))' }} gridGap="14px" py="20px">
          {projects.length > 0 ? (
            <ReactSelect
              id="project-select"
              placeholder={t('filter.project')}
              isClearable
              value={projectLabel || ''}
              defaultInputValue={projectDefaultValue}
              onChange={(selected) => {
                setTasksLoading(true);
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
          ) : (
            <Skeleton width="100%" height="40px" borderRadius="0.375rem" />
          )}

          {currentStudentList.length > 0 ? (
            <ReactSelect
              id="student-select"
              placeholder={t('filter.student')}
              isClearable
              value={studentLabel || ''}
              defaultInputValue={studentDefaultValue}
              height="50px"
              fontSize="15px"
              onChange={(selected) => {
                setTasksLoading(true);
                setStudentLabel(selected !== null ? {
                  id: selected?.id,
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
                id: student.user.id,
                value: `${student.user.first_name}-${student.user.last_name}`.toLowerCase(),
                label: `${student.user.first_name} ${student.user.last_name}`,
              }))}
            />
          ) : (
            <Skeleton width="100%" height="40px" borderRadius="0.375rem" />
          )}
          {projects.length > 0 ? (
            <ReactSelect
              id="status-select"
              placeholder={t('filter.status')}
              isClearable
              value={statusLabel}
              height="50px"
              fontSize="15px"
              defaultInputValue={statusDefaultValue}
              onChange={(selected) => {
                setTasksLoading(true);
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
          ) : (
            <Skeleton width="100%" height="40px" borderRadius="0.375rem" />
          )}
        </Box>
        <Box
          minHeight="34vh"
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
          <Box display="flex" flexDirection="column" gridGap="18px" overflow={{ base: 'auto', md: 'inherit' }}>

            {filteredTasks.length > 0 ? filteredTasks.map((task, i) => {
              const index = i;
              const githubUrl = task?.github_url;
              const haveGithubDomain = githubUrl && !isGithubUrl.test(githubUrl);
              const fullName = `${task.user.first_name} ${task.user.last_name}`;
              const projectLink = `https://4geeks.com${lang[router.locale]}project/${task.associated_slug}`;

              return (
                <Box key={`${index}-${task.slug}-${task.title}-${fullName}`} p="18px 28px" display="flex" width={{ base: 'max-content', md: '100%' }} minWidth={{ base: '620px', md: '100%' }} maxWidth={{ base: '620px', md: '100%' }} gridGap="10px" justifyContent="space-between" flexDirection="row" alignItems="center" border="1px solid" borderColor={borderColor} borderRadius="17px">
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
              <>
                {tasksLoading ? (
                  <Box display="flex" flexDirection="column" gridGap="18px">
                    {Array(15).fill(['circles']).map((_, i) => {
                      const index = i;
                      return (
                        <Skeleton key={index} width="100%" height="84.5px" borderRadius="17px" />
                      );
                    })}
                  </Box>
                ) : (
                  <Text size="25px" pt="3rem" textAlign="center" display="flex" width="auto" margin="0 auto" fontWeight="700">
                    {t('common:search-not-found')}
                  </Text>
                )}
              </>
            )}
            {paginationProps.next !== null && isFetching && (
              <Box display="flex" flexDirection="column" gridGap="18px">
                {Array(15).fill(['circles']).map((_, i) => {
                  const index = i;
                  return (
                    <Skeleton key={index} width="100%" height="84.5px" borderRadius="17px" />
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default asPrivate(Assignments);
