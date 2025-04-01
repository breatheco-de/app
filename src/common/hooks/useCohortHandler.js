/* eslint-disable camelcase */
import { useMemo } from 'react';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import useAuth from './useAuth';
import { getStorageItem, getBrowserInfo } from '../../utils';
import useCohortAction from '../store/actions/cohortAction';
import { processRelatedAssignments } from '../handlers/cohorts';
import { reportDatalayer } from '../../utils/requests';
import bc from '../services/breathecode';
import { BREATHECODE_HOST, DOMAIN_NAME } from '../../utils/variables';

function useCohortHandler() {
  const router = useRouter();
  const { user, cohorts: myCohorts, fetchUserAndCohorts, setCohorts } = useAuth();
  const { t, lang } = useTranslation('dashboard');
  const {
    setCohortSession,
    setTaskCohortNull,
    setUserCapabilities,
    setCohortsAssingments,
    setReviewModalState,
    state,
  } = useCohortAction();

  const {
    cohortSession,
    userCapabilities,
    cohortsAssignments,
  } = state;
  const toast = useToast();
  const accessToken = getStorageItem('accessToken');
  const assetSlug = router?.query?.lessonSlug;
  const assetType = router?.query?.lesson;
  const assetTypes = {
    read: 'lesson',
    practice: 'exercise',
    project: 'project',
    answer: 'quiz',
  };

  const redirectToPublicPage = (data) => {
    const englishSlug = {
      en: data?.translations?.us,
    };
    const assetTypeValue = data?.asset_type || assetTypes[assetType];
    const assetTypeLower = assetTypeValue.toLowerCase();
    const translationSlug = englishSlug?.[lang] || data?.translations?.[lang] || assetSlug;

    const pathConnector = {
      lesson: `${lang === 'en' ? `${DOMAIN_NAME}/lesson/${translationSlug}` : `${DOMAIN_NAME}/${lang}/lesson/${translationSlug}`}`,
      exercise: `${lang === 'en' ? `${DOMAIN_NAME}/interactive-exercise/${translationSlug}` : `${DOMAIN_NAME}/${lang}/interactive-exercise/${translationSlug}`}`,
      project: `${lang === 'en' ? `${DOMAIN_NAME}/project/${translationSlug}` : `${DOMAIN_NAME}/${lang}/project/${translationSlug}`}`,
    };
    if (pathConnector?.[assetTypeLower]) {
      window.location.href = pathConnector[assetTypeLower];
    }
  };

  const serializeModulesMap = (moduleData, tasks) => {
    const assignmentsRecopilated = [];
    moduleData.forEach((module) => {
      const {
        id, label, description, lessons, replits, assignments, quizzes,
      } = module;
      if (lessons && replits && assignments && quizzes) {
        const nestedAssignments = processRelatedAssignments(module, tasks);

        // this properties name's reassignment is done to keep compatibility with deprecated functions
        const {
          content,
          filteredContent,
          filteredContentByPending,
        } = nestedAssignments;

        // Data to be sent to [sortedAssignments] = state
        const assignmentsStruct = {
          id,
          label,
          description,
          content,
          exists_activities: content?.length > 0,
          filteredContent,
          filteredContentByPending: content?.length > 0 ? filteredContentByPending : null,
          duration_in_days: module?.duration_in_days || null,
          teacherInstructions: module.teacher_instructions,
          extendedInstructions: module.extended_instructions || `${t('teacher-sidebar.no-instructions')}`,
          keyConcepts: module['key-concepts'],
        };

        if (content.length > 0) {
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
        }
      }
    });

    return assignmentsRecopilated;
  };

  const getCohortsModules = async (cohorts) => {
    try {
      const assignmentsMap = {};

      const preFechedCohorts = cohorts.reduce((acum, curr) => {
        if (curr.slug in cohortsAssignments) return [...acum, curr];
        return acum;
      }, []);

      const cohortsToFetch = cohorts.filter((cohort) => !preFechedCohorts.some(({ slug }) => slug === cohort.slug));

      const syllabusPromises = cohortsToFetch.map((cohort) => bc.syllabus().get(cohort.academy.id, cohort.syllabus_version.slug, cohort.syllabus_version.version).then((res) => ({ cohort: cohort.id, ...res })));
      const tasksPromises = cohortsToFetch.map((cohort) => bc.todo({ cohort: cohort.id, limit: 1000 }).getTaskByStudent().then((res) => ({ cohort: cohort.id, ...res })));
      const allResults = await Promise.all([
        ...syllabusPromises,
        ...tasksPromises,
      ]);

      preFechedCohorts.forEach(({ slug }) => {
        assignmentsMap[slug] = { ...cohortsAssignments[slug] };
      });

      cohortsToFetch.forEach((cohort) => {
        const cohortResults = allResults.filter((elem) => elem.cohort === cohort.id);

        let syllabus = null;
        let tasks = [];

        cohortResults.forEach((elem) => {
          const { data } = elem;
          if ('json' in data) syllabus = data;
          else tasks = data.results;
        });
        const cohortModules = serializeModulesMap(syllabus.json.days, tasks);

        assignmentsMap[cohort.slug] = {
          modules: cohortModules,
          syllabus,
          tasks,
        };
      });

      setCohortsAssingments({ ...cohortsAssignments, ...assignmentsMap });

      return assignmentsMap;
    } catch (e) {
      console.log(e);
      toast({
        position: 'top',
        title: t('alert-message:error-fetching-syllabus'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });

      return {};
    }
  };

  const getCohortUserCapabilities = async ({
    cohort, updatedUser = undefined,
  }) => {
    if (user) {
      const academyId = cohort?.academy?.id;
      const currentAcademy = user.roles.find((role) => role.academy.id === academyId) || updatedUser?.roles.find((role) => role.academy.id === academyId);
      if (currentAcademy) {
        try {
          const userRoles = await bc.auth().getRoles(currentAcademy?.role); // Roles

          setUserCapabilities(userRoles.data.capabilities);
        } catch (err) {
          console.log(err);
          toast({
            position: 'top',
            title: t('alert-message:error-fetching-role', { role: currentAcademy?.role }),
            description: err.message,
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
          router.push('/choose-program');
        }
      }
    }
  };

  const handleRedirectToPublicPage = async () => {
    try {
      const response = await axios.get(`${BREATHECODE_HOST}/v1/registry/asset/${assetSlug}`);
      if (response?.data?.asset_type) {
        redirectToPublicPage(response.data);
      }
    } catch (e) {
      router.push('/404');
    }
  };

  const getCohortData = async ({
    cohortSlug,
  }) => {
    try {
      // Fetch cohort data with pathName structure
      if (cohortSlug && accessToken) {
        // find cohort with current slug
        let prefetchedCohorts = myCohorts;
        let currentCohort = prefetchedCohorts.find((c) => c.slug === cohortSlug);

        //we make sure that we have already loaded the data of the cohort and its micro cohorts
        if (!currentCohort || (currentCohort.micro_cohorts.length > 0 && !currentCohort.micro_cohorts.every((cohort) => myCohorts.some(({ slug }) => cohort.slug === slug)))) {
          const { cohorts: fetchedCohorts } = await fetchUserAndCohorts();
          setCohorts(fetchedCohorts);
          prefetchedCohorts = fetchedCohorts;

          currentCohort = fetchedCohorts.find((c) => c.slug === cohortSlug);
        }

        if (!currentCohort) {
          if (assetSlug) return handleRedirectToPublicPage();

          return router.push('/choose-program');
        }

        const cohorts = currentCohort.micro_cohorts.length > 0 ? prefetchedCohorts.filter((c) => currentCohort.micro_cohorts.some((elem) => elem.slug === c.slug)) : [currentCohort];

        await getCohortsModules(cohorts);

        setCohortSession(currentCohort);
        return currentCohort;
      }

      return handleRedirectToPublicPage();
    } catch (error) {
      handleRedirectToPublicPage();
      toast({
        position: 'top',
        title: t('alert-message:invalid-cohort-slug'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      return localStorage.removeItem('cohortSession');
    }
  };

  const taskTodo = useMemo(() => {
    if (cohortSession && cohortSession.slug in cohortsAssignments) {
      return cohortsAssignments[cohortSession.slug].tasks;
    }
    return [];
  }, [cohortsAssignments, cohortSession]);

  const cohortProgram = useMemo(() => {
    if (cohortSession && cohortSession.slug in cohortsAssignments) {
      return cohortsAssignments[cohortSession.slug].syllabus;
    }
    return null;
  }, [cohortsAssignments, cohortSession]);

  const sortedAssignments = useMemo(() => {
    if (cohortSession?.slug in cohortsAssignments) return cohortsAssignments[cohortSession.slug].modules;
    return [];
  }, [cohortsAssignments, cohortSession]);

  const updateTask = (task, cohort) => {
    const { id, name, slug } = cohort;
    const cohortData = cohortsAssignments[slug];

    const keyIndex = cohortData.tasks.findIndex((x) => x.id === task.id);

    const newTasks = [
      ...cohortData.tasks.slice(0, keyIndex), // before keyIndex (inclusive)
      { ...task, cohort: { id, name, slug } }, // key item (updated)
      ...cohortData.tasks.slice(keyIndex + 1), // after keyIndex (exclusive)
    ];

    setCohortsAssingments({
      ...cohortsAssignments,
      [slug]: {
        ...cohortData,
        tasks: newTasks,
        modules: serializeModulesMap(cohortData.syllabus.json.days, newTasks),
      },
    });
  };

  const updateTaskReadAt = async (task) => {
    try {
      const response = await bc.todo().update({
        id: task.id,
        read_at: new Date().toISOString(),
      });

      if (response.status < 400) {
        updateTask(response.data, task.cohort);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating read_at:', error);
      return false;
    }
  };

  const addTasks = (tasks, cohort) => {
    const { id, slug, name } = cohort;
    const cohortData = cohortsAssignments[cohort.slug];

    const newTasks = [
      ...cohortData.tasks,
      ...tasks.map((task) => ({ ...task, cohort: { id, slug, name } })),
    ];

    setCohortsAssingments({
      ...cohortsAssignments,
      [cohort.slug]: {
        ...cohortData,
        tasks: newTasks,
        modules: serializeModulesMap(cohortData.syllabus.json.days, newTasks),
      },
    });
  };

  const updateAssignment = async ({
    task, githubUrl, taskStatus,
  }) => {
    // Task case
    const { cohort, ...taskData } = task;
    const toggleStatus = (task.task_status === undefined || task.task_status === 'PENDING') ? 'DONE' : 'PENDING';
    const isProject = task.task_type && task.task_type === 'PROJECT';

    try {
      const projectUrl = githubUrl || '';

      const isDelivering = projectUrl !== '';

      let taskToUpdate;

      const toastMessage = () => {
        if (!isProject) return t('alert-message:assignment-updated');
        return isDelivering ? t('alert-message:delivery-success') : t('alert-message:delivery-removed');
      };

      if (isProject) {
        taskToUpdate = {
          ...taskData,
          task_status: taskStatus || toggleStatus,
          github_url: projectUrl,
          revision_status: 'PENDING',
          delivered_at: new Date().toISOString(),
        };
      } else {
        taskToUpdate = {
          ...taskData,
          id: task.id,
          task_status: toggleStatus,
        };
      }

      const response = await bc.todo().update(taskToUpdate);
      if (response.status < 400) {
        updateTask(taskToUpdate, cohort);
        reportDatalayer({
          dataLayer: {
            event: 'assignment_status_updated',
            task_status: taskStatus,
            task_id: task.id,
            task_title: task.title,
            task_associated_slug: task.associated_slug,
            task_type: task.task_type,
            task_revision_status: task.revision_status,
            agent: getBrowserInfo(),
          },
        });
        toast({
          position: 'top',
          title: toastMessage(),
          status: 'success',
          duration: 6000,
          isClosable: true,
        });
      } else {
        toast({
          position: 'top',
          title: isProject ? t('alert-message:delivery-error') : t('alert-message:assignment-update-error'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        position: 'top',
        title: isProject ? t('alert-message:delivery-error') : t('alert-message:assignment-update-error'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const changeStatusAssignment = async (task, taskStatus) => {
    if (task?.slug || task?.associated_slug) {
      reportDatalayer({
        dataLayer: {
          event: 'assignment_status_updated',
          task_status: taskStatus,
          task_id: task.id,
          task_title: task.title,
          task_associated_slug: task.associated_slug,
          task_type: task.task_type,
          task_revision_status: task.revision_status,
          agent: getBrowserInfo(),
        },
      });
      await updateAssignment({
        task, taskStatus,
      });
    }
  };

  const startDay = async ({
    newTasks, cohort, label, customHandler = () => {}, updateContext = true,
  }) => {
    try {
      const response = await bc.todo().add(newTasks);

      if (response.status < 400) {
        toast({
          position: 'top',
          title: label
            ? t('alert-message:module-started', { title: label })
            : t('alert-message:module-sync-success'),
          status: 'success',
          duration: 6000,
          isClosable: true,
        });
        if (updateContext) {
          addTasks(response.data, cohort);
        }
        customHandler(response.data);
      }
    } catch (err) {
      console.log('error_ADD_TASK 🔴 ', err);
      toast({
        position: 'top',
        title: t('alert-message:module-start-error'),
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  const getTasksWithoutCohort = ({ setModalIsOpen }) => {
    // Tasks with cohort null
    if (router.asPath === cohortSession?.selectedProgramSlug) {
      bc.todo({ cohort: null }).getTaskByStudent()
        .then(({ data }) => {
          const filteredUnsyncedCohortTasks = sortedAssignments.flatMap(
            (module) => data.filter(
              (task) => module.content.some(
                (assignment) => task.associated_slug === assignment.slug,
              ),
            ),
          );
          setModalIsOpen(filteredUnsyncedCohortTasks.length !== 0);
          setTaskCohortNull(filteredUnsyncedCohortTasks);
        });
    }
    return () => {};
  };

  const getDailyModuleData = () => {
    const dailyModule = sortedAssignments.find(
      (assignment) => assignment.id === cohortSession?.current_module,
    );
    return dailyModule;
  };

  const getLastDoneTaskModuleData = () => {
    let lastDoneTaskModule = null;
    sortedAssignments.forEach(
      (module) => {
        if (module.content.some((task) => task.task_status === 'DONE')) lastDoneTaskModule = module;
      },
    );
    return lastDoneTaskModule;
  };

  const getMandatoryProjects = (cohortSlug = null) => {
    const assignments = cohortSlug ? cohortsAssignments[cohortSlug]?.modules : sortedAssignments;
    if (!assignments) return [];

    const mandatoryProjects = assignments.flatMap(
      (module) => module.filteredContent.filter(
        (l) => {
          const timeOutExceeded = l.daysDiff >= 14; // exceeds 2 weeks
          const isPendingRevision = l.reviewed_at !== null && (l.reviewed_at > l.read_at || l.read_at === null);
          const isMandatoryTimeOut = l.task_type === 'PROJECT' && (l.task_status === 'PENDING' || l.revision_status === 'REJECTED')
            && ((l.mandatory === true && timeOutExceeded) || isPendingRevision);

          return isMandatoryTimeOut;
        },
      ),
    );
    return mandatoryProjects;
  };

  const handleOpenReviewModal = (options = {}) => {
    const {
      currentTask = null,
      externalFiles = null,
      defaultStage = undefined,
      cohortSlug = undefined,
      fixedStage = false,
    } = options;

    setReviewModalState({
      isOpen: true,
      currentTask,
      externalFiles,
      defaultStage,
      cohortSlug,
      fixedStage,
    });
  };

  const handleCloseReviewModal = () => {
    setReviewModalState({
      isOpen: false,
      currentTask: null,
      externalFiles: null,
      defaultStage: undefined,
      cohortSlug: undefined,
      fixedStage: false,
    });
  };

  return {
    setCohortSession,
    getCohortUserCapabilities,
    getCohortData,
    getDailyModuleData,
    getLastDoneTaskModuleData,
    getMandatoryProjects,
    getTasksWithoutCohort,
    userCapabilities,
    state,
    setCohortsAssingments,
    serializeModulesMap,
    taskTodo,
    cohortProgram,
    addTasks,
    updateTask,
    updateTaskReadAt,
    updateAssignment,
    startDay,
    getCohortsModules,
    sortedAssignments,
    handleOpenReviewModal,
    handleCloseReviewModal,
    changeStatusAssignment,
    ...state,
  };
}

export default useCohortHandler;
