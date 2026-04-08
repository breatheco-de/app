/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Box,
  Divider,
  Button,
  ButtonGroup,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import asPrivate from '../../../context/PrivateRouteWrapper';
import ReactSelect, { AsyncSelect } from '../../../components/ReactSelect';
import Link from '../../../components/NextChakraLink';
import Heading from '../../../components/Heading';
import bc from '../../../services/breathecode';
import Icon from '../../../components/Icon';
import Text from '../../../components/Text';
import useStyle from '../../../hooks/useStyle';
import useAuth from '../../../hooks/useAuth';
import useCohortHandler from '../../../hooks/useCohortHandler';
import useAssignments from '../../../store/actions/assignmentsAction';
import Projects from '../../../components/Assignments/Projects';
import FinalProjects from '../../../components/Assignments/FinalProjects';
import StudentAssignments from '../../../components/Assignments/StudentAssignments';
import axiosInstance from '../../../axios';
import useCustomToast from '../../../hooks/useCustomToast';
import { sortMicroCohortsLikeDashboard } from '../../../utils/cohorts';

function extractAssignmentsFromSyllabusDays(json) {
  if (!json?.days) return [];
  const chunks = json.days
    .filter((obj) => obj.assignments && Array.isArray(obj.assignments) && obj.assignments.length > 0 && typeof obj.assignments[0] === 'object')
    .map((obj) => obj.assignments);
  return [].concat(...chunks);
}

/** Varias llamadas getStudentsWithTasks (una por micro); devuelve tareas unificadas por user.id */
function mergeTasksFromMicroStudentPages(microResultsArrays) {
  const tasksByUserId = new Map();
  const userSeenInMicro = new Set();
  (microResultsArrays || []).forEach((microRows) => {
    if (!Array.isArray(microRows)) return;
    microRows.forEach((row) => {
      const uid = row.user?.id;
      if (uid == null) return;
      userSeenInMicro.add(uid);
      if (!tasksByUserId.has(uid)) tasksByUserId.set(uid, []);
      const acc = tasksByUserId.get(uid);
      const seenIds = new Set(acc.map((task) => task.id));
      (row.tasks || []).forEach((task) => {
        if (task?.id != null && !seenIds.has(task.id)) {
          acc.push(task);
          seenIds.add(task.id);
        }
      });
    });
  });
  return { tasksByUserId, userSeenInMicro };
}

/** Límites por micro al listar proyectos en una macro (misma API que cohort simple, sin backend nuevo). */
const MACRO_COHORT_TASKS_LIMIT_PER_MICRO = 500;

/** Une listas de tareas de varias cohortes y ordena como la vista de proyectos (pendientes de revisión primero). */
/** Next.js puede devolver query params duplicados como array. */
function singleQueryParam(value) {
  if (value == null || value === '') return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function mergeAndSortCohortProjectTasks(resultArrays) {
  const byId = new Map();
  (resultArrays || []).forEach((arr) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((task) => {
      if (task?.id != null) byId.set(task.id, task);
    });
  });
  const merged = [...byId.values()];
  const isPendingReview = (t) => t.task_status === 'DONE' && t.revision_status === 'PENDING';
  merged.sort((a, b) => {
    const pa = isPendingReview(a) ? 0 : 1;
    const pb = isPendingReview(b) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    const da = a.delivered_at ? new Date(a.delivered_at).getTime() : 0;
    const db = b.delivered_at ? new Date(b.delivered_at).getTime() : 0;
    return db - da;
  });
  return merged;
}

function Assignments() {
  const { t } = useTranslation('assignments');
  const educationalStatusList = [
    {
      label: t('educational-list.active'),
      value: 'active',
    },
    {
      label: t('educational-list.postponed'),
      value: 'postponed',
    },
    {
      label: t('educational-list.graduated'),
      value: 'graduated',
    },
    {
      label: t('educational-list.suspended'),
      value: 'suspended',
    },
    {
      label: t('educational-list.dropped'),
      value: 'dropped',
    },
  ];
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
    {
      label: t('status.ignored'),
      value: 'ignored',
    },
  ];
  const typeList = [
    {
      label: t('type.project'),
      value: 'PROJECT',
    },
    {
      label: t('type.quiz'),
      value: 'QUIZ',
    },
    {
      label: t('type.lesson'),
      value: 'LESSON',
    },
    {
      label: t('type.exercise'),
      value: 'EXERCISE',
    },
  ];
  const router = useRouter();
  const { query } = router;
  const { cohortSlug, academy } = query;
  const { cohorts } = useAuth();
  const { setCohortSession } = useCohortHandler();
  const { createToast } = useCustomToast({ toastId: 'fetching-personal-cohort-projects' });
  const { hexColor, borderColor2 } = useStyle();
  const { contextState, setContextState } = useAssignments();
  const [syllabusData, setSyllabusData] = useState({
    assignments: [],
  });
  const [microSyllabusBySlug, setMicroSyllabusBySlug] = useState({});
  const [personalCohorts, setPersonalCohorts] = useState([]);
  const [typeLabel, setTypeLabel] = useState(typeList.find((option) => option.value === query.task_type) || {
    label: t('type.project'),
    value: 'PROJECT',
  });
  const [studentLabel, setStudentLabel] = useState(null);
  const [projectLabel, setProjectLabel] = useState(null);
  const [educationalLabel, setEducationalLabel] = useState(query.educational_status ? educationalStatusList.filter((option) => query.educational_status.toLowerCase().includes(option.value)) : [{
    label: t('educational-list.active'),
    value: 'active',
  }]);
  const [statusLabel, setStatusLabel] = useState(statusList.find((option) => option.value === query.status));
  const [microCohortLabel, setMicroCohortLabel] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  const [currentView, setCurrentView] = useState(Number(query.view) || 0);
  const [sort, setSort] = useState(query.sort || undefined);

  const [currentStudentList, setCurrentStudentList] = useState([]);
  const [currentStudentCount, setCurrentStudentCount] = useState(0);

  const [finalProjects, setFinalProjects] = useState([]);

  const [selectedCohort, setSelectedCohort] = useState(null);
  const [loadStatus, setLoadStatus] = useState({
    loading: true,
    status: 'loading',
  });

  const reverseStatus = (status) => {
    if (status === 'delivered') return { task_status: 'DONE', revision_status: 'PENDING' };
    if (status === 'approved') return { revision_status: 'APPROVED' };
    if (status === 'rejected') return { revision_status: 'REJECTED' };
    if (status === 'undelivered') return { task_status: 'PENDING', revision_status: 'PENDING' };
    if (status === 'ignored') return { revision_status: 'ignored' };
    return {};
  };

  const getFilterAssignments = (cohortId, academyId, limit = 20, offset = 0, appendMore = false) => {
    setLoadStatus({ loading: true, status: 'loading' });

    const microsAll = sortMicroCohortsLikeDashboard(
      selectedCohort?.micro_cohorts || [],
      selectedCohort?.cohorts_order,
    );
    const isMacroWithMicros = microsAll.length > 0;
    const microCohortSlug = singleQueryParam(query.micro_cohort);
    let microsForFetch = microsAll.filter((m) => m?.id != null || m?.slug != null);
    if (isMacroWithMicros && microCohortSlug) {
      const picked = microsForFetch.filter((m) => m.slug === microCohortSlug);
      if (picked.length > 0) microsForFetch = picked;
    }

    const assignmentQuery = (lim, off) => ({
      limit: lim,
      offset: off,
      task_type: typeLabel?.value || undefined,
      student: router.query.student || undefined,
      sort,
      educational_status: educationalLabel.length > 0 ? educationalLabel.map((val) => val.value).join(',').toUpperCase() : undefined,
      like: query.project,
      ...reverseStatus(query.status),
    });

    const onFetchError = (error) => {
      createToast({
        position: 'top',
        title: t('alert-message:error-fetching-tasks'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      console.error('There was an error fetching the tasks', error);
    };

    if (isMacroWithMicros) {
      if (appendMore) {
        setLoadStatus({ loading: false, status: 'idle' });
        return;
      }
      Promise.all(
        microsForFetch.map((micro) => bc.assignments(assignmentQuery(MACRO_COHORT_TASKS_LIMIT_PER_MICRO, 0))
          .getCohortAssignments({ id: micro.id ?? micro.slug, academy: academyId })
          .then((projectList) => projectList.data || {})
          .catch(() => ({ results: [], count: 0 }))),
      )
        .then((dataList) => {
          const arrays = dataList.map((d) => d.results || []);
          const merged = mergeAndSortCohortProjectTasks(arrays);
          setContextState({
            allTasks: merged,
            tasksCount: merged.length,
          });
        })
        .catch(onFetchError)
        .finally(() => setLoadStatus({ loading: false, status: 'idle' }));
      return;
    }

    bc.assignments(assignmentQuery(limit, offset))
      .getCohortAssignments({ id: cohortId, academy: academyId })
      .then((projectList) => {
        const allTasks = projectList.data?.results;

        setContextState({
          allTasks: appendMore ? [...contextState.allTasks, ...allTasks] : [...allTasks],
          tasksCount: projectList.data?.count,
        });
      })
      .catch(onFetchError)
      .finally(() => setLoadStatus({ loading: false, status: 'idle' }));
  };

  useEffect(() => {
    if (!selectedCohort?.micro_cohorts?.length) {
      setMicroCohortLabel(null);
      return;
    }
    const micros = sortMicroCohortsLikeDashboard(
      selectedCohort.micro_cohorts,
      selectedCohort.cohorts_order,
    );
    const slug = singleQueryParam(query.micro_cohort);
    if (slug && typeof slug === 'string') {
      const m = micros.find((c) => c.slug === slug);
      setMicroCohortLabel(m ? { value: m.slug, label: m.name, id: m.id } : null);
    } else {
      setMicroCohortLabel(null);
    }
  }, [selectedCohort, query.micro_cohort]);

  const getDefaultStudent = () => {
    if (query.student) {
      bc.admissions({ users: query.student })
        .getStudentsWithTasks(cohortSlug, academy)
        .then((res) => {
          if (res.data?.length > 0) {
            const filteredStudent = res.data[0];
            setStudentLabel(filteredStudent && {
              id: filteredStudent.user.id,
              value:
                `${filteredStudent.user.first_name}-${filteredStudent.user.last_name}`?.toLowerCase(),
              label: `${filteredStudent.user.first_name} ${filteredStudent.user.last_name}`,
            });
          }
        });
    }
  };

  useEffect(() => {
    axiosInstance.defaults.headers.common.academy = academy;
    const cohortFiltered = cohorts.filter(
      (cohort) => cohort.cohort_user.role !== 'STUDENT',
    );

    setPersonalCohorts(
      cohortFiltered.sort((a, b) => a.name.localeCompare(b.name)),
    );
    const currentCohort = cohortFiltered.find((c) => c.slug === cohortSlug);
    setSelectedCohort(currentCohort);
    getDefaultStudent();
  }, [cohorts]);

  useEffect(() => {
    if (!selectedCohort?.id) return undefined;

    setCohortSession(selectedCohort);

    const academyId = selectedCohort.academy?.id || academy;
    const micros = sortMicroCohortsLikeDashboard(
      selectedCohort.micro_cohorts || [],
      selectedCohort.cohorts_order,
    );
    let cancelled = false;

    const showSyllabusError = (err) => {
      console.log(err);
      createToast({
        position: 'top',
        title: t('alert-message:error-fetching-cohorts'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    };

    const applyProjectQuery = (assignments) => {
      if (router.query.project) {
        const filteredProject = assignments.find((project) => project.slug === router.query.project);
        if (filteredProject) setProjectLabel({ label: filteredProject.title, value: filteredProject.slug });
      }
    };

    if (Array.isArray(micros) && micros.length > 0) {
      (async () => {
        const map = {};
        const bySlugSeen = new Map();
        const perMicroResults = await Promise.all(
          micros.map(async (micro) => {
            let slug = micro.syllabus_version?.slug;
            let version = micro.syllabus_version?.version;
            if (slug == null || version == null) {
              try {
                const { data: cohortData } = await bc.admissions().cohort(micro.slug, academyId);
                slug = cohortData.syllabus_version?.slug;
                version = cohortData.syllabus_version?.version;
              } catch (err) {
                showSyllabusError(err);
                return null;
              }
            }
            try {
              // Misma API que el dashboard: `macro-cohort` aplica overrides del syllabus del macro al JSON base de la micro.
              const syllabusQuery = selectedCohort.syllabus_version?.slug
                ? { 'macro-cohort': selectedCohort.slug }
                : {};
              const syllabusInfo = await bc.admissions(syllabusQuery).syllabus(slug, version, academyId);
              if (cancelled || !syllabusInfo?.data?.json) return null;
              const assignments = extractAssignmentsFromSyllabusDays(syllabusInfo.data.json);
              return { micro, assignments };
            } catch (err) {
              showSyllabusError(err);
              return null;
            }
          }),
        );
        if (cancelled) return;
        perMicroResults.filter(Boolean).forEach((row) => {
          const { micro, assignments } = row;
          map[micro.slug] = { name: micro.name, assignments };
          assignments.forEach((a) => {
            if (a?.slug && !bySlugSeen.has(a.slug)) bySlugSeen.set(a.slug, a);
          });
        });
        setMicroSyllabusBySlug(map);
        const merged = [...bySlugSeen.values()];
        setSyllabusData({ assignments: merged });
        applyProjectQuery(merged);
      })();
    } else {
      bc.admissions().cohort(selectedCohort.slug, academyId)
        .then(async ({ data }) => {
          const syllabusInfo = await bc.admissions().syllabus(data.syllabus_version.slug, data.syllabus_version.version, academy);
          if (cancelled || !syllabusInfo?.data) return;
          const assignments = extractAssignmentsFromSyllabusDays(syllabusInfo.data.json);
          setMicroSyllabusBySlug({});
          setSyllabusData({ assignments });
          applyProjectQuery(assignments);
        })
        .catch(showSyllabusError);
    }

    return () => {
      cancelled = true;
    };
  }, [selectedCohort]);

  const loadStudents = async (limit = 20, offset = 0, appendMore = false) => {
    setLoadStatus({ loading: true, status: 'loading' });
    const academyId = selectedCohort.academy.id || academy;
    const { slug } = selectedCohort;

    const admissionsBase = {
      limit,
      offset,
      sort,
      users: query.student,
      educational_status: educationalLabel.length > 0 ? educationalLabel.map((val) => val.value).join(',').toUpperCase() : undefined,
    };

    const sortedMicros = sortMicroCohortsLikeDashboard(
      selectedCohort.micro_cohorts || [],
      selectedCohort.cohorts_order,
    );
    const isMacro = sortedMicros.length > 0;

    try {
      const res = await bc.admissions(admissionsBase).getStudentsWithTasks(slug, academyId);
      let rows = res?.data?.results || [];

      if (isMacro && rows.length > 0) {
        const userIdsCsv = rows.map((r) => r.user.id).filter((id) => id != null).join(',');
        const edu = admissionsBase.educational_status;

        const microPages = await Promise.all(
          sortedMicros.map((micro) => bc.admissions({
            limit: 2000,
            offset: 0,
            sort,
            users: userIdsCsv,
            educational_status: edu,
          })
            .getStudentsWithTasks(micro.slug, academyId)
            .then((r) => r?.data?.results || [])
            .catch(() => [])),
        );

        const { tasksByUserId, userSeenInMicro } = mergeTasksFromMicroStudentPages(microPages);

        rows = rows.map((row) => {
          const uid = row.user?.id;
          if (uid == null) return row;
          if (!userSeenInMicro.has(uid)) return row;
          return {
            ...row,
            tasks: tasksByUserId.get(uid) || [],
          };
        });
      }

      setCurrentStudentList((prev) => (appendMore ? [...prev, ...rows] : rows));
      setCurrentStudentCount(res?.data?.count ?? 0);
    } catch {
      createToast({
        position: 'top',
        title: t('alert-message:error-fetching-students'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setLoadStatus({ loading: false, status: 'idle' });
    }
  };

  const loadFinalProjects = async () => {
    try {
      setLoadStatus({ loading: true, status: 'loading' });
      const resp = await bc.assignments().getFinalProjects(selectedCohort?.id);
      setFinalProjects(resp.data);
    } catch (e) {
      createToast({
        position: 'top',
        title: t('alert-message:error-fetching-final-projects'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setLoadStatus({ loading: false, status: 'idle' });
    }
  };

  const updateFinalProject = async (project, revisionStatus) => {
    try {
      const { id, members } = project;
      const payload = {
        cohort: selectedCohort?.id,
        revision_status: revisionStatus,
        members: members.map((member) => member.id),
      };
      const resp = await bc.assignments().putFinalProject(selectedCohort?.id, id, payload);
      const data = await resp.json();
      if (resp.status >= 400) {
        createToast({
          position: 'top',
          title: data.detail,
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      } else {
        const copyFinalProjects = [...finalProjects];
        const updatedIndex = copyFinalProjects.findIndex((elem) => elem.id === id);
        copyFinalProjects[updatedIndex].revision_status = revisionStatus;
        setFinalProjects(copyFinalProjects);
        createToast({
          position: 'top',
          title: t('alert-message:success-updating-final-projects'),
          status: 'success',
          duration: 7000,
          isClosable: true,
        });
      }
    } catch (e) {
      createToast({
        position: 'top',
        title: t('alert-message:error-updating-final-project'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (selectedCohort) {
      loadStudents();
      getFilterAssignments(selectedCohort?.id, selectedCohort?.academy.id || academy);
      loadFinalProjects();
    }
  }, [
    selectedCohort,
    router.query,
  ]);

  const closeFilterModal = () => setOpenFilter(false);

  const applyFilters = () => {
    const {
      project, student, status, task_type, educational_status, micro_cohort, ...params
    } = router.query;
    const filter = {};
    if (projectLabel) filter.project = projectLabel.value;
    if (studentLabel) filter.student = studentLabel.id;
    if (statusLabel) filter.status = statusLabel.value;
    if (typeLabel) filter.task_type = typeLabel.value;
    if (educationalLabel.length > 0) filter.educational_status = educationalLabel.map((val) => val.value).join(',').toUpperCase();
    if (microCohortLabel?.value) filter.micro_cohort = microCohortLabel.value;
    router.push({
      query: {
        ...params,
        ...filter,
      },
    });
    closeFilterModal();
  };

  const clearFilters = () => {
    const {
      project, student, status, task_type, educational_status, micro_cohort, ...params
    } = router.query;
    setProjectLabel(null);
    setStudentLabel(null);
    setStatusLabel(null);
    setTypeLabel(null);
    setEducationalLabel([]);
    setMicroCohortLabel(null);
    router.push({
      query: {
        ...params,
      },
    });
  };

  const updpateAssignment = (taskUpdated) => {
    const keyIndex = contextState.allTasks.findIndex((x) => x.id === taskUpdated.id);
    setContextState({
      ...contextState,
      allTasks: [
        ...contextState.allTasks.slice(0, keyIndex), // before keyIndex (inclusive)
        taskUpdated, // key item (updated)
        ...contextState.allTasks.slice(keyIndex + 1), // after keyIndex (exclusive)
      ],
    });
    const studentKey = currentStudentList.findIndex((x) => x.user.id === taskUpdated.user?.id);
    if (studentKey < 0) return;

    const taskKey = currentStudentList[studentKey].tasks.findIndex((x) => x.id === taskUpdated.id);
    const copyStudentList = [...currentStudentList];
    copyStudentList[studentKey].tasks[taskKey] = taskUpdated;
    setCurrentStudentList([...copyStudentList]);
  };

  const getOptionsStudents = (inputValue) => bc.admissions(inputValue ? { like: inputValue, limit: 2000 } : { limit: 2000 })
    .getStudents(
      selectedCohort.slug,
      selectedCohort.academy.id || academy,
    )
    .then((students) => students.data.results.map((student) => ({
      id: student.user.id,
      value: student.user.id,
      label: `${student.user.first_name} ${student.user.last_name}`,
    })).sort((a, b) => a.label.localeCompare(b.label)));

  return (
    <>
      <Box
        paddingBottom="30px"
        maxWidth={{ base: '90%', md: '90%', lg: '1012px' }}
        margin="2% auto 0 auto"
      >
        <Box
          display="flex"
          justifyContent="space-between"
        >
          <Link
            href={selectedCohort ? `/cohort/${selectedCohort.slug}/${selectedCohort.syllabus_version.slug}/v${selectedCohort.syllabus_version?.version}` : '/choose-program'}
            color={hexColor.blueDefault}
            display="inline-block"
            letterSpacing="0.05em"
            fontWeight="700"
          >
            {`← ${t('back-to')}`}
          </Link>
        </Box>
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
            {`${t('title')}:`}
          </Heading>
          {personalCohorts.length > 0 && (
            <ReactSelect
              unstyled
              color="#0097CD"
              fontWeight="700"
              id="cohort-select"
              fontSize="25px"
              placeholder={t('common:select-cohort')}
              noOptionsMessage={() => t('common:no-options-message')}
              value={selectedCohort ? { value: selectedCohort.id, label: selectedCohort.name } : ''}
              onChange={(cohort) => {
                if (cohort.slug !== selectedCohort?.slug) {
                  setCurrentStudentList([]);
                  setCurrentStudentCount(0);
                  setContextState({
                    tasksCount: 0,
                    allTasks: [],
                  });
                }
                const currentCohort = personalCohorts.find((c) => c.slug === cohort.slug);
                setSelectedCohort(currentCohort);
                router.push({
                  query: {
                    ...router.query,
                    cohortSlug: cohort.slug,
                    academy: cohort?.academy,
                  },
                });
              }}
              options={personalCohorts.map((l) => ({
                label: l.name,
                slug: l.slug,
                value: l.id,
                academy: l.academy.id,
              }))}
            />
          )}
        </Box>
      </Box>
      <Divider borderBottom="1px solid" color={borderColor2} />

      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="space-between"
        gridGap="20px"
        maxWidth={{ base: '90%', md: '90%', lg: '1012px' }}
        margin={{ base: '3% auto', md: '3% auto 0 auto', lg: '3% auto 0 auto' }}
        padding={{ base: '0', lg: '0' }}
      >
        <ButtonGroup
          borderColor={hexColor.blueDefault}
          isAttached
          variant="outline"
          spacing="6"
        >
          <Button
            background={currentView === 0 ? hexColor.blueDefault : 'none'}
            borderColor={hexColor.blueDefault}
            _hover={{ opacity: 0.8 }}
            _active={{ opacity: 0.8 }}
            color={currentView === 0 ? '#FFF' : hexColor.blueDefault}
            textTransform="uppercase"
            padding={{ base: '5px 10px', sm: '5px 15px' }}
            height="40px"
            leftIcon={(
              <Icon
                icon="student"
                width="15px"
                height="15px"
                color={currentView === 0 ? '#FFF' : hexColor.blueDefault}
              />
            )}
            onClick={() => {
              setCurrentView(0);
              router.push({
                query: {
                  ...router.query,
                  view: 0,
                },
              });
            }}
          >
            {t('students-view')}
          </Button>
          <Button
            background={currentView === 1 ? hexColor.blueDefault : 'none'}
            borderColor={hexColor.blueDefault}
            color={currentView === 1 ? '#FFF' : hexColor.blueDefault}
            _hover={{ opacity: 0.8 }}
            _active={{ opacity: 0.8 }}
            textTransform="uppercase"
            padding={{ base: '5px 10px', sm: '5px 15px' }}
            height="40px"
            leftIcon={(
              <Icon
                icon="laptop-code"
                width="20px"
                height="20px"
                color={currentView === 1 ? '#FFF' : hexColor.blueDefault}
              />
            )}
            onClick={() => {
              setCurrentView(1);
              router.push({
                query: {
                  ...router.query,
                  view: 1,
                },
              });
            }}
          >
            {t('projects-view')}
          </Button>
          <Button
            background={currentView === 2 ? hexColor.blueDefault : 'none'}
            borderColor={hexColor.blueDefault}
            color={currentView === 2 ? '#FFF' : hexColor.blueDefault}
            _hover={{ opacity: 0.8 }}
            _active={{ opacity: 0.8 }}
            textTransform="uppercase"
            padding={{ base: '5px 2px', sm: '5px 15px' }}
            whiteSpace="wrap"
            height="40px"
            leftIcon={(
              <Icon
                icon="graduationCap"
                width="20px"
                height="20px"
                color={currentView === 2 ? '#FFF' : hexColor.blueDefault}
              />
            )}
            onClick={() => {
              setCurrentView(2);
              router.push({
                query: {
                  ...router.query,
                  view: 2,
                },
              });
            }}
          >
            {t('final-projects')}
          </Button>
        </ButtonGroup>
        <Box display={currentView === 2 ? 'none' : 'flex'} gridGap="10px">
          <Button
            variant="ghost"
            color={hexColor.blueDefault}
            leftIcon={<Icon icon="filter" width="20px" height="20px" />}
            onClick={() => setOpenFilter(true)}
          >
            {t('common:filters')}
          </Button>
          <Popover maxWidth="200px" placement="bottom-start">
            <PopoverTrigger>
              <Button variant="unstyled" display="flex" gridGap="6px" color={hexColor.blueDefault} alignItems="center">
                <Icon icon="sort" width="18px" heigh="11px" color="currentColor" />
                <Text textTransform="uppercase" size="14px" fontWeight={700}>
                  {t('common:sort')}
                </Text>
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody display="flex" flexDirection="column" alignItems="flex-start" pl={4}>
                <Button
                  variant="unstyled"
                  onClick={() => {
                    const value = typeof sort === 'string' && sort.startsWith('-') ? 'user__first_name' : '-user__first_name';
                    setSort(value);
                    router.push({
                      query: {
                        ...router.query,
                        sort: value,
                      },
                    });
                  }}
                >
                  {`${t('sort.student')} ${typeof sort === 'string' && sort.startsWith('-') ? '▼' : '▲'}`}
                </Button>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Box>
      </Box>
      <Modal isOpen={openFilter} onClose={closeFilterModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('common:filters')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box marginBottom="10px">
              <ReactSelect
                id="educational-select"
                placeholder={t('filter.educational-status')}
                isClearable
                isMulti
                value={educationalLabel || ''}
                onChange={(selected) => {
                  setEducationalLabel(selected || []);
                }}
                options={educationalStatusList.map((stat) => ({
                  value: stat.value,
                  label: stat.label,
                }))}
                styles={{
                  multiValue: () => ({
                    backgroundColor: hexColor.featuredColor,
                  }),
                }}
              />
            </Box>
            {currentView === 1 && (
              <Box marginBottom="10px">
                <ReactSelect
                  id="type-select"
                  placeholder={t('filter.type')}
                  isClearable
                  value={typeLabel}
                  height="50px"
                  fontSize="15px"
                  onChange={(selected) => {
                    setTypeLabel(
                      selected !== null
                        ? {
                          value: selected?.value,
                          label: selected?.label,
                        }
                        : null,
                    );
                  }}
                  options={typeList.map((type) => ({
                    value: type.value,
                    label: type.label,
                  }))}
                />
              </Box>
            )}
            {currentView === 1 && selectedCohort?.micro_cohorts?.length > 0 && (
              <Box marginBottom="10px">
                <ReactSelect
                  id="micro-cohort-select"
                  placeholder={t('filter.micro-cohort')}
                  isClearable
                  value={microCohortLabel || ''}
                  height="50px"
                  fontSize="15px"
                  onChange={(selected) => {
                    setMicroCohortLabel(
                      selected != null
                        ? {
                          value: selected.value,
                          label: selected.label,
                          id: selected.id,
                        }
                        : null,
                    );
                  }}
                  options={sortMicroCohortsLikeDashboard(
                    selectedCohort.micro_cohorts,
                    selectedCohort.cohorts_order,
                  ).map((m) => ({
                    value: m.slug,
                    label: m.name,
                    id: m.id,
                  }))}
                />
              </Box>
            )}
            {currentView === 1 && (
              <Box marginBottom="10px">
                <ReactSelect
                  id="project-select"
                  placeholder={t('filter.project')}
                  isClearable
                  value={projectLabel || ''}
                  // defaultInputValue={projectDefaultValue}
                  onChange={(selected) => {
                    setProjectLabel(
                      selected !== null
                        ? {
                          value: selected?.value,
                          label: selected?.label,
                        }
                        : null,
                    );
                  }}
                  options={syllabusData.assignments.map((project) => ({
                    value: project.slug,
                    label: project.title,
                  }))}
                />
              </Box>
            )}
            <Box marginBottom="10px">
              <AsyncSelect
                id="student-select"
                placeholder={t('filter.student')}
                isClearable
                value={studentLabel || ''}
                height="50px"
                fontSize="15px"
                onChange={(selected) => {
                  setStudentLabel(
                    selected !== null
                      ? {
                        id: selected?.id,
                        value: selected?.value,
                        label: selected?.label,
                      }
                      : null,
                  );
                }}
                defaultOptions
                cacheOptions
                loadOptions={getOptionsStudents}
              />
            </Box>
            {currentView === 1 && (
              <Box marginBottom="10px">
                <ReactSelect
                  id="status-select"
                  placeholder={t('filter.status')}
                  isClearable
                  value={statusLabel}
                  height="50px"
                  fontSize="15px"
                  // defaultInputValue={statusDefaultValue}
                  onChange={(selected) => {
                    setStatusLabel(
                      selected !== null
                        ? {
                          value: selected?.value,
                          label: selected?.label,
                        }
                        : null,
                    );
                  }}
                  options={statusList.map((status) => ({
                    value: status.value,
                    label: status.label,
                  }))}
                />
              </Box>
            )}
          </ModalBody>

          <ModalFooter justifyContent="space-between">
            <Button
              color={hexColor.blueDefault}
              variant="ghost"
              mr={3}
              onClick={clearFilters}
            >
              {t('common:clear-all')}
            </Button>
            <Button colorScheme="blue" onClick={applyFilters}>
              {t('common:apply-filters')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box
        gridGap="20px"
        maxWidth="1012px"
        margin={{ base: '3% 4%', md: '2% auto 2% auto', lg: '2% auto 2% auto' }}
        padding={{ base: '0', md: '0 10px', lg: '0' }}
        p="0 0 30px 0"
      >
        {currentView === 0 && (
          <StudentAssignments
            currentStudentList={currentStudentList}
            loadStatus={loadStatus}
            selectedCohort={selectedCohort}
            syllabusData={syllabusData}
            updpateAssignment={updpateAssignment}
            count={currentStudentCount}
            loadStudents={loadStudents}
            isMacroCohort={Array.isArray(selectedCohort?.micro_cohorts) && selectedCohort.micro_cohorts.length > 0}
            microCohortOrder={sortMicroCohortsLikeDashboard(
              selectedCohort?.micro_cohorts || [],
              selectedCohort?.cohorts_order,
            )}
            microSyllabusBySlug={microSyllabusBySlug}
          />
        )}
        {currentView === 1 && (
          <Projects
            updpateAssignment={updpateAssignment}
            loadStatus={loadStatus}
            syllabusData={syllabusData}
            getFilterAssignments={getFilterAssignments}
            selectedCohort={selectedCohort}
          />
        )}
        {currentView === 2 && (
          <FinalProjects
            finalProjects={finalProjects}
            loadStatus={loadStatus}
            updpateProject={updateFinalProject}
          />
        )}
      </Box>
    </>
  );
}

export default asPrivate(Assignments);
