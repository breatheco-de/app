import axios from 'axios';
import { useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { devLog, getStorageItem } from '../../utils';
// import { useState, useEffect } from 'react';
// import { usePersistent } from '../../hooks/usePersistent';
import bc from '../services/breathecode';
import { usePersistent } from './usePersistent';
import { BREATHECODE_HOST, DOMAIN_NAME } from '../../utils/variables';

function useHandler() {
  const router = useRouter();
  const { t, lang } = useTranslation('dashboard');
  const [cohortSession, setCohortSession] = usePersistent('cohortSession', {});
  const [sortedAssignments, setSortedAssignments] = usePersistent('sortedAssignments', []);
  const [taskTodo, setTaskTodo] = usePersistent('taskTodo', []);
  const [taskTodoState, setTaskTodoState] = useState([]);
  const [taskCohortNull, setTaskCohortNull] = useState([]);
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

  const getCohortAssignments = ({
    user, setContextState, slug,
  }) => {
    if (user && user.active_cohort && cohortSession.cohort_role) {
      const academyId = user.active_cohort.academy_id;
      const { version } = user.active_cohort;
      const cohortSlug = user?.active_cohort?.slug || slug;
      const currentAcademy = user.roles.find((role) => role.academy.id === academyId);
      if (currentAcademy) {
        // Fetch cohortProgram and TaskTodo then apply to contextState (useModuleMap - action)
        Promise.all([
          bc.todo({ cohort: cohortSession.id, limit: 1000 }).getTaskByStudent(), // Tasks with cohort id
          bc.syllabus().get(academyId, cohortSlug, version), // cohortProgram
          bc.auth().getRoles(currentAcademy?.role), // Roles
        ]).then((
          [taskTodoData, programData, userRoles],
        ) => {
          const technologiesArray = programData.data.main_technologies
            ? programData.data.main_technologies.split(',').map((el) => el.trim())
            : [];

          setCohortSession({
            ...cohortSession,
            main_technologies: technologiesArray,
            academy_owner: programData.data.academy_owner,
            bc_id: user.id,
            user_capabilities: userRoles.data.capabilities,
          });
          setContextState({
            taskTodo: taskTodoData.data.results,
            cohortProgram: programData.data,
          });
        }).catch((err) => {
          toast({
            position: 'top',
            title: t('alert-message:error-fetching-role', { role: currentAcademy?.role }),
            description: err.message,
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
          router.push('/choose-program');
        });
      }
    }
  };

  const handleRedirectToPublicPage = () => {
    axios.get(`${BREATHECODE_HOST}/v1/registry/asset/${assetSlug}`)
      .then((response) => {
        if (response?.data?.asset_type) {
          redirectToPublicPage(response.data);
        }
      })
      .catch(() => {
        router.push('/404');
      });
  };

  const getCohortData = ({
    choose, cohortSlug,
  }) => new Promise((resolve, reject) => {
    // Fetch cohort data with pathName structure
    if (cohortSlug && accessToken) {
      bc.admissions().me().then(({ data }) => {
        if (!data) throw new Error('No data');
        const { cohorts } = data;
        // find cohort with current slug
        const findCohort = cohorts.find((c) => c.cohort.slug === cohortSlug);
        const currentCohort = findCohort?.cohort;
        const version = currentCohort?.syllabus_version?.version;
        const name = currentCohort?.syllabus_version?.name;
        if (assetSlug && (!cohortSession?.academy?.id || !currentCohort)) {
          handleRedirectToPublicPage();
        }
        if (currentCohort) {
          setCohortSession({
            ...cohortSession,
            ...currentCohort,
            date_joined: data.date_joined,
            cohort_role: findCohort?.role,
            cohort_user: {
              created_at: findCohort?.created_at,
              educational_status: findCohort?.educational_status,
              finantial_status: findCohort?.finantial_status,
              role: findCohort?.role,
            },
          });
          choose({
            cohort_slug: cohortSlug,
            date_joined: data.date_joined,
            cohort_role: findCohort?.role,
            version,
            slug: currentCohort?.syllabus_version.slug,
            cohort_name: currentCohort.name,
            cohort_id: currentCohort.id,
            syllabus_name: name,
            academy_id: currentCohort.academy.id,
          });
          resolve(currentCohort);
        }
      }).catch((error) => {
        handleRedirectToPublicPage();
        toast({
          position: 'top',
          title: t('alert-message:invalid-cohort-slug'),
          // title: 'Invalid cohort slug',
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        reject(error);
        setTimeout(() => {
          localStorage.removeItem('cohortSession');
        }, 4000);
      });
    } else {
      handleRedirectToPublicPage();
    }
  });

  // Sort all data fetched in order of taskTodo
  const prepareTasks = ({
    cohortProgram, contextState, nestAssignments,
  }) => {
    const moduleData = cohortProgram.json?.days || cohortProgram.json?.modules;
    const cohort = cohortProgram.json ? moduleData : [];
    const assignmentsRecopilated = [];
    devLog('json.days:', moduleData);

    if (contextState.cohortProgram.json && contextState.taskTodo) {
      setTaskTodo(contextState.taskTodo);
      setTaskTodoState(contextState.taskTodo);
      cohort.map((assignment) => {
        const {
          id, label, description, lessons, replits, assignments, quizzes,
        } = assignment;
        if (lessons && replits && assignments && quizzes) {
          const nestedAssignments = nestAssignments({
            id,
            read: lessons,
            practice: replits,
            project: assignments,
            answer: quizzes,
            taskTodo: contextState.taskTodo,
          });
          const { modules, filteredModules, filteredModulesByPending } = nestedAssignments;

          // Data to be sent to [sortedAssignments] = state
          const assignmentsStruct = {
            id,
            label,
            description,
            modules,
            exists_activities: modules?.length > 0,
            filteredModules,
            filteredModulesByPending: modules?.length > 0 ? filteredModulesByPending : null,
            duration_in_days: assignment?.duration_in_days || null,
            teacherInstructions: assignment.teacher_instructions,
            extendedInstructions: assignment.extended_instructions || `${t('teacher-sidebar.no-instructions')}`,
            keyConcepts: assignment['key-concepts'],
          };

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

          const filterNotEmptyModules = assignmentsRecopilated.filter(
            (l) => l.modules.length > 0,
          );
          return setSortedAssignments(filterNotEmptyModules);
        }
        return null;
      });
    }
  };

  const getTasksWithoutCohort = ({ setModalIsOpen }) => {
    // Tasks with cohort null
    if (router.asPath === cohortSession.selectedProgramSlug) {
      bc.todo({ cohort: null }).getTaskByStudent()
        .then(({ data }) => {
          const filteredUnsyncedCohortTasks = sortedAssignments.flatMap(
            (assignment) => data.filter(
              (task) => assignment.modules.some(
                (module) => task.associated_slug === module.slug,
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

  const getMandatoryProjects = () => {
    const mandatoryProjects = sortedAssignments.flatMap(
      (assignment) => assignment.filteredModules.filter(
        (l) => {
          const isMandatoryTimeOut = l.task_type === 'PROJECT' && l.task_status === 'PENDING'
            && l.mandatory === true && l.daysDiff >= 14; // exceeds 2 weeks

          return isMandatoryTimeOut;
        },
      ),
    );
    return mandatoryProjects;
  };

  return {
    cohortSession,
    taskCohortNull,
    sortedAssignments,
    getCohortAssignments,
    getCohortData,
    prepareTasks,
    getDailyModuleData,
    getMandatoryProjects,
    getTasksWithoutCohort,
    taskTodo,
    setTaskTodo,
    taskTodoState,
  };
}

export default useHandler;
