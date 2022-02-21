const isWindow = typeof window !== 'undefined';

const getCohort = isWindow && JSON.parse(localStorage.getItem('cohortSession') || '{}');
const { selectedProgramSlug } = getCohort;

const navbarTR = {
  en: {
    loginText: 'Login',
    ITEMS: [
      {
        label: 'Dashboard',
        private: true,
        href: selectedProgramSlug || '/choose-program',
      },
      {
        label: 'About us',
        href: '/about-us',
      },
      {
        label: 'Practice',
        href: '/interactive-exercises',
      },
      {
        label: 'Read',
        icon: 'book',
        description: 'Lorem ipsum dolor sit amet, consectetur adscing elit, sed do eiusmod tempor incidi.',
        asPath: '/lessons', // For colorLink
        subMenu: [
          {
            label: 'Full Stack Developer',
            // subLabel: 'some description',
            href: '/lessons?child=1',
          },
          {
            label: 'Software Engineer',
            // subLabel: 'some description',
            href: '/lessons?child=2',
          },
          {
            label: 'AI Machine Learning',
            // subLabel: 'some description',
            href: '/lessons?child=3',
          },
        ],
      },
      {
        label: 'Build',
        href: '/projects',
      },
      {
        label: 'Coding Bootcamp',
        href: 'https://4geeksacademy.com',
      },
    ],
    // INTERNAL_ITEMS: [
    //   {
    //     label: 'Dashboard',
    //     href: selectedProgramSlug || '/choose-program',
    //   },
    // ],
  },

  es: {
    loginText: 'Ingresar',
    ITEMS: [
      {
        label: 'Dashboard',
        private: true,
        href: selectedProgramSlug || '/choose-program',
      },
      {
        label: 'Sobre Nosotros',
        href: '/about-us',
      },
      {
        label: 'Practicar',
        href: '/interactive-exercises',
      },
      {
        label: 'Leer',
        icon: 'book',
        description: 'Lorem ipsum dolor sit amet, consectetur adscing elit, sed do eiusmod tempor incidi.',
        asPath: '/lessons', // For colorLink
        subMenu: [
          {
            label: 'Full Stack Developer',
            // subLabel: 'Descripción corta',
            href: '/lessons?child=1',
          },
          {
            label: 'Software Engineer',
            // subLabel: 'Descripción corta',
            href: '/lessons?child=2',
          },
          {
            label: 'AI Machine Learning',
            // subLabel: 'Descripción corta',
            href: '/lessons?child=3',
          },
        ],
      },
      {
        label: 'Desarrollar',
        href: '/projects',
      },
      {
        label: 'Bootcamp de Codificación',
        href: 'https://4geeksacademy.com',
      },
    ],
    // INTERNAL_ITEMS: [
    //   {
    //     label: 'Dashboard',
    //     href: selectedProgramSlug || '/choose-program',
    //   },
    // ],
  },
};
export default navbarTR;
