module.exports = {
  pages: {
    // Enable translations for the following pages
    '*': ['common', 'navbar', 'footer', 'alert-message', 'share', 'live-event', 'program-card', 'final-project'],
    '/': ['home', 'social'],
    '/login': ['login'],
    '/example': ['counter'],
    '/cohort/[cohortSlug]/[slug]/[version]': ['dashboard', 'projects'],
    '/cohort/[cohortSlug]/assignments': ['assignments'],
    '/cohort/[cohortSlug]/attendance': ['attendance'],
    '/interactive-exercises': ['exercises'],
    '/interactive-exercises/technology/[technology]': ['exercises'],
    '/technology/[slug]': ['technologies'],
    '/read/[slug]': ['read'],
    '/lesson/[slug]': ['lesson'],
    '/lessons': ['lesson'],
    '/lessons/technology/[technology]': ['lesson'],
    '/project/[slug]': ['projects'],
    '/signup': ['signup'],
    '/interactive-coding-tutorial/[difficulty]/[slug]': ['projects'],
    '/interactive-coding-tutorials': ['projects'],
    '/interactive-coding-tutorials/technology/[technology]': ['projects'],
    '/interactive-exercise/[slug]': ['exercises'],
    '/choose-program': ['choose-program', 'profile'],
    '/syllabus/[cohortSlug]/[lesson]/[lessonSlug]': ['syllabus', 'dashboard', 'projects'],
    '/survey/[surveyId]': ['survey'],
    '/mentorship': ['mentorship'],
    '/how-to': ['how-to'],
    '/how-to/[slug]': ['how-to'],
    '/how-to/technology/[technology]': ['how-to'],
    '/profile': ['profile'],
    '/profile/[slug]': ['profile'],
    '/thank-you': ['thank-you'],
    '/about-us': ['about-us'],
  },
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localeDetection: false,

  // locales: ['default', 'en', 'es'],
  // // defaultLocale: 'en', // removed for redirects handling purposes
  // defaultLocale: 'default',
  // localeDetection: false, // run and detects in home page = '/'

  // return a Promise with the JSON file.

  loadLocaleFrom: (lang, ns) => import(`./public/locales/${lang}/${ns}.json`).then((m) => m.default),

  // loadLocaleFrom: (lang, ns) => {
  //   if (lang === 'default') return '';
  //   return import(`./public/locales/${lang}/${ns}.json`).then((m) => m.default);
  // },
};
