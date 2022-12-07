import { toast } from '@chakra-ui/react';
import axios from 'axios';
import modifyEnv from '../../../modifyEnv';
import getMarkDownContent from '../../common/components/MarkDownParser/markdown';
import { nestAssignments } from '../../common/hooks/useModuleHandler';
import bc from '../../common/services/breathecode';
import { getExtensionName } from '../../utils';
import { Config } from './config';

export const getCurrentCohort = ({
  cohortSlug, choose, router, t,
}) => {
  bc.admissions().me()
    .then(({ data }) => {
      const { cohorts } = data;
      // find cohort with current slug
      const findCohort = cohorts.find((c) => c.cohort.slug === cohortSlug);
      const currentCohort = findCohort?.cohort;
      const { version, name } = currentCohort?.syllabus_version;
      choose({
        cohort_slug: cohortSlug,
        date_joined: data.date_joined,
        cohort_role: findCohort.role,
        version,
        slug: currentCohort?.syllabus_version.slug,
        cohort_name: currentCohort.name,
        cohort_id: currentCohort.id,
        syllabus_name: name,
        academy_id: currentCohort.academy.id,
      });
    })
    .catch((err) => {
      router.push('/choose-program');
      toast({
        title: t('alert-message:invalid-cohort-slug'),
        description: err,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    });
};

export const defaultDataFetch = async ({
  currentBlankProps, lessonSlug, assetTypeValues, lesson, setQuizSlug, setReadme,
  setCurrentData, setIpynbHtmlUrl, router, t,
}) => {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const currentLanguageLabel = router.language === 'en' ? t('common:english') : t('common:spanish');
  const { currentThemeValue } = Config();

  if (currentBlankProps === null || currentBlankProps?.target !== 'blank') {
    Promise.all([
      axios.get(`${BREATHECODE_HOST}/v1/registry/asset/${lessonSlug}.md`),
      axios.get(`${BREATHECODE_HOST}/v1/registry/asset/${lessonSlug}?asset_type=${assetTypeValues[lesson]}`),
    ])
      .then(([respMarkdown, respData]) => {
        const currData = respData.data;
        const markdownData = respMarkdown.data;
        toast({
          title: t('alert-message:language-not-found', { currentLanguageLabel }),
          // not found, showing the english version`,
          status: 'warning',
          duration: 5500,
          isClosable: true,
        });
        const exensionName = getExtensionName(currData.readme_url);

        if (lesson === 'answer') setQuizSlug(lessonSlug);
        else setQuizSlug(null);

        if (currData !== undefined && typeof markdownData === 'string') {
          // Binary base64 decoding ⇢ UTF-8
          const markdown = getMarkDownContent(markdownData);
          setReadme(markdown);
          setCurrentData(currData);
        }
        if (exensionName === 'ipynb') setIpynbHtmlUrl(`${BREATHECODE_HOST}/v1/registry/asset/preview/${lessonSlug}?theme=${currentThemeValue}&plain=true`);
        else setIpynbHtmlUrl(null);
      })
      .catch(() => {
        toast({
          title: t('alert-message:default-version-not-found', { lesson }),
          // description: 'Content not found',
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
  }
};

export const prepareCohortContext = ({
  user, cohortSession, setCohortSession, setContextState, router, t,
}) => {
  const academyId = user.active_cohort.academy_id;
  const { version, slug } = user.active_cohort;
  const currentAcademy = user.roles.find((role) => role.academy.id === academyId);

  // Fetch cohortProgram and TaskTodo then apply to contextState (useModuleMap - action)
  if (cohortSession.slug) {
    Promise.all([
      bc.todo({ cohort: cohortSession.id }).getTaskByStudent(), // Tasks with cohort id
      bc.syllabus().get(
        academyId,
        slug,
        version,
      ), // cohortProgram
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
        taskTodo: taskTodoData.data,
        cohortProgram: programData.data,
      });
    }).catch((err) => {
      toast({
        title: t('alert-message:error-fetching-role', { role: currentAcademy?.role }),
        description: err.message,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      router.push('/choose-program');
    });
  }
};

export const prepareTaskModules = ({
  contextState, cohort, setSortedAssignments,
}) => {
  const assignmentsRecopilated = [];
  cohort.map((assignment) => {
    const {
      id, description, lessons, replits, assignments, quizzes,
    } = assignment;
    const nestedAssignments = nestAssignments({
      id,
      read: lessons,
      practice: replits,
      code: assignments,
      answer: quizzes,
      taskTodo: contextState.taskTodo,
    });
    const { modules, filteredModules, filteredModulesByPending } = nestedAssignments;

    // Data to be sent to [sortedAssignments] = state
    const assignmentsStruct = {
      id,
      label: assignment.label,
      description,
      modules,
      filteredModules,
      filteredModulesByPending,
      duration_in_days: assignment?.duration_in_days || null,
      teacherInstructions: assignment.teacher_instructions,
      extendedInstructions: assignment.extended_instructions,
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

    const emptyModulesFiltered = assignmentsRecopilated.filter(
      (l) => l.modules.length > 0,
    );
    return setSortedAssignments(emptyModulesFiltered);
  });
};
