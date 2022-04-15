const isWindow = typeof window !== 'undefined';

const getCohort = isWindow && JSON.parse(localStorage.getItem('cohortSession') || '{}');
const { selectedProgramSlug } = getCohort;

// const syllabus = process.env.SYLLABUS;
// const syllabusArray = syllabus?.split(',');

const navbarTR = {
  en: {
    loginTR: 'Login',
    logoutTR: 'Logout',
    languageTR: 'Language',
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
        asPath: '/read', // For colorLink
        subMenu: [],
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
    languagesTR: [
      {
        label: 'English',
        value: 'en',
      },
      {
        label: 'Spanish',
        value: 'es',
      },
    ],
  },

  es: {
    loginTR: 'Ingresar',
    logoutTR: 'Cerrar sesión',
    languageTR: 'Idioma',
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
        asPath: '/read', // For colorLink
        subMenu: [],
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
    languagesTR: [
      {
        label: 'Inglés',
        value: 'en',
      },
      {
        label: 'Español',
        value: 'es',
      },
    ],
  },
};
export default navbarTR;
