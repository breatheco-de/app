import { differenceInDays } from 'date-fns';
import { error } from './logging';
/**
 * @typedef {Object} RelatedAssignments
 * @property {Array} filteredContent - Content for Module filtered by associated_slug in taskTodo
 * @property {Array} content - Content for Module without filter
 * @property {Array} filteredContentByPending - Content for Module filtered by task_status "PENDING"
 */
/**
 * @param {Object} syllabusData Syllabus of the cohort
 * @param {Array} taskTodo Tasks of the user in the cohort
 * @returns {Object<RelatedAssignments>} Returns cohort modules to learn
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
