import { differenceInDays } from 'date-fns';
import bc from '../services/breathecode';
import { error } from '../../utils/logging';

/**
 * @param {Number | String} id Required id of the cohort
 * @returns {Promise<object>} Returns a cohort found
 */
export const getCohort = (id) => bc.admissions({ id }).cohorts()
  .then((resp) => {
    const cohortFinded = resp.data.find((cohort) => cohort?.id === id);
    return cohortFinded;
  });

/**
 *  Generate Syllabus data using the id of the cohort
 *
 * @param {Number | String} id Required id of the cohort
 * @returns {Promise<object>} Returns a cohort found
 */
export const getCohortSyllabus = (id) => getCohort(id)
  .then(async (cohortData) => {
    const syllabusSlug = cohortData?.syllabus_version?.slug;
    const syllabusVersion = cohortData?.syllabus_version?.version;

    try {
      const resp = await bc.admissions().publicSyllabus(syllabusSlug, syllabusVersion);
      const data = await resp.json();
      return {
        syllabus: data,
        cohort: cohortData || {},
      };
    } catch (reqErr) {
      error('getCohortSyllabus:', reqErr);
      return {};
    }
  });

/**
 * @typedef {Object} RelatedAssignments
 * @property {Array} filteredContent - Content for Module filtered by associated_slug in taskTodo
 * @property {Array} content - Content for Module without filter
 * @property {Array} filteredContentByPending - Content for Module filtered by task_status "PENDING"
 */
/**
 * @param {Object} syllabusData Syllabus of the cohort
 * @param {Array} taskTodo Tasks of the user in the cohort
 * @returns {Promise<RelatedAssignments>} Returns cohort modules to learn
 */
export const processRelatedAssignments = (syllabusData = {}, taskTodo = []) => {
  const id = syllabusData?.id || '';
  const label = syllabusData?.name || '';
  const read = syllabusData?.lessons || [];
  const practice = syllabusData?.replits || [];
  const project = syllabusData?.assignments || [];
  const answer = syllabusData?.quizzes || [];

  try {
    const getTask = (slug) => taskTodo.find(
      (task) => task?.associated_slug === slug,
    );
    const currentDate = new Date();

    const parsedLessons = read?.map((el) => {
      const task = getTask(el.slug);
      return ({
        ...el,
        id,
        label,
        task_status: task?.task_status || '',
        revision_status: task?.revision_status || '',
        created_at: task?.created_at || '',
        position: el?.position || 0,
        type: 'Read',
        icon: 'book',
        task_type: 'LESSON',
      });
    }).sort((a, b) => b.position - a.position);

    const parsedExercises = practice?.map((el) => {
      const task = getTask(el.slug);
      return ({
        ...el,
        id,
        label,
        task_status: task?.task_status || '',
        revision_status: task?.revision_status || '',
        created_at: task?.created_at || '',
        position: el?.position || 0,
        type: 'Practice',
        icon: 'strength',
        task_type: 'EXERCISE',
      });
    }).sort((a, b) => b.position - a.position);

    const parsedProjects = project?.map((el) => {
      const task = getTask(el?.slug?.slug || el?.slug);

      return ({
        ...el,
        id,
        label,
        slug: el?.slug?.slug || el?.slug,
        task_status: task?.task_status || '',
        revision_status: task?.revision_status || '',
        created_at: task?.created_at || '',
        daysDiff: task?.created_at ? differenceInDays(currentDate, new Date(task.created_at)) : '',
        position: el?.position || 0,
        mandatory: el?.mandatory || false,
        read_at: task?.read_at,
        reviewed_at: task?.reviewed_at,
        type: 'Project',
        icon: 'code',
        task_type: 'PROJECT',
      });
    }).sort((a, b) => b.position - a.position);

    const parsedQuizzes = answer?.map((el) => {
      const task = getTask(el?.slug);
      return ({
        ...el,
        id,
        label,
        task_status: task?.task_status || '',
        revision_status: task?.revision_status || '',
        created_at: task?.created_at || '',
        position: el?.position || 0,
        type: 'Answer',
        icon: 'answer',
        task_type: 'QUIZ',
      });
    }).sort((a, b) => b.position - a.position);

    const content = [...parsedLessons, ...parsedExercises, ...parsedProjects, ...parsedQuizzes];

    const includesDailyTask = (module) => taskTodo.some((task) => task.associated_slug === module.slug);

    const includesStatusPending = (module) => module.task_status === 'PENDING' && module.revision_status !== 'APPROVED';

    const filteredContent = content.filter(includesDailyTask);
    const filteredContentByPending = content.filter(includesStatusPending);

    return {
      filteredContent,
      content,
      filteredContentByPending,
    };
  } catch (reqErr) {
    error('processRelatedAssignments:', reqErr);
    return {
      filteredContent: [],
      content: [],
      filteredContentByPending: [],
    };
  }
};

/**
 * @typedef {object} CohortAndSyllabusObj
 * @property {object} syllabus - Syllabus of the cohort
 * @property {object} cohort - Cohort data
 */
/**
 * @param {Number} id Cohort ID
 * @returns {Promise<CohortAndSyllabusObj>} Return the syllabus and cohort data
 */
export const generateCohortSyllabusModules = async (id) => {
  try {
    const cohortAndSyllabus = await getCohortSyllabus(id);

    const syllabusData = cohortAndSyllabus?.syllabus;
    const cohortSyllabusList = syllabusData.json?.days || syllabusData.json?.modules;

    const newModulesStruct = cohortSyllabusList ? await Promise.all(cohortSyllabusList.map(async (module) => {
      const relatedAssignments = await processRelatedAssignments(module);

      const { content, filteredContent, filteredContentByPending } = relatedAssignments;
      return {
        id: module?.id,
        title: module?.label || '',
        description: module?.description || '',
        content,
        exists_activities: content?.length > 0,
        filteredContent,
        filteredContentByPending: content?.length > 0 ? filteredContentByPending : null,
        duration_in_days: module?.duration_in_days || null,
        teacherInstructions: module?.teacher_instructions || '',
        extendedInstructions: module.extended_instructions || '>:warning: No available instruction found for this module',
        keyConcepts: module['key-concepts'],
      };
    })) : [];

    return {
      syllabus: {
        ...syllabusData,
        modules: newModulesStruct,
      },
      cohort: cohortAndSyllabus?.cohort || {},
    };
  } catch (reqErr) {
    error('generateCohortSyllabusModules:', reqErr);
    return {};
  }
};

export const getTechonologies = (cohortDays) => {
  let technologyTags = [];

  for (let i = 0; i < cohortDays.length; i += 1) {
    if (typeof cohortDays[i].technologies === 'string') technologyTags.push(cohortDays[i].technologies);
    if (Array.isArray(cohortDays[i].technologies)) {
      technologyTags = technologyTags.concat(cohortDays[i].technologies);
    }
  }
  technologyTags = [...new Set(technologyTags)];

  return technologyTags;
};
