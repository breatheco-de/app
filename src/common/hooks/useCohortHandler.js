/* eslint-disable camelcase */
import axios from 'axios';
import { useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import useAuth from './useAuth';
import { devLog, getStorageItem } from '../../utils';
import useCohortAction from '../store/actions/cohortAction';
import useModuleHandler from './useModuleHandler';
import { processRelatedAssignments } from '../handlers/cohorts';
import bc from '../services/breathecode';
import { BREATHECODE_HOST, DOMAIN_NAME } from '../../utils/variables';

function useCohortHandler() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, lang } = useTranslation('dashboard');
  const { setCohortSession, setTaskCohortNull, setSortedAssignments, setUserCapabilities, setMyCohorts, state } = useCohortAction();
  const { cohortProgram, taskTodo, setCohortProgram, setTaskTodo } = useModuleHandler();

  const {
    cohortSession,
    sortedAssignments,
    userCapabilities,
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

  const getCohortAssignments = async ({
    slug, cohort, updatedUser = undefined,
  }) => {
    if (user) {
      const academyId = cohort?.academy.id;
      const version = cohort?.syllabus_version?.version;
      const syllabusSlug = cohort?.syllabus_version?.slug || slug;
      const currentAcademy = user.roles.find((role) => role.academy.id === academyId) || updatedUser?.roles.find((role) => role.academy.id === academyId);
      if (currentAcademy) {
        // Fetch cohortProgram and TaskTodo then apply to moduleMap store
        try {
          const [taskTodoData, programData, userRoles] = await Promise.all([
            bc.todo({ cohort: cohort.id, limit: 1000 }).getTaskByStudent(), // Tasks with cohort id
            bc.syllabus().get(academyId, syllabusSlug, version), // cohortProgram
            bc.auth().getRoles(currentAcademy?.role), // Roles
          ]);
          setUserCapabilities(userRoles.data.capabilities);
          setTaskTodo(taskTodoData.data.results);
          setCohortProgram(programData.data);
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
        const { data } = await bc.admissions().me();
        if (!data) throw new Error('No data');
        const { cohorts } = data;

        const parsedCohorts = cohorts.map(((elem) => {
          const { cohort, ...cohort_user } = elem;
          const { syllabus_version } = cohort;
          return {
            ...cohort,
            selectedProgramSlug: `/cohort/${cohort.slug}/${syllabus_version.slug}/v${syllabus_version.version}`,
            cohort_role: elem.role,
            cohort_user,
          };
        }));

        // find cohort with current slug
        const currentCohort = parsedCohorts.find((c) => c.slug === cohortSlug);

        if (!currentCohort) {
          if (assetSlug) return handleRedirectToPublicPage();

          return router.push('/choose-program');
        }

        setCohortSession(currentCohort);
        setMyCohorts(parsedCohorts);
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

  // Sort all data fetched in order of taskTodo
  const prepareTasks = () => {
    const moduleData = cohortProgram?.json?.days || cohortProgram?.json?.modules || [];
    const assignmentsRecopilated = [];
    devLog('json.days:', moduleData);

    if (cohortProgram?.json && taskTodo) {
      moduleData.forEach((assignment) => {
        const {
          id, label, description, lessons, replits, assignments, quizzes,
        } = assignment;
        if (lessons && replits && assignments && quizzes) {
          const nestedAssignments = processRelatedAssignments(assignment, taskTodo);

          // this properties name's reassignment is done to keep compatibility with deprecated functions
          const {
            content: modules,
            filteredContent: filteredModules,
            filteredContentByPending: filteredModulesByPending,
          } = nestedAssignments;

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
        }
      });
      const filterNotEmptyModules = assignmentsRecopilated.filter(
        (l) => l.modules.length > 0,
      );
      setSortedAssignments(filterNotEmptyModules);
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

  const getLastDoneTaskModuleData = () => {
    let lastDoneTaskModule = null;
    sortedAssignments.forEach(
      (module) => {
        if (module.modules.some((task) => task.task_status === 'DONE')) lastDoneTaskModule = module;
      },
    );
    return lastDoneTaskModule;
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
    setCohortSession,
    setSortedAssignments,
    getCohortAssignments,
    getCohortData,
    prepareTasks,
    getDailyModuleData,
    getLastDoneTaskModuleData,
    getMandatoryProjects,
    getTasksWithoutCohort,
    userCapabilities,
    state,
    setMyCohorts,
  };
}

export default useCohortHandler;
