// const isWindow = typeof window !== 'undefined';
// const cohortSession = isWindow ? JSON.parse(localStorage.getItem('cohortSession') || '{}') : {};
// const accessToken = isWindow ? localStorage.getItem('accessToken') : '';

// const slug = cohortSession && cohortSession.academy?.slug;

const dashboardTR = {
  en: {
    supportSideBar: {
      title: 'Don\'t Get Stuck',
      description: 'Did you know you can schedule mentoring sessions any time or ask in the Support Chat?',
      actionButtons: [
        {
          name: 'mentoring',
          title: 'Schedule mentoring',
          href: '#',
          // href: `https://mentor.breatheco.de/academy/${slug}/?token=${accessToken}`,
          icon: 'conversation',
        },
        {
          name: 'support',
          title: 'Ask in support chat',
          href: 'https://4geeksacademy.slack.com/archives/CAZ9W99U4',
          icon: 'slack',
        },
      ],
    },
  },

  es: {
    supportSideBar: {
      title: 'No te quedes atascado',
      description: '¿Sabías que puedes programar sesiones de asesoramiento en cualquier momento o preguntar en el Chat de soporte?',
      actionButtons: [
        {
          name: 'mentoring',
          title: 'Programar sesión de asesoramiento',
          href: '#',
          // href: `https://mentor.breatheco.de/academy/${slug}/?token=${accessToken}`,
          icon: 'conversation',
        },
        {
          name: 'support',
          title: 'Preguntar en el chat de soporte',
          href: 'https://4geeksacademy.slack.com/archives/CAZ9W99U4',
          icon: 'slack',
        },
      ],
    },
  },
};
export default dashboardTR;
