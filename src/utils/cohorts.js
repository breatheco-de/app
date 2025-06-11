import { differenceInDays } from 'date-fns';
import { toCapitalize } from './index';
import { error } from './logging';

const taskIcons = {
  EXERCISE: 'strength',
  LESSON: 'book',
  PROJECT: 'code',
  QUIZ: 'answer',
};

const getCompletedTasksFromModule = (module, tasks) => (module?.length > 0 ? module.filter(
  (assignment) => tasks.some((task) => {
    if (task?.task_status === 'DONE') {
      return task?.associated_slug === assignment?.slug;
    }
    return false;
  }),
) : []);

/**
 * @typedef {Object} RelatedAssignments
 * @property {Array} filteredContent - Content for Module filtered by associated_slug in the tasks
 * @property {Array} content - Content for Module without filter
 * @property {Array} filteredContentByPending - Content for Module filtered by task_status "PENDING"
 */
/**
 * @param {Object} syllabusData Syllabus of the cohort
 * @param {Array} tasks Tasks of the user in the cohort
 * @returns {Object<RelatedAssignments>} Returns cohort modules to learn
 */
export const processRelatedAssignments = (syllabusData = {}, tasks = []) => {
  const id = syllabusData?.id || '';
  const label = syllabusData?.name || '';
  const read = syllabusData?.lessons || [];
  const practice = syllabusData?.replits || [];
  const project = syllabusData?.assignments || [];
  const answer = syllabusData?.quizzes || [];

  try {
    const getTask = (slug) => tasks.find(
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

    const includesDailyTask = (module) => tasks.some((task) => task.associated_slug === module.slug);

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

export const getCohortsFinished = (cohorts) => cohorts.filter((cohort) => {
  const educationalStatus = cohort.cohort_user.educational_status?.toUpperCase();
  const programCohortStage = cohort.stage?.toUpperCase();

  const hasEnded = ['ENDED'].includes(programCohortStage);
  const isGraduated = educationalStatus === 'GRADUATED';

  const showStudent = ['GRADUATED', 'POSTPONED', 'ACTIVE'].includes(educationalStatus);
  const isNotHiddenOnPrework = programCohortStage === 'PREWORK'
    && cohort.is_hidden_on_prework === false
    && hasEnded;

  return (isGraduated || hasEnded || isNotHiddenOnPrework) && showStudent;
});

export const getAttendance = ({ attendanceList, students, day }) => {
  const currentDayExists = typeof attendanceList[day] === 'object';
  const attendanceLog = currentDayExists ? students.filter(
    (student) => attendanceList[day].attendance_ids.find((userId) => userId === student.user.id),
  ) : [];
  const unattendanceLog = currentDayExists ? students.filter(
    (student) => attendanceList[day].unattendance_ids.find((userId) => userId === student.user.id),
  ) : [];

  return {
    updated_at: currentDayExists ? attendanceList[day].updated_at : null,
    attendanceStudents: attendanceLog,
    unattendanceStudents: unattendanceLog,
    current_module: currentDayExists ? attendanceList[day].current_module : null,
    teacher_comments: currentDayExists ? attendanceList[day].teacher_comments : null,
    day,
  };
};

export const getActiveCohorts = (cohorts) => cohorts.filter((cohort) => {
  const educationalStatus = cohort.cohort_user.educational_status?.toUpperCase();
  const programRole = cohort.cohort_user.role?.toUpperCase();
  const programCohortStage = cohort.stage.toUpperCase();
  const isGraduated = educationalStatus === 'GRADUATED';

  const visibleForTeacher = programRole !== 'STUDENT';

  const hasEnded = [
    'ENDED',
  ].includes(programCohortStage);
  const showCohort = [
    'STARTED',
    'ACTIVE',
    'FINAL_PROJECT',
    'NOT_COMPLETING',
  ].includes(programCohortStage);

  const cohortIsAvailable = (showCohort && !hasEnded) || educationalStatus === 'NOT_COMPLETING';
  const isNotHiddenOnPrework = programCohortStage === 'PREWORK'
    && cohort.is_hidden_on_prework === false
    && !hasEnded;

  const showStudent = ['ACTIVE', 'NOT_COMPLETING'].includes(educationalStatus) && programRole === 'STUDENT';

  const show = !isGraduated && (cohortIsAvailable || isNotHiddenOnPrework) && (visibleForTeacher || showStudent);

  return show;
});

export const getAssignmentsCount = ({
  syllabus, tasks,
}) => {
  const modules = syllabus?.json?.days || syllabus?.json?.modules || syllabus;
  const modulesAssignments = [];
  const assetsCompleted = {
    exercise: [],
    lesson: [],
    project: [],
    quiz: [],
  };

  if (Array.isArray(modules)) {
    modules.forEach((module) => {
      const {
        assignments = [],
        lessons = [],
        replits = [],
        quizzes = [],
      } = module;

      const projectCount = assignments.length;
      const lessonsCount = lessons.length;
      const quizzesCount = quizzes.length;
      const exercisesCount = replits.length;

      const assignmentsCount = {
        exercisesCount,
        lessonsCount,
        projectCount,
        quizzesCount,
      };

      modulesAssignments.push(assignmentsCount);

      const replitsCompleted = getCompletedTasksFromModule(replits, tasks);
      const lessonsCompleted = getCompletedTasksFromModule(lessons, tasks);
      const assignmentsCompleted = getCompletedTasksFromModule(assignments, tasks);
      const quizzesCompleted = getCompletedTasksFromModule(quizzes, tasks);
      assetsCompleted.exercise.push(...replitsCompleted);
      assetsCompleted.lesson.push(...lessonsCompleted);
      assetsCompleted.project.push(...assignmentsCompleted);
      assetsCompleted.quiz.push(...quizzesCompleted);
    });
  }

  const assignmentsCount = {
    exercise: 0,
    lesson: 0,
    project: 0,
    quiz: 0,
  };

  modulesAssignments.forEach((module) => {
    assignmentsCount.exercise += module.exercisesCount;
    assignmentsCount.lesson += module.lessonsCount;
    assignmentsCount.project += module.projectCount;
    assignmentsCount.quiz += module.quizzesCount;
  });

  const assignmentsProgress = Object.keys(assignmentsCount).map((key) => {
    const total = assignmentsCount[key];
    const tasksCompleted = assetsCompleted[key];
    const taskType = key.toUpperCase();
    const completed = tasksCompleted?.length;
    const icon = taskIcons[taskType];

    return {
      icon,
      total,
      completed,
      taskType,
      title: toCapitalize(taskType),
    };
  });
  const totalCompletedTasks = assignmentsProgress.reduce((acc, task) => acc + task.completed, 0);
  const totalTasks = assignmentsProgress.reduce((acc, task) => acc + task.total, 0);
  const completedTasksPercentage = Math.trunc((totalCompletedTasks / totalTasks) * 100) || 0;
  const percentageLimited = completedTasksPercentage > 100 ? 100 : completedTasksPercentage;

  return {
    assignmentsProgress,
    percentage: percentageLimited,
  };
};
