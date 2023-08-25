import { formatDuration, intervalToDuration } from 'date-fns';
import { es } from 'date-fns/locale';
import useTranslation from 'next-translate/useTranslation';
import { isValidDate, toCapitalize } from '../../utils';
import bc from '../services/breathecode';

const availableLanguages = {
  es,
};

const taskIcons = {
  EXERCISE: 'assignment',
  LESSON: 'book',
  PROJECT: 'code',
  QUIZ: 'answer',
};

const handlers = {
  getSyllabus: (academyId, slug, version) => new Promise((resolve, reject) => {
    bc.syllabus().get(academyId, slug, version)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  }),
  getActivities: (cohortSlug, academyId = 4) => new Promise((resolve, reject) => {
    bc.cohort({ academy: academyId }).getAttendance(cohortSlug)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  }),
  getStudents: (slug, academyId) => new Promise((resolve, reject) => {
    bc.cohort().getStudents(slug, academyId)
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
  getCohortsFinished: (cohorts) => cohorts.filter((program) => {
    const educationalStatus = program?.educational_status?.toUpperCase();
    const programCohortStage = program?.cohort?.stage?.toUpperCase();

    const hasEnded = ['ENDED'].includes(programCohortStage);
    const isGraduated = educationalStatus === 'GRADUATED';

    const showStudent = ['GRADUATED', 'POSTPONED', 'ACTIVE'].includes(educationalStatus);
    const isNotHiddenOnPrework = programCohortStage === 'PREWORK'
      && program?.cohort?.is_hidden_on_prework === false
      && hasEnded;

    return (isGraduated || hasEnded || isNotHiddenOnPrework) && showStudent;
  }),
  getActiveCohorts: (cohorts) => cohorts.filter((program) => {
    const educationalStatus = program?.educational_status?.toUpperCase();
    const programRole = program?.role?.toUpperCase();
    const programCohortStage = program?.cohort?.stage?.toUpperCase();
    const isGraduated = educationalStatus === 'GRADUATED';

    const visibleForTeacher = programRole !== 'STUDENT';

    const hasEnded = [
      'ENDED',
    ].includes(programCohortStage);
    const showCohort = [
      'STARTED',
      'ACTIVE',
      'FINAL_PROJECT',
    ].includes(programCohortStage);

    const cohortIsAvailable = showCohort && !hasEnded;
    const isNotHiddenOnPrework = programCohortStage === 'PREWORK'
      && program?.cohort?.is_hidden_on_prework === false
      && !hasEnded;

    const showStudent = ['ACTIVE'].includes(educationalStatus) && programRole === 'STUDENT';

    const show = !isGraduated && (cohortIsAvailable || isNotHiddenOnPrework) && (visibleForTeacher || showStudent);

    return show;
  }),
  handleTasks: (tasks, onlyExistent = false) => {
    const allLessons = tasks.filter((l) => l.task_type === 'LESSON');
    const allExercises = tasks.filter((e) => e.task_type === 'EXERCISE');
    const allProjects = tasks.filter((p) => p.task_type === 'PROJECT');
    const allQuiz = tasks.filter((q) => q.task_type === 'QUIZ');

    const allTasks = [
      {
        title: 'Lesson',
        icon: 'book',
        task_type: 'LESSON',
        taskLength: allLessons.length,
        completed: allLessons.filter((l) => l.task_status === 'DONE').length,
      },
      {
        title: 'Exercise',
        icon: 'strength',
        task_type: 'EXERCISE',
        taskLength: allExercises.length,
        completed: allExercises.filter((e) => e.task_status === 'DONE').length,
      },
      {
        title: 'Project',
        icon: 'code',
        task_type: 'PROJECT',
        taskLength: allProjects.length,
        completed: allProjects.filter((p) => p.task_status === 'DONE').length,
      },
      {
        title: 'Quiz',
        icon: 'answer',
        task_type: 'QUIZ',
        taskLength: allQuiz.length,
        completed: allQuiz.filter((q) => q.task_status === 'DONE').length,
      },
    ];

    const allExistentTasks = onlyExistent ? allTasks.filter((t) => t.taskLength > 0) : allTasks;

    const calculateTaskPercentage = () => {
      let sumTaskCompleted = 0;
      let sumTaskLength = 0;
      for (let i = 0; i < allExistentTasks.length; i += 1) {
        sumTaskCompleted += allExistentTasks[i].completed;
        sumTaskLength += allExistentTasks[i].taskLength;
      }
      return Math.trunc((sumTaskCompleted / sumTaskLength) * 100);
    };
    const percentage = calculateTaskPercentage() || 0;
    return {
      allTasks: allExistentTasks,
      percentage,
    };
  },

  getAssignmentsCount: ({
    cohortProgram,
  }) => new Promise((resolve) => {
    const modules = cohortProgram?.json?.days || cohortProgram?.json?.modules;
    const assignmentsRecopilated = [];

    modules?.forEach((module) => {
      const {
        assignments = [],
        lessons = [],
        project = [],
        quizzes = [],
      } = module;

      const assignmentsCount = assignments.length;
      const lessonsCount = lessons.length;
      const projectCount = project.title ? 1 : (project?.length || 0);
      const quizzesCount = quizzes.length;

      const assignmentsRecopilatedObj = {
        assignmentsCount,
        lessonsCount,
        projectCount,
        quizzesCount,
      };

      assignmentsRecopilated.push(assignmentsRecopilatedObj);
    });

    const assignmentsRecopilatedObj = {
      exercise: 0,
      lesson: 0,
      project: 0,
      quiz: 0,
    };

    assignmentsRecopilated.forEach((assignment) => {
      assignmentsRecopilatedObj.exercise += assignment.assignmentsCount;
      assignmentsRecopilatedObj.lesson += assignment.lessonsCount;
      assignmentsRecopilatedObj.project += assignment.projectCount;
      assignmentsRecopilatedObj.quiz += assignment.quizzesCount;
    });

    const arrayOfObjects = Object.keys(assignmentsRecopilatedObj).map((key) => {
      const taskLength = assignmentsRecopilatedObj[key];
      const taskType = key.toUpperCase();
      const icon = taskIcons[taskType];

      return {
        icon,
        taskLength,
        task_type: taskType,
        title: toCapitalize(taskType),
      };
    });

    resolve({ allTasks: arrayOfObjects });

    // resolve(assignmentsRecopilatedObj);
  }),
  getAssetData: (slug) => new Promise((resolve, reject) => {
    bc.lesson().getAsset(slug)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  }),

};

export default handlers;
