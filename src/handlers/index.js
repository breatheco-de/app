import { formatDuration, intervalToDuration } from 'date-fns';
import { es } from 'date-fns/locale';
import useTranslation from 'next-translate/useTranslation';
import { isValidDate, toCapitalize } from '../utils';
import bc from '../services/breathecode';

const availableLanguages = {
  es,
};

const taskIcons = {
  EXERCISE: 'strength',
  LESSON: 'book',
  PROJECT: 'code',
  QUIZ: 'answer',
};

const getCompletedTasksFromModule = (module, taskTodo) => (module?.length > 0 ? module.filter(
  (assignment) => taskTodo.some((task) => {
    if (task?.task_status === 'DONE') {
      return task?.associated_slug === assignment?.slug;
    }
    return false;
  }),
) : []);

const handlers = {
  getActivities: (cohortSlug, academyId = 4) => new Promise((resolve, reject) => {
    bc.cohort({ academy: academyId }).getAttendance(cohortSlug)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  }),
  getStudents: (slug, academyId, params = {}) => new Promise((resolve, reject) => {
    bc.cohort(params).getStudents(slug, academyId)
      .then(({ data }) => {
        const sortedStudents = data.sort(
          (a, b) => a.user.first_name.localeCompare(b.user.first_name),
        );
        resolve(sortedStudents);
      }).catch((err) => {
        reject(err);
      });
  }),
  getStudentsWithTasks: (slug, academyId) => new Promise((resolve, reject) => {
    bc.cohort().getStudentsWithTasks(slug, academyId)
      .then(({ data }) => {
        resolve(data);
      }).catch((err) => {
        reject(err);
      });
  }),

  getAttendanceList: ({ cohortSlug }) => new Promise((resolve, reject) => {
    bc.cohort().getAttendance(cohortSlug)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  }),

  getAttendance: ({ attendanceList, students, day }) => new Promise((resolve) => {
    const currentDayExists = typeof attendanceList[day] === 'object';
    const attendanceLog = currentDayExists ? students.filter(
      (student) => attendanceList[day].attendance_ids.find((userId) => userId === student.user.id),
    ) : [];
    const unattendanceLog = currentDayExists ? students.filter(
      (student) => attendanceList[day].unattendance_ids.find((userId) => userId === student.user.id),
    ) : [];

    resolve({
      updated_at: currentDayExists ? attendanceList[day].updated_at : null,
      attendanceStudents: attendanceLog,
      unattendanceStudents: unattendanceLog,
      current_module: currentDayExists ? attendanceList[day].current_module : null,
      teacher_comments: currentDayExists ? attendanceList[day].teacher_comments : null,
      day,
    });
  }),

  saveCohortAttendancy: ({ cohortSlug, students, checked, currentModule }) => new Promise((resolve, reject) => {
    const attendanceIds = students.reduce((accumulator, { user }) => {
      const attended = checked.some((id) => parseInt(id, 10) === user.id);
      if (attended) {
        accumulator.attended.push(user.id);
      } else {
        accumulator.unattended.push(user.id);
      }
      return accumulator;
    }, { attended: [], unattended: [] });

    const dataStruct = {
      current_module: currentModule,
      teacher_comments: '',
      attendance_ids: attendanceIds.attended,
      unattendance_ids: attendanceIds.unattended,
    };

    bc.cohort().takeAttendance(
      cohortSlug,
      dataStruct,
    )
      .then(({ data }) => {
        resolve(data);
      })
      .catch(() => {
        reject();
      });
  }),

  formatTimeString: (start) => {
    const { t, lang } = useTranslation('live-event');
    const validDate = isValidDate(start);

    const status = new Date(start) < new Date() ? 'expired' : 'active';

    if (validDate) {
      const duration = intervalToDuration({
        end: new Date(),
        start: new Date(start),
      });
      const formated = formatDuration(
        duration,
        {
          format: ['months', 'weeks', 'days', 'hours', 'minutes'],
          delimiter: ', ',
          locale: availableLanguages[lang] || lang,
        },
      );

      if (formated === '') return t('few-seconds');
      return {
        status,
        formated,
        duration,
      };
    }
    return null;
  },
  checkIfExpired: ({ date, year = 'numeric', month = 'long', day = 'numeric', hour, minute }) => {
    const { lang } = useTranslation('live-event');
    const localeLang = {
      es: 'es-ES',
      en: 'en-US',
    };

    const now = new Date();
    const expirationDate = new Date(date);
    const value = now > expirationDate;
    //                                                    'numeric' 'long' 'numeric' 'numeric' 'numeric'
    const formatedDate = expirationDate.toLocaleDateString(localeLang[lang], { year, month, day, hour, minute });
    return {
      value,
      date: formatedDate,
    };
  },
  getCohortsFinished: (cohorts) => cohorts.filter((cohort) => {
    const educationalStatus = cohort.cohort_user.educational_status?.toUpperCase();
    const programCohortStage = cohort.stage?.toUpperCase();

    const hasEnded = ['ENDED'].includes(programCohortStage);
    const isGraduated = educationalStatus === 'GRADUATED';

    const showStudent = ['GRADUATED', 'POSTPONED', 'ACTIVE'].includes(educationalStatus);
    const isNotHiddenOnPrework = programCohortStage === 'PREWORK'
      && cohort.is_hidden_on_prework === false
      && hasEnded;

    return (isGraduated || hasEnded || isNotHiddenOnPrework) && showStudent;
  }),
  getActiveCohorts: (cohorts) => cohorts.filter((cohort) => {
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

    const cohortIsAvailable = showCohort && !hasEnded;
    const isNotHiddenOnPrework = programCohortStage === 'PREWORK'
      && cohort.is_hidden_on_prework === false
      && !hasEnded;

    const showStudent = ['ACTIVE', 'NOT_COMPLETING'].includes(educationalStatus) && programRole === 'STUDENT';

    const show = !isGraduated && (cohortIsAvailable || isNotHiddenOnPrework) && (visibleForTeacher || showStudent);

    return show;
  }),

  getAssignmentsCount: ({
    data, taskTodo,
  }) => {
    const modules = data?.json?.days || data?.json?.modules || data;
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

        const replitsCompleted = getCompletedTasksFromModule(replits, taskTodo);
        const lessonsCompleted = getCompletedTasksFromModule(lessons, taskTodo);
        const assignmentsCompleted = getCompletedTasksFromModule(assignments, taskTodo);
        const quizzesCompleted = getCompletedTasksFromModule(quizzes, taskTodo);
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
  },

};

export default handlers;
