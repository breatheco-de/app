const isWindow = typeof window !== 'undefined';
const cohortSession = isWindow ? JSON.parse(localStorage.getItem('cohortSession') || '{}') : {};
const accessToken = isWindow ? localStorage.getItem('accessToken') : '';

const slug = cohortSession && cohortSession.academy?.slug;

const dashboardTR = {
  en: {
    title: 'Your News',
    backToChooseProgram: 'Back to choose program',
    progressText: 'progress in the program',
    callToAction: {
      title: 'Today\'s lessons!',
      description: 'Your lesson today is ',
      button: 'Start today\'s module',
    },
    cohortSideBar: {
      title: 'About your cohort',
      cohort: 'Cohort',
      mainTeacher: 'Main teacher',
      assistant: 'Assistant Professors',
      classmates: 'Your classmates',
    },
    supportSideBar: {
      title: 'Don\'t Get Stuck',
      description: 'Did you know you can schedule mentoring sessions any time or ask in the Support Chat?',
      actionButtons: [
        {
          name: 'mentoring',
          title: 'Schedule mentoring',
          href: `https://mentor.breatheco.de/academy/${slug}/?token=${accessToken}`,
          icon: 'conversation',
        },
        {
          name: 'support',
          title: 'Ask in support chat',
          href: 'https://4geeksacademy.slack.com/',
          icon: 'slack',
        },
      ],
    },
  },

  es: {
    title: 'Tus noticias',
    backToChooseProgram: 'Volver a elegir programa',
    progressText: 'progreso en el programa',
    callToAction: {
      title: 'Clase de hoy!',
      description: 'Tu clase de hoy es ',
      buttonText: 'Comenzar el módulo de hoy',
    },
    cohortSideBar: {
      title: 'Acerca de tu cohorte',
      cohort: 'Cohorte',
      mainTeacher: 'Profesor principal',
      assistant: 'Profesores asistentes',
      classmates: 'Tus compañeros',
    },
    supportSideBar: {
      title: 'No te quedes atascado',
      description: '¿Sabías que puedes programar sesiones de mentoría en cualquier momento o preguntar en el Chat de soporte?',
      actionButtons: [
        {
          name: 'mentoring',
          title: 'Programar sesion de mentoría',
          href: `https://mentor.breatheco.de/academy/${slug}/?token=${accessToken}`,
          icon: 'conversation',
        },
        {
          name: 'support',
          title: 'Preguntar en el chat de soporte',
          href: 'https://4geeksacademy.slack.com/',
          icon: 'slack',
        },
      ],
    },
  },
};
export default dashboardTR;
