import { formatDuration, intervalToDuration } from 'date-fns';
import { es, en } from 'date-fns/locale';
import useTranslation from 'next-translate/useTranslation';
import bc from '../services/breathecode';

const availableLanguages = {
  es,
  en,
};

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
  getStudents: (slug, academyId) => new Promise((resolve, reject) => {
    bc.cohort().getStudents(slug, academyId)
      .then(({ data }) => {
        const activeStudents = data.filter((l) => l.educational_status === 'ACTIVE' && l.role === 'STUDENT');
        const sortedStudents = activeStudents.sort(
          (a, b) => a.user.first_name.localeCompare(b.user.first_name),
        );
        resolve(sortedStudents);
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
    const attendanceIds = students.reduce(
      (accumulator, { user }) => {
        const attended = checked.some((id) => parseInt(id, 10) === user.id);
        if (attended) {
          accumulator.attended.push(user.id);
        } else {
          accumulator.unattended.push(user.id);
        }
        return accumulator;
      }, { attended: [], unattended: [] },
    );

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
    const duration = intervalToDuration({
      end: new Date(),
      start,
    });
    const formated = formatDuration(duration,
      {
        format: ['months', 'weeks', 'days', 'hours', 'minutes'],
        delimiter: ', ',
        locale: availableLanguages[lang],
      });

    if (formated === '') return t('few-seconds');
    return {
      formated,
      duration,
    };
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
};

export default handlers;

// bc.cohort().getAttendance(cohortSession.slug)
// .then((res) => {
//   const currentDayExists = typeof res.data[day] === 'object';
//   const attendanceLog = currentDayExists ? students.filter(
//     (student) => res.data[day].attendance_ids.find((userId) => userId === student.user.id),
//   ) : [];
//   const unattendanceLog = currentDayExists ? students.filter(
//     (student) => res.data[day].unattendance_ids.find((userId) => userId === student.user.id),
//   ) : [];

//   const currentLog = [...attendanceLog, ...unattendanceLog];

//   setAttendanceTaken({
//     updated_at: currentDayExists ? res.data[day].updated_at : null,
//     attendanceStudents: attendanceLog,
//     unattendanceStudents: unattendanceLog,
//     current_module: currentDayExists ? res.data[day].current_module : null,
//     teacher_comments: currentDayExists ? res.data[day].teacher_comments : null,
//     day,
//   });

//   if (currentLog.length === 0) {
//     setCohortSession({ ...cohortSession, ...data });
//     saveCohortAttendancy();
//   } else {
//     setAttendanceWasTaken(true);
//     toast({
//       title: t('alert-message:attenadance-already-taken', { count: day }),
//       // title: `Attendance for day ${day} has already been taken`,
//       status: 'warning',
//       duration: 9000,
//       isClosable: true,
//     });
//   }
// })
// .catch((error) => {
//   toast({
//     title: t('alert-message:error-getting-previous-attendance'),
//     status: 'error',
//     duration: 9000,
//     isClosable: true,
//   });
//   console.error('getAttendance_error:', error);
// })
// .finally(() => {
//   setOpenWarn(false);
//   setIsLoading(false);
// });
